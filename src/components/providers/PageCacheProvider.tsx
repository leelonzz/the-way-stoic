'use client'

import React, { createContext, useContext, useCallback, useState, useRef, ReactNode } from 'react'

interface CachedPageData {
  component: ReactNode
  timestamp: number
  scrollPosition?: { x: number; y: number }
  customState?: Record<string, unknown>
}

interface PageCacheContextType {
  getCachedPage: (pageKey: string) => CachedPageData | null
  setCachedPage: (pageKey: string, component: ReactNode) => void
  clearCache: () => void
  clearPageCache: (pageKey: string) => void
  updateScrollPosition: (pageKey: string, position: { x: number; y: number }) => void
  updateCustomState: (pageKey: string, state: Record<string, unknown>) => void
  getCustomState: (pageKey: string) => Record<string, unknown> | null
  isPageCached: (pageKey: string) => boolean
  getCacheSize: () => number
}

const PageCacheContext = createContext<PageCacheContextType | null>(null)

interface PageCacheProviderProps {
  children: ReactNode
  maxCacheSize?: number
  maxAge?: number
}

export function PageCacheProvider({ 
  children, 
  maxCacheSize = 10,
  maxAge = 60 * 60 * 1000 // 60 minutes - longer for better navigation
}: PageCacheProviderProps): JSX.Element {
  const cacheRef = useRef<Map<string, CachedPageData>>(new Map())
  const [, forceUpdate] = useState({})

  const triggerUpdate = useCallback(() => {
    forceUpdate({})
  }, [])

  const cleanExpiredCache = useCallback(() => {
    const now = Date.now()
    const cache = cacheRef.current
    
    for (const [key, data] of cache.entries()) {
      if (now - data.timestamp > maxAge) {
        cache.delete(key)
      }
    }
  }, [maxAge])

  const evictOldestIfNeeded = useCallback(() => {
    const cache = cacheRef.current
    
    if (cache.size >= maxCacheSize) {
      // Remove oldest entry (first in map)
      const firstKey = cache.keys().next().value
      if (firstKey) {
        cache.delete(firstKey)
      }
    }
  }, [maxCacheSize])

  const getCachedPage = useCallback((pageKey: string): CachedPageData | null => {
    cleanExpiredCache()
    const cached = cacheRef.current.get(pageKey)
    
    if (cached) {
      // Move to end (most recently accessed)
      cacheRef.current.delete(pageKey)
      cacheRef.current.set(pageKey, cached)
      return cached
    }
    
    return null
  }, [cleanExpiredCache])

  const setCachedPage = useCallback((pageKey: string, component: ReactNode) => {
    evictOldestIfNeeded()
    
    const cachedData: CachedPageData = {
      component,
      timestamp: Date.now()
    }
    
    cacheRef.current.set(pageKey, cachedData)
    triggerUpdate()
  }, [evictOldestIfNeeded, triggerUpdate])

  const clearCache = useCallback(() => {
    cacheRef.current.clear()
    triggerUpdate()
  }, [triggerUpdate])

  const clearPageCache = useCallback((pageKey: string) => {
    const deleted = cacheRef.current.delete(pageKey)
    if (deleted) {
      triggerUpdate()
    }
  }, [triggerUpdate])

  const updateScrollPosition = useCallback((pageKey: string, position: { x: number; y: number }) => {
    const cached = cacheRef.current.get(pageKey)
    if (cached) {
      cached.scrollPosition = position
      cacheRef.current.set(pageKey, cached)
    }
  }, [])

  const updateCustomState = useCallback((pageKey: string, state: Record<string, unknown>) => {
    const cached = cacheRef.current.get(pageKey)
    if (cached) {
      cached.customState = { ...cached.customState, ...state }
      cacheRef.current.set(pageKey, cached)
    }
  }, [])

  const getCustomState = useCallback((pageKey: string): Record<string, unknown> | null => {
    const cached = cacheRef.current.get(pageKey)
    return cached?.customState || null
  }, [])

  const isPageCached = useCallback((pageKey: string): boolean => {
    cleanExpiredCache()
    return cacheRef.current.has(pageKey)
  }, [cleanExpiredCache])

  const getCacheSize = useCallback((): number => {
    cleanExpiredCache()
    return cacheRef.current.size
  }, [cleanExpiredCache])

  const contextValue: PageCacheContextType = {
    getCachedPage,
    setCachedPage,
    clearCache,
    clearPageCache,
    updateScrollPosition,
    updateCustomState,
    getCustomState,
    isPageCached,
    getCacheSize
  }

  return (
    <PageCacheContext.Provider value={contextValue}>
      {children}
    </PageCacheContext.Provider>
  )
}

export function usePageCache(): PageCacheContextType {
  const context = useContext(PageCacheContext)
  if (!context) {
    throw new Error('usePageCache must be used within a PageCacheProvider')
  }
  return context
}