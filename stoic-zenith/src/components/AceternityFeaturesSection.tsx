'use client'

import React from 'react'
import { useId } from 'react'
import { BookOpen, Quote, Calendar, Bot, FileText, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

const STOIC_FEATURES = [
  {
    title: 'Daily Stoic Journal',
    description:
      'Start each morning with intention and end each evening with reflection through guided prompts.',
    icon: BookOpen,
  },
  {
    title: 'Daily Wisdom',
    description:
      'Discover curated quotes and teachings from Marcus Aurelius, Seneca, and Epictetus.',
    icon: Quote,
  },
  {
    title: 'Calendar Streak',
    description:
      "Visualize your life's journey and track your daily practice with powerful motivation.",
    icon: Calendar,
  },
  {
    title: 'AI Mentors',
    description:
      'Get personal guidance from AI-powered Stoic philosopher mentors tailored to your journey.',
    icon: Bot,
  },
  {
    title: 'Journal Templates',
    description:
      'Customize your reflection practice with templates for different situations and goals.',
    icon: FileText,
  },
  {
    title: 'Journal Security',
    description:
      'Keep your thoughts private and secure with password-protected journal encryption.',
    icon: Shield,
  },
]

export function AceternityFeaturesSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container px-4">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-inknut font-bold tracking-tight text-stone md:text-4xl lg:text-5xl mb-4">
            Everything You Need for{' '}
            <span className="text-primary">Stoic Practice</span>
          </h2>
          <p className="text-lg text-sage leading-relaxed">
            A complete toolkit for integrating ancient wisdom into your modern
            life, designed to build resilience, gratitude, and philosophical
            understanding.
          </p>
        </div>

        {/* Features Grid - 2 rows, 3 cards each */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 max-w-6xl mx-auto">
          {STOIC_FEATURES.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div
                key={feature.title}
                className="relative bg-gradient-to-b dark:from-neutral-900 from-neutral-100 dark:to-neutral-950 to-white p-6 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <Grid size={20} />

                {/* Icon */}
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4 relative z-20">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-base font-bold text-neutral-800 dark:text-white relative z-20 mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm font-normal relative z-20 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export const Grid = ({
  pattern,
  size,
}: {
  pattern?: number[][]
  size?: number
}) => {
  const p = pattern ?? [
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
    [Math.floor(Math.random() * 4) + 7, Math.floor(Math.random() * 6) + 1],
  ]
  return (
    <div className="pointer-events-none absolute left-1/2 top-0  -ml-20 -mt-2 h-full w-full [mask-image:linear-gradient(white,transparent)]">
      <div className="absolute inset-0 bg-gradient-to-r  [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] dark:from-zinc-900/30 from-zinc-100/30 to-zinc-300/30 dark:to-zinc-900/30 opacity-100">
        <GridPattern
          width={size ?? 20}
          height={size ?? 20}
          x="-12"
          y="4"
          squares={p}
          className="absolute inset-0 h-full w-full  mix-blend-overlay dark:fill-white/10 dark:stroke-white/10 stroke-black/10 fill-black/10"
        />
      </div>
    </div>
  )
}

export function GridPattern({ width, height, x, y, squares, ...props }: any) {
  const patternId = useId()

  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        strokeWidth={0}
        fill={`url(#${patternId})`}
      />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([x, y]: any) => (
            <rect
              strokeWidth="0"
              key={`${x}-${y}`}
              width={width + 1}
              height={height + 1}
              x={x * width}
              y={y * height}
            />
          ))}
        </svg>
      )}
    </svg>
  )
}
