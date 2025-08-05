'use client'

import React from 'react'
import { DodoSubscriptionButton } from '@/components/DodoSubscriptionButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Example of how to migrate from PayPal to Dodo Payments
export function DodoMigrationExample() {
  // Your existing product ID from Dodo Payments
  const PRODUCT_ID = 'pdt_1xvwazO5L41SzZeMegxyk'
  
  // Example customer data (in real app, get from user profile/form)
  const customerData = {
    email: 'user@example.com',
    name: 'John Doe',
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
    console.log('Subscription created successfully:', data)
    // Handle success - maybe redirect or show success message
  }

  const handleSubscriptionError = (error: string) => {
    console.error('Subscription error:', error)
    // Handle error - show error message to user
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dodo Payments Migration Example</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">The Stoic Way - Philosopher Plan</h3>
            <p className="text-gray-600">$14/month subscription with 3-day trial</p>
          </div>

          {/* OLD PayPal way (commented out) */}
          {/*
          <SubscriptionButton
            planType="philosopher"
            planName="Philosopher Plan"
            planPrice="$14/month"
            onSuccess={(subscriptionId) => console.log('PayPal success:', subscriptionId)}
            onError={(error) => console.error('PayPal error:', error)}
          />
          */}

          {/* NEW Dodo Payments way */}
          <DodoSubscriptionButton
            productId={PRODUCT_ID}
            userId="user_123" // Replace with actual user ID
            customerData={customerData}
            onSuccess={handleSubscriptionSuccess}
            onError={handleSubscriptionError}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Subscribe with Dodo Payments
          </DodoSubscriptionButton>

          <div className="text-sm text-gray-500 space-y-2">
            <p><strong>Migration Benefits:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Global payment processing (100+ countries)</li>
              <li>Multi-currency support with automatic conversion</li>
              <li>Built-in tax compliance and handling</li>
              <li>Digital product delivery and license management</li>
              <li>Comprehensive analytics and reporting</li>
              <li>Developer-friendly API and webhooks</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integration Steps Completed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>✅ Environment variables updated</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>✅ DodoProvider created</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>✅ API routes updated</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>✅ Subscription button components created</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>✅ Success page updated</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span>⚠️ Webhook handling (needs configuration)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Add your Dodo Payments API credentials to environment variables</li>
            <li>Replace PayPalProvider with DodoProvider in your app layout</li>
            <li>Update existing subscription buttons to use DodoSubscriptionButton</li>
            <li>Configure webhook endpoints for payment notifications</li>
            <li>Test the complete subscription flow</li>
            <li>Update your database schema if needed</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}

// Example of how to wrap your app with DodoProvider instead of PayPalProvider
export function AppLayoutExample({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* OLD PayPal way (commented out) */}
      {/*
      <PayPalProvider>
        {children}
      </PayPalProvider>
      */}

      {/* NEW Dodo Payments way */}
      {/*
      <DodoProvider>
        {children}
      </DodoProvider>
      */}
      {children}
    </>
  )
}
