/**
 * Utility functions to force refresh user profile data
 * This helps resolve issues where cached profile data is stale
 */

import { clearProfileCache } from '@/hooks/useProfile'
import { CacheManager } from '@/utils/cacheManager'

/**
 * Clear all cached profile data for a user
 */
export function clearAllProfileCache(userId: string): void {
  try {
    // Clear profile cache from useProfile hook
    clearProfileCache(userId)
    
    // Clear cache from CacheManager
    CacheManager.clearUserCache(userId)
    
    // Clear localStorage entries that might contain profile data
    const keysToRemove = [
      `profile-${userId}`,
      `profile_${userId}`,
      `stoic-cache-profile-${userId}`,
      `stoic-cache-calendar-${userId}`
    ]
    
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key)
      } catch (error) {
        console.warn(`Failed to remove ${key}:`, error)
      }
    })
    
    console.log('✅ All profile cache cleared for user:', userId)
  } catch (error) {
    console.error('Error clearing profile cache:', error)
  }
}

/**
 * Force refresh profile data using auth context
 */
export async function forceRefreshProfile(refreshProfileFn: () => Promise<void>): Promise<void> {
  try {
    console.log('🔄 Force refreshing profile using auth context...')
    await refreshProfileFn()
    console.log('✅ Profile refreshed successfully')
  } catch (error) {
    console.error('Error force refreshing profile:', error)
    throw error
  }
}

/**
 * Complete profile refresh - clears cache and fetches fresh data
 */
export async function completeProfileRefresh(userId: string, refreshProfileFn: () => Promise<void>): Promise<void> {
  try {
    // Step 1: Clear all cached data
    clearAllProfileCache(userId)

    // Step 2: Force refresh from server using auth context
    await forceRefreshProfile(refreshProfileFn)

    // Step 3: Trigger a page reload to ensure all components get fresh data
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch (error) {
    console.error('Error in complete profile refresh:', error)
    throw error
  }
}
