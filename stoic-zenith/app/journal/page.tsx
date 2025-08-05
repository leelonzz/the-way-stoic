'use client'

import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Journal from "@/pages/Journal"
import { ErrorBoundary } from 'react-error-boundary'

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

export default function JournalPage(): JSX.Element {
  return (
    <ProtectedRoute>
      <AppLayout fullWidth>
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => window.location.reload()}
        >
          <Journal />
        </ErrorBoundary>
      </AppLayout>
    </ProtectedRoute>
  );
}