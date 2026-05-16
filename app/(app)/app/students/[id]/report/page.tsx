import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateScientificReport } from "@/lib/orientation/profile";
import { ReportClient } from "./report-client";

export default async function ScientificReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id: studentId } = await params;

  // Multi-tenant safety: ensure student belongs to this school
  const student = await prisma.student.findFirst({
    where: { id: studentId, schoolId: session.schoolId },
    include: {
      class: { select: { id: true, name: true } },
    },
  });
  if (!student) notFound();

  const [grades, observations, school, subjects] = await Promise.all([
    prisma.grade.findMany({
      where: { studentId },
      select: {
        value: true,
        trimester: true,
        subject: { select: { id: true, code: true, name: true } },
      },
      orderBy: { trimester: "asc" },
    }),
    prisma.studentObservation.findMany({
      where: { studentId, schoolId: session.schoolId },
      select: {
        id: true,
        observation: true,
        advice: true,
        intelligenceTags: true,
        createdAt: true,
        teacher: { select: { name: true } },
        subject: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.school.findUnique({
      where: { id: session.schoolId },
      select: { name: true, wilaya: true, director: true },
    }),
    prisma.subject.findMany({
      where: { schoolId: session.schoolId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // Extract available filieres from the school's classes
  const classes = await prisma.class.findMany({
    where: { schoolId: session.schoolId },
    select: { cycle: true },
  });
  const availableFilieres = Array.from(
    new Set(classes.map((c) => c.cycle).filter((c): c is string => !!c)),
  );

  // Generate the report
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

  return (
    <ReportClient
      student={{
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        firstNameAr: student.firstNameAr ?? "",
        lastNameAr: student.lastNameAr ?? "",
        iqScore: student.iqScore,
        iqTestName: student.iqTestName,
        iqTestDate: student.iqTestDate?.toISOString() ?? null,
        learningStyle: student.learningStyle,
        hobbies: student.hobbies,
        interests: student.interests,
      }}
      report={report}
      observationsRaw={observations.map((o) => ({
        id: o.id,
        teacherName: o.teacher.name,
        subjectName: o.subject?.name ?? null,
        observation: o.observation,
        advice: o.advice,
        intelligenceTags: o.intelligenceTags,
        createdAt: o.createdAt.toISOString(),
      }))}
      subjects={subjects}
      school={school ?? { name: "École", wilaya: "", director: "" }}
    />
  );
}
