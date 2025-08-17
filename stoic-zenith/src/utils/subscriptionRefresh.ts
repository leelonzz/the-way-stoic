/**
 * Shared utilities for triggering subscription-related real-time updates
 * Used by both webhook handlers and manual subscription management APIs
 */

import { createClient } from '@supabase/supabase-js'

// Use service role client for subscription operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required Supabase environment variables')
}

const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey
)

/**
 * Trigger profile refresh for real-time updates
 * This updates timestamp fields to ensure change detection by real-time listeners
 */
export async function triggerProfileRefresh(userId: string): Promise<void> {
  try {
    // Update both timestamp fields to ensure change detection
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('profiles')
      .update({ 
        profile_refreshed_at: now,
        updated_at: now
      })
      .eq('id', userId)

    if (error) {
      console.error('Failed to trigger profile refresh:', error)
    } else {
      console.log(`📱 Profile refresh triggered for user ${userId}`)
      
      // Add a small delay to ensure database consistency before client updates
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  } catch (error) {
    console.error('Error triggering profile refresh:', error)
  }
}

/**
 * Emit webhook completion event for immediate UI updates
 * This sends a broadcast message through Supabase real-time for instant UI updates
 */
export async function emitWebhookCompletion(
  userId: string, 
  eventType: string, 
  eventData: any
): Promise<void> {
  try {
    // Send a broadcast message through Supabase real-time for immediate UI updates
    const channel = supabase.channel(`webhook-completion-${userId}`)
    
    const payload = {
      type: 'webhook_completed',
      event: eventType,
      user_id: userId,
      data: eventData,
      timestamp: new Date().toISOString()
    }

    await channel.send({
      type: 'broadcast',
      event: 'webhook_completion',
      payload
    })

    console.log(`📡 Webhook completion event sent for user ${userId}:`, eventType)
  } catch (error) {
    console.error('Error emitting webhook completion:', error)
    // Don't throw - this is a nice-to-have feature
  }
}

/**
 * Complete subscription update with real-time refresh
 * Combines both profile refresh and webhook completion for subscription changes
 */
export async function triggerSubscriptionUpdate(
  userId: string,
  eventType: 'subscription_activated' | 'subscription_cancelled' | 'subscription_failed' | 'subscription_renewed',
  eventData: {
    subscription_id: string
    new_plan: string
    new_status: string
  }
): Promise<void> {
  try {
    // Trigger profile refresh for real-time updates
    await triggerProfileRefresh(userId)

    // Emit completion event for immediate UI updates
    await emitWebhookCompletion(userId, eventType, eventData)

    console.log(`✅ Subscription update completed for user ${userId}: ${eventType}`)
  } catch (error) {
    console.error('Error triggering subscription update:', error)
    throw error
  }
}
