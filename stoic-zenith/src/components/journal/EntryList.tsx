import React, { useState, useEffect } from 'react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { Search, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { JournalEntry } from './types';
import { getJournalEntries, JournalEntryResponse } from '@/lib/journal';

interface EntryListProps {
  selectedEntry: JournalEntry | null;
  onSelectEntry: (entry: JournalEntry) => void;
  onCreateEntry: () => void;
  className?: string;
}

interface EntryListItem {
  entry: JournalEntryResponse & { preview?: string };
  dateKey: string;
}

export function EntryList({ selectedEntry, onSelectEntry, onCreateEntry: _onCreateEntry, className = '' }: EntryListProps): JSX.Element {
  const [entries, setEntries] = useState<EntryListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEntries, setFilteredEntries] = useState<EntryListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadEntries = async () => {
    setIsLoading(true);
    try {
      const journalEntries = await getJournalEntries(50);
      const entryItems: EntryListItem[] = journalEntries.map(entry => {
        // Generate preview from journal entry content
        const contentParts = [
          entry.excited_about,
          entry.make_today_great,
          entry.must_not_do,
          entry.grateful_for,
          ...(Array.isArray(entry.biggest_wins) ? entry.biggest_wins : []),
          ...(Array.isArray(entry.tensions) ? entry.tensions : [])
        ].filter(Boolean);
        
        const preview = contentParts.join(' ').slice(0, 80);
        
        return {
          entry: {
            ...entry,
            preview
          },
          dateKey: entry.entry_date
        };
      });
      
      setEntries(entryItems);
      setFilteredEntries(entryItems);
    } catch (error) {
      console.error('Failed to load journal entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatEntryDate = (dateStr: string): string => {
    try {
      const date = parseISO(dateStr);
      if (isToday(date)) return 'Today';
      if (isYesterday(date)) return 'Yesterday';
      return format(date, 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredEntries(entries);
    } else {
      const filtered = entries.filter(({ entry }) =>
        entry.preview?.toLowerCase().includes(query.toLowerCase()) ||
        entry.entry_date.includes(query) ||
        entry.excited_about?.toLowerCase().includes(query.toLowerCase()) ||
        entry.make_today_great?.toLowerCase().includes(query.toLowerCase()) ||
        entry.must_not_do?.toLowerCase().includes(query.toLowerCase()) ||
        entry.grateful_for?.toLowerCase().includes(query.toLowerCase()) ||
        (Array.isArray(entry.biggest_wins) && entry.biggest_wins.some(win => win.toLowerCase().includes(query.toLowerCase()))) ||
        (Array.isArray(entry.tensions) && entry.tensions.some(tension => tension.toLowerCase().includes(query.toLowerCase())))
      );
      setFilteredEntries(filtered);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  // Function to refresh entries (can be called from parent components)
  const refreshEntries = () => {
    loadEntries();
  };

  // Expose refresh function via ref or callback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.refreshJournalEntries = refreshEntries;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.refreshJournalEntries;
      }
    };
  }, []);

  // const hasEntryContent = selectedEntry?.blocks?.some(block => block.text?.trim() !== '') || false;

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Search Only */}
      <div className="p-4 border-b border-stone-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            type="text"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-stone-50 border-stone-200 focus:border-orange-400 focus:ring-orange-400 font-inknut"
          />
        </div>
      </div>

      {/* Entries List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 text-center font-inknut text-stone-500">
            Loading entries...
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-6 text-center font-inknut text-stone-500">
            {searchQuery ? 'No entries match your search' : 'No journal entries yet'}
          </div>
        ) : (
          <div className="p-2">
            {filteredEntries.map(({ entry }) => (
              <button
                key={entry.id}
                onClick={() => {
                  // Convert Supabase entry to local JournalEntry format
                  const localEntry: JournalEntry = {
                    id: entry.id,
                    date: entry.entry_date,
                    blocks: [{
                      id: `block-${Date.now()}`,
                      type: 'paragraph',
                      text: entry.preview || entry.excited_about || '',
                      createdAt: new Date(entry.created_at)
                    }],
                    createdAt: new Date(entry.created_at),
                    updatedAt: new Date(entry.updated_at)
                  };
                  onSelectEntry(localEntry);
                }}
                className={`
                  w-full p-3 mb-2 text-left rounded-lg transition-all duration-200
                  hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-orange-400
                  ${selectedEntry?.id === entry.id ? 'bg-orange-50 border border-orange-200' : 'border border-transparent'}
                `}
              >
                <div className="flex gap-3">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-stone-400" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-inknut font-medium text-stone-800">
                        {formatEntryDate(entry.entry_date)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-inknut text-stone-500">
                          {format(new Date(entry.updated_at), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                    
                    {entry.preview && (
                      <p className="text-sm font-inknut text-stone-600 line-clamp-2 leading-relaxed">
                        {entry.preview}
                        {entry.preview.length >= 80 && '...'}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}