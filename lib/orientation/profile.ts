/**
 * EDURA — Scientific Student Report Generator
 *
 * Produit le "Bilan Pédagogique et d'Orientation Complet" pour un élève donné.
 *
 * Sections produites :
 *   1. Synthèse académique (GPA + progression)
 *   2. Commentaires des enseignants (observations + conseils)
 *   3. Profil psychopédagogique
 *      - Intelligences multiples de Gardner (8 dimensions)
 *      - Style d'apprentissage
 *      - Intérêts et aptitudes
 *      - Conseils personnalisés
 *   4. Prédiction d'orientation
 *      - Filières recommandées (BAC algérien)
 *      - Métiers et perspectives de carrière
 *      - Universités algériennes pertinentes
 *
 * Pure function — aucun accès BD. Caller fetches data once.
 */

// ──────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────

export type IntelligenceType =
  | "LINGUISTIC"        // verbale / linguistique
  | "LOGICAL"           // logique / mathématique
  | "SPATIAL"           // visuelle / spatiale
  | "BODILY"            // corporelle / kinesthésique
  | "MUSICAL"           // musicale / rythmique
  | "INTERPERSONAL"     // interpersonnelle (sociale)
  | "INTRAPERSONAL"     // intrapersonnelle (introspective)
  | "NATURALIST";       // naturaliste

export const INTELLIGENCE_LABELS: Record<IntelligenceType, string> = {
  LINGUISTIC: "Linguistique",
  LOGICAL: "Logique-Mathématique",
  SPATIAL: "Visuo-Spatiale",
  BODILY: "Kinesthésique",
  MUSICAL: "Musicale",
  INTERPERSONAL: "Interpersonnelle",
  INTRAPERSONAL: "Intrapersonnelle",
  NATURALIST: "Naturaliste",
};

export type ReportInput = {
  student: {
    firstName: string;
    lastName: string;
    firstNameAr?: string | null;
    lastNameAr?: string | null;
    className?: string | null;
    iqScore?: number | null;
    learningStyle?: string | null;
    hobbies?: string | null;
    interests?: string | null;
  };
  // Current academic year grades by trimester and subject
  grades: {
    value: number;
    trimester: number;
    subject: { code: string; name: string };
  }[];
  // Teacher observations
  observations: {
    teacherName: string;
    subjectName: string | null;
    observation: string;
    advice: string | null;
    intelligenceTags: string | null;
  }[];
  // Algerian context
  availableFilieres: string[];
};

export type ScientificReport = {
  meta: {
    studentName: string;
    studentNameAr: string;
    className: string;
    iq: { score: number | null; interpretation: string };
    generatedAt: string;
  };
  academic: {
    gpaTrend: { trimester: number; gpa: number }[];
    overallGpa: number;
    bestSubjects: { name: string; gpa: number }[];
    weakSubjects: { name: string; gpa: number }[];
    progressionLabel: "EN_PROGRESSION" | "STABLE" | "EN_BAISSE";
  };
  observations: {
    teacherName: string;
    subjectName: string;
    observation: string;
    advice: string | null;
  }[];
  profile: {
    intelligences: { type: IntelligenceType; label: string; score: number }[];
    learningStyle: string;
    learningStyleDescription: string;
    interests: string[];
    hobbies: string[];
    personalizedAdvices: string[];
  };
  prediction: {
    recommendedFilieres: {
      name: string;
      confidence: number;
      reasoning: string;
    }[];
    careerSuggestions: {
      title: string;
      filiere: string;
      requiredStudies: string;
    }[];
    universitySuggestions: string[];
  };
};

// ──────────────────────────────────────────────────────────────────────
// Subject-code → Intelligence mapping
// Each subject contributes to one or more intelligences based on
// pedagogical research.
// ──────────────────────────────────────────────────────────────────────

const SUBJECT_TO_INTELLIGENCE: Record<string, IntelligenceType[]> = {
  math: ["LOGICAL"],
  phys: ["LOGICAL", "SPATIAL"],
  svt: ["NATURALIST", "LOGICAL"],
  fr: ["LINGUISTIC"],
  ar: ["LINGUISTIC"],
  en: ["LINGUISTIC"],
  hg: ["LINGUISTIC", "INTRAPERSONAL"],
  philo: ["LINGUISTIC", "INTRAPERSONAL"],
  isla: ["INTRAPERSONAL", "LINGUISTIC"],
  sport: ["BODILY"],
  art: ["SPATIAL", "MUSICAL"],
  music: ["MUSICAL"],
  info: ["LOGICAL", "SPATIAL"],
};

// ──────────────────────────────────────────────────────────────────────
// Filière profiles (Algerian BAC)
// ──────────────────────────────────────────────────────────────────────

const FILIERE_PROFILES: {
  name: string;
  subjectWeights: Record<string, number>;
  careers: { title: string; studies: string }[];
  universities: string[];
}[] = [
  {
    name: "Sciences expérimentales",
    subjectWeights: { svt: 0.35, phys: 0.3, math: 0.25, fr: 0.05, en: 0.05 },
    careers: [
      { title: "Médecin", studies: "Faculté de Médecine — 7 ans" },
      { title: "Pharmacien", studies: "Faculté de Pharmacie — 5 ans" },
      { title: "Chirurgien-dentiste", studies: "Chirurgie Dentaire — 6 ans" },
      { title: "Vétérinaire", studies: "Sciences Vétérinaires — 5 ans" },
      { title: "Biologiste", studies: "Licence + Master Biologie — 5 ans" },
    ],
    universities: ["USTHB Alger", "USTO Oran", "Université Constantine 1", "Université d'Annaba"],
  },
  {
    name: "Mathématiques",
    subjectWeights: { math: 0.5, phys: 0.3, svt: 0.1, fr: 0.05, en: 0.05 },
    careers: [
      { title: "Ingénieur logiciel", studies: "École Polytechnique — 5 ans" },
      { title: "Data Analyst", studies: "Licence Mathématiques + Master — 5 ans" },
      { title: "Actuaire", studies: "Mathématiques Appliquées + Stage" },
      { title: "Ingénieur en finance", studies: "ESSA Alger / HEC — 5 ans" },
      { title: "Enseignant universitaire", studies: "Master + Doctorat" },
    ],
    universities: ["École Nationale Polytechnique d'Alger", "ESI Alger", "USTHB", "USTO-MB Oran"],
  },
  {
    name: "Lettres et philosophie",
    subjectWeights: { philo: 0.3, ar: 0.25, hg: 0.2, fr: 0.15, isla: 0.1 },
    careers: [
      { title: "Avocat", studies: "Faculté de Droit — 5 ans" },
      { title: "Journaliste", studies: "École de Journalisme — 4 ans" },
      { title: "Professeur de philosophie", studies: "Master Philosophie" },
      { title: "Diplomate", studies: "ENA + Master Relations Internationales" },
      { title: "Écrivain / Critique littéraire", studies: "Master Lettres" },
    ],
    universities: ["Université d'Alger 2", "Université d'Oran 2", "Université de Tlemcen"],
  },
  {
    name: "Langues étrangères",
    subjectWeights: { fr: 0.35, en: 0.35, ar: 0.2, philo: 0.1 },
    careers: [
      { title: "Traducteur / Interprète", studies: "Master Traduction — 5 ans" },
      { title: "Professeur de langues", studies: "Licence + CAPES" },
      { title: "Guide touristique", studies: "Licence Tourisme" },
      { title: "Diplomate", studies: "ENA + Spécialisation langues" },
      { title: "Rédacteur / Communication", studies: "Master Communication" },
    ],
    universities: ["Université d'Alger 2", "Université d'Oran 2", "Université de Constantine"],
  },
  {
    name: "Gestion et économie",
    subjectWeights: { math: 0.4, fr: 0.2, en: 0.15, hg: 0.15, ar: 0.1 },
    careers: [
      { title: "Expert-comptable", studies: "Master Comptabilité — 5 ans" },
      { title: "Banquier / Auditeur", studies: "Master Finance — 5 ans" },
      { title: "Manager / Chef d'entreprise", studies: "MBA / ESSA Alger" },
      { title: "Économiste", studies: "Master Économie" },
      { title: "Contrôleur de gestion", studies: "Master Contrôle de Gestion" },
    ],
    universities: ["ESSA Alger", "Université d'Alger 3", "USTHB", "Université d'Oran 2"],
  },
];

// ──────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────

function interpretIq(iq: number | null | undefined): string {
  if (iq == null) return "Non évalué";
  if (iq >= 130) return "Très supérieur — Surdoué";
  if (iq >= 120) return "Supérieur";
  if (iq >= 110) return "Au-dessus de la moyenne";
  if (iq >= 90) return "Moyen — Standard";
  if (iq >= 80) return "Légèrement en-dessous de la moyenne";
  return "À évaluer — Soutien recommandé";
}

const LEARNING_STYLE_DESCRIPTIONS: Record<string, string> = {
  VISUAL:
    "L'élève apprend mieux à travers les supports visuels : graphiques, schémas, vidéos, cartes mentales. Privilégier l'utilisation de diagrammes et de couleurs en classe.",
  AUDITORY:
    "L'élève apprend mieux par l'écoute : explications orales, discussions, podcasts. Privilégier les explications verbales et les enregistrements audio.",
  KINESTHETIC:
    "L'élève apprend mieux par la pratique : expériences, manipulations, mouvements. Privilégier les activités pratiques et les exercices physiques.",
  READING_WRITING:
    "L'élève apprend mieux par la lecture et l'écriture : prises de notes, listes, résumés. Privilégier les manuels et la rédaction de fiches.",
  MIXED:
    "L'élève combine plusieurs styles d'apprentissage. Varier les supports pédagogiques pour maximiser l'engagement.",
};

const LEARNING_STYLE_LABELS: Record<string, string> = {
  VISUAL: "Visuel",
  AUDITORY: "Auditif",
  KINESTHETIC: "Kinesthésique",
  READING_WRITING: "Lecture-Écriture",
  MIXED: "Mixte (Auditif et Visuel)",
};

function splitCsv(s: string | null | undefined): string[] {
  if (!s) return [];
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

// ──────────────────────────────────────────────────────────────────────
// Main function
// ──────────────────────────────────────────────────────────────────────

export function generateScientificReport(input: ReportInput): ScientificReport {
  const { student, grades, observations } = input;

  // ─── 1. Academic synthesis ───────────────────────────────────────
  // GPA per trimester
  const trimesterGroups = new Map<number, number[]>();
  grades.forEach((g) => {
    if (!trimesterGroups.has(g.trimester)) trimesterGroups.set(g.trimester, []);
    trimesterGroups.get(g.trimester)!.push(g.value);
  });
  const gpaTrend = Array.from(trimesterGroups.entries())
    .map(([trimester, values]) => ({
      trimester,
      gpa: Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)),
    }))
    .sort((a, b) => a.trimester - b.trimester);

  const overallGpa =
    grades.length > 0
      ? Number(
          (grades.reduce((a, g) => a + g.value, 0) / grades.length).toFixed(2),
        )
      : 0;

  // Subject averages
  const subjectGroups = new Map<string, { name: string; values: number[] }>();
  grades.forEach((g) => {
    const key = g.subject.code;
    if (!subjectGroups.has(key)) {
      subjectGroups.set(key, { name: g.subject.name, values: [] });
    }
    subjectGroups.get(key)!.values.push(g.value);
  });
  const subjectAverages = Array.from(subjectGroups.values())
    .map((s) => ({
      name: s.name,
      gpa: Number(
        (s.values.reduce((a, b) => a + b, 0) / s.values.length).toFixed(2),
      ),
    }))
    .sort((a, b) => b.gpa - a.gpa);

  const bestSubjects = subjectAverages.slice(0, 3);
  const weakSubjects = subjectAverages.slice(-3).reverse();

  const progressionLabel: ScientificReport["academic"]["progressionLabel"] =
    gpaTrend.length >= 2
      ? gpaTrend[gpaTrend.length - 1].gpa - gpaTrend[0].gpa > 0.5
        ? "EN_PROGRESSION"
        : gpaTrend[gpaTrend.length - 1].gpa - gpaTrend[0].gpa < -0.5
          ? "EN_BAISSE"
          : "STABLE"
      : "STABLE";

  // ─── 2. Compute multiple intelligences ───────────────────────────
  // Base score from grade performance per subject domain
  const intelligenceScores = new Map<IntelligenceType, number>();
  const intelligenceCounts = new Map<IntelligenceType, number>();

  // Initialize all intelligences to a baseline
  (Object.keys(INTELLIGENCE_LABELS) as IntelligenceType[]).forEach((i) => {
    intelligenceScores.set(i, 30); // baseline 30%
    intelligenceCounts.set(i, 1);
  });

  // Boost based on subject performance
  subjectAverages.forEach((s) => {
    const code = grades.find((g) => g.subject.name === s.name)?.subject.code;
    if (!code) return;
    const intelligences = SUBJECT_TO_INTELLIGENCE[code] ?? [];
    intelligences.forEach((i) => {
      const boost = (s.gpa / 20) * 70; // 0..70 contribution
      intelligenceScores.set(
        i,
        (intelligenceScores.get(i) ?? 0) + boost,
      );
      intelligenceCounts.set(i, (intelligenceCounts.get(i) ?? 0) + 1);
    });
  });

  // Boost from teacher observations tags
  observations.forEach((o) => {
    if (!o.intelligenceTags) return;
    splitCsv(o.intelligenceTags).forEach((tag) => {
      const t = tag.toUpperCase() as IntelligenceType;
      if (INTELLIGENCE_LABELS[t]) {
        intelligenceScores.set(t, (intelligenceScores.get(t) ?? 0) + 15);
        intelligenceCounts.set(t, (intelligenceCounts.get(t) ?? 0) + 1);
      }
    });
  });

  // Normalize (average across boosts)
  const rawIntelligences: { type: IntelligenceType; label: string; score: number }[] = [];
  (Object.keys(INTELLIGENCE_LABELS) as IntelligenceType[]).forEach((i) => {
    const total = intelligenceScores.get(i) ?? 0;
    const count = intelligenceCounts.get(i) ?? 1;
    const normalized = Math.min(100, Math.round(total / count));
    rawIntelligences.push({
      type: i,
      label: INTELLIGENCE_LABELS[i],
      score: normalized,
    });
  });

  // Sort by score descending, keep top 5 for chart
  const intelligences = rawIntelligences
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // Re-scale so top 5 sum to 100 (donut display)
  const totalTopFive = intelligences.reduce((a, x) => a + x.score, 0);
  const intelligencesScaled = intelligences.map((i) => ({
    ...i,
    score: Math.round((i.score / totalTopFive) * 100),
  }));

  // ─── 3. Learning style ───────────────────────────────────────────
  const learningStyleKey = student.learningStyle ?? "MIXED";
  const learningStyle = LEARNING_STYLE_LABELS[learningStyleKey] ?? "Mixte";
  const learningStyleDescription =
    LEARNING_STYLE_DESCRIPTIONS[learningStyleKey] ??
    LEARNING_STYLE_DESCRIPTIONS.MIXED;

  // ─── 4. Personalized advices ─────────────────────────────────────
  const advices: string[] = [];
  const topIntelligence = intelligencesScaled[0]?.type;

  if (topIntelligence === "LINGUISTIC") {
    advices.push(
      "Encourager la lecture de romans variés, l'inscription à un club de débat, l'exploration de l'écriture créative.",
    );
    advices.push(
      "Stimuler par des jeux de mots, des mots croisés, et la participation à des concours d'éloquence.",
    );
  }
  if (topIntelligence === "LOGICAL") {
    advices.push(
      "Proposer des jeux de logique, échecs, programmation. Encourager la participation à l'Olympiade de Mathématiques.",
    );
    advices.push(
      "Explorer la robotique, les énigmes scientifiques et les expériences en laboratoire.",
    );
  }
  if (topIntelligence === "SPATIAL") {
    advices.push(
      "Encourager le dessin, la photographie, l'architecture. L'élève bénéficiera de supports visuels enrichis.",
    );
  }
  if (topIntelligence === "BODILY") {
    advices.push(
      "Privilégier le sport, la danse, le théâtre. L'élève apprend mieux par le mouvement.",
    );
  }
  if (topIntelligence === "INTERPERSONAL") {
    advices.push(
      "Encourager le travail de groupe, le scoutisme, le bénévolat. L'élève est un leader naturel.",
    );
  }
  if (topIntelligence === "MUSICAL") {
    advices.push(
      "Inscrire l'élève à un cours d'instrument ou de chant. Privilégier les méthodes d'apprentissage avec rythme.",
    );
  }
  if (topIntelligence === "INTRAPERSONAL") {
    advices.push(
      "Respecter le besoin de réflexion personnelle. Encourager la tenue d'un journal et la méditation.",
    );
  }

  // GPA-based advices
  if (weakSubjects.length > 0 && weakSubjects[0].gpa < 10) {
    advices.push(
      `Soutien recommandé en ${weakSubjects[0].name} (moyenne ${weakSubjects[0].gpa}/20). Envisager des cours particuliers ou tutorat.`,
    );
  }
  if (progressionLabel === "EN_BAISSE") {
    advices.push(
      "La moyenne est en baisse — entretien avec les parents recommandé pour identifier les causes (motivation, environnement, santé).",
    );
  }

  // ─── 5. Predict filière (orientation) ─────────────────────────────
  const filiereScores = FILIERE_PROFILES.map((f) => {
    let weightedSum = 0;
    let weightUsed = 0;
    for (const [code, weight] of Object.entries(f.subjectWeights)) {
      const subj = subjectAverages.find(
        (s) => grades.find((g) => g.subject.code === code)?.subject.name === s.name,
      );
      if (subj) {
        weightedSum += subj.gpa * weight;
        weightUsed += weight;
      }
    }
    const score = weightUsed > 0 ? weightedSum / weightUsed : 0;
    return { profile: f, score };
  })
    .sort((a, b) => b.score - a.score);

  const top = filiereScores[0];
  const second = filiereScores[1];

  const recommendedFilieres = filiereScores.slice(0, 3).map((f) => ({
    name: f.profile.name,
    confidence: Number(((f.score / 20) * 100).toFixed(0)),
    reasoning:
      f === top
        ? `Excellentes performances en matières clés (${top.score.toFixed(1)}/20 pondéré).`
        : `Bon potentiel à explorer comme alternative.`,
  }));

  // Filter to filières available at this school if provided
  const filteredFilieres =
    input.availableFilieres.length > 0
      ? recommendedFilieres.filter((f) =>
          input.availableFilieres.some((avail) =>
            f.name.toLowerCase().includes(avail.toLowerCase()),
          ),
        )
      : recommendedFilieres;

  const finalFilieres =
    filteredFilieres.length > 0 ? filteredFilieres : recommendedFilieres;

  // ─── 6. Career suggestions from top filière ───────────────────────
  const careerSuggestions = top.profile.careers.slice(0, 4).map((c) => ({
    title: c.title,
    filiere: top.profile.name,
    requiredStudies: c.studies,
  }));

  const universitySuggestions = top.profile.universities;

  // ─── 7. Final report ──────────────────────────────────────────────
  return {
    meta: {
      studentName: `${student.firstName} ${student.lastName}`,
      studentNameAr: `${student.firstNameAr ?? ""} ${student.lastNameAr ?? ""}`.trim(),
      className: student.className ?? "—",
      iq: {
        score: student.iqScore ?? null,
        interpretation: interpretIq(student.iqScore),
      },
      generatedAt: new Date().toISOString(),
    },
    academic: {
      gpaTrend,
      overallGpa,
      bestSubjects,
      weakSubjects,
      progressionLabel,
    },
    observations: observations.map((o) => ({
      teacherName: o.teacherName,
      subjectName: o.subjectName ?? "Général",
      observation: o.observation,
      advice: o.advice,
    })),
    profile: {
      intelligences: intelligencesScaled,
      learningStyle,
      learningStyleDescription,
      interests: splitCsv(student.interests),
      hobbies: splitCsv(student.hobbies),
      personalizedAdvices: advices,
    },
    prediction: {
      recommendedFilieres: finalFilieres,
      careerSuggestions,
      universitySuggestions,
    },
  };
}
