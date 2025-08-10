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
  const { user } = useAuthContext()
  const queryClient = useQueryClient()
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'synced' | 'error'>('synced')
  const [isCreatingEntry, setIsCreatingEntry] = useState(false)

  // Track the last known entry ID to detect when it changes during sync
  const [lastSelectedEntryId, setLastSelectedEntryId] = useState<string | null>(null)


  // Cache-aware query for journal entries
  const entriesQuery = useNavigationCachedQuery(
    ['journal-entries', user?.id || 'anonymous'],
    async (): Promise<JournalEntry[]> => {
      if (!user?.id) {
        return []
      }
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
              // Force sync from database first
              await manager.retryAuthSync()
              
              // Get all entries (this will include database sync)
              const rawEntries = await manager.getAllEntries()
              
              setSyncStatus('synced')
              return rawEntries
            },
            {
              maxRetries: 2,
              shouldRetry: (error: unknown) => {
                // Don't retry on auth errors
                const errorMessage = error instanceof Error ? error.message : String(error)
                if (errorMessage?.includes('401') || 
                    errorMessage?.includes('403') ||
                    errorMessage?.includes('unauthorized')) {
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
        
        if (timeoutId) {
          clearTimeout(timeoutId)
        }

        setSyncStatus('error')

        // Fallback to local data if sync fails
        try {
          const rawEntries = await manager.getAllEntries()
          return rawEntries
        } catch (fallbackError) {
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

  // Auto-select entry when entries load (but not during entry creation)
  useEffect(() => {
    // Don't auto-select if:
    // 1. We already have a selected entry that still exists in the entries list
    // 2. We're in the middle of creating an entry
    // 3. There are no entries to select from
    if (isCreatingEntry || entriesWithAccessTimes.length === 0) {
      return
    }

    // Check if current selected entry still exists in the entries list
    const selectedEntryStillExists = selectedEntry &&
      entriesWithAccessTimes.some(entry => entry.id === selectedEntry.id)

    // If we have a valid selected entry that still exists, don't change it
    if (selectedEntryStillExists) {
      return
    }

    // Only auto-select if we don't have a valid selection
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
      recordEntryAccess(entryToSelect.id)
    }
  }, [entriesWithAccessTimes, selectedEntry, isCreatingEntry])

  // Handle entry ID changes during sync (temp ID -> permanent ID)
  useEffect(() => {
    if (!selectedEntry || !lastSelectedEntryId) {
      // Update tracking when selection changes
      if (selectedEntry?.id !== lastSelectedEntryId) {
        setLastSelectedEntryId(selectedEntry?.id || null)
      }
      return
    }

    // Check if the selected entry ID has changed (temp -> permanent)
    const currentEntryWithSameId = entriesWithAccessTimes.find(entry => entry.id === selectedEntry.id)

    if (!currentEntryWithSameId && selectedEntry.id.startsWith('temp-')) {
      // The temp entry is gone, try to find the permanent entry with similar content
      const permanentEntry = entriesWithAccessTimes.find(entry => {
        // Match by creation date (within 1 minute) and similar content
        const timeDiff = Math.abs(new Date(entry.createdAt).getTime() - new Date(selectedEntry.createdAt).getTime())
        const isSimilarTime = timeDiff < 60000 // 1 minute
        const hasSimilarContent = entry.blocks.length === selectedEntry.blocks.length

        // Also check first block content if it exists
        const firstBlockMatches = entry.blocks[0]?.text === selectedEntry.blocks[0]?.text

        return isSimilarTime && hasSimilarContent && firstBlockMatches && !entry.id.startsWith('temp-')
      })

      if (permanentEntry) {
        setSelectedEntry(permanentEntry)
        recordEntryAccess(permanentEntry.id)
      }
    }

    // Update tracking
    setLastSelectedEntryId(selectedEntry.id)
  }, [entriesWithAccessTimes, selectedEntry, lastSelectedEntryId])

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

  // Create new entry function - Simplified and reliable
  const handleCreateEntry = () => {
    if (!user?.id || isCreatingEntry) return

    setIsCreatingEntry(true)

    try {
      const manager = getJournalManager(user.id)
      const dateString = new Date().toISOString()
      const newEntry = manager.createEntryImmediately(dateString, 'general')

      // Record access time
      recordEntryAccess(newEntry.id)

      // Update entries list immediately
      const currentEntries = entriesQuery.data || []
      queryClient.setQueryData(['journal-entries', user.id], [newEntry, ...currentEntries])

      // Select the new entry
      setSelectedEntry(newEntry)
      setIsCreatingEntry(false)

    } catch (error) {
      console.error('Failed to create entry:', error)
      setIsCreatingEntry(false)
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

  // Enhanced update handler that can handle ID changes
  const handleUpdateEntryWithIdChange = async (entryId: string, blocks: JournalBlock[], onIdChange?: (newId: string) => void) => {
    if (!user?.id) return

    try {
      const manager = getJournalManager(user.id)
      const existingEntry = manager.getFromLocalStorage(entryId)

      if (!existingEntry) {
        return
      }

      // Register for ID change notifications if callback provided
      if (onIdChange && entryId.startsWith('temp')) {
        manager.registerEntryIdChangeListener(entryId, onIdChange)
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
    isCreatingEntry, // Export the creation state

    // Actions
    handleSelectEntry,
    handleCreateEntry,
    handleDeleteEntry,
    handleUpdateEntry,
    handleUpdateEntryWithIdChange,
    handleRetrySync,
    setEntries: () => {}, // Placeholder for compatibility

    // Journal manager for compatibility
    journalManager: getJournalManager(user?.id || null),
  }
}
