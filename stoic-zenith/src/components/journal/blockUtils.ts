import { JournalBlock } from './types'

// Block boundary markers for single contentEditable
export const BLOCK_MARKER_ATTRIBUTE = 'data-block-id'
export const BLOCK_MARKER_TYPE = 'data-block-type'
export const BLOCK_MARKER_LEVEL = 'data-block-level'

export interface BlockPosition {
  blockId: string
  offset: number
  node: Node
}

export function createBlockElement(block: JournalBlock): HTMLElement {
  let element: HTMLElement

  // Handle special block types
  if (block.type === 'image' && block.imageUrl) {
    element = document.createElement('div')
    element.innerHTML = `<img src="${block.imageUrl}" alt="${block.imageAlt || 'Uploaded image'}" class="max-w-full h-auto rounded-lg shadow-sm" draggable="false" />`
  } else {
    element = document.createElement('div')
    element.textContent = block.text
  }

  element.setAttribute(BLOCK_MARKER_ATTRIBUTE, block.id)
  element.setAttribute(BLOCK_MARKER_TYPE, block.type)
  if (block.level) {
    element.setAttribute(BLOCK_MARKER_LEVEL, block.level.toString())
  }

  // Apply styling based on block type
  element.className = getBlockClassName(block)

  // Make block draggable for text content (not images)
  if (block.type !== 'image') {
    element.draggable = true
  }

  return element
}

export function getBlockClassName(
  block: JournalBlock,
  isEditing: boolean = false
): string {
  const baseClasses =
    'block-element outline-none min-h-[1.5rem] leading-relaxed cursor-text'

  // Conditional font class based on editing state
  const fontClass = isEditing
    ? 'font-conditional editing-mode'
    : 'font-conditional display-mode'

  switch (block.type) {
    case 'heading': {
      const headingClasses = {
        1: 'text-3xl font-bold text-stone-800 mb-6 leading-tight',
        2: 'text-2xl font-semibold text-stone-800 mb-4 leading-tight',
        3: 'text-xl font-medium text-stone-800 mb-3 leading-tight',
      }
      return `${baseClasses} ${fontClass} ${headingClasses[block.level || 1]}`
    }

    case 'bullet-list':
      return `${baseClasses} ${fontClass} mb-3 text-base text-stone-700 leading-relaxed pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-stone-600 before:select-none`

    case 'numbered-list':
      return `${baseClasses} ${fontClass} mb-3 text-base text-stone-700 leading-relaxed pl-6 relative before:content-[attr(data-list-number)'.'] before:absolute before:left-0 before:text-stone-600 before:select-none before:font-medium`

    case 'quote':
      return `${baseClasses} ${fontClass} border-l-4 border-stone-300 pl-4 mb-4 italic text-stone-600 text-base leading-relaxed`

    case 'code':
      return `${baseClasses} bg-stone-100 rounded-lg p-4 mb-4 font-mono text-sm text-stone-800 leading-relaxed`

    case 'image':
      return `${baseClasses} mb-4`

    default:
      return `${baseClasses} ${fontClass} mb-4 text-base text-stone-700 leading-relaxed`
  }
}

export function findBlockElement(element: Node): HTMLElement | null {
  let current = element
  while (current && current.nodeType !== Node.DOCUMENT_NODE) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      const el = current as HTMLElement
      if (el.hasAttribute(BLOCK_MARKER_ATTRIBUTE)) {
        return el
      }
    }
    current = current.parentNode || null
  }
  return null
}

export function getBlockId(element: HTMLElement): string | null {
  return element.getAttribute(BLOCK_MARKER_ATTRIBUTE)
}

export function getBlockType(
  element: HTMLElement
): JournalBlock['type'] | null {
  return element.getAttribute(BLOCK_MARKER_TYPE) as JournalBlock['type'] | null
}

export function getBlockLevel(element: HTMLElement): 1 | 2 | 3 | null {
  const level = element.getAttribute(BLOCK_MARKER_LEVEL)
  return level ? (parseInt(level) as 1 | 2 | 3) : null
}

export function getCurrentBlockPosition(): BlockPosition | null {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return null

  const range = selection.getRangeAt(0)
  const blockElement = findBlockElement(range.startContainer)

  if (!blockElement) return null

  const blockId = getBlockId(blockElement)
  if (!blockId) return null

  return {
    blockId,
    offset: range.startOffset,
    node: range.startContainer,
  }
}

export function setCaretPosition(blockId: string, offset: number): void {
  try {
    const blockElement = document.querySelector(
      `[${BLOCK_MARKER_ATTRIBUTE}="${blockId}"]`
    )
    if (!blockElement) return

    const selection = window.getSelection()
    if (!selection) return

    const range = document.createRange()

    // Find the text node to position the caret
    const walker = document.createTreeWalker(
      blockElement,
      NodeFilter.SHOW_TEXT,
      null
    )

    const textNode = walker.nextNode()
    if (textNode && textNode.textContent) {
      // Position in text node, ensuring we don't exceed its length
      const maxOffset = Math.min(offset, textNode.textContent.length)
      range.setStart(textNode, maxOffset)
      range.collapse(true)
    } else {
      // No text node or empty text - handle empty blocks
      // Check if block has zero-width space or is completely empty
      const blockText = blockElement.textContent || ''
      
      if (blockText === '\u200B' || blockText === '') {
        // For empty blocks with zero-width space or completely empty
        // Focus the block element itself and ensure cursor is at start
        ;(blockElement as HTMLElement).focus()
        
        // Create a text node if none exists
        if (!blockElement.firstChild || blockElement.firstChild.nodeType !== Node.TEXT_NODE) {
          const textNode = document.createTextNode('\u200B')
          blockElement.appendChild(textNode)
        }
        
        // Position cursor at the beginning of the text node
        const firstTextNode = blockElement.firstChild
        if (firstTextNode && firstTextNode.nodeType === Node.TEXT_NODE) {
          range.setStart(firstTextNode, 0)
          range.collapse(true)
        } else {
          // Fallback: position at start of block element
          range.setStart(blockElement, 0)
          range.collapse(true)
        }
      } else {
        // Block has content but no text nodes found - position at start
        range.setStart(blockElement, 0)
        range.collapse(true)
      }
    }

    selection.removeAllRanges()
    selection.addRange(range)
    
    // Ensure the block element is focused for proper cursor visibility
    if (document.activeElement !== blockElement) {
      ;(blockElement as HTMLElement).focus()
    }
  } catch (error) {
    // Ignore DOM manipulation errors - they're expected during React re-renders
    console.warn('setCaretPosition warning (safely ignored):', error)
  }
}

export function getAllBlockElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll(`[${BLOCK_MARKER_ATTRIBUTE}]`))
}

export function blockElementToJournalBlock(element: HTMLElement): JournalBlock {
  const id = getBlockId(element) || 'unknown'
  const type = getBlockType(element) || 'paragraph'
  const level = getBlockLevel(element)
  const text = element.textContent || ''

  return {
    id,
    type,
    level: level || undefined,
    text,
    createdAt: new Date(),
  }
}

export function updateNumberedListCounters(container: HTMLElement): void {
  const numberedLists = container.querySelectorAll(
    `[${BLOCK_MARKER_TYPE}="numbered-list"]`
  )
  let counter = 1

  numberedLists.forEach(element => {
    const el = element as HTMLElement
    el.style.setProperty('--list-counter', counter.toString())
    el.classList.add('numbered-list-item')

    // Add the number as a pseudo-element
    el.setAttribute('data-list-number', counter.toString())
    counter++
  })
}

export function getSelectedBlocks(): HTMLElement[] {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return []

  const range = selection.getRangeAt(0)
  const startBlock = findBlockElement(range.startContainer)
  const endBlock = findBlockElement(range.endContainer)

  if (!startBlock || !endBlock) return []

  // If same block, return single block
  if (startBlock === endBlock) return [startBlock]

  // Find all blocks between start and end
  const allBlocks = getAllBlockElements(
    startBlock.closest('[contenteditable]') as HTMLElement
  )
  const startIndex = allBlocks.indexOf(startBlock)
  const endIndex = allBlocks.indexOf(endBlock)

  if (startIndex === -1 || endIndex === -1) return [startBlock]

  return allBlocks.slice(
    Math.min(startIndex, endIndex),
    Math.max(startIndex, endIndex) + 1
  )
}

export function getSelectedText(): string {
  const selection = window.getSelection()
  return selection ? selection.toString() : ''
}

export function insertTextAtCursor(text: string): void {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return

  const range = selection.getRangeAt(0)
  range.deleteContents()

  const textNode = document.createTextNode(text)
  range.insertNode(textNode)

  // Move cursor to end of inserted text
  range.setStartAfter(textNode)
  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)
}

export function deleteSelectedContent(): void {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return

  const range = selection.getRangeAt(0)
  if (!range.collapsed) {
    range.deleteContents()
  }
}

export function selectBlockContent(blockId: string): void {
  const blockElement = document.querySelector(
    `[${BLOCK_MARKER_ATTRIBUTE}="${blockId}"]`
  )
  if (!blockElement) return

  const selection = window.getSelection()
  if (!selection) return

  const range = document.createRange()
  range.selectNodeContents(blockElement)
  selection.removeAllRanges()
  selection.addRange(range)
}

export function selectMultipleBlocks(
  startBlockId: string,
  endBlockId: string
): void {
  const startElement = document.querySelector(
    `[${BLOCK_MARKER_ATTRIBUTE}="${startBlockId}"]`
  )
  const endElement = document.querySelector(
    `[${BLOCK_MARKER_ATTRIBUTE}="${endBlockId}"]`
  )

  if (!startElement || !endElement) return

  const selection = window.getSelection()
  if (!selection) return

  const range = document.createRange()
  range.setStartBefore(startElement)
  range.setEndAfter(endElement)
  selection.removeAllRanges()
  selection.addRange(range)
}
