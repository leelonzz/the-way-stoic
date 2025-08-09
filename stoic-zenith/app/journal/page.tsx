'use client'
export const dynamic = 'force-dynamic'

import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Journal from '@/components/pages-components/Journal'
import { ErrorBoundary } from 'react-error-boundary'


function ErrorFallback({
  resetErrorBoundary,
  error,
}: {
  resetErrorBoundary: () => void
  error?: Error
}): JSX.Element {
  console.error('🚨 Journal Error Boundary triggered:', error)

  // Don't log authentication-related errors as critical failures
  const isAuthError = error?.message?.includes('auth') || error?.message?.includes('session') || error?.message?.includes('unauthorized')

  if (isAuthError) {
    console.log('📝 Journal error appears to be auth-related, showing gentle fallback')
  }

  return (
    <div className="h-full flex items-center justify-center bg-stone-50">
      <div className="text-center p-8 max-w-md mx-auto">
        <h2 className="text-2xl font-semibold text-stone-700 mb-4">
          {isAuthError ? 'Loading Your Journal' : 'Something went wrong with the Journal'}
        </h2>
        <p className="text-stone-600 mb-6">
          {isAuthError
            ? 'Please wait while we set up your journal...'
            : 'Don\'t worry, your data is safe. Please try refreshing the page.'
          }
        </p>

        {/* Only show error details for non-auth errors in development */}
        {process.env.NODE_ENV === 'development' && error && !isAuthError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
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

        <div className="flex flex-col gap-3">
          <button
            onClick={resetErrorBoundary}
            className="px-6 py-3 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors"
          >
            {isAuthError ? 'Continue' : 'Try Again'}
          </button>

          {!isAuthError && (
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 transition-colors"
            >
              Reload Page
            </button>
          )}
        </div>
      </div>
    </div>
  )
}



// Simplified journal component without redundant prefetching
function JournalComponent(): JSX.Element {
  // Remove prefetching - let useCachedJournal handle all data loading
  return <Journal />
}

export default function JournalPage(): JSX.Element {
  return (
    <ProtectedRoute>
      <AppLayout fullWidth>
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => window.location.reload()}
        >
          <JournalComponent />
        </ErrorBoundary>
      </AppLayout>
    </ProtectedRoute>
  )
}
