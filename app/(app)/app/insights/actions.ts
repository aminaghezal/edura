"use server";

import { revalidatePath } from "next/cache";
import { requireSession, requireRole } from "@/lib/auth";
import { recomputeRiskForSchool } from "@/lib/ai/recompute-risk";

export async function recomputeNow() {
  const session = await requireSession();
  requireRole(session, "DIRECTOR");

  const report = await recomputeRiskForSchool(session.schoolId);

  revalidatePath("/app/insights");
  revalidatePath("/app");
  revalidatePath("/app/students");

  return {
    ok: true as const,
    studentsProcessed: report.totalProcessed,
    highRisk: report.distribution.HIGH,
    moderate: report.distribution.MODERATE,
    low: report.distribution.LOW,
    durationMs: report.durationMs,
  };
}
