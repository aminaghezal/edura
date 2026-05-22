import { NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { generateScientificReport } from "@/lib/orientation/profile";
import { generateMBTIProfile } from "@/lib/orientation/mbti";
import { ScientificReportPdf } from "@/lib/pdf/scientific-report";

type TestResultRow = {
  mbti_type: string | null;
  mbti_scores: { E?: number; I?: number; S?: number; N?: number; T?: number; F?: number; J?: number; P?: number } | null;
  iq_score: number | null;
  iq_level: string | null;
  iq_percentile: number | null;
  dominant_intelligence: string | null;
  intelligence_scores: Record<string, number> | null;
  career_liked: string[] | null;
  career_top_match: string | null;
  submitted_at: Date;
};

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

  // Pull latest tablet test result via raw SQL
  let latestTestResult: TestResultRow | null = null;
  try {
    const rows = await prisma.$queryRaw<TestResultRow[]>`
      SELECT tr.*
      FROM test_results tr
      JOIN test_sessions ts ON ts.id = tr.session_id
      WHERE tr.student_id = ${studentId}
        AND ts.status = 'completed'
      ORDER BY tr.submitted_at DESC
      LIMIT 1
    `;
    latestTestResult = rows[0] ?? null;
  } catch (e) {
    console.warn("[pdf] could not fetch test_results:", e);
  }

  const report = generateScientificReport({
    student: {
      firstName: student.firstName,
      lastName: student.lastName,
      firstNameAr: student.firstNameAr,
      lastNameAr: student.lastNameAr,
      className: student.class?.name ?? null,
      iqScore: latestTestResult?.iq_score ?? student.iqScore,
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
    testResultIntelligenceScores: latestTestResult?.intelligence_scores ?? null,
    mbtiType: latestTestResult?.mbti_type ?? student.mbtiType,
    tabletCareerLiked: latestTestResult?.career_liked ?? null,
    tabletCareerTopMatch: latestTestResult?.career_top_match ?? null,
  });

  const mbtiProfile = generateMBTIProfile(latestTestResult?.mbti_type ?? student.mbtiType);

  const stream = await renderToStream(
    <ScientificReportPdf
      report={report}
      mbti={mbtiProfile}
      photoUrl={student.photoUrl ?? null}
      school={school ?? { name: "École", wilaya: "", director: "" }}
      year={year?.name ?? "2025-2026"}
      testResult={
        latestTestResult
          ? {
              mbtiType: latestTestResult.mbti_type,
              mbtiScores: latestTestResult.mbti_scores,
              iqScore: latestTestResult.iq_score,
              iqLevel: latestTestResult.iq_level,
              iqPercentile: latestTestResult.iq_percentile,
              dominantIntelligence: latestTestResult.dominant_intelligence,
              intelligenceScores: latestTestResult.intelligence_scores,
              careerLiked: latestTestResult.career_liked,
              careerTopMatch: latestTestResult.career_top_match,
              submittedAt: latestTestResult.submitted_at.toISOString(),
            }
          : null
      }
    />,
  );

  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="rapport-scientifique-${student.lastName}.pdf"`,
    },
  });
}
