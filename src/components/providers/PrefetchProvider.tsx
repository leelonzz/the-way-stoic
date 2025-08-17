'use client'

import { useEffect, ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { prefetchCriticalPages } from '@/lib/prefetch'

interface PrefetchProviderProps {
  children: ReactNode
}

/**
 * Provider that handles critical page prefetching on app initialization
 * This improves navigation performance by preloading commonly accessed data
 */
export function PrefetchProvider({ children }: PrefetchProviderProps): JSX.Element {
  const queryClient = useQueryClient()
  const { user, isAuthenticated } = useAuthContext()

  useEffect(() => {
    // Only prefetch after authentication is determined
    if (isAuthenticated && user?.id) {
      // Delay prefetch slightly to not interfere with initial page load
      const timer = setTimeout(() => {
        prefetchCriticalPages(queryClient, user.id)
      }, 1000) // 1 second delay

      return () => clearTimeout(timer)
    } else if (isAuthenticated === false) {
      // For unauthenticated users, still prefetch quotes for landing page
      const timer = setTimeout(() => {
        prefetchCriticalPages(queryClient)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [queryClient, user?.id, isAuthenticated])

  return <>{children}</>
}
