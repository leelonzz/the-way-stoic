'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { NavigationOptimizedCachedPage } from '@/components/layout/NavigationOptimizedCachedPage'
import LifeCalendar from '@/components/pages-components/LifeCalendar'

// Force dynamic rendering to prevent static generation issues with AuthProvider
export const dynamic = 'force-dynamic'

function CalendarSkeleton(): JSX.Element {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-10">
        <div className="h-8 bg-stone/10 rounded w-48 mb-3"></div>
        <div className="h-5 bg-stone/10 rounded w-64"></div>
      </div>
      
      <div className="grid gap-6">
        {/* Setup card skeleton */}
        <div className="bg-gradient-to-br from-hero/10 to-cta/5 border border-hero/20 rounded-lg p-6">
          <div className="text-center mb-6">
            <div className="h-8 bg-stone/10 rounded w-64 mx-auto mb-2"></div>
            <div className="h-4 bg-stone/10 rounded w-48 mx-auto"></div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-4 bg-stone/10 rounded w-20"></div>
              <div className="h-10 bg-stone/10 rounded w-full"></div>
            </div>
            
            <div className="space-y-2">
              <div className="h-4 bg-stone/10 rounded w-32"></div>
              <div className="h-10 bg-stone/10 rounded w-full"></div>
            </div>
            
            <div className="h-10 bg-stone/10 rounded w-full"></div>
          </div>
        </div>
        
        {/* Calendar grid skeleton */}
        <div className="bg-white/70 border border-stone/20 rounded-lg p-6">
          <div className="h-6 bg-stone/10 rounded w-48 mb-4"></div>
          
          <div className="space-y-1">
            {Array.from({ length: 80 }, (_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-8 h-4 bg-stone/10 rounded"></div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 52 }, (_, j) => (
                    <div key={j} className="w-2 h-2 bg-stone/10 rounded-sm"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CalendarPage(): JSX.Element {
  return (
    <ProtectedRoute>
      <AppLayout>
        <NavigationOptimizedCachedPage
          pageKey="calendar"
          fallback={<CalendarSkeleton />}
          preserveOnNavigation={true}
          refreshOnlyWhenStale={true}
          maxAge={10 * 60 * 1000} // 10 minutes - calendar data changes infrequently
          navigationRefreshThreshold={5 * 60 * 1000} // 5 minutes
        >
          <LifeCalendar />
        </NavigationOptimizedCachedPage>
      </AppLayout>
    </ProtectedRoute>
  )
}
