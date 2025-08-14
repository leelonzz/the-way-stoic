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
import { updateNumberedListCounters, getBlockClassName } from './blockUtils'
import {
  detectShortcutPattern,
  shouldTriggerAutoConversion,
  detectLineShortcutPattern,
  shouldTriggerLineConversion,
} from './shortcutPatterns'
import { SelectionManager } from './selectionUtils'

interface EnhancedRichTextEditorProps {
  blocks: JournalBlock[]
  onChange: (blocks: JournalBlock[]) => void
  showPlaceholder?: boolean
}

export const EnhancedRichTextEditor = React.memo(function EnhancedRichTextEditor({
  blocks,
  onChange,
  showPlaceholder = true,
}: EnhancedRichTextEditorProps): JSX.Element {
  const [showCommandMenu, setShowCommandMenu] = useState(false)
  const [commandMenuPosition, setCommandMenuPosition] = useState({ x: 0, y: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const editingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const selectionManagerRef = useRef<SelectionManager | null>(null)
  const activeTimeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set())

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

  const _handleEditingStart = useCallback((_blockId: string) => {
    setIsEditing(true)

    if (editingTimeoutRef.current) {
      clearTimeout(editingTimeoutRef.current)
    }
  }, [])

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

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      // Clear all active timeouts
      const activeTimeouts = activeTimeoutsRef.current
      activeTimeouts.forEach(timeout => clearTimeout(timeout))
      activeTimeouts.clear()
      
      if (editingTimeoutRef.current) {
        clearTimeout(editingTimeoutRef.current)
      }
    }
  }, [])

  // Immediate onChange for instant UI updates (Google Docs style)
  const immediateOnChange = useCallback(
    (newBlocks: JournalBlock[]) => {
      // Pass changes immediately - no debouncing
      onChange(newBlocks)
    },
    [onChange]
  );

  const updateBlock = useCallback(
    (blockId: string, updates: Partial<JournalBlock>) => {
      const newBlocks = blocks.map(block =>
        block.id === blockId ? { ...block, ...updates } : block
      )
      immediateOnChange(newBlocks)

      // Handle slash command detection and markdown shortcuts when text changes
      if (updates.text !== undefined) {
        const text = updates.text
        const isSlashCommand = text.startsWith('/')
        const isSplashCommand = text.startsWith('splash')

        // Handle slash commands
        if ((isSlashCommand || isSplashCommand) && !showCommandMenu) {
          // Show command menu
          const blockElement = document.querySelector(`[data-block-id="${blockId}"]`)
          if (blockElement) {
            const rect = blockElement.getBoundingClientRect()
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
          }
        } else if (!isSlashCommand && !isSplashCommand && showCommandMenu) {
          // Hide command menu
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
        
      }
    },
    [blocks, immediateOnChange, showCommandMenu]
  )

  const addBlock = useCallback(
    (afterBlockId: string, newBlock?: Partial<JournalBlock>) => {
      const afterIndex = blocks.findIndex(b => b.id === afterBlockId)
      const block = newBlock
        ? { ...createNewBlock(), ...newBlock }
        : createNewBlock()

      const newBlocks = [
        ...blocks.slice(0, afterIndex + 1),
        block,
        ...blocks.slice(afterIndex + 1),
      ]
      immediateOnChange(newBlocks)
      return block.id
    },
    [blocks, immediateOnChange]
  )

  // Helper function to focus a block element
  const focusBlockElement = useCallback((blockElement: HTMLElement, blockId: string, position: 'start' | 'end' = 'start') => {
    const block = blocks.find(b => b.id === blockId)
    if (!block) return

    // For image blocks, focus the block element itself (it's now focusable)
    if (block.type === 'image') {
      blockElement.focus()
      return
    }

    // For text blocks, focus the contenteditable element
    const contentEditable = blockElement.querySelector('[contenteditable]') as HTMLElement
    if (contentEditable) {
      contentEditable.focus()

      // Position cursor
      const range = document.createRange()
      const selection = window.getSelection()

      if (position === 'end') {
        // Place cursor at the end
        range.selectNodeContents(contentEditable)
        range.collapse(false)
      } else {
        // Place cursor at the start
        // For list items, ensure cursor is positioned in the text area
        if (block.type === 'bullet-list' || block.type === 'numbered-list') {
          // If there's text content, position at the beginning of the text
          if (contentEditable.textContent && contentEditable.textContent.length > 0) {
            const textNode = contentEditable.firstChild
            if (textNode && textNode.nodeType === Node.TEXT_NODE) {
              range.setStart(textNode, 0)
            } else {
              range.setStart(contentEditable, 0)
            }
          } else {
            // For empty list items, position at the start of the contentEditable
            range.setStart(contentEditable, 0)
          }
        } else {
          range.setStart(contentEditable, 0)
        }
        range.collapse(true)
      }

      selection?.removeAllRanges()
      selection?.addRange(range)
    }
  }, [blocks])

  // Helper function to focus a block and position cursor
  const focusBlock = useCallback((blockId: string, position: 'start' | 'end' = 'start') => {
    const timeout = setTimeout(() => {
      const blockElement = document.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement
      if (!blockElement) {
        // If block not found immediately, try once more after a longer delay
        const retryTimeout = setTimeout(() => {
          const retryBlockElement = document.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement
          if (!retryBlockElement) return
          
          focusBlockElement(retryBlockElement, blockId, position)
          // Scroll the new block into view for better visibility
          retryBlockElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          activeTimeoutsRef.current.delete(retryTimeout)
        }, 100)
        activeTimeoutsRef.current.add(retryTimeout)
        return
      }

      focusBlockElement(blockElement, blockId, position)
      // Scroll the focused block into view for better visibility
      blockElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      activeTimeoutsRef.current.delete(timeout)
    }, 50)
    activeTimeoutsRef.current.add(timeout)
  }, [blocks, focusBlockElement])

  // Helper functions for line-based markdown detection
  const getCurrentLineInfo = useCallback((contentEditable: HTMLElement, selection: Selection) => {
    if (!selection.rangeCount) return null

    const range = selection.getRangeAt(0)
    const fullText = contentEditable.textContent || ''
    
    // Get cursor position in the text
    const preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(contentEditable)
    preCaretRange.setEnd(range.startContainer, range.startOffset)
    const caretPosition = preCaretRange.toString().length

    // Find the current line by looking for line breaks
    const textBeforeCaret = fullText.substring(0, caretPosition)
    const textAfterCaret = fullText.substring(caretPosition)
    
    // Find the last line break before cursor (or start of text)
    const lastLineBreakBefore = textBeforeCaret.lastIndexOf('\n')
    const lineStart = lastLineBreakBefore === -1 ? 0 : lastLineBreakBefore + 1
    
    // Find the next line break after cursor (or end of text) 
    const nextLineBreakAfter = textAfterCaret.indexOf('\n')
    const lineEnd = nextLineBreakAfter === -1 ? fullText.length : caretPosition + nextLineBreakAfter
    
    // Extract current line text
    const currentLineText = fullText.substring(lineStart, lineEnd)
    const cursorPositionInLine = caretPosition - lineStart
    
    // Check if text before cursor could be a markdown pattern
    const textBeforeCursor = currentLineText.substring(0, cursorPositionInLine)
    const isAtLineStart = cursorPositionInLine === 0 ||
                         !!textBeforeCursor.match(/^(#{1,3}|-|\*|>|```|\d+\.)$/)
    
    return {
      lineText: currentLineText,
      lineStart,
      lineEnd,
      cursorPositionInLine,
      caretPosition,
      fullText,
      isAtLineStart
    }
  }, [])

  const isAtStartOfLine = useCallback((contentEditable: HTMLElement, selection: Selection): boolean => {
    const lineInfo = getCurrentLineInfo(contentEditable, selection)
    return lineInfo ? lineInfo.isAtLineStart : false
  }, [getCurrentLineInfo])

  // Helper function to handle clicks on image blocks
  const handleImageBlockClick = useCallback((blockId: string, e: MouseEvent) => {
    e.preventDefault()

    // Get the image block element
    const blockElement = document.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement
    if (!blockElement) return

    // Determine if click is in the bottom half of the image (after image)
    const rect = blockElement.getBoundingClientRect()
    const clickY = e.clientY
    const blockCenterY = rect.top + rect.height / 2

    if (clickY > blockCenterY) {
      // Click in bottom half - create new block after image
      const newBlockId = addBlock(blockId)
      focusBlock(newBlockId, 'start')
    } else {
      // Click in top half - focus previous block or create one before
      const blockIndex = blocks.findIndex(b => b.id === blockId)
      if (blockIndex > 0) {
        const prevBlock = blocks[blockIndex - 1]
        focusBlock(prevBlock.id, 'end')
      } else {
        // Create a new block before the image
        const newBlock = createNewBlock()
        const newBlocks = [newBlock, ...blocks]
        onChange(newBlocks)
        focusBlock(newBlock.id, 'start')
      }
    }
  }, [blocks, addBlock, focusBlock, onChange])

  // Helper function to handle clicks in empty areas
  const handleEmptyAreaClick = useCallback((e: MouseEvent) => {
    e.preventDefault()

    // Find the closest block to the click position
    const editorRect = editorRef.current?.getBoundingClientRect()
    if (!editorRect) return

    const clickY = e.clientY
    let closestBlock: JournalBlock | null = null
    let closestDistance = Infinity
    let insertAfter = true

    // Find the closest block
    blocks.forEach(block => {
      const blockElement = document.querySelector(`[data-block-id="${block.id}"]`) as HTMLElement
      if (!blockElement) return

      const blockRect = blockElement.getBoundingClientRect()
      const blockCenterY = blockRect.top + blockRect.height / 2
      const distance = Math.abs(clickY - blockCenterY)

      if (distance < closestDistance) {
        closestDistance = distance
        closestBlock = block
        // If click is above the block center, insert before; otherwise after
        insertAfter = clickY > blockCenterY
      }
    })

    if (closestBlock) {
      if (insertAfter) {
        // Create new block after the closest block
        const newBlockId = addBlock(closestBlock.id)
        focusBlock(newBlockId, 'start')
      } else {
        // Create new block before the closest block
        const blockIndex = blocks.findIndex(b => b.id === closestBlock!.id)
        const newBlock = createNewBlock()
        const newBlocks = [
          ...blocks.slice(0, blockIndex),
          newBlock,
          ...blocks.slice(blockIndex)
        ]
        onChange(newBlocks)
        focusBlock(newBlock.id, 'start')
      }
    } else if (blocks.length === 0) {
      // No blocks exist, create the first one
      const newBlock = createNewBlock()
      onChange([newBlock])
      focusBlock(newBlock.id, 'start')
    }
  }, [blocks, addBlock, focusBlock, onChange])

  const deleteBlock = useCallback(
    (blockId: string) => {
      if (blocks.length <= 1) return

      const blockIndex = blocks.findIndex(b => b.id === blockId)
      const newBlocks = blocks.filter(b => b.id !== blockId)
      immediateOnChange(newBlocks)

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
    [blocks, immediateOnChange]
  )

  const selectAllContent = useCallback(() => {
    if (!editorRef.current || blocks.length === 0) return

    try {
      const selection = window.getSelection()
      if (!selection) return

      // Find the first and last block elements
      const firstBlockElement = editorRef.current.querySelector(
        `[data-block-id="${blocks[0].id}"] [contenteditable]`
      ) as HTMLElement
      const lastBlockElement = editorRef.current.querySelector(
        `[data-block-id="${blocks[blocks.length - 1].id}"] [contenteditable]`
      ) as HTMLElement

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
      const firstBlockElement = editorRef.current.querySelector(
        `[data-block-id="${blocks[0].id}"] [contenteditable]`
      ) as HTMLElement
      const lastBlockElement = editorRef.current.querySelector(
        `[data-block-id="${blocks[blocks.length - 1].id}"] [contenteditable]`
      ) as HTMLElement

      if (!firstBlockElement || !lastBlockElement) return false

      // Check if selection spans from start of first block to end of last block
      const isStartAtFirstBlock =
        range.startContainer === firstBlockElement ||
        firstBlockElement.contains(range.startContainer)
      const isEndAtLastBlock =
        range.endContainer === lastBlockElement ||
        lastBlockElement.contains(range.endContainer)

      // Check if selection starts at the beginning and ends at the end
      const isAtStart = range.startOffset === 0
      const isAtEnd =
        range.endOffset ===
        (range.endContainer.nodeType === Node.TEXT_NODE
          ? range.endContainer.textContent?.length || 0
          : range.endContainer.childNodes.length)

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
      createdAt: new Date(),
    }

    onChange([newBlock])

    // Focus the new empty block
    setTimeout(() => {
      const newElement = editorRef.current?.querySelector(
        `[data-block-id="${newBlock.id}"] [contenteditable]`
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
  }, [onChange])

  // Setup global keyboard event listener for Ctrl+A
  // Initialize cross-block text selection
  useEffect((): (() => void) => {
    if (!editorRef.current) return

    // Initialize SelectionManager
    if (!selectionManagerRef.current) {
      selectionManagerRef.current = new SelectionManager()
    }

    // Setup cross-block selection functionality
    const cleanup = selectionManagerRef.current.setupDragAndDrop(
      editorRef.current
    )

    // Enhanced cross-block selection with contenteditable management
    let isSelecting = false
    let selectionStartBlock: HTMLElement | null = null
    let selectionStartOffset = 0
    let selectionStartContainer: Node | null = null
    const originalContentEditableStates: Map<HTMLElement, boolean> = new Map()

    const handleMouseDown = (e: MouseEvent): void => {
      const target = e.target as HTMLElement

      // Only handle if clicking on text content, not UI elements
      if (target.closest('button') || target.closest('.command-menu')) return

      // Check if clicking on a block element (including image blocks)
      const blockElement = target.closest('[data-block-id]') as HTMLElement
      if (!blockElement) {
        // Handle clicks in empty areas of the editor
        handleEmptyAreaClick(e)
        return
      }

      // Get the block ID and block data
      const blockId = blockElement.getAttribute('data-block-id')
      const block = blocks.find(b => b.id === blockId)
      if (!block) return

      // Handle image block clicks
      if (block.type === 'image') {
        handleImageBlockClick(blockId, e)
        return
      }

      // Handle text block clicks (existing logic)
      const contentEditable = target.closest('[contenteditable]') as HTMLElement
      if (!contentEditable) return

      isSelecting = true
      selectionStartBlock = contentEditable.closest(
        '[data-block-id]'
      ) as HTMLElement

      // Capture the exact start position
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        selectionStartContainer = range.startContainer
        selectionStartOffset = range.startOffset
      }
    }

    const handleMouseMove = (e: MouseEvent): void => {
      if (!isSelecting || !selectionStartBlock) return

      const target = e.target as HTMLElement
      const currentContentEditable = target.closest(
        '[contenteditable]'
      ) as HTMLElement
      if (!currentContentEditable) return

      const currentBlock = currentContentEditable.closest(
        '[data-block-id]'
      ) as HTMLElement
      if (!currentBlock) return

      // If we're selecting across different blocks
      if (selectionStartBlock !== currentBlock) {
        e.preventDefault()
        e.stopPropagation()

        // Temporarily disable contenteditable on all blocks to allow cross-block selection
        const allContentEditables = editorRef.current?.querySelectorAll(
          '[contenteditable]'
        ) as NodeListOf<HTMLElement>
        allContentEditables.forEach(el => {
          if (!originalContentEditableStates.has(el)) {
            originalContentEditableStates.set(el, el.contentEditable === 'true')
            el.contentEditable = 'false'
          }
        })

        try {
          const selection = window.getSelection()
          if (!selection) return

          // Get current mouse position
          const caretPos = getCaretPositionFromPoint(e.clientX, e.clientY)
          let currentContainer: Node | null = null
          let currentOffset = 0

          if (caretPos) {
            currentContainer = caretPos.node
            currentOffset = caretPos.offset
          } else {
            // Fallback: use end of current block
            const lastTextNode = getLastTextNode(currentContentEditable)
            if (lastTextNode) {
              currentContainer = lastTextNode
              currentOffset = lastTextNode.textContent?.length || 0
            } else {
              currentContainer = currentContentEditable
              currentOffset = currentContentEditable.childNodes.length
            }
          }

          if (!currentContainer || !selectionStartContainer) return

          // Determine the correct order for start and end positions
          const range = document.createRange()
          const comparison =
            selectionStartContainer.compareDocumentPosition(currentContainer)

          // Check if start comes before end in document order
          const startBeforeEnd =
            (comparison & Node.DOCUMENT_POSITION_FOLLOWING) !== 0 ||
            (selectionStartContainer === currentContainer &&
              selectionStartOffset <= currentOffset)

          if (startBeforeEnd) {
            // Normal selection: start to end
            range.setStart(selectionStartContainer, selectionStartOffset)
            range.setEnd(currentContainer, currentOffset)
          } else {
            // Reverse selection: end to start (user dragged upward)
            range.setStart(currentContainer, currentOffset)
            range.setEnd(selectionStartContainer, selectionStartOffset)
          }

          selection.removeAllRanges()
          selection.addRange(range)
        } catch (error) {
          console.warn('Cross-block selection error:', error)
        }
      }
    }

    const handleMouseUp = (): void => {
      // Restore contenteditable states
      originalContentEditableStates.forEach((wasEditable, element) => {
        element.contentEditable = wasEditable ? 'true' : 'false'
      })
      originalContentEditableStates.clear()

      isSelecting = false
      selectionStartBlock = null
      selectionStartOffset = 0
      selectionStartContainer = null
    }

    // Helper function to get caret position from mouse coordinates
    const getCaretPositionFromPoint = (
      x: number,
      y: number
    ): { node: Node; offset: number } | null => {
      if (document.caretPositionFromPoint) {
        const pos = document.caretPositionFromPoint(x, y)
        return pos ? { node: pos.offsetNode, offset: pos.offset } : null
      } else if (document.caretRangeFromPoint) {
        const range = document.caretRangeFromPoint(x, y)
        return range
          ? { node: range.startContainer, offset: range.startOffset }
          : null
      }
      return null
    }

    // Helper function to get the first text node
    const _getFirstTextNode = (element: HTMLElement): Text | null => {
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null
      )
      return walker.nextNode() as Text | null
    }

    // Helper function to get the last text node
    const getLastTextNode = (element: HTMLElement): Text | null => {
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null
      )
      let lastNode: Text | null = null
      let node = walker.nextNode() as Text | null
      while (node) {
        lastNode = node
        node = walker.nextNode() as Text | null
      }
      return lastNode
    }

    // Add event listeners with capture to intercept before contenteditable handles them
    editorRef.current.addEventListener('mousedown', handleMouseDown, true)
    document.addEventListener('mousemove', handleMouseMove, true)
    document.addEventListener('mouseup', handleMouseUp, true)

    return () => {
      cleanup()
      editorRef.current?.removeEventListener('mousedown', handleMouseDown, true)
      document.removeEventListener('mousemove', handleMouseMove, true)
      document.removeEventListener('mouseup', handleMouseUp, true)
    }
  }, [])

  // Helper function to check if selection spans multiple blocks
  const isCrossBlockSelection = (): boolean => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return false

    const range = selection.getRangeAt(0)
    const startBlock =
      range.startContainer.nodeType === Node.TEXT_NODE
        ? range.startContainer.parentElement?.closest('[data-block-id]')
        : (range.startContainer as Element).closest('[data-block-id]')
    const endBlock =
      range.endContainer.nodeType === Node.TEXT_NODE
        ? range.endContainer.parentElement?.closest('[data-block-id]')
        : (range.endContainer as Element).closest('[data-block-id]')

    return startBlock !== endBlock && !!startBlock && !!endBlock
  }

  // Helper function to handle cross-block selection deletion
  const handleCrossBlockDeletion = (): void => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)

    // Get the blocks involved in the selection
    const startBlock =
      range.startContainer.nodeType === Node.TEXT_NODE
        ? range.startContainer.parentElement?.closest('[data-block-id]')
        : (range.startContainer as Element).closest('[data-block-id]')
    const endBlock =
      range.endContainer.nodeType === Node.TEXT_NODE
        ? range.endContainer.parentElement?.closest('[data-block-id]')
        : (range.endContainer as Element).closest('[data-block-id]')

    if (!startBlock || !endBlock) return

    // Get block IDs
    const startBlockId = startBlock.getAttribute('data-block-id')
    const endBlockId = endBlock.getAttribute('data-block-id')
    if (!startBlockId || !endBlockId) return

    // Find the blocks in our state
    const startBlockIndex = blocks.findIndex(b => b.id === startBlockId)
    const endBlockIndex = blocks.findIndex(b => b.id === endBlockId)
    if (startBlockIndex === -1 || endBlockIndex === -1) return

    // Determine the correct order
    const firstIndex = Math.min(startBlockIndex, endBlockIndex)
    const lastIndex = Math.max(startBlockIndex, endBlockIndex)

    // Extract the selected content to determine what to keep
    const selectedContent = range.toString()

    // Get the remaining text from the first and last blocks
    const firstBlock = blocks[firstIndex]
    const lastBlock = blocks[lastIndex]

    // Create new content by combining the unselected parts
    let newText = ''
    if (firstIndex === lastIndex) {
      // Same block - just remove the selected text
      newText = firstBlock.text.replace(selectedContent, '')
    } else {
      // Multiple blocks - we need to extract the text more carefully
      // Get the actual text content and positions within each block
      const firstBlockContentEditable = startBlock.querySelector(
        '[contenteditable]'
      ) as HTMLElement
      const lastBlockContentEditable = endBlock.querySelector(
        '[contenteditable]'
      ) as HTMLElement

      if (firstBlockContentEditable && lastBlockContentEditable) {
        // Calculate the actual text positions
        const firstBlockFullText = firstBlockContentEditable.textContent || ''
        const lastBlockFullText = lastBlockContentEditable.textContent || ''

        // Find the selection boundaries within each block's text
        let firstBlockEndPos = firstBlockFullText.length
        let lastBlockStartPos = 0

        // For more accurate positioning, we need to calculate based on the range
        if (range.startContainer.nodeType === Node.TEXT_NODE) {
          firstBlockEndPos = range.startOffset
        }
        if (range.endContainer.nodeType === Node.TEXT_NODE) {
          lastBlockStartPos = range.endOffset
        }

        const firstBlockText = firstBlockFullText.substring(0, firstBlockEndPos)
        const lastBlockText = lastBlockFullText.substring(lastBlockStartPos)
        newText = firstBlockText + lastBlockText
      } else {
        // Fallback: just combine the texts
        newText = firstBlock.text + lastBlock.text
      }
    }

    // Update the blocks
    const newBlocks = [...blocks]

    // Remove the blocks in between (if any)
    if (lastIndex > firstIndex) {
      newBlocks.splice(firstIndex + 1, lastIndex - firstIndex)
    }

    // Update the first block with the combined text
    newBlocks[firstIndex] = {
      ...firstBlock,
      text: newText,
    }

    // If it was the same block, we're done. If different blocks, remove the last block
    if (firstIndex !== lastIndex && newBlocks[firstIndex + 1]) {
      newBlocks.splice(firstIndex + 1, 1)
    }

    onChange(newBlocks)

    // Clear selection and position cursor
    selection.removeAllRanges()

    // Position cursor at the end of the remaining text in the first block
    setTimeout(() => {
      const updatedBlock = document.querySelector(
        `[data-block-id="${startBlockId}"] [contenteditable]`
      ) as HTMLElement
      if (updatedBlock) {
        updatedBlock.focus()
        const range = document.createRange()
        const textNode = updatedBlock.firstChild
        if (textNode) {
          range.setStart(
            textNode,
            Math.min(newText.length, textNode.textContent?.length || 0)
          )
          range.collapse(true)
          selection.removeAllRanges()
          selection.addRange(range)
        }
      }
    }, 0)
  }

  useEffect((): (() => void) => {
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
        // Handle cross-block selection deletion
        if (isCrossBlockSelection()) {
          e.preventDefault()
          handleCrossBlockDeletion()
        } else if (isAllContentSelected()) {
          // Handle Delete/Backspace when all content is selected
          e.preventDefault()
          clearAllContent()
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Handle text replacement for cross-block selections
        if (isCrossBlockSelection()) {
          e.preventDefault()
          handleCrossBlockDeletion()

          // Insert the new character
          setTimeout(() => {
            const selection = window.getSelection()
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0)
              const textNode = document.createTextNode(e.key)
              range.insertNode(textNode)
              range.setStartAfter(textNode)
              range.collapse(true)
              selection.removeAllRanges()
              selection.addRange(range)

              // Trigger input event to update the block
              const contentEditable = textNode.parentElement?.closest(
                '[contenteditable]'
              ) as HTMLElement
              if (contentEditable) {
                const inputEvent = new Event('input', { bubbles: true })
                contentEditable.dispatchEvent(inputEvent)
              }
            }
          }, 0)
        }
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [
    selectAllContent,
    isAllContentSelected,
    clearAllContent,
    showCommandMenu,
    blocks,
    onChange,
    handleCrossBlockDeletion,
  ])

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

      // Handle Enter key for list continuation and image blocks
      if (e.key === 'Enter' && !showCommandMenu) {
        // Handle image blocks - create new paragraph block after them
        if (block.type === 'image') {
          e.preventDefault()
          const newBlockId = addBlock(blockId)
          focusBlock(newBlockId, 'start')
          return
        }

        // Handle list continuation
        if (block.type === 'bullet-list' || block.type === 'numbered-list') {
          e.preventDefault()

          // If the current list item is empty, convert it to a paragraph
          if (!block.text || block.text.trim() === '') {
            updateBlock(blockId, {
              type: 'paragraph',
              level: undefined,
              text: '',
              richText: '',
            })
            
            // Focus the converted paragraph block
            setTimeout(() => {
              focusBlock(blockId, 'start')
            }, 50)
            return
          }

          // Get current cursor position to split text properly
          const selection = window.getSelection()
          const contentEditable = (e.target as HTMLElement).closest('[contenteditable]') as HTMLElement
          
          if (selection && selection.rangeCount > 0 && contentEditable) {
            // Get cursor position relative to the content
            const range = selection.getRangeAt(0)
            const preCaretRange = range.cloneRange()
            preCaretRange.selectNodeContents(contentEditable)
            preCaretRange.setEnd(range.startContainer, range.startOffset)
            const caretPosition = preCaretRange.toString().length

            // Split the text at cursor position
            const currentText = block.text || ''
            const textBeforeCursor = currentText.substring(0, caretPosition)
            const textAfterCursor = currentText.substring(caretPosition)

            // Update current block with text before cursor
            updateBlock(blockId, {
              text: textBeforeCursor,
              richText: textBeforeCursor,
            })

            // Create a new list item with text after cursor
            const newBlockId = addBlock(blockId, {
              type: block.type,
              level: block.level,
              text: textAfterCursor,
              richText: textAfterCursor,
            })
            
            // Focus the new block at the start with proper timing
            setTimeout(() => {
              const newBlockElement = document.querySelector(`[data-block-id="${newBlockId}"]`) as HTMLElement
              if (newBlockElement) {
                const newContentEditable = newBlockElement.querySelector('[contenteditable]') as HTMLElement
                if (newContentEditable) {
                  newContentEditable.focus()
                  
                  // Position cursor at the start of the new block
                  const newRange = document.createRange()
                  const newSelection = window.getSelection()
                  
                  if (textAfterCursor) {
                    // If there's text, position at the beginning
                    const firstTextNode = newContentEditable.firstChild
                    if (firstTextNode && firstTextNode.nodeType === Node.TEXT_NODE) {
                      newRange.setStart(firstTextNode, 0)
                    } else {
                      newRange.setStart(newContentEditable, 0)
                    }
                  } else {
                    // Empty block, position at start
                    newRange.setStart(newContentEditable, 0)
                  }
                  
                  newRange.collapse(true)
                  newSelection?.removeAllRanges()
                  newSelection?.addRange(newRange)
                }
              }
            }, 100)
            return
          }

          // Fallback: create empty new list item if we can't get cursor position
          const newBlockId = addBlock(blockId, {
            type: block.type,
            level: block.level,
            text: '',
            richText: '',
          })
          
          setTimeout(() => {
            focusBlock(newBlockId, 'start')
          }, 100)
          return
        }

        // Handle paragraph blocks - create new block instead of allowing default behavior
        if (block.type === 'paragraph' || !block.type) {
          e.preventDefault()
          
          // Check if Shift+Enter was pressed - allow line break within block
          if (e.shiftKey) {
            // Allow line break within the current block
            document.execCommand('insertLineBreak')
            return
          }

          // Get current cursor position to split text properly
          const selection = window.getSelection()
          const contentEditable = (e.target as HTMLElement).closest('[contenteditable]') as HTMLElement
          
          if (selection && selection.rangeCount > 0 && contentEditable) {
            // Get cursor position relative to the content
            const range = selection.getRangeAt(0)
            const preCaretRange = range.cloneRange()
            preCaretRange.selectNodeContents(contentEditable)
            preCaretRange.setEnd(range.startContainer, range.startOffset)
            const caretPosition = preCaretRange.toString().length

            // Special case: When cursor is at the very start of the line (position 0)
            if (caretPosition === 0) {
              // Create a new empty block BEFORE the current block
              const blockIndex = blocks.findIndex(b => b.id === blockId)
              const newBlock = createNewBlock()
              const newBlocks = [
                ...blocks.slice(0, blockIndex),
                newBlock,
                ...blocks.slice(blockIndex)
              ]
              onChange(newBlocks)
              
              // Focus the current block (which is now the second block)
              setTimeout(() => {
                focusBlock(blockId, 'start')
              }, 50)
              return
            }

            // For all other positions, split the text at cursor position
            const currentText = block.text || ''
            const textBeforeCursor = currentText.substring(0, caretPosition)
            const textAfterCursor = currentText.substring(caretPosition)

            // Update current block with text before cursor
            updateBlock(blockId, {
              text: textBeforeCursor,
              richText: textBeforeCursor,
            })

            // Create a new paragraph block with text after cursor
            const newBlockId = addBlock(blockId, {
              type: 'paragraph',
              text: textAfterCursor,
              richText: textAfterCursor,
            })
            
            // Focus the new block at the start
            setTimeout(() => {
              const newBlockElement = document.querySelector(`[data-block-id="${newBlockId}"]`) as HTMLElement
              if (newBlockElement) {
                const newContentEditable = newBlockElement.querySelector('[contenteditable]') as HTMLElement
                if (newContentEditable) {
                  newContentEditable.focus()
                  
                  // Position cursor at the start of the new block
                  const newRange = document.createRange()
                  const newSelection = window.getSelection()
                  
                  if (textAfterCursor) {
                    // If there's text, position at the beginning
                    const firstTextNode = newContentEditable.firstChild
                    if (firstTextNode && firstTextNode.nodeType === Node.TEXT_NODE) {
                      newRange.setStart(firstTextNode, 0)
                    } else {
                      newRange.setStart(newContentEditable, 0)
                    }
                  } else {
                    // Empty block, position at start
                    newRange.setStart(newContentEditable, 0)
                  }
                  
                  newRange.collapse(true)
                  newSelection?.removeAllRanges()
                  newSelection?.addRange(newRange)
                }
              }
            }, 50)
            return
          }

          // Fallback: create empty new paragraph if we can't get cursor position
          const newBlockId = addBlock(blockId, {
            type: 'paragraph',
            text: '',
            richText: '',
          })
          
          setTimeout(() => {
            focusBlock(newBlockId, 'start')
          }, 50)
          return
        }

        // For other block types, allow default Enter behavior (line breaks within blocks)
      }

      // Handle arrow key navigation for image blocks
      if (block.type === 'image' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault()
        const blockIndex = blocks.findIndex(b => b.id === blockId)

        if (e.key === 'ArrowUp' && blockIndex > 0) {
          // Move to previous block
          const prevBlock = blocks[blockIndex - 1]
          focusBlock(prevBlock.id, 'end')
        } else if (e.key === 'ArrowDown' && blockIndex < blocks.length - 1) {
          // Move to next block
          const nextBlock = blocks[blockIndex + 1]
          focusBlock(nextBlock.id, 'start')
        } else if (e.key === 'ArrowDown' && blockIndex === blocks.length - 1) {
          // At last block, create new block
          const newBlockId = addBlock(blockId)
          focusBlock(newBlockId, 'start')
        }
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

      // Handle markdown shortcuts on space key - ENHANCED with line-based detection
      if (e.key === ' ') {
        const selection = window.getSelection()
        const contentEditable = (e.target as HTMLElement).closest('[contenteditable]') as HTMLElement
        
        if (selection && selection.rangeCount > 0 && contentEditable) {
          // Check if we're at the start of a line BEFORE the space is typed
          const lineInfo = getCurrentLineInfo(contentEditable, selection)
          
          if (lineInfo && lineInfo.isAtLineStart) {
            // Get the text that will exist after the space is typed
            const textBeforeSpace = lineInfo.lineText.substring(0, lineInfo.cursorPositionInLine)
            const futureLineText = textBeforeSpace + ' '
            
            // Check if this will match a markdown pattern
            const pattern = detectShortcutPattern(futureLineText)
            
            if (pattern) {
              e.preventDefault() // Prevent the space from being typed
              
              // Get text after the shortcut pattern (exclude the pattern itself)
              const textAfterPattern = lineInfo.lineText.substring(lineInfo.cursorPositionInLine)
              
              // For multi-line blocks, we need to handle the conversion differently
              if (lineInfo.lineStart > 0) {
                // We're on line 2+ within a block - split the block
                const beforeLines = lineInfo.fullText.substring(0, lineInfo.lineStart - 1) // -1 to exclude the \n
                const afterLines = lineInfo.lineEnd < lineInfo.fullText.length ? 
                  lineInfo.fullText.substring(lineInfo.lineEnd) : ''
                
                // Update the current block with content before the converted line
                if (beforeLines.trim()) {
                  updateBlock(blockId, {
                    text: beforeLines,
                    richText: beforeLines,
                  })
                } else {
                  // If no content before, delete the current block
                  deleteBlock(blockId)
                }
                
                // Create a new block with the converted type
                const newBlockId = addBlock(blockId, {
                  type: pattern.type,
                  level: pattern.level as 1 | 2 | 3,
                  text: textAfterPattern,
                  richText: textAfterPattern,
                })
                
                // If there's content after, create another block
                if (afterLines.trim()) {
                  addBlock(newBlockId, {
                    type: 'paragraph',
                    text: afterLines,
                    richText: afterLines,
                  })
                }
                
                // Focus the new converted block
                setTimeout(() => {
                  focusBlock(newBlockId, 'start')
                }, 50)
              } else {
                // We're on the first line - convert the entire block
                updateBlock(blockId, {
                  type: pattern.type,
                  level: pattern.level as 1 | 2 | 3,
                  text: textAfterPattern,
                  richText: textAfterPattern,
                })
                
                // Focus the converted block
                setTimeout(() => {
                  focusBlock(blockId, 'start')
                }, 50)
              }
            }
          }
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

      // Handle slash commands - ENHANCED with line-based detection
      if (e.key === '/') {
        const selection = window.getSelection()
        const contentEditable = (e.target as HTMLElement).closest('[contenteditable]') as HTMLElement
        
        if (selection && selection.rangeCount > 0 && contentEditable) {
          // Check if we're at the start of a line (empty or at the beginning)
          const lineInfo = getCurrentLineInfo(contentEditable, selection)
          
          if (lineInfo && (lineInfo.cursorPositionInLine === 0 || lineInfo.lineText.trim() === '')) {
            // Allow the "/" to be typed first, then show command menu
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
    [
      blocks,
      addBlock,
      deleteBlock,
      updateBlock,
      isAllContentSelected,
      clearAllContent,
      selectAllContent,
      showCommandMenu,
    ]
  )

  const handleImageUpload = useCallback(
    (blockId: string): void => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = (e): void => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          // Validate file size (max 10MB)
          if (file.size > 10 * 1024 * 1024) {
            console.warn('File too large, max 10MB allowed')
            return
          }

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

      // Capture the activeBlockId before clearing it
      const blockIdToFocus = activeBlockId

      // Close command menu first
      setShowCommandMenu(false)
      setActiveBlockId(null)

      // Handle image upload specially
      if (command.type === 'image') {
        updateBlock(activeBlockId, { text: '', richText: '' })
        handleImageUpload(activeBlockId)
      } else {
        // Find current block and update it with new type
        const currentBlock = blocks.find(b => b.id === activeBlockId)
        if (currentBlock) {
          // Create updated blocks array
          const newBlocks = blocks.map(block => {
            if (block.id === activeBlockId) {
              return {
                ...block,
                type: command.type,
                level: command.level as 1 | 2 | 3,
                text: '',
                richText: ''
              }
            }
            return block
          })
          
          // Update all blocks at once to trigger proper re-render
          immediateOnChange(newBlocks)
        }
      }

      // Focus the transformed block (skip for image as it doesn't need text focus)
      if (command.type !== 'image') {
        setTimeout(() => {
          const element = document.querySelector(
            `[data-block-id="${blockIdToFocus}"] [contenteditable]`
          ) as HTMLElement
          if (element) {
            // Clear any slash command text from the DOM
            element.innerHTML = ''
            element.textContent = ''
            element.focus()
            
            // Place cursor at the beginning
            const range = document.createRange()
            const selection = window.getSelection()
            range.setStart(element, 0)
            range.collapse(true)
            selection?.removeAllRanges()
            selection?.addRange(range)
          }
        }, 100) // Increased timeout to ensure DOM updates are complete
      }
    },
    [activeBlockId, blocks, immediateOnChange, handleImageUpload]
  )

  const renderBlock = (block: JournalBlock, index: number): JSX.Element => {
    const blockClassName = getBlockClassName(block, isEditing)
    // Only show placeholder for the first block if it's empty
    const showPlaceholder = index === 0 && (!block.text || block.text.trim() === '')

    // Handle image blocks specially
    if (block.type === 'image') {
      return (
        <div
          key={block.id}
          data-block-id={block.id}
          data-block-type={block.type}
          data-block-level={block.level}
          className={blockClassName}
        >
          {block.imageUrl ? (
            <img
              src={block.imageUrl}
              alt={block.imageAlt || 'Uploaded image'}
              className="max-w-full h-auto rounded-lg shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
              tabIndex={0}
              onKeyDown={(e) => handleBlockKeyDown(e.nativeEvent, block.id)}
              onClick={(e) => handleImageBlockClick(block.id, e.nativeEvent)}
              draggable={false}
            />
          ) : (
            <div
              className="border-2 border-dashed border-stone-300 rounded-lg p-8 text-center cursor-pointer hover:border-stone-400 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
              tabIndex={0}
              onKeyDown={(e) => handleBlockKeyDown(e.nativeEvent, block.id)}
              onClick={() => handleImageUpload(block.id)}
            >
              <p className="text-stone-500">Click to upload an image</p>
            </div>
          )}
        </div>
      )
    }

    // Handle text blocks with SimplifiedRichTextEditor
    return (
      <div
        key={block.id}
        data-block-id={block.id}
        data-block-type={block.type}
        data-block-level={block.level}
        className={blockClassName}
      >
        <SimplifiedRichTextEditor
          key={block.id} // Stable key to prevent re-mounting
          block={block}
          onChange={updateBlock}
          onKeyDown={handleBlockKeyDown}
          placeholder={getPlaceholderForBlockType(block.type, index)}
          showPlaceholder={showPlaceholder}
        />
      </div>
    )
  }

  const getPlaceholderForBlockType = (
    type: JournalBlock['type'],
    blockIndex: number
  ): string => {
    // Don't show any placeholder if showPlaceholder is false
    if (!showPlaceholder) {
      return ''
    }

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
    <div className="relative bg-white h-full">
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
        
        
        /* Enhanced bullet list styling - always visible */
        [data-block-type="bullet-list"] {
          padding-left: 2rem;
          position: relative;
        }
        
        [data-block-type="bullet-list"]::before {
          content: '•' !important;
          position: absolute !important;
          left: 1rem !important;
          top: 0.6em !important;
          color: #57534e !important;
          font-weight: bold !important;
          font-size: 1.125rem !important;
          line-height: 1 !important;
          pointer-events: none !important;
          z-index: 10 !important;
          user-select: none !important;
          opacity: 1 !important;
          visibility: visible !important;
          display: block !important;
        }
        
        /* Force bullets to stay visible in all states */
        [data-block-type="bullet-list"]:focus::before,
        [data-block-type="bullet-list"]:hover::before,
        [data-block-type="bullet-list"]:focus-within::before,
        [data-block-type="bullet-list"] [contenteditable]:focus::before,
        [data-block-type="bullet-list"] [contenteditable]:hover::before,
        [data-block-type="bullet-list"] [contenteditable]:active::before {
          opacity: 1 !important;
          visibility: visible !important;
          display: block !important;
        }
        
        /* Enhanced numbered list styling - always visible */
        [data-block-type="numbered-list"] {
          padding-left: 2rem;
          position: relative;
        }
        
        [data-block-type="numbered-list"]::before {
          content: attr(data-list-number) '.' !important;
          position: absolute !important;
          left: 0.5rem !important;
          top: 0.6em !important;
          color: #57534e !important;
          font-weight: 500 !important;
          font-size: 1rem !important;
          line-height: 1 !important;
          pointer-events: none !important;
          z-index: 10 !important;
          user-select: none !important;
          opacity: 1 !important;
          visibility: visible !important;
          display: block !important;
        }
        
        /* Force numbers to stay visible in all states */
        [data-block-type="numbered-list"]:focus::before,
        [data-block-type="numbered-list"]:hover::before,
        [data-block-type="numbered-list"]:focus-within::before,
        [data-block-type="numbered-list"] [contenteditable]:focus::before,
        [data-block-type="numbered-list"] [contenteditable]:hover::before,
        [data-block-type="numbered-list"] [contenteditable]:active::before {
          opacity: 1 !important;
          visibility: visible !important;
          display: block !important;
        }
      `}</style>

      <div
        ref={editorRef}
        className="flex-1 p-6 bg-white focus:ring-0 outline-none overflow-y-auto transition-all duration-200 min-h-full journal-editor-scroll"
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          userSelect: 'text',
          backgroundColor: '#ffffff',
        }}
        onClick={(e) => {
          // Handle clicks on the editor container itself (empty areas)
          if (e.target === e.currentTarget) {
            handleEmptyAreaClick(e.nativeEvent)
          }
        }}
      >
        {blocks.map((block, index) => renderBlock(block, index))}

        {/* Add some padding at the bottom to make it easier to click after the last block */}
        <div className="h-32 w-full" onClick={(e) => {
          e.preventDefault()
          if (blocks.length > 0) {
            const lastBlock = blocks[blocks.length - 1]
            const newBlockId = addBlock(lastBlock.id)
            focusBlock(newBlockId, 'start')
          }
        }} />
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
})
