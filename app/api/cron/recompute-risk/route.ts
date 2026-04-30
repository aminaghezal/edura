import { NextResponse, type NextRequest } from "next/server";
import { recomputeRiskForAllSchools } from "@/lib/ai/recompute-risk";

// Vercel Cron calls this with header `Authorization: Bearer <CRON_SECRET>`
// In dev you can hit it manually with the same header.

export async function GET(req: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Run ─────────────────────────────────────────────────────────────
  const t0 = Date.now();
  try {
    const reports = await recomputeRiskForAllSchools();
    const totalStudents = reports.reduce((a, r) => a + r.totalProcessed, 0);
    const totalHigh = reports.reduce((a, r) => a + r.distribution.HIGH, 0);

    return NextResponse.json({
      ok: true,
      schoolsProcessed: reports.length,
      studentsProcessed: totalStudents,
      highRiskFlagged: totalHigh,
      durationMs: Date.now() - t0,
      perSchool: reports,
    });
  } catch (err) {
    console.error("[cron/recompute-risk] failed:", err);
    return NextResponse.json(
      { error: "Recomputation failed", details: String(err) },
      { status: 500 },
    );
  }
}

// Allow Vercel to run this for up to 60s (Hobby plan ceiling)
export const maxDuration = 60;
