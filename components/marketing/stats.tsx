import { SectionLabel } from "./section-label";

const STATS = [
  { value: "10×", label: "Plus rapide à saisir des notes que sur Excel" },
  { value: "30j", label: "Pour onboarder une école complète" },
  { value: "73%", label: "Des élèves à risque détectés avant le décrochage" },
  { value: "0", label: "Erreurs de calcul de moyenne possibles" },
];

export function Stats() {
  return (
    <section className="relative bg-[#0f172a] text-white py-24 md:py-36 overflow-hidden">
      {/* Dot pattern background */}
      <div className="absolute inset-0 dot-pattern pointer-events-none" />

      {/* Ambient glows */}
      <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-[#0052ff]/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[#4d7cff]/8 blur-[150px] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <SectionLabel variant="dark" pulse>
            Mesurable
          </SectionLabel>
          <h2 className="font-display text-4xl md:text-[3.25rem] leading-[1.15] mt-6">
            Des résultats que vous pouvez{" "}
            <span className="gradient-text">vraiment voir.</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {STATS.map((s, i) => (
            <div
              key={i}
              className="text-center md:px-6 md:border-r border-white/10 last:border-r-0 animate-in fade-in slide-in-from-bottom-2 duration-700"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="font-display text-5xl md:text-6xl gradient-text">
                {s.value}
              </div>
              <div className="text-sm text-white/60 mt-3 leading-relaxed">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
