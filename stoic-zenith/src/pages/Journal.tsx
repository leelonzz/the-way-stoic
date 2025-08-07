
import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { EntryList } from '@/components/journal/EntryList';
import { JournalEntry } from '@/components/journal/types';
import { getJournalManager, RealTimeJournalManager } from '@/lib/journal';
import { supabase } from '@/integrations/supabase/client';
import { JournalSkeleton } from '@/components/journal/JournalSkeleton';
import { useCachedJournal } from '@/hooks/useCachedJournal';

// Lazy load the heavy JournalNavigation component (rich text editor)
const JournalNavigation = lazy(() =>
  import('@/components/journal/JournalNavigation').then(module => ({
    default: module.JournalNavigation
  }))
);
import {
  recordEntryAccess,
  getAllAccessTimes,
  cleanupOldAccessTimes,
  removeEntryAccess
} from '@/lib/entryAccessTracker';

export default function Journal(): JSX.Element {
  // Use cache-aware journal hook
  const {
    entries,
    selectedEntry,
    loading: isLoadingEntries,
    error: entriesError,
    syncStatus,
    isRefetching,
    isCached,
    handleSelectEntry: selectEntry,
    handleCreateEntry: createEntry,
    handleDeleteEntry: deleteEntry,
    handleRetrySync: retrySync,
    journalManager
  } = useCachedJournal();

  // Legacy state for compatibility
  const [isCreatingEntry, setIsCreatingEntry] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [lastCreateTime, setLastCreateTime] = useState<number>(0);

  // Wrapper functions for compatibility with existing code
  const handleSelectEntryWrapper = useCallback((entry: JournalEntry) => {
    selectEntry(entry);
    recordEntryAccess(entry.id);
  }, [selectEntry]);

  const handleCreateEntryWrapper = useCallback(async () => {
    const now = Date.now();
    if (now - lastCreateTime < 1000) return; // Prevent double-clicks

    setIsCreatingEntry(true);
    setLastCreateTime(now);

    try {
      await createEntry();
    } finally {
      setIsCreatingEntry(false);
    }
  }, [createEntry, lastCreateTime]);

  const handleDeleteEntryWrapper = useCallback(async (entryId: string) => {
    try {
      await deleteEntry(entryId);
      removeEntryAccess(entryId);
      toast({
        title: "Entry deleted",
        description: "The journal entry has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete entry. Please try again.",
        variant: "destructive",
      });
    }
  }, [deleteEntry]);

  const handleRetrySyncWrapper = useCallback(async () => {
    try {
      await retrySync();
      toast({
        title: "Sync completed",
        description: "Your journal has been synchronized successfully.",
      });
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Failed to sync journal. Please check your connection.",
        variant: "destructive",
      });
    }
  }, [retrySync]);
  // Initialize user context for legacy compatibility
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          // Clean up old access times to prevent localStorage bloat
          cleanupOldAccessTimes();
        }
      } catch (error) {
        console.error('Failed to initialize user:', error);
      }
    };

    initializeUser();
  }, []);

  // Listen for auth changes for legacy compatibility
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const newUserId = session?.user?.id || null;
      if (newUserId !== userId) {
        setUserId(newUserId);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  // Handle entry update for compatibility
  const handleEntryUpdate = useCallback(async (updatedEntry: JournalEntry): Promise<void> => {
    try {
      // Update using journal manager
      await journalManager.updateEntryImmediately(updatedEntry.id, updatedEntry.blocks);
    } catch (error) {
      console.error('Failed to update entry:', error);
    }
  }, [journalManager]);

  // Show loading state while entries are loading
  if (isLoadingEntries) {
    return <JournalSkeleton />;
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
    );
  }

  // Performance tracking removed to fix loading issues

  return (
    <div className="h-screen flex bg-stone-50">
      {/* Entry List Sidebar */}
      <div className="w-80 border-r border-stone-200 bg-white flex flex-col h-full">
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
        />
      </div>

      {/* Journal Editor */}
      <div className="flex-1 flex flex-col bg-white h-full">
        {selectedEntry ? (
          <Suspense fallback={
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800"></div>
            </div>
          }>
            <JournalNavigation
              entry={selectedEntry}
              onEntryUpdate={handleEntryUpdate}
              onCreateEntry={handleCreateEntryWrapper}
              onDeleteEntry={handleDeleteEntryWrapper}
              syncStatus={syncStatus === 'syncing' ? 'pending' : syncStatus}
              journalManager={journalManager}
            />
          </Suspense>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center p-8">
              <h2 className="text-2xl font-semibold text-stone-700 mb-4">
                Welcome to your Journal
              </h2>
              <p className="text-stone-600 mb-6">
                Select an entry from the sidebar or create a new one to start writing.
              </p>
              <button
                onClick={handleCreateEntryWrapper}
                disabled={isCreatingEntry}
                className="px-6 py-3 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors disabled:opacity-50"
              >
                {isCreatingEntry ? 'Creating...' : 'Create New Entry'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
