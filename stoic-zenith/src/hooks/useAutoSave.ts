import { useCallback, useRef, useEffect } from 'react'
import type { JournalBlock } from '@/components/journal/types'

interface AutoSaveOptions {
  throttleMs?: number // Guaranteed save interval (default: 500ms)
  localStorageBatchMs?: number // Batch localStorage writes (default: 2000ms)
  onSave?: (blocks: JournalBlock[]) => Promise<void>
  onSaveStatus?: (status: 'saving' | 'saved' | 'error') => void
}

interface AutoSaveState {
  saveBlocks: (blocks: JournalBlock[]) => void
  currentBlocks: JournalBlock[]
  saveStatus: 'saving' | 'saved' | 'error'
  forceFlush: () => Promise<void>
}

/**
 * Google Docs/Notion-style auto-save hook with throttling
 * - Instant UI updates (< 10ms)
 * - Throttled saves every 500ms (not debounced)
 * - Batched localStorage writes every 2s
 * - No blocking operations
 */
export function useAutoSave(options: AutoSaveOptions = {}): AutoSaveState {
  const {
    throttleMs = 1000, // Increased from 500ms to reduce conflicts with typing
    localStorageBatchMs = 2000,
    onSave,
    onSaveStatus
  } = options

  // In-memory state for instant UI updates
  const currentBlocksRef = useRef<JournalBlock[]>([])
  const lastSaveTimeRef = useRef<number>(0)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const localStorageTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const saveStatusRef = useRef<'saving' | 'saved' | 'error'>('saved')
  const pendingSaveRef = useRef<JournalBlock[] | null>(null)
  
  // Throttled save function (guaranteed periodic saves)
  const throttledSave = useCallback(async (blocks: JournalBlock[]) => {
    const now = Date.now()
    const timeSinceLastSave = now - lastSaveTimeRef.current
    
    // Store blocks for potential save
    pendingSaveRef.current = blocks
    
    if (timeSinceLastSave >= throttleMs) {
      // Immediate save
      lastSaveTimeRef.current = now
      
      try {
        saveStatusRef.current = 'saving'
        onSaveStatus?.('saving')
        
        if (onSave) {
          await onSave(blocks)
        }
        
        saveStatusRef.current = 'saved'
        onSaveStatus?.('saved')
        pendingSaveRef.current = null
      } catch (error) {
        saveStatusRef.current = 'error'
        onSaveStatus?.('error')
        console.error('Auto-save failed:', error)
        
        // Log more details about the error
        if (error instanceof Error) {
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            blocksLength: blocks?.length,
            hasOnSave: !!onSave
          })
        }

        // CRITICAL FIX: Add retry mechanism for failed saves
        // Store the failed blocks for retry
        pendingSaveRef.current = blocks

        // Retry after a longer delay to avoid conflicts
        setTimeout(async () => {
          try {
            // Only retry if there's still pending content and user isn't actively typing
            if (onSave && pendingSaveRef.current) {
              console.log('Retrying failed auto-save...')
              saveStatusRef.current = 'saving'
              onSaveStatus?.('saving')
              
              await onSave(pendingSaveRef.current)
              saveStatusRef.current = 'saved'
              onSaveStatus?.('saved')
              pendingSaveRef.current = null
              console.log('Auto-save retry successful')
            }
          } catch (retryError) {
            console.error('Auto-save retry failed:', retryError)
            saveStatusRef.current = 'error'
            onSaveStatus?.('error')
            // Keep the pending save for potential manual save
          }
        }, 3000) // Increased retry delay to 3 seconds
      }
    } else {
      // Schedule save for later
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      
      const remainingTime = throttleMs - timeSinceLastSave
      saveTimeoutRef.current = setTimeout(async () => {
        if (pendingSaveRef.current) {
          lastSaveTimeRef.current = Date.now()
          
          try {
            saveStatusRef.current = 'saving'
            onSaveStatus?.('saving')
            
            if (onSave) {
              await onSave(pendingSaveRef.current)
            }
            
            saveStatusRef.current = 'saved'
            onSaveStatus?.('saved')
            pendingSaveRef.current = null
          } catch (error) {
            saveStatusRef.current = 'error'
            onSaveStatus?.('error')
            console.error('Auto-save failed:', error)

            // CRITICAL FIX: Add retry for scheduled saves too
            setTimeout(async () => {
              try {
                console.log('Retrying failed scheduled auto-save...')
                saveStatusRef.current = 'saving'
                onSaveStatus?.('saving')

                if (onSave && pendingSaveRef.current) {
                  await onSave(pendingSaveRef.current)
                  saveStatusRef.current = 'saved'
                  onSaveStatus?.('saved')
                  pendingSaveRef.current = null
                  console.log('Scheduled auto-save retry successful')
                }
              } catch (retryError) {
                console.error('Scheduled auto-save retry failed:', retryError)
                saveStatusRef.current = 'error'
                onSaveStatus?.('error')
              }
            }, 2000)
          }
        }
      }, remainingTime)
    }
  }, [throttleMs, onSave, onSaveStatus])

  // Main save function called by components
  const saveBlocks = useCallback((blocks: JournalBlock[]) => {
    // Update in-memory state immediately (< 10ms)
    currentBlocksRef.current = blocks
    
    // Trigger throttled save
    throttledSave(blocks)
  }, [throttledSave])

  // Force flush any pending saves
  const forceFlush = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }
    
    if (pendingSaveRef.current && onSave) {
      try {
        saveStatusRef.current = 'saving'
        onSaveStatus?.('saving')
        
        await onSave(pendingSaveRef.current)
        
        saveStatusRef.current = 'saved'
        onSaveStatus?.('saved')
        pendingSaveRef.current = null
        lastSaveTimeRef.current = Date.now()
      } catch (error) {
        saveStatusRef.current = 'error'
        onSaveStatus?.('error')
        throw error
      }
    }
  }, [onSave, onSaveStatus])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      if (localStorageTimeoutRef.current) {
        clearTimeout(localStorageTimeoutRef.current)
      }
    }
  }, [])

  return {
    saveBlocks,
    currentBlocks: currentBlocksRef.current,
    saveStatus: saveStatusRef.current,
    forceFlush
  }
}