import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Save, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DaySelector } from './DaySelector';
import { RichTextEditor } from './RichTextEditor';
import { JournalEntry, JournalBlock } from './types';

interface JournalNavigationProps {
  className?: string;
}

export function JournalNavigation({ className = '' }: JournalNavigationProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [entriesMap, setEntriesMap] = useState<Record<string, { hasEntry: boolean; timestamp?: string; preview?: string }>>({});

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
      
      setEntriesMap(prev => ({
        ...prev,
        [currentEntry.date]: {
          hasEntry: hasContent,
          timestamp,
          preview: preview.length > 47 ? preview + '...' : preview
        }
      }));
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
    setEntriesMap(map);
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
    <div className={`h-full flex gap-4 ${className}`}>
      <div className="w-64 flex-shrink-0">
        <DaySelector
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          entriesMap={entriesMap}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Card className="flex-1 bg-white/80 backdrop-blur-sm border-stone/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 px-8 pt-6">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <BookOpen className="w-7 h-7 text-cta flex-shrink-0" />
              <div className="min-w-0">
                <CardTitle className="text-3xl font-serif text-ink leading-tight">
                  {format(selectedDate, 'EEEE, MMMM d')}
                </CardTitle>
                <p className="text-stone text-base mt-2">
                  {format(selectedDate, 'yyyy')}
                </p>
              </div>
            </div>
            
            <Button
              onClick={saveEntry}
              disabled={isSaving || !currentEntry}
              className="bg-cta hover:bg-cta/90 text-white px-6 py-2 flex-shrink-0"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col px-8 pb-8">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-stone">Loading...</div>
              </div>
            ) : currentEntry ? (
              <div className="flex-1">
                <RichTextEditor
                  blocks={currentEntry.blocks}
                  onChange={handleBlocksChange}
                  placeholder={`What's on your mind for ${format(selectedDate, 'MMMM d')}?`}
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-stone">Failed to load entry</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}