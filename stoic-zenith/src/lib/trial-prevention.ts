import { createClient } from '@supabase/supabase-js'
import type { UserProfile } from '@/integrations/supabase/auth'

// Use service role client for trial prevention checks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required Supabase environment variables')
}

const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey
)

export interface TrialEligibilityResult {
  eligible: boolean
  reason?: string
  hasUsedTrial: boolean
  trialUsedAt?: string
  googleAccountId?: string
}

/**
 * Check if a user is eligible for a trial based on their profile
 * Updated to work with current database structure without Google account tracking
 */
export async function checkTrialEligibility(userId: string): Promise<TrialEligibilityResult> {
  try {
    // Get user profile with trial and subscription information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('has_used_trial, trial_used_at, subscription_status, subscription_plan, created_at')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return {
        eligible: false,
        reason: 'User profile not found',
        hasUsedTrial: false
      }
    }

    // Check if user has already used trial
    if (profile.has_used_trial) {
      return {
        eligible: false,
        reason: 'You have already used your free trial',
        hasUsedTrial: true,
        trialUsedAt: profile.trial_used_at
      }
    }

    // Check if user has ever had a paid subscription (indicates they've had premium access)
    // If they had a subscription before, they should not get a free trial
    if (profile.subscription_status === 'cancelled' ||
        profile.subscription_status === 'expired') {
      return {
        eligible: false,
        reason: 'Free trial is not available for accounts that have previously had subscriptions',
        hasUsedTrial: true, // Treat as having used trial
        trialUsedAt: profile.trial_used_at || new Date().toISOString()
      }
    }

    // If user currently has an active subscription, they don't need a trial
    if (profile.subscription_status === 'active' && profile.subscription_plan === 'philosopher') {
      return {
        eligible: false,
        reason: 'You already have an active premium subscription',
        hasUsedTrial: false
      }
    }

    // User is eligible for trial if they haven't used it and haven't had a subscription
    return {
      eligible: true,
      hasUsedTrial: false
    }

  } catch (error) {
    console.error('Error checking trial eligibility:', error)
    return {
      eligible: false,
      reason: 'Unable to verify trial eligibility',
      hasUsedTrial: false
    }
  }
}

/**
 * Record trial usage for a user
 */
export async function recordTrialUsage(
  userId: string,
  planType: string = 'philosopher'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, has_used_trial')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return { success: false, error: 'User profile not found' }
    }

    if (profile.has_used_trial) {
      return { success: false, error: 'User has already used trial' }
    }

    // Update user profile to mark trial as used
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        has_used_trial: true,
        trial_used_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return { success: false, error: 'Failed to update profile' }
    }

    return { success: true }

  } catch (error) {
    console.error('Error recording trial usage:', error)
    return { success: false, error: 'Failed to record trial usage' }
  }
}

/**
 * Mark user as having used trial (for cancelled subscriptions)
 * This prevents them from accessing free trials in the future
 */
export async function markTrialAsUsed(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        has_used_trial: true,
        trial_used_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error marking trial as used:', updateError)
      return { success: false, error: 'Failed to mark trial as used' }
    }

    return { success: true }

  } catch (error) {
    console.error('Error marking trial as used:', error)
    return { success: false, error: 'Failed to mark trial as used' }
  }
}

/**
 * Check if user can access premium features (has active subscription or eligible trial)
 */
export async function checkPremiumAccess(profile: UserProfile): Promise<{
  hasAccess: boolean
  reason?: string
  canStartTrial?: boolean
}> {
  // Check if user has active subscription
  if (profile.subscription_status === 'active' && profile.subscription_plan === 'philosopher') {
    return { hasAccess: true }
  }

  // Check trial eligibility
  const trialEligibility = await checkTrialEligibility(profile.id)
  
  if (trialEligibility.eligible) {
    return { 
      hasAccess: false, 
      canStartTrial: true,
      reason: 'Start your free trial to access premium features'
    }
  }

  return { 
    hasAccess: false, 
    canStartTrial: false,
    reason: trialEligibility.reason || 'Premium subscription required'
  }
}

/**
 * Record account cancellation
 */
export async function recordAccountCancellation(
  userId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .rpc('record_account_cancellation', {
        user_uuid: userId,
        cancellation_reason: reason
      })

    if (error) {
      console.error('Error recording account cancellation:', error)
      return { success: false, error: 'Failed to record cancellation' }
    }

    return { success: true }

  } catch (error) {
    console.error('Error recording account cancellation:', error)
    return { success: false, error: 'Failed to record cancellation' }
  }
}

/**
 * Get trial usage history for a Google account
 */
export async function getTrialHistory(googleAccountId: string): Promise<unknown[] | null> {
  try {
    const { data, error } = await supabase
      .from('trial_usage_history')
      .select('*')
      .eq('google_account_id', googleAccountId)
      .order('trial_started_at', { ascending: false })

    if (error) {
      console.error('Error fetching trial history:', error)
      return null
    }

    return data

  } catch (error) {
    console.error('Error fetching trial history:', error)
    return null
  }
}
