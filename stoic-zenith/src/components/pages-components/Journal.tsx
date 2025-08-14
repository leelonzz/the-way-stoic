import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'
import { toast } from '@/components/ui/use-toast'
import { EntryList } from '@/components/journal/EntryList'
import { JournalCalendarView } from '@/components/journal/JournalCalendarView'
import { ViewToggle, ViewMode } from '@/components/journal/ViewToggle'
import { JournalEntry } from '@/components/journal/types'
import { supabase } from '@/integrations/supabase/client'
import { JournalSkeleton } from '@/components/journal/JournalSkeleton'
import { useCachedJournal } from '@/hooks/useCachedJournal'

// Lazy load the heavy JournalNavigation component (rich text editor)
const JournalNavigation = lazy(() =>
  import('@/components/journal/JournalNavigation').then(module => ({
    default: module.JournalNavigation,
  }))
)
import {
  recordEntryAccess,
  cleanupOldAccessTimes,
  removeEntryAccess,
} from '@/lib/entryAccessTracker'

export default function Journal(): JSX.Element {
  try {
    // View state management
    const [viewMode, setViewMode] = useState<ViewMode>('list')

    // Use cache-aware journal hook
    const {
      entries,
      selectedEntry,
      loading: isLoadingEntries,
      error: entriesError,
      syncStatus,
      handleSelectEntry: selectEntry,
      handleCreateEntry: createEntry,
      handleDeleteEntry: deleteEntry,
      handleUpdateEntry: updateEntry,
      handleUpdateEntryWithIdChange: updateEntryWithIdChange,
      handleRetrySync: retrySync,
      clearSelection,
      journalManager,
      isCreatingEntry, // Use the isCreatingEntry from the hook
    } = useCachedJournal(viewMode)

  // Legacy state for compatibility
  const [userId, setUserId] = useState<string | null>(null)
  const lastCreateTimeRef = useRef<number>(0)

  // Handle view mode changes with selection clearing
  const handleViewModeChange = useCallback((newViewMode: ViewMode) => {
    setViewMode(newViewMode)
    // Clear selection when switching to calendar view
    if (newViewMode === 'calendar') {
      clearSelection()
    }
  }, [clearSelection])

  // Wrapper functions for compatibility with existing code
  const handleSelectEntryWrapper = useCallback(
    (entry: JournalEntry) => {
      selectEntry(entry)
      recordEntryAccess(entry.id)
    },
    [selectEntry]
  )

  const handleCreateEntryWrapper = useCallback(() => {
    const now = Date.now()
    if (now - lastCreateTimeRef.current < 1000) return // Prevent double-clicks

    lastCreateTimeRef.current = now
    createEntry() // The hook manages its own isCreatingEntry state
  }, [createEntry])

  const handleDeleteEntryWrapper = useCallback(
    async (entryId: string) => {
      try {
        await deleteEntry(entryId)
        removeEntryAccess(entryId)
        toast({
          title: 'Entry deleted',
          description: 'The journal entry has been deleted successfully.',
        })
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to delete entry. Please try again.',
          variant: 'destructive',
        })
      }
    },
    [deleteEntry]
  )

  const handleRetrySyncWrapper = useCallback(async () => {
    try {
      await retrySync()
      toast({
        title: 'Sync completed',
        description: 'Your journal has been synchronized successfully.',
      })
    } catch {
      toast({
        title: 'Sync failed',
        description: 'Failed to sync journal. Please check your connection.',
        variant: 'destructive',
      })
    }
  }, [retrySync])
  // Initialize user context for legacy compatibility
  useEffect((): void => {
    const initializeUser = async (): Promise<void> => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          setUserId(user.id)
          // Clean up old access times to prevent localStorage bloat
          cleanupOldAccessTimes()
        }
      } catch (error) {
        console.error('Failed to initialize user:', error)
      }
    }

    initializeUser()
  }, [])

  // Listen for auth changes for legacy compatibility
  useEffect((): (() => void) => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const newUserId = session?.user?.id || null
      if (newUserId !== userId) {
        setUserId(newUserId)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  // Handle entry update using cache-aware hook to update UI instantly
  const handleEntryUpdate = useCallback(
    async (updatedEntry: JournalEntry): Promise<void> => {
      try {
        await updateEntry(updatedEntry.id, updatedEntry.blocks)
      } catch (error) {
        console.error('Failed to update entry:', error)
      }
    },
    [updateEntry]
  )

  // Show loading state while entries are loading
  if (isLoadingEntries) {
    return <JournalSkeleton />
  }

  // Show error state if there's an error
  if (entriesError) {
    return (
      <div className="h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <p className="text-stone-600 mb-4">Failed to load journal entries</p>
          <button
            onClick={handleRetrySyncWrapper}
            className="px-4 py-2 bg-stone-800 text-white rounded hover:bg-stone-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Performance tracking removed to fix loading issues

  return (
    <div className="h-screen flex bg-stone-50">
      {/* Entry List/Calendar Sidebar */}
      <div className="w-80 border-r border-stone-200 bg-white flex flex-col h-full">
        {/* Header with View Toggle */}
        <div className="flex-shrink-0 p-4 border-b border-stone-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-stone-800">Journal</h2>
            <ViewToggle
              currentView={viewMode}
              onViewChange={handleViewModeChange}
            />
          </div>
        </div>

        {/* Conditional View Rendering */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'list' ? (
            <EntryList
              entries={entries || []}
              selectedEntry={selectedEntry}
              onSelectEntry={handleSelectEntryWrapper}
              onCreateEntry={handleCreateEntryWrapper}
              onDeleteEntry={handleDeleteEntryWrapper}
              onEntriesChange={() => {}} // No-op since entries are managed by cache-aware hook
              syncStatus={syncStatus === 'syncing' ? 'pending' : syncStatus}
              onRetrySync={handleRetrySyncWrapper}
              journalManager={journalManager}
              showDeleteButton={false}
              className="h-full"
            />
          ) : (
            <JournalCalendarView
              entries={entries || []}
              selectedEntry={selectedEntry}
              onSelectEntry={handleSelectEntryWrapper}
              onDeleteEntry={handleDeleteEntryWrapper}
              showDeleteButton={false}
              className="h-full"
            />
          )}
        </div>
      </div>

      {/* Journal Editor */}
      <div className="flex-1 flex flex-col bg-white h-full">
        {selectedEntry ? (
          <Suspense
            fallback={
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800"></div>
              </div>
            }
          >
            <JournalNavigation
              entry={selectedEntry}
              onEntryUpdate={handleEntryUpdate}
              onUpdateEntryWithIdChange={updateEntryWithIdChange}
              onCreateEntry={handleCreateEntryWrapper}
              onDeleteEntry={handleDeleteEntryWrapper}
              syncStatus={syncStatus === 'syncing' ? 'pending' : syncStatus}
              journalManager={journalManager}
            />
          </Suspense>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-stone-700 mb-2">
                {(!entries || entries.length === 0)
                  ? "Start writing your thoughts..."
                  : "Choose entry and it will show here"
                }
              </h2>
            </div>
          </div>
        )}
      </div>
    </div>
  )
  } catch (error) {
    console.error('🚨 Journal component error:', error)
    throw error // Re-throw to trigger error boundary
  }
}
