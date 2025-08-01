import { HeroSection } from "./hero-section"
import { FeaturesSection } from "./features-section"
import { PhilosophySection } from "./philosophy-section"
import { PricingSection } from "./pricing-section"
import { CTASection } from "./cta-section"
import { Footer } from "./footer"

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection onGetStarted={onGetStarted} />
        <FeaturesSection />
        <PhilosophySection />
        <PricingSection onGetStarted={onGetStarted} />
        <CTASection onGetStarted={onGetStarted} />
      </main>
      <Footer />
    </div>
  )
}