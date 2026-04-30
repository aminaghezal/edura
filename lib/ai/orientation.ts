/**
 * EDURA — Orientation Engine (Phase 5, Step 5.3)
 *
 * Suggests the best Algerian baccalauréat filière (track) for a student
 * based on their performance pattern across subjects.
 *
 * Algerian filières (post-2nde AS):
 *   - Sciences expérimentales       (svt, phys, math)
 *   - Mathématiques                  (math, phys)
 *   - Lettres et philosophie         (philo, ar, hg, fr)
 *   - Langues étrangères             (fr, en, ar)
 *   - Gestion et économie            (math, gestion, économie)
 *
 * Approach:
 *   - Each filière has a weighted profile of subject codes
 *   - Compute a fit-score per filière = Σ(grade × weight) / Σ(weight)
 *   - Recommend the highest-scoring filière
 *   - Confidence = (top - second) / 20  (gap-based)
 *
 * Pure function, deterministic, no DB.
 */

export type SubjectGrade = {
  /** Subject code (e.g. "math", "phys", "fr"). Must match Subject.code in DB. */
  code: string;
  /** Grade out of 20 — should be the trimester or yearly average. */
  value: number;
};

export type OrientationOutput = {
  /** Filière name in French (or null if not enough data). */
  suggestion: string | null;
  /** 0–1, where 1 = clear winner, 0 = tied. Null if no suggestion. */
  confidence: number | null;
  /** Auditable: scores for every filière. */
  ranking: { filiere: string; score: number }[];
};

// ──────────────────────────────────────────────────────────────────────
// Filière profiles
// Weights are RELATIVE within each filière. They sum to 1.0 per filière
// so all filières are comparable on the same 0-20 scale.
// ──────────────────────────────────────────────────────────────────────

const FILIERE_PROFILES: { name: string; weights: Record<string, number> }[] = [
  {
    name: "Sciences expérimentales",
    weights: { svt: 0.35, phys: 0.3, math: 0.25, fr: 0.05, en: 0.05 },
  },
  {
    name: "Mathématiques",
    weights: { math: 0.5, phys: 0.3, svt: 0.1, fr: 0.05, en: 0.05 },
  },
  {
    name: "Lettres et philosophie",
    weights: { philo: 0.3, ar: 0.25, hg: 0.2, fr: 0.15, isla: 0.1 },
  },
  {
    name: "Langues étrangères",
    weights: { fr: 0.35, en: 0.35, ar: 0.2, philo: 0.1 },
  },
  {
    name: "Gestion et économie",
    weights: { math: 0.4, fr: 0.2, en: 0.15, hg: 0.15, ar: 0.1 },
  },
];

const MIN_GRADES_FOR_SUGGESTION = 4;

// ──────────────────────────────────────────────────────────────────────
// Main function
// ──────────────────────────────────────────────────────────────────────

export function computeOrientation(grades: SubjectGrade[]): OrientationOutput {
  // Aggregate by subject code (in case multiple grades per subject)
  const byCode = new Map<string, number[]>();
  grades.forEach((g) => {
    if (!byCode.has(g.code)) byCode.set(g.code, []);
    byCode.get(g.code)!.push(g.value);
  });

  const avgByCode = new Map<string, number>();
  byCode.forEach((vals, code) => {
    avgByCode.set(code, vals.reduce((a, b) => a + b, 0) / vals.length);
  });

  if (avgByCode.size < MIN_GRADES_FOR_SUGGESTION) {
    return { suggestion: null, confidence: null, ranking: [] };
  }

  // Score every filière
  const ranking = FILIERE_PROFILES.map((f) => {
    let weightedSum = 0;
    let weightUsed = 0;
    for (const [code, weight] of Object.entries(f.weights)) {
      const grade = avgByCode.get(code);
      if (grade != null) {
        weightedSum += grade * weight;
        weightUsed += weight;
      }
    }
    // Normalise by weight actually used (so missing subjects don't penalise)
    const score = weightUsed > 0 ? weightedSum / weightUsed : 0;
    return { filiere: f.name, score: Number(score.toFixed(2)) };
  }).sort((a, b) => b.score - a.score);

  const top = ranking[0];
  const second = ranking[1];

  // Need at least one positive score AND a meaningful lead
  if (!top || top.score < 8) {
    return { suggestion: null, confidence: null, ranking };
  }

  // Confidence: gap between top and second, normalised by max possible gap (20)
  // Clamped to [0.1, 1.0] — never claim 0% or above 100%
  const gap = top.score - (second?.score ?? 0);
  const confidence = Math.min(1, Math.max(0.1, gap / 5));

  return {
    suggestion: top.filiere,
    confidence: Number(confidence.toFixed(2)),
    ranking,
  };
}
