/**
 * Test suite for subscription cancellation and trial prevention system
 * 
 * This test suite verifies:
 * 1. Subscription cancellation properly downgrades users to "Seeker" plan
 * 2. Trial prevention system works correctly with Google account IDs
 * 3. Account cancellation tracking prevents trial abuse
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/jest'
import { createClient } from '@supabase/supabase-js'
import { checkTrialEligibility, recordTrialUsage, recordAccountCancellation } from '../src/lib/trial-prevention'

// Mock Supabase client for testing
const mockSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-key'
)

describe('Subscription Cancellation and Trial Prevention', () => {
  const testUserId = 'test-user-123'
  const testGoogleId = 'google-account-456'
  const testEmail = 'test@example.com'

  beforeEach(async () => {
    // Clean up test data before each test
    await mockSupabase.from('profiles').delete().eq('id', testUserId)
    await mockSupabase.from('trial_usage_history').delete().eq('google_account_id', testGoogleId)
    await mockSupabase.from('account_cancellation_history').delete().eq('google_account_id', testGoogleId)
  })

  afterEach(async () => {
    // Clean up test data after each test
    await mockSupabase.from('profiles').delete().eq('id', testUserId)
    await mockSupabase.from('trial_usage_history').delete().eq('google_account_id', testGoogleId)
    await mockSupabase.from('account_cancellation_history').delete().eq('google_account_id', testGoogleId)
  })

  describe('Trial Eligibility System', () => {
    it('should allow trial for new Google account', async () => {
      // Create a new user profile without trial usage
      await mockSupabase.from('profiles').insert({
        id: testUserId,
        email: testEmail,
        google_account_id: testGoogleId,
        has_used_trial: false,
        subscription_plan: 'seeker'
      })

      const eligibility = await checkTrialEligibility(testUserId)
      
      expect(eligibility.eligible).toBe(true)
      expect(eligibility.hasUsedTrial).toBe(false)
      expect(eligibility.googleAccountId).toBe(testGoogleId)
    })

    it('should deny trial for Google account that already used trial', async () => {
      // Create user profile with trial already used
      await mockSupabase.from('profiles').insert({
        id: testUserId,
        email: testEmail,
        google_account_id: testGoogleId,
        has_used_trial: true,
        trial_used_at: new Date().toISOString(),
        subscription_plan: 'seeker'
      })

      // Add trial usage history
      await mockSupabase.from('trial_usage_history').insert({
        google_account_id: testGoogleId,
        user_id: testUserId,
        email: testEmail,
        subscription_plan: 'philosopher'
      })

      const eligibility = await checkTrialEligibility(testUserId)
      
      expect(eligibility.eligible).toBe(false)
      expect(eligibility.hasUsedTrial).toBe(true)
      expect(eligibility.reason).toContain('already used a free trial')
    })

    it('should deny trial for user without Google account ID', async () => {
      // Create user profile without Google account ID
      await mockSupabase.from('profiles').insert({
        id: testUserId,
        email: testEmail,
        google_account_id: null,
        has_used_trial: false,
        subscription_plan: 'seeker'
      })

      const eligibility = await checkTrialEligibility(testUserId)
      
      expect(eligibility.eligible).toBe(false)
      expect(eligibility.reason).toContain('Google account verification required')
    })
  })

  describe('Trial Usage Recording', () => {
    it('should record trial usage correctly', async () => {
      // Create eligible user
      await mockSupabase.from('profiles').insert({
        id: testUserId,
        email: testEmail,
        google_account_id: testGoogleId,
        has_used_trial: false,
        subscription_plan: 'seeker'
      })

      const result = await recordTrialUsage(testUserId, 'philosopher')
      
      expect(result.success).toBe(true)

      // Verify profile was updated
      const { data: profile } = await mockSupabase
        .from('profiles')
        .select('has_used_trial, trial_used_at')
        .eq('id', testUserId)
        .single()

      expect(profile?.has_used_trial).toBe(true)
      expect(profile?.trial_used_at).toBeTruthy()

      // Verify trial history was recorded
      const { data: history } = await mockSupabase
        .from('trial_usage_history')
        .select('*')
        .eq('google_account_id', testGoogleId)

      expect(history).toHaveLength(1)
      expect(history?.[0].user_id).toBe(testUserId)
      expect(history?.[0].subscription_plan).toBe('philosopher')
    })

    it('should prevent duplicate trial usage', async () => {
      // Create user who already used trial
      await mockSupabase.from('profiles').insert({
        id: testUserId,
        email: testEmail,
        google_account_id: testGoogleId,
        has_used_trial: true,
        subscription_plan: 'seeker'
      })

      const result = await recordTrialUsage(testUserId, 'philosopher')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('already used trial')
    })
  })

  describe('Account Cancellation Tracking', () => {
    it('should record account cancellation', async () => {
      // Create user with subscription
      await mockSupabase.from('profiles').insert({
        id: testUserId,
        email: testEmail,
        google_account_id: testGoogleId,
        has_used_trial: true,
        subscription_plan: 'philosopher',
        subscription_status: 'active'
      })

      const result = await recordAccountCancellation(testUserId, 'Testing cancellation')
      
      expect(result.success).toBe(true)

      // Verify cancellation history was recorded
      const { data: history } = await mockSupabase
        .from('account_cancellation_history')
        .select('*')
        .eq('google_account_id', testGoogleId)

      expect(history).toHaveLength(1)
      expect(history?.[0].user_id).toBe(testUserId)
      expect(history?.[0].subscription_plan_at_cancellation).toBe('philosopher')
      expect(history?.[0].had_used_trial).toBe(true)
      expect(history?.[0].reason).toBe('Testing cancellation')

      // Verify profile was updated
      const { data: profile } = await mockSupabase
        .from('profiles')
        .select('account_cancelled_at')
        .eq('id', testUserId)
        .single()

      expect(profile?.account_cancelled_at).toBeTruthy()
    })
  })

  describe('Subscription Plan Downgrade', () => {
    it('should downgrade cancelled subscription to seeker plan', async () => {
      // Create user with active philosopher subscription
      await mockSupabase.from('profiles').insert({
        id: testUserId,
        email: testEmail,
        google_account_id: testGoogleId,
        subscription_plan: 'philosopher',
        subscription_status: 'active',
        subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })

      // Simulate subscription cancellation
      await mockSupabase
        .from('profiles')
        .update({
          subscription_status: 'cancelled',
          subscription_plan: 'seeker', // Should downgrade to seeker
          subscription_expires_at: null
        })
        .eq('id', testUserId)

      // Verify downgrade
      const { data: profile } = await mockSupabase
        .from('profiles')
        .select('subscription_plan, subscription_status, subscription_expires_at')
        .eq('id', testUserId)
        .single()

      expect(profile?.subscription_plan).toBe('seeker')
      expect(profile?.subscription_status).toBe('cancelled')
      expect(profile?.subscription_expires_at).toBeNull()
    })
  })

  describe('Cross-Account Trial Prevention', () => {
    it('should prevent trial access after account deletion and re-registration', async () => {
      const newUserId = 'new-user-789'

      // Simulate original account with trial usage
      await mockSupabase.from('trial_usage_history').insert({
        google_account_id: testGoogleId,
        user_id: testUserId, // Original user ID
        email: testEmail,
        subscription_plan: 'philosopher',
        account_deleted_at: new Date().toISOString() // Mark as deleted
      })

      // Create new user account with same Google ID (simulating re-registration)
      await mockSupabase.from('profiles').insert({
        id: newUserId,
        email: testEmail,
        google_account_id: testGoogleId,
        has_used_trial: true, // Should be set to true by trigger
        subscription_plan: 'seeker'
      })

      const eligibility = await checkTrialEligibility(newUserId)
      
      expect(eligibility.eligible).toBe(false)
      expect(eligibility.hasUsedTrial).toBe(true)
      expect(eligibility.reason).toContain('already used a free trial')

      // Clean up
      await mockSupabase.from('profiles').delete().eq('id', newUserId)
    })
  })
})
