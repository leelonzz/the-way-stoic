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
  placeholder?: string
}

export function SingleEditableRichTextEditor({
  blocks,
  onChange,
  placeholder = "Start writing or type '/' or 'splash' for commands...",
}: SingleEditableRichTextEditorProps): JSX.Element {
  const getPlaceholderText = (blockType: JournalBlock['type']): string => {
    switch (blockType) {
      case 'heading':
        return 'Heading...'
      case 'quote':
        return 'Quote...'
      case 'todo':
        return 'To-do...'
      case 'bullet-list':
        return 'List item...'
      case 'numbered-list':
        return 'Numbered item...'
      case 'code':
        return 'Code...'
      default:
        return 'Type something...'
    }
  }
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
    // Only switch back to display mode if there's actual content
    // This prevents typography reset when all content is cleared
    editingTimeoutRef.current = setTimeout(() => {
      const hasContent = blocks.some(block => block.text.trim() !== '')
      if (hasContent) {
        setIsEditing(false)
        setEditingBlockId(null)
      } else {
        // If no content, ensure proper font styling is applied
        // Force a re-render to apply the correct CSS classes
        if (editorRef.current) {
          const blockElements = editorRef.current.querySelectorAll('.block-element')
          blockElements.forEach(element => {
            // Add a class to force Inknut Antiqua font for empty content
            element.classList.add('force-inknut-font')
          })
        }
      }
      // If no content, stay in editing mode to maintain typography
    }, 500) // 500ms delay to allow for quick re-focus
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

  // Cleanup editing timeout on unmount
  useEffect(() => {
    return (): void => {
      if (editingTimeoutRef.current) {
        clearTimeout(editingTimeoutRef.current)
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

      if (typeof window !== 'undefined' && window.fontLoadingDebug) {
        window.fontLoadingDebug.log(
          `[ADD-BLOCK-DEBUG] Creating block: ${newBlock.id} | After: ${afterBlockId || 'END'}`
        )
      }

      if (!afterBlockId) {
        if (typeof window !== 'undefined' && window.fontLoadingDebug) {
          window.fontLoadingDebug.log(
            `[ADD-BLOCK-DEBUG] Adding to end | Total blocks before: ${blocks.length}`
          )
        }
        onChange([...blocks, newBlock])
      } else {
        const index = blocks.findIndex(b => b.id === afterBlockId)
        if (typeof window !== 'undefined' && window.fontLoadingDebug) {
          window.fontLoadingDebug.log(
            `[ADD-BLOCK-DEBUG] Inserting at index: ${index + 1} | Total blocks before: ${blocks.length}`
          )
        }
        const newBlocks = [...blocks]
        newBlocks.splice(index + 1, 0, newBlock)
        onChange(newBlocks)
      }

      if (typeof window !== 'undefined' && window.fontLoadingDebug) {
        window.fontLoadingDebug.log(
          `[ADD-BLOCK-DEBUG] Block created successfully: ${newBlock.id}`
        )
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
      const updatedBlocks = blocks.filter(block => block.id !== blockId)
      onChange(updatedBlocks)
    },
    [blocks, onChange, updateBlock]
  )

  const focusBlock = useCallback(
    (blockId: string, offset: number = 0): void => {
      if (typeof window !== 'undefined' && window.fontLoadingDebug) {
        window.fontLoadingDebug.log(
          `[FOCUS-DEBUG] Attempting to focus block: ${blockId} at offset: ${offset}`
        )
      }

      // Use requestAnimationFrame for immediate but smooth focus
      requestAnimationFrame(() => {
        if (typeof window !== 'undefined' && window.fontLoadingDebug) {
          window.fontLoadingDebug.log(
            `[FOCUS-DEBUG] Executing setCaretPosition for: ${blockId}`
          )
        }

        // Check if the block exists before trying to focus it
        const blockElement = document.querySelector(
          `[${BLOCK_MARKER_ATTRIBUTE}="${blockId}"]`
        )
        if (!blockElement) {
          if (typeof window !== 'undefined' && window.fontLoadingDebug) {
            window.fontLoadingDebug.log(
              `[FOCUS-DEBUG] ERROR: Block not found: ${blockId}`
            )
          }
          return
        }

        if (typeof window !== 'undefined' && window.fontLoadingDebug) {
          window.fontLoadingDebug.log(
            `[FOCUS-DEBUG] Block found, setting caret position`
          )
        }

        setCaretPosition(blockId, offset)
      })
    },
    []
  )

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
            // Handle Ctrl+A - ensure we maintain proper font state after select all
            // Don't prevent default, let browser handle selection
            // But ensure we're in editing mode for proper handling
            if (typeof window !== 'undefined' && window.fontLoadingDebug) {
              window.fontLoadingDebug.log('[CTRL-A] Select all detected')
            }
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
            if (typeof window !== 'undefined' && window.fontLoadingDebug) {
              window.fontLoadingDebug.log('[DELETE-ALL] Most/all content selected for deletion')
            }

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

        if (typeof window !== 'undefined' && window.fontLoadingDebug) {
          window.fontLoadingDebug.log(
            `[ENTER-DEBUG] Enter pressed | Current block: ${blockId} | Command menu: ${showCommandMenu}`
          )
        }

        if (showCommandMenu) {
          if (typeof window !== 'undefined' && window.fontLoadingDebug) {
            window.fontLoadingDebug.log(`[ENTER-DEBUG] Closing command menu`)
          }
          setShowCommandMenu(false)
          return
        }

        if (typeof window !== 'undefined' && window.fontLoadingDebug) {
          window.fontLoadingDebug.log(
            `[ENTER-DEBUG] Creating new block after: ${blockId}`
          )
        }

        const newBlockId = addBlock(blockId)

        if (typeof window !== 'undefined' && window.fontLoadingDebug) {
          window.fontLoadingDebug.log(
            `[ENTER-DEBUG] New block created: ${newBlockId} | Focusing immediately`
          )
        }

        // Focus immediately using requestAnimationFrame for smooth transition
        requestAnimationFrame(() => {
          if (typeof window !== 'undefined' && window.fontLoadingDebug) {
            window.fontLoadingDebug.log(
              `[ENTER-DEBUG] Focusing new block: ${newBlockId}`
            )
          }
          focusBlock(newBlockId, 0)
        })
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
      console.log('[INPUT-EVENT] Input event triggered')
      
      const target = e.target as HTMLElement
      console.log('[INPUT-EVENT] Target element:', target)
      console.log('[INPUT-EVENT] Target tagName:', target.tagName)
      console.log('[INPUT-EVENT] Target className:', target.className)
      console.log('[INPUT-EVENT] Target contentEditable:', target.contentEditable)
      console.log('[INPUT-EVENT] Target attributes:', target.getAttributeNames())
      console.log('[INPUT-EVENT] Target data-block-id:', target.getAttribute('data-block-id'))
      
      const blockElement = findBlockElement(target)
      console.log('[INPUT-EVENT] Block element found:', blockElement)
      console.log('[INPUT-EVENT] Block element attributes:', blockElement?.getAttributeNames())
      console.log('[INPUT-EVENT] Block element data-block-id:', blockElement?.getAttribute('data-block-id'))
      
      if (!blockElement) {
        console.log('[INPUT-EVENT] No block element found, returning')
        return
      }

      const blockId = getBlockId(blockElement)
      console.log('[INPUT-EVENT] Block ID:', blockId)
      
      if (!blockId) {
        console.log('[INPUT-EVENT] No block ID found, returning')
        return
      }

      // Get text from the entire contentEditable container
      const containerText = editorRef.current?.textContent || ''
      console.log('[INPUT-EVENT] Container text:', containerText)
      
      // For now, let's use the block element text as a fallback
      const text = blockElement.textContent || ''
      console.log('[INPUT-EVENT] Block text:', text)
      
      // Clean the text by removing zero-width spaces and other invisible characters
      const cleanText = text.replace(/[\u200B-\u200D\uFEFF]/g, '')
      
      // Update the block with the clean text
      updateBlock(blockId, { text: cleanText })

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
            updateBlock(blockId, {
              type: 'image',
              imageUrl,
              imageAlt: file.name,
              text: file.name,
            })
          }
          reader.readAsDataURL(file)
        }
      }
      input.click()
    },
    [updateBlock]
  )

  const handleCommandSelect = useCallback(
    (command: CommandOption): void => {
      if (!activeBlockId) {
        if (typeof window !== 'undefined' && window.fontLoadingDebug) {
          window.fontLoadingDebug.log(
            `[SLASH-DEBUG] COMMAND_SELECT_FAILED - no active block ID`
          )
        }
        return
      }

      if (typeof window !== 'undefined' && window.fontLoadingDebug) {
        window.fontLoadingDebug.log(
          `[SLASH-DEBUG] COMMAND_SELECTED: ${command.type} (${command.label}) for block ${activeBlockId}`
        )
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
        requestAnimationFrame(() => focusBlock(blocks[0].id, 0))
      }
    }
  }, [blocks.length, focusBlock])

  // Separate effect to log block changes without auto-focusing
  useEffect(() => {
    if (typeof window !== 'undefined' && window.fontLoadingDebug) {
      window.fontLoadingDebug.log(
        `[BLOCK-CHANGE-DEBUG] Blocks count changed to: ${blocks.length}`
      )
    }
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
        
        /* Typography preservation for empty blocks */
        [data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: rgba(120, 113, 108, 0.6);
          font-style: italic;
          pointer-events: none;
          position: absolute;
          user-select: none;
          font-family: inherit; /* Inherit the current font family */
        }

        /* Ensure editing mode typography is preserved in placeholders */
        .editing-mode[data-placeholder]:empty::before {
          font-family: system-ui, -apple-system, sans-serif;
        }

        .display-mode[data-placeholder]:empty::before {
          font-family: var(--font-inknut-antiqua), serif;
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
            if (typeof window !== 'undefined' && window.fontLoadingDebug) {
              window.fontLoadingDebug.log(
                '[SLASH-DEBUG] BLUR_CANCELLED - focus moving to command menu'
              )
            }
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
        {blocks.length === 0 && (
          <div className={`text-stone-400 italic text-base leading-relaxed font-conditional ${isEditing ? 'editing-mode' : 'display-mode'} pointer-events-none`}>
            Write something...
          </div>
        )}
        {blocks.length === 1 && blocks[0].text === '' && (
          <div className={`text-stone-400 italic text-base leading-relaxed font-conditional ${isEditing ? 'editing-mode' : 'display-mode'} pointer-events-none`}>
            {placeholder}
          </div>
        )}
        {blocks.map(block => {
          const isCurrentBlockEditing =
            editingBlockId === block.id || (isEditing && !editingBlockId)
          const className = getBlockClassName(
            block,
            isCurrentBlockEditing
          )

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
              data-placeholder={
                block.text === '' ? getPlaceholderText(block.type) : undefined
              }

              style={{
                // Maintain typography even when empty
                minHeight: '1.5rem',
                position: 'relative',
              }}
            >
              {block.text || '\u200B'}
              {/* Zero-width space to maintain layout */}
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
