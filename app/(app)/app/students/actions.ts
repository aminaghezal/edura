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
  });

  if (!parsed.success) {
    return { ok: false as const, error: "Données invalides" };
  }

  await prisma.student.create({
    data: {
      ...parsed.data,
      schoolId: session.schoolId, // ← multi-tenant scope
    },
  });

  revalidatePath("/app/students");
  return { ok: true as const };
}
