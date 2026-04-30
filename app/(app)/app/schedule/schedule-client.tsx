"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi"]; // Algerian week
const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

type Schedule = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string | null;
  subject: { name: string };
};

export function ScheduleClient({
  classes,
  selectedId,
  schedules,
}: {
  classes: { id: string; name: string }[];
  selectedId: string | null;
  schedules: Schedule[];
}) {
  const router = useRouter();

  if (classes.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-2">Emploi du temps</h1>
        <p className="text-muted-foreground">Aucune classe.</p>
      </div>
    );
  }

  // Map (day, hour) → schedule entry
  const grid = new Map<string, Schedule>();
  schedules.forEach((s) => {
    grid.set(`${s.dayOfWeek}-${s.startTime}`, s);
  });

  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Emploi du temps</h1>
          <p className="text-sm text-muted-foreground mt-1">Semaine type</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {classes.map((c) => (
          <Button
            key={c.id}
            size="sm"
            variant={c.id === selectedId ? "default" : "outline"}
            onClick={() => router.push(`/app/schedule?class=${c.id}`)}
          >
            {c.name}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0 overflow-auto">
          <table className="w-full text-sm border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-semibold w-20">Heure</th>
                {DAYS.map((d, i) => (
                  <th key={i} className="p-3 text-center font-semibold">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((h) => (
                <tr key={h} className="border-b">
                  <td className="p-2 text-xs font-medium text-muted-foreground">
                    {h}
                  </td>
                  {DAYS.map((_, dayIdx) => {
                    const entry = grid.get(`${dayIdx}-${h}`);
                    return (
                      <td key={dayIdx} className="p-1 align-top">
                        {entry ? (
                          <div className="bg-indigo-100 border border-indigo-300 rounded p-2 text-xs">
                            <div className="font-semibold text-indigo-900">
                              {entry.subject.name}
                            </div>
                            {entry.room && (
                              <div className="text-indigo-700 mt-0.5">
                                Salle {entry.room}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-12" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {schedules.length === 0 && (
        <p className="text-sm text-muted-foreground mt-4">
          Aucune séance programmée. (L&apos;ajout de cours est prévu en Phase 4.)
        </p>
      )}
    </div>
  );
}
