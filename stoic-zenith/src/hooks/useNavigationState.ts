'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { usePageCache } from '@/components/providers/PageCacheProvider'

interface NavigationState {
  currentPath: string
  previousPath: string | null
  navigationCount: number
  isNavigating: boolean
  lastNavigationTime: number
}

interface NavigationMetrics {
  totalNavigations: number
  cacheHitRate: number
  averageNavigationTime: number
  frequentPaths: string[]
}

/**
 * Enhanced navigation state management hook
 * Provides insights and control over navigation behavior
 */
export function useNavigationState() {
  const pathname = usePathname()
  const router = useRouter()
  const { getCacheSize, isPageCached } = usePageCache()
  
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentPath: pathname,
    previousPath: null,
    navigationCount: 0,
    isNavigating: false,
    lastNavigationTime: Date.now()
  })
  
  const navigationHistoryRef = useRef<string[]>([])
  const navigationTimesRef = useRef<number[]>([])
  const cacheHitsRef = useRef<number>(0)
  const totalNavigationsRef = useRef<number>(0)

  // Track navigation changes
  useEffect(() => {
    if (pathname !== navigationState.currentPath) {
      const now = Date.now()
      const navigationTime = now - navigationState.lastNavigationTime
      
      // Update navigation history
      navigationHistoryRef.current.push(pathname)
      navigationTimesRef.current.push(navigationTime)
      
      // Keep only last 50 navigations for performance
      if (navigationHistoryRef.current.length > 50) {
        navigationHistoryRef.current = navigationHistoryRef.current.slice(-50)
        navigationTimesRef.current = navigationTimesRef.current.slice(-50)
      }
      
      // Check if this navigation hit cache
      const pageKey = getPageKeyFromPath(pathname)
      if (pageKey && isPageCached(pageKey)) {
        cacheHitsRef.current += 1
      }
      
      totalNavigationsRef.current += 1
      
      setNavigationState(prev => ({
        currentPath: pathname,
        previousPath: prev.currentPath,
        navigationCount: prev.navigationCount + 1,
        isNavigating: false,
        lastNavigationTime: now
      }))
      
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log(`[NavigationState] Navigated to ${pathname}`, {
          navigationTime,
          cached: pageKey ? isPageCached(pageKey) : false,
          totalNavigations: totalNavigationsRef.current,
          cacheHitRate: (cacheHitsRef.current / totalNavigationsRef.current * 100).toFixed(1) + '%'
        })
      }
    }
  }, [pathname, navigationState.currentPath, navigationState.lastNavigationTime, isPageCached])

  // Get page key from pathname
  const getPageKeyFromPath = useCallback((path: string): string | null => {
    switch (path) {
      case '/': return 'home'
      case '/journal': return 'journal'
      case '/quotes': return 'quotes'
      case '/calendar': return 'calendar'
      case '/mentors': return 'mentors'
      case '/settings': return 'settings'
      case '/profile': return 'profile'
      default: return null
    }
  }, [])

  // Get navigation metrics
  const getNavigationMetrics = useCallback((): NavigationMetrics => {
    const totalNavs = totalNavigationsRef.current
    const cacheHitRate = totalNavs > 0 ? (cacheHitsRef.current / totalNavs) * 100 : 0
    const avgTime = navigationTimesRef.current.length > 0 
      ? navigationTimesRef.current.reduce((a, b) => a + b, 0) / navigationTimesRef.current.length 
      : 0
    
    // Calculate frequent paths
    const pathCounts = navigationHistoryRef.current.reduce((acc, path) => {
      acc[path] = (acc[path] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const frequentPaths = Object.entries(pathCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([path]) => path)
    
    return {
      totalNavigations: totalNavs,
      cacheHitRate,
      averageNavigationTime: avgTime,
      frequentPaths
    }
  }, [])

  // Enhanced navigation with loading state
  const navigateWithState = useCallback((path: string) => {
    setNavigationState(prev => ({
      ...prev,
      isNavigating: true
    }))
    
    router.push(path)
  }, [router])

  // Check if a path is likely to be cached
  const isPathLikelyCached = useCallback((path: string): boolean => {
    const pageKey = getPageKeyFromPath(path)
    return pageKey ? isPageCached(pageKey) : false
  }, [getPageKeyFromPath, isPageCached])

  // Get navigation recommendations
  const getNavigationRecommendations = useCallback(() => {
    const metrics = getNavigationMetrics()
    const recommendations: string[] = []
    
    if (metrics.cacheHitRate < 50) {
      recommendations.push('Consider increasing cache duration for frequently visited pages')
    }
    
    if (metrics.averageNavigationTime > 1000) {
      recommendations.push('Navigation times are high - consider prefetching popular pages')
    }
    
    if (getCacheSize() < 5) {
      recommendations.push('Cache size is low - consider increasing maxCacheSize')
    }
    
    return recommendations
  }, [getNavigationMetrics, getCacheSize])

  // Prefetch a page
  const prefetchPage = useCallback((path: string) => {
    // Use Next.js router prefetch
    router.prefetch(path)
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[NavigationState] Prefetching ${path}`)
    }
  }, [router])

  // Clear navigation history
  const clearNavigationHistory = useCallback(() => {
    navigationHistoryRef.current = []
    navigationTimesRef.current = []
    cacheHitsRef.current = 0
    totalNavigationsRef.current = 0
    
    setNavigationState(prev => ({
      ...prev,
      navigationCount: 0
    }))
  }, [])

  return {
    // Current state
    navigationState,
    
    // Metrics and insights
    getNavigationMetrics,
    getNavigationRecommendations,
    
    // Navigation utilities
    navigateWithState,
    isPathLikelyCached,
    prefetchPage,
    
    // History management
    navigationHistory: navigationHistoryRef.current,
    clearNavigationHistory,
    
    // Convenience getters
    isNavigating: navigationState.isNavigating,
    currentPath: navigationState.currentPath,
    previousPath: navigationState.previousPath,
    navigationCount: navigationState.navigationCount
  }
}

// Hook for navigation performance monitoring
export function useNavigationPerformance() {
  const { getNavigationMetrics, getNavigationRecommendations } = useNavigationState()
  
  const logPerformanceReport = useCallback(() => {
    const metrics = getNavigationMetrics()
    const recommendations = getNavigationRecommendations()
    
    console.group('📊 Navigation Performance Report')
    console.log('Total Navigations:', metrics.totalNavigations)
            // Cache Hit Rate logged
    console.log('Average Navigation Time:', `${metrics.averageNavigationTime.toFixed(0)}ms`)
    console.log('Frequent Paths:', metrics.frequentPaths)
    
    if (recommendations.length > 0) {
      console.group('💡 Recommendations')
      recommendations.forEach(rec => console.log(`• ${rec}`))
      console.groupEnd()
    }
    
    console.groupEnd()
  }, [getNavigationMetrics, getNavigationRecommendations])
  
  return {
    logPerformanceReport,
    getNavigationMetrics,
    getNavigationRecommendations
  }
}
