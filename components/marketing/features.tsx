import {
  Users,
  GraduationCap,
  CalendarCheck,
  FileText,
  Brain,
  Banknote,
  Calendar,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { SectionLabel } from "./section-label";

const FEATURES = [
  {
    icon: <Users className="w-5 h-5" />,
    title: "Gestion des élèves",
    desc: "Import Excel intelligent (FR + AR), fiches complètes, suivi parents.",
    featured: false,
  },
  {
    icon: <Brain className="w-5 h-5" />,
    title: "Intelligence Artificielle",
    desc: "Détection automatique des élèves à risque + suggestions d'orientation par filière.",
    featured: true,
  },
  {
    icon: <GraduationCap className="w-5 h-5" />,
    title: "Saisie des notes",
    desc: "Tableur réactif, calcul automatique des moyennes pondérées, sauvegarde en temps réel.",
    featured: false,
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: "Bulletins PDF",
    desc: "Génération en un clic au format A4 officiel — prêt à imprimer.",
    featured: false,
  },
  {
    icon: <CalendarCheck className="w-5 h-5" />,
    title: "Présences quotidiennes",
    desc: "Appel en grille, statistiques en temps réel, alertes parents automatiques.",
    featured: false,
  },
  {
    icon: <Banknote className="w-5 h-5" />,
    title: "Finance",
    desc: "Suivi des paiements (Espèces, CCP, virement), tableaux de bord du recouvrement.",
    featured: false,
  },
  {
    icon: <Calendar className="w-5 h-5" />,
    title: "Emploi du temps",
    desc: "Grille hebdomadaire par classe, conformité au calendrier ministériel.",
    featured: false,
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Conformité réglementaire",
    desc: "Suivi du cahier des charges algérien + score d'inspection-readiness.",
    featured: false,
  },
];

export function Features() {
  return (
    <section id="features" className="py-28 md:py-44">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <SectionLabel>Plateforme</SectionLabel>
          <h2 className="font-display text-4xl md:text-[3.25rem] leading-[1.15] mt-6">
            Tout ce dont une école privée a besoin —{" "}
            <span className="gradient-text">en un seul outil.</span>
          </h2>
          <p className="mt-6 text-base md:text-lg text-[#64748b] leading-relaxed">
            EDURA remplace dix tableurs, trois cahiers et deux logiciels. Et il
            apprend de vos données pour vous aider à décider.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <FeatureCard key={i} feature={f} delay={i * 60} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  delay,
}: {
  feature: (typeof FEATURES)[number];
  delay: number;
}) {
  if (feature.featured) {
    // Gradient-border featured card
    return (
      <div
        className="rounded-2xl gradient-bg-diag p-[2px] animate-in fade-in slide-in-from-bottom-3 duration-700 hover:shadow-accent-lg hover:-translate-y-1 transition-all"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="h-full w-full rounded-[14px] bg-white p-7 flex flex-col">
          <div className="w-12 h-12 rounded-xl gradient-bg-diag grid place-items-center text-white shadow-accent-sm mb-5">
            {feature.icon}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg tracking-tight">
              {feature.title}
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#0052ff]/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[#0052ff]">
              <Sparkles className="w-2.5 h-2.5" /> IA
            </span>
          </div>
          <p className="text-sm text-[#64748b] leading-relaxed">{feature.desc}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group rounded-2xl border border-[#e2e8f0] bg-white p-7 hover:border-[#0052ff]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 duration-700 relative overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0052ff]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-[#0052ff]/5 grid place-items-center text-[#0052ff] mb-5 group-hover:scale-110 transition-transform">
          {feature.icon}
        </div>
        <h3 className="font-semibold text-lg tracking-tight mb-2">
          {feature.title}
        </h3>
        <p className="text-sm text-[#64748b] leading-relaxed">{feature.desc}</p>
      </div>
    </div>
  );
}
