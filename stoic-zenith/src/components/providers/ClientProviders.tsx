'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { DodoProvider } from '@/components/providers/DodoProvider'
import { PageCacheProvider } from '@/components/providers/PageCacheProvider'
import { PrefetchProvider } from '@/components/providers/PrefetchProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ReactNode, useState } from 'react'

interface ClientProvidersProps {
  children: ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps): JSX.Element {
  // Create QueryClient in a client component to avoid server/client boundary issues
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Optimized for navigation performance - longer stale time
        staleTime: 10 * 60 * 1000, // 10 minutes - prevent unnecessary refetches during navigation
        gcTime: 30 * 60 * 1000, // 30 minutes - keep data in cache longer
        retry: (failureCount, error) => {
          // Smart retry logic based on error type
          if (error?.message?.includes('Network Error') || error?.message?.includes('fetch')) {
            return failureCount < 3; // Retry network errors up to 3 times
          }
          // Check for HTTP status errors (error might have a status property if it's an HTTP error)
          const httpError = error as any;
          if (httpError?.status === 401 || httpError?.status === 403) {
            return false; // Don't retry auth errors
          }
          return failureCount < 2; // Default retry for other errors
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
        refetchOnWindowFocus: false, // Disable to prevent unnecessary refetches on navigation
        refetchOnReconnect: 'always', // Always refetch when reconnecting
        refetchOnMount: false, // Disable to use cached data on mount
        // Network mode for better offline handling
        networkMode: 'online',
        // Refetch interval for critical data (disabled by default, can be enabled per query)
        refetchInterval: false,
      },
      mutations: {
        retry: (failureCount, error) => {
          // More conservative retry for mutations
          const httpError = error as any;
          if (httpError?.status === 401 || httpError?.status === 403) {
            return false; // Don't retry auth errors
          }
          return failureCount < 1; // Only retry once for mutations
        },
        retryDelay: 1000, // 1 second delay for mutation retries
        networkMode: 'online',
      },
    },
  }))

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <PrefetchProvider>
              <DodoProvider>
                <PageCacheProvider
                  maxCacheSize={20} // Increased cache size for better performance
                  maxAge={45 * 60 * 1000} // 45 minutes - balanced cache duration
                >
                  {children}
                  <Toaster />
                  <Sonner />
                </PageCacheProvider>
              </DodoProvider>
            </PrefetchProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}