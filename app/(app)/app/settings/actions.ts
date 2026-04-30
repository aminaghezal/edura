"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession, requireRole } from "@/lib/auth";

const schoolSchema = z.object({
  name: z.string().min(2).max(200),
  wilaya: z.string().min(2),
  director: z.string().min(2),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
});

export async function updateSchool(formData: FormData) {
  const session = await requireSession();
  requireRole(session, "DIRECTOR");

  const parsed = schoolSchema.safeParse({
    name: formData.get("name"),
    wilaya: formData.get("wilaya"),
    director: formData.get("director"),
    address: formData.get("address") || null,
    phone: formData.get("phone") || null,
    email: formData.get("email") || null,
  });

  if (!parsed.success) return { ok: false as const, error: "Invalide" };

  await prisma.school.update({
    where: { id: session.schoolId },
    data: parsed.data,
  });

  revalidatePath("/app/settings");
  return { ok: true as const };
}
