
import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { JournalNavigation } from '@/components/journal/JournalNavigation';
import { EntryList } from '@/components/journal/EntryList';
import { JournalEntry, JournalBlock } from '@/components/journal/types';
// Rich text journal imports removed - using regular journal entries instead
import { createJournalEntry, getJournalEntryByDate } from '@/lib/journal';

export default function Journal(): JSX.Element {
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [entryListLoading, setEntryListLoading] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  const createNewEntry = (): JournalEntry => {
    const now = new Date();
    return {
      id: `entry-${Date.now()}`,
      date: format(now, 'yyyy-MM-dd'),
      blocks: [{
        id: `block-${Date.now()}`,
        type: 'paragraph',
        text: '',
        createdAt: now
      }],
      createdAt: now,
      updatedAt: now
    };
  };

  const handleCreateEntry = async (): Promise<void> => {
    try {
      // Create a new journal entry in Supabase
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Check if an entry already exists for today
      const existingEntry = await getJournalEntryByDate(today);
      let supabaseEntry;
      
      if (existingEntry) {
        supabaseEntry = existingEntry;
      } else {
        supabaseEntry = await createJournalEntry({
          entry_date: today,
          entry_type: 'morning',
          excited_about: '',
          make_today_great: '',
        });
      }

      // Create a new rich-text entry for the local interface
      const newEntry: JournalEntry = {
        id: supabaseEntry.id,
        date: supabaseEntry.entry_date,
        blocks: [{
          id: `block-${Date.now()}`,
          type: 'paragraph',
          text: '',
          createdAt: new Date()
        }],
        createdAt: new Date(supabaseEntry.created_at),
        updatedAt: new Date(supabaseEntry.updated_at)
      };
      
      setSelectedEntry(newEntry);
      
      // Immediate refresh of entry list - no delay
      setRefreshKey(prev => prev + 1);
      
      if (!existingEntry) {
        toast({
          title: "New journal entry created",
          description: "You can now start writing your thoughts.",
        });
      }
      
      // Force immediate refresh of entry list
      if (typeof window !== 'undefined' && window.refreshJournalEntries) {
        window.refreshJournalEntries();
      }
    } catch (error) {
      console.error('Error creating new journal entry:', error);
      toast({
        title: "Error creating entry",
        description: "Failed to create a new journal entry. Please try again.",
        variant: "destructive",
      });
      
      // Fallback to local entry if Supabase fails
      const fallbackEntry = createNewEntry();
      setSelectedEntry(fallbackEntry);
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleSelectEntry = (entry: JournalEntry): void => {
    setSelectedEntry(entry);
  };

  const handleEntryUpdate = async (updatedEntry: JournalEntry): Promise<void> => {
    setSelectedEntry(updatedEntry);
    
    // Save to localStorage as backup
    const entryKey = `journal-${updatedEntry.date}`;
    try {
      localStorage.setItem(entryKey, JSON.stringify(updatedEntry));
    } catch (error) {
      console.error('Failed to save entry to localStorage:', error);
    }
    
    // Debounced save to Supabase would go here in a real implementation
    // For now, we'll just update localStorage
  };

  const loadTodaysEntry = useCallback(async () => {
    try {
      setIsLoading(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Try to load from Supabase first
      const supabaseEntry = await getJournalEntryByDate(today);
      
      if (supabaseEntry) {
        // Convert Supabase entry to local format
        const localEntry: JournalEntry = {
          id: supabaseEntry.id,
          date: supabaseEntry.entry_date,
          blocks: [{
            id: `block-${Date.now()}`,
            type: 'paragraph',
            text: supabaseEntry.excited_about || '',
            createdAt: new Date(supabaseEntry.created_at)
          }],
          createdAt: new Date(supabaseEntry.created_at),
          updatedAt: new Date(supabaseEntry.updated_at)
        };
        setSelectedEntry(localEntry);
      } else {
        // Check localStorage as fallback
        const todayKey = `journal-${today}`;
        const existingEntry = localStorage.getItem(todayKey);
        
        if (existingEntry) {
          try {
            const entry = JSON.parse(existingEntry);
            entry.blocks = entry.blocks.map((block: JournalBlock) => ({
              ...block,
              createdAt: new Date(block.createdAt)
            }));
            entry.createdAt = new Date(entry.createdAt);
            entry.updatedAt = new Date(entry.updatedAt);
            setSelectedEntry(entry);
          } catch (error) {
            console.error('Error loading today\'s entry from localStorage:', error);
            setSelectedEntry(createNewEntry());
          }
        } else {
          setSelectedEntry(createNewEntry());
        }
      }
    } catch (error) {
      console.error('Error loading today\'s entry from Supabase:', error);
      
      // Fallback to localStorage if Supabase fails
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayKey = `journal-${today}`;
      const existingEntry = localStorage.getItem(todayKey);
      
      if (existingEntry) {
        try {
          const entry = JSON.parse(existingEntry);
          entry.blocks = entry.blocks.map((block: JournalBlock) => ({
            ...block,
            createdAt: new Date(block.createdAt)
          }));
          entry.createdAt = new Date(entry.createdAt);
          entry.updatedAt = new Date(entry.updatedAt);
          setSelectedEntry(entry);
        } catch (error) {
          console.error('Error loading today\'s entry from localStorage:', error);
          setSelectedEntry(createNewEntry());
        }
      } else {
        setSelectedEntry(createNewEntry());
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodaysEntry();
  }, [loadTodaysEntry]);

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
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-stone-500 font-inknut">No entry selected</div>
          </div>
        )}
      </div>
    </div>
  );
}
