'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { usePageCache } from '@/components/providers/PageCacheProvider'
import { handleNavigationPrefetch } from '@/lib/prefetch'

interface PrefetchConfig {
  routes: string[]
  delayMs?: number
  onIdle?: boolean
  prefetchData?: boolean
}

const DEFAULT_ROUTES = [
  '/',
  '/journal', 
  '/quotes',
  '/mentors',
  '/calendar',
  '/quotes?tab=library',
  '/quotes?tab=favorites',
  '/quotes?tab=my-quotes'
]

export function useAggressivePrefetch(config?: Partial<PrefetchConfig>) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useAuthContext()
  const { isPageCached } = usePageCache()
  const prefetchedRef = useRef<Set<string>>(new Set())
  
  const {
    routes = DEFAULT_ROUTES,
    delayMs = 2000,
    onIdle = true,
    prefetchData = true
  } = config || {}

  const prefetchRoute = useCallback(async (route: string) => {
    if (prefetchedRef.current.has(route)) return
    
    try {
      // Mark as prefetched to avoid duplicates
      prefetchedRef.current.add(route)
      
      // Prefetch the route component
      router.prefetch(route)
      
      // Prefetch data if enabled and not cached
      const pageKey = route.replace('/', '') || 'home'
      if (prefetchData && !isPageCached(pageKey)) {
        await handleNavigationPrefetch(route, queryClient, user?.id)
      }
    } catch (error) {
      // Remove from prefetched set if failed
      prefetchedRef.current.delete(route)
      console.warn(`Failed to prefetch route: ${route}`, error)
    }
  }, [router, queryClient, user?.id, isPageCached, prefetchData])

  const prefetchAllRoutes = useCallback(async () => {
    for (const route of routes) {
      await prefetchRoute(route)
      // Small delay between prefetches to avoid overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }, [routes, prefetchRoute])

  // Prefetch on mount with delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onIdle) {
        // Use requestIdleCallback if available, otherwise fallback to setTimeout
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          window.requestIdleCallback(() => {
            prefetchAllRoutes()
          }, { timeout: 5000 })
        } else {
          prefetchAllRoutes()
        }
      } else {
        prefetchAllRoutes()
      }
    }, delayMs)

    return () => clearTimeout(timer)
  }, [delayMs, onIdle, prefetchAllRoutes])

  // Prefetch individual route on demand
  const prefetchOnDemand = useCallback((route: string) => {
    if (onIdle && typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        prefetchRoute(route)
      })
    } else {
      prefetchRoute(route)
    }
  }, [prefetchRoute, onIdle])

  return {
    prefetchRoute: prefetchOnDemand,
    prefetchAllRoutes,
    isPrefetched: (route: string) => prefetchedRef.current.has(route),
    clearPrefetchCache: () => prefetchedRef.current.clear()
  }
}