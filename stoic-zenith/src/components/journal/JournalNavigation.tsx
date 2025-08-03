import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { SingleEditableRichTextEditor } from './SingleEditableRichTextEditor';
import { JournalEntry, JournalBlock } from './types';

interface JournalNavigationProps {
  className?: string;
  entry: JournalEntry;
  onEntryUpdate: (entry: JournalEntry) => void;
  onCreateEntry?: () => void;
  isCreatingEntry?: boolean;
}

export function JournalNavigation({ className = '', entry, onEntryUpdate, onCreateEntry, isCreatingEntry: _isCreatingEntry = false }: JournalNavigationProps): JSX.Element {
  const [currentEntry, setCurrentEntry] = useState<JournalEntry>(entry);
  const [_isSaving, setIsSaving] = useState(false);


  const selectedDate = new Date(currentEntry.date);

  const saveEntry = async (): Promise<void> => {
    if (!currentEntry) return;
    
    setIsSaving(true);
    try {
      const updatedEntry = {
        ...currentEntry,
        updatedAt: new Date()
      };
      
      // Save to localStorage as fallback
      localStorage.setItem(`journal-${currentEntry.date}`, JSON.stringify(updatedEntry));
      
      // TODO: Integrate with Supabase to save rich text content
      // This would involve converting blocks to a format that can be stored in the database
      // and then updating the journal entry via updateJournalEntry from @/lib/journal
      
      setCurrentEntry(updatedEntry);
      onEntryUpdate(updatedEntry);
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setIsSaving(false);
    }
  };


  const handleBlocksChange = (blocks: JournalBlock[]): void => {
    if (!currentEntry) return;
    const updatedEntry = {
      ...currentEntry,
      blocks
    };
    setCurrentEntry(updatedEntry);
    onEntryUpdate(updatedEntry);
  };

  useEffect(() => {
    setCurrentEntry(entry);
  }, [entry]);

  useEffect((): (() => void) => {
    const interval = setInterval(() => {
      if (currentEntry && currentEntry.blocks.some(block => block.text.trim() !== '')) {
        saveEntry();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [currentEntry, saveEntry]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-stone-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* Left side - Three dot menu */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-stone-100 rounded-lg"
            >
              <MoreHorizontal className="h-4 w-4 text-stone-600" />
            </Button>
          </div>

          {/* Center - Date and Time */}
          <div className="text-center">
            <div className="text-base font-medium text-stone-800">
              {format(selectedDate, 'MMM d, yyyy, h:mm a')}
            </div>
          </div>

          {/* Right side - Plus button */}
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCreateEntry}
              className="h-8 w-8 p-0 hover:bg-stone-100 rounded-lg"
            >
              <Plus className="h-4 w-4 text-stone-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Journal Entry Area - Full remaining height */}
      <div className="flex-1 bg-white min-h-0">
        <div className="h-full" data-export-area>
          <SingleEditableRichTextEditor
            blocks={currentEntry.blocks}
            onChange={handleBlocksChange}
            placeholder={`What's on your mind for ${format(selectedDate, 'MMMM d')}?`}
          />
        </div>
      </div>
    </div>
  );
}