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
}: EntryListItemProps): JSX.Element => {
  const handleClick = (e: React.MouseEvent): void => {
    // Prevent click if clicking on delete button
    if ((e.target as HTMLElement).closest('.delete-button')) {
      return;
    }
    onSelect();
  };

  const handleDelete = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(entry.id);
    }
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
              {dateLabel}
            </span>
            {onDelete && (
              <button
                onClick={handleDelete}
                className="delete-button p-1 hover:bg-red-100 rounded transition-colors"
                title="Delete entry"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
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
