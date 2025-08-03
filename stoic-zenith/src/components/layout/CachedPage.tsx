'use client'

import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { usePageCache } from '@/components/providers/PageCacheProvider'
import { usePathname } from 'next/navigation'

interface CachedPageProps {
  pageKey: string
  children: ReactNode
  fallback?: ReactNode
  refreshOnFocus?: boolean
  maxAge?: number
}

export function CachedPage({ 
  pageKey, 
  children, 
  fallback,
  refreshOnFocus = false,
  maxAge
}: CachedPageProps) {
  const { 
    getCachedPage, 
    setCachedPage, 
    updateScrollPosition, 
    isPageCached,
    clearPageCache
  } = usePageCache()
  
  const [isLoading, setIsLoading] = useState(true)
  const [showCached, setShowCached] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Debug logging for development
  const debugLog = (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[CachedPage:${pageKey}] ${message}`, data || '')
    }
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

  // Handle refresh on focus
  useEffect(() => {
    if (!refreshOnFocus) return

    const handleFocus = () => {
      const cached = getCachedPage(pageKey)
      if (cached && maxAge) {
        const isExpired = Date.now() - cached.timestamp > maxAge
        if (isExpired) {
          debugLog('Cache expired, clearing')
          clearPageCache(pageKey)
          setShowCached(false)
          setIsLoading(true)
        }
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [pageKey, refreshOnFocus, maxAge, getCachedPage, clearPageCache])

  // Initialize page cache state on mount
  useEffect(() => {
    if (isInitialized) return

    const cached = getCachedPage(pageKey)
    debugLog('Initializing cache check', { hasCached: !!cached })
    
    if (cached) {
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
    } else {
      debugLog('Cache MISS - will show live content and cache it')
      setShowCached(false)
      setIsLoading(true)
    }
    
    setIsInitialized(true)
  }, [pageKey, getCachedPage, isInitialized])

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
        <div ref={containerRef} className="cached-page-container h-full">
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
    <div ref={containerRef} className="cached-page-container h-full">
      {children}
    </div>
  )
}

// Hook for manual cache control
export function useCachedPageControl(pageKey: string) {
  const { clearPageCache, isPageCached, getCachedPage } = usePageCache()
  
  const refreshPage = () => {
    clearPageCache(pageKey)
    // Force a re-render by navigating to the same page
    window.location.reload()
  }
  
  const isCached = isPageCached(pageKey)
  const cacheInfo = getCachedPage(pageKey)
  
  return {
    refreshPage,
    isCached,
    cacheAge: cacheInfo ? Date.now() - cacheInfo.timestamp : 0,
    clearCache: () => clearPageCache(pageKey)
  }
}