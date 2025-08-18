'use client'

import React, { useState } from 'react'
import { runLinkingTests, LinkingTestSuite, LinkingTestResult } from '@/lib/linkingTests'

interface LinkingTestRunnerProps {
  className?: string
}

export function LinkingTestRunner({ className = '' }: LinkingTestRunnerProps) {
  const [testResults, setTestResults] = useState<LinkingTestSuite | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedTest, setSelectedTest] = useState<LinkingTestResult | null>(null)

  const handleRunTests = async () => {
    setIsRunning(true)
    try {
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100))
      const results = runLinkingTests()
      setTestResults(results)
    } catch (error) {
      console.error('Failed to run tests:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusColor = (passed: boolean) => {
    return passed ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
  }

  const getStatusIcon = (passed: boolean) => {
    return passed ? '✓' : '✗'
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Internal Linking System Tests
        </h3>
        <button
          onClick={handleRunTests}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? 'Running Tests...' : 'Run Tests'}
        </button>
      </div>

      {isRunning && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Running comprehensive linking tests...</p>
        </div>
      )}

      {testResults && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {testResults.summary.totalTests}
              </div>
              <div className="text-sm text-gray-600">Total Tests</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {testResults.summary.passed}
              </div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {testResults.summary.failed}
              </div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(testResults.summary.averageExecutionTime * 100) / 100}ms
              </div>
              <div className="text-sm text-gray-600">Avg Time</div>
            </div>
          </div>

          {/* Overall Status */}
          <div className={`p-4 rounded-lg ${
            testResults.summary.failed === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-center">
              <span className={`text-2xl mr-3 ${
                testResults.summary.failed === 0 ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {testResults.summary.failed === 0 ? '✓' : '⚠'}
              </span>
              <div>
                <h4 className={`font-medium ${
                  testResults.summary.failed === 0 ? 'text-green-900' : 'text-yellow-900'
                }`}>
                  {testResults.summary.failed === 0 ? 'All Tests Passed!' : 'Some Tests Failed'}
                </h4>
                <p className={`text-sm ${
                  testResults.summary.failed === 0 ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {testResults.summary.failed === 0 
                    ? 'Your internal linking system is working correctly.'
                    : `${testResults.summary.failed} test(s) failed. Check the details below.`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Test Results</h4>
            <div className="space-y-2">
              {testResults.results.map((result, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedTest?.testName === result.testName ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedTest(selectedTest?.testName === result.testName ? null : result)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${getStatusColor(result.passed)}`}>
                        {getStatusIcon(result.passed)}
                      </span>
                      <span className="font-medium text-gray-900">{result.testName}</span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{result.performance.linksCreated} links</span>
                      <span>{Math.round(result.performance.executionTime * 100) / 100}ms</span>
                      <span className="text-gray-400">
                        {selectedTest?.testName === result.testName ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>
                  
                  {selectedTest?.testName === result.testName && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Details</h5>
                          <p className="text-sm text-gray-600">{result.details}</p>
                          
                          {result.errors && result.errors.length > 0 && (
                            <div className="mt-3">
                              <h6 className="font-medium text-red-900 mb-1">Errors</h6>
                              <ul className="text-sm text-red-600 space-y-1">
                                {result.errors.map((error, errorIndex) => (
                                  <li key={errorIndex}>• {error}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Performance</h5>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Execution Time: {Math.round(result.performance.executionTime * 100) / 100}ms</div>
                            <div>Links Created: {result.performance.linksCreated}</div>
                            <div>Text Length: {result.performance.textLength} chars</div>
                            {result.performance.textLength > 0 && (
                              <div>
                                Performance: {Math.round((result.performance.textLength / result.performance.executionTime) * 100) / 100} chars/ms
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Performance Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Links Created:</span>
                <span className="ml-2 font-medium">{testResults.summary.totalLinksCreated}</span>
              </div>
              <div>
                <span className="text-gray-600">Average Execution Time:</span>
                <span className="ml-2 font-medium">{Math.round(testResults.summary.averageExecutionTime * 100) / 100}ms</span>
              </div>
              <div>
                <span className="text-gray-600">Success Rate:</span>
                <span className="ml-2 font-medium">
                  {Math.round((testResults.summary.passed / testResults.summary.totalTests) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3">Optimization Recommendations</h4>
            <ul className="text-sm text-blue-800 space-y-2">
              {testResults.summary.averageExecutionTime > 50 && (
                <li>• Consider optimizing regex patterns for better performance</li>
              )}
              {testResults.summary.totalLinksCreated / testResults.summary.totalTests < 2 && (
                <li>• Review keyword configuration to increase linking opportunities</li>
              )}
              {testResults.summary.failed > 0 && (
                <li>• Address failing tests to ensure system reliability</li>
              )}
              {testResults.summary.failed === 0 && testResults.summary.averageExecutionTime < 20 && (
                <li>• ✓ System is performing optimally!</li>
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
            Ready to Test
          </h3>
          <p className="text-gray-600 mb-4">
            Run comprehensive tests to verify your internal linking system is working correctly.
          </p>
          <div className="text-sm text-gray-500">
            <p>Tests include:</p>
            <ul className="mt-2 space-y-1">
              <li>• Philosopher name linking</li>
              <li>• Stoic concept detection</li>
              <li>• Context-aware linking</li>
              <li>• Override system functionality</li>
              <li>• Performance benchmarks</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
