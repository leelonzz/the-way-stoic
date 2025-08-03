'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { PayPalProvider } from '@/components/providers/PayPalProvider'
import { PageCacheProvider } from '@/components/providers/PageCacheProvider'
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
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 2,
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
      },
      mutations: {
        retry: 1,
      },
    },
  }))

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <PayPalProvider>
              <PageCacheProvider maxCacheSize={15} maxAge={60 * 60 * 1000}>
                {children}
                <Toaster />
                <Sonner />
              </PageCacheProvider>
            </PayPalProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}