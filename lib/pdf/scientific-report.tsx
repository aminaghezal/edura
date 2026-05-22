/**
 * EDURA — Scientific Student Report PDF (4 pages)
 *
 * Page 1 : Cover + Synthèse Académique + Commentaires Enseignants
 * Page 2 : Profil Psychopédagogique (intelligences + style apprentissage + conseils)
 * Page 3 : Prédiction Orientation + Métiers + Universités algériennes détaillées
 * Page 4 : Vision EDURA — Institution Tridimensionnelle
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Rect,
  Circle,
  Path,
  G,
  Image,
} from "@react-pdf/renderer";
import type { ScientificReport } from "@/lib/orientation/profile";
import type { MBTIProfile } from "@/lib/orientation/mbti";

const COLORS = {
  emerald: "#16A34A",
  emeraldDark: "#15803D",
  red: "#DC2626",
  redDark: "#B91C1C",
  amber: "#F59E0B",
  amberDark: "#D97706",
  purple: "#9333EA",
  purpleDark: "#7E22CE",
  indigo: "#4F46E5",
  indigoDark: "#3730A3",
  text: "#0F172A",
  muted: "#64748B",
  mutedLight: "#94A3B8",
  border: "#E2E8F0",
  bg: "#F8FAFC",
  white: "#FFFFFF",
};

const styles = StyleSheet.create({
  page: {
    padding: 28,
    paddingBottom: 36,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: COLORS.text,
  },
  // ──── COVER HEADER ────
  coverHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
    padding: 12,
    backgroundColor: "#EEF2FF",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.indigo,
  },
  brandBox: {
    width: 56,
    height: 56,
    backgroundColor: COLORS.indigo,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    color: COLORS.white,
  },
  brandText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 700,
    textAlign: "center",
  },
  brandSub: {
    color: COLORS.white,
    fontSize: 6,
    opacity: 0.8,
    marginTop: 1,
  },
  reportTitleBox: {
    flex: 1,
    paddingLeft: 12,
    textAlign: "center",
  },
  reportTitleAr: {
    fontSize: 9,
    fontWeight: 700,
    color: COLORS.indigoDark,
    textAlign: "center",
  },
  reportTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginTop: 3,
    textAlign: "center",
  },
  reportSubtitle: {
    fontSize: 8,
    color: COLORS.muted,
    marginTop: 2,
    textAlign: "center",
  },
  reportMotto: {
    fontSize: 7,
    fontStyle: "italic",
    color: COLORS.indigo,
    marginTop: 4,
    textAlign: "center",
  },
  studentInfoBox: {
    width: 150,
    padding: 8,
    backgroundColor: COLORS.white,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  studentPhotoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  studentPhoto: {
    width: 60,
    height: 60,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.indigo,
    objectFit: "cover",
  },
  studentPhotoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.indigo,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  studentPhotoInitial: {
    fontSize: 28,
    fontWeight: 700,
    color: COLORS.indigo,
  },
  studentInfoRow: { fontSize: 8, marginBottom: 2 },
  studentInfoLabel: { color: COLORS.muted, fontSize: 7 },
  studentInfoValue: { fontWeight: 700, fontSize: 9 },

  // ──── SECTION BANNERS ────
  sectionBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "7 10",
    marginTop: 12,
    marginBottom: 6,
    borderRadius: 4,
  },
  sectionBannerText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionBannerTextAr: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: 700,
    opacity: 0.85,
  },
  sectionNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.25)",
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 700,
    textAlign: "center",
    paddingTop: 3,
    marginRight: 8,
  },

  // ──── GENERIC ────
  row: { flexDirection: "row" },
  col: { flex: 1 },
  twoCol: { flex: 1, marginRight: 8 },
  subheading: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 4,
  },
  text: {
    fontSize: 8,
    lineHeight: 1.4,
  },
  textSmall: { fontSize: 7, lineHeight: 1.4 },
  muted: { color: COLORS.muted, fontSize: 8 },
  bold: { fontWeight: 700 },

  // ──── CARDS ────
  card: {
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  obsCard: {
    padding: 8,
    backgroundColor: "#FEF2F2",
    borderLeftWidth: 3,
    borderLeftColor: COLORS.red,
    borderRadius: 4,
    marginBottom: 4,
  },
  obsTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: COLORS.red,
    textTransform: "uppercase",
  },
  obsBody: { fontSize: 8, marginTop: 2 },
  obsSignature: {
    fontSize: 7,
    fontStyle: "italic",
    color: COLORS.muted,
    marginTop: 3,
    textAlign: "right",
  },

  // ──── INTERPRETATION BOXES ────
  interpretBox: {
    padding: 7,
    borderRadius: 4,
    marginTop: 4,
    marginBottom: 6,
    borderWidth: 1,
  },
  interpretTitle: {
    fontSize: 7,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  interpretText: { fontSize: 7, lineHeight: 1.4 },

  // ──── INTELLIGENCE BARS ────
  intelligenceBar: {
    height: 8,
    backgroundColor: "#FEF3C7",
    borderRadius: 4,
    marginTop: 2,
    overflow: "hidden",
  },
  intelligenceFill: {
    height: 8,
    borderRadius: 4,
  },

  // ──── ORIENTATION ────
  filiereCard: {
    padding: 8,
    backgroundColor: "#FAF5FF",
    borderLeftWidth: 3,
    borderLeftColor: COLORS.purple,
    borderRadius: 4,
    marginBottom: 5,
  },
  filiereHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  confidenceBadge: {
    backgroundColor: COLORS.purple,
    color: COLORS.white,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 7,
    fontWeight: 700,
  },
  careerCard: {
    padding: 6,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E9D5FF",
    borderRadius: 4,
    marginBottom: 4,
  },
  universityPill: {
    backgroundColor: "#F3E8FF",
    color: COLORS.purpleDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 7,
    fontWeight: 700,
    marginRight: 4,
    marginBottom: 4,
  },

  // ──── VISION PAGE ────
  visionHeader: {
    backgroundColor: COLORS.indigoDark,
    color: COLORS.white,
    padding: 14,
    marginBottom: 12,
    borderRadius: 6,
  },
  visionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: COLORS.white,
  },
  visionSubtitle: {
    fontSize: 9,
    color: COLORS.white,
    opacity: 0.85,
    marginTop: 4,
  },
  visionMotto: {
    fontSize: 9,
    fontStyle: "italic",
    color: COLORS.amber,
    marginTop: 8,
  },
  visionSection: {
    marginBottom: 14,
  },
  visionSectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.indigoDark,
    marginBottom: 5,
  },
  poleBox: {
    flex: 1,
    padding: 8,
    borderRadius: 4,
    marginRight: 4,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  poleTitle: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  poleBullet: {
    fontSize: 7,
    marginBottom: 2,
    paddingLeft: 8,
  },
  dimensionCard: {
    flex: 1,
    padding: 8,
    borderRadius: 4,
    marginRight: 4,
    borderLeftWidth: 3,
  },
  dimensionLabel: {
    fontSize: 7,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  dimensionDesc: { fontSize: 7, marginTop: 3, lineHeight: 1.3 },

  // ──── FOOTER ────
  footer: {
    position: "absolute",
    bottom: 14,
    left: 28,
    right: 28,
    fontSize: 7,
    color: COLORS.muted,
    textAlign: "center",
    paddingTop: 5,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
  },
});

// ──────────────────────────────────────────────────────────────────────
// Helper components
// ──────────────────────────────────────────────────────────────────────

function SectionBanner({
  n,
  title,
  titleAr,
  color,
}: {
  n: number;
  title: string;
  titleAr: string;
  color: string;
}) {
  return (
    <View style={[styles.sectionBanner, { backgroundColor: color }]}>
      <View style={[styles.row, { alignItems: "center" }]}>
        <Text style={styles.sectionNumber}>{n}</Text>
        <Text style={styles.sectionBannerText}>{title}</Text>
      </View>
      <Text style={styles.sectionBannerTextAr}>{titleAr}</Text>
    </View>
  );
}

function InterpretBox({
  title,
  text,
  borderColor,
  bg,
  titleColor,
}: {
  title: string;
  text: string;
  borderColor: string;
  bg: string;
  titleColor: string;
}) {
  return (
    <View style={[styles.interpretBox, { backgroundColor: bg, borderColor: borderColor }]}>
      <Text style={[styles.interpretTitle, { color: titleColor }]}>
        Pour mieux comprendre : {title}
      </Text>
      <Text style={styles.interpretText}>{text}</Text>
    </View>
  );
}

// Simple line chart SVG for GPA trend
function GpaSparkline({ data, width = 200, height = 60 }: {
  data: { trimester: number; gpa: number }[];
  width?: number;
  height?: number;
}) {
  if (data.length < 2) return null;
  const maxGpa = 20;
  const padding = 8;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const step = innerW / (data.length - 1);

  const points = data.map((d, i) => ({
    x: padding + i * step,
    y: padding + innerH - (d.gpa / maxGpa) * innerH,
  }));

  const path = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  return (
    <Svg width={width} height={height}>
      {/* Grid line at 10/20 (passing threshold) */}
      <G>
        <Path
          d={`M ${padding} ${padding + innerH * 0.5} L ${width - padding} ${padding + innerH * 0.5}`}
          stroke="#E2E8F0"
          strokeWidth={0.5}
          strokeDasharray="3 3"
        />
      </G>
      {/* GPA line */}
      <Path d={path} stroke={COLORS.emerald} strokeWidth={2} fill="none" />
      {/* Points */}
      {points.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={3} fill={COLORS.emerald} />
      ))}
    </Svg>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Main PDF component
// ──────────────────────────────────────────────────────────────────────

export type TabletTestResultPdf = {
  mbtiType: string | null;
  mbtiScores: { E?: number; I?: number; S?: number; N?: number; T?: number; F?: number; J?: number; P?: number } | null;
  iqScore: number | null;
  iqLevel: string | null;
  iqPercentile: number | null;
  dominantIntelligence: string | null;
  intelligenceScores: Record<string, number> | null;
  careerLiked: string[] | null;
  careerTopMatch: string | null;
  submittedAt: string;
};

export type ScientificPdfProps = {
  report: ScientificReport;
  mbti: MBTIProfile | null;
  photoUrl?: string | null;
  school: { name: string; wilaya: string; director: string };
  year: string;
  testResult?: TabletTestResultPdf | null;
};

// Career id → French label (mirror of the tablet's careers.ts)
const CAREER_FR_PDF: Record<string, string> = {
  doctor: "Medecin", engineer: "Ingenieur(e)", teacher: "Enseignant(e)",
  artist: "Artiste / Designer", lawyer: "Avocat(e)", pilot: "Pilote",
  chef: "Chef cuisinier", programmer: "Developpeur(se) logiciel",
  psychologist: "Psychologue", architect: "Architecte",
  journalist: "Journaliste", scientist: "Scientifique", entrepreneur: "Entrepreneur(e)",
  musician: "Musicien(ne)", nurse: "Infirmier(ere)",
  athlete: "Athlete professionnel(le)", accountant: "Comptable",
  biologist: "Biologiste", social_worker: "Travailleur(se) social(e)",
  marketer: "Specialiste en marketing", pharmacist: "Pharmacien(ne)",
  writer: "Auteur(e) / Ecrivain(e)", veterinarian: "Veterinaire",
  data_analyst: "Analyste de donnees", translator: "Traducteur(trice)",
  policeman: "Policier(ere)", filmmaker: "Cineaste", agronomist: "Agronome",
  civil_servant: "Fonctionnaire", electrician: "Electricien(ne)",
};

const INTEL_FR_PDF: Record<string, string> = {
  Linguistic: "Linguistique",
  "Logical-Mathematical": "Logico-mathematique",
  Spatial: "Visuo-spatial",
  Musical: "Musical",
  "Bodily-Kinesthetic": "Corporel-kinesthesique",
  Interpersonal: "Interpersonnel",
  Intrapersonal: "Intrapersonnel",
  Naturalist: "Naturaliste",
};

export function ScientificReportPdf({
  report,
  mbti,
  photoUrl,
  school,
  year,
  testResult,
}: ScientificPdfProps) {
  return (
    <Document>
      {/* ═══════════════════════════════════════════════════════════
         PAGE 1 — COVER + SECTIONS 1 (Academic) + 2 (Observations)
         ═══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        {/* COVER HEADER */}
        <View style={styles.coverHeader}>
          <View style={styles.brandBox}>
            <Text style={styles.brandText}>EDURA</Text>
            <Text style={styles.brandSub}>v1.0</Text>
          </View>
          <View style={styles.reportTitleBox}>
            <Text style={styles.reportTitleAr}>التقرير العلمي الشامل للطالب</Text>
            <Text style={styles.reportTitle}>RAPPORT SCIENTIFIQUE ET D&apos;ORIENTATION</Text>
            <Text style={styles.reportSubtitle}>Bilan Pedagogique et d&apos;Orientation Complet</Text>
            <Text style={styles.reportMotto}>
              « Revelons les talents, construisons l&apos;avenir »
            </Text>
            <Text style={[styles.textSmall, { color: COLORS.muted, marginTop: 4 }]}>
              {school.name} - {school.wilaya}
            </Text>
          </View>
          <View style={styles.studentPhotoBox}>
            {/* Student photo */}
            {photoUrl ? (
              <Image src={photoUrl} style={styles.studentPhoto} />
            ) : (
              <View style={styles.studentPhotoPlaceholder}>
                <Text style={styles.studentPhotoInitial}>
                  {report.meta.studentName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            {/* Info column */}
            <View style={[styles.studentInfoBox, { width: 130 }]}>
              <View style={styles.studentInfoRow}>
                <Text style={styles.studentInfoLabel}>Nom complet</Text>
                <Text style={styles.studentInfoValue}>{report.meta.studentName}</Text>
              </View>
              <View style={styles.studentInfoRow}>
                <Text style={styles.studentInfoLabel}>Classe</Text>
                <Text style={styles.studentInfoValue}>{report.meta.className}</Text>
              </View>
              <View style={styles.studentInfoRow}>
                <Text style={styles.studentInfoLabel}>Annee scolaire</Text>
                <Text style={styles.studentInfoValue}>{year}</Text>
              </View>
              {report.meta.iq.score && (
                <View style={styles.studentInfoRow}>
                  <Text style={styles.studentInfoLabel}>QI mesure</Text>
                  <Text style={[styles.studentInfoValue, { color: COLORS.indigo }]}>
                    {report.meta.iq.score}
                  </Text>
                </View>
              )}
              {mbti && (
                <View style={styles.studentInfoRow}>
                  <Text style={styles.studentInfoLabel}>Type MBTI</Text>
                  <Text style={[styles.studentInfoValue, { color: "#0E7490" }]}>
                    {mbti.type} — {mbti.nickname}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* SECTION 1 — Academic */}
        <SectionBanner
          n={1}
          title="SYNTHESE ACADEMIQUE"
          titleAr="نظرة عامة أكاديمية"
          color={COLORS.emerald}
        />
        <View style={styles.row}>
          <View style={styles.twoCol}>
            <Text style={styles.subheading}>Meilleures matieres</Text>
            {report.academic.bestSubjects.map((s, i) => (
              <View
                key={i}
                style={[styles.row, { justifyContent: "space-between", marginBottom: 2 }]}
              >
                <Text style={styles.text}>{s.name}</Text>
                <Text style={[styles.text, styles.bold, { color: COLORS.emerald }]}>
                  {s.gpa}/20
                </Text>
              </View>
            ))}
            {report.academic.weakSubjects.length > 0 && (
              <>
                <Text style={[styles.subheading, { marginTop: 8, color: COLORS.red }]}>
                  Matieres a renforcer
                </Text>
                {report.academic.weakSubjects.map((s, i) => (
                  <View
                    key={i}
                    style={[styles.row, { justifyContent: "space-between", marginBottom: 2 }]}
                  >
                    <Text style={styles.text}>{s.name}</Text>
                    <Text style={[styles.text, styles.bold, { color: COLORS.red }]}>
                      {s.gpa}/20
                    </Text>
                  </View>
                ))}
              </>
            )}
          </View>
          <View style={styles.col}>
            <Text style={styles.subheading}>Progression du GPA</Text>
            <GpaSparkline data={report.academic.gpaTrend} width={200} height={50} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 2 }}>
              {report.academic.gpaTrend.map((t, i) => (
                <Text key={i} style={[styles.textSmall, { color: COLORS.muted }]}>
                  T{t.trimester}: {t.gpa}
                </Text>
              ))}
            </View>
            <View
              style={{
                marginTop: 8,
                padding: 6,
                backgroundColor: "#F0FDF4",
                borderRadius: 4,
                borderLeftWidth: 3,
                borderLeftColor: COLORS.emerald,
              }}
            >
              <Text style={[styles.textSmall, styles.muted]}>Moyenne generale</Text>
              <Text style={{ fontSize: 18, fontWeight: 700, color: COLORS.emerald }}>
                {report.academic.overallGpa}/20
              </Text>
              <Text style={[styles.textSmall, { color: COLORS.muted, fontStyle: "italic" }]}>
                Tendance:{" "}
                {report.academic.progressionLabel === "EN_PROGRESSION"
                  ? "En progression positive"
                  : report.academic.progressionLabel === "EN_BAISSE"
                    ? "En baisse - vigilance"
                    : "Stable"}
              </Text>
            </View>
          </View>
        </View>

        <InterpretBox
          title="Comment lire cette section ?"
          text="Le GPA est la moyenne generale sur 20. Un GPA > 14/20 indique de bons resultats ; entre 10 et 14, des resultats moyens ; sous 10, un soutien est recommande. La courbe de progression montre l'evolution trimestre par trimestre - une courbe ascendante = amelioration. Les matieres fortes revelent les domaines d'excellence ; les faibles, ou concentrer le soutien."
          borderColor={COLORS.emerald}
          bg="#F0FDF4"
          titleColor={COLORS.emeraldDark}
        />

        {/* SECTION 2 — Observations */}
        <SectionBanner
          n={2}
          title="COMMENTAIRES DES ENSEIGNANTS"
          titleAr="ملاحظات الأساتذة"
          color={COLORS.red}
        />
        {report.observations.length === 0 ? (
          <Text style={[styles.text, styles.muted, { fontStyle: "italic" }]}>
            Aucune observation enregistree pour le moment.
          </Text>
        ) : (
          <View>
            {report.observations.slice(0, 4).map((o, i) => (
              <View key={i} style={styles.obsCard}>
                <Text style={styles.obsTitle}>{o.subjectName}</Text>
                <Text style={styles.obsBody}>{o.observation}</Text>
                {o.advice && (
                  <Text style={[styles.text, { fontStyle: "italic", marginTop: 2 }]}>
                    Conseil: {o.advice}
                  </Text>
                )}
                <Text style={styles.obsSignature}>Signature: {o.teacherName}</Text>
              </View>
            ))}
          </View>
        )}

        <InterpretBox
          title="Pourquoi les observations sont-elles importantes ?"
          text="Les observations qualitatives des enseignants capturent ce que les notes ne disent pas : comportement, motivation, leadership, creativite, esprit d'equipe. Chaque enseignant peut tagger les intelligences observees (Linguistique, Logique, Interpersonnelle, etc.) - ces tags enrichissent automatiquement le profil psychopedagogique calcule en page suivante. Pour les parents : ces commentaires aident a comprendre l'enfant au-dela des notes."
          borderColor={COLORS.red}
          bg="#FEF2F2"
          titleColor={COLORS.redDark}
        />

        <Text style={styles.footer}>
          Page 1/5 — Document genere par EDURA — {new Date(report.meta.generatedAt).toLocaleDateString("fr-FR")}
        </Text>
      </Page>

      {/* ═══════════════════════════════════════════════════════════
         PAGE 2 — PROFIL PSYCHOPEDAGOGIQUE
         ═══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <SectionBanner
          n={3}
          title="PROFIL PSYCHOPEDAGOGIQUE ET CONSEILS"
          titleAr="الملف النفسي التربوي"
          color={COLORS.amber}
        />

        <View style={styles.row}>
          <View style={styles.twoCol}>
            <Text style={styles.subheading}>
              Intelligences Multiples (Howard Gardner)
            </Text>
            <Text style={[styles.textSmall, styles.muted, { marginBottom: 6 }]}>
              Les 5 intelligences dominantes detectees chez l&apos;eleve
            </Text>
            {report.profile.intelligences.map((i, idx) => (
              <View key={idx} style={{ marginBottom: 5 }}>
                <View
                  style={[
                    styles.row,
                    { justifyContent: "space-between", marginBottom: 1 },
                  ]}
                >
                  <Text style={styles.text}>{i.label}</Text>
                  <Text style={[styles.text, styles.bold]}>{i.score}%</Text>
                </View>
                <View style={styles.intelligenceBar}>
                  <View
                    style={[
                      styles.intelligenceFill,
                      {
                        width: `${i.score}%`,
                        backgroundColor: [
                          COLORS.amber,
                          COLORS.indigo,
                          COLORS.emerald,
                          COLORS.purple,
                          COLORS.red,
                        ][idx % 5],
                      },
                    ]}
                  />
                </View>
              </View>
            ))}

            <View
              style={{
                marginTop: 10,
                padding: 7,
                backgroundColor: "#FEF3C7",
                borderRadius: 4,
                borderLeftWidth: 3,
                borderLeftColor: COLORS.amber,
              }}
            >
              <Text
                style={{
                  fontSize: 7,
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: COLORS.amberDark,
                  letterSpacing: 0.3,
                }}
              >
                Style d&apos;apprentissage detecte
              </Text>
              <Text style={[styles.text, styles.bold, { fontSize: 10, marginTop: 2 }]}>
                {report.profile.learningStyle}
              </Text>
              <Text style={[styles.textSmall, { marginTop: 3 }]}>
                {report.profile.learningStyleDescription}
              </Text>
            </View>
          </View>

          <View style={styles.col}>
            <Text style={styles.subheading}>Conseils personnalises</Text>
            {report.profile.personalizedAdvices.length === 0 ? (
              <Text style={[styles.text, styles.muted, { fontStyle: "italic" }]}>
                Donnees insuffisantes pour generer des conseils.
              </Text>
            ) : (
              report.profile.personalizedAdvices.map((a, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    marginBottom: 4,
                    padding: 6,
                    backgroundColor: COLORS.white,
                    borderLeftWidth: 2,
                    borderLeftColor: COLORS.amber,
                    borderRadius: 2,
                  }}
                >
                  <Text
                    style={[styles.text, { color: COLORS.amberDark, marginRight: 4, fontWeight: 700 }]}
                  >
                    {i + 1}.
                  </Text>
                  <Text style={[styles.text, { flex: 1 }]}>{a}</Text>
                </View>
              ))
            )}

            {report.profile.interests.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text style={[styles.subheading, { fontSize: 8 }]}>
                  Centres d&apos;interet declares
                </Text>
                <View style={styles.row}>
                  {report.profile.interests.map((interest, i) => (
                    <Text
                      key={i}
                      style={{
                        backgroundColor: "#EEF2FF",
                        color: COLORS.indigoDark,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 8,
                        fontSize: 7,
                        marginRight: 3,
                        marginBottom: 3,
                      }}
                    >
                      {interest}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {report.profile.hobbies.length > 0 && (
              <View style={{ marginTop: 4 }}>
                <Text style={[styles.subheading, { fontSize: 8 }]}>Loisirs</Text>
                <View style={styles.row}>
                  {report.profile.hobbies.map((h, i) => (
                    <Text
                      key={i}
                      style={{
                        borderWidth: 1,
                        borderColor: COLORS.border,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 8,
                        fontSize: 7,
                        marginRight: 3,
                        marginBottom: 3,
                      }}
                    >
                      {h}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        <InterpretBox
          title="Que signifie ce profil psychopedagogique ?"
          text="Les intelligences multiples (Howard Gardner, Harvard, 1983) postulent que l'intelligence n'est pas unique mais multi-dimensionnelle - il existe 8 types d'intelligence et chacun de nous combine ces dimensions a des degres variables. Le graphique des barres montre les 5 intelligences dominantes. Plus la barre est longue, plus cette intelligence est developpee. Exemple : Logique-Mathematique dominante = profil scientifique ; Linguistique dominante = profil litteraire ou langues. Le style d'apprentissage (modele VAK/RW de Fleming 1995) indique comment l'eleve absorbe le mieux l'information. C'est crucial pour adapter la pedagogie."
          borderColor={COLORS.amber}
          bg="#FEF3C7"
          titleColor={COLORS.amberDark}
        />

        <Text style={styles.footer}>
          Page 2/5 — Document genere par EDURA — {new Date(report.meta.generatedAt).toLocaleDateString("fr-FR")}
        </Text>
      </Page>

      {/* ═══════════════════════════════════════════════════════════
         PAGE 2-BIS — RESULTATS EDURA TEST (tablette) — only if data exists
         ═══════════════════════════════════════════════════════════ */}
      {testResult && (
        <Page size="A4" style={styles.page}>
          <SectionBanner
            n={4}
            title="RESULTATS EDURA TEST (TABLETTE)"
            titleAr="نتائج اختبار إيدورا"
            color="#6366F1"
          />

          <View style={{ marginTop: 8, padding: 8, backgroundColor: "#EEF2FF", borderRadius: 6, borderLeftWidth: 3, borderLeftColor: "#6366F1" }}>
            <Text style={[styles.textSmall, { color: "#3730A3" }]}>
              Donnees collectees lors de l&apos;evaluation realisee par l&apos;eleve sur l&apos;application EDURA Test
              (tablette) le {new Date(testResult.submittedAt).toLocaleDateString("fr-FR")}.
            </Text>
          </View>

          {/* MBTI dimension breakdown + IQ */}
          <View style={[styles.row, { marginTop: 10 }]}>
            <View style={[styles.twoCol, { backgroundColor: "#EEF2FF", borderRadius: 6, padding: 10, borderWidth: 1, borderColor: "#C7D2FE" }]}>
              <Text style={[styles.subheading, { color: "#4338CA" }]}>Personnalite MBTI</Text>
              <Text style={{ fontSize: 32, fontWeight: 700, color: "#4338CA", letterSpacing: 3, textAlign: "center", marginVertical: 6 }}>
                {testResult.mbtiType ?? "—"}
              </Text>
              {testResult.mbtiScores && (
                <View>
                  {[["E","I"],["S","N"],["T","F"],["J","P"]].map(([a,b]) => {
                    const aS = (testResult.mbtiScores as any)?.[a] ?? 0;
                    const bS = (testResult.mbtiScores as any)?.[b] ?? 0;
                    const total = aS + bS || 1;
                    const aPct = Math.round((aS / total) * 100);
                    return (
                      <View key={a+b} style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                        <Text style={{ fontSize: 8, fontWeight: 700, color: "#4338CA", width: 14 }}>{a}</Text>
                        <Text style={{ fontSize: 8, color: COLORS.muted, width: 14, textAlign: "right" }}>{aS}</Text>
                        <View style={{ flex: 1, height: 4, backgroundColor: "#E0E7FF", borderRadius: 2, marginHorizontal: 4, overflow: "hidden" }}>
                          <View style={{ height: 4, backgroundColor: "#6366F1", width: `${aPct}%` }} />
                        </View>
                        <Text style={{ fontSize: 8, color: COLORS.muted, width: 14 }}>{bS}</Text>
                        <Text style={{ fontSize: 8, fontWeight: 700, color: "#7C3AED", width: 14, textAlign: "right" }}>{b}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            <View style={[styles.col, { backgroundColor: "#FDF2F8", borderRadius: 6, padding: 10, borderWidth: 1, borderColor: "#FBCFE8" }]}>
              <Text style={[styles.subheading, { color: "#BE185D" }]}>Quotient intellectuel</Text>
              <Text style={{ fontSize: 36, fontWeight: 700, color: "#BE185D", textAlign: "center", marginVertical: 4 }}>
                {testResult.iqScore ?? "—"}
              </Text>
              <Text style={[styles.text, { textAlign: "center", fontWeight: 700 }]}>
                {testResult.iqLevel ?? ""}
              </Text>
              {testResult.iqPercentile != null && (
                <Text style={[styles.textSmall, { textAlign: "center", color: COLORS.muted, marginTop: 2 }]}>
                  Top {100 - testResult.iqPercentile}% des eleves testes
                </Text>
              )}
            </View>
          </View>

          {/* Intelligences (Gardner) */}
          {testResult.intelligenceScores && Object.keys(testResult.intelligenceScores).length > 0 && (
            <View style={{ marginTop: 12, padding: 10, backgroundColor: "#F0FDFA", borderRadius: 6, borderWidth: 1, borderColor: "#5EEAD4" }}>
              <Text style={[styles.subheading, { color: "#0F766E" }]}>
                Profil des 8 intelligences (Howard Gardner)
              </Text>
              {testResult.dominantIntelligence && (
                <Text style={[styles.textSmall, { color: "#0F766E", marginBottom: 6, fontWeight: 700 }]}>
                  Dominante : {INTEL_FR_PDF[testResult.dominantIntelligence] ?? testResult.dominantIntelligence}
                </Text>
              )}
              {Object.entries(testResult.intelligenceScores)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([key, score], idx) => (
                  <View key={key} style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}>
                    <Text style={{ fontSize: 8, color: COLORS.text, width: 130 }}>
                      {INTEL_FR_PDF[key] ?? key}
                    </Text>
                    <View style={{ flex: 1, height: 5, backgroundColor: "#CCFBF1", borderRadius: 2, marginHorizontal: 4, overflow: "hidden" }}>
                      <View style={{ height: 5, backgroundColor: idx === 0 ? "#14B8A6" : "#5EEAD4", width: `${score}%` }} />
                    </View>
                    <Text style={{ fontSize: 8, fontWeight: 700, color: "#0F766E", width: 30, textAlign: "right" }}>{score}%</Text>
                  </View>
                ))}
            </View>
          )}

          {/* Career preferences */}
          <View style={{ marginTop: 12, padding: 10, backgroundColor: "#FFFBEB", borderRadius: 6, borderWidth: 1, borderColor: "#FCD34D" }}>
            <Text style={[styles.subheading, { color: "#92400E" }]}>
              Preferences professionnelles exprimees
            </Text>
            {testResult.careerTopMatch && (
              <Text style={[styles.text, { fontWeight: 700, marginVertical: 2 }]}>
                Metier prefere : {CAREER_FR_PDF[testResult.careerTopMatch] ?? testResult.careerTopMatch}
              </Text>
            )}
            {Array.isArray(testResult.careerLiked) && testResult.careerLiked.length > 0 && (
              <Text style={[styles.textSmall, { color: COLORS.muted }]}>
                Egalement apprecies ({testResult.careerLiked.length}) : {testResult.careerLiked.slice(0, 8).map((id) => CAREER_FR_PDF[id] ?? id).join(", ")}
                {testResult.careerLiked.length > 8 ? "…" : ""}
              </Text>
            )}
            <Text style={[styles.textSmall, { fontStyle: "italic", color: "#92400E", marginTop: 6 }]}>
              Note : ces preferences sont subjectives. La recommandation officielle d&apos;orientation
              (section &quot;Prediction et Avenir&quot;) combine ces preferences avec les notes,
              le MBTI, le QI et les intelligences pour proposer le meilleur metier.
            </Text>
          </View>

          <Text style={styles.footer}>
            Page 3/6 — Donnees EDURA Test — {new Date(report.meta.generatedAt).toLocaleDateString("fr-FR")}
          </Text>
        </Page>
      )}

      {/* ═══════════════════════════════════════════════════════════
         PAGE 3 — MBTI PERSONALITY PROFILE
         ═══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <SectionBanner
          n={5}
          title="PROFIL DE PERSONNALITE (MBTI)"
          titleAr="نوع الشخصية"
          color="#06B6D4"
        />

        {!mbti ? (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={[styles.text, styles.muted, { fontStyle: "italic", textAlign: "center" }]}>
              Type MBTI non encore evalue pour cet eleve.
            </Text>
            <Text style={[styles.textSmall, styles.muted, { marginTop: 8, textAlign: "center" }]}>
              Le directeur ou conseiller peut saisir le resultat du test MBTI via la
              section &quot;Saisie IQ &amp; Profil&quot; de la plateforme EDURA.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.row}>
              {/* Identity Card */}
              <View style={[styles.twoCol, { padding: 12, backgroundColor: "#ECFEFF", borderRadius: 6, borderWidth: 1, borderColor: "#67E8F9", alignItems: "center" }]}>
                <Text style={{ fontSize: 36, fontWeight: 700, color: "#0E7490", letterSpacing: 2 }}>
                  {mbti.type}
                </Text>
                <Text style={[styles.text, styles.bold, { fontSize: 12, marginTop: 4, color: COLORS.text }]}>
                  {mbti.nickname}
                </Text>
                <View
                  style={{
                    marginTop: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    backgroundColor: "#A5F3FC",
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ fontSize: 8, fontWeight: 700, color: "#0E7490", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {mbti.category}
                  </Text>
                </View>
                <Text style={[styles.textSmall, { marginTop: 8, fontStyle: "italic", textAlign: "center" }]}>
                  {mbti.description}
                </Text>
              </View>

              {/* 4 Dimensions */}
              <View style={styles.col}>
                <Text style={styles.subheading}>Les 4 dimensions de personnalite</Text>
                {mbti.dimensions.map((d, i) => (
                  <View key={i} style={{ marginBottom: 6 }}>
                    <View style={[styles.row, { justifyContent: "space-between" }]}>
                      <Text style={[styles.textSmall, styles.bold]}>
                        {d.letterLeft} — {d.labelLeft}
                      </Text>
                      <Text style={[styles.textSmall, styles.bold, { color: COLORS.muted }]}>
                        {d.labelRight} — {d.letterRight}
                      </Text>
                    </View>
                    <View style={[styles.row, { alignItems: "center", marginTop: 2 }]}>
                      <Text style={{ fontSize: 7, fontWeight: 700, width: 22, color: d.leftPct > d.rightPct ? "#0E7490" : COLORS.muted }}>
                        {d.leftPct}%
                      </Text>
                      <View style={{ flex: 1, height: 6, backgroundColor: "#E2E8F0", borderRadius: 3, flexDirection: "row", overflow: "hidden" }}>
                        <View style={{ width: `${d.leftPct}%`, height: 6, backgroundColor: d.leftPct > d.rightPct ? "#06B6D4" : "#CBD5E1" }} />
                        <View style={{ width: `${d.rightPct}%`, height: 6, backgroundColor: d.rightPct > d.leftPct ? "#06B6D4" : "#CBD5E1" }} />
                      </View>
                      <Text style={{ fontSize: 7, fontWeight: 700, width: 22, textAlign: "right", color: d.rightPct > d.leftPct ? "#0E7490" : COLORS.muted }}>
                        {d.rightPct}%
                      </Text>
                    </View>
                    <Text style={[styles.textSmall, { fontStyle: "italic", marginTop: 2, color: COLORS.muted }]}>
                      {d.description}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Strengths + weaknesses */}
            <View style={[styles.row, { marginTop: 10 }]}>
              <View style={[styles.twoCol, { padding: 7, backgroundColor: "#F0FDF4", borderRadius: 4, borderLeftWidth: 3, borderLeftColor: COLORS.emerald }]}>
                <Text style={{ fontSize: 8, fontWeight: 700, color: COLORS.emeraldDark, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 4 }}>
                  Forces du profil
                </Text>
                {mbti.strengths.map((s, i) => (
                  <View key={i} style={{ flexDirection: "row", marginBottom: 1 }}>
                    <Text style={{ fontSize: 8, color: COLORS.emerald, marginRight: 4 }}>*</Text>
                    <Text style={styles.textSmall}>{s}</Text>
                  </View>
                ))}
              </View>
              <View style={[styles.col, { padding: 7, backgroundColor: "#FEF3C7", borderRadius: 4, borderLeftWidth: 3, borderLeftColor: COLORS.amber }]}>
                <Text style={{ fontSize: 8, fontWeight: 700, color: COLORS.amberDark, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 4 }}>
                  Points de vigilance
                </Text>
                {mbti.weaknesses.map((w, i) => (
                  <View key={i} style={{ flexDirection: "row", marginBottom: 1 }}>
                    <Text style={{ fontSize: 8, color: COLORS.amber, marginRight: 4 }}>*</Text>
                    <Text style={styles.textSmall}>{w}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Career + filière + advice */}
            <View style={[styles.row, { marginTop: 8 }]}>
              <View style={[styles.twoCol, styles.card, { backgroundColor: "#EFF6FF", borderWidth: 1, borderColor: "#BFDBFE" }]}>
                <Text style={{ fontSize: 8, fontWeight: 700, color: "#1E40AF", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 4 }}>
                  Metiers compatibles
                </Text>
                {mbti.recommendedCareers.slice(0, 4).map((c, i) => (
                  <Text key={i} style={[styles.textSmall, { marginBottom: 1 }]}>* {c}</Text>
                ))}
              </View>
              <View style={[styles.twoCol, styles.card, { backgroundColor: "#FAF5FF", borderWidth: 1, borderColor: "#E9D5FF" }]}>
                <Text style={{ fontSize: 8, fontWeight: 700, color: COLORS.purpleDark, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 4 }}>
                  Filieres BAC suggerees
                </Text>
                {mbti.recommendedFilieres.map((f, i) => (
                  <Text key={i} style={[styles.textSmall, { marginBottom: 1 }]}>* {f}</Text>
                ))}
              </View>
              <View style={[styles.col, styles.card, { backgroundColor: "#ECFEFF", borderWidth: 1, borderColor: "#A5F3FC" }]}>
                <Text style={{ fontSize: 8, fontWeight: 700, color: "#0E7490", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 4 }}>
                  Conseil d&apos;etude
                </Text>
                <Text style={styles.textSmall}>{mbti.studyAdvice}</Text>
              </View>
            </View>

            <InterpretBox
              title="Qu'est-ce que le MBTI ?"
              text="Le MBTI (Myers-Briggs Type Indicator) est un indicateur de personnalite base sur la theorie psychologique de Carl Jung (Types Psychologiques, 1921), operationnalise par Katharine Cook Briggs et Isabel Briggs Myers (1944). Il evalue 4 dimensions : E/I (Extraversion/Introversion), S/N (Sensation/Intuition), T/F (Thinking/Feeling), J/P (Judging/Perceiving). La combinaison donne 16 types possibles. Pour les parents : c'est un outil indicatif qui complete le profil d'intelligences (Gardner) pour une orientation eclairee."
              borderColor="#06B6D4"
              bg="#ECFEFF"
              titleColor="#0E7490"
            />
          </>
        )}

        <Text style={styles.footer}>
          Page 3/5 — Document genere par EDURA — {new Date(report.meta.generatedAt).toLocaleDateString("fr-FR")}
        </Text>
      </Page>

      {/* ═══════════════════════════════════════════════════════════
         PAGE 4 — ORIENTATION + CAREERS + UNIVERSITIES
         ═══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <SectionBanner
          n={4}
          title="PREDICTION D'ORIENTATION ET PERSPECTIVES"
          titleAr="التنبؤ والمستقبل"
          color={COLORS.purple}
        />

        <Text style={styles.subheading}>
          Filieres BAC recommandees par ordre de pertinence
        </Text>
        <Text style={[styles.textSmall, styles.muted, { marginBottom: 6 }]}>
          Calcul base sur la ponderation des matieres cles de chaque filiere algerienne
        </Text>

        {report.prediction.recommendedFilieres.map((f, i) => (
          <View key={i} style={styles.filiereCard}>
            <View style={styles.filiereHeader}>
              <Text style={[styles.text, styles.bold, { fontSize: 10 }]}>
                {i + 1}. {f.name}
              </Text>
              <Text style={styles.confidenceBadge}>{f.confidence}% d&apos;adequation</Text>
            </View>
            <Text style={styles.text}>{f.reasoning}</Text>
          </View>
        ))}

        <View style={[styles.row, { marginTop: 10 }]}>
          <View style={styles.twoCol}>
            <Text style={styles.subheading}>Metiers correspondants</Text>
            <Text style={[styles.textSmall, styles.muted, { marginBottom: 5 }]}>
              Carrieres adaptees au profil de l&apos;eleve
            </Text>
            {report.prediction.careerSuggestions.map((c, i) => (
              <View key={i} style={styles.careerCard}>
                <Text style={[styles.text, styles.bold]}>{c.title}</Text>
                <Text style={[styles.textSmall, { color: COLORS.purpleDark }]}>
                  {c.filiere}
                </Text>
                <Text style={[styles.textSmall, styles.muted, { marginTop: 1 }]}>
                  {c.requiredStudies}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.col}>
            <Text style={styles.subheading}>Universites & Ecoles Superieures algeriennes</Text>
            <Text style={[styles.textSmall, styles.muted, { marginBottom: 5 }]}>
              Etablissements publics reputes dans le domaine
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {report.prediction.universitySuggestions.map((u, i) => (
                <Text key={i} style={styles.universityPill}>
                  {u}
                </Text>
              ))}
            </View>

            <View
              style={{
                marginTop: 8,
                padding: 7,
                backgroundColor: "#FAF5FF",
                borderRadius: 4,
                borderLeftWidth: 3,
                borderLeftColor: COLORS.purple,
              }}
            >
              <Text
                style={{
                  fontSize: 7,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: COLORS.purpleDark,
                  letterSpacing: 0.3,
                  marginBottom: 3,
                }}
              >
                Conseil d&apos;orientation
              </Text>
              <Text style={styles.textSmall}>
                Cette analyse est un outil d&apos;aide a la decision, pas une sentence definitive.
                La motivation et les reves de l&apos;eleve restent primordiaux. Discuter
                avec l&apos;enfant et les enseignants reste essentiel pour une orientation reussie.
              </Text>
            </View>
          </View>
        </View>

        <InterpretBox
          title="Comment interpreter ce pourcentage d'adequation ?"
          text="Plus le pourcentage est eleve, plus l'adequation entre les performances actuelles de l'eleve et les exigences de la filiere est forte. Un score > 75% indique une voie naturelle ; entre 60% et 75%, une voie possible avec adaptation ; sous 60%, mieux vaut explorer d'autres pistes. Le calcul utilise des ponderations validees par la recherche en sciences de l'education. Exemple : Sciences Experimentales privilegie SVT (35%), Physique (30%), Math (25%), FR/EN (10%)."
          borderColor={COLORS.purple}
          bg="#FAF5FF"
          titleColor={COLORS.purpleDark}
        />

        <Text style={styles.footer}>
          Page 4/5 — Document genere par EDURA — {new Date(report.meta.generatedAt).toLocaleDateString("fr-FR")}
        </Text>
      </Page>

      {/* ═══════════════════════════════════════════════════════════
         PAGE 4 — EDURA INSTITUTION TRIDIMENSIONNELLE (VISION)
         ═══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <View style={styles.visionHeader}>
          <Text style={[styles.textSmall, { color: COLORS.amber, fontWeight: 700 }]}>
            PERSPECTIVES D&apos;EVOLUTION & VISION FUTURISTE
          </Text>
          <Text style={styles.visionTitle}>L&apos;ECOSYSTEME EDURA</Text>
          <Text style={styles.visionSubtitle}>
            Au-dela du rapport scolaire — Vers une institution d&apos;elite ouverte a tous
          </Text>
          <Text style={styles.visionMotto}>
            « Revelons les talents, construisons l&apos;avenir »
          </Text>
        </View>

        {/* 1. Tridimensionnelle */}
        <View style={styles.visionSection}>
          <Text style={styles.visionSectionTitle}>
            1. L&apos;EDUCATION TRIDIMENSIONNELLE : au-dela du cadre academique
          </Text>
          <Text style={[styles.textSmall, { marginBottom: 6 }]}>
            Le systeme educatif conventionnel s&apos;est longtemps limite a une evaluation
            unidimensionnelle basee sur la memorisation. Le bilan scientifique d&apos;EDURA
            marque une rupture paradigmatique en Algerie en introduisant une approche
            holistique qui fusionne <Text style={styles.bold}>trois dimensions critiques</Text> :
          </Text>
          <View style={styles.row}>
            <View style={[styles.dimensionCard, { backgroundColor: "#EEF2FF", borderLeftColor: COLORS.indigo }]}>
              <Text style={[styles.dimensionLabel, { color: COLORS.indigoDark }]}>
                ACADEMIQUE
              </Text>
              <Text style={styles.dimensionDesc}>
                Les resultats factuels (notes, moyennes, progression dans les matieres scolaires)
              </Text>
            </View>
            <View style={[styles.dimensionCard, { backgroundColor: "#FAF5FF", borderLeftColor: COLORS.purple }]}>
              <Text style={[styles.dimensionLabel, { color: COLORS.purpleDark }]}>
                PSYCHOLOGIQUE
              </Text>
              <Text style={styles.dimensionDesc}>
                Le profil de personnalite et les neurosciences cognitives (Gardner, VAK/RW)
              </Text>
            </View>
            <View style={[styles.dimensionCard, { backgroundColor: "#FEF3C7", borderLeftColor: COLORS.amber }]}>
              <Text style={[styles.dimensionLabel, { color: COLORS.amberDark }]}>
                POTENTIEL
              </Text>
              <Text style={styles.dimensionDesc}>
                Les aptitudes innees et les projections de carriere personnalisees
              </Text>
            </View>
          </View>
        </View>

        {/* 2. Institution */}
        <View style={styles.visionSection}>
          <Text style={styles.visionSectionTitle}>
            2. L&apos;INSTITUTION EDURA : un incubateur de talents pour tous
          </Text>
          <Text style={[styles.textSmall, { marginBottom: 6 }]}>
            Les donnees recoltees ne doivent pas rester theoriques. L&apos;Institution
            EDURA intervient comme <Text style={styles.bold}>prolongement operationnel</Text> :
            un programme d&apos;enrichissement ouvert a tous, partant du principe scientifique
            que <Text style={{ fontStyle: "italic" }}>chaque eleve possede une « zone de genie » specifique</Text>.
          </Text>
          <View style={styles.row}>
            <View style={styles.poleBox}>
              <Text style={[styles.poleTitle, { color: COLORS.indigo }]}>
                Pole Technologique & Scientifique
              </Text>
              <Text style={styles.poleBullet}>* Immersion pratique en ingenierie</Text>
              <Text style={styles.poleBullet}>* Codage applicatif, Robotique (Arduino)</Text>
              <Text style={styles.poleBullet}>* Initiation medicale</Text>
              <Text style={styles.poleBullet}>* Sciences environnementales</Text>
            </View>
            <View style={styles.poleBox}>
              <Text style={[styles.poleTitle, { color: COLORS.emerald }]}>
                Pole Economique & Management
              </Text>
              <Text style={styles.poleBullet}>* Incubation entrepreneuriale precoce</Text>
              <Text style={styles.poleBullet}>* Litteratie financiere</Text>
              <Text style={styles.poleBullet}>* Gestion de projet</Text>
              <Text style={styles.poleBullet}>* Sciences de l&apos;education</Text>
            </View>
            <View style={[styles.poleBox, { marginRight: 0 }]}>
              <Text style={[styles.poleTitle, { color: COLORS.red }]}>
                Pole Humain & Creatif
              </Text>
              <Text style={styles.poleBullet}>* Intelligences interpersonnelles et spatiales</Text>
              <Text style={styles.poleBullet}>* Arts plastiques & Musicologie</Text>
              <Text style={styles.poleBullet}>* Analyse geographique</Text>
              <Text style={styles.poleBullet}>* Sport de performance</Text>
            </View>
          </View>
        </View>

        {/* 3. Alignement neuropedagogique */}
        <View style={styles.visionSection}>
          <Text style={styles.visionSectionTitle}>
            3. ALIGNEMENT NEUROPEDAGOGIQUE : la methodologie d&apos;apprentissage
          </Text>
          <Text style={[styles.textSmall, { marginBottom: 4 }]}>
            La veritable innovation reside dans l&apos;isomorphisme methodologique. Les cours
            ne sont pas dispensés de maniere uniforme : les experts concoivent des formats
            pedagogiques calques sur les types d&apos;intelligence valides par nos psycho-analystes.
          </Text>
          <View
            style={{
              padding: 7,
              backgroundColor: "#F1F5F9",
              borderRadius: 4,
              marginTop: 4,
            }}
          >
            <Text style={[styles.textSmall, styles.bold, { color: COLORS.text }]}>
              Exemple methodologique :
            </Text>
            <Text style={[styles.textSmall, { marginTop: 2, fontStyle: "italic" }]}>
              Si un eleve revele une dominance visuo-spatiale et un interet entrepreneurial,
              les concepts de gestion lui seront enseignes via la modelisation graphique et
              les matrices d&apos;architecture. A l&apos;inverse, un profil linguistique abordera
              la finance par la rhetorique de negociation et la redaction strategique.
            </Text>
          </View>
        </View>

        {/* 4. Vision avenir */}
        <View
          style={{
            padding: 10,
            backgroundColor: COLORS.indigoDark,
            borderRadius: 6,
            marginTop: 6,
          }}
        >
          <Text style={[styles.visionSectionTitle, { color: COLORS.white }]}>
            4. UNE VISION D&apos;AVENIR POUR LA JEUNESSE ALGERIENNE
          </Text>
          <Text style={[styles.textSmall, { color: COLORS.white }]}>
            En connectant les ecoles privees partenaires a cette institution d&apos;elite,
            EDURA dessine les contours de <Text style={styles.bold}>l&apos;ecole de demain en Algerie</Text>.
            Nous ne formons pas des executants conformes a un programme rigide ; nous revelons
            des esprits agiles, psychologiquement equilibres, conscients de leurs forces et armes
            techniquement pour devenir les leaders, ingenieurs, artistes et entrepreneurs de
            l&apos;economie de la connaissance.
          </Text>
          <View
            style={{
              marginTop: 8,
              paddingTop: 6,
              borderTopWidth: 1,
              borderTopColor: "rgba(255,255,255,0.3)",
            }}
          >
            <Text
              style={{
                color: COLORS.amber,
                fontSize: 9,
                fontStyle: "italic",
                textAlign: "center",
                fontWeight: 700,
              }}
            >
              « Chaque enfant porte en lui un genie. Notre mission est de l&apos;activer. »
            </Text>
          </View>
        </View>

        {/* ── Vision photo: EDURA Institution building (the future) ── */}
        <View style={{ marginTop: 14, alignItems: "center" }}>
          <Image
            src="/edura-institution.png"
            style={{
              width: "100%",
              maxHeight: 240,
              borderRadius: 6,
              objectFit: "cover",
            }}
          />
          <Text style={{ fontSize: 8, color: COLORS.muted, marginTop: 4, fontStyle: "italic", textAlign: "center" }}>
            Vue d&apos;artiste — Future Institution EDURA, ouverte aux talents algeriens.
          </Text>
        </View>

        <Text style={styles.footer}>
          Page finale — Document genere par EDURA — {new Date(report.meta.generatedAt).toLocaleDateString("fr-FR")}
        </Text>
      </Page>
    </Document>
  );
}
