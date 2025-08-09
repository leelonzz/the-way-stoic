'use client'

import { useState, useEffect, useMemo } from 'react'
import { useNavigationCachedQuery } from './useCacheAwareQuery'
import { getJournalManager } from '@/lib/journal'
import type { JournalEntry, JournalBlock } from '@/components/journal/types'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/use-toast'
import { getTimeouts, exponentialBackoff } from '@/lib/environment'

/**
 * Cache-aware journal hook that prevents redundant database calls
 * when navigating to cached journal pages
 */
export function useCachedJournal() {
  console.log('🔍 useCachedJournal hook initializing...')

  const { user } = useAuthContext()
  const queryClient = useQueryClient()
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'synced' | 'error'>('synced')

  console.log('👤 User context:', { userId: user?.id, userEmail: user?.email })

  // Cache-aware query for journal entries
  const entriesQuery = useNavigationCachedQuery(
    ['journal-entries', user?.id || 'anonymous'],
    async (): Promise<JournalEntry[]> => {
      console.log('📡 Journal query function executing...', { userId: user?.id })

      if (!user?.id) {
        console.log('⚠️ No user ID, returning empty entries')
        return []
      }

      console.log('🔧 Getting journal manager for user:', user.id)
      const manager = getJournalManager(user.id)

      // FORCE SYNC: Always sync from database first when user authenticates
      // This ensures entries persist after clearing site data
      setSyncStatus('syncing')

      const timeouts = getTimeouts()
      let timeoutId: NodeJS.Timeout | null = null

      try {
        // Use exponential backoff for production resilience
        const syncWithRetry = async () => {
          return exponentialBackoff(
            async () => {
              console.log('🔄 Starting journal sync...')
              // Force sync from database first
              await manager.retryAuthSync()
              
              console.log('📚 Getting all entries...')
              // Get all entries (this will include database sync)
              const rawEntries = await manager.getAllEntries()
              
              console.log('✅ Sync successful, entries:', rawEntries.length)
              setSyncStatus('synced')
              return rawEntries
            },
            {
              maxRetries: 2,
              shouldRetry: (error) => {
                // Don't retry on auth errors
                if (error?.message?.includes('401') || 
                    error?.message?.includes('403') ||
                    error?.message?.includes('unauthorized')) {
                  return false
                }
                // Retry on network/timeout errors
                return true
              }
            }
          )
        }

        // Add timeout as safeguard
        const syncPromise = new Promise<JournalEntry[]>((resolve, reject) => {
          timeoutId = setTimeout(() => {
            console.warn('⏱️ Journal sync timeout - using local data')
            // Don't reject, resolve with local data
            manager.getAllEntries()
              .then(entries => {
                setSyncStatus('error')
                resolve(entries)
              })
              .catch(() => resolve([]))
          }, timeouts.journalSync)

          syncWithRetry()
            .then(entries => {
              if (timeoutId) {
                clearTimeout(timeoutId)
                timeoutId = null
              }
              resolve(entries)
            })
            .catch(error => {
              if (timeoutId) {
                clearTimeout(timeoutId)
                timeoutId = null
              }
              console.error('❌ Journal sync failed after retries:', error)
              // Try local fallback
              manager.getAllEntries()
                .then(entries => {
                  setSyncStatus('error')
                  resolve(entries)
                })
                .catch(() => resolve([]))
            })
        })

        return await syncPromise
      } catch (error) {
        console.error('❌ [CachedJournal] Database sync failed:', error)
        
        if (timeoutId) {
          clearTimeout(timeoutId)
        }

        setSyncStatus('error')

        // Fallback to local data if sync fails
        try {
          console.log('🔄 Attempting local fallback...')
          const rawEntries = await manager.getAllEntries()
          console.log('⚠️ [CachedJournal] Using local data after sync failure:', rawEntries.length, 'entries')
          return rawEntries
        } catch (fallbackError) {
          console.error('❌ [CachedJournal] Local fallback also failed:', fallbackError)
          return []
        }
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      }
    },
    {
      enabled: !!user?.id,
      cacheThreshold: 2 * 60 * 1000, // 2 minutes cache for journal
      staleTime: 5 * 60 * 1000, // 5 minutes stale time
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
      retry: (failureCount, error) => {
        console.error('❌ [CachedJournal] Query failed:', error)
        // Don't retry on auth failures
        if (error && typeof error === 'object' && 'message' in error) {
          const message = error.message as string
          if (message.includes('401') || 
              message.includes('403') || 
              message.includes('unauthorized') || 
              message.includes('invalid')) {
            return false
          }
        }
        // Allow retry for network/timeout errors
        return failureCount < 3
      },
      // Add refetch on auth state change
      refetchOnMount: 'always',
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

  // Create new entry function - INSTANT (0ms) - FIXED: Ensure localStorage before selection
  const handleCreateEntry = () => {
    if (!user?.id) return
    
    try {
      const manager = getJournalManager(user.id)
      // Use date-only format to prevent multiple entries on same day
      const dateString = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      const newEntry = manager.createEntryImmediately(dateString, 'general')
      
      // CRITICAL: Verify entry exists in localStorage before proceeding
      const verifyEntry = manager.getFromLocalStorage(newEntry.id)
      if (!verifyEntry) {
        console.error(`🚨 Entry not found in localStorage after creation: ${newEntry.id}`)
        throw new Error('Entry creation failed - not persisted to localStorage')
      }
      
      // Optimistically update the entries list immediately (0ms)
      const currentEntries = entriesQuery.data || []
      queryClient.setQueryData(['journal-entries', user.id], [newEntry, ...currentEntries])
      
      // Select the new entry only after localStorage verification
      setSelectedEntry(newEntry)
      recordEntryAccess(newEntry.id)
      
      console.log(`✅ Entry created and selected: ${newEntry.id}`)
      
      // Background refetch (non-blocking)
      entriesQuery.refetch()
      
    } catch (error) {
      console.error('Failed to create entry:', error)
      toast({
        title: "Entry creation failed",
        description: "Failed to create new entry. Please try again.",
        variant: "destructive",
      })
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
      
      // Delete from storage and database - AWAIT to ensure persistence
      const manager = getJournalManager(user.id)
      await manager.deleteEntryImmediately(entryId)
      
      // Note: No immediate refetch needed - optimistic update already removed entry from UI
      // Deleted entries list will prevent reappearing during future syncs
      console.log(`✅ Entry ${entryId} deleted successfully - no refetch needed`)
    } catch (error) {
      console.error('Failed to delete entry:', error)
      toast({
        title: "Delete failed",
        description: "Failed to delete entry. Please try again.",
        variant: "destructive",
      })
      // Restore entries on error
      entriesQuery.refetch()
    }
  }

  // Update entry function - REAL-TIME SYNC
  const handleUpdateEntry = async (entryId: string, blocks: JournalBlock[]) => {
    if (!user?.id) return
    
    try {
      // Check if entry exists before trying to update
      const manager = getJournalManager(user.id)
      const existingEntry = manager.getFromLocalStorage(entryId)
      
      if (!existingEntry) {
        console.warn(`⚠️ Cannot update entry ${entryId} - entry not found in localStorage. Skipping update.`)
        return
      }
      
      // Update in localStorage via journal manager
      await manager.updateEntryImmediately(entryId, blocks)
      
      // Update React Query cache immediately for real-time UI update
      const currentEntries = entriesQuery.data || []
      const updatedEntry = {
        ...currentEntries.find(e => e.id === entryId),
        id: entryId,
        blocks,
        updatedAt: new Date()
      } as JournalEntry
      
      const updatedEntries = currentEntries.map(entry => 
        entry.id === entryId ? updatedEntry : entry
      )
      
      // Update the cache instantly with structural change to trigger re-render
      queryClient.setQueryData(['journal-entries', user.id], [...updatedEntries])
      
      // Also update selectedEntry if it's the one being edited
      if (selectedEntry?.id === entryId) {
        setSelectedEntry(updatedEntry)
        setSelectedEntry({
          ...selectedEntry,
          blocks,
          updatedAt: new Date()
        })
      }
    } catch (error) {
      console.error('Failed to update entry:', error)
      toast({
        title: "Save failed",
        description: "Failed to save changes. Your content is preserved locally.",
        variant: "destructive",
      })
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
    handleUpdateEntry,
    handleRetrySync,
    setEntries: () => {}, // Placeholder for compatibility
    
    // Journal manager for compatibility
    journalManager: getJournalManager(user?.id || null),
  }
}
