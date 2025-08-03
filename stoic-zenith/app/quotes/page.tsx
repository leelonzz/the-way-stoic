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
        <CachedPage 
          pageKey="quotes" 
          fallback={<QuotesLoading />}
          refreshOnFocus={true}
          maxAge={10 * 60 * 1000} // 10 minutes
        >
          <DailyStoicWisdom />
        </CachedPage>
      </AppLayout>
    </ProtectedRoute>
  )
}
