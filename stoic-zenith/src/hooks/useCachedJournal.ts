'use client'

import { useState, useEffect, useMemo } from 'react'
import { useNavigationCachedQuery } from './useCacheAwareQuery'
import { getJournalManager } from '@/lib/journal'
import type { JournalEntry } from '@/components/journal/types'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { useQueryClient } from '@tanstack/react-query'

/**
 * Cache-aware journal hook that prevents redundant database calls
 * when navigating to cached journal pages
 */
export function useCachedJournal() {
  const { user } = useAuthContext()
  const queryClient = useQueryClient()
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'synced' | 'error'>('synced')

  // Cache-aware query for journal entries
  const entriesQuery = useNavigationCachedQuery(
    ['journal-entries', user?.id || 'anonymous'],
    async (): Promise<JournalEntry[]> => {
      if (!user?.id) return []
      
      console.log('🔄 [CachedJournal] Loading entries from database for user:', user.id)
      
      const manager = getJournalManager(user.id)
      
      // Try to get cached entries first
      const syncStatus = manager.getSyncStatus()
      const hasLocalData = manager.entryExists('') // Check if localStorage has data
      
      if (hasLocalData || syncStatus.pending > 0) {
        console.log('📦 [CachedJournal] Found local data, loading from cache first')
        const rawEntries = await manager.getAllEntries()
        
        if (rawEntries.length > 0) {
          console.log('✅ [CachedJournal] Loaded', rawEntries.length, 'entries from cache')
          
          // Background sync if online (non-blocking)
          if (user.id && syncStatus.isOnline) {
            setTimeout(async () => {
              try {
                await manager.forcSync()
                console.log('🔄 [CachedJournal] Background sync completed')
              } catch (error) {
                console.warn('⚠️ [CachedJournal] Background sync failed:', error)
              }
            }, 100)
          }
          
          return rawEntries
        }
      }
      
      // No local data, must load from database
      console.log('🌐 [CachedJournal] No local data, loading from database')
      const rawEntries = await manager.getAllEntries()
      console.log('✅ [CachedJournal] Loaded', rawEntries.length, 'entries from database')
      
      return rawEntries
    },
    {
      enabled: !!user?.id,
      cacheThreshold: 2 * 60 * 1000, // 2 minutes cache for journal
      staleTime: 5 * 60 * 1000, // 5 minutes stale time
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
      retry: (failureCount, error) => {
        console.error('❌ [CachedJournal] Query failed:', error)
        return failureCount < 2
      },
    }
  )

  // Get entries with access times
  const entriesWithAccessTimes = useMemo(() => {
    const entries = entriesQuery.data || []
    
    // Get access times from localStorage
    const getAllAccessTimes = (): Record<string, Date> => {
      if (typeof window === 'undefined') return {}
      
      try {
        const stored = localStorage.getItem('journal-entry-access-times')
        if (!stored) return {}
        
        const parsed = JSON.parse(stored)
        const result: Record<string, Date> = {}
        
        for (const [id, timestamp] of Object.entries(parsed)) {
          if (typeof timestamp === 'number') {
            result[id] = new Date(timestamp)
          }
        }
        
        return result
      } catch {
        return {}
      }
    }

    const accessTimes = getAllAccessTimes()
    
    return entries.map(entry => ({
      ...entry,
      lastAccessedAt: accessTimes[entry.id] || null
    }))
  }, [entriesQuery.data])

  // Auto-select entry when entries load
  useEffect(() => {
    if (!selectedEntry && entriesWithAccessTimes.length > 0) {
      const entriesWithAccess = entriesWithAccessTimes.filter(entry => entry.lastAccessedAt)
      
      let entryToSelect: typeof entriesWithAccessTimes[0] | undefined
      
      if (entriesWithAccess.length > 0) {
        // Select most recently accessed entry
        entryToSelect = entriesWithAccess.sort((a, b) => {
          const timeA = a.lastAccessedAt?.getTime() || 0
          const timeB = b.lastAccessedAt?.getTime() || 0
          return timeB - timeA
        })[0]
      } else {
        // Select most recently created entry
        entryToSelect = [...entriesWithAccessTimes].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })[0]
      }
      
      if (entryToSelect) {
        setSelectedEntry(entryToSelect)
        // Record access
        recordEntryAccess(entryToSelect.id)
      }
    }
  }, [entriesWithAccessTimes, selectedEntry])

  // Record entry access function
  const recordEntryAccess = (entryId: string) => {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem('journal-entry-access-times')
      const accessTimes = stored ? JSON.parse(stored) : {}
      accessTimes[entryId] = Date.now()
      localStorage.setItem('journal-entry-access-times', JSON.stringify(accessTimes))
    } catch (error) {
      console.warn('Failed to record entry access:', error)
    }
  }

  // Handle entry selection
  const handleSelectEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry)
    recordEntryAccess(entry.id)
  }

  // Create new entry function - INSTANT (0ms)
  const handleCreateEntry = async () => {
    if (!user?.id) return
    
    try {
      const manager = getJournalManager(user.id)
      // Use full ISO timestamp to allow multiple entries per day
      const dateString = new Date().toISOString()
      const newEntry = await manager.createEntryImmediately(dateString, 'general')
      
      if (newEntry) {
        // Optimistically update the entries list immediately (0ms)
        const currentEntries = entriesQuery.data || []
        queryClient.setQueryData(['journal-entries', user.id], [newEntry, ...currentEntries])
        
        // Select the new entry immediately
        setSelectedEntry(newEntry)
        recordEntryAccess(newEntry.id)
        
        // Background refetch (non-blocking)
        entriesQuery.refetch()
      }
    } catch (error) {
      console.error('Failed to create entry:', error)
    }
  }

  // Delete entry function - INSTANT (0ms)
  const handleDeleteEntry = async (entryId: string) => {
    if (!user?.id) return
    
    try {
      // Optimistically remove from UI immediately (0ms)
      const currentEntries = entriesQuery.data || []
      const updatedEntries = currentEntries.filter(e => e.id !== entryId)
      queryClient.setQueryData(['journal-entries', user.id], updatedEntries)
      
      // Clear selection if deleted entry was selected
      if (selectedEntry?.id === entryId) {
        setSelectedEntry(null)
      }
      
      // Delete from storage and database in background
      const manager = getJournalManager(user.id)
      manager.deleteEntryImmediately(entryId)
      
      // Background refetch to sync with database (non-blocking)
      entriesQuery.refetch()
    } catch (error) {
      console.error('Failed to delete entry:', error)
      // Restore entries on error
      entriesQuery.refetch()
    }
  }

  // Retry sync function
  const handleRetrySync = async () => {
    if (!user?.id) return
    
    setSyncStatus('syncing')
    try {
      const manager = getJournalManager(user.id)
      await manager.forcSync()
      await entriesQuery.refetch()
      setSyncStatus('synced')
    } catch (error) {
      console.error('Sync failed:', error)
      setSyncStatus('error')
    }
  }

  return {
    entries: entriesWithAccessTimes,
    selectedEntry,
    loading: entriesQuery.isLoading && !entriesQuery.data, // Don't show loading if we have cached data
    error: entriesQuery.error?.message || null,
    syncStatus,
    isRefetching: entriesQuery.isFetching && !!entriesQuery.data,
    isCached: !entriesQuery.isLoading && !!entriesQuery.data,
    
    // Actions
    handleSelectEntry,
    handleCreateEntry,
    handleDeleteEntry,
    handleRetrySync,
    setEntries: () => {}, // Placeholder for compatibility
    
    // Journal manager for compatibility
    journalManager: getJournalManager(user?.id || null),
  }
}
