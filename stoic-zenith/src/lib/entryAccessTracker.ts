/**
 * Utility for tracking when journal entries were last accessed
 * Stores access times in encrypted localStorage for persistence across sessions
 */

import { secureStorage, getUserStorageKey } from './encryption'

const STORAGE_KEY = 'journal_entry_access_times'

interface EntryAccessTime {
  entryId: string
  lastAccessedAt: string // ISO string
}

/**
 * Get all stored access times from encrypted localStorage
 */
function getStoredAccessTimes(userId?: string): Record<string, string> {
  try {
    const storageKey = userId ? getUserStorageKey(userId, STORAGE_KEY) : STORAGE_KEY
    const stored = secureStorage.getItem(storageKey)
    if (!stored) return {}
    
    const accessTimes: EntryAccessTime[] = JSON.parse(stored)
    const result: Record<string, string> = {}
    
    accessTimes.forEach(({ entryId, lastAccessedAt }) => {
      result[entryId] = lastAccessedAt
    })
    
    return result
  } catch (error) {
    console.warn('Failed to load entry access times from encrypted localStorage:', error)
    return {}
  }
}

/**
 * Save access times to encrypted localStorage
 */
function saveAccessTimes(accessTimes: Record<string, string>, userId?: string): void {
  try {
    const accessTimeArray: EntryAccessTime[] = Object.entries(accessTimes).map(
      ([entryId, lastAccessedAt]) => ({
        entryId,
        lastAccessedAt,
      })
    )
    
    const storageKey = userId ? getUserStorageKey(userId, STORAGE_KEY) : STORAGE_KEY
    secureStorage.setItem(storageKey, JSON.stringify(accessTimeArray))
  } catch (error) {
    console.warn('Failed to save entry access times to encrypted localStorage:', error)
  }
}

/**
 * Record that an entry was accessed at the current time
 */
export function recordEntryAccess(entryId: string, userId?: string): void {
  const accessTimes = getStoredAccessTimes(userId)
  accessTimes[entryId] = new Date().toISOString()
  saveAccessTimes(accessTimes, userId)
}

/**
 * Get the last accessed time for a specific entry
 */
export function getEntryLastAccessed(entryId: string, userId?: string): Date | null {
  const accessTimes = getStoredAccessTimes(userId)
  const lastAccessedStr = accessTimes[entryId]
  
  if (!lastAccessedStr) return null
  
  try {
    return new Date(lastAccessedStr)
  } catch (error) {
    console.warn(`Invalid date format for entry ${entryId}:`, lastAccessedStr)
    return null
  }
}

/**
 * Get all access times as a map of entryId -> Date
 */
export function getAllAccessTimes(): Record<string, Date> {
  const accessTimes = getStoredAccessTimes()
  const result: Record<string, Date> = {}
  
  Object.entries(accessTimes).forEach(([entryId, lastAccessedStr]) => {
    try {
      result[entryId] = new Date(lastAccessedStr)
    } catch (error) {
      console.warn(`Invalid date format for entry ${entryId}:`, lastAccessedStr)
    }
  })
  
  return result
}

/**
 * Clean up old access times (older than 90 days) to prevent localStorage bloat
 */
export function cleanupOldAccessTimes(): void {
  const accessTimes = getStoredAccessTimes()
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  
  const cleanedAccessTimes: Record<string, string> = {}
  
  Object.entries(accessTimes).forEach(([entryId, lastAccessedStr]) => {
    try {
      const lastAccessed = new Date(lastAccessedStr)
      if (lastAccessed > ninetyDaysAgo) {
        cleanedAccessTimes[entryId] = lastAccessedStr
      }
    } catch (error) {
      // Skip invalid dates
    }
  })
  
  saveAccessTimes(cleanedAccessTimes)
}

/**
 * Remove access time for a specific entry (useful when entry is deleted)
 */
export function removeEntryAccess(entryId: string): void {
  const accessTimes = getStoredAccessTimes()
  delete accessTimes[entryId]
  saveAccessTimes(accessTimes)
}
