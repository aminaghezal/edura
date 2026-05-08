import { ArrowRight } from "lucide-react";
import { SectionLabel } from "./section-label";

const STEPS = [
  {
    n: "01",
    title: "Inscrivez votre école",
    desc: "Créez votre compte directeur en 60 secondes. Aucune carte bancaire requise.",
  },
  {
    n: "02",
    title: "Importez vos élèves",
    desc: "Glissez votre fichier Excel — EDURA détecte automatiquement les colonnes (FR + AR).",
  },
  {
    n: "03",
    title: "Saisissez les notes",
    desc: "Tableur réactif. Bulletins PDF générés automatiquement à la fin du trimestre.",
  },
  {
    n: "04",
    title: "L'IA analyse chaque nuit",
    desc: "Score de risque, suggestions d'orientation, résumé hebdomadaire pour le directeur.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-28 md:py-44 bg-[#fafafa]">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl mb-20">
          <SectionLabel>Workflow</SectionLabel>
          <h2 className="font-display text-4xl md:text-[3.25rem] leading-[1.15] mt-6">
            De zéro à opérationnel{" "}
            <span className="gradient-text">en moins d&apos;une heure.</span>
          </h2>
        </div>

        <div className="relative">
          {/* Connecting line — desktop only */}
          <div className="hidden md:block absolute top-12 left-12 right-12 h-px bg-gradient-to-r from-[#0052ff]/30 via-[#0052ff]/30 to-[#4d7cff]/30" />

          <div className="grid md:grid-cols-4 gap-8 md:gap-6">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className="relative animate-in fade-in slide-in-from-bottom-3 duration-700"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Step number circle */}
                <div className="relative z-10 w-24 h-24 mx-auto md:mx-0 rounded-2xl bg-white border border-[#e2e8f0] grid place-items-center shadow-md">
                  <span className="font-display text-4xl gradient-text">
                    {step.n}
                  </span>
                </div>

                {/* Arrow connector — between cards on desktop */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:flex absolute top-12 -right-3 z-10 w-6 h-6 rounded-full bg-[#0052ff] items-center justify-center">
                    <ArrowRight className="w-3 h-3 text-white" />
                  </div>
                )}

                <div className="mt-6 md:pr-6">
                  <h3 className="font-semibold text-lg tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#64748b] mt-2 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
