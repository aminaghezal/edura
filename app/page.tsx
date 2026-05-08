import { MarketingNav } from "@/components/marketing/nav";
import { Hero } from "@/components/marketing/hero";
import { Features } from "@/components/marketing/features";
import { Stats } from "@/components/marketing/stats";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Pricing } from "@/components/marketing/pricing";
import { FinalCta, MarketingFooter } from "@/components/marketing/final-cta";

export default function HomePage() {
  return (
    <div className="marketing-root min-h-screen">
      <MarketingNav />
      <main>
        <Hero />
        <Features />
        <Stats />
        <HowItWorks />
        <Pricing />
        <FinalCta />
      </main>
      <MarketingFooter />
    </div>
  );
}
