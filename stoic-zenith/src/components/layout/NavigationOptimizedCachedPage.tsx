'use client'

import React, { ReactNode, useState, useEffect, useRef } from 'react'
import { usePageCache } from '@/components/providers/PageCacheProvider'
import { usePathname } from 'next/navigation'

interface NavigationOptimizedCachedPageProps {
  pageKey: string
  children: ReactNode
  fallback?: ReactNode
  maxAge?: number
  // Navigation-specific options
  preserveOnNavigation?: boolean
  refreshOnlyWhenStale?: boolean
  navigationRefreshThreshold?: number
}

/**
 * Enhanced caching component optimized for seamless navigation.
 * Prevents unnecessary reloads while maintaining data freshness.
 * 
 * Key features:
 * - Instant navigation between cached pages
 * - Smart cache invalidation based on content type
 * - Preserved scroll positions
 * - Reduced loading states for previously visited pages
 * - Navigation-aware refresh logic
 */
export function NavigationOptimizedCachedPage({ 
  pageKey, 
  children, 
  fallback,
  maxAge = 30 * 60 * 1000, // 30 minutes default - much longer for seamless navigation
  preserveOnNavigation = true,
  refreshOnlyWhenStale = true,
  navigationRefreshThreshold = 30 * 60 * 1000 // 30 minutes - only refresh very stale content
}: NavigationOptimizedCachedPageProps): ReactNode {
  const { 
    getCachedPage, 
    setCachedPage, 
    updateScrollPosition, 
    clearPageCache
  } = usePageCache()
  
  const [isLoading, setIsLoading] = useState(true)
  const [showCached, setShowCached] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const lastPathnameRef = useRef<string>('')
  const navigationCountRef = useRef<number>(0)

  // Debug logging for development
  const debugLog = (message: string, data?: unknown): void => {
    // Removed console logging to clean up debug messages
  }

  // Save scroll position when component unmounts or page changes
  useEffect(() => {
    const saveScrollPosition = () => {
      if (containerRef.current) {
        const { scrollTop, scrollLeft } = containerRef.current
        updateScrollPosition(pageKey, { x: scrollLeft, y: scrollTop })
        debugLog('Scroll position saved', { x: scrollLeft, y: scrollTop })
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveScrollPosition()
      }
    }

    const handleBeforeUnload = () => {
      saveScrollPosition()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      saveScrollPosition()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [pageKey, updateScrollPosition])

  // Smart navigation-based cache management
  useEffect(() => {
    if (pathname !== lastPathnameRef.current) {
      navigationCountRef.current += 1
      debugLog('Navigation detected', { 
        from: lastPathnameRef.current, 
        to: pathname, 
        count: navigationCountRef.current 
      })

      // For navigation optimization: never clear cache on navigation
      // Only clear cache if explicitly requested or expired
      if (preserveOnNavigation) {
        const cached = getCachedPage(pageKey)
        if (cached) {
          debugLog('Using cached content for instant navigation', { 
            pageKey,
            cacheAge: Date.now() - cached.timestamp 
          })
          // Don't clear cache, just use what we have
        }
      }
      
      lastPathnameRef.current = pathname
    }
  }, [pathname, pageKey, getCachedPage, preserveOnNavigation])

  // Initialize page cache state on mount
  useEffect(() => {
    if (isInitialized) return

    const cached = getCachedPage(pageKey)
    debugLog('Initializing cache check', { hasCached: !!cached })
    
    if (cached) {
      // Check if cache is expired
      const cacheAge = Date.now() - cached.timestamp
      const isExpired = maxAge && cacheAge > maxAge
      
      if (isExpired && !preserveOnNavigation) {
        // Only clear if not preserving for navigation
        debugLog('Cache expired - clearing and loading fresh', { cacheAge, maxAge })
        clearPageCache(pageKey)
        setShowCached(false)
        setIsLoading(true)
      } else {
        // Always show cached content for instant navigation
        debugLog('Cache HIT - showing cached content immediately', { expired: isExpired, preserving: preserveOnNavigation })
        setShowCached(true)
        setIsLoading(false)
        
        // Restore scroll position after a brief delay
        setTimeout(() => {
          if (containerRef.current && cached.scrollPosition) {
            containerRef.current.scrollTop = cached.scrollPosition.y
            containerRef.current.scrollLeft = cached.scrollPosition.x
            debugLog('Scroll position restored', cached.scrollPosition)
          }
        }, 50)
      }
    } else {
      debugLog('Cache MISS - will show live content and cache it')
      setShowCached(false)
      setIsLoading(true)
    }
    
    setIsInitialized(true)
  }, [pageKey, getCachedPage, clearPageCache, maxAge, isInitialized])

  // Cache the rendered children when they're ready and not showing cached content
  useEffect(() => {
    if (!showCached && !isLoading && children && isInitialized) {
      debugLog('Caching new content')
      setCachedPage(pageKey, children)
      setShowCached(true)
    }
  }, [children, isLoading, showCached, pageKey, setCachedPage, isInitialized])

  // Handle children mounting completion
  useEffect(() => {
    if (!showCached && isInitialized) {
      // Give children time to mount and render
      const timeout = setTimeout(() => {
        debugLog('Content ready - caching and showing')
        setIsLoading(false)
      }, 100)
      
      return () => clearTimeout(timeout)
    }
  }, [showCached, isInitialized])

  // Show cached content immediately if available
  if (showCached && isInitialized) {
    const cached = getCachedPage(pageKey)
    if (cached) {
      debugLog('Rendering cached content')
      return (
        <div ref={containerRef} className="navigation-cached-page-container h-full">
          {cached.component}
        </div>
      )
    }
  }

  // Show loading or live content
  if (isLoading && isInitialized) {
    debugLog('Showing fallback loading')
    return fallback || <div>Loading...</div>
  }

  // Show live content that will be cached
  debugLog('Rendering live content for caching')
  return (
    <div ref={containerRef} className="navigation-cached-page-container h-full">
      {children}
    </div>
  )
}

// Hook for navigation-aware cache control
export function useNavigationOptimizedCache(pageKey: string) {
  const { clearPageCache, isPageCached, getCachedPage } = usePageCache()
  
  const forceRefresh = () => {
    debugLog('Manual refresh requested')
    clearPageCache(pageKey)
  }
  
  const isCached = isPageCached(pageKey)
  const cacheInfo = getCachedPage(pageKey)
  
  return {
    forceRefresh,
    isCached,
    cacheAge: cacheInfo ? Date.now() - cacheInfo.timestamp : 0,
    isStale: cacheInfo ? Date.now() - cacheInfo.timestamp > 5 * 60 * 1000 : false
  }
}

function debugLog(message: string, data?: unknown): void {
  // Removed console logging to clean up debug messages
}
