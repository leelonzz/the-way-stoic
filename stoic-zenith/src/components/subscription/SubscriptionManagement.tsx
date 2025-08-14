'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { TrialEligibilityCheck } from './TrialEligibilityCheck'
import {
  Calendar,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
  Crown,
  User,
  Receipt,
  Download
} from 'lucide-react'
import {
  getUserSubscription,
  reactivateSubscription,
  cancelSubscription,
  getSubscriptionStatusText,
  getSubscriptionStatusColor,
  canReactivateSubscription,
  formatSubscriptionDate,
  getDaysUntilExpiry,
  getPlanDisplayName,
  getPlanFeatures,
  type SubscriptionManagementResponse
} from '@/lib/subscription-management'
import { getEffectiveSubscriptionPlan } from '@/utils/subscription'
import { completeProfileRefresh } from '@/utils/profileRefresh'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { supabase } from '@/integrations/supabase/client'

interface SubscriptionManagementProps {
  userId: string
}

export function SubscriptionManagement({ userId }: SubscriptionManagementProps) {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionManagementResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [syncLoading, setSyncLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [invoiceLoading, setInvoiceLoading] = useState(false)
  const [refreshLoading, setRefreshLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { refreshProfile } = useAuthContext()

  // Use refs to store function references for stable access in real-time handler
  const loadSubscriptionDataRef = useRef<() => Promise<void>>()
  const refreshProfileRef = useRef<() => Promise<void>>()

  const loadSubscriptionData = useCallback(async () => {
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
  }, [userId])

  // Update refs whenever functions change
  useEffect(() => {
    loadSubscriptionDataRef.current = loadSubscriptionData
  }, [loadSubscriptionData])

  useEffect(() => {
    refreshProfileRef.current = refreshProfile
  }, [refreshProfile])

  useEffect(() => {
    if (userId) {
      loadSubscriptionData()
    }
  }, [userId])

  // Auto-refresh profile when returning from customer portal
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('refresh') === 'true') {
      // Clear the refresh parameter from URL without page reload
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('refresh')
      window.history.replaceState({}, '', newUrl.toString())

      // Use force refresh instead of regular sync for better reliability
      console.log('🔄 Returning from customer portal, triggering force refresh...')
      handleForceRefreshProfile()
    }
  }, [])

  // Auto-refresh when tab becomes visible (user returns from another tab)
  useEffect(() => {
    let lastRefresh = 0

    const handleVisibilityChange = () => {
      if (!document.hidden && userId) {
        const now = Date.now()
        const timeSinceLastRefresh = now - lastRefresh
        const twoSeconds = 2 * 1000

        // Only refresh if it's been more than 2 seconds since last refresh
        // This prevents excessive refreshing but is very responsive
        if (timeSinceLastRefresh > twoSeconds) {
          console.log('👁️ Tab became visible, triggering immediate refresh...')

          toast({
            title: 'Auto-Refreshing',
            description: 'Checking for subscription updates...',
            variant: 'default',
          })

          handleForceRefreshProfile()
          lastRefresh = now
        } else {
          console.log('📱 Recent refresh detected, skipping to prevent spam')
        }
      }
    }

    // Also listen for window focus events for even faster detection
    const handleFocus = () => {
      if (userId) {
        const now = Date.now()
        const timeSinceLastRefresh = now - lastRefresh
        const twoSeconds = 2 * 1000

        if (timeSinceLastRefresh > twoSeconds) {
          console.log('🎯 Window focused, triggering immediate refresh...')

          toast({
            title: 'Auto-Refreshing',
            description: 'Checking for subscription updates...',
            variant: 'default',
          })

          handleForceRefreshProfile()
          lastRefresh = now
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [userId])

  const handleForceSync = async () => {
    try {
      setSyncLoading(true)
      
      // First refresh the auth profile
      await refreshProfile()
      
      // Then reload subscription data
      await loadSubscriptionData()
      
      toast({
        title: 'Profile Synced',
        description: 'Your subscription status has been updated.',
        variant: 'default',
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync profile'
      toast({
        title: 'Sync Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setSyncLoading(false)
    }
  }

  // Real-time listener for profile changes with retry mechanism
  useEffect(() => {
    if (!userId) return

    console.log('Setting up real-time subscription for user:', userId)
    let retryCount = 0
    let reconnectCount = 0
    const maxRetries = 3
    const maxReconnects = 5
    let retryTimeout: NodeJS.Timeout
    let reconnectTimeout: NodeJS.Timeout
    let currentSubscription: any = null

    const handleProfileUpdate = async (payload: any) => {
      console.log('🔥 Profile updated via webhook:', payload.new)
      
      try {
        // Check if this is a meaningful update (subscription-related changes)
        const oldData = payload.old
        const newData = payload.new
        
        const subscriptionFieldsChanged = 
          oldData?.subscription_status !== newData?.subscription_status ||
          oldData?.subscription_plan !== newData?.subscription_plan ||
          oldData?.subscription_expires_at !== newData?.subscription_expires_at ||
          oldData?.updated_at !== newData?.updated_at
        
        if (subscriptionFieldsChanged) {
          console.log('📱 Subscription-related fields changed, refreshing UI')
          
          // Debounce multiple rapid updates
          clearTimeout(retryTimeout)
          retryTimeout = setTimeout(async () => {
            try {
              // Use refs to access current functions without stale closures
              const promises = []
              
              if (loadSubscriptionDataRef.current) {
                promises.push(loadSubscriptionDataRef.current())
              }
              
              if (refreshProfileRef.current) {
                promises.push(refreshProfileRef.current())
              }
              
              await Promise.all(promises)
              retryCount = 0 // Reset retry count on success
              console.log('✅ Profile and subscription data refreshed successfully')
            } catch (error) {
              console.error('❌ Error refreshing profile data:', error)
              
              // Retry mechanism for failed updates
              if (retryCount < maxRetries) {
                retryCount++
                console.log(`🔄 Retrying profile refresh (attempt ${retryCount}/${maxRetries})`)
                setTimeout(() => {
                  handleProfileUpdate(payload)
                }, 2000 * retryCount) // Exponential backoff
              } else {
                console.error('❌ Max retries reached for profile refresh')
                toast({
                  title: 'Sync Error',
                  description: 'Profile sync failed. Please click Force Refresh to update manually.',
                  variant: 'destructive',
                })
              }
            }
          }, 500) // 500ms debounce
        } else {
          console.log('📱 Non-subscription update detected, skipping refresh')
        }
      } catch (error) {
        console.error('❌ Error processing profile update:', error)
      }
    }

    const createSubscription = () => {
      if (currentSubscription) {
        currentSubscription.unsubscribe()
      }

      currentSubscription = supabase
        .channel(`profile-changes-${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${userId}`
          },
          handleProfileUpdate
        )
        .subscribe((status) => {
          console.log('Real-time subscription status:', status)
          if (status === 'SUBSCRIBED') {
            console.log('✅ Real-time profile subscription active')
            reconnectCount = 0 // Reset reconnect count on successful connection
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Real-time subscription error, attempting to reconnect...')
            
            if (reconnectCount < maxReconnects) {
              reconnectCount++
              const delay = Math.min(1000 * Math.pow(2, reconnectCount - 1), 30000) // Exponential backoff, max 30s
              
              clearTimeout(reconnectTimeout)
              reconnectTimeout = setTimeout(() => {
                console.log(`🔄 Reconnecting real-time subscription (attempt ${reconnectCount}/${maxReconnects})`)
                createSubscription()
              }, delay)
            } else {
              console.error('❌ Max reconnection attempts reached for real-time subscription')
              toast({
                title: 'Connection Error',
                description: 'Real-time updates unavailable. Please refresh the page or use Force Refresh.',
                variant: 'destructive',
              })
            }
          }
        })
    }

    // Initial subscription creation
    createSubscription()

    return () => {
      console.log('Cleaning up real-time subscription')
      clearTimeout(retryTimeout)
      clearTimeout(reconnectTimeout)
      if (currentSubscription) {
        currentSubscription.unsubscribe()
      }
    }
  }, [userId]) // Only depend on userId to prevent constant re-subscriptions

  const handleCancelSubscription = async (cancelAtNextBilling: boolean = true) => {
    if (!subscriptionData?.profile.subscription_id) return

    try {
      setActionLoading(true)
      const result = await cancelSubscription(subscriptionData.profile.subscription_id, cancelAtNextBilling)

      toast({
        title: 'Subscription Cancelled',
        description: result.message,
        variant: 'default',
      })

      // If API indicates refresh is needed, trigger force refresh
      if (result.requiresRefresh) {
        console.log('🔄 API requested refresh after cancellation, triggering force refresh...')
        await handleForceRefreshProfile()
      } else {
        // Otherwise just reload subscription data
        await loadSubscriptionData()
      }
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

      // If API indicates refresh is needed, trigger force refresh
      if (result.requiresRefresh) {
        console.log('🔄 API requested refresh, triggering force refresh...')
        await handleForceRefreshProfile()
      } else {
        // Otherwise just reload subscription data
        await loadSubscriptionData()
      }
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

  const handleOpenCustomerPortal = async () => {
    try {
      setPortalLoading(true)
      
      const response = await fetch('/api/dodo/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to access billing portal')
      }

      if (result.portalUrl) {
        // Open portal in new tab
        window.open(result.portalUrl, '_blank')
        
        toast({
          title: 'Opening Billing Portal',
          description: 'Your billing portal has opened in a new tab',
          variant: 'default',
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access billing portal'
      toast({
        title: 'Portal Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setPortalLoading(false)
    }
  }

  const handleDownloadInvoice = async (paymentId: string) => {
    try {
      setInvoiceLoading(true)

      // First check if invoice exists
      const checkResponse = await fetch('/api/dodo/invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: paymentId,
          userId: userId
        }),
      })

      const checkResult = await checkResponse.json()

      if (checkResponse.ok && checkResult.success) {
        // Invoice exists, download it
        const downloadUrl = `/api/dodo/invoice?paymentId=${paymentId}&userId=${userId}`
        window.open(downloadUrl, '_blank')

        toast({
          title: 'Invoice Download',
          description: 'Your invoice download has started',
          variant: 'default',
        })
      } else {
        // Invoice not available, show helpful message
        toast({
          title: 'Invoice Not Available',
          description: checkResult.error || 'Invoice may not be generated yet. Try using the billing portal or contact support.',
          variant: 'destructive',
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download invoice'
      toast({
        title: 'Download Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setInvoiceLoading(false)
    }
  }

  const handleForceRefreshProfile = async () => {
    try {
      setRefreshLoading(true)

      toast({
        title: 'Refreshing Profile',
        description: 'Clearing cached data and fetching fresh profile information...',
        variant: 'default',
      })

      await completeProfileRefresh(userId, refreshProfile)

      toast({
        title: 'Profile Refreshed',
        description: 'Your profile data has been updated. The page will reload to show the latest information.',
        variant: 'default',
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh profile'
      toast({
        title: 'Refresh Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setRefreshLoading(false)
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
  const effectivePlan = getEffectiveSubscriptionPlan(profile)
  const planFeatures = getPlanFeatures(effectivePlan)
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
            {effectivePlan === 'philosopher' ? (
              <Crown className="h-5 w-5 text-yellow-600" />
            ) : (
              <User className="h-5 w-5 text-stone" />
            )}
            {getPlanDisplayName(effectivePlan)}
          </CardTitle>
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

          {/* Billing Portal Button */}
          <div className="space-y-2">
            <p className="text-sm text-stone">
              Access your billing history, download invoices, and manage your payment methods.
            </p>
            <Button
              onClick={handleOpenCustomerPortal}
              disabled={portalLoading}
              variant="outline"
              className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              {portalLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Opening Portal...
                </>
              ) : (
                <>
                  <Receipt className="h-4 w-4 mr-2" />
                  View Billing History & Invoices
                </>
              )}
            </Button>
          </div>

          {/* Direct Invoice Download for Recent Payment */}
          {subscription && (
            <div className="space-y-2">
              <p className="text-sm text-stone">
                Download your invoice directly if the portal download isn't working.
              </p>
              <Button
                onClick={() => handleDownloadInvoice('pay_8PM80')} // Replace with dynamic payment ID
                disabled={invoiceLoading}
                variant="outline"
                className="w-full border-green-300 text-green-700 hover:bg-green-50"
              >
                {invoiceLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download Latest Invoice
                  </>
                )}
              </Button>
            </div>
          )}

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



          {(profile.subscription_status === 'free' || effectivePlan === 'seeker') && (
            <TrialEligibilityCheck
              onTrialStart={() => {
                // Refresh profile after trial start
                window.location.reload()
              }}
              onUpgrade={() => {
                // Handle upgrade action - could navigate to pricing page
                console.log('Navigate to upgrade page')
              }}
            />
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
