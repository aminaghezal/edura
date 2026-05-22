"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

const createStudentSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  firstNameAr: z.string().max(80).optional().nullable(),
  lastNameAr: z.string().max(80).optional().nullable(),
  classId: z.string().optional().nullable(),
  parentName: z.string().max(160).optional().nullable(),
  parentPhone: z.string().max(40).optional().nullable(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format attendu : AAAA-MM-JJ")
    .optional()
    .nullable(),
});

export async function createStudent(formData: FormData) {
  const session = await requireSession();

  const parsed = createStudentSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    firstNameAr: formData.get("firstNameAr") || null,
    lastNameAr: formData.get("lastNameAr") || null,
    classId: formData.get("classId") || null,
    parentName: formData.get("parentName") || null,
    parentPhone: formData.get("parentPhone") || null,
    birthDate: formData.get("birthDate") || null,
  });

  if (!parsed.success) {
    return { ok: false as const, error: "Données invalides" };
  }

  const { birthDate, ...rest } = parsed.data;

  await prisma.student.create({
    data: {
      ...rest,
      birthDate: birthDate ? new Date(birthDate + "T00:00:00Z") : null,
      schoolId: session.schoolId, // ← multi-tenant scope
    },
  });

  revalidatePath("/app/students");
  return { ok: true as const };
}

// ── Update a single student's birthday (used by the inline editor in the list)
const birthdayInput = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Format attendu : AAAA-MM-JJ")
  .or(z.literal(""))
  .nullable();

export async function updateStudentBirthday(studentId: string, ymd: string | null) {
  const session = await requireSession();

  const parsed = birthdayInput.safeParse(ymd ?? "");
  if (!parsed.success) {
    return { ok: false as const, error: "Date invalide" };
  }

  // Safety: only allow updating students within this teacher's school
  const student = await prisma.student.findFirst({
    where: { id: studentId, schoolId: session.schoolId },
    select: { id: true },
  });
  if (!student) {
    return { ok: false as const, error: "Élève introuvable" };
  }

  await prisma.student.update({
    where: { id: studentId },
    data: {
      birthDate: ymd ? new Date(ymd + "T00:00:00Z") : null,
      updatedAt: new Date(),
    },
  });

  revalidatePath("/app/students");
  return { ok: true as const };
}
