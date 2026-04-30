import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BulletinsClient } from "./bulletins-client";

export default async function BulletinsPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string; trimester?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const sp = await searchParams;
  const trimester = Number(sp.trimester) || 2;

  const [students, year, school] = await Promise.all([
    prisma.student.findMany({
      where: { schoolId: session.schoolId, isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        class: { select: { name: true } },
      },
      orderBy: { lastName: "asc" },
    }),
    prisma.academicYear.findFirst({
      where: { schoolId: session.schoolId, isCurrent: true },
      select: { name: true },
    }),
    prisma.school.findUnique({
      where: { id: session.schoolId },
      select: { name: true, wilaya: true, director: true },
    }),
  ]);

  const selectedId = sp.student ?? students[0]?.id ?? null;

  let bulletinData = null;
  if (selectedId) {
    const student = await prisma.student.findFirst({
      where: { id: selectedId, schoolId: session.schoolId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        class: { select: { name: true } },
      },
    });

    const grades = await prisma.grade.findMany({
      where: {
        studentId: selectedId,
        trimester,
        year: year?.name ?? "",
      },
      select: {
        value: true,
        comment: true,
        subject: { select: { id: true, name: true } },
      },
    });

    bulletinData = { student, grades };
  }

  return (
    <BulletinsClient
      students={students}
      selectedId={selectedId}
      trimester={trimester}
      year={year?.name ?? ""}
      school={school}
      bulletinData={bulletinData}
    />
  );
}
