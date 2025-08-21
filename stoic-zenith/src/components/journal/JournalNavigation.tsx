import React, { useState, useEffect, useCallback, useRef } from 'react'
import { format } from 'date-fns'
import {
  MoreHorizontal,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle,
  BookTemplate,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAutoSave } from '@/hooks/useAutoSave'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { EnhancedRichTextEditor } from './EnhancedRichTextEditor'
import { SafeEditorWrapper } from './SafeEditorWrapper'
import { JournalEntry, JournalBlock } from './types'
import { PromptDropdown } from './PromptDropdown'
import type { RealTimeJournalManager } from '@/lib/journal'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { toast } from '@/components/ui/use-toast'

interface JournalNavigationProps {
  className?: string
  entry: JournalEntry
  onEntryUpdate: (entry: JournalEntry) => void
  onUpdateEntryWithIdChange?: (
    entryId: string,
    blocks: JournalBlock[],
    onIdChange?: (newId: string) => void
  ) => Promise<void>
  onCreateEntry?: () => void
  onDeleteEntry?: (entryId: string) => void
  isCreatingEntry?: boolean
  syncStatus?: 'synced' | 'pending' | 'error'
  journalManager: RealTimeJournalManager
  hasOtherEntries?: boolean
  onOpenTemplates?: () => void
  onSelectPrompt?: (promptText: string) => void
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
  journalManager,
  hasOtherEntries = false,
  onOpenTemplates,
  onSelectPrompt,
}: JournalNavigationProps): JSX.Element {
  const [currentEntry, setCurrentEntry] = useState<JournalEntry>(entry)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error'>(
    'saved'
  )

  // Use ref to store the latest entry state to prevent stale closures
  const currentEntryRef = useRef<JournalEntry>(entry)

  // Simplified ID tracking - keep temp IDs stable during session
  const currentEntryIdRef = useRef(currentEntry.id)

  // Track last save time for autosave monitoring
  const lastSaveTimeRef = useRef<number>(0)

  // Update ref whenever currentEntry changes
  useEffect(() => {
    currentEntryRef.current = currentEntry
    currentEntryIdRef.current = currentEntry.id
  }, [currentEntry])

  // Auto-save hook with simplified Notion-style saves
  const { saveBlocks, forceFlush } = useAutoSave({
    onSave: async blocks => {
      const entryId = currentEntryIdRef.current

      if (!entryId) {
        throw new Error('No entry ID available for auto-save')
      }

      if (!journalManager?.userId || journalManager.userId === '') {
        throw new Error(
          'Journal manager missing user context - cannot save entry'
        )
      }

      // Direct save without complex ID mapping
      await journalManager.updateEntryImmediately(entryId, blocks)
    },
    onSaveStatus: setSaveStatus,
  })

  const selectedDate = new Date(currentEntry.date)

  // Instant UI updates with throttled auto-save (Google Docs style)
  const handleBlocksChange = useCallback(
    (blocks: JournalBlock[]): void => {
      try {
        // Update local UI immediately (< 10ms)
        const updatedEntry: JournalEntry = {
          ...currentEntryRef.current,
          blocks,
          updatedAt: new Date(),
        }
        setCurrentEntry(updatedEntry)

        // Trigger throttled auto-save
        saveBlocks(blocks)

        // Update last save time
        lastSaveTimeRef.current = Date.now()

        // Update parent immediately for UI consistency
        // Use requestAnimationFrame to avoid blocking the UI thread
        requestAnimationFrame(() => {
          try {
            onEntryUpdate(updatedEntry)
          } catch (error) {
            // Error logging removed - use debug utility if needed
          }
        })
      } catch (error) {
        console.error('Critical error in handleBlocksChange:', error)
        // Try to at least save the blocks even if UI update fails
        try {
          saveBlocks(blocks)
        } catch (saveError) {
          console.error('Failed to save blocks after error:', saveError)
        }
      }
    },
    [saveBlocks, onEntryUpdate]
  )

  // INSTANT ENTRY DELETION (immediate UI feedback)
  const handleDeleteEntry = useCallback(async (): Promise<void> => {
    const entryId = currentEntry.id
    const isTemporary = entryId.startsWith('temp-')

    try {
      // Close dialog first
      setShowDeleteDialog(false)

      // Delete using real-time manager
      await journalManager.deleteEntryImmediately(entryId)

      // Call parent delete handler immediately
      onDeleteEntry?.(entryId)

      toast({
        title: 'Entry deleted',
        description: `Your journal entry has been removed${isTemporary ? ' (was not yet saved to server)' : ''}.`,
        variant: 'default',
      })
    } catch (error) {
      console.error('Failed to delete entry:', error)
      toast({
        title: 'Entry deleted locally',
        description:
          'Entry removed from local storage. Will sync when connection is restored.',
        variant: 'default',
      })
    }
  }, [currentEntry.id, onDeleteEntry])

  // Simplified entry synchronization - stable IDs during session
  useEffect(() => {
    const currentEntryFromRef = currentEntryRef.current

    // Different entry ID - switch entries
    if (entry.id !== currentEntryFromRef.id) {
      forceFlush().catch(console.error)
      setCurrentEntry(entry)
      currentEntryIdRef.current = entry.id
      return
    }

    // Same ID - only update if parent has significantly newer content
    const parentUpdatedAt = new Date(entry.updatedAt).getTime()
    const currentUpdatedAt = new Date(currentEntryFromRef.updatedAt).getTime()
    const hasContentDifference =
      JSON.stringify(entry.blocks) !==
      JSON.stringify(currentEntryFromRef.blocks)

    if (parentUpdatedAt > currentUpdatedAt + 2000 && hasContentDifference) {
      setCurrentEntry(entry)
      currentEntryIdRef.current = entry.id
    }
  }, [entry, forceFlush])

  // Removed complex health check - let useAutoSave handle retries

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
          {/* Templates Button */}
          {onOpenTemplates && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenTemplates}
              className="flex items-center gap-2"
            >
              <BookTemplate className="h-4 w-4" />
              Templates
            </Button>
          )}

          {/* Prompts Dropdown */}
          {onSelectPrompt && <PromptDropdown onSelectPrompt={onSelectPrompt} />}

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
                onClick={async e => {
                  e.preventDefault()
                  e.stopPropagation()

                  try {
                    // Force flush any pending saves
                    await forceFlush()
                    toast({
                      title: 'Entry saved',
                      description:
                        'Your journal entry has been saved successfully.',
                      variant: 'default',
                    })
                  } catch (error) {
                    // Error logging removed - use debug utility if needed
                    toast({
                      title: 'Save failed',
                      description: 'Failed to save entry. Please try again.',
                      variant: 'destructive',
                    })
                  }
                }}
                disabled={saveStatus === 'saving'}
              >
                <Save className="h-4 w-4 mr-2" />
                {saveStatus === 'saving' ? 'Saving...' : 'Save Now'}
              </DropdownMenuItem>

              {onCreateEntry && (
                <DropdownMenuItem
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()

                    onCreateEntry()
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
      <div
        className="flex-1 overflow-hidden bg-white min-h-0"
        style={{ backgroundColor: '#ffffff' }}
      >
        <ErrorBoundary>
          <SafeEditorWrapper>
            <EnhancedRichTextEditor
              key={currentEntry.id} // Stable key based on entry ID
              blocks={currentEntry.blocks}
              onChange={handleBlocksChange}
              showPlaceholder={!hasOtherEntries}
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
              Are you sure you want to delete this journal entry? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEntry}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
})
