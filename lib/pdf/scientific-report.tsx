/**
 * EDURA — Scientific Student Report PDF
 *
 * Reproduces the official "Bilan Pédagogique et d'Orientation Complet"
 * layout from the design mockup, formatted for A4 paper.
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ScientificReport } from "@/lib/orientation/profile";

const COLORS = {
  emerald: "#16A34A",
  red: "#DC2626",
  amber: "#F59E0B",
  purple: "#9333EA",
  text: "#0F172A",
  muted: "#64748B",
  border: "#E2E8F0",
  bg: "#F8FAFC",
};

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: COLORS.text,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    padding: 10,
    backgroundColor: "#F0FDF4",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  brandLogo: {
    width: 42,
    height: 42,
    backgroundColor: COLORS.emerald,
    color: "#fff",
    fontSize: 8,
    fontWeight: 700,
    padding: 6,
    borderRadius: 6,
    textAlign: "center",
  },
  title: {
    fontSize: 11,
    fontWeight: 700,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 8,
    color: COLORS.muted,
    textAlign: "center",
  },
  // Sections
  sectionBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6 10",
    marginTop: 10,
    marginBottom: 6,
  },
  sectionBannerText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionNumber: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.3)",
    color: "#fff",
    fontSize: 9,
    fontWeight: 700,
    textAlign: "center",
    padding: 3,
    marginRight: 6,
  },
  // Generic
  row: { flexDirection: "row" },
  col: { flex: 1 },
  subheading: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 4,
  },
  text: {
    fontSize: 8,
    lineHeight: 1.5,
  },
  muted: { color: COLORS.muted, fontSize: 8 },
  bold: { fontWeight: 700 },
  // Observation cards
  obsCard: {
    padding: 6,
    backgroundColor: "#FEF2F2",
    borderLeftWidth: 3,
    borderLeftColor: COLORS.red,
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
  filiereCard: {
    padding: 6,
    backgroundColor: "#FAF5FF",
    borderLeftWidth: 3,
    borderLeftColor: COLORS.purple,
    marginBottom: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  careerCard: {
    padding: 5,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E9D5FF",
    borderRadius: 4,
    marginBottom: 3,
  },
  footer: {
    position: "absolute",
    bottom: 18,
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
      <Text style={[styles.sectionBannerText, { fontSize: 8, opacity: 0.85 }]}>
        {titleAr}
      </Text>
    </View>
  );
}

export type ScientificPdfProps = {
  report: ScientificReport;
  school: { name: string; wilaya: string; director: string };
  year: string;
};

export function ScientificReportPdf({
  report,
  school,
  year,
}: ScientificPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.brandLogo}>
            <Text>DZ-ECOLE</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[styles.title, { color: COLORS.emerald }]}>
              MINISTERE DE L&apos;EDUCATION NATIONALE
            </Text>
            <Text style={styles.subtitle}>
              {school.name} - {school.wilaya} - {year}
            </Text>
            <Text style={[styles.title, { marginTop: 6 }]}>
              RAPPORT SCIENTIFIQUE ET D&apos;ORIENTATION
            </Text>
            <Text style={[styles.subtitle, { fontSize: 7 }]}>
              Bilan Pedagogique et d&apos;Orientation Complet
            </Text>
          </View>
          <View style={{ width: 140, fontSize: 8 }}>
            <Text>
              <Text style={styles.muted}>Nom: </Text>
              <Text style={styles.bold}>{report.meta.studentName}</Text>
            </Text>
            <Text>
              <Text style={styles.muted}>Classe: </Text>
              {report.meta.className}
            </Text>
            <Text>
              <Text style={styles.muted}>Annee: </Text>
              {year}
            </Text>
            {report.meta.iq.score && (
              <Text>
                <Text style={styles.muted}>QI: </Text>
                <Text style={[styles.bold, { color: COLORS.emerald }]}>
                  {report.meta.iq.score}
                </Text>{" "}
                ({report.meta.iq.interpretation})
              </Text>
            )}
          </View>
        </View>

        {/* ── Section 1: Synthèse Académique ── */}
        <SectionBanner
          n={1}
          title="SYNTHESE ACADEMIQUE"
          titleAr="Nazra 3ammah ekadimiya"
          color={COLORS.emerald}
        />
        <View style={styles.row}>
          <View style={[styles.col, { marginRight: 8 }]}>
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
                  A renforcer
                </Text>
                {report.academic.weakSubjects.map((s, i) => (
                  <View
                    key={i}
                    style={[
                      styles.row,
                      { justifyContent: "space-between", marginBottom: 2 },
                    ]}
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
            <Text style={styles.subheading}>Progression Moyenne (GPA)</Text>
            {report.academic.gpaTrend.map((t) => (
              <View
                key={t.trimester}
                style={[styles.row, { justifyContent: "space-between", marginBottom: 2 }]}
              >
                <Text style={styles.text}>Trimestre {t.trimester}</Text>
                <Text style={[styles.text, styles.bold]}>{t.gpa}/20</Text>
              </View>
            ))}
            <View
              style={{
                marginTop: 6,
                padding: 5,
                backgroundColor: "#F0FDF4",
                borderRadius: 4,
              }}
            >
              <Text style={styles.muted}>Moyenne generale</Text>
              <Text
                style={{ fontSize: 14, fontWeight: 700, color: COLORS.emerald }}
              >
                {report.academic.overallGpa}/20
              </Text>
            </View>
          </View>
        </View>

        {/* ── Section 2: Commentaires Enseignants ── */}
        <SectionBanner
          n={2}
          title="COMMENTAIRES DES ENSEIGNANTS"
          titleAr="Mola7adat al-Asatidha"
          color={COLORS.red}
        />
        {report.observations.length === 0 ? (
          <Text style={[styles.text, styles.muted, { fontStyle: "italic" }]}>
            Aucune observation enregistree pour le moment.
          </Text>
        ) : (
          <View>
            {report.observations.slice(0, 6).map((o, i) => (
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

        {/* ── Section 3: Profil Psychopédagogique ── */}
        <SectionBanner
          n={3}
          title="PROFIL PSYCHOPEDAGOGIQUE ET CONSEILS"
          titleAr="Al-malaff al-nafsi al-tarbawi"
          color={COLORS.amber}
        />
        <View style={styles.row}>
          <View style={[styles.col, { marginRight: 8 }]}>
            <Text style={styles.subheading}>Type d&apos;intelligence (Gardner)</Text>
            {report.profile.intelligences.map((i, idx) => (
              <View key={idx} style={{ marginBottom: 3 }}>
                <View
                  style={[
                    styles.row,
                    { justifyContent: "space-between", marginBottom: 1 },
                  ]}
                >
                  <Text style={styles.text}>{i.label}</Text>
                  <Text style={[styles.text, styles.bold]}>{i.score}%</Text>
                </View>
                <View
                  style={{
                    height: 4,
                    backgroundColor: "#FEF3C7",
                    borderRadius: 2,
                  }}
                >
                  <View
                    style={{
                      height: 4,
                      width: `${i.score}%`,
                      backgroundColor: COLORS.amber,
                      borderRadius: 2,
                    }}
                  />
                </View>
              </View>
            ))}
            <View
              style={{
                marginTop: 6,
                padding: 5,
                backgroundColor: "#FEF3C7",
                borderRadius: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 7,
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: "#92400E",
                }}
              >
                Style d&apos;apprentissage
              </Text>
              <Text style={[styles.text, styles.bold, { fontSize: 9 }]}>
                {report.profile.learningStyle}
              </Text>
            </View>
          </View>
          <View style={styles.col}>
            <Text style={styles.subheading}>Conseils personnalises</Text>
            {report.profile.personalizedAdvices.length === 0 ? (
              <Text style={[styles.text, styles.muted, { fontStyle: "italic" }]}>
                Donnees insuffisantes
              </Text>
            ) : (
              report.profile.personalizedAdvices.map((a, i) => (
                <View key={i} style={[styles.row, { marginBottom: 3 }]}>
                  <Text style={[styles.text, { color: COLORS.amber, marginRight: 4 }]}>
                    *
                  </Text>
                  <Text style={[styles.text, { flex: 1 }]}>{a}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* ── Section 4: Prédiction et Avenir ── */}
        <SectionBanner
          n={4}
          title="PREDICTION ET AVENIR"
          titleAr="Al-tanaboo' wa al-moustakbal"
          color={COLORS.purple}
        />
        <View style={styles.row}>
          <View style={[styles.col, { marginRight: 8 }]}>
            <Text style={styles.subheading}>Filieres recommandees</Text>
            {report.prediction.recommendedFilieres.map((f, i) => (
              <View key={i} style={styles.filiereCard}>
                <Text style={[styles.text, styles.bold]}>{f.name}</Text>
                <Text
                  style={{
                    backgroundColor: COLORS.purple,
                    color: "#fff",
                    paddingHorizontal: 4,
                    paddingVertical: 1,
                    borderRadius: 8,
                    fontSize: 7,
                    fontWeight: 700,
                  }}
                >
                  {f.confidence}%
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.col}>
            <Text style={styles.subheading}>Perspectives de carriere</Text>
            {report.prediction.careerSuggestions.map((c, i) => (
              <View key={i} style={styles.careerCard}>
                <Text style={[styles.text, styles.bold]}>{c.title}</Text>
                <Text style={[styles.text, styles.muted, { fontSize: 7 }]}>
                  {c.requiredStudies}
                </Text>
              </View>
            ))}
            {report.prediction.universitySuggestions.length > 0 && (
              <View style={{ marginTop: 6 }}>
                <Text
                  style={{
                    fontSize: 7,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: COLORS.purple,
                  }}
                >
                  Universites pertinentes
                </Text>
                <Text style={[styles.text, { marginTop: 2 }]}>
                  {report.prediction.universitySuggestions.join(" - ")}
                </Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.footer}>
          Document genere automatiquement par EDURA -{" "}
          {new Date(report.meta.generatedAt).toLocaleString("fr-FR")}
        </Text>
      </Page>
    </Document>
  );
}
