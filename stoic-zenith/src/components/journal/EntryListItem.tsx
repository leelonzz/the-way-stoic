import React, { memo } from 'react';
import { Calendar, Trash2 } from 'lucide-react';
import { JournalEntry } from './types';

interface EntryListItemProps {
  entry: JournalEntry & { preview?: string };
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: (entryId: string) => void;
  dateLabel: string;
}

export const EntryListItem = memo(({
  entry,
  isSelected,
  onSelect,
  onDelete,
  dateLabel
}: EntryListItemProps) => {
  const handleClick = (): void => {
    // INSTANT selection - no await, no try/catch needed
    onSelect();
  };

  const handleDelete = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(entry.id);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        group w-full p-3 mb-2 text-left rounded-lg transition-all duration-200
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
              {dateLabel}
            </span>
            {onDelete && (
              <button
                onClick={handleDelete}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-red-50 rounded text-red-500 hover:text-red-700"
                title="Delete entry"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
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
