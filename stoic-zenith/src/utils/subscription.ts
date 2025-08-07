import type { UserProfile } from '@/integrations/supabase/auth';

/**
 * Check if user has an active Philosopher subscription
 */
export function hasPhilosopherPlan(profile: UserProfile | null): boolean {
  if (!profile) return false;
  
  return (
    profile.subscription_status === 'active' && 
    profile.subscription_plan === 'philosopher'
  );
}

/**
 * Get display name for subscription plan
 */
export function getSubscriptionPlanDisplayName(profile: UserProfile | null): string {
  if (!profile) return 'Free plan';
  
  switch (profile.subscription_plan) {
    case 'philosopher':
      return 'Philosopher plan';
    case 'seeker':
      return 'Seeker plan';
    default:
      return 'Free plan';
  }
}

/**
 * Check if subscription is active (regardless of plan type)
 */
export function hasActiveSubscription(profile: UserProfile | null): boolean {
  if (!profile) return false;
  
  return profile.subscription_status === 'active';
}
