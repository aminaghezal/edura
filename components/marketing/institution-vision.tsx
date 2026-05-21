import { Sparkles, Award, Layers, Heart } from "lucide-react";
import { SectionLabel } from "./section-label";

const POLES = [
  {
    title: "Pôle Technologique & Scientifique",
    color: "from-blue-500 to-indigo-600",
    items: ["Ingénierie & Robotique", "Programmation Arduino", "Sciences expérimentales"],
  },
  {
    title: "Pôle Économique & Management",
    color: "from-emerald-500 to-teal-600",
    items: ["Entrepreneuriat précoce", "Littératie financière", "Gestion de projet"],
  },
  {
    title: "Pôle Humain & Créatif",
    color: "from-pink-500 to-rose-600",
    items: ["Arts plastiques & Musique", "Intelligences sociales", "Sport de performance"],
  },
];

export function InstitutionVision() {
  return (
    <section className="relative bg-[#0f172a] text-white py-28 md:py-36 overflow-hidden">
      {/* Background image (subtle) */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/marketing/institution-1.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#0f172a]/80 to-[#0f172a]" />
      </div>

      {/* Dot pattern */}
      <div className="absolute inset-0 dot-pattern pointer-events-none" />

      {/* Ambient glows */}
      <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-[#0052ff]/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[#a855f7]/8 blur-[150px] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <SectionLabel variant="dark" pulse>
            Vision futuriste
          </SectionLabel>
          <h2 className="font-display text-4xl md:text-[3.25rem] leading-[1.15] mt-6">
            L&apos;Écosystème <span className="gradient-text">EDURA Institution</span>
          </h2>
          <p className="mt-6 text-base md:text-lg text-white/70 leading-relaxed">
            Au-delà du logiciel : un incubateur de talents pour la jeunesse algérienne,
            partant du principe que <em>chaque enfant porte en lui une zone de génie spécifique</em>.
          </p>
        </div>

        {/* 3 dimensions */}
        <div className="mb-12">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-300">
              <Layers className="w-3.5 h-3.5" />
              Éducation tridimensionnelle
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Académique", desc: "Les résultats factuels", color: "border-indigo-400" },
              { label: "Psychologique", desc: "Le profil de personnalité et les neurosciences", color: "border-purple-400" },
              { label: "Potentiel", desc: "Les aptitudes innées et projections de carrière", color: "border-amber-400" },
            ].map((d, i) => (
              <div
                key={i}
                className={`p-5 rounded-xl bg-white/5 backdrop-blur border-l-4 ${d.color} animate-in fade-in slide-in-from-bottom-2 duration-700`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="text-[10px] uppercase tracking-wide font-bold text-white/60 mb-1">
                  Dimension
                </div>
                <div className="font-display text-2xl">{d.label}</div>
                <div className="text-sm text-white/70 mt-2">{d.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 3 poles */}
        <div className="mb-12">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-300">
              <Award className="w-3.5 h-3.5" />
              Trois pôles d&apos;excellence
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {POLES.map((p, i) => (
              <div
                key={i}
                className="p-5 rounded-xl bg-white/5 backdrop-blur border border-white/10 hover:border-white/20 transition-all animate-in fade-in slide-in-from-bottom-2 duration-700"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${p.color} grid place-items-center mb-3`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="font-semibold text-sm leading-tight">{p.title}</div>
                <ul className="text-xs text-white/60 mt-2 space-y-1">
                  {p.items.map((it) => (
                    <li key={it} className="flex items-start gap-1.5">
                      <span className="text-white/40">•</span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Final quote */}
        <div className="max-w-2xl mx-auto text-center pt-8 border-t border-white/10">
          <Heart className="w-6 h-6 mx-auto text-amber-300 mb-3" />
          <blockquote className="font-display text-xl md:text-2xl italic text-white/90 leading-relaxed">
            « Chaque enfant porte en lui un génie. Notre mission est de l&apos;activer. »
          </blockquote>
          <div className="text-xs text-white/50 mt-4 font-mono uppercase tracking-wider">
            EDURA — Révélons les talents, construisons l&apos;avenir
          </div>
        </div>
      </div>
    </section>
  );
}
