"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

// ─── Update IQ + Learning Profile inputs ───────────────────────────

const MBTI_TYPES = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
] as const;

const iqSchema = z.object({
  studentId: z.string(),
  iqScore: z.coerce.number().int().min(40).max(200).optional().nullable(),
  iqTestName: z.string().max(80).optional().nullable(),
  iqTestDate: z.string().optional().nullable(), // ISO string from <input type="date">
  mbtiType: z.enum(MBTI_TYPES).optional().nullable(),
  mbtiTestDate: z.string().optional().nullable(),
  learningStyle: z
    .enum(["VISUAL", "AUDITORY", "KINESTHETIC", "READING_WRITING", "MIXED"])
    .optional()
    .nullable(),
  hobbies: z.string().max(500).optional().nullable(),
  interests: z.string().max(500).optional().nullable(),
});

export async function updateStudentProfile(formData: FormData) {
  const session = await requireSession();

  const raw = {
    studentId: formData.get("studentId"),
    iqScore: formData.get("iqScore") || null,
    iqTestName: formData.get("iqTestName") || null,
    iqTestDate: formData.get("iqTestDate") || null,
    mbtiType: formData.get("mbtiType") || null,
    mbtiTestDate: formData.get("mbtiTestDate") || null,
    learningStyle: formData.get("learningStyle") || null,
    hobbies: formData.get("hobbies") || null,
    interests: formData.get("interests") || null,
  };
  const parsed = iqSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: "Données invalides" };
  }

  // Verify student belongs to this school (multi-tenant safety)
  const student = await prisma.student.findFirst({
    where: { id: parsed.data.studentId, schoolId: session.schoolId },
    select: { id: true },
  });
  if (!student) return { ok: false as const, error: "Élève introuvable" };

  await prisma.student.update({
    where: { id: parsed.data.studentId },
    data: {
      iqScore: parsed.data.iqScore,
      iqTestName: parsed.data.iqTestName,
      iqTestDate: parsed.data.iqTestDate ? new Date(parsed.data.iqTestDate) : null,
      mbtiType: parsed.data.mbtiType,
      mbtiTestDate: parsed.data.mbtiTestDate ? new Date(parsed.data.mbtiTestDate) : null,
      learningStyle: parsed.data.learningStyle,
      hobbies: parsed.data.hobbies,
      interests: parsed.data.interests,
    },
  });

  revalidatePath(`/app/students/${parsed.data.studentId}/report`);
  return { ok: true as const };
}

// ─── Add a teacher observation ───────────────────────────────────────

const observationSchema = z.object({
  studentId: z.string(),
  subjectId: z.string().optional().nullable(),
  observation: z.string().min(3).max(2000),
  advice: z.string().max(2000).optional().nullable(),
  intelligenceTags: z.string().max(200).optional().nullable(),
});

export async function addObservation(formData: FormData) {
  const session = await requireSession();

  const parsed = observationSchema.safeParse({
    studentId: formData.get("studentId"),
    subjectId: formData.get("subjectId") || null,
    observation: formData.get("observation"),
    advice: formData.get("advice") || null,
    intelligenceTags: formData.get("intelligenceTags") || null,
  });
  if (!parsed.success) return { ok: false as const, error: "Données invalides" };

  // Verify student belongs to this school
  const student = await prisma.student.findFirst({
    where: { id: parsed.data.studentId, schoolId: session.schoolId },
    select: { id: true },
  });
  if (!student) return { ok: false as const, error: "Élève introuvable" };

  await prisma.studentObservation.create({
    data: {
      studentId: parsed.data.studentId,
      schoolId: session.schoolId,
      subjectId: parsed.data.subjectId,
      teacherId: session.userId,
      observation: parsed.data.observation,
      advice: parsed.data.advice,
      intelligenceTags: parsed.data.intelligenceTags,
    },
  });

  revalidatePath(`/app/students/${parsed.data.studentId}/report`);
  return { ok: true as const };
}

export async function deleteObservation(observationId: string) {
  const session = await requireSession();
  const obs = await prisma.studentObservation.findFirst({
    where: { id: observationId, schoolId: session.schoolId },
    select: { id: true, studentId: true },
  });
  if (!obs) return { ok: false as const };

  await prisma.studentObservation.delete({ where: { id: obs.id } });
  revalidatePath(`/app/students/${obs.studentId}/report`);
  return { ok: true as const };
}

// ─── Update student photo URL ────────────────────────────────────────

const photoSchema = z.object({
  studentId: z.string(),
  photoUrl: z.string().max(2000).nullable(),
});

export async function updateStudentPhoto(formData: FormData) {
  const session = await requireSession();
  const photoUrl = formData.get("photoUrl");
  const parsed = photoSchema.safeParse({
    studentId: formData.get("studentId"),
    photoUrl: photoUrl ? String(photoUrl) : null,
  });
  if (!parsed.success) return { ok: false as const, error: "Invalide" };

  const student = await prisma.student.findFirst({
    where: { id: parsed.data.studentId, schoolId: session.schoolId },
    select: { id: true },
  });
  if (!student) return { ok: false as const, error: "Élève introuvable" };

  await prisma.student.update({
    where: { id: parsed.data.studentId },
    data: { photoUrl: parsed.data.photoUrl },
  });

  revalidatePath(`/app/students/${parsed.data.studentId}/report`);
  revalidatePath("/app/students");
  return { ok: true as const, photoUrl: parsed.data.photoUrl };
}
