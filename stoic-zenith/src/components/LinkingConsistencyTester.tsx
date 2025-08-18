'use client'

import React, { useState } from 'react'
import { runAllConsistencyTests, quickConsistencyCheck } from '@/lib/linkingConsistencyTest'

interface ConsistencyTestResults {
  overallPassed: boolean
  summary: string
  tests: {
    linkingConsistency: any
    componentConsistency: any
    pageIdConsistency: any
  }
}

export function LinkingConsistencyTester() {
  const [testResults, setTestResults] = useState<ConsistencyTestResults | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [quickTestResult, setQuickTestResult] = useState<boolean | null>(null)

  const handleRunTests = async () => {
    setIsRunning(true)
    try {
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100))
      const results = runAllConsistencyTests()
      setTestResults(results)
    } catch (error) {
      console.error('Failed to run consistency tests:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const handleQuickTest = () => {
    const result = quickConsistencyCheck()
    setQuickTestResult(result)
  }

  const getStatusColor = (passed: boolean) => {
    return passed ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'
  }

  const getStatusIcon = (passed: boolean) => {
    return passed ? '✓' : '✗'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Internal Linking Consistency Tests
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={handleQuickTest}
            className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
          >
            Quick Test
          </button>
          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? 'Running...' : 'Run Full Tests'}
          </button>
        </div>
      </div>

      {/* Quick Test Result */}
      {quickTestResult !== null && (
        <div className={`mb-4 p-3 rounded-lg border ${getStatusColor(quickTestResult)}`}>
          <div className="flex items-center">
            <span className="text-lg mr-2">{getStatusIcon(quickTestResult)}</span>
            <span className="font-medium">
              Quick Test: {quickTestResult ? 'PASSED' : 'FAILED'}
            </span>
          </div>
          <p className="text-sm mt-1">
            {quickTestResult 
              ? 'Basic linking consistency is working correctly.'
              : 'Inconsistent linking behavior detected. Run full tests for details.'
            }
          </p>
        </div>
      )}

      {isRunning && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Running consistency tests...</p>
        </div>
      )}

      {testResults && (
        <div className="space-y-6">
          {/* Overall Status */}
          <div className={`p-4 rounded-lg border ${getStatusColor(testResults.overallPassed)}`}>
            <div className="flex items-center">
              <span className="text-2xl mr-3">{getStatusIcon(testResults.overallPassed)}</span>
              <div>
                <h4 className="font-medium">
                  Overall Result: {testResults.overallPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}
                </h4>
                <p className="text-sm mt-1">{testResults.summary}</p>
              </div>
            </div>
          </div>

          {/* Individual Test Results */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Detailed Results</h4>
            
            {/* Linking Consistency Test */}
            <div className={`border rounded-lg p-4 ${getStatusColor(testResults.tests.linkingConsistency.passed)}`}>
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium">Basic Linking Consistency</h5>
                <span className="text-lg">{getStatusIcon(testResults.tests.linkingConsistency.passed)}</span>
              </div>
              <p className="text-sm mb-3">{testResults.tests.linkingConsistency.details}</p>
              
              {testResults.tests.linkingConsistency.results && (
                <div className="text-xs space-y-1">
                  <div className="font-medium">Attempt Results:</div>
                  {testResults.tests.linkingConsistency.results.map((result: any, index: number) => (
                    <div key={index} className="flex justify-between">
                      <span>Attempt {result.attempt}:</span>
                      <span>{result.linksCreated} links ({result.keywordsLinked.join(', ')})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Component Consistency Test */}
            <div className={`border rounded-lg p-4 ${getStatusColor(testResults.tests.componentConsistency.passed)}`}>
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium">Component Re-render Consistency</h5>
                <span className="text-lg">{getStatusIcon(testResults.tests.componentConsistency.passed)}</span>
              </div>
              <p className="text-sm mb-3">{testResults.tests.componentConsistency.details}</p>
              
              {testResults.tests.componentConsistency.renderResults && (
                <div className="text-xs space-y-1">
                  <div className="font-medium">Render Results:</div>
                  {testResults.tests.componentConsistency.renderResults.map((result: any, index: number) => (
                    <div key={index} className="flex justify-between">
                      <span>Render {result.render}:</span>
                      <span>
                        {result.linksFound} links 
                        {result.hasMarkusAurelius && ' ✓MA'}
                        {result.hasSeneca && ' ✓S'}
                        {result.hasEpictetus && ' ✓E'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Page ID Consistency Test */}
            <div className={`border rounded-lg p-4 ${getStatusColor(testResults.tests.pageIdConsistency.passed)}`}>
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium">Page ID Consistency</h5>
                <span className="text-lg">{getStatusIcon(testResults.tests.pageIdConsistency.passed)}</span>
              </div>
              <p className="text-sm mb-3">{testResults.tests.pageIdConsistency.details}</p>
              
              {testResults.tests.pageIdConsistency.pageResults && (
                <div className="text-xs space-y-1">
                  <div className="font-medium">Page Results:</div>
                  {Object.entries(testResults.tests.pageIdConsistency.pageResults).map(([pageId, result]: [string, any]) => (
                    <div key={pageId} className="flex justify-between">
                      <span>{pageId}:</span>
                      <span>{result.linksCreated} links ({result.keywordsLinked.join(', ')})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3">Recommendations</h4>
            <ul className="text-sm text-blue-800 space-y-2">
              {testResults.overallPassed ? (
                <>
                  <li>✓ Linking consistency is working correctly</li>
                  <li>✓ No action needed - system is stable</li>
                  <li>✓ Links should appear consistently on page reloads</li>
                </>
              ) : (
                <>
                  <li>⚠ Inconsistent linking behavior detected</li>
                  <li>⚠ Check for React component re-rendering issues</li>
                  <li>⚠ Verify page state management</li>
                  <li>⚠ Consider clearing browser cache and testing again</li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}

      {!testResults && !isRunning && (
        <div className="text-center py-12 text-gray-500">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Test Linking Consistency
          </h3>
          <p className="text-gray-600 mb-4">
            Run tests to verify that internal links appear consistently across page reloads.
          </p>
          <div className="text-sm text-gray-500">
            <p><strong>Quick Test:</strong> Fast check for basic consistency</p>
            <p><strong>Full Tests:</strong> Comprehensive testing including component re-renders and page ID handling</p>
          </div>
        </div>
      )}
    </div>
  )
}
