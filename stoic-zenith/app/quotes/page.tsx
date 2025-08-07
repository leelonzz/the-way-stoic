'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { NavigationOptimizedCachedPage } from '@/components/layout/NavigationOptimizedCachedPage'
import { DailyStoicWisdom } from '@/components/quotes/DailyStoicWisdom'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

function QuotesSkeleton(): JSX.Element {
  return (
    <div className="min-h-screen bg-hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <div className="h-10 bg-stone/10 rounded w-64 mx-auto mb-4"></div>
          <div className="h-6 bg-stone/10 rounded w-96 mx-auto"></div>
        </div>

        {/* Today Quote Skeleton */}
        <div className="mb-12">
          <div className="h-8 bg-stone/10 rounded w-48 mb-6"></div>
          <div className="bg-white/30 rounded-xl p-8 border border-stone/5 max-w-4xl mx-auto">
            <div className="space-y-4">
              <div className="h-6 bg-stone/10 rounded w-full"></div>
              <div className="h-6 bg-stone/10 rounded w-5/6"></div>
              <div className="h-6 bg-stone/10 rounded w-4/6"></div>
              <div className="h-5 bg-stone/10 rounded w-32 mt-6"></div>
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <div className="flex space-x-1 bg-white/50 rounded-lg p-1 max-w-md mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-stone/10 rounded flex-1"></div>
            ))}
          </div>

          {/* Quote Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white/30 rounded-xl p-6 border border-stone/5">
                <div className="space-y-3">
                  <div className="h-4 bg-stone/10 rounded w-full"></div>
                  <div className="h-4 bg-stone/10 rounded w-5/6"></div>
                  <div className="h-4 bg-stone/10 rounded w-4/6"></div>
                  <div className="h-4 bg-stone/10 rounded w-24 mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function QuotesPage(): JSX.Element {
  return (
    <ProtectedRoute>
      <AppLayout fullWidth>
        <NavigationOptimizedCachedPage
          pageKey="quotes"
          fallback={<QuotesSkeleton />}
          preserveOnNavigation={true}
          refreshOnlyWhenStale={true}
          maxAge={8 * 60 * 1000} // 8 minutes - balanced for quote freshness
          navigationRefreshThreshold={2 * 60 * 1000} // 2 minutes for quote content
        >
          <DailyStoicWisdom />
        </NavigationOptimizedCachedPage>
      </AppLayout>
    </ProtectedRoute>
  )
}
