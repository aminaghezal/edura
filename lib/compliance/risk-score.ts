/**
 * EDURA — Compliance Risk Scoring (Score IA d'évaluation du risque d'inspection)
 *
 * Weighted-rule-based intelligence layer that evaluates a school's
 * regulatory compliance against the Algerian cahier des charges and
 * produces an inspection-readiness score 0-100.
 *
 * Scoring model:
 *   Each obligation contributes points based on its category weight (1-10)
 *   multiplied by a status multiplier:
 *     COMPLIANT   = 1.0
 *     IN_PROGRESS = 0.5
 *     AT_RISK     = 0.2
 *     EXPIRED     = 0.0
 *     NOT_STARTED = 0.0
 *
 *   Final score = (earned weight / total weight) × 100
 *
 *   Decay penalties for time-sensitive items:
 *     - expires within 30 days  → -3 points
 *     - expires within 7 days   → additional -7 points
 *
 *   Risk levels: 85+ FAIBLE, 65-84 MODÉRÉ, 40-64 ÉLEVÉ, <40 CRITIQUE
 */

import type { ObligationStatus } from "@prisma/client";

export type ObligationInput = {
  id: string;
  title: string;
  status: ObligationStatus;
  expiresAt: Date | null;
  category: { id: string; title: string; weight: number; code: string };
};

const STATUS_MULTIPLIER: Record<ObligationStatus, number> = {
  COMPLIANT: 1.0,
  IN_PROGRESS: 0.5,
  AT_RISK: 0.2,
  EXPIRED: 0.0,
  NOT_STARTED: 0.0,
};

export type Recommendation = {
  obligationId: string;
  obligationTitle: string;
  categoryTitle: string;
  priorityScore: number;
  action: string;
};

export type CategoryBreakdown = {
  categoryId: string;
  categoryTitle: string;
  categoryCode: string;
  weight: number;
  score: number; // 0-100 within this category
  total: number;
  compliant: number;
  atRisk: number;
};

export type RiskAssessment = {
  score: number; // 0-100
  riskLevel: "FAIBLE" | "MODÉRÉ" | "ÉLEVÉ" | "CRITIQUE";
  recommendations: Recommendation[];
  breakdown: CategoryBreakdown[];
  totalObligations: number;
  compliantCount: number;
  atRiskCount: number;
  expiringCount: number;
};

function levelFromScore(score: number): RiskAssessment["riskLevel"] {
  if (score >= 85) return "FAIBLE";
  if (score >= 65) return "MODÉRÉ";
  if (score >= 40) return "ÉLEVÉ";
  return "CRITIQUE";
}

function actionFor(o: ObligationInput): string {
  switch (o.status) {
    case "EXPIRED":
      return `Renouveler immédiatement: ${o.title}`;
    case "NOT_STARTED":
      return `Démarrer la conformité: ${o.title}`;
    case "AT_RISK":
      return `Sécuriser: ${o.title}`;
    case "IN_PROGRESS":
      return `Finaliser: ${o.title}`;
    default:
      return `Vérifier: ${o.title}`;
  }
}

export function calculateRiskScore(
  obligations: ObligationInput[],
  now: Date = new Date(),
): RiskAssessment {
  if (obligations.length === 0) {
    return {
      score: 0,
      riskLevel: "CRITIQUE",
      recommendations: [],
      breakdown: [],
      totalObligations: 0,
      compliantCount: 0,
      atRiskCount: 0,
      expiringCount: 0,
    };
  }

  let totalWeight = 0;
  let earnedWeight = 0;
  let expiringCount = 0;
  let decay = 0;

  // Group by category for breakdown
  const byCategory = new Map<string, {
    title: string;
    code: string;
    weight: number;
    items: ObligationInput[];
  }>();

  for (const o of obligations) {
    const w = o.category.weight;
    const m = STATUS_MULTIPLIER[o.status];
    totalWeight += w;
    earnedWeight += w * m;

    if (o.expiresAt) {
      const daysLeft = (o.expiresAt.getTime() - now.getTime()) / 86400000;
      if (daysLeft >= 0 && daysLeft < 30) {
        expiringCount++;
        decay -= 3;
        if (daysLeft < 7) decay -= 7;
      }
    }

    const key = o.category.id;
    if (!byCategory.has(key)) {
      byCategory.set(key, {
        title: o.category.title,
        code: o.category.code,
        weight: o.category.weight,
        items: [],
      });
    }
    byCategory.get(key)!.items.push(o);
  }

  const baseScore = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 0;
  const finalScore = Math.max(0, Math.min(100, Math.round(baseScore + decay)));

  // Recommendations: top 3 by (weight × (1 - statusMultiplier))
  const recommendations: Recommendation[] = obligations
    .map((o) => ({
      obligation: o,
      priority: o.category.weight * (1 - STATUS_MULTIPLIER[o.status]),
    }))
    .filter((x) => x.priority > 0)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3)
    .map((x) => ({
      obligationId: x.obligation.id,
      obligationTitle: x.obligation.title,
      categoryTitle: x.obligation.category.title,
      priorityScore: Math.round(x.priority * 10) / 10,
      action: actionFor(x.obligation),
    }));

  const breakdown: CategoryBreakdown[] = Array.from(byCategory.entries())
    .map(([id, c]) => {
      const localTotal = c.items.length * c.weight;
      const localEarned = c.items.reduce(
        (sum, o) => sum + c.weight * STATUS_MULTIPLIER[o.status],
        0,
      );
      return {
        categoryId: id,
        categoryTitle: c.title,
        categoryCode: c.code,
        weight: c.weight,
        score: localTotal > 0 ? Math.round((localEarned / localTotal) * 100) : 0,
        total: c.items.length,
        compliant: c.items.filter((i) => i.status === "COMPLIANT").length,
        atRisk: c.items.filter(
          (i) => i.status === "AT_RISK" || i.status === "EXPIRED" || i.status === "NOT_STARTED",
        ).length,
      };
    })
    .sort((a, b) => b.weight - a.weight);

  return {
    score: finalScore,
    riskLevel: levelFromScore(finalScore),
    recommendations,
    breakdown,
    totalObligations: obligations.length,
    compliantCount: obligations.filter((o) => o.status === "COMPLIANT").length,
    atRiskCount: obligations.filter(
      (o) => o.status === "AT_RISK" || o.status === "EXPIRED",
    ).length,
    expiringCount,
  };
}
