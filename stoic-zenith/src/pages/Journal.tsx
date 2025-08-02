
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { JournalNavigation } from '@/components/journal/JournalNavigation';
import { EntryList } from '@/components/journal/EntryList';
import { JournalEntry, JournalBlock } from '@/components/journal/types';

export default function Journal() {
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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

  const handleCreateEntry = () => {
    // Create a new rich-text entry for the journal
    const newEntry = createNewEntry();
    setSelectedEntry(newEntry);
    setRefreshKey(prev => prev + 1);
    
    // Also refresh the entry list to show any new entries from Morning/Evening journals
    if (typeof window !== 'undefined' && (window as any).refreshJournalEntries) {
      (window as any).refreshJournalEntries();
    }
  };

  const handleSelectEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
  };

  const handleEntryUpdate = (updatedEntry: JournalEntry) => {
    setSelectedEntry(updatedEntry);
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    // Load today's entry by default
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayKey = `journal-${today}`;
    const existingEntry = localStorage.getItem(todayKey);
    
    if (existingEntry) {
      try {
        const entry = JSON.parse(existingEntry);
        entry.blocks = entry.blocks.map((block: any) => ({
          ...block,
          createdAt: new Date(block.createdAt)
        }));
        entry.createdAt = new Date(entry.createdAt);
        entry.updatedAt = new Date(entry.updatedAt);
        setSelectedEntry(entry);
      } catch (error) {
        console.error('Error loading today\'s entry:', error);
        setSelectedEntry(createNewEntry());
      }
    } else {
      setSelectedEntry(createNewEntry());
    }
  }, []);

  return (
    <div className="h-full flex bg-stone-50">
      {/* Left Panel - Entry List (Fixed width, responsive) */}
      <div className="w-80 min-w-80 bg-white border-r border-stone-200 flex-shrink-0 hidden lg:flex">
        <EntryList
          key={refreshKey}
          selectedEntry={selectedEntry}
          onSelectEntry={handleSelectEntry}
          onCreateEntry={handleCreateEntry}
          className="flex-1"
        />
      </div>

      {/* Right Panel - Content (Full remaining width/height) */}
      <div className="flex-1 min-w-0 bg-white flex flex-col">
        {selectedEntry && (
          <JournalNavigation 
            className="flex-1"
            entry={selectedEntry}
            onEntryUpdate={handleEntryUpdate}
            onCreateEntry={handleCreateEntry}
          />
        )}
      </div>
    </div>
  );
}
