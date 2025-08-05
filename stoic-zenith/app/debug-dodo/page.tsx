'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function DebugDodoPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const testAPI = async (endpoint: string, method: string = 'GET', body?: any) => {
    setLoading(true)
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      })

      const data = await response.json()
      
      setResults(prev => [...prev, {
        endpoint,
        method,
        status: response.status,
        success: response.ok,
        data,
        timestamp: new Date().toISOString()
      }])
    } catch (error) {
      setResults(prev => [...prev, {
        endpoint,
        method,
        status: 'ERROR',
        success: false,
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date().toISOString()
      }])
    }
    setLoading(false)
  }

  const runTests = async () => {
    setResults([])
    
    // Test 1: List products
    await testAPI('/api/dodo/products')
    
    // Test 2: Get specific product
    await testAPI('/api/dodo/products?product_id=pdt_1xvwazO5L41SzZeMegxyk')
    
    // Test 3: Create customer
    await testAPI('/api/dodo/customers', 'POST', {
      email: 'test@example.com',
      name: 'Test User'
    })
    
    // Test 4: Create payment
    await testAPI('/api/dodo/payments', 'POST', {
      productId: 'pdt_1xvwazO5L41SzZeMegxyk',
      userId: 'test_user_123',
      customerData: {
        email: 'test@example.com',
        name: 'Test User',
        billingAddress: {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zipcode: '94105',
          country: 'US'
        }
      }
    })

    // Test 5: Create subscription
    await testAPI('/api/dodo/subscriptions', 'POST', {
      productId: 'pdt_1xvwazO5L41SzZeMegxyk',
      userId: 'test_user_123',
      customerData: {
        email: 'test@example.com',
        name: 'Test User',
        billingAddress: {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zipcode: '94105',
          country: 'US'
        }
      }
    })
  }

  return (
    <div className="min-h-screen bg-parchment p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-ink">
              🔧 Dodo Payments API Debug
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Environment Info</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>API Key: {process.env.NEXT_PUBLIC_DODO_API_KEY ? 'Configured' : 'Missing'}</div>
                  <div>Environment: {process.env.NEXT_PUBLIC_DODO_ENVIRONMENT || 'Not set'}</div>
                  <div>App URL: {process.env.NEXT_PUBLIC_APP_URL || 'Not set'}</div>
                </div>
              </div>

              <Button 
                onClick={runTests} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Running Tests...' : 'Run API Tests'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div 
                    key={index}
                    className={`border rounded-lg p-4 ${
                      result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold">{result.method}</span> {result.endpoint}
                      </div>
                      <div className={`px-2 py-1 rounded text-sm ${
                        result.success ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                      }`}>
                        {result.status}
                      </div>
                    </div>
                    <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(result.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
