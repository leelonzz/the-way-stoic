import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
} from 'react'
import { nanoid } from 'nanoid'
import { CommandMenu } from './CommandMenu'
import { SimplifiedRichTextEditor } from './SimplifiedRichTextEditor'
import { JournalBlock, CommandOption } from './types'
import {
  updateNumberedListCounters,
  getBlockClassName,
} from './blockUtils'

interface EnhancedRichTextEditorProps {
  blocks: JournalBlock[]
  onChange: (blocks: JournalBlock[]) => void
}

export function EnhancedRichTextEditor({
  blocks,
  onChange,
}: EnhancedRichTextEditorProps): JSX.Element {
  const [showCommandMenu, setShowCommandMenu] = useState(false)
  const [commandMenuPosition, setCommandMenuPosition] = useState({ x: 0, y: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const editingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const createNewBlock = (
    type: JournalBlock['type'] = 'paragraph',
    level?: number
  ): JournalBlock => ({
    id: `block-${nanoid()}`,
    type,
    level: level as 1 | 2 | 3,
    text: '',
    richText: '',
    createdAt: new Date(),
  })

  const _handleEditingStart = useCallback(
    (_blockId: string) => {
      setIsEditing(true)

      if (editingTimeoutRef.current) {
        clearTimeout(editingTimeoutRef.current)
      }
    },
    []
  )

  const _handleEditingEnd = useCallback(() => {
    editingTimeoutRef.current = setTimeout(() => {
      const hasContent = blocks.some(block => block.text.trim() !== '')

      if (hasContent && blocks.length > 1) {
        setIsEditing(false)
      } else {
        setIsEditing(true)
      }
    }, 2000)
  }, [blocks])

  // Initialize with empty block if no blocks exist
  useEffect(() => {
    if (blocks.length === 0) {
      const newBlock = createNewBlock()
      onChange([newBlock])
      setIsEditing(true)
    }
  }, [blocks.length, onChange])

  const updateBlock = useCallback(
    (blockId: string, updates: Partial<JournalBlock>) => {
      const newBlocks = blocks.map(block =>
        block.id === blockId ? { ...block, ...updates } : block
      )
      onChange(newBlocks)
    },
    [blocks, onChange]
  )

  const addBlock = useCallback(
    (afterBlockId: string, newBlock?: Partial<JournalBlock>) => {
      const afterIndex = blocks.findIndex(b => b.id === afterBlockId)
      const block = newBlock ? { ...createNewBlock(), ...newBlock } : createNewBlock()
      
      const newBlocks = [
        ...blocks.slice(0, afterIndex + 1),
        block,
        ...blocks.slice(afterIndex + 1),
      ]
      onChange(newBlocks)
      return block.id
    },
    [blocks, onChange]
  )

  const deleteBlock = useCallback(
    (blockId: string) => {
      if (blocks.length <= 1) return

      const blockIndex = blocks.findIndex(b => b.id === blockId)
      const newBlocks = blocks.filter(b => b.id !== blockId)
      onChange(newBlocks)

      // Focus previous or next block
      const targetIndex = blockIndex > 0 ? blockIndex - 1 : 0
      if (newBlocks[targetIndex]) {
        setTimeout(() => {
          const targetElement = document.querySelector(
            `[data-block-id="${newBlocks[targetIndex].id}"] [contenteditable]`
          ) as HTMLElement
          if (targetElement) {
            targetElement.focus()
            // Place cursor at the end
            const range = document.createRange()
            const selection = window.getSelection()
            range.selectNodeContents(targetElement)
            range.collapse(false)
            selection?.removeAllRanges()
            selection?.addRange(range)
          }
        }, 10)
      }
    },
    [blocks, onChange]
  )

  const selectAllContent = useCallback(() => {
    if (!editorRef.current || blocks.length === 0) return

    try {
      const selection = window.getSelection()
      if (!selection) return

      // Find the first and last block elements
      const firstBlockElement = editorRef.current.querySelector(`[data-block-id="${blocks[0].id}"] [contenteditable]`) as HTMLElement
      const lastBlockElement = editorRef.current.querySelector(`[data-block-id="${blocks[blocks.length - 1].id}"] [contenteditable]`) as HTMLElement

      if (!firstBlockElement || !lastBlockElement) return

      const range = document.createRange()

      // Set range from start of first block to end of last block
      range.setStart(firstBlockElement, 0)
      range.setEnd(lastBlockElement, lastBlockElement.childNodes.length)

      selection.removeAllRanges()
      selection.addRange(range)
    } catch (error) {
      console.warn('Failed to select all content:', error)
    }
  }, [blocks])

  const isAllContentSelected = useCallback(() => {
    if (!editorRef.current || blocks.length === 0) return false

    try {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return false

      const range = selection.getRangeAt(0)

      // Find the first and last block elements
      const firstBlockElement = editorRef.current.querySelector(`[data-block-id="${blocks[0].id}"] [contenteditable]`) as HTMLElement
      const lastBlockElement = editorRef.current.querySelector(`[data-block-id="${blocks[blocks.length - 1].id}"] [contenteditable]`) as HTMLElement

      if (!firstBlockElement || !lastBlockElement) return false

      // Check if selection spans from start of first block to end of last block
      const isStartAtFirstBlock = range.startContainer === firstBlockElement || firstBlockElement.contains(range.startContainer)
      const isEndAtLastBlock = range.endContainer === lastBlockElement || lastBlockElement.contains(range.endContainer)

      // Check if selection starts at the beginning and ends at the end
      const isAtStart = range.startOffset === 0
      const isAtEnd = range.endOffset === (range.endContainer.nodeType === Node.TEXT_NODE ? range.endContainer.textContent?.length || 0 : range.endContainer.childNodes.length)

      return isStartAtFirstBlock && isEndAtLastBlock && isAtStart && isAtEnd
    } catch (error) {
      console.warn('Failed to check if all content is selected:', error)
      return false
    }
  }, [blocks])

  const clearAllContent = useCallback(() => {
    // Replace all blocks with a single empty block
    const newBlock: JournalBlock = {
      id: nanoid(),
      type: 'paragraph',
      text: '',
      richText: '',
      createdAt: new Date()
    }

    onChange([newBlock])

    // Focus the new empty block
    setTimeout(() => {
      const newElement = editorRef.current?.querySelector(`[data-block-id="${newBlock.id}"] [contenteditable]`) as HTMLElement
      if (newElement) {
        newElement.focus()
        // Place cursor at the beginning
        const range = document.createRange()
        const selection = window.getSelection()
        range.setStart(newElement, 0)
        range.collapse(true)
        selection?.removeAllRanges()
        selection?.addRange(range)
      }
    }, 10)
  }, [onChange])

  // Setup global keyboard event listener for Ctrl+A
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent): void => {
      // Don't interfere when command menu is open
      if (showCommandMenu) return

      // Check if the focus is within our editor
      const activeElement = document.activeElement
      if (!activeElement || !editorRef.current?.contains(activeElement)) return

      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault()
        selectAllContent()
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        // Handle Delete/Backspace when all content is selected
        if (isAllContentSelected()) {
          e.preventDefault()
          clearAllContent()
        }
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [selectAllContent, isAllContentSelected, clearAllContent, showCommandMenu])

  const handleBlockKeyDown = useCallback(
    (e: KeyboardEvent, blockId: string): void => {
      const block = blocks.find(b => b.id === blockId)
      if (!block) return

      // Handle Ctrl+A to select all content across blocks
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault()
        selectAllContent()
        return
      }

      // Handle Enter key for new blocks (but not when command menu is open)
      if (e.key === 'Enter' && !e.shiftKey && !showCommandMenu) {
        e.preventDefault()
        const newBlockId = addBlock(blockId)

        // Focus the new block and ensure it's ready for input
        setTimeout(() => {
          const newElement = document.querySelector(
            `[data-block-id="${newBlockId}"] [contenteditable]`
          ) as HTMLElement
          if (newElement) {
            newElement.focus()
            // Place cursor at the beginning
            const range = document.createRange()
            const selection = window.getSelection()
            range.setStart(newElement, 0)
            range.collapse(true)
            selection?.removeAllRanges()
            selection?.addRange(range)
          }
        }, 10)
        return
      }

      // Handle Delete and Backspace when all content is selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (isAllContentSelected()) {
          e.preventDefault()
          clearAllContent()
          return
        }
      }

      // Handle Backspace at beginning of block
      if (e.key === 'Backspace') {
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          if (range.startOffset === 0 && range.endOffset === 0) {
            e.preventDefault()
            if (block.text.trim() === '') {
              deleteBlock(blockId)
            } else {
              // Merge with previous block
              const blockIndex = blocks.findIndex(b => b.id === blockId)
              if (blockIndex > 0) {
                const prevBlock = blocks[blockIndex - 1]
                updateBlock(prevBlock.id, {
                  text: prevBlock.text + block.text,
                  richText: (prevBlock.richText || '') + (block.richText || ''),
                })
                deleteBlock(blockId)
              }
            }
            return
          }
        }
      }

      // Handle slash commands - don't prevent default, let the "/" be typed
      if (e.key === '/') {
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          if (range.startOffset === 0 && block.text.trim() === '') {
            // Only show command menu if we're at the beginning of an empty block
            setTimeout(() => {
              setActiveBlockId(blockId)
              setShowCommandMenu(true)
              setSearchQuery('')

              // Position command menu
              const element = e.target as HTMLElement
              const rect = element.getBoundingClientRect()
              setCommandMenuPosition({
                x: rect.left,
                y: rect.bottom + 5,
              })
            }, 10) // Small delay to let the "/" character be typed first
          }
        }
      }
    },
    [blocks, addBlock, deleteBlock, updateBlock, isAllContentSelected, clearAllContent, selectAllContent, showCommandMenu]
  )

  const handleCommandSelect = useCallback(
    (command: CommandOption): void => {
      if (!activeBlockId) return

      // Capture the activeBlockId before clearing it
      const blockIdToFocus = activeBlockId

      updateBlock(activeBlockId, {
        type: command.type,
        level: command.level as 1 | 2 | 3,
        text: '',
        richText: '',
      })

      setShowCommandMenu(false)
      setActiveBlockId(null)

      // Focus the transformed block
      setTimeout(() => {
        const element = document.querySelector(
          `[data-block-id="${blockIdToFocus}"] [contenteditable]`
        ) as HTMLElement
        if (element) {
          element.focus()
          // Place cursor at the beginning
          const range = document.createRange()
          const selection = window.getSelection()
          if (element.firstChild) {
            range.setStart(element.firstChild, 0)
          } else {
            range.setStart(element, 0)
          }
          range.collapse(true)
          selection?.removeAllRanges()
          selection?.addRange(range)
        }
      }, 50) // Increased timeout to ensure DOM updates are complete
    },
    [activeBlockId, updateBlock]
  )

  const renderBlock = (block: JournalBlock, index: number): JSX.Element => {
    const blockClassName = getBlockClassName(block, isEditing)
    
    // For image blocks, render differently
    if (block.type === 'image' && block.imageUrl) {
      return (
        <div
          key={block.id}
          data-block-id={block.id}
          className={blockClassName}
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

    // For text blocks, use simplified rich text editor for better reliability
    return (
      <div
        key={block.id}
        data-block-id={block.id}
        className={blockClassName}
      >
        <SimplifiedRichTextEditor
          block={block}
          onChange={updateBlock}
          onKeyDown={handleBlockKeyDown}
          placeholder={getPlaceholderForBlockType(block.type, index)}
        />
      </div>
    )
  }

  const getPlaceholderForBlockType = (type: JournalBlock['type'], blockIndex: number): string => {
    switch (type) {
      case 'heading':
        return 'Heading'
      case 'bullet-list':
        return 'List item'
      case 'numbered-list':
        return 'List item'
      case 'quote':
        return 'Quote'
      case 'code':
        return 'Code'
      default:
        // Only show placeholder for the first empty text block
        if (blockIndex === 0) {
          return 'Start writing your thoughts...'
        }
        return '' // No placeholder for subsequent blocks to avoid clutter
    }
  }

  // Update numbered list counters when blocks change
  useLayoutEffect(() => {
    if (editorRef.current) {
      updateNumberedListCounters(editorRef.current)
    }
  }, [blocks])

  return (
    <div className="relative">
      <style>{`
        .font-conditional.editing-mode {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }
        .font-conditional.display-mode {
          font-family: 'Inknut Antiqua', serif;
        }
        .block-element {
          position: relative;
        }
        .block-element:hover::before {
          content: '';
          position: absolute;
          left: -20px;
          top: 50%;
          transform: translateY(-50%);
          width: 6px;
          height: 6px;
          background: #d6d3d1;
          border-radius: 50%;
          opacity: 0.5;
        }
      `}</style>
      
      <div
        ref={editorRef}
        className="flex-1 p-6 bg-white focus:ring-0 outline-none overflow-y-auto transition-all duration-200"
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          userSelect: 'text',
        }}
      >
        {blocks.map((block, index) => renderBlock(block, index))}
      </div>

      {/* Command Menu */}
      <CommandMenu
        isOpen={showCommandMenu}
        position={commandMenuPosition}
        searchQuery={searchQuery}
        onSelectCommand={handleCommandSelect}
        onClose={() => {
          setShowCommandMenu(false)
          setActiveBlockId(null)
        }}
      />
    </div>
  )
}
