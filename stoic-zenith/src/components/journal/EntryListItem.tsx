import React, { memo } from 'react';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { JournalEntry } from './types';
import { JournalEntryResponse } from '@/lib/journal';

interface EntryListItemProps {
  entry: JournalEntryResponse & { preview?: string };
  isSelected: boolean;
  onSelect: (entry: JournalEntry) => void;
  formatEntryDate: (date: string) => string;
}

export const EntryListItem = memo(({ 
  entry, 
  isSelected, 
  onSelect, 
  formatEntryDate 
}: EntryListItemProps) => {
  const handleClick = () => {
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
    onSelect(localEntry);
  };

  return (
    <button
      onClick={handleClick}
      className={`
        w-full p-3 mb-2 text-left rounded-lg transition-all duration-200
        hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-orange-400
        ${isSelected ? 'bg-orange-50 border border-orange-200' : 'border border-transparent'}
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
                {format(new Date(entry.created_at), 'h:mm a')}
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
  );
});

EntryListItem.displayName = 'EntryListItem';
