import React, { useState, useRef, useEffect, useCallback } from 'react'
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

  const syncDOMFromBlocks = useCallback((): void => {
    if (!editorRef.current) return

    const container = editorRef.current
    
    // Clear container
    container.innerHTML = ''
    
    // Create and append block elements
    blocks.forEach((block) => {
      const blockElement = createBlockElement(block)
      container.appendChild(blockElement)
    })
    
    // Update numbered list counters
    updateNumberedListCounters(container)
  }, [blocks])

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

  // Sync DOM when blocks change
  useEffect(() => {
    syncDOMFromBlocks()
  }, [syncDOMFromBlocks])

  // Setup drag and drop functionality
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
  }, [blocks])

  // Sync blocks after drag operations
  useEffect(() => {
    const handleDragEnd = (): void => {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        syncBlocksFromDOM()
      }, 100)
    }

    if (editorRef.current) {
      editorRef.current.addEventListener('dragend', handleDragEnd)
      return (): void => {
        // Store the current value to avoid stale closure
        const currentEditorRef = editorRef.current
        if (currentEditorRef) {
          currentEditorRef.removeEventListener('dragend', handleDragEnd)
        }
      }
    }
  }, [syncBlocksFromDOM])

  // Initialize with empty block if none exist
  useEffect((): void => {
    if (blocks.length === 0) {
      onChange([createNewBlock()])
    }
  }, [blocks.length, onChange])

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
        [contenteditable]::-moz-selection {
          background-color: rgba(59, 130, 246, 0.3);
        }
        [contenteditable]::selection {
          background-color: rgba(59, 130, 246, 0.3);
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
          syncBlocksFromDOM()
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
          syncBlocksFromDOM()
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
          syncBlocksFromDOM()
        }}
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