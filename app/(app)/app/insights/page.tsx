import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown, Users, Brain } from "lucide-react";
import { RecomputeButton } from "./recompute-button";

export default async function InsightsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [highRisk, mediumRiskCount, totalActive, avgRisk] = await Promise.all([
    prisma.student.findMany({
      where: { schoolId: session.schoolId, isActive: true, riskLevel: "HIGH" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        riskScore: true,
        riskRationale: true,
        class: { select: { name: true } },
      },
      orderBy: { riskScore: "desc" },
      take: 20,
    }),
    prisma.student.count({
      where: { schoolId: session.schoolId, isActive: true, riskLevel: "MODERATE" },
    }),
    prisma.student.count({
      where: { schoolId: session.schoolId, isActive: true },
    }),
    prisma.student.aggregate({
      where: { schoolId: session.schoolId, isActive: true, riskScore: { not: null } },
      _avg: { riskScore: true },
    }),
  ]);

  const stats = [
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      label: "Risque élevé",
      value: highRisk.length,
      color: "text-red-600",
    },
    {
      icon: <TrendingDown className="w-5 h-5" />,
      label: "Risque modéré",
      value: mediumRiskCount,
      color: "text-amber-600",
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Élèves actifs",
      value: totalActive,
      color: "text-foreground",
    },
    {
      icon: <Brain className="w-5 h-5" />,
      label: "Score moyen IA",
      value: avgRisk._avg.riskScore?.toFixed(0) ?? "—",
      color: "text-indigo-600",
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Analyses IA</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Détection des risques de décrochage et recommandations
          </p>
        </div>
        <RecomputeButton />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className={`flex items-center gap-2 ${s.color}`}>
                {s.icon}
                <span className="text-xs uppercase tracking-wide font-semibold">
                  {s.label}
                </span>
              </div>
              <div className="text-2xl font-bold mt-2">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-lg font-semibold">Élèves prioritaires</h2>
        <Badge variant="destructive">{highRisk.length}</Badge>
      </div>

      {highRisk.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Brain className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="font-semibold mb-1">Aucune alerte pour le moment.</p>
            <p className="text-sm">
              Les scores IA sont calculés automatiquement chaque nuit.
              <br />
              (Module IA actif en Phase 5.)
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {highRisk.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 grid place-items-center font-bold">
                    {s.firstName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <div className="font-semibold">
                        {s.firstName} {s.lastName}
                        <span className="text-muted-foreground font-normal ml-2 text-sm">
                          {s.class?.name ?? "—"}
                        </span>
                      </div>
                      <Badge variant="destructive">{s.riskScore}/100</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {s.riskRationale ?? "Analyse en cours…"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
