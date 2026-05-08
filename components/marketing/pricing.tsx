import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { SectionLabel } from "./section-label";

const INCLUDED = [
  "Élèves illimités",
  "Classes illimitées",
  "Saisie des notes + bulletins PDF",
  "Présences quotidiennes",
  "Suivi financier complet",
  "Intelligence Artificielle (risque + orientation)",
  "Module Conformité réglementaire",
  "Import Excel intelligent (FR + AR)",
  "Gestion d'équipe (directeur, secrétaires, professeurs)",
  "Hébergement sécurisé en Europe (RGPD)",
  "Mises à jour automatiques",
  "Support par email",
];

export function Pricing() {
  return (
    <section id="pricing" className="py-28 md:py-44">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <SectionLabel>Tarifs</SectionLabel>
          <h2 className="font-display text-4xl md:text-[3.25rem] leading-[1.15] mt-6">
            Un prix simple,{" "}
            <span className="gradient-text">tout inclus.</span>
          </h2>
          <p className="mt-6 text-base md:text-lg text-[#64748b] leading-relaxed">
            Pas de modules cachés. Pas de surcoût par utilisateur. Pas de
            surprise.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Gradient-border pricing card */}
          <div className="rounded-2xl gradient-bg-diag p-[2px] shadow-accent-lg animate-in fade-in slide-in-from-bottom-3 duration-700">
            <div className="rounded-[14px] bg-white p-10 md:p-12 relative overflow-hidden">
              {/* Subtle radial glow */}
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#0052ff]/[0.05] blur-[100px] pointer-events-none" />

              <div className="relative">
                <div className="flex items-start justify-between flex-wrap gap-3 mb-2">
                  <div className="text-xs font-mono uppercase tracking-[0.15em] text-[#0052ff]">
                    Plan École
                  </div>
                  <span className="rounded-full gradient-bg px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-white">
                    Tout inclus
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-6xl md:text-7xl">
                    200<span className="text-3xl text-[#64748b]">k</span>
                  </span>
                  <span className="text-sm text-[#64748b]">DZD / an</span>
                </div>
                <p className="mt-2 text-sm text-[#64748b]">
                  Soit <strong className="text-[#0f172a]">~16 600 DZD/mois</strong> — payable annuellement.
                </p>

                <Link
                  href="/signup"
                  className="group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl gradient-bg h-14 px-7 text-[15px] font-medium text-white shadow-accent-sm hover:shadow-accent-lg hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  Démarrer 30 jours gratuits
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {INCLUDED.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#0052ff]/10 grid place-items-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-[#0052ff]" strokeWidth={3} />
                      </div>
                      <span className="text-sm text-[#0f172a]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footnote */}
          <p className="mt-8 text-center text-xs text-[#64748b]">
            Aucune carte bancaire requise pour l&apos;essai • Annulation à tout moment •
            Données exportables
          </p>
        </div>
      </div>
    </section>
  );
}
