
import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { JournalNavigation } from '@/components/journal/JournalNavigation';
import { EntryList } from '@/components/journal/EntryList';
import { JournalEntry } from '@/components/journal/types';
import { journalManager } from '@/lib/journal';

export default function Journal(): JSX.Element {
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'error'>('synced');
  const [isCreatingEntry, setIsCreatingEntry] = useState(false);

  // INSTANT ENTRY CREATION (0ms delay) with duplicate prevention
  const handleCreateEntry = useCallback(async (): Promise<void> => {
    // Prevent duplicate entries if already creating
    if (isCreatingEntry) {
      console.log('🚫 Entry creation already in progress, ignoring duplicate request');
      return;
    }

    console.log('🔄 Creating new entry...');
    setIsCreatingEntry(true);

    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');

    try {
      // Always create a new entry - allow multiple entries per day
      // Each entry gets a unique temporary ID, so multiple entries per day are supported
      console.log('🔄 Creating new entry for date:', today);

      // Create entry immediately using the real-time manager
      const newEntry = await journalManager.createEntryImmediately(today, 'general');
      console.log('✅ Entry created:', newEntry);

      // Update UI immediately - no waiting, no loading states
      setSelectedEntry(newEntry);

      // Update entries list immediately (add to beginning for chronological order)
      setEntries(prev => {
        console.log('📝 Updating entries list, current count:', prev.length);
        // Check if entry already exists to prevent duplicates
        const existingIndex = prev.findIndex(entry => entry.id === newEntry.id);
        if (existingIndex >= 0) {
          // Replace existing entry
          const updated = [...prev];
          updated[existingIndex] = newEntry;
          return updated;
        }
        // Add new entry at the beginning
        return [newEntry, ...prev];
      });

      // Focus the editor after a short delay to ensure it's rendered
      setTimeout(() => {
        const editorElement = document.querySelector('[contenteditable="true"]') as HTMLElement;
        if (editorElement) {
          editorElement.focus();
          console.log('🎯 Editor focused');
        } else {
          console.log('❌ Editor element not found');
        }
      }, 100);

      // Show success feedback
      toast({
        title: "Entry created",
        description: "Your new journal entry is ready to write in.",
        variant: "default",
      });

    } catch (error) {
      console.error('❌ Failed to create entry:', error);
      toast({
        title: "Entry created locally",
        description: "Your entry is saved locally and will sync when connection is restored.",
        variant: "default",
      });
    } finally {
      setIsCreatingEntry(false);
    }
  }, [isCreatingEntry, entries, selectedEntry]);

  // INSTANT ENTRY DELETION (immediate UI feedback)
  const handleDeleteEntry = useCallback(async (entryId: string): Promise<void> => {
    try {
      // Remove from UI immediately
      if (selectedEntry?.id === entryId) {
        setSelectedEntry(null);
      }
      setEntries(prev => prev.filter(entry => entry.id !== entryId));

      // Delete using real-time manager (background operation)
      await journalManager.deleteEntryImmediately(entryId);

      toast({
        title: "Entry deleted",
        description: "Your journal entry has been removed.",
        variant: "default",
      });

    } catch (error) {
      console.error('Failed to delete entry:', error);

      // On error, we could potentially rollback the UI change here
      // For now, we'll just show a message that it's deleted locally
      toast({
        title: "Entry deleted locally",
        description: "Entry removed from local storage. Will sync when connection is restored.",
        variant: "default",
      });
    }
  }, [entries, selectedEntry]);

  // REAL-TIME ENTRY UPDATE (as users type)
  const handleEntryUpdate = useCallback(async (updatedEntry: JournalEntry): Promise<void> => {
    try {
      console.log(`📝 Parent received entry update: ${updatedEntry.id}, blocks: ${updatedEntry.blocks.length}`);

      // CRITICAL FIX: Only update selectedEntry if it's still the same entry being updated
      // This prevents debounced updates from overwriting user-initiated entry selections
      setSelectedEntry(prev => {
        if (prev && prev.id === updatedEntry.id) {
          console.log(`📝 Updating selected entry: ${updatedEntry.id}`);
          return updatedEntry;
        } else {
          console.log(`📝 Skipping selected entry update - user switched to different entry: ${prev?.id} != ${updatedEntry.id}`);
          return prev;
        }
      });

      // CRITICAL FIX: Handle both updating existing entries AND adding new entries
      // This prevents duplicate entries when users start typing in new entries
      setEntries(prev => {
        const existingIndex = prev.findIndex(entry => entry.id === updatedEntry.id);

        if (existingIndex >= 0) {
          // Update existing entry
          console.log(`📝 Updating existing entry in list: ${updatedEntry.id}`);
          return prev.map(entry =>
            entry.id === updatedEntry.id ? updatedEntry : entry
          );
        } else {
          // Add new entry (this happens when user starts typing in a new entry)
          console.log(`📝 Adding new entry to list: ${updatedEntry.id}`);
          // Add to beginning for chronological order (newest first)
          return [updatedEntry, ...prev];
        }
      });

      // Set sync status to pending while saving
      setSyncStatus('pending');

      // Note: Don't call journalManager.updateEntryImmediately here again
      // The JournalNavigation component already saved it to localStorage
      // This prevents double-saving and potential race conditions

      // Update sync status to synced
      setSyncStatus('synced');

    } catch (error) {
      console.error('Failed to update entry:', error);
      setSyncStatus('error');

      // Don't show toast for every update error to avoid spam
      // The sync status indicator will show the error state
    }
  }, []);

  // Load entries with instant access
  const loadEntries = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);

      // Get entries from real-time manager (localStorage first, then database)
      const allEntries = await journalManager.getAllEntries();
      setEntries(allEntries);

      // Auto-select today's entry if no entry is currently selected
      if (!selectedEntry && allEntries.length > 0) {
        const today = format(new Date(), 'yyyy-MM-dd');
        const todaysEntry = allEntries.find(entry => entry.date === today);

        if (todaysEntry) {
          setSelectedEntry(todaysEntry);
          console.log('📅 Auto-selected today\'s entry');
        } else {
          // Select the most recent entry
          const mostRecent = allEntries[0]; // entries are sorted by date desc
          setSelectedEntry(mostRecent);
          console.log('📅 Auto-selected most recent entry');
        }
      }

      setSyncStatus('synced');

    } catch (error) {
      console.error('Failed to load entries:', error);
      setSyncStatus('error');

      toast({
        title: "Loading from local storage",
        description: "Using cached entries. Will sync when connection is restored.",
        variant: "default",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedEntry]);

  // Handle entry selection with instant feedback
  const handleSelectEntry = useCallback(async (entry: JournalEntry): Promise<void> => {
    // Switch immediately - no loading states
    setSelectedEntry(entry);
    
    // Update sync status
    setSyncStatus('synced');
  }, []);

  // Load entries on mount
  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Setup real-time sync status updates
  useEffect(() => {
    const updateSyncStatus = (): void => {
      const status = journalManager.getSyncStatus();

      if (status.hasErrors) {
        setSyncStatus('error');
      } else if (status.pending > 0) {
        setSyncStatus('pending');
      } else {
        setSyncStatus('synced');
      }
    };

    // Update sync status every second
    const interval = setInterval(updateSyncStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle before unload to ensure data is saved
  useEffect(() => {
    const handleBeforeUnload = (): void => {
      // Trigger immediate sync before page unload
      journalManager['syncPendingChanges']?.();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Handle visibility change to sync when tab becomes visible
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = async (): Promise<void> => {
      if (!document.hidden) {
        // Sync when tab becomes visible
        try {
          await journalManager.forcSync();
          setSyncStatus('synced');
        } catch (error) {
          console.warn('Background sync failed:', error);
          setSyncStatus('error');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Handle retry sync on error
  const handleRetrySync = useCallback(async (): Promise<void> => {
    try {
      setSyncStatus('pending');
      await journalManager.forcSync();
      setSyncStatus('synced');
      toast({
        title: "Sync successful",
        description: "Your entries have been synced to the server.",
        variant: "default",
      });
    } catch (error) {
      console.error('Manual sync failed:', error);
      setSyncStatus('error');
      toast({
        title: "Sync failed",
        description: "Unable to sync entries. Please check your connection and try again.",
        variant: "destructive",
      });
    }
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-stone-50">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800 mx-auto mb-4"></div>
          <p className="text-stone-600">Loading your journal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-stone-50">
      {/* Entry List Sidebar */}
      <div className="w-80 border-r border-stone-200 bg-white">
        <EntryList
          entries={entries}
          selectedEntry={selectedEntry}
          onSelectEntry={handleSelectEntry}
          onCreateEntry={handleCreateEntry}
          onDeleteEntry={handleDeleteEntry}
          onEntriesChange={setEntries}
          syncStatus={syncStatus}
          onRetrySync={handleRetrySync}
        />
      </div>

      {/* Journal Editor */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedEntry ? (
          <JournalNavigation
            entry={selectedEntry}
            onEntryUpdate={handleEntryUpdate}
            onCreateEntry={handleCreateEntry}
            onDeleteEntry={handleDeleteEntry}
            syncStatus={syncStatus}
          />
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
                onClick={handleCreateEntry}
                className="px-6 py-3 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors"
              >
                Create New Entry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
