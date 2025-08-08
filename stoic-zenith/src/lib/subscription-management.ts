/**
 * Subscription Management Service
 * Handles subscription operations like cancellation, reactivation, and updates
 */

export interface SubscriptionDetails {
  subscription_status: string
  subscription_plan: string
  subscription_expires_at: string | null
  subscription_id: string | null
}

export interface DodoSubscription {
  id: string
  status: string
  customer_id: string
  product_id: string
  current_period_start: string
  current_period_end: string
  cancel_at_next_billing_date?: boolean
  metadata?: Record<string, any>
  created_at: string
}

export interface SubscriptionManagementResponse {
  profile: SubscriptionDetails
  subscription: DodoSubscription | null
}

export interface SubscriptionUpdateResponse {
  success: boolean
  action: string
  subscription: DodoSubscription
  message: string
}

/**
 * Get user's subscription details
 */
export async function getUserSubscription(userId: string): Promise<SubscriptionManagementResponse> {
  const response = await fetch(`/api/dodo/subscriptions/manage?userId=${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch subscription details')
  }

  return response.json()
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string, 
  cancelAtNextBilling: boolean = true
): Promise<SubscriptionUpdateResponse> {
  const response = await fetch('/api/dodo/subscriptions/manage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subscriptionId,
      action: 'cancel',
      cancelAtNextBilling,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to cancel subscription')
  }

  return response.json()
}

/**
 * Reactivate subscription
 */
export async function reactivateSubscription(subscriptionId: string): Promise<SubscriptionUpdateResponse> {
  const response = await fetch('/api/dodo/subscriptions/manage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subscriptionId,
      action: 'reactivate',
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to reactivate subscription')
  }

  return response.json()
}

/**
 * Update subscription metadata
 */
export async function updateSubscription(
  subscriptionId: string, 
  metadata: Record<string, any>
): Promise<SubscriptionUpdateResponse> {
  const response = await fetch('/api/dodo/subscriptions/manage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subscriptionId,
      action: 'update',
      metadata,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update subscription')
  }

  return response.json()
}

/**
 * Get subscription status display text
 */
export function getSubscriptionStatusText(status: string): string {
  switch (status) {
    case 'active':
      return 'Active'
    case 'cancelled':
      return 'Cancelled'
    case 'past_due':
      return 'Past Due'
    case 'unpaid':
      return 'Unpaid'
    case 'on_hold':
      return 'On Hold'
    case 'expired':
      return 'Expired'
    case 'free':
      return 'Free Plan'
    default:
      return 'Unknown'
  }
}

/**
 * Get subscription status color for UI
 */
export function getSubscriptionStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'cancelled':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'past_due':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'unpaid':
      return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'on_hold':
      return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'expired':
      return 'text-gray-600 bg-gray-50 border-gray-200'
    case 'free':
      return 'text-stone-600 bg-stone-50 border-stone-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

/**
 * Check if subscription can be cancelled
 */
export function canCancelSubscription(status: string): boolean {
  return ['active', 'past_due', 'unpaid'].includes(status)
}

/**
 * Check if subscription can be reactivated
 */
export function canReactivateSubscription(status: string, cancelAtNextBilling?: boolean): boolean {
  return status === 'active' && cancelAtNextBilling === true
}

/**
 * Format subscription dates for display
 */
export function formatSubscriptionDate(dateString: string | null): string {
  if (!dateString) return 'N/A'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return 'Invalid Date'
  }
}

/**
 * Calculate days until subscription expires
 */
export function getDaysUntilExpiry(expiryDate: string | null): number | null {
  if (!expiryDate) return null
  
  try {
    const expiry = new Date(expiryDate)
    const now = new Date()
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  } catch {
    return null
  }
}

/**
 * Get plan display name
 */
export function getPlanDisplayName(plan: string): string {
  switch (plan) {
    case 'philosopher':
      return 'Philosopher Plan'
    case 'seeker':
      return 'Seeker Plan'
    default:
      return plan.charAt(0).toUpperCase() + plan.slice(1) + ' Plan'
  }
}

/**
 * Get plan features
 */
export function getPlanFeatures(plan: string): string[] {
  switch (plan) {
    case 'philosopher':
      return [
        'Unlimited chat with Stoic philosophers',
        'Advanced streak analytics',
        'Personalized philosophical guidance',
        'Export journal entries',
        'Priority support',
        'Ad-free experience'
      ]
    case 'seeker':
      return [
        'Basic journal functionality',
        'Limited philosopher interactions',
        'Basic streak tracking',
        'Community access'
      ]
    default:
      return []
  }
}
