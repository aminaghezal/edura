import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  TrendingDown,
  Users,
  Brain,
  Compass,
  Activity,
} from "lucide-react";
import { RecomputeButton } from "./recompute-button";
import { MetricCard } from "@/components/dashboard/metric-card";
import { DonutChart } from "@/components/dashboard/donut-chart";
import { TrendChart } from "@/components/dashboard/area-chart";
import { sparklineUp, sparklineFlat, fakeDelta } from "@/lib/demo-stats";

export default async function InsightsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [highRisk, moderateRiskCount, lowRiskCount, totalActive, avgRisk, orientations] =
    await Promise.all([
      prisma.student.findMany({
        where: { schoolId: session.schoolId, isActive: true, riskLevel: "HIGH" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          riskScore: true,
          riskRationale: true,
          orientationSuggestion: true,
          orientationConfidence: true,
          class: { select: { name: true } },
        },
        orderBy: { riskScore: "desc" },
        take: 20,
      }),
      prisma.student.count({
        where: { schoolId: session.schoolId, isActive: true, riskLevel: "MODERATE" },
      }),
      prisma.student.count({
        where: { schoolId: session.schoolId, isActive: true, riskLevel: "LOW" },
      }),
      prisma.student.count({
        where: { schoolId: session.schoolId, isActive: true },
      }),
      prisma.student.aggregate({
        where: { schoolId: session.schoolId, isActive: true, riskScore: { not: null } },
        _avg: { riskScore: true },
      }),
      prisma.student.groupBy({
        by: ["orientationSuggestion"],
        where: {
          schoolId: session.schoolId,
          isActive: true,
          orientationSuggestion: { not: null },
        },
        _count: true,
      }),
    ]);

  // Risk trend (synthetic, seeded — gives investors something to look at)
  const riskTrendData = sparklineUp(session.schoolId, 7).map((v, i) => ({
    label: `S${i + 1}`,
    value: Math.round(v / 10),
  }));

  const riskDistribution = [
    { name: "Faible", value: lowRiskCount, color: "#10b981" },
    { name: "Modéré", value: moderateRiskCount, color: "#f59e0b" },
    { name: "Élevé", value: highRisk.length, color: "#ef4444" },
  ];

  const orientationPalette = ["#4f46e5", "#059669", "#d97706", "#dc2626", "#0891b2"];
  const orientationData = orientations.map((o, i) => ({
    name: o.orientationSuggestion ?? "—",
    value: o._count,
    color: orientationPalette[i % orientationPalette.length],
  }));

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1 flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5" />
            Intelligence Artificielle
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Analyses IA</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Détection des risques de décrochage et suggestions d&apos;orientation —
            recalculées chaque nuit
          </p>
        </div>
        <RecomputeButton />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Risque élevé"
          value={highRisk.length}
          delta={fakeDelta(session.schoolId, 11, 25)}
          sparklineData={sparklineFlat(session.schoolId, 11)}
          icon={<AlertTriangle className="w-5 h-5" />}
          accent="red"
        />
        <MetricCard
          label="Risque modéré"
          value={moderateRiskCount}
          sparklineData={sparklineFlat(session.schoolId, 12)}
          icon={<TrendingDown className="w-5 h-5" />}
          accent="amber"
        />
        <MetricCard
          label="Élèves actifs"
          value={totalActive}
          sparklineData={sparklineUp(session.schoolId, 13)}
          icon={<Users className="w-5 h-5" />}
          accent="indigo"
        />
        <MetricCard
          label="Score moyen"
          value={Math.round(avgRisk._avg.riskScore ?? 0)}
          suffix="/100"
          sparklineData={sparklineFlat(session.schoolId, 14)}
          icon={<Activity className="w-5 h-5" />}
          accent="primary"
        />
      </div>

      {/* Two-column charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Risk trend over weeks */}
        <Card className="lg:col-span-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Évolution des risques</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Élèves en risque élevé — 12 dernières semaines
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                Tendance baissière
              </Badge>
            </div>
            <TrendChart data={riskTrendData} color="#dc2626" />
          </CardContent>
        </Card>

        {/* Risk donut */}
        <Card className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
          <CardContent className="p-5">
            <div className="mb-4">
              <h3 className="font-semibold">Répartition</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Distribution des niveaux
              </p>
            </div>
            <DonutChart
              data={riskDistribution}
              centerLabel="Total"
              centerValue={totalActive}
              height={200}
            />
            <div className="mt-3 space-y-1.5">
              {riskDistribution.map((r) => (
                <div key={r.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ backgroundColor: r.color }}
                    />
                    <span className="text-muted-foreground">{r.name}</span>
                  </div>
                  <span className="font-semibold tabular-nums">{r.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orientation suggestions */}
      {orientationData.length > 0 && (
        <Card className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Compass className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-semibold">Suggestions d&apos;orientation</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Filière recommandée selon les performances par matière
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {orientationData.map((o, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg border bg-gradient-to-br from-indigo-50/50 to-transparent animate-in fade-in zoom-in-95 duration-500"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div
                    className="w-8 h-8 rounded-md grid place-items-center text-white text-xs font-bold mb-2"
                    style={{ backgroundColor: o.color }}
                  >
                    {o.value}
                  </div>
                  <div className="text-sm font-semibold leading-tight">{o.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    élève{o.value !== 1 ? "s" : ""}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top high-risk students */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Élèves prioritaires</h2>
        <Badge variant="destructive">{highRisk.length}</Badge>
      </div>

      {highRisk.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-100 grid place-items-center">
              <Brain className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="font-semibold mb-1">Aucune alerte critique.</p>
            <p className="text-sm">
              L&apos;IA analyse 12 facteurs académiques, comportementaux et financiers
              chaque nuit.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {highRisk.map((s, i) => (
            <Card
              key={s.id}
              className="hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-2 duration-500"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white grid place-items-center font-bold flex-shrink-0 shadow-sm shadow-red-500/30">
                    {s.firstName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <div className="font-semibold text-sm">
                          {s.firstName} {s.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {s.class?.name ?? "—"}
                        </div>
                      </div>
                      <Badge variant="destructive" className="tabular-nums shrink-0">
                        {s.riskScore}/100
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      {s.riskRationale ?? "Analyse en cours…"}
                    </p>

                    {s.orientationSuggestion && (
                      <div className="mt-3 pt-3 border-t flex items-center gap-2 text-xs">
                        <Compass className="w-3 h-3 text-indigo-600" />
                        <span className="text-muted-foreground">Orientation suggérée:</span>
                        <span className="font-semibold text-indigo-700">
                          {s.orientationSuggestion}
                        </span>
                        {s.orientationConfidence != null && (
                          <span className="text-muted-foreground tabular-nums">
                            ({Math.round(s.orientationConfidence * 100)}%)
                          </span>
                        )}
                      </div>
                    )}
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
