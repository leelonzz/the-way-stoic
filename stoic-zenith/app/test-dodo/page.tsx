'use client'

import React, { useState } from 'react'
import { DodoSubscriptionButton } from '@/components/DodoSubscriptionButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle } from 'lucide-react'

export default function TestDodoPage() {
  const [testResult, setTestResult] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  // Test customer data
  const customerData = {
    email: 'test@example.com',
    name: 'Test User',
    phone: '+1234567890',
    billingAddress: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipcode: '94105',
      country: 'US'
    }
  }

  const handleSubscriptionSuccess = (data: { subscriptionId: string; checkoutUrl: string }) => {
    setTestResult(`Success! Subscription ID: ${data.subscriptionId}`)
    setIsSuccess(true)
    console.log('Subscription created successfully:', data)
  }

  const handleSubscriptionError = (error: string) => {
    setTestResult(`Error: ${error}`)
    setIsSuccess(false)
    console.error('Subscription error:', error)
  }

  const testApiDirectly = async () => {
    try {
      const response = await fetch('/api/dodo/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: 'pdt_1xvwazO5L41SzZeMegxyk',
          userId: 'test_user_123',
          customerData,
          returnUrl: `${window.location.origin}/subscription/success`,
          cancelUrl: `${window.location.origin}/subscription/cancel`,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setTestResult(`API Test Success! Subscription ID: ${data.subscriptionId}`)
      setIsSuccess(true)
      console.log('API test successful:', data)
    } catch (error) {
      setTestResult(`API Test Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsSuccess(false)
      console.error('API test error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-parchment p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-ink">
              🎉 Dodo Payments Integration Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Setup Complete!</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• API Key configured: oxKiND9nnyQCKyU3.pg48JLHmF9Ho3aWQyNZ3wJaiqIlNDtWAbMebXV3oBClbqikJ</li>
                <li>• Product ID: pdt_1xvwazO5L41SzZeMegxyk</li>
                <li>• DodoProvider integrated in ClientProviders</li>
                <li>• API routes created and configured</li>
                <li>• ProfileModal updated to use DodoSubscriptionButton</li>
              </ul>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Test 1: Component Integration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-stone">
                    Test the DodoSubscriptionButton component with your actual product.
                  </p>
                  
                  <DodoSubscriptionButton
                    productId="pdt_1xvwazO5L41SzZeMegxyk"
                    userId="test_user_123"
                    customerData={customerData}
                    onSuccess={handleSubscriptionSuccess}
                    onError={handleSubscriptionError}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Test Subscription Button
                  </DodoSubscriptionButton>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Test 2: API Direct Call</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-stone">
                    Test the API route directly without the component.
                  </p>
                  
                  <Button
                    onClick={testApiDirectly}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    Test API Directly
                  </Button>
                </CardContent>
              </Card>
            </div>

            {testResult && (
              <Card className={`border-2 ${isSuccess ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    {isSuccess ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div>
                      <h4 className={`font-semibold ${isSuccess ? 'text-green-800' : 'text-red-800'}`}>
                        Test Result
                      </h4>
                      <p className={`text-sm ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
                        {testResult}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Product Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Product Name:</strong> The Stoic Way
                  </div>
                  <div>
                    <strong>Price:</strong> $14/month
                  </div>
                  <div>
                    <strong>Trial Period:</strong> 3 days
                  </div>
                  <div>
                    <strong>Product ID:</strong> pdt_1xvwazO5L41SzZeMegxyk
                  </div>
                  <div>
                    <strong>Environment:</strong> Test
                  </div>
                  <div>
                    <strong>Currency:</strong> USD
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-sm text-stone">
                  <li>Test the subscription button above to verify the integration works</li>
                  <li>Check the browser console for detailed logs</li>
                  <li>Visit the ProfileModal to see the updated subscription button</li>
                  <li>Configure webhook endpoints in your Dodo Payments dashboard</li>
                  <li>Update to production API keys when ready to go live</li>
                </ol>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
