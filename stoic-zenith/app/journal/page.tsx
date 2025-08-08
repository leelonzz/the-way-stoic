'use client'
export const dynamic = 'force-dynamic'

import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Journal from '@/components/pages-components/Journal'
import { ErrorBoundary } from 'react-error-boundary'
import { prefetchJournal } from '@/lib/prefetch'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

function ErrorFallback({
  resetErrorBoundary,
  error,
}: {
  resetErrorBoundary: () => void
  error?: Error
}): JSX.Element {
  console.error('🚨 Journal Error Boundary triggered:', error)

  return (
    <div className="h-full flex items-center justify-center bg-stone-50">
      <div className="text-center p-8">
        <h2 className="text-2xl font-semibold text-stone-700 mb-4">
          Something went wrong with the Journal
        </h2>
        <p className="text-stone-600 mb-6">
          Don&apos;t worry, your data is safe. Please try refreshing the page.
        </p>
        {process.env.NODE_ENV === 'development' && error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
            <p className="text-sm font-mono text-red-800 break-all">
              {error.message}
            </p>
            {error.stack && (
              <details className="mt-2">
                <summary className="text-xs text-red-600 cursor-pointer">Stack trace</summary>
                <pre className="text-xs text-red-600 mt-1 whitespace-pre-wrap">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}
        <button
          onClick={resetErrorBoundary}
          className="px-6 py-3 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

// Simple test component to isolate the issue
function SimpleJournalTest(): JSX.Element {
  const { user } = useAuthContext()

  console.log('🧪 SimpleJournalTest rendering...', { userId: user?.id })

  if (!user) {
    return <div className="p-8">Loading user...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Journal Test</h1>
      <p>User ID: {user.id}</p>
      <p>User Email: {user.email}</p>
      <p>If you see this, the basic journal page is working!</p>
    </div>
  )
}

// Component to handle prefetching
function JournalWithPrefetch(): JSX.Element {
  const { user } = useAuthContext()
  const queryClient = useQueryClient()

  // Prefetch journal data when component mounts
  useEffect(() => {
    if (user?.id) {
      prefetchJournal(queryClient, user.id).catch(_error => {})
    }
  }, [user?.id, queryClient])

  // Try the actual Journal component
  return <Journal />
  // return <SimpleJournalTest />
}

export default function JournalPage(): JSX.Element {
  return (
    <ProtectedRoute>
      <AppLayout fullWidth>
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => window.location.reload()}
        >
          <JournalWithPrefetch />
        </ErrorBoundary>
      </AppLayout>
    </ProtectedRoute>
  )
}
