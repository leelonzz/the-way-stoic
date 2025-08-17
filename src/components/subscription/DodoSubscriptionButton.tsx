'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useDodo } from '@/components/providers/DodoProvider'
import { useToast } from '@/hooks/use-toast'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { getEffectiveSubscriptionPlan } from '@/utils/subscription'
import { Loader2, Zap, AlertTriangle } from 'lucide-react'

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

    // Check if user is on trial - prevent trial users from subscribing
    if (profile) {
      const effectivePlan = getEffectiveSubscriptionPlan(profile)
      
      if (effectivePlan === 'philosopher' && profile.subscription_status !== 'active') {
        toast({
          title: 'Trial Active',
          description: 'You cannot subscribe while on trial. Please wait for your trial to expire or contact support.',
          variant: 'destructive',
        })
        return
      }

      // Check if user already has an active paid subscription
      if (profile.subscription_status === 'active' && profile.subscription_plan === 'philosopher') {
        toast({
          title: 'Already Subscribed',
          description: 'You already have an active subscription. Please manage it in your settings.',
          variant: 'default',
        })
        return
      }
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

  // Check if user is on trial or already subscribed
  const isOnTrial = profile && getEffectiveSubscriptionPlan(profile) === 'philosopher' && profile.subscription_status !== 'active'
  const hasActiveSubscription = profile?.subscription_status === 'active' && profile?.subscription_plan === 'philosopher'
  const isButtonDisabled = dodoLoading || isLoading || !user || isOnTrial || hasActiveSubscription

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSubscribe}
        disabled={isButtonDisabled}
        className={`w-full ${
          isOnTrial 
            ? 'bg-yellow-600 hover:bg-yellow-700 text-white cursor-not-allowed'
            : hasActiveSubscription
            ? 'bg-green-600 hover:bg-green-700 text-white cursor-not-allowed'
            : 'bg-cta hover:bg-cta/90 text-white'
        } ${className || ''}`}
        size="lg"
      >
        {(isLoading || dodoLoading) ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : isOnTrial ? (
          <>
            <AlertTriangle className="mr-2 h-4 w-4" />
            Trial Active
          </>
        ) : hasActiveSubscription ? (
          <>
            <Zap className="mr-2 h-4 w-4" />
            Already Subscribed
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
      
      {isOnTrial && (
        <p className="text-xs text-yellow-700 text-center">
          You cannot subscribe while on trial. Wait for trial to expire or contact support.
        </p>
      )}
      
      {hasActiveSubscription && (
        <p className="text-xs text-green-700 text-center">
          You already have an active subscription. Manage it in your settings.
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