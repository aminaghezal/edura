/**
 * EDURA — Director Weekly Summary (Phase 5, Step 5.4)
 *
 * Calls Anthropic Claude to generate a one-paragraph French briefing
 * for the school director, based on aggregated data:
 *   - High-risk students this week
 *   - Class average trends
 *   - Payment delinquency
 *
 * Uses prompt caching on the system prompt (it's identical across schools)
 * so we only pay full token cost once per cache window (5 min).
 */

import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

const SYSTEM_PROMPT = `Tu es l'assistant IA du directeur d'une école privée algérienne.
Ta tâche : produire un BREF résumé hebdomadaire (3–5 phrases maximum) en français,
ton professionnel et pragmatique, qui aide le directeur à savoir où concentrer son attention cette semaine.

Règles :
- Toujours en français
- Ton direct, pas de remplissage
- Mentionne 2 à 4 actions concrètes priorisées
- Pas de salutation ni de signature
- Ne fais JAMAIS de déclarations alarmistes — sois factuel
- Cite les chiffres exacts fournis dans le contexte
- Si les données sont insuffisantes, dis-le honnêtement en une phrase`;

export type SummaryInput = {
  schoolName: string;
  totalStudents: number;
  highRiskStudents: { name: string; klass: string; rationale: string }[];
  paymentSummary: {
    overdueCount: number;
    pendingAmount: number;
  };
  classAverages: { className: string; average: number; studentCount: number }[];
};

export async function generateDirectorSummary(
  input: SummaryInput,
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.startsWith("sk-ant-...")) {
    return generateFallbackSummary(input);
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const userMessage = JSON.stringify(input, null, 2);

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 400,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          // Cache the system prompt — identical across all schools
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: `Voici les données de l'école cette semaine :\n\n${userMessage}\n\nÉcris le résumé.`,
        },
      ],
    });

    const block = message.content[0];
    if (block.type === "text") return block.text.trim();
    return generateFallbackSummary(input);
  } catch (err) {
    console.error("[director-summary] Anthropic call failed:", err);
    return generateFallbackSummary(input);
  }
}

// ──────────────────────────────────────────────────────────────────────
// Deterministic fallback — used when no API key, dev, or API failure
// ──────────────────────────────────────────────────────────────────────
function generateFallbackSummary(input: SummaryInput): string {
  const parts: string[] = [];

  if (input.highRiskStudents.length > 0) {
    const names = input.highRiskStudents
      .slice(0, 3)
      .map((s) => s.name)
      .join(", ");
    parts.push(
      `${input.highRiskStudents.length} élève(s) en risque élevé cette semaine (${names}). Contact parents recommandé.`,
    );
  }

  if (input.paymentSummary.overdueCount > 0) {
    const amount = new Intl.NumberFormat("fr-DZ").format(
      input.paymentSummary.pendingAmount,
    );
    parts.push(
      `${input.paymentSummary.overdueCount} paiement(s) en retard pour un total de ${amount} DZD.`,
    );
  }

  const weakClasses = input.classAverages.filter((c) => c.average < 11);
  if (weakClasses.length > 0) {
    parts.push(
      `Classe(s) en difficulté : ${weakClasses.map((c) => `${c.className} (${c.average.toFixed(1)}/20)`).join(", ")}.`,
    );
  }

  if (parts.length === 0) {
    return `Aucun signal d'alerte particulier cette semaine. ${input.totalStudents} élèves suivis.`;
  }

  return parts.join(" ");
}

// ──────────────────────────────────────────────────────────────────────
// Helper: build the input from DB for a school
// ──────────────────────────────────────────────────────────────────────

export async function buildSummaryInput(schoolId: string): Promise<SummaryInput> {
  const [school, students, highRisk, paymentAgg, classes] = await Promise.all([
    prisma.school.findUnique({
      where: { id: schoolId },
      select: { name: true },
    }),
    prisma.student.count({
      where: { schoolId, isActive: true },
    }),
    prisma.student.findMany({
      where: { schoolId, isActive: true, riskLevel: "HIGH" },
      select: {
        firstName: true,
        lastName: true,
        riskRationale: true,
        class: { select: { name: true } },
      },
      orderBy: { riskScore: "desc" },
      take: 10,
    }),
    prisma.payment.findMany({
      where: {
        schoolId,
        status: { in: ["OVERDUE", "PENDING"] },
        amountPaid: 0,
      },
      select: { amountDue: true },
    }),
    prisma.class.findMany({
      where: { schoolId },
      select: {
        name: true,
        students: {
          where: { isActive: true },
          select: {
            grades: {
              select: { value: true },
            },
          },
        },
      },
    }),
  ]);

  const classAverages = classes
    .map((c) => {
      const allGrades = c.students.flatMap((s) => s.grades.map((g) => g.value));
      if (allGrades.length === 0) return null;
      const avg = allGrades.reduce((a, b) => a + b, 0) / allGrades.length;
      return {
        className: c.name,
        average: Number(avg.toFixed(2)),
        studentCount: c.students.length,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return {
    schoolName: school?.name ?? "École",
    totalStudents: students,
    highRiskStudents: highRisk.map((s) => ({
      name: `${s.firstName} ${s.lastName}`,
      klass: s.class?.name ?? "—",
      rationale: s.riskRationale ?? "",
    })),
    paymentSummary: {
      overdueCount: paymentAgg.length,
      pendingAmount: paymentAgg.reduce((a, p) => a + p.amountDue, 0),
    },
    classAverages,
  };
}
