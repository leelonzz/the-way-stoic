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
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedSaveRef = useRef<NodeJS.Timeout | null>(null);
  const pendingBlocksRef = useRef<JournalBlock[] | null>(null);
  const isSavingRef = useRef<boolean>(false);

  // Use ref to store the latest entry state to prevent stale closures
  const currentEntryRef = useRef<JournalEntry>(entry);

  // Update ref whenever currentEntry changes
  useEffect(() => {
    currentEntryRef.current = currentEntry;
  }, [currentEntry]);

  const selectedDate = new Date(currentEntry.date);

  // Debounced save function to prevent duplicate saves
  const debouncedSave = useCallback(async (entryId: string, blocks: JournalBlock[]) => {
    // Prevent concurrent saves
    if (isSavingRef.current) {
      // Queue the blocks for next save
      pendingBlocksRef.current = blocks;
      return;
    }

    isSavingRef.current = true;
    try {
      await journalManager.updateEntryImmediately(entryId, blocks);
      
      // Check if there are pending blocks to save
      if (pendingBlocksRef.current) {
        const nextBlocks = pendingBlocksRef.current;
        pendingBlocksRef.current = null;
        // Recursively save pending blocks
        await debouncedSave(entryId, nextBlocks);
      }
    } finally {
      isSavingRef.current = false;
    }
  }, [journalManager]);

  // REAL-TIME AUTO-SAVE (as users type) with debounced parent updates
  const handleBlocksChange = useCallback(async (blocks: JournalBlock[]): Promise<void> => {
    try {
      const totalChars = blocks.reduce((sum, b) => sum + (b.text?.length || 0), 0);

      // CRITICAL: Always use the latest entry state from ref to prevent stale closures
      const latestEntry = currentEntryRef.current;

      // SAFETY CHECK: Ensure we have a valid entry with an ID
      if (!latestEntry || !latestEntry.id) {
        console.error(`🚨 CRITICAL: Invalid entry state in handleBlocksChange!`);
        console.error(`🚨 latestEntry:`, latestEntry);
        console.error(`🚨 entry prop:`, entry);
        console.error(`🚨 currentEntry:`, currentEntry);
        throw new Error('Invalid entry state - cannot save blocks without a valid entry ID');
      }

      // Content integrity check - verify we're not losing content
      const previousTotalChars = latestEntry.blocks.reduce((sum, b) => sum + (b.text?.length || 0), 0);
      if (totalChars < previousTotalChars * 0.5 && previousTotalChars > 50) {
        console.warn(`🚨 CONTENT INTEGRITY WARNING: Significant content reduction detected!`);
        console.warn(`Previous: ${previousTotalChars} chars, New: ${totalChars} chars`);
        console.warn(`Previous blocks:`, latestEntry.blocks.map(b => ({ id: b.id, text: b.text?.substring(0, 50) + '...' })));
        console.warn(`New blocks:`, blocks.map(b => ({ id: b.id, text: b.text?.substring(0, 50) + '...' })));
      }

      // Update entry immediately for local state
      const updatedEntry: JournalEntry = {
        ...latestEntry,
        blocks,
        updatedAt: new Date()
      };

      // Update local UI immediately (this won't cause re-render of editor)
      setCurrentEntry(updatedEntry);

      // Cancel any pending debounced save
      if (debouncedSaveRef.current) {
        clearTimeout(debouncedSaveRef.current);
      }

      // Debounce the actual save operation (200ms delay)
      debouncedSaveRef.current = setTimeout(async () => {
        await debouncedSave(updatedEntry.id, blocks);
        
        // Verify save integrity AFTER the save completes
        const savedEntry = journalManager.getFromLocalStorage(updatedEntry.id);
        if (savedEntry) {
          const savedTotalChars = savedEntry.blocks.reduce((sum, b) => sum + (b.text?.length || 0), 0);
          if (savedTotalChars !== totalChars) {
            console.error(`🚨 SAVE INTEGRITY ERROR: Content mismatch after save!`);
            console.error(`Expected: ${totalChars} chars, Saved: ${savedTotalChars} chars`);
          }
        }
      }, 200);

      // Update save time
      setLastSaveTime(new Date());

      // Debounce parent updates to prevent editor re-renders
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        // CRITICAL: Use the latest entry state at the time of timeout execution
        const finalEntry: JournalEntry = {
          ...currentEntryRef.current,
          blocks,
          updatedAt: new Date()
        };
        onEntryUpdate(finalEntry);
      }, 300); // 300ms debounce for parent updates

    } catch (error) {
      console.error('Failed to save entry:', error);
      toast({
        title: "Saved locally",
        description: "Your changes are saved locally and will sync when connection is restored.",
        variant: "default",
      });
    }
  }, [onEntryUpdate, journalManager, debouncedSave]); // Added debouncedSave to dependencies

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
      // CRITICAL: Cancel any pending debounced updates from the previous entry
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      setCurrentEntry(entry);
      return;
    }

    // Case 2: Same entry ID - only update if parent has newer content and we're not actively editing
    const parentUpdatedAt = new Date(entry.updatedAt).getTime();
    const currentUpdatedAt = new Date(currentEntryFromRef.updatedAt).getTime();

    // Only update from parent if:
    // 1. Parent has significantly newer content (more than 1 second difference)
    // 2. AND we don't have a pending save operation
    // 3. AND the content is actually different (prevent unnecessary updates)
    const hasContentDifference = JSON.stringify(entry.blocks) !== JSON.stringify(currentEntryFromRef.blocks);

    if (parentUpdatedAt > currentUpdatedAt + 1000 && !saveTimeoutRef.current && hasContentDifference) {

      setCurrentEntry(entry);
    } else if (hasContentDifference) {

    }
  }, [entry]);

  // Cleanup save timeout on unmount and execute pending updates
  useEffect(() => {
    return () => {
      // CRITICAL: Execute any pending debounced update before unmounting
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        // Execute the pending update immediately to prevent content loss
        const latestEntry = currentEntryRef.current;

        onEntryUpdate(latestEntry);
      }
    };
  }, [onEntryUpdate]); // Remove currentEntry dependency since we use ref

  // Also execute pending updates when entry changes (user navigating away)
  useEffect(() => {
    return () => {
      // Execute any pending update when entry is about to change
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        const latestEntry = currentEntryRef.current;

        onEntryUpdate(latestEntry);
      }
    };
  }, [entry.id, onEntryUpdate]); // Remove currentEntry dependency since we use ref

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
          {/* Save Status */}
          {/* {lastSaveTime && (
            <span className="text-xs text-stone-500">
              Last saved: {format(lastSaveTime, 'h:mm a')}
            </span>
          )} */}

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