'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useDodo } from '@/components/providers/DodoProvider'
import { useToast } from '@/hooks/use-toast'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { Loader2, Zap } from 'lucide-react'

interface DodoSubscriptionButtonProps {
  productId: string
  productName: string
  buttonText?: string
  className?: string
  onSuccess?: (subscription: any) => void
  onError?: (error: Error) => void
}

export function DodoSubscriptionButton({
  productId,
  productName,
  buttonText = 'Begin Practice',
  className,
  onSuccess,
  onError,
}: DodoSubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { createSubscription, isLoading: dodoLoading } = useDodo()
  const { toast } = useToast()
  const { user, profile } = useAuthContext()

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to upgrade your plan',
        variant: 'destructive',
      })
      return
    }

    if (dodoLoading) {
      toast({
        title: 'Please wait',
        description: 'Dodo Payments is loading...',
        variant: 'default',
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await createSubscription(
        productId,
        user.id,
        {
          email: user.email || '',
          name: profile?.full_name || user.email?.split('@')[0] || 'Customer',
          billingAddress: {
            street: '',
            city: '',
            state: '',
            zipcode: '',
            country: 'US'
          }
        }
      )

      // Redirect to checkout URL
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      }

      onSuccess?.(result)
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
    <div className="space-y-2">
      <Button
        onClick={handleSubscribe}
        disabled={dodoLoading || isLoading || !user}
        className={`w-full bg-cta hover:bg-cta/90 text-white ${className || ''}`}
        size="lg"
      >
        {(isLoading || dodoLoading) ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Zap className="mr-2 h-4 w-4" />
            {buttonText}
          </>
        )}
      </Button>
      
      {!user && (
        <p className="text-xs text-stone text-center">
          Please sign in to subscribe
        </p>
      )}
    </div>
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