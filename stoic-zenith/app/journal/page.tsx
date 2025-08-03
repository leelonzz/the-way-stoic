'use client'

import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CachedPage } from '@/components/layout/CachedPage'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Journal from "@/pages/Journal"

function JournalLoading(): JSX.Element {
  return (
    <div className="h-full flex bg-stone-50">
      <div className="w-80 min-w-80 bg-white border-r border-stone-200 flex-shrink-0 hidden lg:flex">
        <div className="flex-1 p-4 space-y-4">
          <div className="h-8 bg-stone-200 rounded animate-pulse"></div>
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 bg-stone-100 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    </div>
  )
}

export default function JournalPage(): JSX.Element {
  return (
    <ProtectedRoute>
      <AppLayout fullWidth>
        <CachedPage
          pageKey="journal"
          fallback={<JournalLoading />}
          refreshOnFocus={true}
          maxAge={5 * 60 * 1000} // 5 minutes - shorter cache for journal to ensure content freshness
        >
          <Journal />
        </CachedPage>
      </AppLayout>
    </ProtectedRoute>
  );
}