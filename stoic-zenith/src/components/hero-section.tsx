import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'

interface HeroSectionProps {
  onGetStarted?: () => void
}

export function HeroSection({ onGetStarted }: HeroSectionProps): JSX.Element {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const scrollToSection = (sectionId: string): void => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
    setIsMobileMenuOpen(false) // Close mobile menu after clicking
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-white">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-background-9f3f79.png"
          alt="Hero background"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Noise Effect Overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='10' numOctaves='10' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            mixBlendMode: 'multiply',
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-4 md:px-16 py-6 md:py-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8 md:h-12 md:w-12">
            <Image
              src="/images/logo-icon.png"
              alt="Logo"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Navigation Items - Hidden on mobile */}
        <div className="hidden lg:flex items-center gap-8 xl:gap-16">
          <a
            href="#features"
            onClick={e => {
              e.preventDefault()
              document
                .getElementById('features')
                ?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="text-white font-inknut text-base xl:text-lg hover:opacity-80 transition-opacity cursor-pointer"
          >
            Features
          </a>
          <a
            href="#philosophy"
            onClick={e => {
              e.preventDefault()
              document
                .getElementById('philosophy')
                ?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="text-white font-inknut text-base xl:text-lg hover:opacity-80 transition-opacity cursor-pointer"
          >
            Philosophy
          </a>
          <a
            href="#pricing"
            onClick={e => {
              e.preventDefault()
              document
                .getElementById('pricing')
                ?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="text-white font-inknut text-base xl:text-lg hover:opacity-80 transition-opacity cursor-pointer"
          >
            Pricing
          </a>
          <a
            href="#about"
            onClick={e => {
              e.preventDefault()
              document
                .getElementById('about')
                ?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="text-white font-inknut text-base xl:text-lg hover:opacity-80 transition-opacity cursor-pointer"
          >
            About
          </a>
        </div>

        {/* Mobile Menu Button - Visible on mobile */}
        <div className="lg:hidden flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white hover:bg-white/10"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Login Button - Desktop */}
        <Button className="hidden lg:block bg-primary hover:bg-primary/90 text-white font-inknut text-sm md:text-base xl:text-lg px-4 md:px-8 py-2 md:py-3 transition-colors">
          Log in
        </Button>
      </nav>

      {/* Mobile Menu - Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden relative z-20 bg-black/90 backdrop-blur-sm border-t border-white/20">
          <div className="px-4 py-6 space-y-4">
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left text-white font-inknut text-lg hover:opacity-80 transition-opacity py-2"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('philosophy')}
              className="block w-full text-left text-white font-inknut text-lg hover:opacity-80 transition-opacity py-2"
            >
              Philosophy
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="block w-full text-left text-white font-inknut text-lg hover:opacity-80 transition-opacity py-2"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="block w-full text-left text-white font-inknut text-lg hover:opacity-80 transition-opacity py-2"
            >
              About
            </button>
            <div className="pt-4 border-t border-white/20">
              <Button
                onClick={onGetStarted}
                className="w-full bg-primary hover:bg-primary/90 text-white font-inknut text-base px-6 py-3"
              >
                Log in
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[30vh] md:min-h-[35vh] px-4 md:px-16 text-center mt-16 md:mt-20">
        {/* Main Heading */}
        <h1 className="mb-4 md:mb-6 font-inknut text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal text-ink leading-tight max-w-4xl">
          Master Your Mind
          <span className="block">with Stoic Wisdom</span>
        </h1>

        {/* CTA Button */}
        <Button
          size="lg"
          onClick={onGetStarted}
          className="bg-primary hover:bg-primary/90 text-white font-inknut text-base md:text-lg xl:text-xl px-6 md:px-10 py-3 md:py-4 transition-colors"
        >
          Explore now
        </Button>
      </div>
    </section>
  )
}
