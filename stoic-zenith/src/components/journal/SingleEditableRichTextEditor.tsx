import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
} from 'react'
import { nanoid } from 'nanoid'
import { CommandMenu } from './CommandMenu'
import { JournalBlock, CommandOption } from './types'
import {
  detectShortcutPattern,
  shouldTriggerAutoConversion,
} from './shortcutPatterns'
import {
  findBlockElement,
  getBlockId,
  getCurrentBlockPosition,
  setCaretPosition,
  updateNumberedListCounters,
  BLOCK_MARKER_ATTRIBUTE,
  getBlockClassName,
} from './blockUtils'
import { selectionManager } from './selectionUtils'

interface SingleEditableRichTextEditorProps {
  blocks: JournalBlock[]
  onChange: (blocks: JournalBlock[]) => void
}

export function SingleEditableRichTextEditor({
  blocks,
  onChange,
}: SingleEditableRichTextEditorProps): JSX.Element {

  const [showCommandMenu, setShowCommandMenu] = useState(false)
  

  const [commandMenuPosition, setCommandMenuPosition] = useState({ x: 0, y: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)
  const [isAutoConverting, setIsAutoConverting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const dragCleanupRef = useRef<(() => void) | null>(null)
  const editingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const inputThrottleRef = useRef<NodeJS.Timeout | null>(null)

  const createNewBlock = (
    type: JournalBlock['type'] = 'paragraph',
    level?: number
  ): JournalBlock => ({
    id: `block-${nanoid()}`,
    type,
    level: level as 1 | 2 | 3,
    text: '',
    createdAt: new Date(),
  })



  const handleEditingStart = useCallback(
    (blockId: string) => {
      // Always allow editing to start for slash commands
      setIsEditing(true)
      setEditingBlockId(blockId)

      // Clear any existing timeout
      if (editingTimeoutRef.current) {
        clearTimeout(editingTimeoutRef.current)
      }
    },
    []
  )

  const handleEditingEnd = useCallback(() => {
    // For modern editor behavior, stay in editing mode longer
    // Only exit editing mode if user explicitly clicks away and there's content
    editingTimeoutRef.current = setTimeout(() => {
      const hasContent = blocks.some(block => block.text.trim() !== '')

      // Only exit editing mode if there's substantial content
      if (hasContent && blocks.length > 1) {
        setIsEditing(false)
        setEditingBlockId(null)
      } else {
        // Stay in editing mode for empty or single-block entries
        // This provides a better writing experience like Notion
        setIsEditing(true)
      }
    }, 2000) // Longer delay for better UX
  }, [blocks])



  // Monitor content changes to ensure proper font handling
  useEffect(() => {
    const hasContent = blocks.some(block => block.text.trim() !== '')

    if (!hasContent && editorRef.current) {
      // When content is empty, ensure proper font styling
      const blockElements = editorRef.current.querySelectorAll('.block-element')
      blockElements.forEach(element => {
        element.classList.add('force-inknut-font')
      })

      // Also ensure the main editor container has proper font
      editorRef.current.style.fontFamily = 'var(--font-inknut-antiqua), serif'
    } else if (editorRef.current) {
      // Remove force font class when content exists
      const blockElements = editorRef.current.querySelectorAll('.block-element')
      blockElements.forEach(element => {
        element.classList.remove('force-inknut-font')
      })

      // Reset editor container font to default
      editorRef.current.style.fontFamily = ''
    }
  }, [blocks])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return (): void => {
      if (editingTimeoutRef.current) {
        clearTimeout(editingTimeoutRef.current)
      }
      if (inputThrottleRef.current) {
        clearTimeout(inputThrottleRef.current)
      }
    }
  }, [])

  // Removed syncBlocksFromDOM to prevent React virtual DOM conflicts
  // All DOM updates are now handled through React state changes only

  const updateBlock = useCallback(
    (blockId: string, updates: Partial<JournalBlock>): void => {
      const updatedBlocks = blocks.map(block =>
        block.id === blockId ? { ...block, ...updates } : block
      )
      onChange(updatedBlocks)
    },
    [blocks, onChange]
  )

  const addBlock = useCallback(
    (afterBlockId?: string): string => {
      const newBlock = createNewBlock()

      // Performance optimization: Use more efficient array operations for large content
      if (!afterBlockId) {
        // Simple append case
        onChange([...blocks, newBlock])
      } else {
        const index = blocks.findIndex(b => b.id === afterBlockId)

        // For large arrays, use more efficient insertion
        if (blocks.length > 50) {
          // Use Array.from for better performance with large arrays
          const newBlocks = Array.from(blocks)
          newBlocks.splice(index + 1, 0, newBlock)
          onChange(newBlocks)
        } else {
          // Standard approach for smaller arrays
          const newBlocks = [...blocks]
          newBlocks.splice(index + 1, 0, newBlock)
          onChange(newBlocks)
        }
      }

      return newBlock.id
    },
    [blocks, onChange]
  )

  const deleteBlock = useCallback(
    (blockId: string): void => {
      if (blocks.length === 1) {
        // Instead of preventing deletion, clear the content but keep the block
        // This maintains the editing state and typography
        updateBlock(blockId, { text: '' })
        return
      }
      
      // Skip DOM manipulation - let React handle the cleanup
      // This prevents the "removeChild" errors we were seeing
      
      const updatedBlocks = blocks.filter(block => block.id !== blockId)
      onChange(updatedBlocks)
    },
    [blocks, onChange, updateBlock]
  )

  const focusBlock = useCallback(
    (blockId: string, offset: number = 0): void => {
      // Performance optimization: Skip complex focus operations for very large content
      if (blocks.length > 100) {
        // For very large content, use a simplified focus approach
        try {
          const blockElement = document.querySelector(
            `[${BLOCK_MARKER_ATTRIBUTE}="${blockId}"]`
          ) as HTMLElement
          if (blockElement) {
            blockElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            blockElement.focus()
          }
        } catch (error) {
          console.warn('Simplified focus warning (safely ignored):', error)
        }
        return
      }

      // Use requestAnimationFrame for immediate but smooth focus
      requestAnimationFrame(() => {
        try {
          // Check if the block exists before trying to focus it
          const blockElement = document.querySelector(
            `[${BLOCK_MARKER_ATTRIBUTE}="${blockId}"]`
          ) as HTMLElement
          if (!blockElement) {
            return
          }

          // Ensure the parent contentEditable is focused first
          const contentEditableParent = blockElement.closest('[contenteditable]') as HTMLElement
          if (contentEditableParent && document.activeElement !== contentEditableParent) {
            contentEditableParent.focus()
          }

          // Small delay to ensure proper focus state
          setTimeout(() => {
            setCaretPosition(blockId, offset)
          }, 5)
        } catch (error) {
          // Ignore DOM manipulation errors - they're expected during React re-renders
          console.warn('Focus block warning (safely ignored):', error)
        }
      })
    },
    [blocks.length]
  )

  const selectAllContent = useCallback((): void => {
    if (!editorRef.current || blocks.length === 0) return

    try {
      const selection = window.getSelection()
      if (!selection) return

      // Find all block elements
      const blockElements = Array.from(editorRef.current.querySelectorAll(`[${BLOCK_MARKER_ATTRIBUTE}]`)) as HTMLElement[]

      if (blockElements.length === 0) return

      const firstBlock = blockElements[0]
      const lastBlock = blockElements[blockElements.length - 1]

      const range = document.createRange()

      // Set range from start of first block to end of last block
      range.setStart(firstBlock, 0)
      range.setEnd(lastBlock, lastBlock.childNodes.length)

      selection.removeAllRanges()
      selection.addRange(range)
    } catch (error) {
      console.warn('Failed to select all content:', error)
    }
  }, [blocks])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent): void => {
      // Handle line selection shortcuts first
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'l':
            e.preventDefault()
            selectionManager.selectCurrentLine()
            return
          case 'a':
            // Handle Ctrl+A - select all content across blocks
            e.preventDefault()
            selectAllContent()
            setIsEditing(true)
            return
          case 'ArrowUp':
            if (e.shiftKey) {
              e.preventDefault()
              selectionManager.extendSelectionUp()
              return
            }
            break
          case 'ArrowDown':
            if (e.shiftKey) {
              e.preventDefault()
              selectionManager.extendSelectionDown()
              return
            }
            break
        }
      }

      // Handle Delete and Backspace when all content might be selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selection = window.getSelection()
        if (selection && !selection.isCollapsed) {
          // Check if all or most content is selected
          const selectedText = selection.toString()
          const totalText = editorRef.current?.textContent || ''

          if (selectedText.length >= totalText.length * 0.9) { // 90% or more selected


            // Ensure we stay in editing mode but with proper font handling
            setIsEditing(true)

            // After deletion, we'll have empty content, so we need to ensure proper font
            setTimeout(() => {
              // Force re-render of blocks to apply proper typography
              const emptyBlock = createNewBlock('paragraph')
              onChange([emptyBlock])

              // Focus the new empty block
              requestAnimationFrame(() => {
                focusBlock(emptyBlock.id, 0)
              })
            }, 0)
          }
        }
      }

      const currentPosition = getCurrentBlockPosition()
      if (!currentPosition) return

      const { blockId } = currentPosition
      const block = blocks.find(b => b.id === blockId)
      if (!block) return

      // Handle markdown shortcuts on space key
      if (e.key === ' ') {
        const blockElement = document.querySelector(
          `[${BLOCK_MARKER_ATTRIBUTE}="${blockId}"]`
        )
        const currentText = blockElement?.textContent || ''

        if (shouldTriggerAutoConversion(currentText, ' ')) {
          e.preventDefault()
          const pattern = detectShortcutPattern(currentText + ' ')
          if (pattern) {
            setIsAutoConverting(true)
            updateBlock(blockId, {
              type: pattern.type,
              level: pattern.level as 1 | 2 | 3,
              text: '',
            })
            setTimeout(() => {
              focusBlock(blockId, 0)
              setIsAutoConverting(false)
            }, 100)
            return
          }
        }
      }

      if (e.key === 'Enter') {
        e.preventDefault()

        if (showCommandMenu) {
          setShowCommandMenu(false)
          return
        }

        // Performance optimization: Batch DOM operations and reduce re-renders
        const newBlockId = addBlock(blockId)

        // Use a more efficient focus strategy for large content
        if (blocks.length > 30) {
          // For large content, use a simpler focus approach to avoid performance issues
          setTimeout(() => {
            const blockElement = document.querySelector(
              `[${BLOCK_MARKER_ATTRIBUTE}="${newBlockId}"]`
            ) as HTMLElement
            if (blockElement) {
              blockElement.focus()
              // Set cursor to beginning of new block
              const range = document.createRange()
              const selection = window.getSelection()
              if (selection) {
                range.setStart(blockElement, 0)
                range.collapse(true)
                selection.removeAllRanges()
                selection.addRange(range)
              }
            }
          }, 0)
        } else {
          // Standard focus approach for smaller content
          requestAnimationFrame(() => {
            focusBlock(newBlockId, 0)
          })
        }
      } else if (e.key === 'Backspace') {
        const blockElement = document.querySelector(
          `[${BLOCK_MARKER_ATTRIBUTE}="${blockId}"]`
        )
        if (blockElement && blockElement.textContent === '') {
          e.preventDefault()
          deleteBlock(blockId)
          const currentIndex = blocks.findIndex(b => b.id === blockId)
          if (currentIndex > 0) {
            const prevBlock = blocks[currentIndex - 1]
            requestAnimationFrame(() => focusBlock(prevBlock.id, prevBlock.text.length))
          }
        }
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const currentIndex = blocks.findIndex(b => b.id === blockId)
        const targetIndex =
          e.key === 'ArrowUp' ? currentIndex - 1 : currentIndex + 1

        if (targetIndex >= 0 && targetIndex < blocks.length) {
          const selection = window.getSelection()
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            const offset = range.startOffset

            e.preventDefault()
            const targetBlock = blocks[targetIndex]
            requestAnimationFrame(() =>
              focusBlock(
                targetBlock.id,
                Math.min(offset, targetBlock.text.length)
              )
            )
          }
        }
      } else if (e.key === 'Escape') {
        setShowCommandMenu(false)
      }
    },
    [blocks, showCommandMenu, addBlock, deleteBlock, focusBlock, updateBlock]
  )

  const handleInput = useCallback(
    (e: React.FormEvent<HTMLDivElement>): void => {
      const target = e.target as HTMLElement

      const blockElement = findBlockElement(target)

      if (!blockElement) {
        return
      }

      const blockId = getBlockId(blockElement)

      if (!blockId) {
        return
      }

      // Get text from block element and clean it
      let text = blockElement.textContent || ''

      // Clean the text by removing zero-width spaces and other invisible characters
      const cleanText = text.replace(/[\u200B-\u200D\uFEFF]/g, '')

      // CRITICAL FIX: Always update immediately to prevent content loss
      // Remove throttling that could cause truncation issues
      console.log(`📝 Input detected: blockId=${blockId}, length=${cleanText.length}, total blocks=${blocks.length}`);

      // Clear any existing throttle to prevent conflicts
      if (inputThrottleRef.current) {
        clearTimeout(inputThrottleRef.current)
        inputThrottleRef.current = null
      }

      // Always update immediately - no delays that could cause content loss
      updateBlock(blockId, { text: cleanText })
      console.log(`✅ Block updated immediately: ${blockId}, content length: ${cleanText.length}`);

      // Enhanced slash command and splash command debugging
      const isSlashCommand = cleanText.startsWith('/')
      const isSplashCommand = cleanText.toLowerCase().startsWith('splash')
      const menuCurrentlyShown = showCommandMenu

      // Always trigger editing state for proper typography switching
      handleEditingStart(blockId)



      // Handle slash commands and splash commands
      if ((isSlashCommand || isSplashCommand) && !menuCurrentlyShown) {
        const rect = blockElement.getBoundingClientRect()
        const position = {
          x: Math.max(0, rect.left),
          y: Math.max(0, rect.bottom + 5),
        }

        // Extract search query based on trigger type
        let searchQuery = ''
        if (isSlashCommand) {
          searchQuery = cleanText.slice(1)
        } else if (isSplashCommand) {
          searchQuery = cleanText.slice(6) // Remove "splash" (6 characters)
        }

        setCommandMenuPosition(position)
        setSearchQuery(searchQuery)
        setActiveBlockId(blockId)
        setShowCommandMenu(true)
      } else if (!isSlashCommand && !isSplashCommand && menuCurrentlyShown) {
        setShowCommandMenu(false)
      } else if ((isSlashCommand || isSplashCommand) && menuCurrentlyShown) {
        // Update search query based on trigger type
        let newQuery = ''
        if (isSlashCommand) {
          newQuery = cleanText.slice(1)
        } else if (isSplashCommand) {
          newQuery = cleanText.slice(6) // Remove "splash" (6 characters)
        }
        
        setSearchQuery(newQuery)
      }

      // Update numbered list counters after text changes
      if (editorRef.current) {
        updateNumberedListCounters(editorRef.current)
      }
    },
    [updateBlock, showCommandMenu, handleEditingStart]
  )

  const handleImageUpload = useCallback(
    (blockId: string): void => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = (e): void => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (e): void => {
            const imageUrl = e.target?.result as string

            // Update the current block to be an image block
            updateBlock(blockId, {
              type: 'image',
              imageUrl,
              imageAlt: file.name,
              text: file.name,
            })

            // Add a new paragraph block after the image for continued text editing
            const newBlockId = addBlock(blockId)

            // Focus the new paragraph block after a short delay to ensure DOM updates
            setTimeout(() => {
              focusBlock(newBlockId, 0)
            }, 100) // Increased timeout to ensure DOM updates are complete
          }
          reader.readAsDataURL(file)
        }
      }
      input.click()
    },
    [updateBlock, addBlock, focusBlock]
  )

  const handleCommandSelect = useCallback(
    (command: CommandOption): void => {
      if (!activeBlockId) {
        return
      }



      if (command.type === 'image') {
        updateBlock(activeBlockId, { text: '' })
        handleImageUpload(activeBlockId)
      } else {
        updateBlock(activeBlockId, {
          type: command.type,
          level: command.level as 1 | 2 | 3,
          text: '',
        })
      }

      setShowCommandMenu(false)
      const currentActiveBlockId = activeBlockId
      setActiveBlockId(null)

      // After command selection, enter editing mode for the transformed block
      requestAnimationFrame(() => {
        focusBlock(currentActiveBlockId, 0)
        handleEditingStart(currentActiveBlockId)
      })
    },
    [
      activeBlockId,
      updateBlock,
      focusBlock,
      handleImageUpload,
      handleEditingStart,
    ]
  )

  // Let React handle DOM updates naturally - no manual DOM sync needed

  // React-based drag and drop setup
  useEffect(() => {
    if (!editorRef.current) return

    // Clean up previous drag setup
    if (dragCleanupRef.current) {
      dragCleanupRef.current()
    }

    // Setup new drag functionality with multi-line support
    dragCleanupRef.current = selectionManager.setupDragAndDrop(
      editorRef.current
    )

    return (): void => {
      if (dragCleanupRef.current) {
        dragCleanupRef.current()
        dragCleanupRef.current = null
      }
    }
  }, [blocks.length]) // Only depend on blocks.length, not blocks content


  // Initialize with empty block if none exist
  useEffect((): void => {
    if (blocks.length === 0) {
      const newBlock = createNewBlock()
      onChange([newBlock])
      // Start in editing mode for new empty blocks
      setIsEditing(true)
      setEditingBlockId(newBlock.id)
    }
  }, [blocks.length, onChange])

  // Always start in editing mode for better UX
  useEffect(() => {
    if (blocks.length === 1 && blocks[0].text === '') {
      setIsEditing(true)
      setEditingBlockId(blocks[0].id)
    }
  }, [blocks])

  // Focus first block on mount - but only once
  const hasInitiallyFocused = useRef(false)

  useLayoutEffect(() => {
    if (
      typeof window !== 'undefined' &&
      blocks.length > 0 &&
      !hasInitiallyFocused.current
    ) {
      // Only focus on initial mount, not on every blocks.length change
      const isInitialMount = blocks.length === 1 && blocks[0].text === ''

      if (isInitialMount) {
        hasInitiallyFocused.current = true
        
        // Use multiple animation frames to ensure DOM is fully rendered
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Add a small delay to ensure React has fully rendered the block
            setTimeout(() => {
              focusBlock(blocks[0].id, 0)
            }, 10)
          })
        })
      }
    }
  }, [blocks.length, focusBlock])

  // Separate effect to log block changes without auto-focusing
  useEffect(() => {

  }, [blocks.length])

  // Log initial state
  return (
    <div className="relative h-full flex flex-col">
      <style>{`
        /* Text selection styling */
        [contenteditable]::-moz-selection {
          background-color: rgba(59, 130, 246, 0.3);
        }
        [contenteditable]::selection {
          background-color: rgba(59, 130, 246, 0.3);
        }
        

        
        /* Maintain block structure styling */
        .block-element {
          position: relative;
          width: 100%;
        }
        
        .block-element:empty {
          min-height: 1.5rem;
        }
        
        /* Professional appearance */
        .block-element:focus {
          outline: none;
          box-shadow: none;
        }
      `}</style>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={e => {
          e.preventDefault()
          const text = e.clipboardData.getData('text/plain')
          selectionManager.paste(text)
          // React will handle DOM updates automatically
        }}
        onCopy={e => {
          e.preventDefault()
          const text = selectionManager.copySelection()
          e.clipboardData.setData('text/plain', text)
        }}
        onCut={e => {
          e.preventDefault()
          const text = selectionManager.cutSelection()
          e.clipboardData.setData('text/plain', text)
          // React will handle DOM updates automatically
        }}
        onFocus={e => {
          const target = e.target as HTMLElement
          const blockElement = findBlockElement(target)
          if (blockElement) {
            const blockId = getBlockId(blockElement)
            if (blockId) {
              // Start editing immediately for instant response
              handleEditingStart(blockId)
            }
          }
        }}
        onBlur={e => {
          // Don't trigger blur if focus is moving to command menu
          const relatedTarget = e.relatedTarget as HTMLElement
          if (relatedTarget && relatedTarget.closest('[role="menu"]')) {
            
            return
          }

          handleEditingEnd()
        }}
        className={`flex-1 p-6 bg-white focus:ring-0 outline-none overflow-y-auto transition-all duration-200 ${
          isAutoConverting ? 'bg-orange-50' : ''
        }`}
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          userSelect: 'text',
        }}
      >
        {!isEditing && blocks.length === 1 && blocks[0].text === '' && !editingBlockId && (
          <div className="absolute top-6 left-6 text-stone-400 italic text-base leading-relaxed pointer-events-none z-0 select-none transition-opacity duration-200">
            Start writing your thoughts...
          </div>
        )}
        {blocks.map(block => {
          const isCurrentBlockEditing =
            editingBlockId === block.id || (isEditing && !editingBlockId)
          const baseClassName = getBlockClassName(
            block,
            isCurrentBlockEditing
          )
          const className = `${baseClassName} ${block.text === '' ? 'only-zwsp' : ''}`

          if (block.type === 'image' && block.imageUrl) {
            return (
              <div
                key={block.id}
                data-block-id={block.id}
                data-block-type={block.type}
                className={className}

              >
                <img
                  src={block.imageUrl}
                  alt={block.imageAlt || 'Uploaded image'}
                  className="max-w-full h-auto rounded-lg shadow-sm"
                  draggable={false}
                />
              </div>
            )
          }

          return (
            <div
              key={block.id}
              data-block-id={block.id}
              data-block-type={block.type}
              data-block-level={block.level}
              className={className}
              style={{
                // Maintain typography even when empty
                minHeight: '1.5rem',
                position: 'relative',
                zIndex: 1, // Ensure block content appears above placeholder
              }}

            >
              {block.text || '\u200B'}
            </div>
          )
        })}
      </div>

      <CommandMenu
        isOpen={showCommandMenu}
        position={commandMenuPosition}
        searchQuery={searchQuery}
        onSelectCommand={handleCommandSelect}
        onClose={() => setShowCommandMenu(false)}
      />
    </div>
  )
}
