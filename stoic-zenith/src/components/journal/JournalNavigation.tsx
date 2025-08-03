import React, { useState, useEffect, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { SingleEditableRichTextEditor } from './SingleEditableRichTextEditor';
import { JournalEntry, JournalBlock } from './types';
import { updateJournalEntryFromBlocks, deleteJournalEntry } from '@/lib/journal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { toast } from '@/components/ui/use-toast';

interface JournalNavigationProps {
  className?: string;
  entry: JournalEntry;
  onEntryUpdate: (entry: JournalEntry) => void;
  onCreateEntry?: () => void;
  onDeleteEntry?: (entryId: string) => void;
  isCreatingEntry?: boolean;
}

export function JournalNavigation({ className = '', entry, onEntryUpdate, onCreateEntry, onDeleteEntry, isCreatingEntry: _isCreatingEntry = false }: JournalNavigationProps): JSX.Element {
  const [currentEntry, setCurrentEntry] = useState<JournalEntry>(entry);
  const [_isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const selectedDate = new Date(currentEntry.date);

  // Debounced save function
  const debouncedSave = useCallback((entryToSave: JournalEntry) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);

        // Save to localStorage immediately
        const entryKey = `journal-${entryToSave.date}`;
        localStorage.setItem(entryKey, JSON.stringify(entryToSave));

        // Save to Supabase
        await updateJournalEntryFromBlocks(entryToSave.id, entryToSave.blocks);
        console.log('Auto-saved to Supabase:', entryToSave.id);

      } catch (error) {
        console.warn('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000); // 1 second debounce
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleDeleteEntry = async (): Promise<void> => {
    try {
      await deleteJournalEntry(currentEntry.id);

      // Remove from localStorage as well
      localStorage.removeItem(`journal-${currentEntry.date}`);

      // Call parent delete handler for immediate UI update
      onDeleteEntry?.(currentEntry.id);

      toast({
        title: "Entry deleted",
        description: "Your journal entry has been deleted successfully.",
      });

    } catch (error) {
      console.error('Failed to delete entry:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete the journal entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const saveEntry = async (): Promise<void> => {
    if (!currentEntry) return;

    setIsSaving(true);
    try {
      const updatedEntry = {
        ...currentEntry,
        updatedAt: new Date()
      };

      // Save to localStorage as immediate backup
      const entryKey = `journal-${currentEntry.date}`;
      localStorage.setItem(entryKey, JSON.stringify(updatedEntry));

      // Save to Supabase with rich text content
      try {
        await updateJournalEntryFromBlocks(currentEntry.id, currentEntry.blocks);
        console.log('Successfully saved to Supabase:', currentEntry.id);
      } catch (supabaseError) {
        console.warn('Failed to save to Supabase, localStorage backup saved:', supabaseError);
        // Still update the UI even if Supabase fails
      }

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
      blocks,
      updatedAt: new Date()
    };
    setCurrentEntry(updatedEntry);
    onEntryUpdate(updatedEntry);

    // Auto-save with debouncing
    debouncedSave(updatedEntry);
  };

  useEffect(() => {
    // Save current entry before switching to new one
    if (currentEntry && currentEntry.id !== entry.id) {
      saveEntry();
    }
    setCurrentEntry(entry);
  }, [entry]);

  // Cleanup timeout on unmount
  useEffect((): (() => void) => {
    return (): void => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-stone-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* Left side - Three dot menu */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-stone-100 rounded-lg"
                >
                  <MoreHorizontal className="h-4 w-4 text-stone-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Entry
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
          <ErrorBoundary>
            <SingleEditableRichTextEditor
              blocks={currentEntry.blocks}
              onChange={handleBlocksChange}
            />
          </ErrorBoundary>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Journal Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this journal entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEntry}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete Entry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}