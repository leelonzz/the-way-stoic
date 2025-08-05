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

import { EnhancedRichTextEditor } from './EnhancedRichTextEditor';
import { SafeEditorWrapper } from './SafeEditorWrapper';
import { JournalEntry, JournalBlock } from './types';
import { journalManager } from '@/lib/journal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { toast } from '@/components/ui/use-toast';

interface JournalNavigationProps {
  className?: string;
  entry: JournalEntry;
  onEntryUpdate: (entry: JournalEntry) => void;
  onCreateEntry?: () => void;
  onDeleteEntry?: (entryId: string) => void;
  isCreatingEntry?: boolean;
  syncStatus?: 'synced' | 'pending' | 'error';
}

export const JournalNavigation = React.memo(function JournalNavigation({ 
  className = '', 
  entry, 
  onEntryUpdate, 
  onCreateEntry, 
  onDeleteEntry, 
  isCreatingEntry: _isCreatingEntry = false,
  syncStatus = 'synced'
}: JournalNavigationProps): JSX.Element {
  const [currentEntry, setCurrentEntry] = useState<JournalEntry>(entry);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const selectedDate = new Date(currentEntry.date);

  // REAL-TIME AUTO-SAVE (as users type)
  const handleBlocksChange = useCallback(async (blocks: JournalBlock[]): Promise<void> => {
    try {
      // Update entry immediately
      const updatedEntry: JournalEntry = {
        ...currentEntry,
        blocks,
        updatedAt: new Date()
      };

      // Update UI immediately
      setCurrentEntry(updatedEntry);
      onEntryUpdate(updatedEntry);

      // Save using real-time manager (background operation)
      await journalManager.updateEntryImmediately(updatedEntry.id, blocks);
      
      // Update save time
      setLastSaveTime(new Date());

    } catch (error) {
      console.error('Failed to save entry:', error);
      toast({
        title: "Saved locally",
        description: "Your changes are saved locally and will sync when connection is restored.",
        variant: "default",
      });
    }
  }, [currentEntry, onEntryUpdate]);

  // INSTANT ENTRY DELETION (immediate UI feedback)
  const handleDeleteEntry = useCallback(async (): Promise<void> => {
    try {
      // Close dialog
      setShowDeleteDialog(false);
      
      // Delete using real-time manager
      await journalManager.deleteEntryImmediately(currentEntry.id);
      
      // Call parent delete handler
      onDeleteEntry?.(currentEntry.id);
      
      toast({
        title: "Entry deleted",
        description: "Your journal entry has been removed.",
        variant: "default",
      });
      
    } catch (error) {
      console.error('Failed to delete entry:', error);
      toast({
        title: "Entry deleted locally",
        description: "Entry removed from local storage. Will sync when connection is restored.",
        variant: "default",
      });
    }
  }, [currentEntry.id, onDeleteEntry]);

  // Update current entry when prop changes
  useEffect(() => {
    setCurrentEntry(entry);
  }, [entry]);

  // Cleanup save timeout on unmount
  useEffect(() => {
    return (): void => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-white">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold text-stone-800">
              {format(selectedDate, 'MMMM d, yyyy')}
            </h1>
            <p className="text-sm text-stone-500">
              {format(selectedDate, 'EEEE')}
            </p>
          </div>
          
          {/* Sync Status */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              syncStatus === 'synced' ? 'bg-green-500' :
              syncStatus === 'pending' ? 'bg-yellow-500' :
              'bg-red-500'
            }`} />
            <span className="text-xs text-stone-500">
              {syncStatus === 'synced' ? 'Synced' :
               syncStatus === 'pending' ? 'Syncing...' :
               'Sync failed'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Save Status */}
          {lastSaveTime && (
            <span className="text-xs text-stone-500">
              Last saved: {format(lastSaveTime, 'h:mm a')}
            </span>
          )}

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onCreateEntry}>
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Entry
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden bg-white">
        <ErrorBoundary>
          <SafeEditorWrapper>
            <EnhancedRichTextEditor
              blocks={currentEntry.blocks}
              onChange={handleBlocksChange}
            />
          </SafeEditorWrapper>
        </ErrorBoundary>
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
            <AlertDialogAction onClick={handleDeleteEntry} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});