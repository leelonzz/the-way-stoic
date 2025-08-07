'use client'

import { useMemo } from 'react'
import { useNavigationCachedQuery } from './useCacheAwareQuery'
import { getJournalManager } from '@/lib/journal'
import type { JournalEntry } from '@/components/journal/types'
import { useAuthContext } from '@/components/auth/AuthProvider'

export interface JournalStats {
  totalEntries: number
  currentStreak: number
  longestStreak: number
  lastEntryDate: string | null
  weeklyProgress: boolean[]
}

/**
 * Cache-aware journal stats hook that respects page navigation cache
 */
export function useCachedJournalStats() {
  const { user } = useAuthContext()

  // Use cache-aware query for journal entries
  const entriesQuery = useNavigationCachedQuery(
    ['journal-entries', user?.id || 'anonymous'],
    async (): Promise<JournalEntry[]> => {
      if (!user?.id) return []
      
      const manager = getJournalManager(user.id)
      const entries = await manager.getAllEntries()
      
      return entries
    },
    {
      enabled: !!user?.id,
      cacheThreshold: 5 * 60 * 1000, // 5 minutes cache for journal stats
      staleTime: 10 * 60 * 1000, // 10 minutes stale time
      gcTime: 20 * 60 * 1000, // 20 minutes garbage collection
    }
  )

  // Calculate stats from entries
  const stats = useMemo((): JournalStats => {
    const entries = entriesQuery.data || []
    
    if (entries.length === 0) {
      return {
        totalEntries: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastEntryDate: null,
        weeklyProgress: [false, false, false, false, false, false, false],
      }
    }

    // Calculate current streak
    const calculateCurrentStreak = (entries: JournalEntry[]): number => {
      if (entries.length === 0) return 0

      // Sort entries by date in descending order (most recent first)
      const sortedEntries = [...entries].sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        return dateB.getTime() - dateA.getTime()
      })

      // Get unique dates (one entry per day counts)
      const uniqueDates = new Set<string>()
      sortedEntries.forEach(entry => {
        const dateStr = entry.date.split('T')[0] // Get YYYY-MM-DD part
        uniqueDates.add(dateStr)
      })

      // Convert to sorted array of dates
      const datesArray = Array.from(uniqueDates).sort((a, b) => {
        return new Date(b).getTime() - new Date(a).getTime()
      })

      if (datesArray.length === 0) return 0

      // Check if streak is current (includes today or yesterday)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      const todayStr = today.toISOString().split('T')[0]
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      
      const mostRecentDate = datesArray[0]
      
      // If most recent entry is not today or yesterday, streak is broken
      if (mostRecentDate !== todayStr && mostRecentDate !== yesterdayStr) {
        return 0
      }

      // Count consecutive days
      let streak = 1
      let currentDate = new Date(mostRecentDate)
      
      for (let i = 1; i < datesArray.length; i++) {
        const expectedDate = new Date(currentDate)
        expectedDate.setDate(expectedDate.getDate() - 1)
        const expectedDateStr = expectedDate.toISOString().split('T')[0]
        
        if (datesArray[i] === expectedDateStr) {
          streak++
          currentDate = expectedDate
        } else {
          break
        }
      }

      return streak
    }

    // Calculate longest streak
    const calculateLongestStreak = (entries: JournalEntry[]): number => {
      if (entries.length === 0) return 0

      // Get unique dates
      const uniqueDates = new Set<string>()
      entries.forEach(entry => {
        const dateStr = entry.date.split('T')[0]
        uniqueDates.add(dateStr)
      })

      const datesArray = Array.from(uniqueDates).sort((a, b) => {
        return new Date(a).getTime() - new Date(b).getTime()
      })

      if (datesArray.length === 0) return 0

      let longestStreak = 1
      let currentStreak = 1
      let currentDate = new Date(datesArray[0])

      for (let i = 1; i < datesArray.length; i++) {
        const nextDate = new Date(datesArray[i])
        const expectedDate = new Date(currentDate)
        expectedDate.setDate(expectedDate.getDate() + 1)

        if (nextDate.getTime() === expectedDate.getTime()) {
          currentStreak++
          longestStreak = Math.max(longestStreak, currentStreak)
        } else {
          currentStreak = 1
        }
        currentDate = nextDate
      }

      return longestStreak
    }

    // Calculate weekly progress (last 7 days)
    const calculateWeeklyProgress = (entries: JournalEntry[]): boolean[] => {
      const today = new Date()
      const weeklyProgress: boolean[] = []

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const hasEntry = entries.some(entry => 
          entry.date.split('T')[0] === dateStr
        )
        weeklyProgress.push(hasEntry)
      }

      return weeklyProgress
    }

    const currentStreak = calculateCurrentStreak(entries)
    const longestStreak = calculateLongestStreak(entries)
    const weeklyProgress = calculateWeeklyProgress(entries)
    
    // Get last entry date
    const sortedEntries = [...entries].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
    const lastEntryDate = sortedEntries.length > 0 ? sortedEntries[0].date : null

    return {
      totalEntries: entries.length,
      currentStreak,
      longestStreak,
      lastEntryDate,
      weeklyProgress,
    }
  }, [entriesQuery.data])

  return {
    stats,
    loading: entriesQuery.isLoading && !entriesQuery.data, // Don't show loading if we have cached data
    error: entriesQuery.error?.message || null,
    isRefetching: entriesQuery.isFetching && !!entriesQuery.data,
    isCached: !entriesQuery.isLoading && !!entriesQuery.data,
    refetch: entriesQuery.refetch,
  }
}
