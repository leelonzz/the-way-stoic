'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { 
  Calendar, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Loader2,
  Crown,
  User
} from 'lucide-react'
import {
  getUserSubscription,
  cancelSubscription,
  reactivateSubscription,
  getSubscriptionStatusText,
  getSubscriptionStatusColor,
  canCancelSubscription,
  canReactivateSubscription,
  formatSubscriptionDate,
  getDaysUntilExpiry,
  getPlanDisplayName,
  getPlanFeatures,
  type SubscriptionManagementResponse
} from '@/lib/subscription-management'

interface SubscriptionManagementProps {
  userId: string
}

export function SubscriptionManagement({ userId }: SubscriptionManagementProps) {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionManagementResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [syncLoading, setSyncLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const loadSubscriptionData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getUserSubscription(userId)
      setSubscriptionData(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load subscription'
      setError(errorMessage)
      console.error('Error loading subscription:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      loadSubscriptionData()
    }
  }, [userId])

  const handleCancelSubscription = async (immediate: boolean = false) => {
    if (!subscriptionData?.profile.subscription_id) return

    try {
      setActionLoading(true)
      const result = await cancelSubscription(
        subscriptionData.profile.subscription_id,
        !immediate // cancelAtNextBilling is opposite of immediate
      )

      toast({
        title: 'Subscription Updated',
        description: result.message,
        variant: 'default',
      })

      // Reload subscription data
      await loadSubscriptionData()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel subscription'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleReactivateSubscription = async () => {
    if (!subscriptionData?.profile.subscription_id) return

    try {
      setActionLoading(true)
      const result = await reactivateSubscription(subscriptionData.profile.subscription_id)

      toast({
        title: 'Subscription Reactivated',
        description: result.message,
        variant: 'default',
      })

      // Reload subscription data
      await loadSubscriptionData()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reactivate subscription'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleSyncSubscription = async () => {
    try {
      setSyncLoading(true)
      
      const response = await fetch('/api/dodo/sync-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          subscriptionId: subscriptionData?.profile.subscription_id
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to sync subscription')
      }

      if (result.success) {
        toast({
          title: 'Subscription Synced',
          description: 'Your subscription status has been updated successfully',
          variant: 'default',
        })
        
        // Reload subscription data to show updated status
        await loadSubscriptionData()
      } else {
        toast({
          title: 'Sync Status',
          description: result.message || 'No updates needed',
          variant: 'default',
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync subscription'
      toast({
        title: 'Sync Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setSyncLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-stone" />
            <span className="ml-2 text-stone">Loading subscription details...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={loadSubscriptionData} 
            variant="outline" 
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!subscriptionData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <User className="h-12 w-12 text-stone/30 mx-auto mb-4" />
            <p className="text-stone">No subscription data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { profile, subscription } = subscriptionData
  const statusColor = getSubscriptionStatusColor(profile.subscription_status)
  const daysUntilExpiry = getDaysUntilExpiry(profile.subscription_expires_at)
  const planFeatures = getPlanFeatures(profile.subscription_plan)
  const canCancel = canCancelSubscription(profile.subscription_status)
  const canReactivate = canReactivateSubscription(
    profile.subscription_status, 
    subscription?.cancel_at_next_billing_date
  )

  return (
    <div className="space-y-6">
      {/* Current Plan Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {profile.subscription_plan === 'philosopher' ? (
              <Crown className="h-5 w-5 text-yellow-600" />
            ) : (
              <User className="h-5 w-5 text-stone" />
            )}
            {getPlanDisplayName(profile.subscription_plan)}
          </CardTitle>
          <Button
            onClick={handleSyncSubscription}
            disabled={syncLoading}
            variant="outline"
            size="sm"
            className="ml-auto"
          >
            {syncLoading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3 mr-1" />
                Sync Status
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-stone">Status:</span>
            <Badge className={`${statusColor} border`}>
              {getSubscriptionStatusText(profile.subscription_status)}
            </Badge>
          </div>

          {profile.subscription_expires_at && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-stone" />
              <span className="text-sm text-stone">
                {profile.subscription_status === 'active' ? 'Next billing:' : 'Expires:'} {' '}
                {formatSubscriptionDate(profile.subscription_expires_at)}
                {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
                  <span className="text-stone/70"> ({daysUntilExpiry} days)</span>
                )}
              </span>
            </div>
          )}

          {subscription?.cancel_at_next_billing_date && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Your subscription will be cancelled at the end of the current billing period.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {planFeatures.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Subscription Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {canReactivate && (
            <div className="space-y-2">
              <p className="text-sm text-stone">
                Your subscription is scheduled for cancellation. You can reactivate it to continue your plan.
              </p>
              <Button
                onClick={handleReactivateSubscription}
                disabled={actionLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Reactivating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reactivate Subscription
                  </>
                )}
              </Button>
            </div>
          )}

          {canCancel && !canReactivate && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-stone">
                  Cancel your subscription. You can choose to cancel immediately or at the end of your current billing period.
                </p>
                <div className="grid gap-2">
                  <Button
                    onClick={() => handleCancelSubscription(false)}
                    disabled={actionLoading}
                    variant="outline"
                    className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Cancel at End of Billing Period
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleCancelSubscription(true)}
                    disabled={actionLoading}
                    variant="outline"
                    className="w-full border-red-300 text-red-700 hover:bg-red-50"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Immediately
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {profile.subscription_status === 'free' && (
            <div className="text-center py-4">
              <p className="text-stone mb-4">You're currently on the free plan.</p>
              <Button className="bg-cta hover:bg-cta/90 text-white">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Philosopher Plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Details */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-stone">Subscription ID:</span>
                <p className="font-mono text-xs break-all">{subscription.id}</p>
              </div>
              <div>
                <span className="text-stone">Customer ID:</span>
                <p className="font-mono text-xs break-all">{subscription.customer_id}</p>
              </div>
              <div>
                <span className="text-stone">Created:</span>
                <p>{formatSubscriptionDate(subscription.created_at)}</p>
              </div>
              <div>
                <span className="text-stone">Current Period:</span>
                <p>{formatSubscriptionDate(subscription.current_period_start)} - {formatSubscriptionDate(subscription.current_period_end)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
