import Link from "next/link";
import { ArrowRight, Sparkles, Users, TrendingUp, Brain } from "lucide-react";
import { SectionLabel } from "./section-label";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-44">
      {/* Ambient radial glows */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#0052ff]/[0.06] blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-[#4d7cff]/[0.05] blur-[150px] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] items-center gap-16">
          {/* Left: copy */}
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
            <SectionLabel pulse>Conçu pour l&apos;Algérie</SectionLabel>

            <h1 className="font-display text-[2.75rem] sm:text-6xl lg:text-[5.25rem] leading-[1.05] tracking-tight mt-6">
              La gestion d&apos;école qui
              <br />
              <span className="relative inline-block">
                <span className="gradient-text">pense pour vous.</span>
                <span className="absolute -bottom-1 md:-bottom-2 left-0 right-0 h-3 md:h-4 rounded-sm bg-gradient-to-r from-[#0052ff]/15 to-[#4d7cff]/10" />
              </span>
            </h1>

            <p className="mt-7 text-base md:text-lg text-[#64748b] leading-relaxed max-w-xl">
              EDURA centralise élèves, notes, présences, finance et bulletins —
              et son IA détecte automatiquement les élèves à risque de
              décrochage avant qu&apos;il ne soit trop tard.
            </p>

            <div className="mt-10 flex flex-col gap-3 max-w-md">
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/signup"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl gradient-bg px-7 h-14 text-[15px] font-medium text-white shadow-accent-sm hover:shadow-accent-lg hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] transition-all duration-200 flex-1"
                >
                  Démarrer l&apos;essai gratuit
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#how"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-7 h-14 text-[15px] font-medium text-[#0f172a] hover:border-[#0052ff]/30 hover:shadow-md transition-all duration-200"
                >
                  Voir une démo
                </a>
              </div>
              {/* "Already a customer?" — login button under the primary CTA */}
              <Link
                href="/login"
                className="group inline-flex items-center justify-center gap-2 text-[14px] text-[#64748b] hover:text-[#0052ff] transition-colors py-2"
              >
                <span>Vous avez déjà un compte ?</span>
                <span className="font-semibold underline-offset-4 group-hover:underline">
                  Se connecter
                </span>
              </Link>
            </div>

            {/* Trust signals */}
            <div className="mt-10 flex items-center gap-6 text-xs text-[#64748b]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 anim-pulse-dot" />
                30 jours gratuits • Sans CB
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0052ff]" />
                Hébergé en Europe (RGPD)
              </div>
            </div>
          </div>

          {/* Right: animated graphic */}
          <div className="hidden lg:block relative h-[480px]">
            {/* Rotating outer ring */}
            <div className="absolute inset-0 grid place-items-center">
              <div className="anim-spin-slow w-[420px] h-[420px] rounded-full border-2 border-dashed border-[#0052ff]/15" />
            </div>

            {/* Inner solid ring */}
            <div className="absolute inset-0 grid place-items-center">
              <div className="w-[300px] h-[300px] rounded-full border border-[#0052ff]/10 bg-gradient-to-br from-[#0052ff]/[0.04] to-transparent" />
            </div>

            {/* Floating card 1 — top */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 anim-float">
              <div className="rounded-2xl bg-white shadow-xl border border-[#e2e8f0] p-4 w-56">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg gradient-bg grid place-items-center text-white">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-[#64748b]">Score IA</div>
                    <div className="font-display text-2xl">73<span className="text-sm text-[#64748b] font-sans">/100</span></div>
                  </div>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-[#f1f5f9] overflow-hidden">
                  <div className="h-full w-[73%] gradient-bg rounded-full" />
                </div>
              </div>
            </div>

            {/* Floating card 2 — left */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 anim-float-slow">
              <div className="rounded-2xl bg-white shadow-xl border border-[#e2e8f0] p-4 w-52">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748b]">
                  Élèves à risque
                </div>
                <div className="font-display text-3xl mt-1 text-red-600">6</div>
                <div className="text-xs text-[#64748b] mt-1">+2 cette semaine</div>
              </div>
            </div>

            {/* Floating card 3 — right */}
            <div className="absolute top-1/2 -translate-y-1/2 right-0 anim-float">
              <div className="rounded-2xl bg-white shadow-xl border border-[#e2e8f0] p-4 w-52">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-[#64748b]">
                  <Users className="w-3 h-3" /> 247 élèves
                </div>
                <div className="font-display text-3xl mt-1">+12<span className="text-base">%</span></div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
                  <TrendingUp className="w-3 h-3" /> vs année dernière
                </div>
              </div>
            </div>

            {/* Floating card 4 — bottom center */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 anim-float-slow">
              <div className="rounded-2xl bg-[#0f172a] text-white p-4 w-64 shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#4d7cff]" />
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#94a3b8]">
                    Assistant IA
                  </div>
                </div>
                <div className="text-xs leading-relaxed">
                  3 élèves nécessitent un contact parents cette semaine.
                </div>
              </div>
            </div>

            {/* Decorative dot grid */}
            <div className="absolute top-8 right-8 grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <span
                  key={i}
                  className="w-1 h-1 rounded-full bg-[#0052ff]/30"
                />
              ))}
            </div>

            {/* Solid accent corner block */}
            <div className="absolute bottom-12 left-12 w-12 h-12 rounded-2xl gradient-bg-diag shadow-accent-lg" />
          </div>
        </div>
      </div>
    </section>
  );
}
