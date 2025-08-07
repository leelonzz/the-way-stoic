'use client'

import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { NavigationOptimizedCachedPage } from '@/components/layout/NavigationOptimizedCachedPage';
import { JournalSkeleton } from '@/components/journal/JournalSkeleton';
import Journal from "@/pages/Journal"
import { ErrorBoundary } from 'react-error-boundary'
import { prefetchJournal } from '@/lib/prefetch'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

function ErrorFallback({ resetErrorBoundary }: { resetErrorBoundary: () => void }): JSX.Element {
  return (
    <div className="h-full flex items-center justify-center bg-stone-50">
      <div className="text-center p-8">
        <h2 className="text-2xl font-semibold text-stone-700 mb-4">
          Something went wrong with the Journal
        </h2>
        <p className="text-stone-600 mb-6">
          Don't worry, your data is safe. Please try refreshing the page.
        </p>
        <button
          onClick={resetErrorBoundary}
          className="px-6 py-3 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

// Component to handle prefetching
function JournalWithPrefetch(): JSX.Element {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  // Prefetch journal data when component mounts
  useEffect(() => {
    if (user?.id) {
      prefetchJournal(queryClient, user.id).catch(error => {
      });
    }
  }, [user?.id, queryClient]);

  return <Journal />;
}

export default function JournalPage(): JSX.Element {
  return (
    <ProtectedRoute>
      <AppLayout fullWidth>
        <NavigationOptimizedCachedPage
          pageKey="journal"
          fallback={<JournalSkeleton />}
          preserveOnNavigation={true}
          refreshOnlyWhenStale={true}
          maxAge={30 * 60 * 1000} // 30 minutes - longer cache for seamless navigation
          navigationRefreshThreshold={30 * 60 * 1000} // 30 minutes - keep journal cached
        >
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => window.location.reload()}
          >
            <JournalWithPrefetch />
          </ErrorBoundary>
        </NavigationOptimizedCachedPage>
      </AppLayout>
    </ProtectedRoute>
  );
}