"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

const upsertGrade = z.object({
  studentId: z.string(),
  subjectId: z.string(),
  trimester: z.coerce.number().int().min(1).max(3),
  year: z.string(),
  value: z.coerce.number().min(0).max(20),
});

export async function saveGrade(formData: FormData) {
  const session = await requireSession();
  const parsed = upsertGrade.safeParse({
    studentId: formData.get("studentId"),
    subjectId: formData.get("subjectId"),
    trimester: formData.get("trimester"),
    year: formData.get("year"),
    value: formData.get("value"),
  });
  if (!parsed.success) return { ok: false as const, error: "Invalide" };

  // Verify student belongs to this school
  const student = await prisma.student.findFirst({
    where: { id: parsed.data.studentId, schoolId: session.schoolId },
    select: { id: true },
  });
  if (!student) return { ok: false as const, error: "Élève introuvable" };

  // Find existing grade for this student/subject/trimester
  const existing = await prisma.grade.findFirst({
    where: {
      studentId: parsed.data.studentId,
      subjectId: parsed.data.subjectId,
      trimester: parsed.data.trimester,
      year: parsed.data.year,
    },
    select: { id: true },
  });

  if (existing) {
    await prisma.grade.update({
      where: { id: existing.id },
      data: { value: parsed.data.value, enteredById: session.userId },
    });
  } else {
    await prisma.grade.create({
      data: { ...parsed.data, enteredById: session.userId },
    });
  }

  revalidatePath("/app/grades");
  return { ok: true as const };
}
