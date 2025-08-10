import { createClient } from '@supabase/supabase-js'
import type { UserProfile } from '@/integrations/supabase/auth'

// Use service role client for trial prevention checks
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface TrialEligibilityResult {
  eligible: boolean
  reason?: string
  hasUsedTrial: boolean
  trialUsedAt?: string
  googleAccountId?: string
}

/**
 * Check if a user is eligible for a trial based on their Google account ID
 */
export async function checkTrialEligibility(userId: string): Promise<TrialEligibilityResult> {
  try {
    // Get user profile with Google account ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('google_account_id, has_used_trial, trial_used_at')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return {
        eligible: false,
        reason: 'User profile not found',
        hasUsedTrial: false
      }
    }

    // If no Google account ID, cannot verify trial eligibility
    if (!profile.google_account_id) {
      return {
        eligible: false,
        reason: 'Google account verification required for trial access',
        hasUsedTrial: false
      }
    }

    // Check if this Google account has used trial before
    const { data: trialHistory, error: historyError } = await supabase
      .from('trial_usage_history')
      .select('trial_started_at, email')
      .eq('google_account_id', profile.google_account_id)
      .order('trial_started_at', { ascending: false })
      .limit(1)

    if (historyError) {
      console.error('Error checking trial history:', historyError)
      return {
        eligible: false,
        reason: 'Unable to verify trial eligibility',
        hasUsedTrial: false,
        googleAccountId: profile.google_account_id
      }
    }

    const hasUsedTrial = profile.has_used_trial || (trialHistory && trialHistory.length > 0)

    if (hasUsedTrial) {
      const trialUsedAt = profile.trial_used_at || trialHistory?.[0]?.trial_started_at
      return {
        eligible: false,
        reason: 'This Google account has already used a free trial',
        hasUsedTrial: true,
        trialUsedAt,
        googleAccountId: profile.google_account_id
      }
    }

    return {
      eligible: true,
      hasUsedTrial: false,
      googleAccountId: profile.google_account_id
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
      .select('google_account_id, email, has_used_trial')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return { success: false, error: 'User profile not found' }
    }

    if (!profile.google_account_id) {
      return { success: false, error: 'Google account ID required' }
    }

    if (profile.has_used_trial) {
      return { success: false, error: 'User has already used trial' }
    }

    // Call the database function to record trial usage
    const { error: recordError } = await supabase
      .rpc('record_trial_usage', {
        user_uuid: userId,
        google_id: profile.google_account_id,
        user_email: profile.email,
        plan_type: planType
      })

    if (recordError) {
      console.error('Error recording trial usage:', recordError)
      return { success: false, error: 'Failed to record trial usage' }
    }

    return { success: true }

  } catch (error) {
    console.error('Error recording trial usage:', error)
    return { success: false, error: 'Failed to record trial usage' }
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
export async function getTrialHistory(googleAccountId: string) {
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
