import React, { useState, useEffect } from 'react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { Search, Plus, Calendar, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { JournalEntry } from './types';

interface EntryListProps {
  selectedEntry: JournalEntry | null;
  onSelectEntry: (entry: JournalEntry) => void;
  onCreateEntry: () => void;
  className?: string;
}

interface EntryListItem {
  entry: JournalEntry;
  dateKey: string;
}

export function EntryList({ selectedEntry, onSelectEntry, onCreateEntry, className = '' }: EntryListProps): JSX.Element {
  const [entries, setEntries] = useState<EntryListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEntries, setFilteredEntries] = useState<EntryListItem[]>([]);

  const loadEntries = () => {
    const entryItems: EntryListItem[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('journal-')) {
        const dateKey = key.replace('journal-', '');
        try {
          const entryData = localStorage.getItem(key);
          if (entryData) {
            const entry: JournalEntry = JSON.parse(entryData);
            entry.blocks = entry.blocks.map(block => ({
              ...block,
              createdAt: new Date(block.createdAt)
            }));
            entry.createdAt = new Date(entry.createdAt);
            entry.updatedAt = new Date(entry.updatedAt);
            
            // Generate preview and thumbnail
            const hasContent = entry.blocks.some(block => block.text?.trim() !== '');
            if (hasContent) {
              const firstTextBlock = entry.blocks.find(block => block.text?.trim() !== '');
              const firstImageBlock = entry.blocks.find(block => block.type === 'image' && block.imageUrl);
              
              entry.preview = firstTextBlock?.text?.slice(0, 80) || '';
              entry.thumbnail = firstImageBlock?.imageUrl;
              
              entryItems.push({ entry, dateKey });
            }
          }
        } catch (error) {
          console.error('Error loading entry:', key, error);
        }
      }
    }
    
    // Sort by date descending
    entryItems.sort((a, b) => new Date(b.entry.updatedAt).getTime() - new Date(a.entry.updatedAt).getTime());
    setEntries(entryItems);
    setFilteredEntries(entryItems);
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
        entry.date.includes(query) ||
        entry.blocks.some(block => block.text?.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredEntries(filtered);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      loadEntries();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const hasEntryContent = selectedEntry?.blocks?.some(block => block.text?.trim() !== '') || false;

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-stone-200">
        <div className="flex items-center justify-between mb-4">
          {/* Left side - Three dot menu and Plus button */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-stone-100 rounded-lg"
            >
              <MoreHorizontal className="h-4 w-4 text-stone-600" />
            </Button>
            <Button
              onClick={onCreateEntry}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-stone-100 rounded-lg"
            >
              <Plus className="h-4 w-4 text-stone-600" />
            </Button>
          </div>

          {/* Center - Date and Time */}
          <div className="text-center">
            <div className="text-lg font-inknut font-medium text-stone-800">
              {format(new Date(), 'EEEE, MMMM d')}
            </div>
            <div className="text-sm font-inknut text-stone-500">
              {format(new Date(), 'h:mm a')}
            </div>
          </div>

          {/* Right side - Empty for balance */}
          <div className="w-16"></div>
        </div>
        
        {/* Search */}
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
        {filteredEntries.length === 0 ? (
          <div className="p-6 text-center font-inknut text-stone-500">
            {searchQuery ? 'No entries match your search' : 'No journal entries yet'}
          </div>
        ) : (
          <div className="p-2">
            {filteredEntries.map(({ entry, dateKey }) => (
              <button
                key={entry.id}
                onClick={() => onSelectEntry(entry)}
                className={`
                  w-full p-3 mb-2 text-left rounded-lg transition-all duration-200
                  hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-orange-400
                  ${selectedEntry?.id === entry.id ? 'bg-orange-50 border border-orange-200' : 'border border-transparent'}
                `}
              >
                <div className="flex gap-3">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    {entry.thumbnail ? (
                      <img
                        src={entry.thumbnail}
                        alt="Entry thumbnail"
                        className="w-12 h-12 rounded-lg object-cover bg-stone-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-stone-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-inknut font-medium text-stone-800">
                        {formatEntryDate(entry.date)}
                      </span>
                      <span className="text-xs font-inknut text-stone-500">
                        {format(entry.updatedAt, 'h:mm a')}
                      </span>
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