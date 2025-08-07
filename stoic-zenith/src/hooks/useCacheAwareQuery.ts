'use client'

import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import { usePageCache } from '@/components/providers/PageCacheProvider'
import { usePathname } from 'next/navigation'

interface CacheAwareQueryOptions<TData> extends UseQueryOptions<TData> {
  pageKey?: string
  respectPageCache?: boolean
  cacheThreshold?: number // milliseconds
}

/**
 * Cache-aware query hook that coordinates with page-level caching
 * Prevents redundant API calls when navigating to cached pages
 */
export function useCacheAwareQuery<TData>(
  options: CacheAwareQueryOptions<TData>
): UseQueryResult<TData> {
  const { getCachedPage } = usePageCache()
  const pathname = usePathname()
  
  const {
    pageKey,
    respectPageCache = true,
    cacheThreshold = 5 * 60 * 1000, // 5 minutes default
    ...queryOptions
  } = options

  // Determine if we should skip the query based on page cache
  const shouldSkipQuery = (): boolean => {
    if (!respectPageCache || !pageKey) return false
    
    const cachedPage = getCachedPage(pageKey)
    if (!cachedPage) return false
    
    // Check if cached page is fresh enough
    const cacheAge = Date.now() - cachedPage.timestamp
    const isFresh = cacheAge < cacheThreshold
    
    if (isFresh) {
      console.log(`[CacheAwareQuery] Skipping query for ${pageKey} - using cached data (age: ${Math.round(cacheAge / 1000)}s)`)
      return true
    }
    
    return false
  }

  // Get page key from pathname if not provided
  const getPageKeyFromPath = (path: string): string | null => {
    if (path === '/') return 'home'
    if (path.startsWith('/quotes')) return 'quotes'
    if (path.startsWith('/mentors')) return 'mentors'
    if (path.startsWith('/journal')) return 'journal'
    if (path.startsWith('/calendar')) return 'calendar'
    return null
  }

  const effectivePageKey = pageKey || getPageKeyFromPath(pathname)
  const skipQuery = effectivePageKey ? shouldSkipQuery() : false

  return useQuery({
    ...queryOptions,
    enabled: !skipQuery && (queryOptions.enabled !== false),
    staleTime: respectPageCache ? Math.max((typeof queryOptions.staleTime === 'number' ? queryOptions.staleTime : 0) || 0, cacheThreshold) : queryOptions.staleTime,
    gcTime: respectPageCache ? Math.max(queryOptions.gcTime || 0, cacheThreshold * 2) : queryOptions.gcTime,
  })
}

/**
 * Hook for cache-aware data fetching with automatic page key detection
 */
export function usePageAwareQuery<TData>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options: Omit<CacheAwareQueryOptions<TData>, 'queryKey' | 'queryFn'> = {}
): UseQueryResult<TData> {
  const pathname = usePathname()
  
  // Auto-detect page key from pathname
  const getPageKeyFromPath = (path: string): string | null => {
    if (path === '/') return 'home'
    if (path.startsWith('/quotes')) return 'quotes'
    if (path.startsWith('/mentors')) return 'mentors'
    if (path.startsWith('/journal')) return 'journal'
    if (path.startsWith('/calendar')) return 'calendar'
    return null
  }

  const pageKey = options.pageKey || getPageKeyFromPath(pathname)

  return useCacheAwareQuery({
    queryKey,
    queryFn,
    pageKey: pageKey || undefined,
    ...options,
  })
}

/**
 * Hook for queries that should always respect navigation cache
 */
export function useNavigationCachedQuery<TData>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options: Omit<CacheAwareQueryOptions<TData>, 'queryKey' | 'queryFn' | 'respectPageCache'> = {}
): UseQueryResult<TData> {
  return usePageAwareQuery(queryKey, queryFn, {
    ...options,
    respectPageCache: true,
    cacheThreshold: options.cacheThreshold || 10 * 60 * 1000, // 10 minutes for navigation cache
  })
}

/**
 * Hook for background data updates that don't interfere with navigation
 */
export function useBackgroundQuery<TData>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'> = {}
): UseQueryResult<TData> {
  return useQuery({
    queryKey,
    queryFn,
    ...options,
    // Background queries should not show loading states
    notifyOnChangeProps: ['data', 'error'],
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}
