/**
 * EDURA — Risk Scoring Engine (Phase 5, Step 5.1)
 *
 * Rule-based dropout-risk detector.
 *
 * Computes a 0–100 risk score for a single student based on:
 *   1. Academic performance (current trimester average + trend)
 *   2. Attendance patterns (rate + recent acceleration)
 *   3. Payment delinquency
 *
 * Pure function — no database access. Caller fetches data once, then
 * iterates over students for batch processing in the nightly job.
 *
 * Outputs:
 *   - score:       0–100 (higher = riskier)
 *   - level:       LOW | MODERATE | HIGH
 *   - rationale:   human-readable French sentence the director can act on
 *   - factors:     debug breakdown (auditable, transparent)
 *
 * Design principles:
 *   - DETERMINISTIC: same input → same output, always
 *   - EXPLAINABLE: every point in the score has a documented reason
 *   - CONSERVATIVE: prefer false negatives over false positives
 *     (a missed alarm is recoverable; crying wolf erodes trust fast)
 */

import type { AttendanceStatus } from "@prisma/client";

// ──────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────

export type RiskInput = {
  /** Grades from the CURRENT trimester. value is /20. */
  currentGrades: { value: number }[];

  /** Grades from the PREVIOUS trimester (same year). Empty if T1. */
  previousGrades: { value: number }[];

  /** Attendance records from the last 60 calendar days. */
  recentAttendance: { date: Date; status: AttendanceStatus }[];

  /** Payments for the current academic year. */
  payments: {
    trimester: number;
    amountDue: number;
    amountPaid: number;
    status: "PENDING" | "PARTIAL" | "PAID" | "OVERDUE" | "WAIVED";
  }[];
};

export type RiskFactor = {
  key: string;
  label: string; // French
  points: number;
};

export type RiskOutput = {
  score: number; // 0–100
  level: "LOW" | "MODERATE" | "HIGH";
  rationale: string; // French
  factors: RiskFactor[];
};

// ──────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────

function avg(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function isSchoolDay(d: Date): boolean {
  // Algerian week: school days = Sun(0)..Thu(4). Closed Fri(5)/Sat(6).
  const dow = d.getDay();
  return dow >= 0 && dow <= 4;
}

function daysAgo(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() - n);
  return out;
}

// ──────────────────────────────────────────────────────────────────────
// Main scoring function
// ──────────────────────────────────────────────────────────────────────

export function computeRiskScore(
  input: RiskInput,
  now: Date = new Date(),
): RiskOutput {
  const factors: RiskFactor[] = [];

  // ─── 1. Academic factor (max 35 points) ─────────────────────────────
  const currentAvg = avg(input.currentGrades.map((g) => g.value));
  const previousAvg = avg(input.previousGrades.map((g) => g.value));

  if (currentAvg != null) {
    if (currentAvg < 8) {
      factors.push({
        key: "avg_critical",
        label: `Moyenne critique (${currentAvg.toFixed(1)}/20)`,
        points: 25,
      });
    } else if (currentAvg < 10) {
      factors.push({
        key: "avg_failing",
        label: `Moyenne sous la barre (${currentAvg.toFixed(1)}/20)`,
        points: 15,
      });
    } else if (currentAvg < 12) {
      factors.push({
        key: "avg_borderline",
        label: `Moyenne fragile (${currentAvg.toFixed(1)}/20)`,
        points: 5,
      });
    }

    // Trend: drop ≥ 2 points vs previous trimester
    if (previousAvg != null) {
      const drop = previousAvg - currentAvg;
      if (drop >= 4) {
        factors.push({
          key: "avg_collapse",
          label: `Chute brutale (${previousAvg.toFixed(1)} → ${currentAvg.toFixed(1)})`,
          points: 15,
        });
      } else if (drop >= 2) {
        factors.push({
          key: "avg_decline",
          label: `Baisse de moyenne (${previousAvg.toFixed(1)} → ${currentAvg.toFixed(1)})`,
          points: 8,
        });
      }
    }
  }

  // ─── 2. Attendance factor (max 30 points) ──────────────────────────
  // Count school days in the lookback window
  const window60 = input.recentAttendance.filter(
    (a) => a.date >= daysAgo(now, 60),
  );
  const schoolDayRecords = window60.filter((a) => isSchoolDay(a.date));

  const absent = schoolDayRecords.filter((a) => a.status === "ABSENT").length;
  const late = schoolDayRecords.filter((a) => a.status === "LATE").length;
  const totalSchoolDays = schoolDayRecords.length;

  if (totalSchoolDays >= 10) {
    const absentRate = absent / totalSchoolDays;
    if (absentRate > 0.25) {
      factors.push({
        key: "attendance_severe",
        label: `Absentéisme grave (${(absentRate * 100).toFixed(0)}%)`,
        points: 25,
      });
    } else if (absentRate > 0.15) {
      factors.push({
        key: "attendance_high",
        label: `Absentéisme élevé (${(absentRate * 100).toFixed(0)}%)`,
        points: 15,
      });
    } else if (absentRate > 0.08) {
      factors.push({
        key: "attendance_moderate",
        label: `Absences répétées (${absent} jours)`,
        points: 7,
      });
    }
  }

  // Recent acceleration: ≥3 absences in the last 2 weeks
  const window14 = input.recentAttendance.filter(
    (a) => a.date >= daysAgo(now, 14) && isSchoolDay(a.date),
  );
  const recentAbsences = window14.filter((a) => a.status === "ABSENT").length;
  if (recentAbsences >= 3) {
    factors.push({
      key: "attendance_recent_spike",
      label: `${recentAbsences} absences ces 2 dernières semaines`,
      points: 10,
    });
  }

  // Lateness signal (less weight than absences)
  if (late >= 5) {
    factors.push({
      key: "lateness",
      label: `${late} retards ces 60 derniers jours`,
      points: 3,
    });
  }

  // ─── 3. Payment factor (max 15 points) ─────────────────────────────
  const overdue = input.payments.filter(
    (p) => p.status === "OVERDUE" || (p.status === "PENDING" && p.amountPaid === 0),
  ).length;
  const partial = input.payments.filter((p) => p.status === "PARTIAL").length;

  if (overdue >= 2) {
    factors.push({
      key: "payment_multi_overdue",
      label: `${overdue} trimestres impayés`,
      points: 15,
    });
  } else if (overdue === 1) {
    factors.push({
      key: "payment_overdue",
      label: "Paiement en retard",
      points: 8,
    });
  } else if (partial >= 1) {
    factors.push({
      key: "payment_partial",
      label: "Paiement partiel",
      points: 3,
    });
  }

  // ─── Aggregate ──────────────────────────────────────────────────────
  const rawScore = factors.reduce((sum, f) => sum + f.points, 0);
  const score = Math.min(100, Math.max(0, rawScore));

  let level: RiskOutput["level"];
  if (score >= 60) level = "HIGH";
  else if (score >= 30) level = "MODERATE";
  else level = "LOW";

  const rationale = buildRationale(factors, level, currentAvg);

  return { score, level, rationale, factors };
}

// ──────────────────────────────────────────────────────────────────────
// Rationale builder — what the director actually reads
// ──────────────────────────────────────────────────────────────────────

function buildRationale(
  factors: RiskFactor[],
  level: RiskOutput["level"],
  currentAvg: number | null,
): string {
  if (factors.length === 0) {
    return currentAvg != null
      ? `Bons résultats (${currentAvg.toFixed(1)}/20), présence régulière, paiements à jour.`
      : "Aucun signal d'alerte. Données insuffisantes pour une analyse complète.";
  }

  // Top 3 most impactful factors
  const top = [...factors]
    .sort((a, b) => b.points - a.points)
    .slice(0, 3)
    .map((f) => f.label.toLowerCase())
    .join(" ; ");

  const action: Record<RiskOutput["level"], string> = {
    HIGH: "Contact parents recommandé cette semaine.",
    MODERATE: "À surveiller au prochain bilan.",
    LOW: "Aucune action requise.",
  };

  return `${capitalize(top)}. ${action[level]}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
