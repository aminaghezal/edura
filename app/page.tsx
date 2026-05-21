import { MarketingNav } from "@/components/marketing/nav";
import { Hero } from "@/components/marketing/hero";
import { Features } from "@/components/marketing/features";
import { SpotlightReport } from "@/components/marketing/spotlight-report";
import { Stats } from "@/components/marketing/stats";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { InstitutionVision } from "@/components/marketing/institution-vision";
import { Pricing } from "@/components/marketing/pricing";
import { FinalCta, MarketingFooter } from "@/components/marketing/final-cta";

export default function HomePage() {
  return (
    <div className="marketing-root min-h-screen">
      <MarketingNav />
      <main>
        <Hero />
        <Features />
        <SpotlightReport />
        <Stats />
        <HowItWorks />
        <InstitutionVision />
        <Pricing />
        <FinalCta />
      </main>
      <MarketingFooter />
    </div>
  );
}
