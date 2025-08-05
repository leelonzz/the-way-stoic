'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useDodo } from '@/components/providers/DodoProvider'
import { Loader2 } from 'lucide-react'

interface DodoSubscriptionButtonProps {
  productId: string
  userId: string
  customerData: {
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
  onSuccess?: (data: { subscriptionId: string; checkoutUrl: string }) => void
  onError?: (error: string) => void
  className?: string
  children?: React.ReactNode
}

export function DodoSubscriptionButton({
  productId,
  userId,
  customerData,
  onSuccess,
  onError,
  className,
  children = 'Subscribe Now'
}: DodoSubscriptionButtonProps) {
  const { createSubscription, isLoading, error } = useDodo()
  const [localLoading, setLocalLoading] = useState(false)

  const handleSubscribe = async () => {
    setLocalLoading(true)
    
    try {
      const result = await createSubscription(productId, userId, customerData)
      
      if (result.checkoutUrl) {
        // Redirect to Dodo Payments checkout
        window.location.href = result.checkoutUrl
      }
      
      onSuccess?.(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create subscription'
      onError?.(errorMessage)
      console.error('Subscription error:', err)
    } finally {
      setLocalLoading(false)
    }
  }

  const isButtonLoading = isLoading || localLoading

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSubscribe}
        disabled={isButtonLoading}
        className={className}
      >
        {isButtonLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          children
        )}
      </Button>
      
      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

// Alternative component for one-time payments
interface DodoPaymentButtonProps {
  productId: string
  userId: string
  customerData: {
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
  onSuccess?: (data: { paymentId: string; checkoutUrl: string }) => void
  onError?: (error: string) => void
  className?: string
  children?: React.ReactNode
}

export function DodoPaymentButton({
  productId,
  userId,
  customerData,
  onSuccess,
  onError,
  className,
  children = 'Buy Now'
}: DodoPaymentButtonProps) {
  const { createPayment, isLoading, error } = useDodo()
  const [localLoading, setLocalLoading] = useState(false)

  const handlePayment = async () => {
    setLocalLoading(true)
    
    try {
      const result = await createPayment(productId, userId, customerData)
      
      if (result.checkoutUrl) {
        // Redirect to Dodo Payments checkout
        window.location.href = result.checkoutUrl
      }
      
      onSuccess?.(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create payment'
      onError?.(errorMessage)
      console.error('Payment error:', err)
    } finally {
      setLocalLoading(false)
    }
  }

  const isButtonLoading = isLoading || localLoading

  return (
    <div className="space-y-2">
      <Button
        onClick={handlePayment}
        disabled={isButtonLoading}
        className={className}
      >
        {isButtonLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          children
        )}
      </Button>
      
      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
