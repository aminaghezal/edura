"use server";

import { requireSession } from "@/lib/auth";
import {
  buildSummaryInput,
  generateDirectorSummary,
} from "@/lib/ai/director-summary";

export async function regenerateSummary() {
  const session = await requireSession();
  try {
    const input = await buildSummaryInput(session.schoolId);
    const summary = await generateDirectorSummary(input);
    return { ok: true as const, summary };
  } catch (err) {
    console.error("[regenerateSummary] failed:", err);
    return { ok: false as const, error: "Erreur de génération" };
  }
}
