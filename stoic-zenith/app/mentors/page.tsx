'use client'

import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { NavigationOptimizedCachedPage } from "@/components/layout/NavigationOptimizedCachedPage";
import Mentors from "@/pages/Mentors";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

function MentorsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-10">
        <div className="h-8 bg-stone/10 rounded w-48 mb-3"></div>
        <div className="h-5 bg-stone/10 rounded w-64"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white/30 rounded-xl p-6 border border-stone/5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-stone/10 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-stone/10 rounded w-24"></div>
                <div className="h-4 bg-stone/10 rounded w-32"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-stone/10 rounded w-full"></div>
              <div className="h-4 bg-stone/10 rounded w-3/4"></div>
              <div className="h-4 bg-stone/10 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MentorsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <NavigationOptimizedCachedPage
          pageKey="mentors"
          fallback={<MentorsSkeleton />}
          preserveOnNavigation={true}
          refreshOnlyWhenStale={false} // Mentor content is static
          maxAge={2 * 60 * 60 * 1000} // 2 hours - mentor content is very static
        >
          <Mentors />
        </NavigationOptimizedCachedPage>
      </AppLayout>
    </ProtectedRoute>
  );
}