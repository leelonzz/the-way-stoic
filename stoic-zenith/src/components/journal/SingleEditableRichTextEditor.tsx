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
  getAllBlockElements,
  blockElementToJournalBlock,
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
  placeholder = "Start writing or type '/' for commands...",
}: SingleEditableRichTextEditorProps): JSX.Element {
  const getPlaceholderText = (blockType: JournalBlock['type']): string => {
    switch (blockType) {
      case 'heading':
        return 'Heading...'
      case 'quote':
        return 'Quote...'
      case 'todo':
        return 'To-do...'
      case 'bulletList':
        return 'List item...'
      case 'numberedList':
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
  const [debugMode, setDebugMode] = useState(false)
  const [fontLoaded, setFontLoaded] = useState(false)
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

  // Typography debugging and management functions
  const logTypographyState = useCallback(
    (action: string, blockId?: string) => {
      if (typeof window !== 'undefined' && window.fontLoadingDebug) {
        window.fontLoadingDebug.log(
          `[EDITOR] ${action}${blockId ? ` - Block: ${blockId}` : ''} | Editing: ${isEditing} | Font Loaded: ${fontLoaded}`
        )
      }
    },
    [isEditing, fontLoaded]
  )

  const handleEditingStart = useCallback(
    (blockId: string) => {
      // Don't immediately switch to editing mode if showing command menu
      if (showCommandMenu) {
        if (typeof window !== 'undefined' && window.fontLoadingDebug) {
          window.fontLoadingDebug.log(
            `[SLASH-DEBUG] EDITING_START_DELAYED - command menu active`
          )
        }
        return
      }

      logTypographyState('EDITING_START', blockId)
      setIsEditing(true)
      setEditingBlockId(blockId)

      // Clear any existing timeout
      if (editingTimeoutRef.current) {
        clearTimeout(editingTimeoutRef.current)
      }
    },
    [logTypographyState, showCommandMenu]
  )

  const handleEditingEnd = useCallback(() => {
    logTypographyState('EDITING_END_DELAYED')

    // Delay switching back to display mode to prevent flicker
    editingTimeoutRef.current = setTimeout(() => {
      logTypographyState('EDITING_END_APPLIED')
      setIsEditing(false)
      setEditingBlockId(null)
    }, 500) // 500ms delay to allow for quick re-focus
  }, [logTypographyState])

  const toggleDebugMode = useCallback(() => {
    const newDebugMode = !debugMode
    setDebugMode(newDebugMode)
    logTypographyState(`DEBUG_MODE_${newDebugMode ? 'ON' : 'OFF'}`)

    // Add/remove debug class from body
    if (typeof document !== 'undefined') {
      if (newDebugMode) {
        document.body.classList.add('debug-typography-enabled')
      } else {
        document.body.classList.remove('debug-typography-enabled')
      }
    }
  }, [debugMode, logTypographyState])

  // Font loading detection
  useEffect(() => {
    const handleFontLoaded = (): void => {
      setFontLoaded(true)
      logTypographyState('FONT_LOADED')
    }

    // Check if font is already loaded
    if (
      typeof document !== 'undefined' &&
      document.documentElement.classList.contains('inknut-loaded')
    ) {
      handleFontLoaded()
    } else {
      // Listen for font load event
      window.addEventListener('inknut-font-loaded', handleFontLoaded)
    }

    return (): void => {
      window.removeEventListener('inknut-font-loaded', handleFontLoaded)
    }
  }, [logTypographyState])

  // Cleanup editing timeout on unmount
  useEffect(() => {
    return (): void => {
      if (editingTimeoutRef.current) {
        clearTimeout(editingTimeoutRef.current)
      }
    }
  }, [])

  const syncBlocksFromDOM = useCallback((): void => {
    if (!editorRef.current) return

    const blockElements = getAllBlockElements(editorRef.current)
    const updatedBlocks = blockElements.map(blockElementToJournalBlock)

    // Only update if blocks have actually changed
    if (JSON.stringify(updatedBlocks) !== JSON.stringify(blocks)) {
      onChange(updatedBlocks)
    }
  }, [blocks, onChange])

  // Remove syncDOMFromBlocks - let React handle DOM updates naturally
  // This prevents React virtual DOM conflicts that cause removeChild errors

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
      if (blocks.length === 1) return
      const updatedBlocks = blocks.filter(block => block.id !== blockId)
      onChange(updatedBlocks)
    },
    [blocks, onChange]
  )

  const focusBlock = useCallback(
    (blockId: string, offset: number = 0): void => {
      if (typeof window !== 'undefined' && window.fontLoadingDebug) {
        window.fontLoadingDebug.log(
          `[FOCUS-DEBUG] Attempting to focus block: ${blockId} at offset: ${offset}`
        )
      }

      setTimeout(() => {
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
      }, 20) // Increased timeout for better DOM sync
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
            `[ENTER-DEBUG] New block created: ${newBlockId} | Focusing in 50ms`
          )
        }

        setTimeout(() => {
          if (typeof window !== 'undefined' && window.fontLoadingDebug) {
            window.fontLoadingDebug.log(
              `[ENTER-DEBUG] Focusing new block: ${newBlockId}`
            )
          }
          focusBlock(newBlockId, 0)
        }, 50) // Increased timeout to ensure DOM updates
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
            setTimeout(
              () => focusBlock(prevBlock.id, prevBlock.text.length),
              10
            )
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
            setTimeout(
              () =>
                focusBlock(
                  targetBlock.id,
                  Math.min(offset, targetBlock.text.length)
                ),
              10
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
      if (!blockElement) return

      const blockId = getBlockId(blockElement)
      if (!blockId) return

      const text = blockElement.textContent || ''
      updateBlock(blockId, { text })

      logTypographyState('INPUT_EVENT', blockId)

      // Enhanced slash command debugging
      const isSlashCommand = text.startsWith('/')
      const menuCurrentlyShown = showCommandMenu

      // Only trigger editing state if NOT starting a slash command
      if (!isSlashCommand) {
        handleEditingStart(blockId)
      }

      if (typeof window !== 'undefined' && window.fontLoadingDebug) {
        window.fontLoadingDebug.log(
          `[SLASH-DEBUG] Text: "${text}" | Starts with /: ${isSlashCommand} | Menu shown: ${menuCurrentlyShown}`
        )
      }

      // Handle slash commands
      if (isSlashCommand && !menuCurrentlyShown) {
        const rect = blockElement.getBoundingClientRect()
        const position = {
          x: rect.left,
          y: rect.bottom + 5,
        }

        if (typeof window !== 'undefined' && window.fontLoadingDebug) {
          window.fontLoadingDebug.log(
            `[SLASH-DEBUG] SHOWING MENU at (${position.x}, ${position.y}) | Query: "${text.slice(1)}"`
          )
        }

        setCommandMenuPosition(position)
        setSearchQuery(text.slice(1))
        setActiveBlockId(blockId)
        setShowCommandMenu(true)
      } else if (!isSlashCommand && menuCurrentlyShown) {
        if (typeof window !== 'undefined' && window.fontLoadingDebug) {
          window.fontLoadingDebug.log(
            `[SLASH-DEBUG] HIDING MENU - text doesn't start with /`
          )
        }
        setShowCommandMenu(false)
      } else if (isSlashCommand && menuCurrentlyShown) {
        const newQuery = text.slice(1)
        if (typeof window !== 'undefined' && window.fontLoadingDebug) {
          window.fontLoadingDebug.log(
            `[SLASH-DEBUG] UPDATING QUERY: "${newQuery}"`
          )
        }
        setSearchQuery(newQuery)
      }

      // Update numbered list counters after text changes
      if (editorRef.current) {
        updateNumberedListCounters(editorRef.current)
      }
    },
    [updateBlock, showCommandMenu, handleEditingStart, logTypographyState]
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
      setTimeout(() => {
        focusBlock(currentActiveBlockId, 0)
        handleEditingStart(currentActiveBlockId)
      }, 10)
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

  // Handle drag end with React state updates
  const handleDragEnd = useCallback(() => {
    // Update blocks from DOM after drag operations
    setTimeout(() => {
      syncBlocksFromDOM()
    }, 100)
  }, [syncBlocksFromDOM])

  // Initialize with empty block if none exist
  useEffect((): void => {
    if (blocks.length === 0) {
      logTypographyState('INITIALIZING_EMPTY_BLOCK')
      onChange([createNewBlock()])
    }
  }, [blocks.length, onChange, logTypographyState])

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
        logTypographyState('FOCUSING_FIRST_BLOCK_ON_MOUNT')
        hasInitiallyFocused.current = true
        setTimeout(() => focusBlock(blocks[0].id, 0), 10)
      } else {
        logTypographyState('SKIPPING_FIRST_BLOCK_FOCUS - not initial mount')
      }
    }
  }, [blocks.length, focusBlock, logTypographyState])

  // Separate effect to log block changes without auto-focusing
  useEffect(() => {
    if (typeof window !== 'undefined' && window.fontLoadingDebug) {
      window.fontLoadingDebug.log(
        `[BLOCK-CHANGE-DEBUG] Blocks count changed to: ${blocks.length}`
      )
    }
  }, [blocks.length])

  // Log initial state
  useEffect(() => {
    logTypographyState('EDITOR_MOUNTED')
    console.log(
      '[FONT-DEBUG] Typography-ContentEditable Conflict Resolution System Active'
    )
    console.log(
      '[FONT-DEBUG] Features: Conditional fonts, editing state management, debug mode'
    )
  }, [logTypographyState])

  return (
    <div className="relative h-full flex flex-col">
      {/* Debug Control Panel */}
      <div className="fixed top-4 right-4 z-50 bg-white border border-gray-300 rounded-lg p-3 shadow-lg text-xs">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={toggleDebugMode}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              debugMode
                ? 'bg-red-100 text-red-800 border border-red-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300'
            }`}
          >
            {debugMode ? 'Debug ON' : 'Debug OFF'}
          </button>
          <span
            className={`px-2 py-1 rounded text-xs ${
              fontLoaded
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            Font: {fontLoaded ? 'Loaded' : 'Loading'}
          </span>
        </div>
        {debugMode && (
          <div className="space-y-1 text-xs">
            <div>
              Editing:{' '}
              <span className="font-mono">{isEditing ? 'TRUE' : 'FALSE'}</span>
            </div>
            <div>
              Block:{' '}
              <span className="font-mono">{editingBlockId || 'NONE'}</span>
            </div>
            <div>
              Blocks: <span className="font-mono">{blocks.length}</span>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              <div>Red outline: Base blocks</div>
              <div>Green outline: Editing mode</div>
              <div>Blue outline: Display mode</div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .dragging-text {
          cursor: grabbing !important;
        }
        .drop-indicator {
          pointer-events: none;
          z-index: 1000;
        }
        .line-drop-indicator {
          pointer-events: none;
          z-index: 1000;
        }
        .magnetic-zone {
          pointer-events: none;
          z-index: 999;
        }
        .enhanced-drag-image {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          user-select: none;
          -webkit-user-drag: none;
        }
        .enhanced-block-indicator {
          pointer-events: none;
          z-index: 1000;
        }
        [contenteditable]::-moz-selection {
          background-color: rgba(59, 130, 246, 0.3);
        }
        [contenteditable]::selection {
          background-color: rgba(59, 130, 246, 0.3);
        }
        
        /* Enhanced multi-line selection styling */
        [contenteditable] .multi-line-selection {
          background-color: rgba(16, 185, 129, 0.2);
          border-radius: 2px;
          box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.3);
        }
        
        /* Typography preservation for empty blocks */
        [data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: rgba(120, 113, 108, 0.6);
          font-style: italic;
          pointer-events: none;
          position: absolute;
          user-select: none;
        }
        
        /* Maintain block structure styling */
        .block-element {
          position: relative;
          width: 100%;
        }
        
        .block-element:empty {
          min-height: 1.5rem;
        }
        
        /* Smooth transitions for drag interactions */
        .block-element {
          transition: background-color 0.15s ease-out, transform 0.15s ease-out;
        }
        
        .block-element:hover {
          background-color: rgba(0, 0, 0, 0.02);
        }
        
        /* Enhanced cursor feedback */
        [contenteditable][draggable="true"]:not(.dragging-text) {
          cursor: grab;
        }
        
        [contenteditable][draggable="true"].dragging-text {
          cursor: grabbing;
        }
        
        /* Hide block markers from user view */
        [data-block-id] {
          border: none;
          outline: none;
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
          // Update blocks from DOM after paste operation
          setTimeout(() => syncBlocksFromDOM(), 10)
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
          // Update blocks from DOM after cut operation
          setTimeout(() => syncBlocksFromDOM(), 10)
        }}
        onMouseUp={() => {
          // Update selection info after mouse operations
          const selectionInfo = selectionManager.getSelectionInfo()
          if (selectionInfo.isMultiLine) {
            // Visual feedback for multi-line selection
            setTimeout(() => {
              const selectedBlocks = selectionInfo.selectedBlocks
              selectedBlocks.forEach(block => {
                block.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'
              })
              setTimeout(() => {
                selectedBlocks.forEach(block => {
                  block.style.backgroundColor = ''
                })
              }, 200)
            }, 10)
          }
        }}
        onDragOver={e => {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'move'
        }}
        onDrop={e => {
          e.preventDefault()
          handleDragEnd()
        }}
        onDragEnd={handleDragEnd}
        onFocus={e => {
          const target = e.target as HTMLElement
          const blockElement = findBlockElement(target)
          if (blockElement) {
            const blockId = getBlockId(blockElement)
            if (blockId) {
              // Delay editing start to not interfere with input processing
              setTimeout(() => {
                handleEditingStart(blockId)
              }, 10)
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

          logTypographyState('BLUR_EVENT')
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
        onDragStart={e => {
          // Ensure drag data is set for text selections
          const selection = window.getSelection()
          if (selection && !selection.isCollapsed) {
            const selectedText = selection.toString()
            e.dataTransfer.setData('text/plain', selectedText)
            e.dataTransfer.effectAllowed = 'move'
          }
        }}
      >
        {blocks.length === 0 && (
          <div className="text-stone-400 italic text-base leading-relaxed font-conditional display-mode pointer-events-none">
            Write something...
          </div>
        )}
        {blocks.length === 1 && blocks[0].text === '' && (
          <div className="text-stone-400 italic text-base leading-relaxed font-conditional display-mode pointer-events-none">
            {placeholder}
          </div>
        )}
        {blocks.map(block => {
          const isCurrentBlockEditing =
            editingBlockId === block.id || (isEditing && !editingBlockId)
          const className = getBlockClassName(
            block,
            isCurrentBlockEditing,
            debugMode
          )

          if (block.type === 'image' && block.imageUrl) {
            return (
              <div
                key={block.id}
                data-block-id={block.id}
                data-block-type={block.type}
                className={className}
                data-font-state={
                  debugMode
                    ? `IMG-${isCurrentBlockEditing ? 'EDITING' : 'DISPLAY'}`
                    : undefined
                }
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
              draggable={block.type !== 'image'}
              data-placeholder={
                block.text === '' ? getPlaceholderText(block.type) : undefined
              }
              data-font-state={
                debugMode
                  ? `${block.type.toUpperCase()}-${isCurrentBlockEditing ? 'EDITING' : 'DISPLAY'}`
                  : undefined
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
