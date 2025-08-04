import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
} from 'react'
import { nanoid } from 'nanoid'
import { CommandMenu } from './CommandMenu'
import { TipTapRichTextEditor } from './TipTapRichTextEditor'
import { SimplifiedRichTextEditor } from './SimplifiedRichTextEditor'
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
    richText: '',
    createdAt: new Date(),
  })

  const handleEditingStart = useCallback(
    (blockId: string) => {
      setIsEditing(true)
      setEditingBlockId(blockId)

      if (editingTimeoutRef.current) {
        clearTimeout(editingTimeoutRef.current)
      }
    },
    []
  )

  const handleEditingEnd = useCallback(() => {
    editingTimeoutRef.current = setTimeout(() => {
      const hasContent = blocks.some(block => block.text.trim() !== '')

      if (hasContent && blocks.length > 1) {
        setIsEditing(false)
        setEditingBlockId(null)
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
      setEditingBlockId(newBlock.id)
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
            `[data-block-id="${newBlocks[targetIndex].id}"]`
          ) as HTMLElement
          if (targetElement) {
            targetElement.focus()
          }
        }, 10)
      }
    },
    [blocks, onChange]
  )

  const handleBlockKeyDown = useCallback(
    (e: KeyboardEvent, blockId: string) => {
      const block = blocks.find(b => b.id === blockId)
      if (!block) return

      // Handle Enter key for new blocks
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        const newBlockId = addBlock(blockId)
        setTimeout(() => {
          const newElement = document.querySelector(
            `[data-block-id="${newBlockId}"]`
          ) as HTMLElement
          if (newElement) {
            newElement.focus()
          }
        }, 10)
        return
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

      // Handle slash commands
      if (e.key === '/') {
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          if (range.startOffset === 0) {
            e.preventDefault()
            setActiveBlockId(blockId)
            setShowCommandMenu(true)
            setSearchQuery('')
            
            // Position command menu
            const rect = range.getBoundingClientRect()
            setCommandMenuPosition({
              x: rect.left,
              y: rect.bottom + 5,
            })
          }
        }
      }
    },
    [blocks, addBlock, deleteBlock, updateBlock]
  )

  const handleCommandSelect = useCallback(
    (command: CommandOption): void => {
      if (!activeBlockId) return

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
          `[data-block-id="${activeBlockId}"]`
        ) as HTMLElement
        if (element) {
          element.focus()
        }
      }, 10)
    },
    [activeBlockId, updateBlock]
  )

  const renderBlock = (block: JournalBlock, index: number) => {
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
        // Only show "Type / for commands" for the first empty text block
        if (blockIndex === 0) {
          return 'Type / for commands'
        }
        return 'Continue writing...'
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
        className={`flex-1 p-6 bg-white focus:ring-0 outline-none overflow-y-auto transition-all duration-200 ${
          isAutoConverting ? 'bg-orange-50' : ''
        }`}
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
