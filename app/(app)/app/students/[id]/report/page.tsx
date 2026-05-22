import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateScientificReport } from "@/lib/orientation/profile";
import { ReportClient } from "./report-client";

// Force fresh data each time so tablet results show up the moment the
// teacher refreshes the report page (no stale ISR cache).
export const dynamic = "force-dynamic";

type TestResultRow = {
  id: string;
  session_id: string;
  student_id: string;
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

  // ─── Fetch latest EDURA Test result via raw SQL (test_results isn't in Prisma) ──
  let latestTestResult: TestResultRow | null = null;
  let testAttemptCount = 0;
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

    const countRows = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint as count
      FROM test_sessions
      WHERE student_id = ${studentId} AND status = 'completed'
    `;
    testAttemptCount = Number(countRows[0]?.count ?? 0);
  } catch (e) {
    // tables might not exist yet in some envs — fail soft
    console.warn("[report] could not fetch test_results:", e);
  }

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

  const classes = await prisma.class.findMany({
    where: { schoolId: session.schoolId },
    select: { cycle: true },
  });
  const availableFilieres = Array.from(
    new Set(classes.map((c) => c.cycle).filter((c): c is string => !!c)),
  );

  // Generate the report — passes test result so the orientation engine can use
  // the actual intelligence scores from the tablet test (instead of estimating from grades)
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
    // ↓ Tablet test signals take priority when present
    testResultIntelligenceScores: latestTestResult?.intelligence_scores ?? null,
    mbtiType: latestTestResult?.mbti_type ?? student.mbtiType,
    tabletCareerLiked: latestTestResult?.career_liked ?? null,
    tabletCareerTopMatch: latestTestResult?.career_top_match ?? null,
  });

  return (
    <ReportClient
      student={{
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        firstNameAr: student.firstNameAr ?? "",
        lastNameAr: student.lastNameAr ?? "",
        iqScore: latestTestResult?.iq_score ?? student.iqScore,
        iqTestName: latestTestResult ? "EDURA Test (interne)" : student.iqTestName,
        iqTestDate: (latestTestResult?.submitted_at ?? student.iqTestDate)?.toISOString() ?? null,
        mbtiType: latestTestResult?.mbti_type ?? student.mbtiType,
        mbtiTestDate: (latestTestResult?.submitted_at ?? student.mbtiTestDate)?.toISOString() ?? null,
        photoUrl: student.photoUrl,
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
              attemptCount: testAttemptCount,
            }
          : null
      }
    />
  );
}
