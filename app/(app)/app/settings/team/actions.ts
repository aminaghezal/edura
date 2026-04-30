"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession, requireRole } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

const inviteSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(120),
  role: z.enum(["DIRECTOR", "SECRETARY", "TEACHER"]),
  classIds: z.array(z.string()).optional(),
  subjectIds: z.array(z.string()).optional(),
});

function generateTempPassword(): string {
  // 12 chars, mixed — easy to read aloud once, hard to guess
  const part1 = Math.random().toString(36).slice(2, 6).toUpperCase();
  const part2 = Math.random().toString(36).slice(2, 6);
  const part3 = Math.floor(Math.random() * 90 + 10);
  return `${part1}-${part2}-${part3}`;
}

export async function inviteTeammate(formData: FormData) {
  const session = await requireSession();
  requireRole(session, "DIRECTOR");

  const classIdsRaw = formData.get("classIds");
  const classIds =
    typeof classIdsRaw === "string" && classIdsRaw
      ? classIdsRaw.split(",").filter(Boolean)
      : [];

  const subjectIdsRaw = formData.get("subjectIds");
  const subjectIds =
    typeof subjectIdsRaw === "string" && subjectIdsRaw
      ? subjectIdsRaw.split(",").filter(Boolean)
      : [];

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    role: formData.get("role"),
    classIds,
    subjectIds,
  });

  if (!parsed.success) {
    return { ok: false as const, error: "Données invalides" };
  }

  const tempPassword = generateTempPassword();

  // 1. Create Supabase auth user via admin API
  const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
    email: parsed.data.email,
    password: tempPassword,
    email_confirm: true,
  });

  if (authErr || !authData.user) {
    return {
      ok: false as const,
      error: authErr?.message ?? "Erreur Supabase",
    };
  }

  try {
    // 2. Create the User row
    const newUser = await prisma.user.create({
      data: {
        schoolId: session.schoolId,
        authId: authData.user.id,
        email: parsed.data.email,
        name: parsed.data.name,
        role: parsed.data.role,
      },
    });

    // 3. If TEACHER and classes provided, create assignments
    if (parsed.data.role === "TEACHER" && classIds.length > 0 && subjectIds.length > 0) {
      const assignments = classIds.flatMap((classId) =>
        subjectIds.map((subjectId) => ({
          teacherId: newUser.id,
          classId,
          subjectId,
        })),
      );
      await prisma.teacherAssignment.createMany({
        data: assignments,
        skipDuplicates: true,
      });
    }

    revalidatePath("/app/settings/team");

    return {
      ok: true as const,
      tempPassword,
      email: parsed.data.email,
    };
  } catch (err) {
    // Rollback the auth user if DB write failed
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id).catch(() => {});
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "Erreur DB",
    };
  }
}

export async function deactivateTeammate(userId: string) {
  const session = await requireSession();
  requireRole(session, "DIRECTOR");

  const user = await prisma.user.findFirst({
    where: { id: userId, schoolId: session.schoolId },
    select: { id: true, role: true },
  });
  if (!user) return { ok: false as const, error: "Utilisateur introuvable" };
  if (user.role === "DIRECTOR") {
    return { ok: false as const, error: "Impossible de désactiver un directeur" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });

  revalidatePath("/app/settings/team");
  return { ok: true as const };
}
