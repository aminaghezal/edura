import { NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { generateScientificReport } from "@/lib/orientation/profile";
import { generateMBTIProfile } from "@/lib/orientation/mbti";
import { ScientificReportPdf } from "@/lib/pdf/scientific-report";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession();
  const { id: studentId } = await params;

  const student = await prisma.student.findFirst({
    where: { id: studentId, schoolId: session.schoolId },
    include: { class: { select: { name: true } } },
  });
  if (!student) {
    return NextResponse.json({ error: "Élève introuvable" }, { status: 404 });
  }

  const [grades, observations, school, year, classes] = await Promise.all([
    prisma.grade.findMany({
      where: { studentId },
      select: {
        value: true,
        trimester: true,
        subject: { select: { code: true, name: true } },
      },
      orderBy: { trimester: "asc" },
    }),
    prisma.studentObservation.findMany({
      where: { studentId, schoolId: session.schoolId },
      select: {
        observation: true,
        advice: true,
        intelligenceTags: true,
        teacher: { select: { name: true } },
        subject: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.school.findUnique({
      where: { id: session.schoolId },
      select: { name: true, wilaya: true, director: true },
    }),
    prisma.academicYear.findFirst({
      where: { schoolId: session.schoolId, isCurrent: true },
      select: { name: true },
    }),
    prisma.class.findMany({
      where: { schoolId: session.schoolId },
      select: { cycle: true },
    }),
  ]);

  const availableFilieres = Array.from(
    new Set(classes.map((c) => c.cycle).filter((c): c is string => !!c)),
  );

  const report = generateScientificReport({
    student: {
      firstName: student.firstName,
      lastName: student.lastName,
      firstNameAr: student.firstNameAr,
      lastNameAr: student.lastNameAr,
      className: student.class?.name ?? null,
      iqScore: student.iqScore,
      learningStyle: student.learningStyle,
      hobbies: student.hobbies,
      interests: student.interests,
    },
    grades: grades.map((g) => ({
      value: g.value,
      trimester: g.trimester,
      subject: { code: g.subject.code, name: g.subject.name },
    })),
    observations: observations.map((o) => ({
      teacherName: o.teacher.name,
      subjectName: o.subject?.name ?? null,
      observation: o.observation,
      advice: o.advice,
      intelligenceTags: o.intelligenceTags,
    })),
    availableFilieres,
  });

  const mbtiProfile = generateMBTIProfile(student.mbtiType);

  const stream = await renderToStream(
    <ScientificReportPdf
      report={report}
      mbti={mbtiProfile}
      photoUrl={student.photoUrl ?? null}
      school={school ?? { name: "École", wilaya: "", director: "" }}
      year={year?.name ?? "2025-2026"}
    />,
  );

  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="rapport-scientifique-${student.lastName}.pdf"`,
    },
  });
}
