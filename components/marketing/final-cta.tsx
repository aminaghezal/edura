import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionLabel } from "./section-label";

export function FinalCta() {
  return (
    <section className="relative bg-[#0f172a] text-white py-24 md:py-36 overflow-hidden">
      {/* Dot pattern */}
      <div className="absolute inset-0 dot-pattern pointer-events-none" />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-[#0052ff]/15 blur-[200px] pointer-events-none" />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <SectionLabel variant="dark" pulse>
          Prêt à commencer
        </SectionLabel>

        <h2 className="font-display text-4xl md:text-[3.5rem] leading-[1.1] mt-6">
          Votre école, en{" "}
          <span className="gradient-text">pilotage automatique.</span>
        </h2>

        <p className="mt-6 text-base md:text-lg text-white/70 leading-relaxed max-w-xl mx-auto">
          Rejoignez les écoles privées algériennes qui ont remplacé leurs
          tableurs par EDURA. 30 jours gratuits, configuration en moins d&apos;une heure.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/signup"
            className="group inline-flex items-center justify-center gap-2 rounded-xl gradient-bg h-14 px-8 text-[15px] font-medium text-white shadow-accent-sm hover:shadow-accent-lg hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] transition-all w-full sm:w-auto"
          >
            Démarrer l&apos;essai gratuit
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 backdrop-blur h-14 px-8 text-[15px] font-medium text-white hover:bg-white/10 transition-all w-full sm:w-auto"
          >
            Se connecter
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-white/50">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 anim-pulse-dot" />
            Sans CB
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4d7cff]" />
            Hébergé en Europe
          </span>
          <span className="hidden sm:flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Annulation à tout moment
          </span>
        </div>
      </div>
    </section>
  );
}

export function MarketingFooter() {
  return (
    <footer className="bg-[#0f172a] text-white/60 border-t border-white/10">
      <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-bg-diag grid place-items-center text-white text-sm font-extrabold">
            E
          </div>
          <span className="font-display text-lg text-white">EDURA</span>
          <span className="font-mono text-[10px] text-white/40 ml-2">v1.0</span>
        </div>

        <div className="text-xs">
          © {new Date().getFullYear()} EDURA — Conçu en Algérie pour les écoles privées
        </div>
      </div>
    </footer>
  );
}
