'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuotes } from '@/hooks/useQuotes'
import { useAuthContext } from '@/components/auth/AuthProvider'

export function NavigationQuoteTest(): JSX.Element {
  const router = useRouter()
  const { user } = useAuthContext()
  const { quotes, loading, error, getDailyQuote, forceRefresh } = useQuotes(user)
  const [testLog, setTestLog] = useState<string[]>([])
  const [isRunningTest, setIsRunningTest] = useState(false)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setTestLog(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(`[NavigationTest] ${message}`)
  }

  const dailyQuote = getDailyQuote()

  useEffect(() => {
    addLog(`Quote state changed: ${quotes.length} quotes, loading: ${loading}, error: ${error}`)
  }, [quotes.length, loading, error])

  const runNavigationTest = async () => {
    setIsRunningTest(true)
    setTestLog([])

    try {
      addLog('Starting navigation test...')
      addLog(`Initial state: ${quotes.length} quotes loaded`)
      addLog('Check browser console for detailed navigation logs')

      // Navigate to quotes page
      addLog('Navigating to /quotes...')
      router.push('/quotes')

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 3000))
      addLog('Waited 3 seconds on quotes page')

      // Navigate back to home
      addLog('Navigating back to home...')
      router.push('/')

      // Wait and check if quotes refresh
      await new Promise(resolve => setTimeout(resolve, 4000))
      addLog(`After navigation: ${quotes.length} quotes loaded`)
      addLog('Test completed - check console for navigation callbacks')

    } catch (error) {
      addLog(`Test error: ${error}`)
    } finally {
      setIsRunningTest(false)
    }
  }

  const clearLogs = () => {
    setTestLog([])
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Navigation Quote Loading Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Current State</h3>
              <p>Quotes loaded: {quotes.length}</p>
              <p>Loading: {loading ? 'Yes' : 'No'}</p>
              <p>Error: {error || 'None'}</p>
              <p>Daily quote: {dailyQuote ? dailyQuote.author : 'None'}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Test Controls</h3>
              <div className="space-y-2">
                <Button 
                  onClick={runNavigationTest} 
                  disabled={isRunningTest}
                  className="w-full"
                >
                  {isRunningTest ? 'Running Test...' : 'Run Navigation Test'}
                </Button>
                <Button 
                  onClick={forceRefresh} 
                  variant="outline"
                  className="w-full"
                >
                  Force Refresh Quotes
                </Button>
                <Button
                  onClick={clearLogs}
                  variant="outline"
                  className="w-full"
                >
                  Clear Logs
                </Button>
                <Button
                  onClick={() => router.push('/quotes')}
                  variant="outline"
                  className="w-full"
                >
                  Go to Quotes Page
                </Button>
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="w-full"
                >
                  Go to Home Page
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
            {testLog.length === 0 ? (
              <p className="text-gray-500">No logs yet. Run a test to see results.</p>
            ) : (
              <div className="space-y-1">
                {testLog.map((log, index) => (
                  <div key={index} className="text-sm font-mono">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Test Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>Load the home page and verify quotes are displayed</li>
            <li>Navigate to another page (e.g., /quotes, /journal)</li>
            <li>Wait a few seconds on the other page</li>
            <li>Navigate back to the home page</li>
            <li>Verify that quotes still load properly (should refresh automatically)</li>
            <li>Check browser console for debug logs from useQuotes and TabVisibility</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
