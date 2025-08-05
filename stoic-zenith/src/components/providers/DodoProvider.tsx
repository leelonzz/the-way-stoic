'use client'

import React, { createContext, useContext, useCallback, useState } from 'react'

interface DodoContextType {
  createSubscription: (productId: string, userId: string, customerData: CustomerData) => Promise<{ subscriptionId: string; checkoutUrl: string }>
  createPayment: (productId: string, userId: string, customerData: CustomerData) => Promise<{ paymentId: string; checkoutUrl: string }>
  isLoading: boolean
  error: string | null
}

interface CustomerData {
  email: string
  name: string
  phone?: string
  billingAddress: {
    street: string
    city: string
    state: string
    zipcode: string
    country: string
  }
}

const DodoContext = createContext<DodoContextType | undefined>(undefined)

export function DodoProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createSubscription = useCallback(async (
    productId: string,
    userId: string,
    customerData: CustomerData
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/dodo/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          userId,
          customerData,
          returnUrl: `${window.location.origin}/subscription/success`,
          cancelUrl: `${window.location.origin}/subscription/cancel`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create subscription')
      }

      const data = await response.json()

      if (!data.checkoutUrl) {
        throw new Error('No checkout URL received from Dodo Payments')
      }

      return {
        subscriptionId: data.subscriptionId,
        checkoutUrl: data.checkoutUrl,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createPayment = useCallback(async (
    productId: string,
    userId: string,
    customerData: CustomerData
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/dodo/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          userId,
          customerData,
          returnUrl: `${window.location.origin}/payment/success`,
          cancelUrl: `${window.location.origin}/payment/cancel`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create payment')
      }

      const data = await response.json()

      if (!data.checkoutUrl) {
        throw new Error('No checkout URL received from Dodo Payments')
      }

      return {
        paymentId: data.paymentId,
        checkoutUrl: data.checkoutUrl,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const contextValue: DodoContextType = {
    createSubscription,
    createPayment,
    isLoading,
    error,
  }

  return (
    <DodoContext.Provider value={contextValue}>
      {children}
    </DodoContext.Provider>
  )
}

export function useDodo() {
  const context = useContext(DodoContext)
  if (context === undefined) {
    throw new Error('useDodo must be used within a DodoProvider')
  }
  return context
}