/**
 * EDURA — Risk Recomputation Batch (Phase 5, Step 5.2)
 *
 * Runs `computeRiskScore` across every active student of a school
 * (or every school) and writes the result back to:
 *   student.riskScore
 *   student.riskLevel
 *   student.riskRationale
 *
 * Optimized for nightly cron:
 *   - ONE select query per school (joins grades + attendance + payments)
 *   - parallel updates (Prisma pool handles concurrency)
 *   - ~5,000 students should complete in < 30 seconds
 */

import { prisma } from "@/lib/prisma";
import { computeRiskScore } from "./risk-score";
import { computeOrientation } from "./orientation";

// ──────────────────────────────────────────────────────────────────────
// Determine current trimester
// Strategy: use the latest trimester that actually has grades for this
// school + year. Falls back to date-based heuristic only if no data.
// ──────────────────────────────────────────────────────────────────────
async function detectCurrentTrimester(
  schoolId: string,
  year: string,
  now: Date,
): Promise<number> {
  const latest = await prisma.grade.findFirst({
    where: { year, student: { schoolId } },
    orderBy: { trimester: "desc" },
    select: { trimester: true },
  });
  if (latest) return latest.trimester;

  // No grades yet → fall back to date heuristic
  const m = now.getMonth();
  if (m >= 8 && m <= 10) return 1;
  if (m === 11 || m <= 2) return 2;
  return 3;
}

// ──────────────────────────────────────────────────────────────────────
// Recompute one school
// ──────────────────────────────────────────────────────────────────────

export type RecomputeReport = {
  schoolId: string;
  totalProcessed: number;
  distribution: { LOW: number; MODERATE: number; HIGH: number };
  durationMs: number;
};

export async function recomputeRiskForSchool(
  schoolId: string,
  now: Date = new Date(),
): Promise<RecomputeReport> {
  const t0 = Date.now();

  const year = await prisma.academicYear.findFirst({
    where: { schoolId, isCurrent: true },
    select: { name: true },
  });
  if (!year) {
    return {
      schoolId,
      totalProcessed: 0,
      distribution: { LOW: 0, MODERATE: 0, HIGH: 0 },
      durationMs: Date.now() - t0,
    };
  }

  const tCurrent = await detectCurrentTrimester(schoolId, year.name, now);
  const tPrevious = tCurrent - 1; // 0 if T1 — handled by `tPrevious >= 1` filter below
  const sixtyDaysAgo = new Date(now);
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  // ── Single batched fetch ────────────────────────────────────────────
  // For orientation we need ALL grades from this year (not just current).
  const students = await prisma.student.findMany({
    where: { schoolId, isActive: true },
    select: {
      id: true,
      grades: {
        where: { year: year.name },
        select: {
          value: true,
          trimester: true,
          subject: { select: { code: true } },
        },
      },
      attendance: {
        where: { date: { gte: sixtyDaysAgo } },
        select: { date: true, status: true },
      },
      payments: {
        where: { year: year.name },
        select: {
          trimester: true,
          amountDue: true,
          amountPaid: true,
          status: true,
        },
      },
    },
  });

  // ── Compute (in-memory, parallel-friendly) ─────────────────────────
  const updates = students.map((s) => {
    const currentGrades = s.grades.filter((g) => g.trimester === tCurrent);
    const previousGrades = s.grades.filter((g) => g.trimester === tPrevious);

    const risk = computeRiskScore(
      {
        currentGrades,
        previousGrades,
        recentAttendance: s.attendance,
        payments: s.payments,
      },
      now,
    );

    // Orientation uses ALL grades across all trimesters this year
    const orient = computeOrientation(
      s.grades.map((g) => ({ code: g.subject.code, value: g.value })),
    );

    return { id: s.id, risk, orient };
  });

  // ── Write back (chunked parallel updates) ───────────────────────────
  // Chunk size 50 = ~50 concurrent updates per batch, fine for the pg pool (max 5)
  const distribution = { LOW: 0, MODERATE: 0, HIGH: 0 };
  const CHUNK = 25;
  for (let i = 0; i < updates.length; i += CHUNK) {
    const slice = updates.slice(i, i + CHUNK);
    await Promise.all(
      slice.map((u) =>
        prisma.student.update({
          where: { id: u.id },
          data: {
            riskScore: u.risk.score,
            riskLevel: u.risk.level,
            riskRationale: u.risk.rationale,
            orientationSuggestion: u.orient.suggestion,
            orientationConfidence: u.orient.confidence,
          },
        }),
      ),
    );
    slice.forEach((u) => distribution[u.risk.level]++);
  }

  return {
    schoolId,
    totalProcessed: updates.length,
    distribution,
    durationMs: Date.now() - t0,
  };
}

// ──────────────────────────────────────────────────────────────────────
// Recompute every school (cron entry-point)
// ──────────────────────────────────────────────────────────────────────

export async function recomputeRiskForAllSchools(
  now: Date = new Date(),
): Promise<RecomputeReport[]> {
  const schools = await prisma.school.findMany({
    where: { planStatus: { in: ["TRIAL", "ACTIVE"] } },
    select: { id: true },
  });

  const reports: RecomputeReport[] = [];
  for (const s of schools) {
    try {
      const r = await recomputeRiskForSchool(s.id, now);
      reports.push(r);
    } catch (err) {
      console.error(`[risk-recompute] school=${s.id} failed:`, err);
    }
  }
  return reports;
}
