import {
  getSelectedBlocks,
  getSelectedText,
  insertTextAtCursor,
  deleteSelectedContent,
  selectBlockContent,
  selectMultipleBlocks,
  findBlockElement,
  getBlockId,
  BLOCK_MARKER_ATTRIBUTE,
} from './blockUtils'

export interface SelectionInfo {
  hasSelection: boolean
  isMultiBlock: boolean
  isMultiLine: boolean
  selectedBlocks: HTMLElement[]
  selectedText: string
  selectedLines: string[]
  startBlockId: string | null
  endBlockId: string | null
  startLineIndex: number
  endLineIndex: number
}

export interface DragInfo {
  isDragging: boolean
  draggedText: string
  draggedBlocks: HTMLElement[]
  draggedLines: string[]
  sourceBlockIds: string[]
  isMultiLine: boolean
  sourceLineIndices: number[]
}

export class SelectionManager {
  private dragInfo: DragInfo = {
    isDragging: false,
    draggedText: '',
    draggedBlocks: [],
    draggedLines: [],
    sourceBlockIds: [],
    isMultiLine: false,
    sourceLineIndices: [],
  }

  getSelectionInfo(): SelectionInfo {
    const selection = window.getSelection()
    const hasSelection = !!(selection && !selection.isCollapsed)
    const selectedBlocks = getSelectedBlocks()
    const selectedText = getSelectedText()
    const selectedLines = this.getSelectedLines()
    
    let startBlockId: string | null = null
    let endBlockId: string | null = null
    let startLineIndex = 0
    let endLineIndex = 0
    
    if (hasSelection && selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const startBlock = findBlockElement(range.startContainer)
      const endBlock = findBlockElement(range.endContainer)
      
      startBlockId = startBlock ? getBlockId(startBlock) : null
      endBlockId = endBlock ? getBlockId(endBlock) : null
      
      // Calculate line indices for multi-line selection
      if (startBlock && endBlock) {
        const lineInfo = this.getLineIndicesFromSelection(range, startBlock, endBlock)
        startLineIndex = lineInfo.startLine
        endLineIndex = lineInfo.endLine
      }
    }

    return {
      hasSelection,
      isMultiBlock: selectedBlocks.length > 1,
      isMultiLine: selectedLines.length > 1,
      selectedBlocks,
      selectedText,
      selectedLines,
      startBlockId,
      endBlockId,
      startLineIndex,
      endLineIndex,
    }
  }

  startDrag(event: DragEvent): void {
    const selectionInfo = this.getSelectionInfo()
    
    if (!selectionInfo.hasSelection) return

    this.dragInfo = {
      isDragging: true,
      draggedText: selectionInfo.selectedText,
      draggedBlocks: selectionInfo.selectedBlocks,
      draggedLines: selectionInfo.selectedLines,
      sourceBlockIds: selectionInfo.selectedBlocks
        .map(block => getBlockId(block))
        .filter(Boolean) as string[],
      isMultiLine: selectionInfo.isMultiLine,
      sourceLineIndices: [selectionInfo.startLineIndex, selectionInfo.endLineIndex],
    }

    // Set drag data
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', selectionInfo.selectedText)
      event.dataTransfer.setData('application/x-journal-blocks', JSON.stringify(this.dragInfo.sourceBlockIds))
      event.dataTransfer.setData('application/x-journal-lines', JSON.stringify({
        lines: this.dragInfo.draggedLines,
        isMultiLine: this.dragInfo.isMultiLine,
        sourceIndices: this.dragInfo.sourceLineIndices
      }))
      event.dataTransfer.effectAllowed = 'move'
    }
  }

  handleDrop(event: DragEvent, targetBlockId: string, insertPosition: 'before' | 'after' | 'inside' = 'after'): boolean {
    event.preventDefault()
    
    const draggedText = event.dataTransfer?.getData('text/plain') || ''
    const draggedBlockIds = event.dataTransfer?.getData('application/x-journal-blocks')
    
    if (!draggedText) return false

    // Insert the dragged text at the drop position
    if (insertPosition === 'inside') {
      // Focus the target block and insert at cursor
      const targetElement = document.querySelector(`[${BLOCK_MARKER_ATTRIBUTE}="${targetBlockId}"]`) as HTMLElement
      if (targetElement) {
        targetElement.focus()
        insertTextAtCursor(draggedText)
      }
    } else {
      // Create new block before/after target
      const targetElement = document.querySelector(`[${BLOCK_MARKER_ATTRIBUTE}="${targetBlockId}"]`)
      if (targetElement && targetElement.parentElement) {
        const newBlockElement = document.createElement('div')
        newBlockElement.setAttribute(BLOCK_MARKER_ATTRIBUTE, `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
        newBlockElement.setAttribute('data-block-type', 'paragraph')
        newBlockElement.className = 'block-element outline-none min-h-[1.5rem] leading-relaxed cursor-text mb-4 text-base text-stone-700 leading-relaxed font-inknut'
        newBlockElement.textContent = draggedText
        
        if (insertPosition === 'before') {
          targetElement.parentElement.insertBefore(newBlockElement, targetElement)
        } else {
          targetElement.parentElement.insertBefore(newBlockElement, targetElement.nextSibling)
        }
        
        // Focus the new block
        newBlockElement.focus()
      }
    }

    // If this was a move operation (same document), delete the source content
    if (draggedBlockIds && this.dragInfo.isDragging) {
      deleteSelectedContent()
    }

    this.endDrag()
    return true
  }

  private insertTextBetweenLines(text: string, clientY: number): void {
    const container = document.querySelector('[contenteditable]') as HTMLElement
    if (!container) return
    
    // Find the closest line position based on clientY
    const containerRect = container.getBoundingClientRect()
    const relativeY = clientY - containerRect.top
    
    const lines = (container.textContent || '').split('\n')
    const lineHeight = 24 // Approximate line height in pixels
    const targetLineIndex = Math.floor(relativeY / lineHeight)
    
    // Insert text at the calculated line position
    const beforeLines = lines.slice(0, targetLineIndex)
    const afterLines = lines.slice(targetLineIndex)
    
    const newText = [...beforeLines, text, ...afterLines].join('\n')
    container.textContent = newText
    
    // Position cursor after inserted text
    const insertOffset = beforeLines.join('\n').length + (beforeLines.length > 0 ? 1 : 0)
    this.setCursorPosition(container, insertOffset + text.length)
  }

  private insertTextAtDropPosition(targetElement: HTMLElement, text: string, clientX: number, clientY: number): void {
    // Calculate character position based on mouse coordinates
    const range = document.caretRangeFromPoint(clientX, clientY)
    if (range) {
      range.deleteContents()
      const textNode = document.createTextNode(text)
      range.insertNode(textNode)
      range.setStartAfter(textNode)
      range.collapse(true)
      
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
    } else {
      // Fallback: append to end of target element
      targetElement.focus()
      insertTextAtCursor(text)
    }
  }

  private insertMultiLineText(targetBlockId: string, lines: string[], position: 'before' | 'after'): void {
    const targetElement = document.querySelector(`[${BLOCK_MARKER_ATTRIBUTE}="${targetBlockId}"]`)
    if (!targetElement) return
    
    const container = targetElement.closest('[contenteditable]') as HTMLElement
    if (!container) return
    
    // Find target element position in container text
    const containerText = container.textContent || ''
    const targetText = targetElement.textContent || ''
    const targetIndex = containerText.indexOf(targetText)
    
    if (targetIndex === -1) return
    
    const beforeTarget = containerText.substring(0, targetIndex)
    const afterTarget = containerText.substring(targetIndex + targetText.length)
    
    const insertText = lines.join('\n')
    let newText: string
    let cursorOffset: number
    
    if (position === 'before') {
      newText = beforeTarget + insertText + '\n' + targetText + afterTarget
      cursorOffset = beforeTarget.length + insertText.length
    } else {
      newText = beforeTarget + targetText + '\n' + insertText + afterTarget
      cursorOffset = beforeTarget.length + targetText.length + 1 + insertText.length
    }
    
    container.textContent = newText
    this.setCursorPosition(container, cursorOffset)
  }

  private insertSingleLineText(targetBlockId: string, text: string, position: 'before' | 'after'): void {
    const targetElement = document.querySelector(`[${BLOCK_MARKER_ATTRIBUTE}="${targetBlockId}"]`) as HTMLElement
    if (!targetElement) return
    
    if (position === 'before') {
      targetElement.textContent = text + '\n' + (targetElement.textContent || '')
    } else {
      targetElement.textContent = (targetElement.textContent || '') + '\n' + text
    }
    
    targetElement.focus()
  }

  private setCursorPosition(element: HTMLElement, offset: number): void {
    const selection = window.getSelection()
    if (!selection) return
    
    const range = document.createRange()
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    )
    
    let currentOffset = 0
    let node = walker.nextNode()
    
    while (node) {
      const nodeLength = node.textContent?.length || 0
      if (currentOffset + nodeLength >= offset) {
        range.setStart(node, offset - currentOffset)
        range.collapse(true)
        selection.removeAllRanges()
        selection.addRange(range)
        return
      }
      currentOffset += nodeLength
      node = walker.nextNode()
    }
    
    // Fallback: position at end
    range.selectNodeContents(element)
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)
  }

  endDrag(): void {
    this.dragInfo = {
      isDragging: false,
      draggedText: '',
      draggedBlocks: [],
      draggedLines: [],
      sourceBlockIds: [],
      isMultiLine: false,
      sourceLineIndices: [],
    }
  }

  selectText(startBlockId: string, startOffset: number, endBlockId: string, endOffset: number): void {
    const startElement = document.querySelector(`[${BLOCK_MARKER_ATTRIBUTE}="${startBlockId}"]`) as HTMLElement
    const endElement = document.querySelector(`[${BLOCK_MARKER_ATTRIBUTE}="${endBlockId}"]`) as HTMLElement
    
    if (!startElement || !endElement) return

    const selection = window.getSelection()
    if (!selection) return

    const range = document.createRange()
    
    // Find text nodes for precise positioning
    const startTextNode = this.findTextNodeAtOffset(startElement, startOffset)
    const endTextNode = this.findTextNodeAtOffset(endElement, endOffset)
    
    if (startTextNode.node && endTextNode.node) {
      range.setStart(startTextNode.node, startTextNode.offset)
      range.setEnd(endTextNode.node, endTextNode.offset)
    } else {
      // Fallback to element-based selection
      range.setStart(startElement, startOffset)
      range.setEnd(endElement, endOffset)
    }
    
    selection.removeAllRanges()
    selection.addRange(range)
  }

  selectBlocks(blockIds: string[]): void {
    if (blockIds.length === 0) return
    
    if (blockIds.length === 1) {
      selectBlockContent(blockIds[0])
    } else {
      selectMultipleBlocks(blockIds[0], blockIds[blockIds.length - 1])
    }
  }

  copySelection(): string {
    const selectionInfo = this.getSelectionInfo()
    if (!selectionInfo.hasSelection) return ''
    
    // Copy to clipboard
    navigator.clipboard.writeText(selectionInfo.selectedText).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = selectionInfo.selectedText
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      // Safer removal with additional checks
      if (textArea.parentNode) {
        textArea.remove()
      }
    })
    
    return selectionInfo.selectedText
  }

  cutSelection(): string {
    const text = this.copySelection()
    if (text) {
      deleteSelectedContent()
    }
    return text
  }

  paste(text: string): void {
    insertTextAtCursor(text)
  }

  private findTextNodeAtOffset(element: HTMLElement, offset: number): { node: Node | null; offset: number } {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    )
    
    let currentOffset = 0
    let node = walker.nextNode()
    
    while (node) {
      const nodeLength = node.textContent?.length || 0
      if (currentOffset + nodeLength >= offset) {
        return {
          node,
          offset: offset - currentOffset
        }
      }
      currentOffset += nodeLength
      node = walker.nextNode()
    }
    
    return { node: null, offset: 0 }
  }

  private getSelectedLines(): string[] {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return []
    
    const range = selection.getRangeAt(0)
    const selectedText = range.toString()
    
    // Split by line breaks to get individual lines
    return selectedText.split('\n').filter(line => line.trim() !== '')
  }

  private getLineIndicesFromSelection(range: Range, startBlock: HTMLElement, endBlock: HTMLElement): { startLine: number; endLine: number } {
    const startText = startBlock.textContent || ''
    const endText = endBlock.textContent || ''
    
    // Calculate line numbers based on newline characters
    const startLines = startText.substring(0, range.startOffset).split('\n')
    const endLines = endText.substring(0, range.endOffset).split('\n')
    
    return {
      startLine: startLines.length - 1,
      endLine: endLines.length - 1
    }
  }

  selectLines(startLine: number, endLine: number, container?: HTMLElement): void {
    const targetContainer = container || document.querySelector('[contenteditable]') as HTMLElement
    if (!targetContainer) return
    
    const text = targetContainer.textContent || ''
    const lines = text.split('\n')
    
    if (startLine < 0 || endLine >= lines.length || startLine > endLine) return
    
    // Calculate character positions for line start/end
    let startOffset = 0
    let endOffset = 0
    
    for (let i = 0; i < startLine; i++) {
      startOffset += lines[i].length + 1 // +1 for newline
    }
    
    for (let i = 0; i <= endLine; i++) {
      endOffset += lines[i].length
      if (i < endLine) endOffset += 1 // +1 for newline
    }
    
    // Create selection range
    const selection = window.getSelection()
    if (!selection) return
    
    const range = document.createRange()
    const walker = document.createTreeWalker(
      targetContainer,
      NodeFilter.SHOW_TEXT,
      null
    )
    
    let currentOffset = 0
    let startNode: Node | null = null
    let endNode: Node | null = null
    let startNodeOffset = 0
    let endNodeOffset = 0
    
    let node = walker.nextNode()
    while (node) {
      const nodeLength = node.textContent?.length || 0
      
      if (!startNode && currentOffset + nodeLength >= startOffset) {
        startNode = node
        startNodeOffset = startOffset - currentOffset
      }
      
      if (currentOffset + nodeLength >= endOffset) {
        endNode = node
        endNodeOffset = endOffset - currentOffset
        break
      }
      
      currentOffset += nodeLength
      node = walker.nextNode()
    }
    
    if (startNode && endNode) {
      range.setStart(startNode, startNodeOffset)
      range.setEnd(endNode, endNodeOffset)
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }

  selectCurrentLine(): void {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    
    const range = selection.getRangeAt(0)
    const container = range.commonAncestorContainer
    const block = findBlockElement(container)
    
    if (!block) return
    
    const text = block.textContent || ''
    const cursorOffset = range.startOffset
    
    // Find line boundaries
    const beforeCursor = text.substring(0, cursorOffset)
    const afterCursor = text.substring(cursorOffset)
    
    const lineStart = beforeCursor.lastIndexOf('\n') + 1
    const lineEndInAfter = afterCursor.indexOf('\n')
    const lineEnd = lineEndInAfter === -1 ? text.length : cursorOffset + lineEndInAfter
    
    // Select the current line
    const newRange = document.createRange()
    const walker = document.createTreeWalker(
      block,
      NodeFilter.SHOW_TEXT,
      null
    )
    
    let currentOffset = 0
    let startNode: Node | null = null
    let endNode: Node | null = null
    let startNodeOffset = 0
    let endNodeOffset = 0
    
    let node = walker.nextNode()
    while (node) {
      const nodeLength = node.textContent?.length || 0
      
      if (!startNode && currentOffset + nodeLength >= lineStart) {
        startNode = node
        startNodeOffset = lineStart - currentOffset
      }
      
      if (currentOffset + nodeLength >= lineEnd) {
        endNode = node
        endNodeOffset = lineEnd - currentOffset
        break
      }
      
      currentOffset += nodeLength
      node = walker.nextNode()
    }
    
    if (startNode && endNode) {
      newRange.setStart(startNode, startNodeOffset)
      newRange.setEnd(endNode, endNodeOffset)
      selection.removeAllRanges()
      selection.addRange(newRange)
    }
  }

  // Simplified text selection only (no drag-drop)
  setupDragAndDrop(container: HTMLElement): () => void {
    // Add keyboard event handlers for line selection only
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'l':
            e.preventDefault()
            this.selectCurrentLine()
            break
          case 'ArrowUp':
            if (e.shiftKey) {
              e.preventDefault()
              this.extendSelectionUp()
            }
            break
          case 'ArrowDown':
            if (e.shiftKey) {
              e.preventDefault()
              this.extendSelectionDown()
            }
            break
        }
      }
    }

    // Only add keyboard listener for text selection shortcuts
    container.addEventListener('keydown', handleKeyDown)

    // Return cleanup function
    return (): void => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }

  private showLineDragIndicator(event: DragEvent, container: HTMLElement): void {
    const containerRect = container.getBoundingClientRect()
    const relativeY = event.clientY - containerRect.top
    
    // Calculate which line we're hovering over
    const lineHeight = 24 // Approximate line height
    const lineIndex = Math.floor(relativeY / lineHeight)
    
    // Create line-specific drop indicator
    const indicator = document.createElement('div')
    indicator.className = 'drop-indicator absolute w-full h-0.5 bg-green-500 z-10 pointer-events-none'
    indicator.style.left = '0'
    indicator.style.right = '0'
    indicator.style.top = (lineIndex * lineHeight) + 'px'
    
    container.style.position = 'relative'
    container.appendChild(indicator)
    
    // Add visual feedback for line-based drop
    const lineIndicator = document.createElement('div')
    lineIndicator.className = 'line-drop-indicator absolute left-0 w-2 h-6 bg-green-500 z-10 pointer-events-none rounded-r'
    lineIndicator.style.top = (lineIndex * lineHeight - 3) + 'px'
    container.appendChild(lineIndicator)
  }

  extendSelectionUp(): void {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    
    const range = selection.getRangeAt(0)
    const container = findBlockElement(range.startContainer)
    if (!container) return
    
    const text = container.textContent || ''
    const currentStart = this.getAbsoluteOffset(range.startContainer, range.startOffset, container)
    
    // Find previous line start
    const beforeCurrent = text.substring(0, currentStart)
    const previousLineEnd = beforeCurrent.lastIndexOf('\n')
    
    if (previousLineEnd > 0) {
      const beforePrevious = text.substring(0, previousLineEnd)
      const previousLineStart = beforePrevious.lastIndexOf('\n') + 1
      
      // Extend selection to include previous line
      this.selectTextRange(container, previousLineStart, range.endOffset)
    }
  }

  extendSelectionDown(): void {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    
    const range = selection.getRangeAt(0)
    const container = findBlockElement(range.endContainer)
    if (!container) return
    
    const text = container.textContent || ''
    const currentEnd = this.getAbsoluteOffset(range.endContainer, range.endOffset, container)
    
    // Find next line end
    const afterCurrent = text.substring(currentEnd)
    const nextLineBreak = afterCurrent.indexOf('\n')
    
    if (nextLineBreak !== -1) {
      const nextLineEnd = currentEnd + nextLineBreak
      const afterNext = text.substring(nextLineEnd + 1)
      const nextNextLineBreak = afterNext.indexOf('\n')
      const nextLineRealEnd = nextNextLineBreak === -1 ? text.length : nextLineEnd + 1 + nextNextLineBreak
      
      // Extend selection to include next line
      this.selectTextRange(container, range.startOffset, nextLineRealEnd)
    }
  }

  private startTextDrag(event: MouseEvent, selectedText: string): void {
    // Create enhanced drag image with better styling and structure
    const dragImage = this.createEnhancedDragImage(selectedText)
    document.body.appendChild(dragImage)
    
    // Create custom drag operation
    const container = document.querySelector('[contenteditable]') as HTMLElement
    if (container) {
      const handleMouseMove = (e: MouseEvent): void => {
        // Enhanced drag image positioning with smooth following
        this.updateDragImagePosition(dragImage, e)
        
        // Show enhanced drop indicators
        this.showDragIndicators(e, container)
      }
      
      const handleMouseUp = (e: MouseEvent): void => {
        // Handle drop
        this.handleTextDrop(e, selectedText, container)
        
        // Enhanced cleanup
        if (dragImage.parentNode) {
          dragImage.remove()
        }
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        this.cleanupDragIndicators(container)
      }
      
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      // Initial position
      handleMouseMove(event)
    }
  }
  
  private showDragIndicators(event: MouseEvent, container: HTMLElement): void {
    // Remove existing indicators safely
    container.querySelectorAll('.drop-indicator').forEach(el => {
      if (el.parentNode) el.remove()
    })
    container.querySelectorAll('.line-drop-indicator').forEach(el => {
      if (el.parentNode) el.remove()
    })
    container.querySelectorAll('.magnetic-zone').forEach(el => {
      if (el.parentNode) el.remove()
    })
    
    const containerRect = container.getBoundingClientRect()
    const relativeY = event.clientY - containerRect.top
    const lineHeight = 24
    const lineIndex = Math.floor(relativeY / lineHeight)
    
    // Create enhanced drop indicator with animation
    this.createEnhancedDropIndicator(container, lineIndex, lineHeight)
    
    // Create magnetic zone for better targeting
    this.createMagneticZone(container, lineIndex, lineHeight, relativeY)
  }
  
  private handleTextDrop(event: MouseEvent, draggedText: string, container: HTMLElement): void {
    const containerRect = container.getBoundingClientRect()
    const relativeY = event.clientY - containerRect.top
    const lineHeight = 24
    const lineIndex = Math.floor(relativeY / lineHeight)
    
    const text = container.textContent || ''
    const lines = text.split('\n')
    
    // Enhanced drop handling with visual feedback
    this.performEnhancedDrop(draggedText, lines, lineIndex, container)
  }

  private getAbsoluteOffset(node: Node, offset: number, container: HTMLElement): number {
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null
    )
    
    let currentOffset = 0
    let currentNode = walker.nextNode()
    
    while (currentNode && currentNode !== node) {
      currentOffset += currentNode.textContent?.length || 0
      currentNode = walker.nextNode()
    }
    
    return currentOffset + offset
  }

  private cleanupDragIndicators(container: HTMLElement): void {
    // Smooth cleanup of all drag indicators
    const indicators = container.querySelectorAll('.drop-indicator, .line-drop-indicator, .magnetic-zone')
    indicators.forEach(indicator => {
      const el = indicator as HTMLElement
      el.style.transition = 'opacity 0.15s ease-out, transform 0.15s ease-out'
      el.style.opacity = '0'
      el.style.transform = 'scale(0.8)'
      
      setTimeout(() => {
        // Use remove() for safer element removal
        el.remove()
      }, 150)
    })
  }
  
  private showEnhancedBlockIndicator(event: DragEvent, blockElement: HTMLElement, _container: HTMLElement): void {
    const rect = blockElement.getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    const isTop = event.clientY < midY
    
    const indicator = document.createElement('div')
    indicator.className = 'drop-indicator enhanced-block-indicator'
    
    Object.assign(indicator.style, {
      position: 'absolute',
      left: '0',
      right: '0',
      height: '3px',
      background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
      zIndex: '1000',
      pointerEvents: 'none',
      borderRadius: '1.5px',
      boxShadow: '0 0 12px rgba(59, 130, 246, 0.5)',
      transform: 'scaleX(0)',
      transformOrigin: 'left',
      animation: 'dropIndicatorExpand 0.25s ease-out forwards'
    })
    
    if (isTop) {
      indicator.style.top = '-1px'
    } else {
      indicator.style.bottom = '-1px'
    }
    
    blockElement.style.position = 'relative'
    blockElement.appendChild(indicator)
    
    // Add magnetic zone for block
    const magneticZone = document.createElement('div')
    magneticZone.className = 'magnetic-zone block-magnetic-zone'
    
    Object.assign(magneticZone.style, {
      position: 'absolute',
      left: '-8px',
      right: '-8px',
      height: '100%',
      top: '0',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderRadius: '6px',
      border: '1px dashed rgba(59, 130, 246, 0.3)',
      zIndex: '999',
      pointerEvents: 'none',
      animation: 'magneticZonePulse 1.5s ease-in-out infinite'
    })
    
    blockElement.appendChild(magneticZone)
  }

  private createEnhancedDragImage(selectedText: string): HTMLElement {
    const lines = selectedText.split('\n')
    const isMultiLine = lines.length > 1
    const charCount = selectedText.length
    const lineCount = lines.length
    
    const dragImage = document.createElement('div')
    dragImage.className = 'enhanced-drag-image'
    
    // Enhanced styling for better visual feedback
    Object.assign(dragImage.style, {
      position: 'fixed',
      top: '-1000px',
      left: '-1000px',
      background: 'rgba(255, 255, 255, 0.95)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '13px',
      fontFamily: 'Inter, system-ui, sans-serif',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
      backdropFilter: 'blur(8px)',
      maxWidth: '300px',
      zIndex: '10000',
      pointerEvents: 'none',
      transform: 'rotate(2deg)',
      transition: 'transform 0.1s ease-out'
    })
    
    // Create header with stats
    const header = document.createElement('div')
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px solid rgba(59, 130, 246, 0.2);
      font-size: 11px;
      color: #6b7280;
      font-weight: 500;
    `
    
    const stats = document.createElement('span')
    stats.textContent = isMultiLine 
      ? `${lineCount} lines, ${charCount} chars`
      : `${charCount} characters`
    
    const dragIcon = document.createElement('span')
    dragIcon.textContent = '⋮⋮'
    dragIcon.style.cssText = 'color: #9ca3af; font-size: 14px;'
    
    header.appendChild(stats)
    header.appendChild(dragIcon)
    dragImage.appendChild(header)
    
    // Create content preview
    const content = document.createElement('div')
    content.style.cssText = `
      color: #374151;
      line-height: 1.4;
      max-height: 120px;
      overflow: hidden;
      position: relative;
    `
    
    if (isMultiLine) {
      // Show structured preview for multi-line
      const previewLines = lines.slice(0, 4)
      previewLines.forEach((line, index) => {
        const lineDiv = document.createElement('div')
        lineDiv.style.cssText = `
          margin-bottom: 2px;
          opacity: ${1 - (index * 0.15)};
          font-size: ${13 - (index * 0.5)}px;
        `
        lineDiv.textContent = line.length > 50 ? line.substring(0, 50) + '...' : line
        content.appendChild(lineDiv)
      })
      
      if (lines.length > 4) {
        const moreDiv = document.createElement('div')
        moreDiv.style.cssText = 'color: #9ca3af; font-style: italic; font-size: 11px; margin-top: 4px;'
        moreDiv.textContent = `... ${lines.length - 4} more lines`
        content.appendChild(moreDiv)
      }
    } else {
      // Single line preview
      content.textContent = selectedText.length > 80 
        ? selectedText.substring(0, 80) + '...'
        : selectedText
    }
    
    dragImage.appendChild(content)
    
    // Add subtle gradient overlay for depth
    const overlay = document.createElement('div')
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%);
      border-radius: 8px;
      pointer-events: none;
    `
    dragImage.appendChild(overlay)
    
    return dragImage
  }
  
  private createEnhancedDropIndicator(container: HTMLElement, lineIndex: number, lineHeight: number): void {
    const indicator = document.createElement('div')
    indicator.className = 'drop-indicator enhanced-drop-indicator'
    
    Object.assign(indicator.style, {
      position: 'absolute',
      left: '0',
      right: '0',
      height: '2px',
      background: 'linear-gradient(90deg, #10b981, #059669)',
      top: (lineIndex * lineHeight - 1) + 'px',
      zIndex: '1000',
      pointerEvents: 'none',
      borderRadius: '1px',
      boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)',
      transform: 'scaleX(0)',
      transformOrigin: 'left',
      animation: 'dropIndicatorExpand 0.2s ease-out forwards'
    })
    
    // Add CSS animation keyframes if not already present
    if (!document.querySelector('#drop-indicator-styles')) {
      const style = document.createElement('style')
      style.id = 'drop-indicator-styles'
      style.textContent = `
        @keyframes dropIndicatorExpand {
          to { transform: scaleX(1); }
        }
        @keyframes magneticZonePulse {
          0%, 100% { background-color: rgba(16, 185, 129, 0.1); }
          50% { background-color: rgba(16, 185, 129, 0.2); }
        }
      `
      document.head.appendChild(style)
    }
    
    container.style.position = 'relative'
    container.appendChild(indicator)
  }
  
  private createMagneticZone(container: HTMLElement, lineIndex: number, lineHeight: number, _relativeY: number): void {
    const magneticZone = document.createElement('div')
    magneticZone.className = 'magnetic-zone'
    
    const zoneHeight = lineHeight * 0.8
    const zoneTop = (lineIndex * lineHeight) - (zoneHeight / 2)
    
    Object.assign(magneticZone.style, {
      position: 'absolute',
      left: '-4px',
      right: '-4px',
      height: zoneHeight + 'px',
      top: zoneTop + 'px',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderRadius: '4px',
      border: '1px dashed rgba(16, 185, 129, 0.3)',
      zIndex: '999',
      pointerEvents: 'none',
      animation: 'magneticZonePulse 1.5s ease-in-out infinite',
      transition: 'all 0.15s ease-out'
    })
    
    container.appendChild(magneticZone)
  }

  private selectTextRange(container: HTMLElement, startOffset: number, endOffset: number): void {
    const selection = window.getSelection()
    if (!selection) return
    
    const range = document.createRange()
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null
    )
    
    let currentOffset = 0
    let startNode: Node | null = null
    let endNode: Node | null = null
    let startNodeOffset = 0
    let endNodeOffset = 0
    
    let node = walker.nextNode()
    while (node) {
      const nodeLength = node.textContent?.length || 0
      
      if (!startNode && currentOffset + nodeLength >= startOffset) {
        startNode = node
        startNodeOffset = startOffset - currentOffset
      }
      
      if (currentOffset + nodeLength >= endOffset) {
        endNode = node
        endNodeOffset = endOffset - currentOffset
        break
      }
      
      currentOffset += nodeLength
      node = walker.nextNode()
    }
    
    if (startNode && endNode) {
      range.setStart(startNode, startNodeOffset)
      range.setEnd(endNode, endNodeOffset)
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }

  private updateDragImagePosition(dragImage: HTMLElement, event: MouseEvent): void {
    const offset = 10
    dragImage.style.left = (event.clientX + offset) + 'px'
    dragImage.style.top = (event.clientY + offset) + 'px'
  }

  private performEnhancedDrop(draggedText: string, lines: string[], lineIndex: number, container: HTMLElement): void {
    const newLines = [...lines]
    newLines.splice(lineIndex, 0, draggedText)
    container.textContent = newLines.join('\n')
    
    // Position cursor after inserted text
    const insertOffset = lines.slice(0, lineIndex).join('\n').length + (lineIndex > 0 ? 1 : 0)
    this.setCursorPosition(container, insertOffset + draggedText.length)
  }
}

// Global instance
export const selectionManager = new SelectionManager()