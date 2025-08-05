'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { CachedPage } from '@/components/layout/CachedPage'
import { DailyStoicWisdom } from '@/components/quotes/DailyStoicWisdom'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

function QuotesLoading(): JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" />
    </div>
  )
}

export default function QuotesPage(): JSX.Element {
  return (
    <ProtectedRoute>
      <AppLayout fullWidth>
        {/* Temporarily disabled CachedPage to test tab visibility fixes */}
        <DailyStoicWisdom />
      </AppLayout>
    </ProtectedRoute>
  )
}
