import type { UserProfile } from '@/integrations/supabase/auth';

/**
 * Check if user has an active Philosopher subscription
 * This now uses the effective subscription plan logic
 */
export function hasPhilosopherPlan(profile: UserProfile | null): boolean {
  if (!profile) return false;

  return getEffectiveSubscriptionPlan(profile) === 'philosopher';
}

/**
 * Get the effective subscription plan (what the user actually has access to)
 * This considers both the plan field and subscription status
 */
export function getEffectiveSubscriptionPlan(profile: { subscription_status?: string | null; subscription_plan?: string | null } | null): string {
  if (!profile) return 'seeker';

  // If subscription is cancelled, expired, or free, user has seeker access
  if (profile.subscription_status === 'cancelled' ||
      profile.subscription_status === 'expired' ||
      profile.subscription_status === 'free' ||
      !profile.subscription_status) {
    return 'seeker';
  }

  // Only return philosopher if subscription is active
  if (profile.subscription_status === 'active' && profile.subscription_plan === 'philosopher') {
    return 'philosopher';
  }

  // Default to seeker for all other cases
  return 'seeker';
}

/**
 * Get display name for subscription plan
 * Takes into account both plan and status to show accurate information
 */
export function getSubscriptionPlanDisplayName(profile: UserProfile | null): string {
  if (!profile) return 'Free plan';

  const effectivePlan = getEffectiveSubscriptionPlan(profile);

  switch (effectivePlan) {
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
