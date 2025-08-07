'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useNavigationMonitor } from '@/hooks/useNavigationMonitor'
import { usePageCache } from '@/components/providers/PageCacheProvider'

const testRoutes = [
  { name: 'Home', path: '/' },
  { name: 'Journal', path: '/journal' },
  { name: 'Mentors', path: '/mentors' },
  { name: 'Quotes', path: '/quotes' },
  { name: 'Calendar', path: '/calendar' },
]

interface TestResult {
  route: string
  startTime: number
  endTime: number
  duration: number
  cacheHit: boolean
  success: boolean
  error?: string
}

/**
 * Development tool for testing navigation performance
 * Only shown in development mode
 */
export function NavigationTester(): JSX.Element | null {
  const router = useRouter()
  const { getPerformanceMetrics, clearEvents } = useNavigationMonitor()
  const { getCacheSize, isPageCached } = usePageCache()
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [currentTest, setCurrentTest] = useState<string>('')

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const runNavigationTest = useCallback(async () => {
    setIsRunning(true)
    setTestResults([])
    clearEvents()

    const results: TestResult[] = []

    for (const route of testRoutes) {
      setCurrentTest(`Testing ${route.name}...`)
      
      const startTime = performance.now()
      const cacheHit = isPageCached(route.name.toLowerCase())
      
      try {
        // Navigate to route
        router.push(route.path)
        
        // Wait for navigation to complete
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const endTime = performance.now()
        const duration = endTime - startTime

        results.push({
          route: route.name,
          startTime,
          endTime,
          duration,
          cacheHit,
          success: true
        })
      } catch (error) {
        const endTime = performance.now()
        results.push({
          route: route.name,
          startTime,
          endTime,
          duration: endTime - startTime,
          cacheHit,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    setTestResults(results)
    setCurrentTest('')
    setIsRunning(false)
  }, [router, isPageCached, clearEvents])

  const metrics = getPerformanceMetrics()

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-center">Navigation Performance Tester</CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          Development tool to test navigation performance and cache behavior
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Metrics */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.totalNavigations}</div>
              <div className="text-sm text-muted-foreground">Total Nav</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {metrics.cacheHitRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Cache Hit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {metrics.averageDuration.toFixed(0)}ms
              </div>
              <div className="text-sm text-muted-foreground">Avg Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{getCacheSize()}</div>
              <div className="text-sm text-muted-foreground">Cache Size</div>
            </div>
          </div>
        )}

        {/* Test Controls */}
        <div className="flex gap-2 justify-center">
          <Button 
            onClick={runNavigationTest} 
            disabled={isRunning}
            className="min-w-32"
          >
            {isRunning ? 'Testing...' : 'Run Navigation Test'}
          </Button>
          <Button 
            variant="outline" 
            onClick={clearEvents}
            disabled={isRunning}
          >
            Clear Results
          </Button>
        </div>

        {/* Current Test Status */}
        {currentTest && (
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-700">{currentTest}</div>
          </div>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Test Results</h3>
            {testResults.map((result, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${
                  result.success 
                    ? result.duration < 500 
                      ? 'bg-green-50 border-green-200' 
                      : result.duration < 1000
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-orange-50 border-orange-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="font-medium">{result.route}</div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      result.cacheHit 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {result.cacheHit ? 'Cached' : 'Fresh'}
                    </span>
                    <span className="font-mono">
                      {result.duration.toFixed(0)}ms
                    </span>
                  </div>
                </div>
                {result.error && (
                  <div className="text-sm text-red-600 mt-1">
                    Error: {result.error}
                  </div>
                )}
              </div>
            ))}
            
            {/* Summary */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium mb-2">Summary</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  Average Duration: {(testResults.reduce((sum, r) => sum + r.duration, 0) / testResults.length).toFixed(0)}ms
                </div>
                <div>
                  Cache Hit Rate: {((testResults.filter(r => r.cacheHit).length / testResults.length) * 100).toFixed(1)}%
                </div>
                <div>
                  Success Rate: {((testResults.filter(r => r.success).length / testResults.length) * 100).toFixed(1)}%
                </div>
                <div>
                  Fast Navigation: {((testResults.filter(r => r.duration < 500).length / testResults.length) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
