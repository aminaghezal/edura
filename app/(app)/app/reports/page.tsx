import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
  Brain,
  GraduationCap,
  Users,
  Compass,
} from "lucide-react";

export default async function ReportsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [students, totalStudents, withReportsCount] = await Promise.all([
    prisma.student.findMany({
      where: { schoolId: session.schoolId, isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        iqScore: true,
        orientationSuggestion: true,
        orientationConfidence: true,
        riskLevel: true,
        class: { select: { name: true } },
        _count: {
          select: { observations: true, grades: true },
        },
      },
      orderBy: { lastName: "asc" },
    }),
    prisma.student.count({
      where: { schoolId: session.schoolId, isActive: true },
    }),
    prisma.student.count({
      where: {
        schoolId: session.schoolId,
        isActive: true,
        OR: [{ iqScore: { not: null } }, { observations: { some: {} } }],
      },
    }),
  ]);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Orientation & Développement
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Rapports Scientifiques
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bilan pédagogique complet de chaque élève — intelligences multiples,
          prédiction d&apos;orientation, perspectives de carrière
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-indigo-700">
              <Users className="w-5 h-5" />
              <span className="text-xs uppercase tracking-wide font-semibold">
                Élèves
              </span>
            </div>
            <div className="text-2xl font-bold mt-2 tabular-nums">
              {totalStudents}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-emerald-700">
              <Brain className="w-5 h-5" />
              <span className="text-xs uppercase tracking-wide font-semibold">
                Avec données IA
              </span>
            </div>
            <div className="text-2xl font-bold mt-2 tabular-nums">
              {withReportsCount}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              IQ ou observations enseignants saisis
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-purple-700">
              <Compass className="w-5 h-5" />
              <span className="text-xs uppercase tracking-wide font-semibold">
                Orientations
              </span>
            </div>
            <div className="text-2xl font-bold mt-2 tabular-nums">
              {students.filter((s) => s.orientationSuggestion).length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Filières prédites par l&apos;IA
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How it works */}
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-transparent">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white grid place-items-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-2">
                Comment fonctionne le rapport scientifique ?
              </h3>
              <ol className="text-xs text-muted-foreground space-y-1 leading-relaxed list-decimal pl-4">
                <li>
                  Le professeur ou directeur saisit le score IQ et les
                  observations enseignants (tags : Linguistique, Logique, etc.)
                </li>
                <li>
                  L&apos;IA d&apos;EDURA croise ces données avec les notes, le
                  style d&apos;apprentissage et les intérêts de l&apos;élève
                </li>
                <li>
                  Le système calcule les 8 intelligences de Gardner, recommande
                  les meilleures filières du BAC algérien, et suggère des
                  carrières adaptées
                </li>
                <li>
                  Le rapport peut être téléchargé en PDF officiel pour remise
                  aux parents
                </li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students list */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Tous les élèves</h2>

        {students.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">
                Aucun élève inscrit. Commencez par les ajouter depuis la page
                Élèves.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {students.map((s, i) => {
              const hasData =
                s.iqScore != null || s._count.observations > 0;
              return (
                <Link
                  key={s.id}
                  href={`/app/students/${s.id}/report`}
                  className="group animate-in fade-in slide-in-from-bottom-2 duration-500"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <Card className="hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/40 transition-all duration-300 h-full">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-full grid place-items-center text-white font-bold flex-shrink-0 ${
                            hasData
                              ? "bg-gradient-to-br from-indigo-500 to-indigo-700"
                              : "bg-muted-foreground/30"
                          }`}
                        >
                          {s.firstName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">
                            {s.firstName} {s.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {s.class?.name ?? "Sans classe"}
                          </div>

                          <div className="flex flex-wrap gap-1 mt-2">
                            {s.iqScore != null && (
                              <Badge variant="secondary" className="text-[10px]">
                                IQ {s.iqScore}
                              </Badge>
                            )}
                            {s.orientationSuggestion && (
                              <Badge variant="outline" className="text-[10px]">
                                {s.orientationSuggestion.split(" ")[0]}
                              </Badge>
                            )}
                            {s._count.observations > 0 && (
                              <Badge
                                variant="outline"
                                className="text-[10px] bg-amber-50"
                              >
                                {s._count.observations} obs.
                              </Badge>
                            )}
                            {!hasData && (
                              <Badge
                                variant="outline"
                                className="text-[10px] text-muted-foreground"
                              >
                                À saisir
                              </Badge>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-primary transition-all flex-shrink-0 mt-2" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
