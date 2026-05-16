import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  Sparkles,
  Users,
  GraduationCap,
  TrendingUp,
  Banknote,
  CheckCircle2,
  UserPlus,
  CreditCard,
} from "lucide-react";
import { SeedButton } from "./seed-button";
import { DirectorSummary } from "./director-summary";
import { MetricCard } from "@/components/dashboard/metric-card";
import { TrendChart } from "@/components/dashboard/area-chart";
import { DonutChart } from "@/components/dashboard/donut-chart";
import { VerticalBarChart } from "@/components/dashboard/bar-chart";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import {
  buildSummaryInput,
  generateDirectorSummary,
} from "@/lib/ai/director-summary";
import {
  enrollmentTrend,
  attendanceTrend,
  sparklineUp,
  sparklineFlat,
  fakeDelta,
  classPerformance,
} from "@/lib/demo-stats";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [
    studentCount,
    classCount,
    highRiskCount,
    moderateRiskCount,
    topRisks,
    classes,
    payments,
  ] = await Promise.all([
    prisma.student.count({
      where: { schoolId: session.schoolId, isActive: true },
    }),
    prisma.class.count({ where: { schoolId: session.schoolId } }),
    prisma.student.count({
      where: { schoolId: session.schoolId, isActive: true, riskLevel: "HIGH" },
    }),
    prisma.student.count({
      where: { schoolId: session.schoolId, isActive: true, riskLevel: "MODERATE" },
    }),
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
      take: 5,
    }),
    prisma.class.findMany({
      where: { schoolId: session.schoolId },
      select: {
        name: true,
        students: {
          where: { isActive: true },
          select: { grades: { select: { value: true } } },
        },
      },
    }),
    prisma.payment.findMany({
      where: { schoolId: session.schoolId },
      select: { amountDue: true, amountPaid: true, status: true },
    }),
  ]);

  // ── Computed metrics ──
  const totalCollected = payments.reduce((a, p) => a + p.amountPaid, 0);
  const totalDue = payments.reduce((a, p) => a + p.amountDue, 0);
  const collectionRate = totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 0;
  const lowRiskCount = studentCount - highRiskCount - moderateRiskCount;

  // ── Generate AI summary ──
  let summary: string | null = null;
  if (studentCount > 0) {
    try {
      const input = await buildSummaryInput(session.schoolId);
      summary = await generateDirectorSummary(input);
    } catch (err) {
      console.error("[dashboard] summary failed:", err);
    }
  }

  // ── Demo-time data for charts ──
  const enrollmentData = enrollmentTrend(session.schoolId, studentCount);
  const attendanceData = attendanceTrend(session.schoolId);
  const classPerf = classPerformance(classes);

  const riskDistribution = [
    { name: "Risque faible", value: lowRiskCount, color: "#10b981" },
    { name: "Risque modéré", value: moderateRiskCount, color: "#f59e0b" },
    { name: "Risque élevé", value: highRiskCount, color: "#ef4444" },
  ].filter((r) => r.value > 0);

  return (
    <div className="p-8 space-y-6">
      {/* ── Header ── */}
      <div className="flex items-end justify-between flex-wrap gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1">
            Bonjour, {session.name.split(" ")[0]} 👋
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vue d&apos;ensemble de votre établissement en temps réel
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Système actif
          </span>
        </div>
      </div>

      {/* ── Empty state ── */}
      {studentCount === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-semibold">Démarrez avec des données de démo</h2>
                <p className="text-sm text-muted-foreground">
                  40 élèves, 4 classes, AI insights — tout sera généré en 5 secondes.
                </p>
              </div>
            </div>
            <SeedButton />
          </CardContent>
        </Card>
      )}

      {studentCount > 0 && (
        <>
          {/* ── Hero metric cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Élèves inscrits"
              value={studentCount}
              delta={fakeDelta(session.schoolId, 1, 12)}
              sparklineData={sparklineUp(session.schoolId, 1)}
              icon={<Users className="w-5 h-5" />}
              accent="indigo"
            />
            <MetricCard
              label="Classes"
              value={classCount}
              sparklineData={sparklineFlat(session.schoolId, 2)}
              icon={<GraduationCap className="w-5 h-5" />}
              accent="primary"
            />
            <MetricCard
              label="Taux de recouvrement"
              value={collectionRate}
              suffix="%"
              delta={fakeDelta(session.schoolId, 3, 8)}
              sparklineData={sparklineUp(session.schoolId, 3)}
              icon={<Banknote className="w-5 h-5" />}
              accent="emerald"
            />
            <MetricCard
              label="Risque élevé"
              value={highRiskCount}
              delta={fakeDelta(session.schoolId, 4, 20)}
              sparklineData={sparklineFlat(session.schoolId, 4)}
              icon={<AlertTriangle className="w-5 h-5" />}
              accent="red"
            />
          </div>

          {/* ── AI Summary ── */}
          {summary && (
            <Card className="relative overflow-hidden border-indigo-200/60 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
              <CardContent className="relative p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white grid place-items-center flex-shrink-0 shadow-md shadow-indigo-500/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs uppercase tracking-wide font-bold text-indigo-700">
                        Assistant IA — Résumé hebdomadaire
                      </span>
                      <Badge variant="secondary" className="text-[10px] h-5">
                        Beta
                      </Badge>
                    </div>
                    <DirectorSummary initialSummary={summary} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Charts grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Enrollment trend */}
            <Card className="lg:col-span-2 animate-in fade-in slide-in-from-bottom-3 duration-700">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Évolution des inscriptions</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      12 derniers mois
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{Math.abs(fakeDelta(session.schoolId, 1, 12))}% sur l&apos;année
                  </div>
                </div>
                <TrendChart data={enrollmentData} color="#4f46e5" />
              </CardContent>
            </Card>

            {/* Risk distribution donut */}
            <Card className="animate-in fade-in slide-in-from-bottom-3 duration-700 delay-100">
              <CardContent className="p-5">
                <div className="mb-4">
                  <h3 className="font-semibold">Répartition des risques</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Analyse IA — temps réel
                  </p>
                </div>
                <DonutChart
                  data={riskDistribution}
                  centerLabel="Élèves"
                  centerValue={studentCount}
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

          {/* ── Second row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Class performance */}
            <Card className="lg:col-span-2 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Performance par classe</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Moyenne générale /20
                    </p>
                  </div>
                </div>
                {classPerf.length > 0 ? (
                  <VerticalBarChart data={classPerf} unit="/20" />
                ) : (
                  <p className="text-sm text-muted-foreground py-12 text-center">
                    Pas encore de notes saisies.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Activity feed */}
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-700 delay-300">
              <ActivityFeed
                items={[
                  {
                    icon: <CheckCircle2 className="w-4 h-4" />,
                    title: "Notes T2 enregistrées",
                    description: "Mathématiques — 1ère AS Sciences",
                    timestamp: "Il y a 12 min",
                    iconBg: "bg-emerald-100",
                    iconColor: "text-emerald-700",
                  },
                  {
                    icon: <UserPlus className="w-4 h-4" />,
                    title: "Nouvel élève inscrit",
                    description: "Yasmine Kaci — 2ème AS",
                    timestamp: "Il y a 1 h",
                    iconBg: "bg-indigo-100",
                    iconColor: "text-indigo-700",
                  },
                  {
                    icon: <CreditCard className="w-4 h-4" />,
                    title: "Paiement reçu",
                    description: "25 000 DZD — Trimestre 2",
                    timestamp: "Il y a 3 h",
                    iconBg: "bg-emerald-100",
                    iconColor: "text-emerald-700",
                  },
                  {
                    icon: <AlertTriangle className="w-4 h-4" />,
                    title: "Alerte IA",
                    description: "3 élèves en risque détectés",
                    timestamp: "Il y a 6 h",
                    iconBg: "bg-red-100",
                    iconColor: "text-red-700",
                  },
                  {
                    icon: <Brain className="w-4 h-4" />,
                    title: "Analyse IA terminée",
                    description: "40 élèves analysés en 1.2s",
                    timestamp: "Hier — 02:00",
                    iconBg: "bg-indigo-100",
                    iconColor: "text-indigo-700",
                  },
                ]}
              />
            </div>
          </div>

          {/* ── Top risks ── */}
          {topRisks.length > 0 && (
            <Card className="animate-in fade-in slide-in-from-bottom-3 duration-700 delay-300">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h2 className="font-semibold">Élèves prioritaires</h2>
                    <Badge variant="destructive">{topRisks.length}</Badge>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/app/insights" className="gap-1">
                      Voir tout
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>

                <div className="space-y-2">
                  {topRisks.map((s, i) => (
                    <div
                      key={s.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-gradient-to-r from-red-50/50 to-transparent hover:border-red-200 hover:shadow-sm transition-all animate-in fade-in slide-in-from-left-2 duration-500"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <div className="w-9 h-9 rounded-full bg-red-100 text-red-700 grid place-items-center font-bold text-sm flex-shrink-0">
                        {s.firstName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold text-sm">
                            {s.firstName} {s.lastName}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-muted-foreground">
                              {s.class?.name ?? "—"}
                            </div>
                            <Badge variant="destructive" className="text-xs tabular-nums">
                              {s.riskScore}/100
                            </Badge>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {s.riskRationale ?? ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Quick access: Scientific Reports ── */}
          <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/50 via-transparent to-purple-50/30">
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white grid place-items-center flex-shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Rapports Scientifiques d&apos;Orientation</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Bilan pédagogique complet par élève — intelligences multiples, prédiction d&apos;orientation, métiers
                    </p>
                  </div>
                </div>
                <Button asChild>
                  <Link href="/app/reports">
                    Explorer
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ── Reset demo ── */}
          <Card className="border-dashed">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="text-sm font-semibold">Données de démonstration</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Réinitialiser pour générer un nouveau jeu de données.
                  </p>
                </div>
                <SeedButton />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
