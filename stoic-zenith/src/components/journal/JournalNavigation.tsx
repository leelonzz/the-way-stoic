import React, { useState, useEffect, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, Plus, Trash2, Save } from 'lucide-react';
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
import { updateJournalEntryFromBlocks, deleteJournalEntry } from '@/lib/journal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { toast } from '@/components/ui/use-toast';

// Data validation utilities
const validateJournalEntry = (entry: JournalEntry): boolean => {
  if (!entry || !entry.id || !entry.date || !Array.isArray(entry.blocks)) {
    return false;
  }

  // Validate each block
  for (const block of entry.blocks) {
    if (!block.id || !block.type || typeof block.text !== 'string') {
      return false;
    }
  }

  return true;
};

const sanitizeJournalEntry = (entry: JournalEntry): JournalEntry => {
  return {
    ...entry,
    blocks: entry.blocks.map(block => ({
      ...block,
      text: typeof block.text === 'string' ? block.text : '',
      id: block.id || `block-${Date.now()}-${Math.random()}`,
      type: block.type || 'paragraph',
      createdAt: block.createdAt || new Date()
    }))
  };
};

interface JournalNavigationProps {
  className?: string;
  entry: JournalEntry;
  onEntryUpdate: (entry: JournalEntry) => void;
  onCreateEntry?: () => void;
  onDeleteEntry?: (entryId: string) => void;
  isCreatingEntry?: boolean;
}

export const JournalNavigation = React.memo(function JournalNavigation({ className = '', entry, onEntryUpdate, onCreateEntry, onDeleteEntry, isCreatingEntry: _isCreatingEntry = false }: JournalNavigationProps): JSX.Element {
  const [currentEntry, setCurrentEntry] = useState<JournalEntry>(entry);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSwitchingEntry, setIsSwitchingEntry] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [performanceWarning, setPerformanceWarning] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const entrySwitchLockRef = useRef<boolean>(false);
  const performanceCheckRef = useRef<NodeJS.Timeout | null>(null);

  const selectedDate = new Date(currentEntry.date);

  // Debounced save function with adaptive timing based on content size
  const debouncedSave = useCallback((entryToSave: JournalEntry) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Optimized debounce delays for better responsiveness
    const totalTextLength = entryToSave.blocks.reduce((total, block) => total + block.text.length, 0);
    const blockCount = entryToSave.blocks.length;

    let debounceDelay = 300; // Reduced from 1000ms to 300ms

    if (blockCount > 100 || totalTextLength > 10000) {
      // Very large content: reduced from 3s to 800ms
      debounceDelay = 800;
    } else if (blockCount > 50 || totalTextLength > 5000) {
      // Large content: reduced from 2s to 600ms
      debounceDelay = 600;
    } else if (blockCount > 20 || totalTextLength > 2000) {
      // Medium content: reduced from 1.5s to 400ms
      debounceDelay = 400;
    }

    console.log(`🔄 Auto-save scheduled in ${debounceDelay}ms for ${blockCount} blocks, ${totalTextLength} chars`);

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        setSaveStatus('saving');
        console.log('🔄 Starting auto-save for entry:', entryToSave.id);

        // Skip validation in hot path for better performance
        // Validation only happens on explicit saves or when errors occur

        // Save to localStorage immediately using standardized format with error handling
        const entryIdKey = `journal-entry-${entryToSave.id}`;
        const dateKey = `journal-${entryToSave.date}`;

        try {
          // Save the entry data with entry ID key
          localStorage.setItem(entryIdKey, JSON.stringify(entryToSave));
          // Save the pointer from date to entry ID
          localStorage.setItem(dateKey, entryIdKey);
        } catch (localStorageError) {
          console.error('❌ localStorage save failed:', localStorageError);

          // Try to recover by clearing some old entries
          try {
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith('journal-entry-') && key !== entryIdKey) {
                keysToRemove.push(key);
              }
            }

            // Remove oldest entries (keep only last 10)
            keysToRemove.slice(0, -10).forEach(key => localStorage.removeItem(key));

            // Try saving again
            localStorage.setItem(entryIdKey, JSON.stringify(entryToSave));
            localStorage.setItem(dateKey, entryIdKey);
            console.log('✅ localStorage save succeeded after cleanup');
          } catch (retryError) {
            console.error('❌ localStorage save failed even after cleanup:', retryError);
            throw new Error('Failed to save to local storage - storage may be full');
          }
        }

        console.log('✅ Saved to localStorage:', entryIdKey, 'with date pointer:', dateKey);

        // Save to Supabase
        console.log('🔄 Attempting Supabase save for entry:', entryToSave.id, 'with', entryToSave.blocks.length, 'blocks');

        let result: any;
        // Check if this is a temporary/recovery entry that needs to be created first
        if (entryToSave.id.startsWith('temp-') || entryToSave.id.startsWith('recovery-')) {
          console.log('Creating new entry in Supabase for temporary ID:', entryToSave.id);

          // Create a new entry in Supabase
          const { createJournalEntry } = await import('@/lib/journal');
          const newSupabaseEntry = await createJournalEntry({
            entry_date: entryToSave.date,
            entry_type: 'general',
            excited_about: '',
            make_today_great: '',
          });

          // Update the entry with the real Supabase ID
          const realEntry = {
            ...entryToSave,
            id: newSupabaseEntry.id,
            blocks: entryToSave.blocks.map(block => ({
              ...block,
              id: block.id.replace(entryToSave.id, newSupabaseEntry.id)
            }))
          };

          // Now save the blocks to the real entry
          result = await updateJournalEntryFromBlocks(newSupabaseEntry.id, realEntry.blocks);

          // Update localStorage with the real ID
          const newEntryIdKey = `journal-entry-${newSupabaseEntry.id}`;
          const dateKey = `journal-${entryToSave.date}`;
          localStorage.setItem(newEntryIdKey, JSON.stringify(realEntry));
          localStorage.setItem(dateKey, newEntryIdKey);

          // Remove old temporary entry from localStorage
          const oldEntryIdKey = `journal-entry-${entryToSave.id}`;
          localStorage.removeItem(oldEntryIdKey);

          console.log('✅ Auto-saved new entry to Supabase:', newSupabaseEntry.id, 'Result:', result);
        } else {
          // Regular update for existing entries
          result = await updateJournalEntryFromBlocks(entryToSave.id, entryToSave.blocks);
          console.log('✅ Auto-saved existing entry to Supabase:', entryToSave.id, 'Result:', result);
        }

        // Verify the save by checking the updated_at timestamp
        if (result && result.updated_at) {
          console.log('✅ Save verified - updated_at:', result.updated_at);
          setSaveStatus('saved');
          setLastSaveTime(new Date());

          // Reset to idle after showing saved status for 2 seconds
          setTimeout(() => setSaveStatus('idle'), 2000);
        } else {
          console.warn('⚠️ Save result missing updated_at timestamp:', result);
          setSaveStatus('saved'); // Still show as saved since localStorage worked
          setLastSaveTime(new Date());
          setTimeout(() => setSaveStatus('idle'), 2000);
        }

      } catch (error) {
        console.error('❌ Auto-save failed:', error);

        // Log detailed error information
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }

        // Enhanced error categorization and recovery
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isAuthError = errorMessage.includes('not authenticated') || errorMessage.includes('auth') || errorMessage.includes('JWT');
        const isNetworkError = errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch');
        const isQuotaError = errorMessage.includes('quota') || errorMessage.includes('limit') || errorMessage.includes('storage');
        const isValidationError = errorMessage.includes('validation') || errorMessage.includes('invalid');

        let description = "Your changes are saved locally but couldn't sync to the cloud.";
        let shouldRetry = false;

        if (isAuthError) {
          description = "Authentication issue. Please refresh the page and try again.";
        } else if (isNetworkError) {
          description = "Network issue. Your changes are saved locally and will sync when you're back online.";
          shouldRetry = true;
        } else if (isQuotaError) {
          description = "Storage quota exceeded. Please contact support or delete old entries.";
        } else if (isValidationError) {
          description = "Data validation error. Your content is saved locally.";
          // Try to sanitize and retry once
          try {
            const sanitizedEntry = sanitizeJournalEntry(entryToSave);
            console.log('🔄 Retrying with sanitized data...');
            await updateJournalEntryFromBlocks(sanitizedEntry.id, sanitizedEntry.blocks);
            console.log('✅ Retry with sanitized data succeeded');
            setSaveStatus('saved');
            setLastSaveTime(new Date());
            setTimeout(() => setSaveStatus('idle'), 2000);
            return; // Exit early on successful retry
          } catch (retryError) {
            console.error('❌ Retry with sanitized data failed:', retryError);
          }
        }

        // Schedule retry for network errors
        if (shouldRetry) {
          setTimeout(() => {
            console.log('🔄 Retrying auto-save after network error...');
            debouncedSave(entryToSave);
          }, 30000); // Retry after 30 seconds
        }

        // Show user-friendly error message
        toast({
          title: "Save failed",
          description,
          variant: "destructive",
        });

        setSaveStatus('failed');
        // Reset to idle after showing failed status for 3 seconds
        setTimeout(() => setSaveStatus('idle'), 3000);
      } finally {
        setIsSaving(false);
      }
    }, debounceDelay); // Adaptive debounce delay
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

      // Remove from localStorage as well (both keys)
      const entryIdKey = `journal-entry-${currentEntry.id}`;
      const dateKey = `journal-${currentEntry.date}`;
      localStorage.removeItem(entryIdKey);
      localStorage.removeItem(dateKey);

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
    if (!currentEntry || entrySwitchLockRef.current) return;

    setIsSaving(true);
    setSaveStatus('saving');
    try {
      const updatedEntry = {
        ...currentEntry,
        updatedAt: new Date()
      };

      // Save to localStorage as immediate backup using standardized format
      const entryIdKey = `journal-entry-${currentEntry.id}`;
      const dateKey = `journal-${currentEntry.date}`;

      localStorage.setItem(entryIdKey, JSON.stringify(updatedEntry));
      localStorage.setItem(dateKey, entryIdKey);

      // Save to Supabase with rich text content
      try {
        // Check if this is a temporary/recovery entry that needs to be created first
        if (currentEntry.id.startsWith('temp-') || currentEntry.id.startsWith('recovery-')) {
          console.log('Creating new entry in Supabase for temporary ID:', currentEntry.id);

          // Create a new entry in Supabase
          const { createJournalEntry } = await import('@/lib/journal');
          const newSupabaseEntry = await createJournalEntry({
            entry_date: currentEntry.date,
            entry_type: 'general',
            excited_about: '',
            make_today_great: '',
          });

          // Update the entry with the real Supabase ID
          const realEntry = {
            ...currentEntry,
            id: newSupabaseEntry.id,
            blocks: currentEntry.blocks.map(block => ({
              ...block,
              id: block.id.replace(currentEntry.id, newSupabaseEntry.id)
            }))
          };

          // Now save the blocks to the real entry
          await updateJournalEntryFromBlocks(newSupabaseEntry.id, realEntry.blocks);

          // Update localStorage with the real ID
          const newEntryIdKey = `journal-entry-${newSupabaseEntry.id}`;
          const dateKey = `journal-${currentEntry.date}`;
          localStorage.setItem(newEntryIdKey, JSON.stringify(realEntry));
          localStorage.setItem(dateKey, newEntryIdKey);

          // Remove old temporary entry from localStorage
          const oldEntryIdKey = `journal-entry-${currentEntry.id}`;
          localStorage.removeItem(oldEntryIdKey);

          // Update the current entry state
          setCurrentEntry(realEntry);
          onEntryUpdate(realEntry);

          console.log('Successfully created and saved new entry:', newSupabaseEntry.id);
        } else {
          // Regular update for existing entries
          await updateJournalEntryFromBlocks(currentEntry.id, currentEntry.blocks);
          console.log('Successfully updated existing entry:', currentEntry.id);
        }

        setSaveStatus('saved');
        setLastSaveTime(new Date());
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (supabaseError) {
        console.warn('Failed to save to Supabase, localStorage backup saved:', supabaseError);
        setSaveStatus('saved'); // Still show as saved since localStorage worked
        setLastSaveTime(new Date());
        setTimeout(() => setSaveStatus('idle'), 2000);
      }

      setCurrentEntry(updatedEntry);
      onEntryUpdate(updatedEntry);
    } catch (error) {
      console.error('Error saving entry:', error);
      setSaveStatus('failed');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Manual save function for the save button
  const handleManualSave = async (): Promise<void> => {
    if (!currentEntry) return;

    // Clear any pending auto-save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    await saveEntry();

    toast({
      title: "Saved",
      description: "Your journal entry has been saved successfully.",
    });
  };


  // Performance monitoring function
  const checkPerformance = useCallback((entry: JournalEntry) => {
    const totalTextLength = entry.blocks.reduce((total, block) => total + block.text.length, 0);
    const blockCount = entry.blocks.length;

    // Clear existing warning
    setPerformanceWarning(null);

    // Performance thresholds
    if (blockCount > 200 || totalTextLength > 50000) {
      setPerformanceWarning('Very large entry detected. Consider splitting into multiple entries for better performance.');
    } else if (blockCount > 100 || totalTextLength > 20000) {
      setPerformanceWarning('Large entry detected. Performance may be affected with very long content.');
    }

    // Log performance metrics
    if (blockCount > 50 || totalTextLength > 5000) {
      console.log(`📊 Performance metrics: ${blockCount} blocks, ${totalTextLength} characters`);
    }
  }, []);

  const handleBlocksChange = (blocks: JournalBlock[]): void => {
    if (!currentEntry) return;
    const updatedEntry = {
      ...currentEntry,
      blocks,
      updatedAt: new Date()
    };
    setCurrentEntry(updatedEntry);
    onEntryUpdate(updatedEntry);

    // Performance monitoring with debouncing
    if (performanceCheckRef.current) {
      clearTimeout(performanceCheckRef.current);
    }
    performanceCheckRef.current = setTimeout(() => {
      checkPerformance(updatedEntry);
    }, 2000); // Check performance 2 seconds after user stops typing

    // Auto-save with debouncing
    debouncedSave(updatedEntry);
  };

  useEffect(() => {
    const switchEntry = async () => {
      // Prevent concurrent entry switches
      if (entrySwitchLockRef.current) return;
      
      // Save current entry before switching to new one
      if (currentEntry && currentEntry.id !== entry.id) {
        entrySwitchLockRef.current = true;
        setIsSwitchingEntry(true);
        
        try {
          // Clear any pending debounced saves first
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
          }
          
          // Save current entry and wait for completion
          await saveEntry();
          
          // Update to new entry
          setCurrentEntry(entry);
        } catch (error) {
          console.error('Error during entry switch:', error);
          // Still switch entry even if save fails
          setCurrentEntry(entry);
        } finally {
          setIsSwitchingEntry(false);
          entrySwitchLockRef.current = false;
        }
      } else {
        // No save needed, just update entry
        setCurrentEntry(entry);
      }
    };

    switchEntry();
  }, [entry, currentEntry, saveEntry]);

  // Cleanup timeouts on unmount
  useEffect((): (() => void) => {
    return (): void => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (performanceCheckRef.current) {
        clearTimeout(performanceCheckRef.current);
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
            {/* Enhanced save status indicators */}
            {saveStatus === 'saving' && (
              <div className="text-xs text-blue-600 mt-1 flex items-center justify-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                Saving...
              </div>
            )}
            {saveStatus === 'saved' && (
              <div className="text-xs text-green-600 mt-1 flex items-center justify-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Saved
              </div>
            )}
            {saveStatus === 'failed' && (
              <div className="text-xs text-red-600 mt-1 flex items-center justify-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Save failed
              </div>
            )}
            {saveStatus === 'idle' && lastSaveTime && (
              <div className="text-xs text-stone-400 mt-1">
                Last saved {format(lastSaveTime, 'h:mm a')}
              </div>
            )}
            {performanceWarning && (
              <div className="text-xs text-amber-600 mt-1 max-w-xs text-center">
                ⚠️ {performanceWarning}
              </div>
            )}
          </div>

          {/* Right side - Save and Plus buttons */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleManualSave}
              disabled={isSaving || saveStatus === 'saving'}
              className="h-8 w-8 p-0 hover:bg-stone-100 rounded-lg"
              title="Save manually"
            >
              <Save className={`h-4 w-4 ${
                saveStatus === 'saving' ? 'text-blue-500 animate-pulse' :
                saveStatus === 'saved' ? 'text-green-500' :
                saveStatus === 'failed' ? 'text-red-500' :
                'text-stone-600'
              }`} />
            </Button>
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
            <SafeEditorWrapper>
              <EnhancedRichTextEditor
                blocks={currentEntry.blocks}
                onChange={handleBlocksChange}
              />
            </SafeEditorWrapper>
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
});