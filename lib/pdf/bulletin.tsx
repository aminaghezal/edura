/**
 * EDURA — Bulletin PDF (Phase 6)
 *
 * Server-side PDF generation with @react-pdf/renderer.
 * Matches the in-app bulletin preview design — A4, indigo header,
 * grade table with appreciations, signature blocks.
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const COLORS = {
  primary: "#1E3A8A", // indigo-900
  text: "#0F172A",
  muted: "#475569",
  border: "#E2E8F0",
  bg: "#F8FAFC",
  success: "#16A34A",
  danger: "#DC2626",
};

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: COLORS.text,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 14,
    marginBottom: 18,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  brand: {
    fontSize: 18,
    fontWeight: 800,
    color: COLORS.primary,
  },
  schoolName: { fontSize: 10, color: COLORS.muted, marginTop: 4 },
  metaRight: { textAlign: "right" },
  metaTitle: { fontSize: 10, fontWeight: 700 },
  metaSub: { fontSize: 10, color: COLORS.muted, marginTop: 2 },

  studentBlock: {
    flexDirection: "row",
    backgroundColor: COLORS.bg,
    padding: 12,
    marginBottom: 18,
    borderRadius: 4,
    gap: 32,
  },
  studentLabel: {
    fontSize: 8,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: 700,
  },
  studentValue: {
    fontSize: 12,
    fontWeight: 700,
    marginTop: 3,
  },

  table: { marginBottom: 16 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    color: "#fff",
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: 700,
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableRowAlt: { backgroundColor: COLORS.bg },
  tableTotal: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    color: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  cellSubject: { flex: 3 },
  cellNum: { flex: 1, textAlign: "center" },
  cellComment: { flex: 3, fontStyle: "italic", color: COLORS.muted },

  signatures: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sigBlock: { width: "40%", textAlign: "center" },
  sigLabel: { fontSize: 9, color: COLORS.muted, marginBottom: 40 },
  sigName: {
    fontSize: 9,
    color: COLORS.muted,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.muted,
  },
});

export type BulletinPdfProps = {
  school: { name: string; wilaya: string; director: string };
  student: {
    firstName: string;
    lastName: string;
    className: string;
  };
  trimester: number;
  year: string;
  grades: {
    subjectName: string;
    value: number;
    coefficient: number;
    comment: string | null;
  }[];
};

function appreciation(avg: number): string {
  if (avg >= 16) return "Felicitations";
  if (avg >= 14) return "Encouragements";
  if (avg >= 10) return "Passable";
  return "Avertissement";
}

export function BulletinPdf({
  school,
  student,
  trimester,
  year,
  grades,
}: BulletinPdfProps) {
  const totalWeighted = grades.reduce(
    (sum, g) => sum + g.value * g.coefficient,
    0,
  );
  const totalCoef = grades.reduce((sum, g) => sum + g.coefficient, 0);
  const overallAvg = totalCoef > 0 ? totalWeighted / totalCoef : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>EDURA</Text>
            <Text style={styles.schoolName}>
              {school.name} — {school.wilaya}
            </Text>
          </View>
          <View style={styles.metaRight}>
            <Text style={styles.metaTitle}>
              Trimestre {trimester} — {year}
            </Text>
            <Text style={styles.metaSub}>Classe : {student.className}</Text>
          </View>
        </View>

        {/* Student info */}
        <View style={styles.studentBlock}>
          <View>
            <Text style={styles.studentLabel}>Eleve</Text>
            <Text style={styles.studentValue}>
              {student.firstName} {student.lastName}
            </Text>
          </View>
          <View>
            <Text style={styles.studentLabel}>Classe</Text>
            <Text style={styles.studentValue}>{student.className}</Text>
          </View>
        </View>

        {/* Grades table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.cellSubject]}>
              Matiere
            </Text>
            <Text style={[styles.tableHeaderText, styles.cellNum]}>Coeff.</Text>
            <Text style={[styles.tableHeaderText, styles.cellNum]}>
              Note /20
            </Text>
            <Text style={[styles.tableHeaderText, styles.cellComment]}>
              Appreciation
            </Text>
          </View>

          {grades.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={{ flex: 1, textAlign: "center", padding: 12, color: COLORS.muted }}>
                Aucune note saisie pour ce trimestre.
              </Text>
            </View>
          ) : (
            grades.map((g, i) => {
              const isAlt = i % 2 === 0;
              const valueColor =
                g.value < 10
                  ? COLORS.danger
                  : g.value >= 15
                    ? COLORS.success
                    : COLORS.text;
              return (
                <View
                  key={i}
                  style={[styles.tableRow, isAlt ? styles.tableRowAlt : {}]}
                >
                  <Text style={[styles.cellSubject, { fontWeight: 700 }]}>
                    {g.subjectName}
                  </Text>
                  <Text style={[styles.cellNum, { color: COLORS.muted }]}>
                    {g.coefficient}
                  </Text>
                  <Text
                    style={[
                      styles.cellNum,
                      { fontWeight: 700, color: valueColor },
                    ]}
                  >
                    {g.value.toFixed(2)}
                  </Text>
                  <Text style={styles.cellComment}>{g.comment ?? "-"}</Text>
                </View>
              );
            })
          )}

          {grades.length > 0 && (
            <View style={styles.tableTotal}>
              <Text
                style={[styles.tableHeaderText, styles.cellSubject, { color: "#fff" }]}
              >
                Moyenne generale
              </Text>
              <Text style={[styles.tableHeaderText, styles.cellNum, { color: "#fff" }]}>
                —
              </Text>
              <Text
                style={[
                  styles.tableHeaderText,
                  styles.cellNum,
                  { color: "#fff", fontSize: 12 },
                ]}
              >
                {overallAvg.toFixed(2)}
              </Text>
              <Text
                style={[
                  styles.tableHeaderText,
                  styles.cellComment,
                  { color: "#fff", fontStyle: "italic" },
                ]}
              >
                {appreciation(overallAvg)}
              </Text>
            </View>
          )}
        </View>

        {/* Signatures */}
        <View style={styles.signatures}>
          <View style={styles.sigBlock}>
            <Text style={styles.sigLabel}>Signature professeur principal</Text>
            <Text style={styles.sigName}>—</Text>
          </View>
          <View style={styles.sigBlock}>
            <Text style={styles.sigLabel}>Cachet et signature directeur</Text>
            <Text style={styles.sigName}>{school.director}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
