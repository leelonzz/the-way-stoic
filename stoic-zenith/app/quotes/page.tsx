'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
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
        <DailyStoicWisdom />
      </AppLayout>
    </ProtectedRoute>
  )
}
