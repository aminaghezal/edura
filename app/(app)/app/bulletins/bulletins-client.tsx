"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  class: { name: string } | null;
};

type Grade = {
  value: number;
  comment: string | null;
  subject: { id: string; name: string };
};

export function BulletinsClient({
  students,
  selectedId,
  trimester,
  year,
  school,
  bulletinData,
}: {
  students: Student[];
  selectedId: string | null;
  trimester: number;
  year: string;
  school: { name: string; wilaya: string; director: string } | null;
  bulletinData: { student: Student | null; grades: Grade[] } | null;
}) {
  const router = useRouter();

  function changeStudent(id: string) {
    router.push(`/app/bulletins?student=${id}&trimester=${trimester}`);
  }

  function changeTrimester(t: number) {
    const url = selectedId
      ? `/app/bulletins?student=${selectedId}&trimester=${t}`
      : `/app/bulletins?trimester=${t}`;
    router.push(url);
  }

  const student = bulletinData?.student;
  const grades = bulletinData?.grades ?? [];
  const avg = grades.length
    ? (grades.reduce((a, g) => a + g.value, 0) / grades.length).toFixed(2)
    : "—";

  if (students.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-2">Bulletins</h1>
        <p className="text-muted-foreground">Aucun élève.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bulletin scolaire</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Trimestre {trimester} — Année {year || "—"}
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedId ?? ""}
            onChange={(e) => changeStudent(e.target.value)}
            className="h-9 px-3 rounded-md border border-input bg-background text-sm"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.firstName} {s.lastName}
              </option>
            ))}
          </select>
          <select
            value={trimester}
            onChange={(e) => changeTrimester(Number(e.target.value))}
            className="h-9 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value={1}>Trimestre 1</option>
            <option value={2}>Trimestre 2</option>
            <option value={3}>Trimestre 3</option>
          </select>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            Imprimer
          </Button>
          {selectedId && (
            <Button size="sm" asChild>
              <a
                href={`/api/bulletins/${selectedId}/pdf?trimester=${trimester}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Télécharger PDF
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* A4 preview */}
      <Card>
        <CardContent className="p-10 max-w-3xl mx-auto bg-white">
          {/* Header */}
          <div className="flex justify-between items-start pb-5 mb-6 border-b-2 border-indigo-900">
            <div>
              <div className="text-xl font-extrabold text-indigo-900">EDURA</div>
              <div className="text-sm text-muted-foreground mt-1">
                {school?.name} — {school?.wilaya}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">
                Trimestre {trimester} — {year}
              </div>
              <div className="text-sm text-muted-foreground">
                Classe : {student?.class?.name ?? "—"}
              </div>
            </div>
          </div>

          {/* Student info */}
          <div className="flex gap-12 mb-7 p-4 bg-muted rounded-lg">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Élève
              </div>
              <div className="text-base font-bold mt-1">
                {student ? `${student.firstName} ${student.lastName}` : "—"}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Classe
              </div>
              <div className="text-base font-bold mt-1">
                {student?.class?.name ?? "—"}
              </div>
            </div>
          </div>

          {/* Grades table */}
          <table className="w-full text-sm border-collapse mb-6">
            <thead>
              <tr className="bg-indigo-900 text-white">
                <th className="p-3 text-left text-xs font-bold uppercase tracking-wide">
                  Matière
                </th>
                <th className="p-3 text-center text-xs font-bold uppercase tracking-wide">
                  Note /20
                </th>
                <th className="p-3 text-left text-xs font-bold uppercase tracking-wide">
                  Appréciation
                </th>
              </tr>
            </thead>
            <tbody>
              {grades.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-muted-foreground">
                    Aucune note saisie pour ce trimestre.
                  </td>
                </tr>
              ) : (
                grades.map((g, i) => (
                  <tr
                    key={g.subject.id}
                    className={`border-b ${i % 2 === 0 ? "bg-muted/30" : ""}`}
                  >
                    <td className="p-3 font-semibold">{g.subject.name}</td>
                    <td
                      className={`p-3 text-center font-bold ${
                        g.value < 10
                          ? "text-red-600"
                          : g.value >= 15
                            ? "text-emerald-600"
                            : ""
                      }`}
                    >
                      {g.value.toFixed(2)}
                    </td>
                    <td className="p-3 italic text-muted-foreground">
                      {g.comment ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {grades.length > 0 && (
              <tfoot>
                <tr className="bg-indigo-900 text-white">
                  <td className="p-3 font-bold">Moyenne générale</td>
                  <td className="p-3 text-center font-extrabold text-base">{avg}</td>
                  <td className="p-3 italic">
                    {Number(avg) >= 16
                      ? "Félicitations"
                      : Number(avg) >= 14
                        ? "Encouragements"
                        : Number(avg) >= 10
                          ? "Passable"
                          : "Avertissement"}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>

          {/* Signatures */}
          <div className="flex justify-between mt-8 pt-5 border-t">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-12">
                Signature professeur principal
              </div>
              <div className="border-t pt-1 text-xs text-muted-foreground">—</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-12">
                Cachet et signature directeur
              </div>
              <div className="border-t pt-1 text-xs text-muted-foreground">
                {school?.director ?? "—"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
