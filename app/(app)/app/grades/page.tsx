import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GradesClient } from "./grades-client";

export default async function GradesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [classes, subjects, year] = await Promise.all([
    prisma.class.findMany({
      where: { schoolId: session.schoolId },
      select: {
        id: true,
        name: true,
        students: {
          where: { isActive: true },
          select: { id: true, firstName: true, lastName: true },
          orderBy: { lastName: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.subject.findMany({
      where: { schoolId: session.schoolId },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    }),
    prisma.academicYear.findFirst({
      where: { schoolId: session.schoolId, isCurrent: true },
      select: { name: true },
    }),
  ]);

  const trimester = 2;
  const grades = await prisma.grade.findMany({
    where: {
      trimester,
      year: year?.name ?? "",
      student: { schoolId: session.schoolId },
    },
    select: { studentId: true, subjectId: true, value: true },
  });

  return (
    <GradesClient
      classes={classes}
      subjects={subjects}
      year={year?.name ?? ""}
      trimester={trimester}
      existingGrades={grades}
    />
  );
}
