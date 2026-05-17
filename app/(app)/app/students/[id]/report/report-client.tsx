"use client";

import { useState, useTransition } from "react";
import {
  GraduationCap,
  MessageCircle,
  Brain,
  Sparkles,
  Download,
  Settings,
  Trash2,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowLeft,
  Lightbulb,
  Info,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TrendChart } from "@/components/dashboard/area-chart";
import { DonutChart } from "@/components/dashboard/donut-chart";
import { VerticalBarChart } from "@/components/dashboard/bar-chart";
import type { ScientificReport } from "@/lib/orientation/profile";
import {
  updateStudentProfile,
  addObservation,
  deleteObservation,
} from "./actions";

type RawObs = {
  id: string;
  teacherName: string;
  subjectName: string | null;
  observation: string;
  advice: string | null;
  intelligenceTags: string | null;
  createdAt: string;
};

const INTELLIGENCE_COLORS = [
  "#16a34a", // green
  "#0891b2", // cyan
  "#9333ea", // purple
  "#ea580c", // orange
  "#dc2626", // red
];

const INTEREST_COLORS = ["#16a34a", "#0891b2", "#ea580c", "#9333ea", "#dc2626"];

export function ReportClient({
  student,
  report,
  observationsRaw,
  subjects,
  school,
}: {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    firstNameAr: string;
    lastNameAr: string;
    iqScore: number | null;
    iqTestName: string | null;
    iqTestDate: string | null;
    learningStyle: string | null;
    hobbies: string | null;
    interests: string | null;
  };
  report: ScientificReport;
  observationsRaw: RawObs[];
  subjects: { id: string; name: string }[];
  school: { name: string; wilaya: string; director: string };
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [obsOpen, setObsOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("studentId", student.id);
    startTransition(async () => {
      const r = await updateStudentProfile(fd);
      if (r.ok) setProfileOpen(false);
    });
  }

  function handleObsSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("studentId", student.id);
    startTransition(async () => {
      const r = await addObservation(fd);
      if (r.ok) {
        setObsOpen(false);
        (e.target as HTMLFormElement).reset();
      }
    });
  }

  function handleDeleteObs(id: string) {
    if (!confirm("Supprimer cette observation ?")) return;
    startTransition(async () => {
      await deleteObservation(id);
    });
  }

  const intelligenceData = report.profile.intelligences.map((i, idx) => ({
    name: i.label,
    value: i.score,
    color: INTELLIGENCE_COLORS[idx % INTELLIGENCE_COLORS.length],
  }));

  // Use best subjects as "interests" bar chart if no manual interests
  const interestData =
    report.academic.bestSubjects.length > 0
      ? report.academic.bestSubjects.map((s, i) => ({
          label: s.name.length > 8 ? s.name.slice(0, 8) + "…" : s.name,
          value: s.gpa,
          color: INTEREST_COLORS[i % INTEREST_COLORS.length],
        }))
      : [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground print:hidden">
        <Link href="/app/reports" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" />
          Tous les rapports
        </Link>
        <span>/</span>
        <Link href="/app/students" className="hover:text-foreground transition-colors">
          Élèves
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{report.meta.studentName}</span>
      </div>

      {/* Header — print-friendly */}
      <div className="flex items-end justify-between flex-wrap gap-3 animate-in fade-in slide-in-from-top-2 duration-500 print:hidden">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Rapport Scientifique
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bilan Pédagogique et d&apos;Orientation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {report.meta.studentName} — {report.meta.className}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Saisie IQ & Profil
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Profil de l&apos;élève</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleProfileSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="iqScore">Score IQ (40-200)</Label>
                    <Input
                      id="iqScore"
                      name="iqScore"
                      type="number"
                      min={40}
                      max={200}
                      defaultValue={student.iqScore ?? ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="iqTestName">Test utilisé</Label>
                    <Input
                      id="iqTestName"
                      name="iqTestName"
                      placeholder="WISC-V, Raven, etc."
                      defaultValue={student.iqTestName ?? ""}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="iqTestDate">Date du test</Label>
                  <Input
                    id="iqTestDate"
                    name="iqTestDate"
                    type="date"
                    defaultValue={student.iqTestDate?.slice(0, 10) ?? ""}
                  />
                </div>
                <div>
                  <Label htmlFor="learningStyle">Style d&apos;apprentissage</Label>
                  <select
                    id="learningStyle"
                    name="learningStyle"
                    defaultValue={student.learningStyle ?? "MIXED"}
                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="MIXED">Mixte (Auditif + Visuel)</option>
                    <option value="VISUAL">Visuel</option>
                    <option value="AUDITORY">Auditif</option>
                    <option value="KINESTHETIC">Kinesthésique</option>
                    <option value="READING_WRITING">Lecture-Écriture</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="interests">
                    Intérêts (séparés par virgule)
                  </Label>
                  <Input
                    id="interests"
                    name="interests"
                    placeholder="sciences, art, technologie, sport"
                    defaultValue={student.interests ?? ""}
                  />
                </div>
                <div>
                  <Label htmlFor="hobbies">Loisirs (séparés par virgule)</Label>
                  <Input
                    id="hobbies"
                    name="hobbies"
                    placeholder="lecture, échecs, football"
                    defaultValue={student.hobbies ?? ""}
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setProfileOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={pending}>
                    {pending ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={obsOpen} onOpenChange={setObsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter observation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Nouvelle observation</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleObsSubmit} className="space-y-3">
                <div>
                  <Label htmlFor="subjectId">Matière</Label>
                  <select
                    id="subjectId"
                    name="subjectId"
                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">— Observation générale —</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="observation">Observation</Label>
                  <Textarea
                    id="observation"
                    name="observation"
                    rows={3}
                    placeholder="Très bon raisonnement logique, manque encore de confiance en oral..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="advice">Conseil (optionnel)</Label>
                  <Textarea
                    id="advice"
                    name="advice"
                    rows={2}
                    placeholder="Encourager la prise de parole en classe..."
                  />
                </div>
                <div>
                  <Label htmlFor="intelligenceTags">
                    Profils observés (séparés par virgule)
                  </Label>
                  <select
                    id="intelligenceTags"
                    name="intelligenceTags"
                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                    defaultValue=""
                  >
                    <option value="">— Aucun —</option>
                    <option value="LINGUISTIC">Linguistique</option>
                    <option value="LOGICAL">Logique-Mathématique</option>
                    <option value="SPATIAL">Visuo-Spatiale</option>
                    <option value="BODILY">Kinesthésique</option>
                    <option value="MUSICAL">Musicale</option>
                    <option value="INTERPERSONAL">Interpersonnelle</option>
                    <option value="INTRAPERSONAL">Intrapersonnelle</option>
                    <option value="NATURALIST">Naturaliste</option>
                  </select>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setObsOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={pending}>
                    {pending ? "Ajout..." : "Ajouter"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button size="sm" asChild>
            <a
              href={`/api/students/${student.id}/scientific-report/pdf`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger PDF
            </a>
          </Button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          PRINTABLE REPORT BODY — reproduit la maquette officielle
          ════════════════════════════════════════════════════════════ */}
      <div id="report-printable" className="space-y-4">
        {/* HEADER — EDURA Institution style */}
        <Card className="overflow-hidden border-2 border-indigo-200">
          <CardContent className="p-6 bg-gradient-to-r from-indigo-50 via-white to-purple-50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white grid place-items-center font-extrabold leading-tight shadow-md shadow-indigo-500/30">
                  <div className="text-center">
                    <div className="text-[9px] opacity-80">EDURA</div>
                    <div className="text-[7px] opacity-60 -mt-0.5">v1.0</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-indigo-900">
                    منصة إيدورا — التربية الذكية
                  </div>
                  <div className="text-xs text-slate-600">
                    EDURA — Plateforme Intelligente de Gestion Scolaire
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {school.name} — {school.wilaya}
                  </div>
                </div>
              </div>

              <div className="text-center flex-1">
                <div className="text-xs text-indigo-700 font-bold">
                  التقرير العلمي الشامل للطالب
                </div>
                <div className="text-lg font-extrabold text-slate-900 mt-1">
                  RAPPORT SCIENTIFIQUE ET D&apos;ORIENTATION
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Bilan Pédagogique et d&apos;Orientation Complet
                </div>
                <div className="text-[10px] text-indigo-500 mt-1 italic">
                  « Révélons les talents, construisons l&apos;avenir »
                </div>
              </div>

              <div className="text-right text-xs leading-relaxed">
                <div>
                  <span className="text-slate-500">Nom :</span>{" "}
                  <span className="font-bold">{report.meta.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-500">Classe :</span>{" "}
                  <span className="font-semibold">{report.meta.className}</span>
                </div>
                <div>
                  <span className="text-slate-500">Année :</span>{" "}
                  <span className="font-semibold">2025-2026</span>
                </div>
                {report.meta.iq.score && (
                  <div>
                    <span className="text-slate-500">QI :</span>{" "}
                    <span className="font-bold text-emerald-700">
                      {report.meta.iq.score}
                    </span>{" "}
                    <span className="text-slate-500">
                      ({report.meta.iq.interpretation})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Section 1: SYNTHÈSE ACADÉMIQUE (green) ─── */}
        <ReportSection
          number={1}
          title="SYNTHÈSE ACADÉMIQUE"
          titleAr="نظرة عامة أكاديمية"
          color="emerald"
          icon={<GraduationCap className="w-5 h-5" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-sm mb-3 text-emerald-800">
                Meilleures matières
              </h4>
              <ul className="space-y-1.5 text-sm">
                {report.academic.bestSubjects.map((s, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{s.name}</span>
                    <span className="font-semibold tabular-nums text-emerald-700">
                      {s.gpa}/20
                    </span>
                  </li>
                ))}
              </ul>

              {report.academic.weakSubjects.length > 0 && (
                <>
                  <h4 className="font-semibold text-sm mb-3 mt-5 text-red-700">
                    À renforcer
                  </h4>
                  <ul className="space-y-1.5 text-sm">
                    {report.academic.weakSubjects.map((s, i) => (
                      <li key={i} className="flex justify-between">
                        <span>{s.name}</span>
                        <span className="font-semibold tabular-nums text-red-600">
                          {s.gpa}/20
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm text-emerald-800">
                  Progression Moyenne (GPA)
                </h4>
                <Badge
                  variant={
                    report.academic.progressionLabel === "EN_PROGRESSION"
                      ? "default"
                      : report.academic.progressionLabel === "EN_BAISSE"
                        ? "destructive"
                        : "secondary"
                  }
                  className="text-[10px]"
                >
                  {report.academic.progressionLabel === "EN_PROGRESSION" && (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  )}
                  {report.academic.progressionLabel === "EN_BAISSE" && (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {report.academic.progressionLabel === "STABLE" && (
                    <Minus className="w-3 h-3 mr-1" />
                  )}
                  {report.academic.progressionLabel === "EN_PROGRESSION"
                    ? "En progression"
                    : report.academic.progressionLabel === "EN_BAISSE"
                      ? "En baisse"
                      : "Stable"}
                </Badge>
              </div>
              {report.academic.gpaTrend.length > 0 ? (
                <TrendChart
                  data={report.academic.gpaTrend.map((t) => ({
                    label: `T${t.trimester}`,
                    value: t.gpa,
                  }))}
                  height={180}
                  color="#16a34a"
                  unit="/20"
                />
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  Aucune note saisie pour le moment.
                </p>
              )}
              <div className="mt-2 text-center text-xs text-muted-foreground">
                Moyenne générale :{" "}
                <span className="font-bold text-base text-slate-900 tabular-nums">
                  {report.academic.overallGpa}/20
                </span>
              </div>
            </div>
          </div>
        </ReportSection>

        <InterpretationBox title="Comment lire cette section ?" color="emerald">
          <p>
            <strong>Le GPA</strong> (Grade Point Average) est la moyenne générale de l&apos;élève sur 20. Un GPA supérieur à 14/20 indique de bons résultats ; entre 10 et 14/20, des résultats moyens ; en dessous de 10/20, un soutien est recommandé.
          </p>
          <p>
            <strong>La courbe de progression</strong> montre l&apos;évolution trimestre par trimestre. Une courbe ascendante signale une amélioration ; descendante, un essoufflement à surveiller.
          </p>
          <p>
            <strong>Les matières fortes</strong> révèlent les domaines d&apos;excellence — précieux pour orienter l&apos;élève. Les matières faibles indiquent où concentrer le soutien scolaire.
          </p>
        </InterpretationBox>

        {/* ─── Section 2: COMMENTAIRES DES ENSEIGNANTS (red) ─── */}
        <ReportSection
          number={2}
          title="COMMENTAIRES DES ENSEIGNANTS"
          titleAr="ملاحظات الأساتذة"
          color="red"
          icon={<MessageCircle className="w-5 h-5" />}
        >
          {report.observations.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center italic">
              Aucune observation enregistrée. Cliquez sur «Ajouter observation»
              pour commencer.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {report.observations.slice(0, 6).map((o, i) => {
                const raw = observationsRaw[i];
                return (
                  <div
                    key={i}
                    className="p-3 rounded-lg border-l-4 border-red-400 bg-red-50/50 group relative"
                  >
                    <button
                      onClick={() => raw && handleDeleteObs(raw.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-200 print:hidden"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </button>
                    <div className="text-xs font-bold text-red-800 uppercase">
                      {o.subjectName}
                    </div>
                    <p className="text-sm mt-1 leading-relaxed">
                      {o.observation}
                    </p>
                    {o.advice && (
                      <p className="text-xs text-slate-600 mt-2 italic">
                        💡 {o.advice}
                      </p>
                    )}
                    <div className="mt-2 pt-2 border-t border-red-200/50 text-[11px] text-slate-500 italic">
                      Signature : {o.teacherName}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ReportSection>

        <InterpretationBox title="Pourquoi les observations des enseignants sont importantes ?" color="red">
          <p>
            <strong>Les observations qualitatives</strong> capturent ce que les notes ne disent pas : comportement, motivation, leadership, créativité, capacité d&apos;écoute, esprit d&apos;équipe.
          </p>
          <p>
            Chaque enseignant peut <strong>tagger les intelligences observées</strong> (Linguistique, Logique, Interpersonnelle, etc.) — ces tags enrichissent automatiquement le profil psychopédagogique calculé en section 3.
          </p>
          <p>
            <strong>Pour les parents</strong> : ces commentaires sont précieux pour comprendre votre enfant au-delà des notes et orienter les discussions à la maison.
          </p>
        </InterpretationBox>

        {/* ─── Section 3: PROFIL PSYCHOPÉDAGOGIQUE (orange) ─── */}
        <ReportSection
          number={3}
          title="PROFIL PSYCHOPÉDAGOGIQUE ET CONSEILS"
          titleAr="الملف النفسي التربوي والنصائح"
          color="amber"
          icon={<Brain className="w-5 h-5" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Intelligences donut */}
            <div>
              <h4 className="font-semibold text-sm mb-2 text-amber-800">
                Type d&apos;intelligence
              </h4>
              {intelligenceData.length > 0 && (
                <DonutChart
                  data={intelligenceData}
                  height={180}
                  centerLabel="Profil"
                  centerValue={report.profile.intelligences[0]?.label.slice(0, 8) ?? ""}
                />
              )}
              <div className="mt-2 space-y-1">
                {intelligenceData.map((i, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <span
                      className="w-2 h-2 rounded-sm"
                      style={{ backgroundColor: i.color }}
                    />
                    <span className="flex-1 text-slate-700">{i.name}</span>
                    <span className="tabular-nums font-semibold">{i.value}%</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-2 rounded bg-amber-50 border border-amber-200">
                <div className="text-[10px] uppercase font-bold tracking-wide text-amber-800">
                  Type d&apos;apprentissage
                </div>
                <div className="text-sm font-semibold mt-0.5">
                  {report.profile.learningStyle}
                </div>
              </div>
            </div>

            {/* Bar chart of interests / best subjects */}
            <div>
              <h4 className="font-semibold text-sm mb-2 text-amber-800">
                Intérêts et Aptitudes
              </h4>
              {interestData.length > 0 ? (
                <VerticalBarChart data={interestData} height={180} unit="/20" />
              ) : (
                <p className="text-xs text-muted-foreground py-8 text-center">
                  Pas encore de données suffisantes
                </p>
              )}
              {report.profile.interests.length > 0 && (
                <div className="mt-3">
                  <div className="text-[10px] uppercase font-bold tracking-wide text-amber-800 mb-1">
                    Centres d&apos;intérêt
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {report.profile.interests.map((i) => (
                      <Badge key={i} variant="secondary" className="text-[10px]">
                        {i}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {report.profile.hobbies.length > 0 && (
                <div className="mt-2">
                  <div className="text-[10px] uppercase font-bold tracking-wide text-amber-800 mb-1">
                    Loisirs
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {report.profile.hobbies.map((h) => (
                      <Badge key={h} variant="outline" className="text-[10px]">
                        {h}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Personalized advices */}
            <div>
              <h4 className="font-semibold text-sm mb-3 text-amber-800">
                Conseils personnalisés
              </h4>
              {report.profile.personalizedAdvices.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  Plus de données nécessaires pour générer des conseils.
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {report.profile.personalizedAdvices.map((a, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-amber-600 font-bold flex-shrink-0">
                        •
                      </span>
                      <span className="leading-relaxed">{a}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </ReportSection>

        <InterpretationBox title="Que signifie ce profil psychopédagogique ?" color="amber">
          <p>
            <strong>Les intelligences multiples (Howard Gardner, Harvard, 1983)</strong> postulent que l&apos;intelligence n&apos;est pas unique mais multi-dimensionnelle. Il existe 8 types d&apos;intelligence — chacun de nous combine ces 8 dimensions à des degrés variables.
          </p>
          <p>
            <strong>Le graphique en donut</strong> montre les 5 intelligences dominantes de l&apos;élève. Plus la part est grande, plus cette intelligence est développée. <em>Exemple : une dominance Logique-Mathématique = profil scientifique ; une dominance Linguistique = profil littéraire ou langues.</em>
          </p>
          <p>
            <strong>Le style d&apos;apprentissage</strong> (Visuel, Auditif, Kinesthésique, Lecture-Écriture) — modèle <strong>VAK/RW</strong> (Fleming, 1995) — indique comment l&apos;élève absorbe le mieux l&apos;information. C&apos;est crucial pour les parents et enseignants : un élève visuel comprend mieux avec des schémas ; un kinesthésique, en pratiquant.
          </p>
          <p>
            <strong>Les conseils personnalisés</strong> sont générés algorithmiquement à partir de l&apos;intelligence dominante détectée + des matières faibles + de la tendance des notes. Ils sont à discuter avec l&apos;enfant.
          </p>
        </InterpretationBox>

        {/* ─── Section 4: PRÉDICTION ET AVENIR (purple) ─── */}
        <ReportSection
          number={4}
          title="PRÉDICTION ET AVENIR"
          titleAr="التنبؤ والمستقبل"
          color="purple"
          icon={<Sparkles className="w-5 h-5" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-sm mb-3 text-purple-800">
                Prédiction d&apos;Orientation
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                Filières recommandées par ordre de pertinence :
              </p>
              <div className="space-y-2">
                {report.prediction.recommendedFilieres.map((f, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg border-l-4 border-purple-400 bg-purple-50/50"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-sm">{f.name}</span>
                      <Badge
                        className="bg-purple-600 hover:bg-purple-600 text-white text-[10px] tabular-nums"
                      >
                        {f.confidence}%
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {f.reasoning}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3 text-purple-800">
                Perspectives de Carrière
              </h4>
              <div className="space-y-2">
                {report.prediction.careerSuggestions.map((c, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-white border border-purple-200"
                  >
                    <div className="font-semibold text-sm">{c.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {c.requiredStudies}
                    </div>
                  </div>
                ))}
              </div>

              {report.prediction.universitySuggestions.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-xs uppercase tracking-wide text-purple-800 mb-2">
                    Universités algériennes pertinentes
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {report.prediction.universitySuggestions.map((u, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="text-[10px] bg-purple-100 text-purple-800"
                      >
                        {u}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ReportSection>

        <InterpretationBox title="Comment interpréter la prédiction d'orientation ?" color="purple">
          <p>
            <strong>Les filières recommandées</strong> sont classées par <strong>score de confiance (%)</strong> — calculé à partir de la pondération des matières clés de chaque filière du BAC algérien. <em>Exemple : Sciences Expérimentales privilégie SVT (35%), Physique (30%), Maths (25%).</em>
          </p>
          <p>
            <strong>Plus le pourcentage est élevé</strong>, plus l&apos;adéquation entre les performances actuelles de l&apos;élève et les exigences de la filière est forte. Un score &gt; 75% indique une voie naturelle ; entre 60% et 75%, une voie possible avec adaptation ; en dessous, mieux vaut explorer d&apos;autres pistes.
          </p>
          <p>
            <strong>Les perspectives de carrière</strong> listent des métiers concrets avec les parcours d&apos;études en Algérie. <strong>Les universités suggérées</strong> sont des établissements publics réputés dans le domaine choisi (USTHB, USTO-MB Oran, ENP, ESI, etc.).
          </p>
          <p>
            <strong>Important pour les parents</strong> : cette analyse est un <em>outil d&apos;aide à la décision</em>, pas une sentence. La motivation et les rêves de l&apos;enfant restent primordiaux.
          </p>
        </InterpretationBox>

        {/* ── EDURA Institution Tridimensionnelle ── */}
        <Card className="overflow-hidden border-2 border-slate-300 bg-gradient-to-br from-slate-50 via-white to-indigo-50">
          <div className="bg-gradient-to-r from-slate-800 to-indigo-900 text-white px-5 py-3">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5" />
              <div>
                <div className="font-bold text-sm tracking-wide">
                  PERSPECTIVES D&apos;ÉVOLUTION & VISION FUTURISTE
                </div>
                <div className="text-xs opacity-80">L&apos;ÉCOSYSTÈME EDURA — Au-delà du cadre scolaire</div>
              </div>
            </div>
          </div>

          <CardContent className="p-5 space-y-5">
            {/* 1. Éducation Tridimensionnelle */}
            <div>
              <h4 className="font-bold text-sm text-indigo-900 mb-2">
                1. L&apos;ÉDUCATION TRIDIMENSIONNELLE : Au-delà du cadre académique
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed mb-3">
                Le système éducatif conventionnel se limite à une évaluation unidimensionnelle basée sur la mémorisation. Le bilan scientifique d&apos;EDURA marque une rupture paradigmatique en introduisant une approche holistique fusionnant <strong>trois dimensions critiques</strong> :
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="p-3 rounded-lg border-l-4 border-indigo-500 bg-indigo-50/50">
                  <div className="text-[10px] uppercase font-bold tracking-wide text-indigo-700">Académique</div>
                  <div className="text-xs mt-1 leading-snug">Les résultats factuels (notes, moyennes, progression)</div>
                </div>
                <div className="p-3 rounded-lg border-l-4 border-purple-500 bg-purple-50/50">
                  <div className="text-[10px] uppercase font-bold tracking-wide text-purple-700">Psychologique</div>
                  <div className="text-xs mt-1 leading-snug">Le profil de personnalité et les neurosciences cognitives (Gardner)</div>
                </div>
                <div className="p-3 rounded-lg border-l-4 border-amber-500 bg-amber-50/50">
                  <div className="text-[10px] uppercase font-bold tracking-wide text-amber-700">Potentiel</div>
                  <div className="text-xs mt-1 leading-snug">Les aptitudes innées et les projections de carrière</div>
                </div>
              </div>
            </div>

            {/* 2. Institution incubateur */}
            <div>
              <h4 className="font-bold text-sm text-indigo-900 mb-2">
                2. L&apos;INSTITUTION EDURA : Un incubateur de talents pour tous
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed mb-3">
                Les données récoltées ne doivent pas rester théoriques. <strong>L&apos;Institution EDURA</strong> intervient comme prolongement opérationnel : un programme d&apos;enrichissement ouvert à l&apos;ensemble de la population étudiante, partant du postulat scientifique que <em>chaque élève est doté d&apos;une « zone de génie » spécifique</em>.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="p-3 rounded-lg bg-white border">
                  <div className="text-[10px] uppercase font-bold tracking-wide text-blue-700">
                    Pôle Technologique & Scientifique
                  </div>
                  <ul className="text-xs mt-1 leading-snug text-slate-600 list-disc pl-3 space-y-0.5">
                    <li>Immersion en ingénierie</li>
                    <li>Codage applicatif, Robotique (Arduino)</li>
                    <li>Initiation médicale</li>
                    <li>Sciences environnementales</li>
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-white border">
                  <div className="text-[10px] uppercase font-bold tracking-wide text-emerald-700">
                    Pôle Économique & Management
                  </div>
                  <ul className="text-xs mt-1 leading-snug text-slate-600 list-disc pl-3 space-y-0.5">
                    <li>Incubation entrepreneuriale précoce</li>
                    <li>Littératie financière</li>
                    <li>Gestion de projet</li>
                    <li>Sciences de l&apos;éducation</li>
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-white border">
                  <div className="text-[10px] uppercase font-bold tracking-wide text-pink-700">
                    Pôle Humain & Créatif
                  </div>
                  <ul className="text-xs mt-1 leading-snug text-slate-600 list-disc pl-3 space-y-0.5">
                    <li>Intelligences interpersonnelles et spatiales</li>
                    <li>Arts plastiques & Musicologie</li>
                    <li>Analyse géographique</li>
                    <li>Sport de performance</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 3. Alignement neuropédagogique */}
            <div>
              <h4 className="font-bold text-sm text-indigo-900 mb-2">
                3. ALIGNEMENT NEUROPÉDAGOGIQUE : La méthodologie d&apos;apprentissage
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                Les cours ne sont pas enseignés de manière uniforme. Les experts conçoivent des formats pédagogiques calqués sur les types d&apos;intelligence validés par nos psycho-analystes.
                <br />
                <em className="text-slate-500">
                  Exemple : un profil visuo-spatial avec intérêt entrepreneurial recevra les concepts de gestion via la modélisation graphique. Un profil linguistique abordera la finance par la rhétorique de négociation.
                </em>
              </p>
            </div>

            {/* 4. Vision avenir */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-900 to-purple-900 text-white">
              <h4 className="font-bold text-sm mb-2">
                4. UNE VISION D&apos;AVENIR POUR LA JEUNESSE ALGÉRIENNE
              </h4>
              <p className="text-xs leading-relaxed">
                En connectant les écoles privées partenaires à cette institution d&apos;élite, EDURA dessine les contours de l&apos;<strong>école de demain en Algérie</strong>. Nous ne formons pas des exécutants conformes à un programme rigide ; nous révélons des esprits agiles, psychologiquement équilibrés, conscients de leurs forces et armés techniquement pour devenir les leaders, ingénieurs, artistes et entrepreneurs de l&apos;économie de la connaissance.
              </p>
              <div className="mt-3 pt-3 border-t border-white/20 text-xs italic text-center">
                « Chaque enfant porte en lui un génie. Notre mission est de l&apos;activer. »
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-2 pb-4 print:pt-6">
          Document généré automatiquement par EDURA — {new Date(report.meta.generatedAt).toLocaleString("fr-FR")}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Section helper component — reproduces the colored banner from the design
// ──────────────────────────────────────────────────────────────────────

function ReportSection({
  number,
  title,
  titleAr,
  color,
  icon,
  children,
}: {
  number: number;
  title: string;
  titleAr: string;
  color: "emerald" | "red" | "amber" | "purple";
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const palettes: Record<
    typeof color,
    { bar: string; circle: string; border: string }
  > = {
    emerald: {
      bar: "bg-gradient-to-r from-emerald-500 to-emerald-600",
      circle: "bg-emerald-600",
      border: "border-emerald-200",
    },
    red: {
      bar: "bg-gradient-to-r from-red-500 to-red-600",
      circle: "bg-red-600",
      border: "border-red-200",
    },
    amber: {
      bar: "bg-gradient-to-r from-amber-500 to-orange-500",
      circle: "bg-orange-500",
      border: "border-orange-200",
    },
    purple: {
      bar: "bg-gradient-to-r from-purple-500 to-purple-600",
      circle: "bg-purple-600",
      border: "border-purple-200",
    },
  };
  const p = palettes[color];

  return (
    <Card className={`overflow-hidden border-2 ${p.border}`}>
      <div
        className={`${p.bar} text-white px-5 py-2.5 flex items-center justify-between`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-7 h-7 rounded-full bg-white/30 grid place-items-center text-sm font-bold`}
          >
            {number}
          </div>
          {icon}
          <span className="font-bold tracking-wide text-sm">{title}</span>
        </div>
        <span className="text-xs font-semibold opacity-80">{titleAr}</span>
      </div>
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Interpretation Box — vulgarisation des concepts scientifiques pour
// les parents et personnels non spécialisés
// ──────────────────────────────────────────────────────────────────────

function InterpretationBox({
  title,
  children,
  color = "blue",
}: {
  title: string;
  children: React.ReactNode;
  color?: "blue" | "emerald" | "red" | "amber" | "purple";
}) {
  const colors = {
    blue: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600", title: "text-blue-900" },
    emerald: { bg: "bg-emerald-50", border: "border-emerald-200", icon: "text-emerald-600", title: "text-emerald-900" },
    red: { bg: "bg-red-50", border: "border-red-200", icon: "text-red-600", title: "text-red-900" },
    amber: { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-700", title: "text-amber-900" },
    purple: { bg: "bg-purple-50", border: "border-purple-200", icon: "text-purple-600", title: "text-purple-900" },
  };
  const c = colors[color];

  return (
    <div className={`${c.bg} border ${c.border} rounded-lg p-4 mt-3`}>
      <div className="flex items-start gap-3">
        <Lightbulb className={`w-5 h-5 ${c.icon} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <div className={`text-xs font-bold uppercase tracking-wide ${c.title} mb-1.5`}>
            💡 {title}
          </div>
          <div className="text-xs text-slate-700 leading-relaxed space-y-1.5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
