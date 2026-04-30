"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { markAttendance } from "./actions";

type Status = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
type Klass = {
  id: string;
  name: string;
  students: {
    id: string;
    firstName: string;
    lastName: string;
    attendance: { status: Status }[];
  }[];
};

const STATES: Status[] = ["PRESENT", "ABSENT", "LATE"];
const labels: Record<Status, string> = {
  PRESENT: "Présent",
  ABSENT: "Absent",
  LATE: "Retard",
  EXCUSED: "Excusé",
};
const colors: Record<Status, string> = {
  PRESENT: "bg-emerald-100 border-emerald-500 text-emerald-700",
  ABSENT: "bg-red-100 border-red-500 text-red-700",
  LATE: "bg-amber-100 border-amber-500 text-amber-700",
  EXCUSED: "bg-blue-100 border-blue-500 text-blue-700",
};

export function AttendanceClient({
  classes,
  todayISO,
}: {
  classes: Klass[];
  todayISO: string;
}) {
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id ?? "");
  const [local, setLocal] = useState<Record<string, Status>>(() => {
    const out: Record<string, Status> = {};
    classes.forEach((c) =>
      c.students.forEach((s) => {
        out[s.id] = s.attendance[0]?.status ?? "PRESENT";
      }),
    );
    return out;
  });
  const [, startTransition] = useTransition();

  const klass = classes.find((c) => c.id === selectedClassId);

  function cycle(studentId: string) {
    const current = local[studentId] ?? "PRESENT";
    const idx = STATES.indexOf(current);
    const next = STATES[(idx + 1) % STATES.length];
    setLocal((p) => ({ ...p, [studentId]: next }));

    const fd = new FormData();
    fd.set("studentId", studentId);
    fd.set("date", todayISO);
    fd.set("status", next);
    startTransition(() => {
      markAttendance(fd);
    });
  }

  function markAll(status: Status) {
    if (!klass) return;
    klass.students.forEach((s) => {
      setLocal((p) => ({ ...p, [s.id]: status }));
      const fd = new FormData();
      fd.set("studentId", s.id);
      fd.set("date", todayISO);
      fd.set("status", status);
      startTransition(() => {
        markAttendance(fd);
      });
    });
  }

  if (classes.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-2">Présences</h1>
        <p className="text-muted-foreground">Aucune classe.</p>
      </div>
    );
  }

  const counts = { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 };
  klass?.students.forEach((s) => counts[local[s.id] ?? "PRESENT"]++);

  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Présences du jour</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date(todayISO).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => markAll("PRESENT")}>
          Tous présents
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex gap-2 flex-wrap">
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
        <div className="ml-auto flex gap-3 text-sm">
          <span className="text-emerald-600 font-semibold">{counts.PRESENT} présents</span>
          <span className="text-red-600 font-semibold">{counts.ABSENT} absents</span>
          <span className="text-amber-600 font-semibold">{counts.LATE} retards</span>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          {klass && klass.students.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {klass.students.map((s) => {
                const status = local[s.id] ?? "PRESENT";
                return (
                  <button
                    key={s.id}
                    onClick={() => cycle(s.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors text-left ${colors[status]}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-white/60 grid place-items-center font-bold flex-shrink-0">
                      {s.firstName[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate text-foreground">
                        {s.firstName} {s.lastName}
                      </div>
                      <div className="text-xs font-semibold mt-0.5">{labels[status]}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground p-8">
              Aucun élève dans cette classe.
            </p>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground mt-3">
        Cliquez sur un élève pour basculer Présent → Absent → Retard.
      </p>
    </div>
  );
}
