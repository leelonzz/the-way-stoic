'use client'

import React, { useState, useEffect } from 'react'
import { useNavigationPerformance } from '@/hooks/useNavigationState'
import { usePageCache } from '@/components/providers/PageCacheProvider'

interface NavigationDebuggerProps {
  enabled?: boolean
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

/**
 * Development tool for monitoring navigation performance
 * Shows cache hit rates, navigation times, and recommendations
 */
export function NavigationDebugger({ 
  enabled = process.env.NODE_ENV === 'development',
  position = 'bottom-right'
}: NavigationDebuggerProps): JSX.Element | null {
  const { getNavigationMetrics, getNavigationRecommendations, logPerformanceReport } = useNavigationPerformance()
  const { getCacheSize } = usePageCache()
  const [isExpanded, setIsExpanded] = useState(false)
  const [metrics, setMetrics] = useState(getNavigationMetrics())

  // Update metrics every 2 seconds
  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(() => {
      setMetrics(getNavigationMetrics())
    }, 2000)

    return () => clearInterval(interval)
  }, [enabled, getNavigationMetrics])

  if (!enabled) return null

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  }

  const recommendations = getNavigationRecommendations()

  return (
    <div className={`fixed ${positionClasses[position]} z-50 font-mono text-xs`}>
      {/* Collapsed View */}
      {!isExpanded && (
        <div 
          onClick={() => setIsExpanded(true)}
          className="bg-black/80 text-green-400 px-3 py-2 rounded-lg cursor-pointer hover:bg-black/90 transition-colors border border-green-400/30"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Nav: {metrics.totalNavigations}</span>
            <span>Cache: {metrics.cacheHitRate.toFixed(0)}%</span>
            <span>Avg: {metrics.averageNavigationTime.toFixed(0)}ms</span>
          </div>
        </div>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="bg-black/90 text-green-400 p-4 rounded-lg border border-green-400/30 min-w-80 max-w-96">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-green-300 font-bold">Navigation Debug</h3>
            <button 
              onClick={() => setIsExpanded(false)}
              className="text-green-400 hover:text-green-300 text-lg leading-none"
            >
              ×
            </button>
          </div>

          {/* Metrics */}
          <div className="space-y-2 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-green-300">Total Navigations</div>
                <div className="text-white font-bold">{metrics.totalNavigations}</div>
              </div>
              <div>
                <div className="text-green-300">Cache Hit Rate</div>
                <div className={`font-bold ${metrics.cacheHitRate > 70 ? 'text-green-400' : metrics.cacheHitRate > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {metrics.cacheHitRate.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-green-300">Avg Nav Time</div>
                <div className={`font-bold ${metrics.averageNavigationTime < 500 ? 'text-green-400' : metrics.averageNavigationTime < 1000 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {metrics.averageNavigationTime.toFixed(0)}ms
                </div>
              </div>
              <div>
                <div className="text-green-300">Cache Size</div>
                <div className="text-white font-bold">{getCacheSize()}</div>
              </div>
            </div>
          </div>

          {/* Frequent Paths */}
          {metrics.frequentPaths.length > 0 && (
            <div className="mb-4">
              <div className="text-green-300 mb-2">Frequent Paths</div>
              <div className="space-y-1">
                {metrics.frequentPaths.slice(0, 3).map((path, index) => (
                  <div key={path} className="text-xs text-gray-300">
                    {index + 1}. {path}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="mb-4">
              <div className="text-yellow-400 mb-2">⚠️ Recommendations</div>
              <div className="space-y-1">
                {recommendations.slice(0, 2).map((rec, index) => (
                  <div key={index} className="text-xs text-yellow-300">
                    • {rec}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button 
              onClick={logPerformanceReport}
              className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs hover:bg-green-600/30 transition-colors"
            >
              Log Report
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs hover:bg-blue-600/30 transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Performance indicator component for individual pages
export function PagePerformanceIndicator({ pageKey }: { pageKey: string }): JSX.Element | null {
  const { getCachedPage } = usePageCache()
  const [loadTime, setLoadTime] = useState<number | null>(null)

  useEffect(() => {
    const startTime = performance.now()
    
    // Measure time until page is fully loaded
    const measureLoadTime = () => {
      const endTime = performance.now()
      setLoadTime(endTime - startTime)
    }

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(measureLoadTime)
  }, [])

  if (process.env.NODE_ENV !== 'development') return null

  const cached = getCachedPage(pageKey)
  const isCached = !!cached
  const cacheAge = cached ? Date.now() - cached.timestamp : 0

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-black/80 text-white px-3 py-1 rounded-full text-xs font-mono flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isCached ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
        <span>{pageKey}</span>
        {loadTime && <span>{loadTime.toFixed(0)}ms</span>}
        {isCached && <span className="text-green-400">cached ({(cacheAge / 1000).toFixed(0)}s)</span>}
      </div>
    </div>
  )
}
