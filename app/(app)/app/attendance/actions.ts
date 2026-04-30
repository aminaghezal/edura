"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

const Status = z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]);

export async function markAttendance(formData: FormData) {
  const session = await requireSession();

  const studentId = String(formData.get("studentId") ?? "");
  const dateStr = String(formData.get("date") ?? "");
  const statusParsed = Status.safeParse(formData.get("status"));

  if (!studentId || !dateStr || !statusParsed.success) {
    return { ok: false as const, error: "Invalide" };
  }

  // Verify student belongs to this school
  const student = await prisma.student.findFirst({
    where: { id: studentId, schoolId: session.schoolId },
    select: { id: true },
  });
  if (!student) return { ok: false as const, error: "Élève introuvable" };

  const date = new Date(dateStr);

  await prisma.attendance.upsert({
    where: { studentId_date: { studentId, date } },
    update: { status: statusParsed.data, recordedById: session.userId },
    create: {
      studentId,
      date,
      status: statusParsed.data,
      recordedById: session.userId,
    },
  });

  revalidatePath("/app/attendance");
  return { ok: true as const };
}
