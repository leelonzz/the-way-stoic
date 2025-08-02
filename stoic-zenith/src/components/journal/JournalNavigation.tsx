import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Save, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { RichTextEditor } from './RichTextEditor';
import { JournalEntry, JournalBlock } from './types';

interface JournalNavigationProps {
  className?: string;
}

export function JournalNavigation({ className = '' }: JournalNavigationProps): JSX.Element {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);


  const createNewEntry = (date: Date): JournalEntry => ({
    id: `entry-${Date.now()}`,
    date: format(date, 'yyyy-MM-dd'),
    blocks: [{
      id: `block-${Date.now()}`,
      type: 'paragraph',
      text: '',
      createdAt: new Date()
    }],
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const loadEntry = async (date: Date) => {
    setIsLoading(true);
    try {
      const dateKey = format(date, 'yyyy-MM-dd');
      const existingEntry = localStorage.getItem(`journal-${dateKey}`);
      
      if (existingEntry) {
        const entry = JSON.parse(existingEntry);
        entry.blocks = entry.blocks.map((block: any) => ({
          ...block,
          createdAt: new Date(block.createdAt)
        }));
        entry.createdAt = new Date(entry.createdAt);
        entry.updatedAt = new Date(entry.updatedAt);
        setCurrentEntry(entry);
      } else {
        setCurrentEntry(createNewEntry(date));
      }
    } catch (error) {
      console.error('Error loading entry:', error);
      setCurrentEntry(createNewEntry(date));
    } finally {
      setIsLoading(false);
    }
  };

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
      
      const hasContent = updatedEntry.blocks.some(block => block.text.trim() !== '');
      const firstBlock = updatedEntry.blocks.find(block => block.text.trim() !== '');
      const preview = firstBlock?.text?.slice(0, 50) || '';
      const timestamp = format(updatedEntry.updatedAt, 'h:mm a');
      

    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const loadEntriesMap = () => {
    const map: Record<string, { hasEntry: boolean; timestamp?: string; preview?: string }> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('journal-')) {
        const dateKey = key.replace('journal-', '');
        try {
          const entry = JSON.parse(localStorage.getItem(key) || '{}');
          const hasContent = entry.blocks?.some((block: JournalBlock) => block.text?.trim() !== '');
          const firstBlock = entry.blocks?.find((block: JournalBlock) => block.text?.trim() !== '');
          const preview = firstBlock?.text?.slice(0, 50) || '';
          const timestamp = entry.updatedAt ? format(new Date(entry.updatedAt), 'h:mm a') : '';
          
          map[dateKey] = {
            hasEntry: hasContent,
            timestamp,
            preview: preview.length > 47 ? preview + '...' : preview
          };
        } catch (error) {
          console.error('Error reading entry:', key, error);
        }
      }
    }

  };

  const handleDateSelect = (date: Date) => {
    if (format(date, 'yyyy-MM-dd') !== format(selectedDate, 'yyyy-MM-dd')) {
      setSelectedDate(date);
      loadEntry(date);
    }
  };

  const handleBlocksChange = (blocks: JournalBlock[]) => {
    if (!currentEntry) return;
    setCurrentEntry({
      ...currentEntry,
      blocks
    });
  };

  useEffect(() => {
    loadEntriesMap();
    loadEntry(selectedDate);
  }, []);

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
              <h1 className="text-2xl font-serif font-bold text-stone-800">
                {format(selectedDate, 'EEEE, MMMM d')}
              </h1>
              <p className="text-sm text-stone-500">
                {format(selectedDate, 'yyyy')}
              </p>
            </div>
          </div>
          
          <Button
            onClick={saveEntry}
            disabled={isSaving || !currentEntry}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>

        {/* Timeline Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-stone-100 rounded-lg"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h2 className="font-serif font-medium text-base text-stone-800">
              Timeline
            </h2>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-stone-100 rounded-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-sm text-stone-500">
            {currentEntry?.blocks?.some(block => block.text.trim() !== '') ? 'Entry saved' : 'No entries yet'}
          </div>
        </div>
        
        <div className="mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDateSelect(new Date())}
            className="text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-800 px-3 py-2"
          >
            + Add Today's Entry
          </Button>
        </div>
      </div>

      {/* Journal Entry Area - Full remaining height */}
      <div className="flex-1 bg-white min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-stone-500 text-lg">Loading...</div>
          </div>
        ) : currentEntry ? (
          <div className="h-full">
            <RichTextEditor
              blocks={currentEntry.blocks}
              onChange={handleBlocksChange}
              placeholder={`What's on your mind for ${format(selectedDate, 'MMMM d')}?`}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-stone-500 text-lg">Failed to load entry</div>
          </div>
        )}
      </div>
    </div>
  );
}