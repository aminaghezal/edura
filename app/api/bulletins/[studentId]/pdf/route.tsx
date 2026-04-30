import { NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { BulletinPdf } from "@/lib/pdf/bulletin";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ studentId: string }> },
) {
  const session = await requireSession();
  const { studentId } = await params;
  const { searchParams } = new URL(req.url);
  const trimester = Number(searchParams.get("trimester")) || 2;

  // Verify student belongs to this school (multi-tenant safety)
  const student = await prisma.student.findFirst({
    where: { id: studentId, schoolId: session.schoolId },
    select: {
      firstName: true,
      lastName: true,
      class: { select: { name: true } },
    },
  });
  if (!student) {
    return NextResponse.json({ error: "Élève introuvable" }, { status: 404 });
  }

  const [school, year, grades] = await Promise.all([
    prisma.school.findUnique({
      where: { id: session.schoolId },
      select: { name: true, wilaya: true, director: true },
    }),
    prisma.academicYear.findFirst({
      where: { schoolId: session.schoolId, isCurrent: true },
      select: { name: true },
    }),
    prisma.grade.findMany({
      where: {
        studentId,
        trimester,
      },
      select: {
        value: true,
        comment: true,
        subject: { select: { id: true, name: true } },
      },
    }),
  ]);

  // Look up coefficients from ClassSubject
  const classSubjects = await prisma.classSubject.findMany({
    where: { class: { schoolId: session.schoolId } },
    select: { subjectId: true, coefficient: true },
  });
  const coefBySubject = new Map(
    classSubjects.map((cs) => [cs.subjectId, cs.coefficient]),
  );

  const gradesForPdf = grades.map((g) => ({
    subjectName: g.subject.name,
    value: g.value,
    coefficient: coefBySubject.get(g.subject.id) ?? 1,
    comment: g.comment,
  }));

  const stream = await renderToStream(
    <BulletinPdf
      school={school ?? { name: "École", wilaya: "", director: "" }}
      student={{
        firstName: student.firstName,
        lastName: student.lastName,
        className: student.class?.name ?? "—",
      }}
      trimester={trimester}
      year={year?.name ?? ""}
      grades={gradesForPdf}
    />,
  );

  // @react-pdf/renderer returns a Node Readable; pipe it as a Web stream
  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="bulletin-${student.lastName}-T${trimester}.pdf"`,
    },
  });
}
