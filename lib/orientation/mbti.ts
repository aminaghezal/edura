/**
 * EDURA — MBTI (Myers-Briggs Type Indicator) Analysis
 *
 * Le MBTI est un indicateur de personnalité basé sur la théorie psychologique
 * de Carl Jung (Types Psychologiques, 1921) opérationnalisé par Katharine Cook
 * Briggs et Isabel Briggs Myers (1944). Il évalue 4 dimensions :
 *
 *   1. Énergie:        E (Extraversion) ↔ I (Introversion)
 *   2. Information:    S (Sensation)    ↔ N (Intuition)
 *   3. Décision:       T (Thinking)     ↔ F (Feeling)
 *   4. Mode de vie:    J (Judging)      ↔ P (Perceiving)
 *
 * Combinaison → 16 types (INTJ, ENFP, ISTJ, etc.).
 *
 * Note académique : Le MBTI est un outil pédagogique populaire largement
 * utilisé en orientation scolaire, bien que sa validité scientifique stricte
 * soit débattue. Il est utilisé ici comme indicateur indicatif, pas comme
 * diagnostic clinique.
 */

export type MBTIType =
  | "INTJ" | "INTP" | "ENTJ" | "ENTP"  // Analystes (NT)
  | "INFJ" | "INFP" | "ENFJ" | "ENFP"  // Diplomates (NF)
  | "ISTJ" | "ISFJ" | "ESTJ" | "ESFJ"  // Sentinelles (SJ)
  | "ISTP" | "ISFP" | "ESTP" | "ESFP"; // Explorateurs (SP)

export type MBTIDimension = {
  axis: "EI" | "SN" | "TF" | "JP";
  letterLeft: string;
  letterRight: string;
  labelLeft: string;
  labelRight: string;
  leftPct: number;  // Si > 50, c'est la gauche qui domine
  rightPct: number;
  description: string;
};

export type MBTIProfile = {
  type: MBTIType | null;
  nickname: string;
  category: "Analystes" | "Diplomates" | "Sentinelles" | "Explorateurs";
  description: string;
  strengths: string[];
  weaknesses: string[];
  dimensions: MBTIDimension[];
  recommendedCareers: string[];
  recommendedFilieres: string[];
  compatibleIntelligences: string[];
  studyAdvice: string;
};

const MBTI_DATA: Record<MBTIType, Omit<MBTIProfile, "type" | "dimensions">> = {
  // ═══ ANALYSTES (NT) ═══
  INTJ: {
    nickname: "L'Architecte",
    category: "Analystes",
    description: "Stratège imaginatif aux plans pour tout. Indépendant, déterminé, profondément réfléchi. Apprécie les défis intellectuels complexes et les systèmes logiques.",
    strengths: ["Pensée stratégique", "Autonomie", "Vision long terme", "Esprit analytique aiguisé"],
    weaknesses: ["Peut paraître distant", "Perfectionniste", "Difficulté à exprimer émotions"],
    recommendedCareers: ["Ingénieur logiciel", "Chercheur scientifique", "Architecte", "Analyste financier", "Médecin spécialiste"],
    recommendedFilieres: ["Mathématiques", "Sciences expérimentales", "Gestion et économie"],
    compatibleIntelligences: ["Logique-Mathématique", "Intrapersonnelle", "Visuo-Spatiale"],
    studyAdvice: "Privilégier l'étude en solitaire avec des objectifs clairs. Excellent pour les projets long terme. Donner du temps pour analyser en profondeur.",
  },
  INTP: {
    nickname: "Le Logicien",
    category: "Analystes",
    description: "Innovateur curieux à la soif insatiable de connaissance. Théoricien passionné par les idées abstraites et les modèles complexes.",
    strengths: ["Créativité intellectuelle", "Pensée originale", "Capacité d'abstraction", "Curiosité scientifique"],
    weaknesses: ["Peu intéressé par la routine", "Procrastination", "Distrait par trop d'idées"],
    recommendedCareers: ["Mathématicien", "Programmeur", "Physicien théoricien", "Philosophe", "Inventeur"],
    recommendedFilieres: ["Mathématiques", "Sciences expérimentales", "Lettres et philosophie"],
    compatibleIntelligences: ["Logique-Mathématique", "Linguistique", "Intrapersonnelle"],
    studyAdvice: "Stimuler avec des problèmes ouverts et théoriques. Donner liberté d'exploration. Éviter les méthodes répétitives.",
  },
  ENTJ: {
    nickname: "Le Commandant",
    category: "Analystes",
    description: "Leader audacieux et imaginatif. Toujours capable de trouver — ou de créer — un moyen. Naturellement enclin à diriger et à organiser.",
    strengths: ["Leadership naturel", "Décision rapide", "Orienté résultats", "Charismatique"],
    weaknesses: ["Impatient", "Peut être autoritaire", "Difficulté à montrer empathie"],
    recommendedCareers: ["Chef d'entreprise", "Avocat", "Consultant en stratégie", "Directeur exécutif", "Politicien"],
    recommendedFilieres: ["Gestion et économie", "Mathématiques", "Lettres et philosophie"],
    compatibleIntelligences: ["Interpersonnelle", "Logique-Mathématique", "Linguistique"],
    studyAdvice: "Donner des rôles de leadership en groupe. Apprécier les défis compétitifs. Combiner théorie et application pratique.",
  },
  ENTP: {
    nickname: "L'Innovateur",
    category: "Analystes",
    description: "Penseur intelligent et curieux qui ne peut résister à un défi intellectuel. Agile, énergique et débateur passionné.",
    strengths: ["Esprit vif", "Polyvalence", "Charisme intellectuel", "Adaptabilité"],
    weaknesses: ["Difficile à se concentrer", "Argumentatif", "Peut paraître insensible"],
    recommendedCareers: ["Entrepreneur", "Avocat", "Inventeur", "Journaliste", "Consultant créatif"],
    recommendedFilieres: ["Lettres et philosophie", "Gestion et économie", "Langues étrangères"],
    compatibleIntelligences: ["Linguistique", "Interpersonnelle", "Logique-Mathématique"],
    studyAdvice: "Encourager les débats et la pensée critique. Variété de matières. Projets stimulants intellectuellement.",
  },

  // ═══ DIPLOMATES (NF) ═══
  INFJ: {
    nickname: "L'Avocat",
    category: "Diplomates",
    description: "Inspirant et infatigable idéaliste. Profondément attentif aux autres, créatif et déterminé à faire du monde un endroit meilleur.",
    strengths: ["Empathie profonde", "Vision idéaliste", "Créativité", "Conviction morale"],
    weaknesses: ["Trop sensible", "Perfectionniste", "Risque de burn-out"],
    recommendedCareers: ["Psychologue", "Conseiller", "Enseignant", "Écrivain", "Médecin humanitaire"],
    recommendedFilieres: ["Lettres et philosophie", "Langues étrangères", "Sciences expérimentales"],
    compatibleIntelligences: ["Intrapersonnelle", "Interpersonnelle", "Linguistique"],
    studyAdvice: "Lier les apprentissages à un sens profond. Encourager la créativité et le service aux autres.",
  },
  INFP: {
    nickname: "Le Médiateur",
    category: "Diplomates",
    description: "Poétique, gentil et altruiste, toujours désireux d'aider une bonne cause. Vit selon ses valeurs profondes.",
    strengths: ["Empathie", "Créativité artistique", "Idéalisme", "Authenticité"],
    weaknesses: ["Trop idéaliste", "Difficulté avec la critique", "Procrastination"],
    recommendedCareers: ["Écrivain", "Psychologue", "Artiste", "Travailleur humanitaire", "Designer"],
    recommendedFilieres: ["Lettres et philosophie", "Langues étrangères"],
    compatibleIntelligences: ["Linguistique", "Intrapersonnelle", "Visuo-Spatiale"],
    studyAdvice: "Encourager l'écriture créative et l'expression personnelle. Éviter les méthodes trop rigides.",
  },
  ENFJ: {
    nickname: "Le Protagoniste",
    category: "Diplomates",
    description: "Leader charismatique et inspirant, capable de captiver son auditoire. Naturellement orienté vers les autres et la croissance collective.",
    strengths: ["Communication", "Leadership inspirant", "Empathie", "Charisme"],
    weaknesses: ["Trop altruiste", "Sensible aux critiques", "Difficulté à dire non"],
    recommendedCareers: ["Enseignant", "Politicien", "Coach", "Diplomate", "Manager RH"],
    recommendedFilieres: ["Langues étrangères", "Lettres et philosophie", "Gestion et économie"],
    compatibleIntelligences: ["Interpersonnelle", "Linguistique", "Intrapersonnelle"],
    studyAdvice: "Travail en groupe excellent. Activités de mentorat. Présentations orales.",
  },
  ENFP: {
    nickname: "L'Inspirateur",
    category: "Diplomates",
    description: "Esprit libre enthousiaste, créatif et sociable, qui trouve toujours une raison de sourire. Passionné de nouvelles expériences.",
    strengths: ["Enthousiasme", "Créativité", "Sociabilité", "Adaptabilité"],
    weaknesses: ["Difficulté à se concentrer", "Stress facile", "Procrastination"],
    recommendedCareers: ["Journaliste", "Communicant", "Acteur", "Entrepreneur créatif", "Designer"],
    recommendedFilieres: ["Langues étrangères", "Lettres et philosophie"],
    compatibleIntelligences: ["Linguistique", "Interpersonnelle", "Musicale"],
    studyAdvice: "Méthodes variées et stimulantes. Apprentissage par projets. Encourager créativité.",
  },

  // ═══ SENTINELLES (SJ) ═══
  ISTJ: {
    nickname: "Le Logisticien",
    category: "Sentinelles",
    description: "Fiable et pratique, dont les faits ne peuvent pas être remis en question. Méthodique, structuré et profondément responsable.",
    strengths: ["Fiabilité", "Organisation", "Rigueur", "Sens du devoir"],
    weaknesses: ["Rigidité", "Difficulté à exprimer émotions", "Résistance au changement"],
    recommendedCareers: ["Expert-comptable", "Ingénieur civil", "Administrateur", "Militaire", "Juge"],
    recommendedFilieres: ["Mathématiques", "Gestion et économie", "Sciences expérimentales"],
    compatibleIntelligences: ["Logique-Mathématique", "Intrapersonnelle", "Naturaliste"],
    studyAdvice: "Méthodes structurées et systématiques. Plans d'étude détaillés. Excellent pour les sciences exactes.",
  },
  ISFJ: {
    nickname: "Le Défenseur",
    category: "Sentinelles",
    description: "Protecteur très dévoué et chaleureux, toujours prêt à défendre ses proches. Loyal, attentif et patient.",
    strengths: ["Loyauté", "Attention aux détails", "Patience", "Sensibilité"],
    weaknesses: ["Trop modeste", "Sacrifice de soi", "Difficulté à dire non"],
    recommendedCareers: ["Infirmier(e)", "Enseignant primaire", "Pharmacien", "Travailleur social", "Bibliothécaire"],
    recommendedFilieres: ["Sciences expérimentales", "Lettres et philosophie", "Langues étrangères"],
    compatibleIntelligences: ["Interpersonnelle", "Intrapersonnelle", "Naturaliste"],
    studyAdvice: "Apprentissage par étapes claires. Travailler avec d'autres en cadre supportif. Reconnaissance régulière.",
  },
  ESTJ: {
    nickname: "Le Directeur",
    category: "Sentinelles",
    description: "Administrateur excellent, sans pareil pour gérer des choses ou des personnes. Pratique, traditionaliste et orienté résultats.",
    strengths: ["Leadership organisationnel", "Honnêteté", "Sens des responsabilités", "Efficacité"],
    weaknesses: ["Inflexible", "Difficulté à exprimer émotions", "Impatience"],
    recommendedCareers: ["Directeur d'entreprise", "Officier de police", "Avocat", "Juge", "Banquier"],
    recommendedFilieres: ["Gestion et économie", "Mathématiques"],
    compatibleIntelligences: ["Interpersonnelle", "Logique-Mathématique"],
    studyAdvice: "Buts clairs et mesurables. Apprécier les compétitions structurées. Rôles de coordination.",
  },
  ESFJ: {
    nickname: "Le Consul",
    category: "Sentinelles",
    description: "Personnage extraordinairement attentif, sociable et populaire, toujours prêt à aider. Harmonieux et attentif au bien-être collectif.",
    strengths: ["Sociabilité", "Attention aux autres", "Loyauté", "Sens du devoir"],
    weaknesses: ["Sensible aux critiques", "Difficulté avec changement", "Trop attentif aux opinions"],
    recommendedCareers: ["Enseignant", "Médecin généraliste", "Infirmier(e)", "Manager RH", "Hôtelier"],
    recommendedFilieres: ["Sciences expérimentales", "Langues étrangères", "Lettres et philosophie"],
    compatibleIntelligences: ["Interpersonnelle", "Linguistique", "Intrapersonnelle"],
    studyAdvice: "Apprentissage collaboratif. Environnement positif et structuré. Encouragement régulier.",
  },

  // ═══ EXPLORATEURS (SP) ═══
  ISTP: {
    nickname: "Le Virtuose",
    category: "Explorateurs",
    description: "Expérimentateur audacieux et pratique, maître de toutes sortes d'outils. Curieux, observateur et habile manuellement.",
    strengths: ["Habileté technique", "Pragmatisme", "Calme sous pression", "Adaptabilité"],
    weaknesses: ["Difficulté à s'engager long terme", "Privé", "Peut paraître insensible"],
    recommendedCareers: ["Mécanicien", "Ingénieur", "Pilote", "Chirurgien", "Technicien"],
    recommendedFilieres: ["Mathématiques", "Sciences expérimentales", "Gestion et économie"],
    compatibleIntelligences: ["Kinesthésique", "Logique-Mathématique", "Visuo-Spatiale"],
    studyAdvice: "Apprentissage pratique et manuel. Démontrer comment les choses fonctionnent. Travaux pratiques.",
  },
  ISFP: {
    nickname: "L'Aventurier",
    category: "Explorateurs",
    description: "Artiste flexible et charmant, toujours prêt à explorer quelque chose de nouveau. Sensible, créatif et appréciant la beauté.",
    strengths: ["Créativité artistique", "Sensibilité", "Adaptabilité", "Authenticité"],
    weaknesses: ["Difficulté planification long terme", "Sensible aux conflits", "Réservé"],
    recommendedCareers: ["Artiste", "Designer", "Vétérinaire", "Photographe", "Musicien"],
    recommendedFilieres: ["Lettres et philosophie", "Langues étrangères", "Sciences expérimentales"],
    compatibleIntelligences: ["Visuo-Spatiale", "Musicale", "Naturaliste", "Kinesthésique"],
    studyAdvice: "Approche créative et sensorielle. Encourager arts et expression. Liberté d'exploration.",
  },
  ESTP: {
    nickname: "L'Entrepreneur",
    category: "Explorateurs",
    description: "Personne intelligente, énergique et très perspicace qui aime vraiment vivre sur le fil du rasoir. Sociable et orienté action.",
    strengths: ["Pragmatisme", "Énergie", "Sociabilité", "Adaptabilité rapide"],
    weaknesses: ["Impulsivité", "Difficulté avec théorie", "Impatience"],
    recommendedCareers: ["Entrepreneur", "Commercial", "Sportif professionnel", "Policier", "Médecin urgentiste"],
    recommendedFilieres: ["Gestion et économie", "Mathématiques", "Sciences expérimentales"],
    compatibleIntelligences: ["Kinesthésique", "Interpersonnelle", "Logique-Mathématique"],
    studyAdvice: "Apprentissage actif et compétitif. Jeux de rôle, simulations. Éviter trop de théorie pure.",
  },
  ESFP: {
    nickname: "L'Animateur",
    category: "Explorateurs",
    description: "Animateur spontané, énergique et enthousiaste — la vie n'est jamais ennuyeuse en sa présence. Sociable et orienté présent.",
    strengths: ["Charisme", "Spontanéité", "Sens artistique", "Esprit positif"],
    weaknesses: ["Difficulté avec planification", "Sensible aux conflits", "Évite la théorie"],
    recommendedCareers: ["Acteur", "Animateur TV", "Musicien", "Conseiller en image", "Coach sportif"],
    recommendedFilieres: ["Langues étrangères", "Lettres et philosophie"],
    compatibleIntelligences: ["Musicale", "Interpersonnelle", "Kinesthésique", "Linguistique"],
    studyAdvice: "Apprentissage par l'expérience et le jeu. Travail en groupe stimulant. Reconnaissance immédiate.",
  },
};

/**
 * Compute MBTI dimensions percentages based on type letters.
 * Since we only have the final type (not the test scores), we use
 * standardized values (75/25 for the dominant letter).
 */
function buildDimensions(type: MBTIType): MBTIDimension[] {
  const [e, s, t, j] = type.split("");
  return [
    {
      axis: "EI",
      letterLeft: "E", letterRight: "I",
      labelLeft: "Extraversion", labelRight: "Introversion",
      leftPct: e === "E" ? 75 : 25,
      rightPct: e === "E" ? 25 : 75,
      description: e === "E"
        ? "Tire son énergie des interactions sociales et de l'action externe."
        : "Recharge son énergie dans la solitude et la réflexion interne.",
    },
    {
      axis: "SN",
      letterLeft: "S", letterRight: "N",
      labelLeft: "Sensation", labelRight: "Intuition",
      leftPct: s === "S" ? 75 : 25,
      rightPct: s === "S" ? 25 : 75,
      description: s === "S"
        ? "Privilégie les faits concrets, les détails et l'expérience directe."
        : "Voit les modèles, les possibilités futures et les concepts abstraits.",
    },
    {
      axis: "TF",
      letterLeft: "T", letterRight: "F",
      labelLeft: "Pensée", labelRight: "Sentiment",
      leftPct: t === "T" ? 75 : 25,
      rightPct: t === "T" ? 25 : 75,
      description: t === "T"
        ? "Prend ses décisions sur la logique, les principes objectifs et la cohérence."
        : "Décide en tenant compte des valeurs, de l'harmonie et des impacts humains.",
    },
    {
      axis: "JP",
      letterLeft: "J", letterRight: "P",
      labelLeft: "Jugement", labelRight: "Perception",
      leftPct: j === "J" ? 75 : 25,
      rightPct: j === "J" ? 25 : 75,
      description: j === "J"
        ? "Préfère la structure, la planification et les décisions définitives."
        : "Aime la flexibilité, garder les options ouvertes et l'adaptation.",
    },
  ];
}

export function generateMBTIProfile(type: string | null | undefined): MBTIProfile | null {
  if (!type) return null;
  const t = type.toUpperCase() as MBTIType;
  if (!MBTI_DATA[t]) return null;

  return {
    type: t,
    ...MBTI_DATA[t],
    dimensions: buildDimensions(t),
  };
}

export const ALL_MBTI_TYPES: { type: MBTIType; nickname: string; category: string }[] =
  (Object.keys(MBTI_DATA) as MBTIType[]).map((t) => ({
    type: t,
    nickname: MBTI_DATA[t].nickname,
    category: MBTI_DATA[t].category,
  }));
