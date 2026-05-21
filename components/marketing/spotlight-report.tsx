import { CheckCircle2, Brain, Compass, GraduationCap, Heart } from "lucide-react";
import { SectionLabel } from "./section-label";

const FEATURES = [
  {
    icon: <Brain className="w-4 h-4" />,
    title: "Intelligences multiples (Gardner)",
    desc: "Identifie les 8 types d'intelligence dominants de chaque élève",
  },
  {
    icon: <Heart className="w-4 h-4" />,
    title: "Personnalité MBTI (16 types)",
    desc: "Type Myers-Briggs avec analyse des 4 dimensions et conseils d'étude",
  },
  {
    icon: <Compass className="w-4 h-4" />,
    title: "Prédiction de filière BAC",
    desc: "Sciences, Mathématiques, Lettres, Langues, Gestion — avec score de confiance",
  },
  {
    icon: <GraduationCap className="w-4 h-4" />,
    title: "Métiers + universités algériennes",
    desc: "USTHB, USTO-MB, ENP, ESI, ESSA — avec parcours d'études détaillés",
  },
];

export function SpotlightReport() {
  return (
    <section className="py-28 md:py-44 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/30 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -top-32 right-0 w-[500px] h-[500px] rounded-full bg-[#0052ff]/[0.04] blur-[150px] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <div className="animate-in fade-in slide-in-from-left-3 duration-700">
            <SectionLabel pulse>Le différenciateur EDURA</SectionLabel>
            <h2 className="font-display text-4xl md:text-[3.25rem] leading-[1.1] mt-6">
              Le <span className="gradient-text">Rapport Scientifique</span> d&apos;Orientation
            </h2>
            <p className="mt-6 text-base md:text-lg text-[#64748b] leading-relaxed">
              Chaque élève reçoit un <strong>bilan pédagogique complet</strong> qui révèle
              ses intelligences dominantes, son type de personnalité MBTI, sa filière
              optimale et les métiers compatibles avec son profil. Un document
              officiel exportable en PDF, remis aux parents en fin d&apos;année.
            </p>

            <div className="mt-8 space-y-3">
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 animate-in fade-in slide-in-from-left-2 duration-500"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="w-8 h-8 rounded-lg gradient-bg-diag text-white grid place-items-center flex-shrink-0 shadow-accent-sm">
                    {f.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{f.title}</div>
                    <div className="text-xs text-[#64748b] mt-0.5">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 rounded-xl bg-white border border-[#e2e8f0] flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-sm">Fondement scientifique</div>
                <div className="text-xs text-[#64748b] mt-1">
                  Basé sur les théories d&apos;Howard Gardner (Harvard) et Carl Jung. Données
                  croisées : notes, observations enseignants, IQ, intérêts.
                </div>
              </div>
            </div>
          </div>

          {/* Right: report cover image */}
          <div className="relative animate-in fade-in slide-in-from-right-3 duration-700">
            <div className="relative anim-float-slow">
              {/* Backdrop accent */}
              <div className="absolute -inset-4 gradient-bg-diag rounded-2xl blur-2xl opacity-20" />
              <div className="relative rounded-2xl border border-[#e2e8f0] bg-white shadow-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/marketing/report-cover.png"
                  alt="Exemple de Rapport Scientifique EDURA"
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl border border-[#e2e8f0] p-3 hidden sm:block">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748b]">
                5 pages
              </div>
              <div className="font-display text-2xl gradient-text">A4 PDF</div>
              <div className="text-xs text-[#64748b]">Officiel & imprimable</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
