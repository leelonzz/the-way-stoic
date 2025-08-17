import { HeroSection } from './hero-section'
import { FeaturesSection } from './features-section'
import { PhilosophySection } from './philosophy-section'
import { PricingSection } from './pricing-section'
import { AboutSection } from './about-section'
import { FAQSection } from './faq-section'
import { CTASection } from './cta-section'
import { Footer } from './footer'

interface LandingPageProps {
  onGetStarted: () => void
}

export default function LandingPage({
  onGetStarted,
}: LandingPageProps): JSX.Element {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection onGetStarted={onGetStarted} />
        <FeaturesSection />
        <PhilosophySection />
        <PricingSection onGetStarted={onGetStarted} />
        <AboutSection />
        <CTASection onGetStarted={onGetStarted} />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}
