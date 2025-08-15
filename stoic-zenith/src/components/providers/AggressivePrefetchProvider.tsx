'use client'

import React, { ReactNode, useEffect } from 'react'
import { useAggressivePrefetch } from '@/hooks/useAggressivePrefetch'
import { useAuthContext } from '@/components/auth/AuthProvider'

interface AggressivePrefetchProviderProps {
  children: ReactNode
}

export function AggressivePrefetchProvider({ children }: AggressivePrefetchProviderProps): JSX.Element {
  const { isAuthenticated, isLoading } = useAuthContext()
  
  const { prefetchAllRoutes, clearPrefetchCache } = useAggressivePrefetch({
    routes: [
      '/',
      '/journal',
      '/quotes',
      '/quotes?tab=library',
      '/quotes?tab=favorites', 
      '/quotes?tab=my-quotes',
      '/mentors'
    ],
    delayMs: 3000, // Wait 3 seconds to avoid blocking auth
    onIdle: true, // Wait for browser idle time
    prefetchData: true
  })

  // Prefetch routes after user is authenticated and app is loaded
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Clear any existing cache and start fresh prefetch
      clearPrefetchCache()
      
      // Start aggressive prefetching immediately
      prefetchAllRoutes()
    }
  }, [isAuthenticated, isLoading, prefetchAllRoutes, clearPrefetchCache])

  return <>{children}</>
}