import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react'
import { CommandMenu } from './CommandMenu'
import { JournalBlock, CommandOption } from './types'
import {
  detectShortcutPattern,
  shouldTriggerAutoConversion,
} from './shortcutPatterns'
import {
  createBlockElement,
  findBlockElement,
  getBlockId,
  getCurrentBlockPosition,
  setCaretPosition,
  getAllBlockElements,
  blockElementToJournalBlock,
  updateNumberedListCounters,
  BLOCK_MARKER_ATTRIBUTE,
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
  const [showCommandMenu, setShowCommandMenu] = useState(false)
  const [commandMenuPosition, setCommandMenuPosition] = useState({ x: 0, y: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)
  const [isAutoConverting, setIsAutoConverting] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const dragCleanupRef = useRef<(() => void) | null>(null)

  const createNewBlock = (
    type: JournalBlock['type'] = 'paragraph',
    level?: number
  ): JournalBlock => ({
    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    level: level as 1 | 2 | 3,
    text: '',
    createdAt: new Date(),
  })

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
      if (!afterBlockId) {
        onChange([...blocks, newBlock])
      } else {
        const index = blocks.findIndex(b => b.id === afterBlockId)
        const newBlocks = [...blocks]
        newBlocks.splice(index + 1, 0, newBlock)
        onChange(newBlocks)
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

  const focusBlock = useCallback((blockId: string, offset: number = 0): void => {
    setTimeout(() => {
      setCaretPosition(blockId, offset)
    }, 10)
  }, [])

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
        const blockElement = document.querySelector(`[${BLOCK_MARKER_ATTRIBUTE}="${blockId}"]`)
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

        const newBlockId = addBlock(blockId)
        setTimeout(() => focusBlock(newBlockId, 0), 10)
      } else if (e.key === 'Backspace') {
        const blockElement = document.querySelector(`[${BLOCK_MARKER_ATTRIBUTE}="${blockId}"]`)
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

      // Handle slash commands
      if (text.startsWith('/') && !showCommandMenu) {
        const rect = blockElement.getBoundingClientRect()
        setCommandMenuPosition({
          x: rect.left,
          y: rect.bottom + 5,
        })
        setSearchQuery(text.slice(1))
        setActiveBlockId(blockId)
        setShowCommandMenu(true)
      } else if (!text.startsWith('/') && showCommandMenu) {
        setShowCommandMenu(false)
      } else if (text.startsWith('/') && showCommandMenu) {
        setSearchQuery(text.slice(1))
      }

      // Update numbered list counters after text changes
      if (editorRef.current) {
        updateNumberedListCounters(editorRef.current)
      }
    },
    [updateBlock, showCommandMenu]
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
      if (!activeBlockId) return

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

      setTimeout(() => focusBlock(currentActiveBlockId, 0), 10)
    },
    [activeBlockId, updateBlock, focusBlock, handleImageUpload]
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
    dragCleanupRef.current = selectionManager.setupDragAndDrop(editorRef.current)

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
      onChange([createNewBlock()])
    }
  }, [blocks.length, onChange])

  // Focus first block on mount
  useLayoutEffect(() => {
    if (typeof window !== 'undefined' && blocks.length > 0) {
      setTimeout(() => focusBlock(blocks[0].id, 0), 10)
    }
  }, [])

  return (
    <div className="relative h-full flex flex-col">
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
      `}</style>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={(e) => {
          e.preventDefault()
          const text = e.clipboardData.getData('text/plain')
          selectionManager.paste(text)
          // Update blocks from DOM after paste operation
          setTimeout(() => syncBlocksFromDOM(), 10)
        }}
        onCopy={(e) => {
          e.preventDefault()
          const text = selectionManager.copySelection()
          e.clipboardData.setData('text/plain', text)
        }}
        onCut={(e) => {
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
        onDragOver={(e) => {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'move'
        }}
        onDrop={(e) => {
          e.preventDefault()
          handleDragEnd()
        }}
        onDragEnd={handleDragEnd}
        className={`flex-1 p-6 bg-white focus:ring-0 outline-none overflow-y-auto transition-all duration-200 ${
          isAutoConverting ? 'bg-orange-50' : ''
        }`}
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          userSelect: 'text',
        }}
        onDragStart={(e) => {
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
          <div className="text-stone-400 italic text-base leading-relaxed font-inknut pointer-events-none">
            Write something...
          </div>
        )}
        {blocks.length === 1 && blocks[0].text === '' && (
          <div className="text-stone-400 italic text-base leading-relaxed font-inknut pointer-events-none">
            {placeholder}
          </div>
        )}
        {blocks.map((block) => {
          const BlockElement = createBlockElement(block)
          return (
            <div
              key={block.id}
              data-block-id={block.id}
              className="block-element"
              dangerouslySetInnerHTML={{ __html: BlockElement.outerHTML }}
            />
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