import React from "react"
import { Button } from "@/components/ui/button"
import { Star, BookOpen, MessageCircle, Calendar } from "lucide-react"
import Image from "next/image"

interface HeroSectionProps {
  onGetStarted?: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
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
            mixBlendMode: 'multiply'
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
          <a href="#features" className="text-white font-inknut text-base xl:text-lg hover:opacity-80 transition-opacity">
            Features
          </a>
          <a href="#philosophy" className="text-white font-inknut text-base xl:text-lg hover:opacity-80 transition-opacity">
            Philosophy
          </a>
          <a href="#pricing" className="text-white font-inknut text-base xl:text-lg hover:opacity-80 transition-opacity">
            Pricing
          </a>
          <a href="#about" className="text-white font-inknut text-base xl:text-lg hover:opacity-80 transition-opacity">
            About
          </a>
        </div>

        {/* Login Button */}
        <Button
          className="bg-primary hover:bg-primary/90 text-white font-inknut text-sm md:text-base xl:text-lg px-4 md:px-8 py-2 md:py-3 transition-colors"
        >
          Log in
        </Button>
      </nav>

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
