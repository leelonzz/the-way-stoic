'use client'

import React, { ReactNode, useState, useEffect, useRef } from 'react'
import { usePageCache } from '@/components/providers/PageCacheProvider'
import { usePathname } from 'next/navigation'

interface SmartQuoteCachedPageProps {
  pageKey: string
  children: ReactNode
  fallback?: ReactNode
  maxAge?: number
  // Quote-specific options
  enableQuoteRefresh?: boolean
  quoteRefreshThreshold?: number
}

/**
 * Smart caching component specifically designed for quote pages.
 * Handles the dynamic nature of quotes while providing performance benefits.
 * 
 * Key features:
 * - Caches non-quote content (UI, layout, static elements)
 * - Allows dynamic quote content to refresh as needed
 * - Preserves scroll position
 * - Handles navigation-aware loading
 * - Respects quote refresh quotas and daily quote logic
 */
export function SmartQuoteCachedPage({ 
  pageKey, 
  children, 
  fallback,
  maxAge = 5 * 60 * 1000, // 5 minutes default for quote pages
  enableQuoteRefresh = true,
  quoteRefreshThreshold = 30 * 1000 // 30 seconds
}: SmartQuoteCachedPageProps): ReactNode {
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

  // Handle navigation-based cache invalidation for quote pages
  useEffect(() => {
    const isQuotePage = pageKey === 'home' || pageKey === 'quotes' || pageKey.includes('quote')
    
    if (isQuotePage && pathname !== lastPathnameRef.current) {
      const isNavigatingToQuotePage = pathname === '/' || pathname === '/quotes'
      
      if (isNavigatingToQuotePage) {
        const cached = getCachedPage(pageKey)
        if (cached && enableQuoteRefresh) {
          const cacheAge = Date.now() - cached.timestamp
          
          // Clear cache if it's older than the refresh threshold
          if (cacheAge > quoteRefreshThreshold) {
            debugLog('Navigation detected - clearing stale quote cache', { 
              cacheAge, 
              threshold: quoteRefreshThreshold 
            })
            clearPageCache(pageKey)
            setShowCached(false)
            setIsLoading(true)
          }
        }
      }
      
      lastPathnameRef.current = pathname
    }
  }, [pathname, pageKey, getCachedPage, clearPageCache, enableQuoteRefresh, quoteRefreshThreshold])

  // Initialize page cache state on mount
  useEffect(() => {
    if (isInitialized) return

    const cached = getCachedPage(pageKey)
    debugLog('Initializing cache check', { hasCached: !!cached })

    if (cached) {
      // For quote pages, check if cache is still valid
      const cacheAge = Date.now() - cached.timestamp
      const isExpired = maxAge && cacheAge > maxAge

      if (isExpired) {
        debugLog('Cache expired - clearing and loading fresh', { cacheAge, maxAge })
        clearPageCache(pageKey)
        setShowCached(false)
        setIsLoading(false) // Show live content immediately
      } else {
        debugLog('Cache HIT - showing cached content immediately')
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
      setIsLoading(false) // Show live content immediately
    }

    setIsInitialized(true)
  }, [pageKey, getCachedPage, clearPageCache, maxAge])

  // Cache the live content after a delay to allow it to render
  useEffect(() => {
    if (!showCached && isInitialized && !isLoading) {
      // Cache the content after a short delay to ensure it's rendered
      const cacheTimer = setTimeout(() => {
        debugLog('Caching live content after render delay')
        setCachedPage(pageKey, children)
      }, 1000) // 1 second delay to allow content to fully render

      return () => clearTimeout(cacheTimer)
    }
  }, [showCached, isInitialized, isLoading, children, pageKey, setCachedPage])

  // Show fallback while initializing
  if (!isInitialized) {
    return fallback || <div>Loading...</div>
  }

  // Show cached content if available
  if (showCached) {
    const cached = getCachedPage(pageKey)
    if (cached) {
      return (
        <div ref={containerRef} className="h-full overflow-auto">
          {cached.component}
        </div>
      )
    }
  }

  // Show live content and prepare to cache it
  return (
    <div ref={containerRef} className="h-full overflow-auto">
      {children}
    </div>
  )
}

// Hook for manual cache control specific to quote pages
export function useSmartQuoteCacheControl(pageKey: string) {
  const { clearPageCache, isPageCached, getCachedPage } = usePageCache()
  
  const refreshQuoteCache = () => {
    debugLog('Manual quote cache refresh requested')
    clearPageCache(pageKey)
    // Force a re-render by navigating to the same page
    window.location.reload()
  }
  
  const clearQuoteCache = () => {
    debugLog('Manual quote cache clear requested')
    clearPageCache(pageKey)
  }
  
  const isCached = isPageCached(pageKey)
  const cacheInfo = getCachedPage(pageKey)
  
  return {
    refreshQuoteCache,
    clearQuoteCache,
    isCached,
    cacheAge: cacheInfo ? Date.now() - cacheInfo.timestamp : 0,
    isStale: cacheInfo ? Date.now() - cacheInfo.timestamp > 30 * 1000 : false
  }
}

function debugLog(message: string, data?: unknown): void {
  // Removed console logging to clean up debug messages
}
