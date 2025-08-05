
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

  // INSTANT ENTRY CREATION (0ms delay)
  const handleCreateEntry = useCallback(async (): Promise<void> => {
    console.log('🔄 Creating new entry...');
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');

    try {
      // Create entry immediately using the real-time manager
      const newEntry = await journalManager.createEntryImmediately(today, 'general');
      console.log('✅ Entry created:', newEntry);
      
      // Update UI immediately - no waiting, no loading states
      setSelectedEntry(newEntry);
      
      // Update entries list immediately
      setEntries(prev => {
        console.log('📝 Updating entries list, current count:', prev.length);
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
    }
  }, []);

  // INSTANT ENTRY DELETION (immediate UI feedback)
  const handleDeleteEntry = useCallback(async (entryId: string): Promise<void> => {
    try {
      // Remove from UI immediately
      setSelectedEntry(null);
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
      toast({
        title: "Entry deleted locally",
        description: "Entry removed from local storage. Will sync when connection is restored.",
        variant: "default",
      });
    }
  }, []);

  // REAL-TIME ENTRY UPDATE (as users type)
  const handleEntryUpdate = useCallback(async (updatedEntry: JournalEntry): Promise<void> => {
    try {
      // Update UI immediately
      setSelectedEntry(updatedEntry);
      setEntries(prev => 
        prev.map(entry => 
          entry.id === updatedEntry.id ? updatedEntry : entry
        )
      );
      
      // Save using real-time manager (background operation)
      await journalManager.updateEntryImmediately(updatedEntry.id, updatedEntry.blocks);
      
      // Update sync status
      setSyncStatus('synced');
      
    } catch (error) {
      console.error('Failed to update entry:', error);
      setSyncStatus('error');
      
      toast({
        title: "Saved locally",
        description: "Your changes are saved locally and will sync when connection is restored.",
        variant: "default",
      });
    }
  }, []);

  // Load entries with instant access
  const loadEntries = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Get entries from real-time manager (localStorage first, then database)
      const allEntries = await journalManager.getAllEntries();
      setEntries(allEntries);
      
      // Load today's entry if no entry is selected
      if (!selectedEntry) {
        const today = format(new Date(), 'yyyy-MM-dd');
        const todaysEntry = allEntries.find(entry => entry.date === today);
        
        if (todaysEntry) {
          setSelectedEntry(todaysEntry);
        } else {
          // Create today's entry if it doesn't exist
          const newEntry = await journalManager.createEntryImmediately(today, 'general');
          setSelectedEntry(newEntry);
          setEntries(prev => [newEntry, ...prev]);
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
      // Check if there are pending syncs
      const hasPendingSyncs = journalManager['syncQueue'].size > 0;
      setSyncStatus(hasPendingSyncs ? 'pending' : 'synced');
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
          await journalManager['syncPendingChanges']?.();
          setSyncStatus('synced');
        } catch (error) {
          console.warn('Background sync failed:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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
        />
      </div>

      {/* Journal Editor */}
      <div className="flex-1 flex flex-col">
        {selectedEntry ? (
          <JournalNavigation
            entry={selectedEntry}
            onEntryUpdate={handleEntryUpdate}
            onCreateEntry={handleCreateEntry}
            onDeleteEntry={handleDeleteEntry}
            syncStatus={syncStatus}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
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
