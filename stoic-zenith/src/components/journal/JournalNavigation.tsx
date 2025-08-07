import React, { useState, useEffect, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, Plus, Trash2, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAutoSave } from '@/hooks/useAutoSave';
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
import type { RealTimeJournalManager } from '@/lib/journal';
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
  journalManager: RealTimeJournalManager;
}

export const JournalNavigation = React.memo(function JournalNavigation({
  className = '',
  entry,
  onEntryUpdate,
  onCreateEntry,
  onDeleteEntry,
  isCreatingEntry: _isCreatingEntry = false,
  syncStatus = 'synced',
  journalManager
}: JournalNavigationProps): JSX.Element {
  const [currentEntry, setCurrentEntry] = useState<JournalEntry>(entry);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error'>('saved');

  // Use ref to store the latest entry state to prevent stale closures
  const currentEntryRef = useRef<JournalEntry>(entry);

  // Update ref whenever currentEntry changes
  useEffect(() => {
    currentEntryRef.current = currentEntry;
  }, [currentEntry]);

  // Auto-save hook for throttled saves
  const { saveBlocks } = useAutoSave({
    throttleMs: 500, // Save every 500ms max
    onSave: async (blocks) => {
      const latestEntry = currentEntryRef.current;
      if (latestEntry?.id) {
        await journalManager.updateEntryImmediately(latestEntry.id, blocks);
      }
    },
    onSaveStatus: setSaveStatus
  });

  const selectedDate = new Date(currentEntry.date);

  // Instant UI updates with throttled auto-save (Google Docs style)
  const handleBlocksChange = useCallback((blocks: JournalBlock[]): void => {
    // Update local UI immediately (< 10ms)
    const updatedEntry: JournalEntry = {
      ...currentEntryRef.current,
      blocks,
      updatedAt: new Date()
    };
    setCurrentEntry(updatedEntry);

    // Trigger throttled auto-save
    saveBlocks(blocks);

    // Update parent immediately for UI consistency
    onEntryUpdate(updatedEntry);
  }, [saveBlocks, onEntryUpdate]);

  // INSTANT ENTRY DELETION (immediate UI feedback)
  const handleDeleteEntry = useCallback(async (): Promise<void> => {
    const entryId = currentEntry.id;
    const isTemporary = entryId.startsWith('temp-');



    try {
      // Close dialog first
      setShowDeleteDialog(false);

      // Delete using real-time manager
      await journalManager.deleteEntryImmediately(entryId);

      // Call parent delete handler immediately
      onDeleteEntry?.(entryId);

      toast({
        title: "Entry deleted",
        description: `Your journal entry has been removed${isTemporary ? ' (was not yet saved to server)' : ''}.`,
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

  // Update current entry when prop changes (smart synchronization)
  useEffect(() => {
    const currentEntryFromRef = currentEntryRef.current;

    // Case 1: Different entry ID - always update (switching entries)
    if (entry.id !== currentEntryFromRef.id) {
      setCurrentEntry(entry);
      return;
    }

    // Case 2: Same entry ID - only update if parent has newer content and we're not actively editing
    const parentUpdatedAt = new Date(entry.updatedAt).getTime();
    const currentUpdatedAt = new Date(currentEntryFromRef.updatedAt).getTime();

    // Only update from parent if:
    // 1. Parent has significantly newer content (more than 1 second difference)
    // 2. AND the content is actually different (prevent unnecessary updates)
    const hasContentDifference = JSON.stringify(entry.blocks) !== JSON.stringify(currentEntryFromRef.blocks);

    if (parentUpdatedAt > currentUpdatedAt + 1000 && hasContentDifference) {
      setCurrentEntry(entry);
    }
  }, [entry]);

  // No cleanup needed - useAutoSave handles its own cleanup

  return (
    <div className={`flex flex-col h-full overflow-hidden ${className}`}>
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-stone-200 bg-white">
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
          {/* <div className="flex items-center gap-2">
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
          </div> */}
        </div>

        <div className="flex items-center gap-2">
          {/* Save Status Indicator */}
          <div className="flex items-center gap-2 text-xs text-stone-500">
            {saveStatus === 'saving' && (
              <>
                <Save className="h-3 w-3 animate-spin" />
                <span>Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Saved</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <AlertCircle className="h-3 w-3 text-red-500" />
                <span>Save failed</span>
              </>
            )}
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onCreateEntry && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    onCreateEntry();
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Entry
                </DropdownMenuItem>
              )}
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

      {/* Editor - Scrollable content area */}
      <div className="flex-1 overflow-hidden bg-white min-h-0" style={{ backgroundColor: '#ffffff' }}>
        <ErrorBoundary>
          <SafeEditorWrapper>
            <EnhancedRichTextEditor
              key={currentEntry.id} // Stable key based on entry ID
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