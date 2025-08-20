import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'

interface HeroSectionProps {
  onGetStarted?: () => void
}

export function HeroSection({ onGetStarted }: HeroSectionProps): JSX.Element {
  const [isScrollButtonVisible, setIsScrollButtonVisible] = useState(true)

  const handleScrollToFeatures = (): void => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
    setIsScrollButtonVisible(false)
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-white pt-20 md:pt-24">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-background-9f3f79.png"
          alt="Hero background"
          fill
          className="object-cover"
          style={{
            objectPosition: 'center 20%', // This crops the top by positioning the image higher
          }}
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

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[25vh] md:min-h-[30vh] px-4 md:px-16 text-center mt-8 md:mt-12">
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

      {/* Scroll Button */}
      {isScrollButtonVisible && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <button
            onClick={handleScrollToFeatures}
            className="flex items-center justify-center w-11 h-11 bg-white text-black opacity-75 border border-[#e7eae8] rounded-lg cursor-pointer transition-all duration-300 hover:opacity-100 hover:shadow-md"
            style={{
              animation: 'bounce_513 1s infinite',
            }}
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes bounce_513 {
          0%,
          100% {
            transform: translateY(-25%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }

          50% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
      `}</style>
    </section>
  )
}
