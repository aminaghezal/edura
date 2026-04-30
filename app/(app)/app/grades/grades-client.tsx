"use client";

import { useMemo, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { saveGrade } from "./actions";

type Klass = {
  id: string;
  name: string;
  students: { id: string; firstName: string; lastName: string }[];
};
type Subj = { id: string; name: string; code: string };
type Existing = { studentId: string; subjectId: string; value: number };

export function GradesClient({
  classes,
  subjects,
  year,
  trimester,
  existingGrades,
}: {
  classes: Klass[];
  subjects: Subj[];
  year: string;
  trimester: number;
  existingGrades: Existing[];
}) {
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id ?? "");
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const klass = classes.find((c) => c.id === selectedClassId);

  const gradesMap = useMemo(() => {
    const m = new Map<string, number>();
    existingGrades.forEach((g) => m.set(`${g.studentId}-${g.subjectId}`, g.value));
    return m;
  }, [existingGrades]);

  function handleBlur(
    studentId: string,
    subjectId: string,
    rawValue: string,
  ) {
    if (!rawValue.trim()) return;
    const v = Number(rawValue);
    if (isNaN(v) || v < 0 || v > 20) return;
    if (gradesMap.get(`${studentId}-${subjectId}`) === v) return;

    const key = `${studentId}-${subjectId}`;
    setSavingKey(key);

    const fd = new FormData();
    fd.set("studentId", studentId);
    fd.set("subjectId", subjectId);
    fd.set("trimester", String(trimester));
    fd.set("year", year);
    fd.set("value", String(v));

    startTransition(async () => {
      await saveGrade(fd);
      setSavingKey(null);
    });
  }

  if (classes.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-2">Saisie des notes</h1>
        <p className="text-muted-foreground">
          Aucune classe. Créez une classe avant de saisir des notes.
        </p>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-2">Saisie des notes</h1>
        <p className="text-muted-foreground">
          Aucune matière. Créez des matières avant de saisir des notes.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Saisie des notes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Trimestre {trimester} — Année {year || "—"}
          </p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {classes.map((c) => (
          <Button
            key={c.id}
            size="sm"
            variant={c.id === selectedClassId ? "default" : "outline"}
            onClick={() => setSelectedClassId(c.id)}
          >
            {c.name}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0 overflow-auto">
          <table className="w-full text-sm border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 sticky left-0 bg-muted/50 font-semibold">
                  Élève
                </th>
                {subjects.map((s) => (
                  <th key={s.id} className="text-center p-3 font-semibold">
                    {s.name}
                  </th>
                ))}
                <th className="text-center p-3 font-semibold">Moy.</th>
              </tr>
            </thead>
            <tbody>
              {klass?.students.map((stu, i) => {
                const vals: number[] = [];
                subjects.forEach((sub) => {
                  const v = gradesMap.get(`${stu.id}-${sub.id}`);
                  if (v != null) vals.push(v);
                });
                const avg = vals.length
                  ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)
                  : "—";

                return (
                  <tr
                    key={stu.id}
                    className={`border-b ${i % 2 === 0 ? "bg-background" : "bg-muted/20"}`}
                  >
                    <td className="p-3 font-medium sticky left-0 bg-inherit whitespace-nowrap">
                      {stu.firstName} {stu.lastName}
                    </td>
                    {subjects.map((sub) => {
                      const k = `${stu.id}-${sub.id}`;
                      const v = gradesMap.get(k);
                      const saving = savingKey === k;
                      return (
                        <td key={sub.id} className="p-1 text-center">
                          <Input
                            type="number"
                            min={0}
                            max={20}
                            step={0.25}
                            defaultValue={v ?? ""}
                            disabled={saving}
                            onBlur={(e) => handleBlur(stu.id, sub.id, e.target.value)}
                            className="w-16 text-center"
                          />
                        </td>
                      );
                    })}
                    <td className="p-3 text-center font-bold">{avg}</td>
                  </tr>
                );
              })}
              {klass?.students.length === 0 && (
                <tr>
                  <td
                    colSpan={subjects.length + 2}
                    className="p-8 text-center text-muted-foreground"
                  >
                    Aucun élève dans cette classe.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground mt-3">
        Les notes sont enregistrées automatiquement quand vous quittez la cellule.
      </p>
    </div>
  );
}
