import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { CommandMenu } from './CommandMenu'
import { JournalBlock, CommandOption } from './types'
import {
  detectShortcutPattern,
  shouldTriggerAutoConversion,
} from './shortcutPatterns'

interface RichTextEditorProps {
  blocks: JournalBlock[]
  onChange: (blocks: JournalBlock[]) => void
}

export function RichTextEditor({
  blocks,
  onChange,
}: RichTextEditorProps): JSX.Element {
  const [showCommandMenu, setShowCommandMenu] = useState(false)
  const [commandMenuPosition, setCommandMenuPosition] = useState({ x: 0, y: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)
  const [isAutoConverting, setIsAutoConverting] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const blockRefs = useRef<Map<string, HTMLElement>>(new Map())

  const createNewBlock = (
    type: JournalBlock['type'] = 'paragraph',
    level?: number
  ): JournalBlock => ({
    id: `block-${crypto.randomUUID()}`,
    type,
    level: level as 1 | 2 | 3,
    text: '',
    createdAt: new Date(),
  })

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

  const focusBlock = useCallback(
    (blockId: string, offset: number = 0): void => {
      requestAnimationFrame(() => {
        try {
          const blockElement = blockRefs.current.get(blockId)
          if (!blockElement || !document.contains(blockElement)) {
            return // Element doesn't exist or is not in DOM
          }

          blockElement.focus()

          if (offset > 0) {
            const selection = window.getSelection()
            if (selection) {
              try {
                const range = document.createRange()
                const walker = document.createTreeWalker(
                  blockElement,
                  NodeFilter.SHOW_TEXT,
                  null
                )

                const textNode = walker.nextNode()
                if (textNode && textNode.textContent) {
                  const maxOffset = Math.min(
                    offset,
                    textNode.textContent.length
                  )
                  range.setStart(textNode, maxOffset)
                  range.collapse(true)
                  selection.removeAllRanges()
                  selection.addRange(range)
                }
              } catch (error) {
                console.warn('Error setting cursor position:', error)
                // Fallback to end of element
                try {
                  const range = document.createRange()
                  range.selectNodeContents(blockElement)
                  range.collapse(false)
                  const selection = window.getSelection()
                  selection?.removeAllRanges()
                  selection?.addRange(range)
                } catch (fallbackError) {
                  console.warn('Fallback cursor positioning failed:', fallbackError)
                }
              }
            }
          }
        } catch (error) {
          console.warn('Error focusing block:', error)
        }
      })
    },
    []
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, blockId: string): void => {
      const block = blocks.find(b => b.id === blockId)
      if (!block) return

      // Handle markdown shortcuts on space key
      if (e.key === ' ') {
        const blockElement = blockRefs.current.get(blockId)
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
        const blockElement = blockRefs.current.get(blockId)
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

  // CRITICAL FIX: Remove debouncing to prevent content loss
  const handleInput = useCallback(
    (e: React.FormEvent<HTMLDivElement>, blockId: string): void => {
      const target = e.currentTarget
      const text = target.textContent || ''

      console.log(`📝 RichTextEditor input: blockId=${blockId}, length=${text.length}`);

      // IMMEDIATE update - no debouncing that could cause content loss
      updateBlock(blockId, { text })
      console.log(`✅ RichTextEditor block updated immediately: ${blockId}, content length: ${text.length}`);

      // Handle slash commands and splash commands
      const isSlashCommand = text.startsWith('/')
      const isSplashCommand = text.toLowerCase().startsWith('splash')
      
      if ((isSlashCommand || isSplashCommand) && !showCommandMenu) {
        const rect = target.getBoundingClientRect()
        setCommandMenuPosition({
          x: rect.left,
          y: rect.bottom + 5,
        })
        
        // Extract search query based on trigger type
        let searchQuery = ''
        if (isSlashCommand) {
          searchQuery = text.slice(1)
        } else if (isSplashCommand) {
          searchQuery = text.slice(6) // Remove "splash" (6 characters)
        }
        
        setSearchQuery(searchQuery)
        setActiveBlockId(blockId)
        setShowCommandMenu(true)
      } else if (!isSlashCommand && !isSplashCommand && showCommandMenu) {
        setShowCommandMenu(false)
      } else if ((isSlashCommand || isSplashCommand) && showCommandMenu) {
        // Update search query based on trigger type
        let searchQuery = ''
        if (isSlashCommand) {
          searchQuery = text.slice(1)
        } else if (isSplashCommand) {
          searchQuery = text.slice(6) // Remove "splash" (6 characters)
        }
        setSearchQuery(searchQuery)
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

  // Sync text content from state to DOM without interfering with cursor
  useEffect(() => {
    blocks.forEach(block => {
      const element = blockRefs.current.get(block.id)
      if (element && element.textContent !== block.text) {
        const isActiveElement = document.activeElement === element
        if (!isActiveElement) {
          element.textContent = block.text
        }
      }
    })
  }, [blocks])

  const setBlockRef = useCallback(
    (element: HTMLElement | null, blockId: string): void => {
      if (element) {
        blockRefs.current.set(blockId, element)
        // Initialize text content on mount
        const block = blocks.find(b => b.id === blockId)
        if (block && element.textContent !== block.text) {
          element.textContent = block.text
        }
      } else {
        blockRefs.current.delete(blockId)
      }
    },
    [blocks]
  )

  // Memoized block renderer for better performance
  const MemoizedBlock = useMemo(() => React.memo(({ block }: { block: JournalBlock }) => {
    const commonProps = {
      key: block.id,
      ref: (el: HTMLElement | null): void => setBlockRef(el, block.id),
      'data-block-id': block.id,
      contentEditable: true,
      suppressContentEditableWarning: true,
      onInput: (e: React.FormEvent<HTMLDivElement>): void =>
        handleInput(e, block.id),
      onKeyDown: (e: React.KeyboardEvent): void => handleKeyDown(e, block.id),
      className: `outline-none focus:ring-0 rounded px-1 py-1 min-h-[1.5rem] leading-relaxed cursor-text transition-all duration-200 ${
        isAutoConverting ? 'bg-orange-50 border border-orange-200' : ''
      }`,
      style: {
        whiteSpace: 'pre-wrap' as const,
        wordBreak: 'break-word' as const,
        minHeight: '1.5rem',
      },
    }

    switch (block.type) {
      case 'heading': {
        const HeadingTag = `h${block.level}` as 'h1' | 'h2' | 'h3'
        const headingClasses = {
          1: 'text-3xl font-bold text-stone-800 mb-6 leading-tight font-inknut',
          2: 'text-2xl font-semibold text-stone-800 mb-4 leading-tight font-inknut',
          3: 'text-xl font-medium text-stone-800 mb-3 leading-tight font-inknut',
        }
        return React.createElement(HeadingTag, {
          ...commonProps,
          className: `${commonProps.className} ${headingClasses[block.level || 1]}`,
        })
      }

      case 'bullet-list':
        return (
          <div key={block.id} className="flex items-start gap-3 mb-3">
            <span className="text-stone-600 mt-1 select-none text-lg">•</span>
            <div
              {...commonProps}
              className={`${commonProps.className} flex-1 text-base text-stone-700 leading-relaxed font-inknut`}
            />
          </div>
        )

      case 'numbered-list': {
        const index =
          blocks.filter(b => b.type === 'numbered-list').indexOf(block) + 1
        return (
          <div key={block.id} className="flex items-start gap-3 mb-3">
            <span className="text-stone-600 mt-1 select-none min-w-[24px] text-base font-medium">
              {index}.
            </span>
            <div
              {...commonProps}
              className={`${commonProps.className} flex-1 text-base text-stone-700 leading-relaxed font-inknut`}
            />
          </div>
        )
      }

      case 'quote':
        return (
          <div
            key={block.id}
            className="border-l-4 border-stone-300 pl-4 mb-4 italic text-stone-600"
          >
            <div
              {...commonProps}
              className={`${commonProps.className} text-base leading-relaxed font-inknut`}
            />
          </div>
        )

      case 'code':
        return (
          <div
            key={block.id}
            className="bg-stone-100 rounded-lg p-4 mb-4 font-mono text-sm"
          >
            <div
              {...commonProps}
              className={`${commonProps.className} text-stone-800 leading-relaxed`}
            />
          </div>
        )

      case 'image':
        return (
          <div key={block.id} className="mb-4">
            {block.imageUrl ? (
              <img
                src={block.imageUrl}
                alt={block.imageAlt || 'Uploaded image'}
                className="max-w-full h-auto rounded-lg shadow-sm"
              />
            ) : (
              <div
                className="border-2 border-dashed border-stone-300 rounded-lg p-8 text-center cursor-pointer hover:border-stone-400 transition-colors"
                onClick={(): void => handleImageUpload(block.id)}
              >
                <p className="text-stone-500">Click to upload an image</p>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div
            {...commonProps}
            className={`${commonProps.className} mb-4 text-base text-stone-700 leading-relaxed font-inknut`}
          />
        )
    }
  }), [
    blocks,
    handleInput,
    handleKeyDown,
    handleImageUpload,
    setBlockRef,
    isAutoConverting,
  ])

  const renderBlock = useCallback(
    (block: JournalBlock): JSX.Element => {
      return <MemoizedBlock block={block} />
    },
    [MemoizedBlock]
  )

  useEffect((): void => {
    if (blocks.length === 0) {
      onChange([createNewBlock()])
    }
  }, [blocks.length, onChange])

  return (
    <div className="relative h-full flex flex-col">
      <div
        ref={editorRef}
        className="flex-1 p-6 bg-white focus-within:ring-0 overflow-y-auto"
      >
        {(blocks.length === 0 || (blocks.length === 1 && blocks[0].text === '')) && (
          <div className="absolute top-6 left-6 text-stone-400 italic text-base leading-relaxed font-inknut pointer-events-none">
            Start writing your thoughts...
          </div>
        )}
        {blocks.map(renderBlock)}
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
