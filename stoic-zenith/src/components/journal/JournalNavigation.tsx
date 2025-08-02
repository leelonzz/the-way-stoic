import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Save, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { RichTextEditor } from './RichTextEditor';
import { ExportButton } from './ExportButton';
import { JournalEntry, JournalBlock } from './types';

interface JournalNavigationProps {
  className?: string;
  entry: JournalEntry;
  onEntryUpdate: (entry: JournalEntry) => void;
}

export function JournalNavigation({ className = '', entry, onEntryUpdate }: JournalNavigationProps): JSX.Element {
  const [currentEntry, setCurrentEntry] = useState<JournalEntry>(entry);
  const [isSaving, setIsSaving] = useState(false);


  const selectedDate = new Date(currentEntry.date);

  const saveEntry = async () => {
    if (!currentEntry) return;
    
    setIsSaving(true);
    try {
      const updatedEntry = {
        ...currentEntry,
        updatedAt: new Date()
      };
      
      localStorage.setItem(`journal-${currentEntry.date}`, JSON.stringify(updatedEntry));
      setCurrentEntry(updatedEntry);
      onEntryUpdate(updatedEntry);
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setIsSaving(false);
    }
  };


  const handleBlocksChange = (blocks: JournalBlock[]) => {
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

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentEntry && currentEntry.blocks.some(block => block.text.trim() !== '')) {
        saveEntry();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [currentEntry]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header with Timeline and Save */}
      <div className="bg-white border-b border-stone-200 p-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-stone-600" />
            <div>
              <h1 className="text-2xl font-inknut font-bold text-stone-800">
                {format(selectedDate, 'EEEE, MMMM d')}
              </h1>
              <p className="text-sm font-inknut text-stone-500">
                {format(selectedDate, 'yyyy')}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <ExportButton entry={currentEntry} />
            <Button
              onClick={saveEntry}
              disabled={isSaving || !currentEntry}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

      </div>

      {/* Journal Entry Area - Full remaining height */}
      <div className="flex-1 bg-white min-h-0">
        <div className="h-full" data-export-area>
          <RichTextEditor
            blocks={currentEntry.blocks}
            onChange={handleBlocksChange}
            placeholder={`What's on your mind for ${format(selectedDate, 'MMMM d')}?`}
          />
        </div>
      </div>
    </div>
  );
}