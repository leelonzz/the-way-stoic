import { Header } from './header'
import { HeroSection } from './hero-section'
import { AceternityFeaturesSection } from './AceternityFeaturesSection'
import { PhilosophySection } from './philosophy-section'
import { TestimonialsSection } from './testimonials-section'
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
      <Header onGetStarted={onGetStarted} />
      <main>
        <HeroSection onGetStarted={onGetStarted} />
        <AceternityFeaturesSection />
        <PhilosophySection />
        <TestimonialsSection />
        <AboutSection />
        <CTASection onGetStarted={onGetStarted} />
        <PricingSection onGetStarted={onGetStarted} />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}
