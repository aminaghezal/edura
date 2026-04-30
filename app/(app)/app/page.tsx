import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight, Brain, Sparkles } from "lucide-react";
import { SeedButton } from "./seed-button";
import { DirectorSummary } from "./director-summary";
import {
  buildSummaryInput,
  generateDirectorSummary,
} from "@/lib/ai/director-summary";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [studentCount, classCount, paymentCount, highRiskCount, topRisks] =
    await Promise.all([
      prisma.student.count({
        where: { schoolId: session.schoolId, isActive: true },
      }),
      prisma.class.count({ where: { schoolId: session.schoolId } }),
      prisma.payment.count({ where: { schoolId: session.schoolId } }),
      prisma.student.count({
        where: { schoolId: session.schoolId, isActive: true, riskLevel: "HIGH" },
      }),
      prisma.student.findMany({
        where: {
          schoolId: session.schoolId,
          isActive: true,
          riskLevel: "HIGH",
        },
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
    ]);

  // Generate director summary on first request (cached briefly)
  let summary: string | null = null;
  if (studentCount > 0) {
    try {
      const input = await buildSummaryInput(session.schoolId);
      summary = await generateDirectorSummary(input);
    } catch (err) {
      console.error("[dashboard] summary failed:", err);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">
          Bienvenue, {session.name} — {session.role}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Élèves" value={studentCount} />
        <StatCard label="Classes" value={classCount} />
        <StatCard label="Paiements" value={paymentCount} />
        <StatCard
          label="Risque élevé"
          value={highRiskCount}
          color="text-red-600"
        />
      </div>

      {/* Director summary (Claude) */}
      {summary && (
        <Card className="mb-6 border-indigo-200">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 grid place-items-center flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs uppercase tracking-wide font-semibold text-indigo-700 mb-1">
                  Résumé de la semaine — Assistant IA
                </div>
                <DirectorSummary initialSummary={summary} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top risks */}
      {topRisks.length > 0 && (
        <Card className="mb-6">
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
              {topRisks.map((s) => (
                <div
                  key={s.id}
                  className="flex items-start gap-3 p-3 rounded-md border bg-muted/30"
                >
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 grid place-items-center font-bold text-sm flex-shrink-0">
                    {s.firstName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-sm">
                        {s.firstName} {s.lastName}
                      </span>
                      <Badge variant="destructive" className="text-xs">
                        {s.riskScore}/100
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {s.class?.name ?? "—"} — {s.riskRationale ?? ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {studentCount === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold">Données de démonstration</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Votre compte est vide. Cliquez ci-dessous pour générer 40 élèves,
              4 classes, 9 matières, des notes, des présences, des paiements et
              un emploi du temps — pour explorer toutes les fonctionnalités.
            </p>
            <SeedButton />
          </CardContent>
        </Card>
      )}

      {studentCount > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold mb-2">Réinitialiser les données</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Cliquer ré-écrase toutes les données par un nouveau jeu de
              démonstration. (Mode développement uniquement.)
            </p>
            <SeedButton />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
          {label}
        </div>
        <div className={`text-2xl font-bold mt-1 ${color ?? ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
