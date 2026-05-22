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
  // ↓ When the student has taken the EDURA Test on the tablet, these scores
  //   override the grade-based estimation. Keys come from the tablet's tests:
  //   "Linguistic" | "Logical-Mathematical" | "Spatial" | "Musical"
  //   | "Bodily-Kinesthetic" | "Interpersonal" | "Intrapersonal" | "Naturalist"
  testResultIntelligenceScores?: Record<string, number> | null;
  // ↓ Tablet signals used by the unified career-matching algorithm
  mbtiType?: string | null;                  // e.g. "ENFP"
  tabletCareerLiked?: string[] | null;       // career ids the student swiped right on
  tabletCareerTopMatch?: string | null;      // the tablet's suggested top career
};

// Map tablet intelligence keys to internal IntelligenceType
const TABLET_TO_INTERNAL: Record<string, IntelligenceType> = {
  Linguistic: "LINGUISTIC",
  "Logical-Mathematical": "LOGICAL",
  Spatial: "SPATIAL",
  Musical: "MUSICAL",
  "Bodily-Kinesthetic": "BODILY",
  Interpersonal: "INTERPERSONAL",
  Intrapersonal: "INTRAPERSONAL",
  Naturalist: "NATURALIST",
};

// ──────────────────────────────────────────────────────────────────────
// Career compatibility scaffolding (used by the unified career algorithm)
// ──────────────────────────────────────────────────────────────────────
//
// CAREER_PROFILE = per-career signals required for a "perfect fit":
//   - mbtiTypes   : MBTI types most naturally drawn to this work
//   - intelligence: dominant Gardner intelligence(s) the career calls upon
//   - subjectCode : academic subjects that must be strong (>= 12/20)
//   - minIqScore  : approximate minimum recommended IQ
//
// The unified score is a weighted sum of: filière match (academic) +
// MBTI fit + intelligence fit + IQ fit + expressed preference (tablet swipe)
// + teacher observations (intelligenceTags). It will never recommend
// "musician" for an academic-strong ENFP unless the student actively swiped
// right on it AND it's in their MBTI-compatible career set.

type CareerProfile = {
  id: string;            // matches tablet `careers.ts` ids
  title: string;
  studies: string;
  filiere: string;       // primary filière
  mbtiTypes: string[];   // MBTI codes that fit naturally
  intelligence: IntelligenceType[];
  subjectCodes: string[]; // subjects that should be strong
  minIqScore: number;    // soft floor
};

const CAREER_CATALOG: CareerProfile[] = [
  // ─── Scientific / Health ──────────────────────────────────────────
  { id: "doctor", title: "Médecin", studies: "Médecine — 7 ans",
    filiere: "Sciences expérimentales", mbtiTypes: ["ISTJ","ISFJ","INTJ","INFJ","ESTJ","ENFJ"],
    intelligence: ["LOGICAL","INTERPERSONAL","NATURALIST"], subjectCodes: ["svt","phys","math"], minIqScore: 110 },
  { id: "pharmacist", title: "Pharmacien(ne)", studies: "Pharmacie — 5 ans",
    filiere: "Sciences expérimentales", mbtiTypes: ["ISTJ","ISFJ","ESTJ"],
    intelligence: ["LOGICAL","NATURALIST"], subjectCodes: ["svt","phys"], minIqScore: 105 },
  { id: "nurse", title: "Infirmier(ère)", studies: "Sciences infirmières — 3 ans",
    filiere: "Sciences expérimentales", mbtiTypes: ["ISFJ","ESFJ","ENFJ","INFP"],
    intelligence: ["INTERPERSONAL","BODILY"], subjectCodes: ["svt"], minIqScore: 95 },
  { id: "veterinarian", title: "Vétérinaire", studies: "Vétérinaire — 6 ans",
    filiere: "Sciences expérimentales", mbtiTypes: ["ISFJ","INFJ","ISFP","INFP"],
    intelligence: ["NATURALIST","LOGICAL"], subjectCodes: ["svt"], minIqScore: 105 },
  { id: "psychologist", title: "Psychologue", studies: "Psychologie — 5 ans",
    filiere: "Sciences expérimentales", mbtiTypes: ["INFJ","INFP","ENFJ","ENFP","INTJ"],
    intelligence: ["INTERPERSONAL","INTRAPERSONAL"], subjectCodes: ["philo","svt"], minIqScore: 105 },
  { id: "biologist", title: "Biologiste", studies: "Sciences biologiques — 5 ans",
    filiere: "Sciences expérimentales", mbtiTypes: ["INTJ","INTP","ISFP","ISTP"],
    intelligence: ["NATURALIST","LOGICAL"], subjectCodes: ["svt","phys"], minIqScore: 105 },
  { id: "agronomist", title: "Agronome", studies: "Agronomie — 5 ans",
    filiere: "Sciences expérimentales", mbtiTypes: ["ISTP","ISFP","ESTP","ESTJ"],
    intelligence: ["NATURALIST","BODILY"], subjectCodes: ["svt"], minIqScore: 95 },

  // ─── Engineering / Tech ───────────────────────────────────────────
  { id: "engineer", title: "Ingénieur(e)", studies: "École polytechnique — 5 ans",
    filiere: "Mathématiques", mbtiTypes: ["INTJ","INTP","ISTJ","ISTP","ENTJ","ENTP"],
    intelligence: ["LOGICAL","SPATIAL"], subjectCodes: ["math","phys"], minIqScore: 110 },
  { id: "programmer", title: "Développeur(se) logiciel", studies: "Informatique — 5 ans",
    filiere: "Mathématiques", mbtiTypes: ["INTJ","INTP","ISTP","ENTP"],
    intelligence: ["LOGICAL","SPATIAL"], subjectCodes: ["math","info"], minIqScore: 105 },
  { id: "data_analyst", title: "Analyste de données", studies: "Stats / Data Science — 5 ans",
    filiere: "Mathématiques", mbtiTypes: ["INTJ","INTP","ISTJ","ENTJ"],
    intelligence: ["LOGICAL"], subjectCodes: ["math"], minIqScore: 110 },
  { id: "architect", title: "Architecte", studies: "Architecture — 6 ans",
    filiere: "Mathématiques", mbtiTypes: ["INTJ","INFJ","ISTP","ISFP","ENFP"],
    intelligence: ["SPATIAL","LOGICAL"], subjectCodes: ["math","art"], minIqScore: 105 },
  { id: "pilot", title: "Pilote", studies: "École d'aviation — 4 ans",
    filiere: "Mathématiques", mbtiTypes: ["ISTP","ESTP","ISTJ","ESTJ"],
    intelligence: ["SPATIAL","BODILY","LOGICAL"], subjectCodes: ["math","phys"], minIqScore: 110 },
  { id: "scientist", title: "Scientifique chercheur(se)", studies: "Doctorat — 8 ans",
    filiere: "Sciences expérimentales", mbtiTypes: ["INTJ","INTP"],
    intelligence: ["LOGICAL","NATURALIST"], subjectCodes: ["phys","math","svt"], minIqScore: 120 },
  { id: "electrician", title: "Électricien(ne)", studies: "Formation pro — 2 ans",
    filiere: "Sciences expérimentales", mbtiTypes: ["ISTP","ESTP","ISTJ"],
    intelligence: ["BODILY","LOGICAL"], subjectCodes: ["phys"], minIqScore: 90 },

  // ─── Letters / Languages / Law ────────────────────────────────────
  { id: "lawyer", title: "Avocat(e)", studies: "Droit — 5 ans",
    filiere: "Lettres et philosophie", mbtiTypes: ["ENTJ","ESTJ","ENTP","INTJ"],
    intelligence: ["LINGUISTIC","LOGICAL","INTERPERSONAL"], subjectCodes: ["philo","ar","fr"], minIqScore: 105 },
  { id: "writer", title: "Auteur(e) / Écrivain(e)", studies: "Lettres — 5 ans",
    filiere: "Lettres et philosophie", mbtiTypes: ["INFJ","INFP","INTJ","INTP","ENFP"],
    intelligence: ["LINGUISTIC","INTRAPERSONAL"], subjectCodes: ["ar","fr","philo"], minIqScore: 100 },
  { id: "journalist", title: "Journaliste", studies: "Sciences de l'information — 4 ans",
    filiere: "Lettres et philosophie", mbtiTypes: ["ENTP","ENFP","ENTJ","ESTP"],
    intelligence: ["LINGUISTIC","INTERPERSONAL"], subjectCodes: ["fr","ar","hg"], minIqScore: 100 },
  { id: "translator", title: "Traducteur(trice)", studies: "Traduction — 5 ans",
    filiere: "Langues étrangères", mbtiTypes: ["INFJ","ISFJ","ISTJ","INTJ"],
    intelligence: ["LINGUISTIC"], subjectCodes: ["fr","en","ar"], minIqScore: 100 },
  { id: "teacher", title: "Enseignant(e)", studies: "ENS — 4 ans",
    filiere: "Lettres et philosophie", mbtiTypes: ["ENFJ","ESFJ","ISFJ","INFJ"],
    intelligence: ["LINGUISTIC","INTERPERSONAL"], subjectCodes: ["fr","ar","math"], minIqScore: 95 },

  // ─── Business / Management ────────────────────────────────────────
  { id: "entrepreneur", title: "Entrepreneur(e)", studies: "École de commerce — 5 ans",
    filiere: "Gestion et économie", mbtiTypes: ["ENTJ","ENTP","ESTP","ENFP","INTJ"],
    intelligence: ["LOGICAL","INTERPERSONAL"], subjectCodes: ["math"], minIqScore: 105 },
  { id: "accountant", title: "Comptable", studies: "Comptabilité — 3 ans",
    filiere: "Gestion et économie", mbtiTypes: ["ISTJ","ESTJ","ISFJ"],
    intelligence: ["LOGICAL"], subjectCodes: ["math"], minIqScore: 95 },
  { id: "marketer", title: "Spécialiste en marketing", studies: "Marketing — 5 ans",
    filiere: "Gestion et économie", mbtiTypes: ["ENFP","ENTP","ESFP","ENFJ"],
    intelligence: ["LINGUISTIC","INTERPERSONAL"], subjectCodes: ["fr","en"], minIqScore: 100 },
  { id: "civil_servant", title: "Fonctionnaire", studies: "Administration publique — 3 ans",
    filiere: "Gestion et économie", mbtiTypes: ["ISTJ","ESTJ","ISFJ","ESFJ"],
    intelligence: ["LOGICAL","INTERPERSONAL"], subjectCodes: ["fr","ar"], minIqScore: 95 },

  // ─── Service / Civic ─────────────────────────────────────────────
  { id: "policeman", title: "Policier(ère)", studies: "École de police — 2 ans",
    filiere: "Gestion et économie", mbtiTypes: ["ISTJ","ESTJ","ISTP","ESTP"],
    intelligence: ["BODILY","INTERPERSONAL"], subjectCodes: ["fr","ar"], minIqScore: 95 },
  { id: "social_worker", title: "Travailleur(se) social(e)", studies: "Travail social — 3 ans",
    filiere: "Lettres et philosophie", mbtiTypes: ["ENFJ","INFJ","ESFJ","ISFJ"],
    intelligence: ["INTERPERSONAL"], subjectCodes: ["philo"], minIqScore: 95 },

  // ─── Arts (only chosen when MBTI + intelligence strongly support it) ─
  { id: "artist", title: "Artiste / Designer", studies: "Beaux-Arts — 4 ans",
    filiere: "Lettres et philosophie", mbtiTypes: ["ISFP","INFP","ESFP","ENFP"],
    intelligence: ["SPATIAL","MUSICAL"], subjectCodes: ["art"], minIqScore: 95 },
  { id: "musician", title: "Musicien(ne)", studies: "Conservatoire — 4 ans",
    filiere: "Lettres et philosophie", mbtiTypes: ["ISFP","INFP","ESFP","ENFP"],
    intelligence: ["MUSICAL"], subjectCodes: ["music","art"], minIqScore: 95 },
  { id: "filmmaker", title: "Cinéaste", studies: "École de cinéma — 4 ans",
    filiere: "Lettres et philosophie", mbtiTypes: ["INFJ","INFP","ENFP","ISFP"],
    intelligence: ["SPATIAL","LINGUISTIC"], subjectCodes: ["fr","art"], minIqScore: 100 },
  { id: "chef", title: "Chef cuisinier", studies: "École hôtelière — 3 ans",
    filiere: "Lettres et philosophie", mbtiTypes: ["ISFP","ESFP","ESTP","ISTP"],
    intelligence: ["BODILY","SPATIAL"], subjectCodes: [], minIqScore: 95 },
  { id: "athlete", title: "Athlète professionnel(le)", studies: "Sport-études — 4 ans",
    filiere: "Lettres et philosophie", mbtiTypes: ["ESTP","ISTP","ESFP","ISFP"],
    intelligence: ["BODILY"], subjectCodes: ["sport"], minIqScore: 90 },
];

// Score a single career against all known signals.
// Returns a [score, reasoning[]] tuple — reasoning is shown to the parent in the report.
function scoreCareerFor(
  c: CareerProfile,
  ctx: {
    bestSubjects: { name: string; gpa: number }[];
    weakSubjects: { name: string; gpa: number }[];
    subjectAvgByCode: Map<string, number>;
    mbtiType: string | null;
    topIntelligence: IntelligenceType | null;
    iqScore: number | null;
    tabletLiked: Set<string>;
    tabletTop: string | null;
    observationTags: Set<IntelligenceType>;
    topFiliereName: string;
  },
): { score: number; reasoning: string[] } {
  let score = 50; // baseline so unrelated careers don't tie at 0
  const reasoning: string[] = [];

  // 1. Filière alignment (the strongest signal — academic strength is everything)
  if (c.filiere === ctx.topFiliereName) {
    score += 40;
    reasoning.push(`aligné avec la filière recommandée (${c.filiere})`);
  } else {
    score -= 15; // discourage but don't kill
  }

  // 2. Subject performance — each required subject the student is strong in (>= 12/20)
  for (const code of c.subjectCodes) {
    const avg = ctx.subjectAvgByCode.get(code);
    if (typeof avg === "number") {
      if (avg >= 14) { score += 15; reasoning.push(`fort(e) en matière clé (${avg}/20)`); }
      else if (avg >= 12) { score += 7; }
      else if (avg < 10) { score -= 18; reasoning.push("faiblesse dans une matière clé du métier"); }
    }
  }

  // 3. MBTI fit
  if (ctx.mbtiType && c.mbtiTypes.length > 0) {
    if (c.mbtiTypes.includes(ctx.mbtiType)) {
      score += 25;
      reasoning.push(`compatible avec votre profil MBTI ${ctx.mbtiType}`);
    } else {
      score -= 12; // mismatch penalty (not fatal — interest can still win)
    }
  }

  // 4. Gardner intelligence fit
  if (ctx.topIntelligence && c.intelligence.includes(ctx.topIntelligence)) {
    score += 18;
    reasoning.push(`fait appel à l'intelligence dominante (${ctx.topIntelligence.toLowerCase()})`);
  }

  // 5. IQ tier
  if (ctx.iqScore != null) {
    const gap = ctx.iqScore - c.minIqScore;
    if (gap >= 0) score += Math.min(10, Math.round(gap / 3));
    else score -= Math.min(25, Math.abs(gap)); // hard penalty for under-IQ
  }

  // 6. Tablet "expressed preference"
  if (ctx.tabletTop === c.id) { score += 12; reasoning.push("choix exprimé sur la tablette EDURA Test"); }
  else if (ctx.tabletLiked.has(c.id)) { score += 6; reasoning.push("apprécié(e) sur la tablette"); }

  // 7. Teacher observation tags
  if (ctx.topIntelligence && ctx.observationTags.has(ctx.topIntelligence)) {
    score += 5;
  }

  return { score, reasoning };
}

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
      reasoning?: string;
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
  // PRIORITY 1: if the student took the EDURA Test on the tablet, use those
  // direct intelligence scores (they're far more reliable than grade-based estimation).
  const tabletScores = input.testResultIntelligenceScores;
  const useTabletScores =
    !!tabletScores && Object.values(tabletScores).some((v) => typeof v === "number" && v > 0);

  // Base score from grade performance per subject domain
  const intelligenceScores = new Map<IntelligenceType, number>();
  const intelligenceCounts = new Map<IntelligenceType, number>();

  if (useTabletScores) {
    // Tablet scores are already 0-100 percentages
    (Object.keys(INTELLIGENCE_LABELS) as IntelligenceType[]).forEach((i) => {
      intelligenceScores.set(i, 0);
      intelligenceCounts.set(i, 1);
    });
    for (const [tabletKey, val] of Object.entries(tabletScores!)) {
      const internal = TABLET_TO_INTERNAL[tabletKey];
      if (internal && typeof val === "number") {
        intelligenceScores.set(internal, val);
      }
    }
  } else {
    // Initialize all intelligences to a baseline (grade-based fallback)
    (Object.keys(INTELLIGENCE_LABELS) as IntelligenceType[]).forEach((i) => {
      intelligenceScores.set(i, 30); // baseline 30%
      intelligenceCounts.set(i, 1);
    });
  }

  if (!useTabletScores) {
    // Boost based on subject performance (only when we don't have direct tablet scores)
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
  }

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

  // ─── 6. Unified career suggestions — combines ALL signals ────────────
  //     filière strength + MBTI fit + Gardner intelligence + IQ tier +
  //     tablet swipe preferences + teacher observations
  const subjectAvgByCode = new Map<string, number>();
  subjectAverages.forEach((s) => {
    const code = grades.find((g) => g.subject.name === s.name)?.subject.code;
    if (code) subjectAvgByCode.set(code, s.gpa);
  });

  const observationTagsSet = new Set<IntelligenceType>();
  observations.forEach((o) => {
    if (!o.intelligenceTags) return;
    splitCsv(o.intelligenceTags).forEach((tag) => {
      const t = tag.toUpperCase() as IntelligenceType;
      if (INTELLIGENCE_LABELS[t]) observationTagsSet.add(t);
    });
  });

  const careerCtx = {
    bestSubjects,
    weakSubjects,
    subjectAvgByCode,
    mbtiType: input.mbtiType ?? null,
    topIntelligence: intelligencesScaled[0]?.type ?? null,
    iqScore: student.iqScore ?? null,
    tabletLiked: new Set(input.tabletCareerLiked ?? []),
    tabletTop: input.tabletCareerTopMatch ?? null,
    observationTags: observationTagsSet,
    topFiliereName: top.profile.name,
  };

  const scoredCareers = CAREER_CATALOG.map((c) => {
    const { score, reasoning } = scoreCareerFor(c, careerCtx);
    return { ...c, score, reasoning };
  }).sort((a, b) => b.score - a.score);

  // Take top 4, but ensure we always include the top filière's best academic match
  // (so the academic signal is never drowned by a swipe-only preference).
  const topCareers = scoredCareers.slice(0, 4);

  const careerSuggestions = topCareers.map((c) => ({
    title: c.title,
    filiere: c.filiere,
    requiredStudies: c.studies,
    reasoning: c.reasoning.length > 0
      ? c.reasoning.slice(0, 3).join(" · ")
      : "Profil global compatible",
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
