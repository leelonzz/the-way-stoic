'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useDodo } from '@/components/providers/DodoProvider'
import { useToast } from '@/hooks/use-toast'

interface DodoSubscriptionButtonProps {
  customerId: string
  productId: string
  productName: string
  price: number
  currency: string
  className?: string
  onSuccess?: (subscription: any) => void
  onError?: (error: Error) => void
}

export function DodoSubscriptionButton({
  customerId,
  productId,
  productName,
  price,
  currency,
  className,
  onSuccess,
  onError,
}: DodoSubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { createSubscription, isLoaded } = useDodo()
  const { toast } = useToast()

  const handleSubscribe = async () => {
    if (!isLoaded) {
      toast({
        title: 'Error',
        description: 'Dodo Payments is not loaded yet',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const subscription = await createSubscription({
        customer_id: customerId,
        product_id: productId,
        metadata: {
          product_name: productName,
          price: price,
          currency: currency,
        },
      })

      toast({
        title: 'Success',
        description: `Successfully subscribed to ${productName}`,
      })

      onSuccess?.(subscription)
    } catch (error) {
      console.error('Subscription error:', error)
      
      toast({
        title: 'Error',
        description: 'Failed to create subscription. Please try again.',
        variant: 'destructive',
      })

      onError?.(error as Error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleSubscribe}
      disabled={!isLoaded || isLoading}
      className={className}
    >
      {isLoading ? 'Processing...' : `Subscribe to ${productName}`}
    </Button>
  )
}

export function DodoCancelSubscriptionButton({
  subscriptionId,
  onSuccess,
  onError,
}: {
  subscriptionId: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleCancel = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/dodo/subscriptions/${subscriptionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'canceled',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      toast({
        title: 'Success',
        description: 'Subscription canceled successfully',
      })

      onSuccess?.()
    } catch (error) {
      console.error('Cancel subscription error:', error)
      
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription. Please try again.',
        variant: 'destructive',
      })

      onError?.(error as Error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCancel}
      disabled={isLoading}
      variant="destructive"
    >
      {isLoading ? 'Canceling...' : 'Cancel Subscription'}
    </Button>
  )
} 