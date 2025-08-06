
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { JournalNavigation } from '@/components/journal/JournalNavigation';
import { EntryList } from '@/components/journal/EntryList';
import { JournalEntry } from '@/components/journal/types';
import { getJournalManager, RealTimeJournalManager } from '@/lib/journal';
import { supabase } from '@/integrations/supabase/client';

export default function Journal(): JSX.Element {
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'error'>('synced');
  const [isCreatingEntry, setIsCreatingEntry] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [lastCreateTime, setLastCreateTime] = useState<number>(0);
  const journalManagerRef = useRef<RealTimeJournalManager | null>(null);

  // Get or create journal manager with user context
  const getManager = useCallback(() => {
    if (!journalManagerRef.current || journalManagerRef.current !== getJournalManager(userId)) {
      journalManagerRef.current = getJournalManager(userId);
      // Ensure the manager has the correct userId
      if (journalManagerRef.current && userId) {
        journalManagerRef.current.setUserId(userId);
      }
    }
    return journalManagerRef.current;
  }, [userId]);

  // Load entries immediately on mount with current manager
  const loadEntries = useCallback(async (): Promise<void> => {
    try {
      // Get entries from real-time manager (localStorage first, then database)
      const allEntries = await getManager().getAllEntries();
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
    }
  }, [selectedEntry, getManager]);

  // Initialize user context and load entries immediately
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          console.log('📝 Journal initialized for user:', user.id);

          // Ensure the manager gets the user context and retry any pending syncs
          const manager = getManager();
          if (manager) {
            manager.setUserId(user.id);
            // Small delay to ensure setUserId completes before retry
            setTimeout(() => {
              manager.retryAuthSync().catch(error => {
                console.error('❌ Initial auth sync retry failed:', error);
              });
            }, 100);
          }
        } else {
          console.log('📝 Journal initialized for anonymous user');
        }
      } catch (error) {
        console.error('Failed to get user:', error);
      }
    };

    // Start loading entries immediately with anonymous manager
    loadEntries();
    initializeUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const newUserId = session?.user?.id || null;
      console.log(`🔄 Auth state changed: ${event}, newUserId: ${newUserId}, currentUserId: ${userId}`);

      if (newUserId !== userId) {
        console.log('🔄 User changed, switching journal for:', newUserId || 'anonymous');

        // Clear old data immediately
        setEntries([]);
        setSelectedEntry(null);
        setSyncStatus('pending');

        // Update user ID
        setUserId(newUserId);

        // Clear the current manager reference to force recreation with new userId
        journalManagerRef.current = null;

        // If this is initial authentication (not user switching), retry sync for existing entries
        if (newUserId && !userId) {
          console.log('🔐 Initial authentication detected, retrying sync for existing entries');
          setTimeout(async () => {
            try {
              await getManager().retryAuthSync();
              console.log('✅ Auth sync retry completed');
            } catch (error) {
              console.error('❌ Auth sync retry failed:', error);
            }
          }, 500);
        }

        // Reload entries with new manager after a short delay
        setTimeout(async () => {
          try {
            console.log('🔄 Reloading entries for new user...');
            await loadEntries();
            setSyncStatus('synced');
            console.log('✅ Journal reloaded for new user');
          } catch (error) {
            console.error('Failed to reload entries for new user:', error);
            setSyncStatus('error');
          }
        }, 200);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // INSTANT ENTRY CREATION (0ms delay) with duplicate prevention
  const handleCreateEntry = useCallback(async (): Promise<void> => {
    const now = Date.now();

    // Prevent duplicate entries if already creating
    if (isCreatingEntry) {
      console.log('🚫 Entry creation already in progress, ignoring duplicate request');
      return;
    }

    // Prevent rapid-fire entry creation (debounce 1 second)
    if (now - lastCreateTime < 1000) {
      console.log('🚫 Entry creation too soon after last creation, ignoring duplicate request');
      return;
    }

    // Check if current selected entry is empty - if so, focus it instead of creating new
    if (selectedEntry && selectedEntry.blocks.length === 1 &&
        selectedEntry.blocks[0].text === '') {
      console.log('🎯 Current entry is empty, focusing it instead of creating new');
      setTimeout(() => {
        const editorElement = document.querySelector('[contenteditable="true"]') as HTMLElement;
        if (editorElement) {
          editorElement.focus();
        }
      }, 100);
      return;
    }

    console.log('🔄 Creating new entry...');
    setIsCreatingEntry(true);
    setLastCreateTime(now);

    const currentDate = new Date();
    const today = format(currentDate, 'yyyy-MM-dd');

    try {
      // Always create a new entry - allow multiple entries per day
      // Each entry gets a unique temporary ID, so multiple entries per day are supported
      console.log('🔄 Creating new entry for date:', today);

      // Create entry immediately using the real-time manager
      const newEntry = await getManager().createEntryImmediately(today, 'general');
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
  }, [isCreatingEntry, entries, selectedEntry, getManager]);

  // INSTANT ENTRY DELETION (immediate UI feedback)
  const handleDeleteEntry = useCallback(async (entryId: string): Promise<void> => {
    try {
      // Remove from UI immediately
      if (selectedEntry?.id === entryId) {
        setSelectedEntry(null);
      }
      setEntries(prev => prev.filter(entry => entry.id !== entryId));

      // Delete using real-time manager (background operation)
      await getManager().deleteEntryImmediately(entryId);

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
  }, [entries, selectedEntry, getManager]);

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

      // CRITICAL FIX: Only update existing entries, NEVER add new ones
      // New entries should ONLY be added through handleCreateEntry to prevent duplicates
      setEntries(prev => {
        const existingIndex = prev.findIndex(entry => entry.id === updatedEntry.id);

        if (existingIndex >= 0) {
          // Update existing entry
          console.log(`📝 Updating existing entry in list: ${updatedEntry.id}`);
          return prev.map(entry =>
            entry.id === updatedEntry.id ? updatedEntry : entry
          );
        } else {
          // CRITICAL: Do NOT add new entries here - this was causing duplicates
          console.log(`⚠️ Ignoring update for non-existent entry: ${updatedEntry.id} (prevents duplicates)`);
          return prev;
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

  // Handle entry selection with instant feedback
  const handleSelectEntry = useCallback(async (entry: JournalEntry): Promise<void> => {
    // Switch immediately - no loading states
    setSelectedEntry(entry);
    
    // Update sync status
    setSyncStatus('synced');
  }, []);

  // Setup real-time sync status updates
  useEffect(() => {
    const updateSyncStatus = (): void => {
      const status = getManager().getSyncStatus();

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
      getManager()['syncPendingChanges']?.();
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
          await getManager().forcSync();
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
      await getManager().forcSync();
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
  }, [getManager]);

  // Only show loading state for actual async operations (database sync)
  // Since localStorage reads are synchronous, we don't need a loading state for initial load
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-stone-50">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800 mx-auto mb-4"></div>
          <p className="text-stone-600">
            Syncing your journal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-stone-50">
      {/* Entry List Sidebar */}
      <div className="w-80 border-r border-stone-200 bg-white flex flex-col h-full">
        <EntryList
          entries={entries}
          selectedEntry={selectedEntry}
          onSelectEntry={handleSelectEntry}
          onCreateEntry={handleCreateEntry}
          onDeleteEntry={handleDeleteEntry}
          onEntriesChange={setEntries}
          syncStatus={syncStatus}
          onRetrySync={handleRetrySync}
          journalManager={getManager()}
        />
      </div>

      {/* Journal Editor */}
      <div className="flex-1 flex flex-col bg-white h-full">
        {selectedEntry ? (
          <JournalNavigation
            entry={selectedEntry}
            onEntryUpdate={handleEntryUpdate}
            onCreateEntry={handleCreateEntry}
            onDeleteEntry={handleDeleteEntry}
            syncStatus={syncStatus}
            journalManager={getManager()}
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
