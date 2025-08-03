
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { JournalNavigation } from '@/components/journal/JournalNavigation';
import { EntryList } from '@/components/journal/EntryList';
import { JournalEntry } from '@/components/journal/types';
import { createJournalEntry } from '@/lib/journal';

export default function Journal(): JSX.Element {
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [entryListLoading, setEntryListLoading] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);



  const handleCreateEntry = (): void => {
    // Create entry immediately in UI for instant response (0ms delay)
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const timeString = format(now, 'HH:mm:ss');

    // Generate temporary ID for immediate UI update
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    // Create local entry immediately for instant UI response
    const newEntry: JournalEntry = {
      id: tempId,
      date: today,
      blocks: [{
        id: `${tempId}-initial`,
        type: 'paragraph',
        text: '',
        createdAt: now
      }],
      createdAt: now,
      updatedAt: now
    };

    // Update UI immediately - no waiting, no loading states
    setSelectedEntry(newEntry);
    setRefreshKey(prev => prev + 1);

    // Create in database in background without blocking UI
    createJournalEntry({
      entry_date: today,
      entry_type: 'morning',
      excited_about: `Entry created at ${timeString}`,
      make_today_great: '',
    }).then(supabaseEntry => {
      // Update with real ID from database
      const updatedEntry: JournalEntry = {
        ...newEntry,
        id: supabaseEntry.id,
        blocks: newEntry.blocks.map(block => ({
          ...block,
          id: block.id.replace(tempId, supabaseEntry.id)
        })),
        createdAt: new Date(supabaseEntry.created_at),
        updatedAt: new Date(supabaseEntry.updated_at)
      };

      setSelectedEntry(updatedEntry);
      setRefreshKey(prev => prev + 1);

    }).catch(error => {
      console.error('Failed to sync entry to database:', error);
      // Entry is already created locally, so user can continue working
      // Show subtle notification without interrupting workflow
      toast({
        title: "Entry created locally",
        description: "Your entry is saved locally and will sync when connection is restored.",
        variant: "default",
      });
    });
  };

  const handleSelectEntry = (entry: JournalEntry): void => {
    setSelectedEntry(entry);
  };

  const handleDeleteEntry = (entryId: string): void => {
    // Clear selected entry if it's the one being deleted
    if (selectedEntry?.id === entryId) {
      setSelectedEntry(null);
    }

    // Remove from entries list
    setEntries(prev => prev.filter(entry => entry.id !== entryId));

    // Refresh entry list
    setRefreshKey(prev => prev + 1);
  };

  const handleEntryUpdate = (updatedEntry: JournalEntry): void => {
    setSelectedEntry(updatedEntry);

    // Save to localStorage immediately for persistence
    const entryKey = `journal-${updatedEntry.date}`;
    try {
      localStorage.setItem(entryKey, JSON.stringify(updatedEntry));
    } catch (error) {
      console.error('Failed to save entry to localStorage:', error);
    }

    // Update entries list if this entry is in it
    setEntries(prev => {
      const existingIndex = prev.findIndex(e => e.id === updatedEntry.id);
      if (existingIndex >= 0) {
        const newEntries = [...prev];
        newEntries[existingIndex] = updatedEntry;
        return newEntries;
      } else {
        return [updatedEntry, ...prev];
      }
    });
  };

  // Load today's entry on mount if it exists
  useEffect(() => {
    const loadTodaysEntry = async () => {
      const today = format(new Date(), 'yyyy-MM-dd');

      // First check localStorage for unsaved changes
      const localEntryKey = `journal-${today}`;
      const localEntry = localStorage.getItem(localEntryKey);

      if (localEntry) {
        try {
          const parsedEntry = JSON.parse(localEntry) as JournalEntry;
          setSelectedEntry(parsedEntry);
          setIsLoading(false);
          return;
        } catch (error) {
          console.warn('Failed to parse local entry:', error);
        }
      }

      // If no local entry, try to load from Supabase
      try {
        const { getJournalEntryAsRichText } = await import('@/lib/journal');
        const supabaseEntry = await getJournalEntryAsRichText(today);

        if (supabaseEntry) {
          setSelectedEntry(supabaseEntry);
        }
      } catch (error) {
        console.warn('Failed to load entry from Supabase:', error);
      }

      setIsLoading(false);
    };

    loadTodaysEntry();
  }, []);

  // Save current entry before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (selectedEntry) {
        const entryKey = `journal-${selectedEntry.date}`;
        localStorage.setItem(entryKey, JSON.stringify(selectedEntry));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [selectedEntry]);

  return (
    <div className="h-full flex bg-stone-50 animate-fade-in">
      {/* Left Panel - Entry List (Fixed width, responsive) */}
      <div className="w-80 min-w-80 bg-white border-r border-stone-200 flex-shrink-0 hidden lg:flex">
        <EntryList
          key={refreshKey}
          selectedEntry={selectedEntry}
          onSelectEntry={handleSelectEntry}
          onCreateEntry={handleCreateEntry}
          className="flex-1"
          isParentLoading={isLoading}
          onLoadingStateChange={setEntryListLoading}
          entries={entries}
          onEntriesChange={setEntries}
        />
      </div>

      {/* Right Panel - Content (Full remaining width/height) */}
      <div className="flex-1 min-w-0 bg-white flex flex-col">
        {(isLoading || entryListLoading) ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse text-stone-500 font-inknut">
              <div className="h-6 bg-stone-200 rounded w-32 mx-auto mb-2"></div>
              <div className="h-4 bg-stone-100 rounded w-48 mx-auto"></div>
            </div>
          </div>
        ) : selectedEntry ? (
          <JournalNavigation
            className="flex-1"
            entry={selectedEntry}
            onEntryUpdate={handleEntryUpdate}
            onCreateEntry={handleCreateEntry}
            onDeleteEntry={handleDeleteEntry}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-stone-500 font-inknut mb-4">No entry selected</div>
              <button
                onClick={handleCreateEntry}
                className="px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors"
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
