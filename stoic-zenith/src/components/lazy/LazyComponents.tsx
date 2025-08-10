'use client'

import dynamic from 'next/dynamic'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

// Lazy load heavy components with loading fallbacks
export const LazyDailyStoicWisdom = dynamic(
  () => import('@/components/quotes/DailyStoicWisdom'),
  {
    loading: () => (
      <div className="min-h-screen bg-hero flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    ),
    ssr: false // Client-side only for faster initial load
  }
)

export const LazyHomePage = dynamic(
  () => import('@/components/HomePage'),
  {
    loading: () => (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    ),
    ssr: true // Keep SSR for SEO
  }
)

export const LazyJournalPage = dynamic(
  () => import('@/components/pages-components/Journal').then(mod => ({ default: mod.Journal })),
  {
    loading: () => (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    ),
    ssr: false
  }
)

export const LazyMentorPage = dynamic(
  () => import('@/components/pages-components/Mentors'),
  {
    loading: () => (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    ),
    ssr: false
  }
)

