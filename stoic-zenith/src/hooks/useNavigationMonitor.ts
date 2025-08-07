'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { usePageCache } from '@/components/providers/PageCacheProvider'

interface NavigationEvent {
  from: string
  to: string
  timestamp: number
  duration: number
  cacheHit: boolean
}

/**
 * Production-ready navigation monitoring hook
 * Tracks navigation performance and cache effectiveness
 */
export function useNavigationMonitor() {
  const pathname = usePathname()
  const { isPageCached } = usePageCache()
  const lastPathnameRef = useRef<string>(pathname)
  const navigationStartRef = useRef<number>(Date.now())
  const eventsRef = useRef<NavigationEvent[]>([])

  useEffect(() => {
    if (pathname !== lastPathnameRef.current) {
      const now = Date.now()
      const duration = now - navigationStartRef.current
      const from = lastPathnameRef.current
      const to = pathname
      
      // Get page key from pathname for cache check
      const getPageKeyFromPath = (path: string): string | null => {
        if (path === '/') return 'home'
        if (path.startsWith('/quotes')) return 'quotes'
        if (path.startsWith('/mentors')) return 'mentors'
        if (path.startsWith('/journal')) return 'journal'
        if (path.startsWith('/calendar')) return 'calendar'
        return null
      }

      const pageKey = getPageKeyFromPath(to)
      const cacheHit = pageKey ? isPageCached(pageKey) : false

      const event: NavigationEvent = {
        from,
        to,
        timestamp: now,
        duration,
        cacheHit
      }

      // Store event
      eventsRef.current.push(event)
      
      // Keep only last 100 events to prevent memory leaks
      if (eventsRef.current.length > 100) {
        eventsRef.current = eventsRef.current.slice(-100)
      }

      // Log performance issues in development
      if (process.env.NODE_ENV === 'development') {
        if (duration > 1000) {
          console.warn(`🐌 Slow navigation detected: ${from} → ${to} (${duration}ms)`)
        }
        
        if (!cacheHit && pageKey) {
          console.info(`📄 Cache miss: ${to} (${pageKey})`)
        }
      }

      // Update refs
      lastPathnameRef.current = pathname
      navigationStartRef.current = now
    }
  }, [pathname, isPageCached])

  // Analytics functions
  const getPerformanceMetrics = () => {
    const events = eventsRef.current
    if (events.length === 0) return null

    const totalNavigations = events.length
    const cacheHits = events.filter(e => e.cacheHit).length
    const cacheHitRate = (cacheHits / totalNavigations) * 100
    const averageDuration = events.reduce((sum, e) => sum + e.duration, 0) / totalNavigations
    const slowNavigations = events.filter(e => e.duration > 1000).length

    return {
      totalNavigations,
      cacheHitRate,
      averageDuration,
      slowNavigations,
      slowNavigationRate: (slowNavigations / totalNavigations) * 100
    }
  }

  const getRecentEvents = (count = 10) => {
    return eventsRef.current.slice(-count)
  }

  const clearEvents = () => {
    eventsRef.current = []
  }

  // Send analytics to external service (placeholder)
  const sendAnalytics = () => {
    const metrics = getPerformanceMetrics()
    if (!metrics || process.env.NODE_ENV !== 'production') return

    // Example: Send to analytics service
    // analytics.track('navigation_performance', metrics)
    console.log('Navigation metrics:', metrics)
  }

  return {
    getPerformanceMetrics,
    getRecentEvents,
    clearEvents,
    sendAnalytics
  }
}

/**
 * Hook for monitoring specific navigation patterns
 */
export function useNavigationPatterns() {
  const { getRecentEvents } = useNavigationMonitor()

  const getCommonPaths = () => {
    const events = getRecentEvents(50)
    const pathCounts = events.reduce((acc, event) => {
      acc[event.to] = (acc[event.to] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(pathCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([path, count]) => ({ path, count }))
  }

  const getNavigationFlow = () => {
    const events = getRecentEvents(20)
    return events.map(event => ({
      from: event.from,
      to: event.to,
      duration: event.duration,
      cacheHit: event.cacheHit
    }))
  }

  return {
    getCommonPaths,
    getNavigationFlow
  }
}
