"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Brain } from "lucide-react";
import { Lightbulb } from "lucide-react";
import { generateMBTIProfile } from "@/lib/orientation/mbti";

export function MBTISection({
  mbtiType,
  mbtiTestDate,
}: {
  mbtiType: string | null;
  mbtiTestDate: string | null;
}) {
  const profile = generateMBTIProfile(mbtiType);

  if (!profile) {
    return (
      <Card className="overflow-hidden border-2 border-cyan-200">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-white/30 grid place-items-center text-sm font-bold">3b</div>
            <Brain className="w-5 h-5" />
            <span className="font-bold tracking-wide text-sm">PROFIL DE PERSONNALITÉ MBTI</span>
          </div>
          <span className="text-xs font-semibold opacity-80">نوع الشخصية</span>
        </div>
        <CardContent className="p-5 text-center text-muted-foreground text-sm italic">
          Type MBTI non encore évalué. Cliquez sur « Saisie IQ &amp; Profil » pour ajouter le résultat du test.
        </CardContent>
      </Card>
    );
  }

  const categoryColors: Record<string, { bg: string; text: string; bar: string }> = {
    Analystes: { bg: "bg-purple-100", text: "text-purple-800", bar: "bg-purple-500" },
    Diplomates: { bg: "bg-emerald-100", text: "text-emerald-800", bar: "bg-emerald-500" },
    Sentinelles: { bg: "bg-blue-100", text: "text-blue-800", bar: "bg-blue-500" },
    Explorateurs: { bg: "bg-amber-100", text: "text-amber-800", bar: "bg-amber-500" },
  };
  const cc = categoryColors[profile.category];

  return (
    <>
      <Card className="overflow-hidden border-2 border-cyan-200">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-white/30 grid place-items-center text-sm font-bold">3b</div>
            <Brain className="w-5 h-5" />
            <span className="font-bold tracking-wide text-sm">PROFIL DE PERSONNALITÉ MBTI</span>
          </div>
          <span className="text-xs font-semibold opacity-80">نوع الشخصية</span>
        </div>

        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200">
                <div className="text-5xl font-extrabold text-cyan-700 tracking-tight">
                  {profile.type}
                </div>
                <div className="text-base font-semibold mt-2 text-slate-900">
                  {profile.nickname}
                </div>
                <div className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${cc.bg} ${cc.text}`}>
                  {profile.category}
                </div>
                {mbtiTestDate && (
                  <div className="text-[10px] text-muted-foreground mt-2">
                    Évalué le {new Date(mbtiTestDate).toLocaleDateString("fr-FR")}
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed mt-3 italic">
                {profile.description}
              </p>
            </div>

            <div className="md:col-span-2">
              <h4 className="font-semibold text-sm mb-3 text-cyan-800">
                Les 4 dimensions de personnalité
              </h4>
              <div className="space-y-3">
                {profile.dimensions.map((d) => (
                  <div key={d.axis}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold">
                        {d.letterLeft} — {d.labelLeft}
                      </span>
                      <span className="font-semibold text-slate-500">
                        {d.labelRight} — {d.letterRight}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold tabular-nums w-8 ${d.leftPct > d.rightPct ? "text-cyan-700" : "text-slate-400"}`}>
                        {d.leftPct}%
                      </span>
                      <div className="flex-1 h-3 rounded-full bg-slate-200 overflow-hidden flex">
                        <div
                          className={`h-full ${d.leftPct > d.rightPct ? cc.bar : "bg-slate-300"}`}
                          style={{ width: `${d.leftPct}%` }}
                        />
                        <div
                          className={`h-full ${d.rightPct > d.leftPct ? cc.bar : "bg-slate-300"}`}
                          style={{ width: `${d.rightPct}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold tabular-nums w-8 text-right ${d.rightPct > d.leftPct ? "text-cyan-700" : "text-slate-400"}`}>
                        {d.rightPct}%
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 italic">{d.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="text-[10px] uppercase font-bold tracking-wide text-emerald-800 mb-1.5">
                Forces du profil
              </div>
              <ul className="text-xs space-y-1">
                {profile.strengths.map((s) => (
                  <li key={s} className="flex gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div className="text-[10px] uppercase font-bold tracking-wide text-amber-800 mb-1.5">
                Points de vigilance
              </div>
              <ul className="text-xs space-y-1">
                {profile.weaknesses.map((w) => (
                  <li key={w} className="flex gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-[10px] uppercase font-bold tracking-wide text-blue-800 mb-1.5">
                Métiers compatibles
              </div>
              <div className="text-xs space-y-0.5">
                {profile.recommendedCareers.slice(0, 4).map((c) => (
                  <div key={c}>• {c}</div>
                ))}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
              <div className="text-[10px] uppercase font-bold tracking-wide text-purple-800 mb-1.5">
                Filières BAC suggérées
              </div>
              <div className="text-xs space-y-0.5">
                {profile.recommendedFilieres.map((f) => (
                  <div key={f}>• {f}</div>
                ))}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-cyan-50 border border-cyan-200">
              <div className="text-[10px] uppercase font-bold tracking-wide text-cyan-800 mb-1.5">
                Conseil d&apos;étude
              </div>
              <p className="text-xs leading-relaxed">{profile.studyAdvice}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-wide text-blue-900 mb-1.5">
              💡 Qu&apos;est-ce que le MBTI ?
            </div>
            <div className="text-xs text-slate-700 leading-relaxed space-y-1.5">
              <p>
                <strong>Le MBTI (Myers-Briggs Type Indicator)</strong> est un indicateur de personnalité basé sur la théorie psychologique de <strong>Carl Jung (Types Psychologiques, 1921)</strong>, opérationnalisé par Katharine Cook Briggs et Isabel Briggs Myers (1944). Il évalue 4 dimensions :
              </p>
              <ul className="ml-4 list-disc">
                <li><strong>E/I</strong> (Extraversion/Introversion) : source d&apos;énergie</li>
                <li><strong>S/N</strong> (Sensation/Intuition) : type d&apos;information traitée</li>
                <li><strong>T/F</strong> (Thinking/Feeling) : mode de décision</li>
                <li><strong>J/P</strong> (Judging/Perceiving) : style de vie</li>
              </ul>
              <p>
                La combinaison de ces 4 lettres donne <strong>16 types possibles</strong> répartis en 4 familles : Analystes (NT), Diplomates (NF), Sentinelles (SJ), Explorateurs (SP).
              </p>
              <p>
                <strong>Pour les parents</strong> : le MBTI est un outil indicatif, pas un diagnostic. Il aide à comprendre comment votre enfant fonctionne. Cette information se combine avec le profil d&apos;intelligences (Gardner) pour une orientation éclairée.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
