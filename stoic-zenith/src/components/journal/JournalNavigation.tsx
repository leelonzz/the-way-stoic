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
  onUpdateEntryWithIdChange?: (entryId: string, blocks: JournalBlock[], onIdChange?: (newId: string) => void) => Promise<void>;
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
  onUpdateEntryWithIdChange,
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

  // Track current entry ID for auto-save with ID change handling
  const currentEntryIdRef = useRef(currentEntry.id);
  const [entryIdMap, setEntryIdMap] = useState<Map<string, string>>(new Map()); // Maps old IDs to new IDs
  const lastSaveTimeRef = useRef<number>(Date.now());
  const saveHealthCheckRef = useRef<NodeJS.Timeout | null>(null);

  // Update ref whenever currentEntry changes - with improved ID tracking
  useEffect(() => {
    currentEntryRef.current = currentEntry;
    // Always update the ID ref when entry changes, with logging for debugging
    const previousId = currentEntryIdRef.current;
    currentEntryIdRef.current = currentEntry.id;
  }, [currentEntry]);

  // Auto-save hook for throttled saves with ID change support
  const { saveBlocks, forceFlush } = useAutoSave({
    throttleMs: 1000, // Increased to 1000ms to reduce conflicts with typing
    onSave: async (blocks) => {
      // Always use the most current entry ID at save time
      const entryId = currentEntryIdRef.current;

      // Validate that the entry ID exists before attempting save
      if (!entryId) {
        throw new Error('No entry ID available for auto-save');
      }

      // Ensure journal manager has correct user context (allow anonymous)
      if (!journalManager?.userId || journalManager.userId === '') {
        throw new Error('Journal manager missing user context - cannot save entry');
      }

      // Check if we have a mapped ID (in case temp ID changed to permanent)
      const actualEntryId = entryIdMap.get(entryId) || entryId;

      // CRITICAL: Register for ID change notifications if this is a temp entry
      if (actualEntryId.startsWith('temp-')) {
        journalManager.registerEntryIdChangeListener(actualEntryId, (newId: string) => {
          console.log(`🔄 Autosave received ID change notification: ${actualEntryId} → ${newId}`);

          // Update ID mapping
          setEntryIdMap(prev => {
            const newMap = new Map(prev);
            newMap.set(entryId, newId);
            newMap.set(actualEntryId, newId);
            return newMap;
          });

          // Update current entry ID reference
          currentEntryIdRef.current = newId;

          // Update the current entry with new ID
          setCurrentEntry(prev => ({ ...prev, id: newId }));
        });
      }

      // Use the enhanced update function that handles ID changes if available
      if (onUpdateEntryWithIdChange) {
        await onUpdateEntryWithIdChange(actualEntryId, blocks, (newId: string) => {
          // Store the ID mapping
          setEntryIdMap(prev => {
            const newMap = new Map(prev);
            newMap.set(entryId, newId);
            if (entryId !== actualEntryId) {
              newMap.set(actualEntryId, newId);
            }
            return newMap;
          });
          currentEntryIdRef.current = newId;
          // Update the current entry with new ID
          setCurrentEntry(prev => ({ ...prev, id: newId }));
        });
      } else {
        // Fallback to journal manager direct call with actual ID
        try {
          await journalManager.updateEntryImmediately(actualEntryId, blocks);
        } catch (error) {
          console.error('❌ Autosave failed:', error);

          // If save failed due to missing entry, try to recover
          if (error instanceof Error && error.message.includes('not found')) {
            console.log('🔧 Attempting autosave recovery...');

            // Try to find the entry with current ID
            const currentEntry = journalManager.getFromLocalStorage(entryId);
            if (currentEntry) {
              console.log('✅ Found entry with current ID, retrying save...');
              await journalManager.updateEntryImmediately(currentEntry.id, blocks);
            } else {
              console.error('❌ Could not recover autosave - entry not found');
              throw error;
            }
          } else {
            throw error;
          }
        }
      }
    },
    onSaveStatus: setSaveStatus
  });

  const selectedDate = new Date(currentEntry.date);

  // Instant UI updates with throttled auto-save (Google Docs style)
  const handleBlocksChange = useCallback((blocks: JournalBlock[]): void => {
    try {
      // Update local UI immediately (< 10ms)
      const updatedEntry: JournalEntry = {
        ...currentEntryRef.current,
        blocks,
        updatedAt: new Date()
      };
      setCurrentEntry(updatedEntry);

      // Trigger throttled auto-save
      saveBlocks(blocks);
      
      // Update last save time
      lastSaveTimeRef.current = Date.now();

      // Update parent immediately for UI consistency
      // Use requestAnimationFrame to avoid blocking the UI thread
      requestAnimationFrame(() => {
        try {
          onEntryUpdate(updatedEntry);
        } catch (error) {
          console.error('Failed to update parent:', error);
        }
      });
    } catch (error) {
      console.error('Critical error in handleBlocksChange:', error);
      // Try to at least save the blocks even if UI update fails
      try {
        saveBlocks(blocks);
      } catch (saveError) {
        console.error('Failed to save blocks after error:', saveError);
      }
    }
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
      // Check if this is actually the same entry with a changed ID
      const mappedId = entryIdMap.get(currentEntryFromRef.id);
      if (mappedId === entry.id) {
        // Same entry, just ID changed - update refs but don't reload content
        currentEntryIdRef.current = entry.id;
        setCurrentEntry(prev => ({ ...prev, id: entry.id }));
        return;
      }
      
      // Actually different entry - force flush and switch
      forceFlush().catch(console.error);
      
      setCurrentEntry(entry);
      // Clear ID mappings for new entry
      setEntryIdMap(new Map());
      // Immediately update the ID ref for the new entry
      currentEntryIdRef.current = entry.id;
      return;
    }

    // Case 2: Same entry ID - only update if parent has newer content and we're not actively editing
    const parentUpdatedAt = new Date(entry.updatedAt).getTime();
    const currentUpdatedAt = new Date(currentEntryFromRef.updatedAt).getTime();

    // Only update from parent if:
    // 1. Parent has significantly newer content (more than 2 seconds difference to avoid conflicts)
    // 2. AND the content is actually different (prevent unnecessary updates)
    const hasContentDifference = JSON.stringify(entry.blocks) !== JSON.stringify(currentEntryFromRef.blocks);

    if (parentUpdatedAt > currentUpdatedAt + 2000 && hasContentDifference) {
      setCurrentEntry(entry);
      // Ensure ID ref is synced
      currentEntryIdRef.current = entry.id;
    }
  }, [entry, forceFlush]);

  // Enhanced health check to ensure autosave stays alive
  useEffect(() => {
    const checkSaveHealth = () => {
      const timeSinceLastSave = Date.now() - lastSaveTimeRef.current;

      // If no save for more than 10 seconds, investigate and recover
      if (timeSinceLastSave > 10000 && currentEntry.blocks.length > 0) {
        console.warn(`⚠️ Autosave appears stuck (${Math.round(timeSinceLastSave / 1000)}s since last save)`);

        // Check if the entry still exists
        const entryId = currentEntryIdRef.current;
        if (entryId && journalManager) {
          const entry = journalManager.getFromLocalStorage(entryId);
          if (!entry) {
            console.error(`🚨 AUTOSAVE BROKEN: Entry ${entryId} not found in localStorage`);
            console.log('🔍 Available entries:', journalManager.getAllFromLocalStorage().map(e => ({ id: e.id, date: e.date })));

            // Try to find a replacement entry for today
            const today = new Date().toISOString().split('T')[0];
            const todayEntries = journalManager.getAllFromLocalStorage().filter(e => e.date.startsWith(today));

            if (todayEntries.length > 0) {
              const replacementEntry = todayEntries[0];
              console.log(`🔧 Found replacement entry: ${replacementEntry.id}`);

              // Update the current entry reference
              currentEntryIdRef.current = replacementEntry.id;
              setCurrentEntry(replacementEntry);

              // Update ID mapping
              setEntryIdMap(prev => {
                const newMap = new Map(prev);
                newMap.set(entryId, replacementEntry.id);
                return newMap;
              });

              console.log('✅ Autosave recovered with replacement entry');
            } else {
              console.error('❌ No replacement entry found for today');
            }
          } else {
            // Entry exists, try to force a save
            console.log('🔧 Entry exists, forcing save to recover autosave...');
            try {
              handleBlocksChange(currentEntry.blocks);
            } catch (error) {
              console.error('❌ Failed to force save:', error);
            }
          }
        }
      }
    };

    // Check every 5 seconds
    saveHealthCheckRef.current = setInterval(checkSaveHealth, 5000);

    return () => {
      if (saveHealthCheckRef.current) {
        clearInterval(saveHealthCheckRef.current);
      }
    };
  }, [currentEntry.blocks, handleBlocksChange, journalManager]);

  // Update last save time when blocks change
  useEffect(() => {
    lastSaveTimeRef.current = Date.now();
  }, [currentEntry.blocks]);

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
              {/* Manual Save Option - CRITICAL FIX for when autosave fails */}
              <DropdownMenuItem
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  try {
                    // Force flush any pending saves
                    await forceFlush();
                    toast({
                      title: "Entry saved",
                      description: "Your journal entry has been saved successfully.",
                      variant: "default",
                    });
                  } catch (error) {
                    console.error('Manual save failed:', error);
                    toast({
                      title: "Save failed",
                      description: "Failed to save entry. Please try again.",
                      variant: "destructive",
                    });
                  }
                }}
                disabled={saveStatus === 'saving'}
              >
                <Save className="h-4 w-4 mr-2" />
                {saveStatus === 'saving' ? 'Saving...' : 'Save Now'}
              </DropdownMenuItem>

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