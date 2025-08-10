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
      '/mentors',
      '/calendar'
    ],
    delayMs: 1500, // Start prefetching after 1.5 seconds
    onIdle: true,
    prefetchData: true
  })

  // Prefetch routes after user is authenticated and app is loaded
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Clear any existing cache and start fresh prefetch
      clearPrefetchCache()
      
      // Start aggressive prefetching after a short delay
      const timer = setTimeout(() => {
        prefetchAllRoutes()
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, isLoading, prefetchAllRoutes, clearPrefetchCache])

  return <>{children}</>
}