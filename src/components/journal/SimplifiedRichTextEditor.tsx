import React, { useCallback, useRef, useEffect, useLayoutEffect, useState } from 'react'
import { JournalBlock } from './types'
import { Bold, Italic, Underline, Strikethrough, Link as LinkIcon } from 'lucide-react'
import { sanitizeHtml } from './richTextUtils'

interface SimplifiedRichTextEditorProps {
  block: JournalBlock
  onChange: (blockId: string, updates: Partial<JournalBlock>) => void
  onKeyDown?: (e: KeyboardEvent, blockId: string) => void
  onSplashCommand?: (blockId: string, searchQuery: string) => void // NEW PROP for splash command
  onSplashCommandHide?: (blockId: string) => void // NEW PROP to hide splash command
  className?: string
  placeholder?: string
  showPlaceholder?: boolean // NEW PROP
}

// Utility functions for cursor management
const saveCursorPosition = (element: HTMLElement): { start: number; end: number } | null => {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return null

  const range = selection.getRangeAt(0)
  if (!element.contains(range.startContainer)) return null

  const preCaretRange = range.cloneRange()
  preCaretRange.selectNodeContents(element)
  preCaretRange.setEnd(range.startContainer, range.startOffset)
  const start = preCaretRange.toString().length

  const end = start + range.toString().length
  return { start, end }
}

const restoreCursorPosition = (element: HTMLElement, position: { start: number; end: number }): void => {
  const selection = window.getSelection()
  if (!selection) return

  const range = document.createRange()
  let charIndex = 0
  const nodeStack = [element]
  let node: Node | undefined
  let foundStart = false
  let foundEnd = false

  while ((node = nodeStack.pop())) {
    if (node.nodeType === Node.TEXT_NODE) {
      const textNode = node as Text
      const nextCharIndex = charIndex + textNode.length

      if (!foundStart && position.start >= charIndex && position.start <= nextCharIndex) {
        range.setStart(textNode, position.start - charIndex)
        foundStart = true
      }

      if (foundStart && position.end >= charIndex && position.end <= nextCharIndex) {
        range.setEnd(textNode, position.end - charIndex)
        foundEnd = true
        break
      }

      charIndex = nextCharIndex
    } else {
      for (let i = node.childNodes.length - 1; i >= 0; i--) {
        nodeStack.push(node.childNodes[i] as HTMLElement)
      }
    }
  }

  if (foundStart) {
    if (!foundEnd) {
      range.collapse(true)
    }
    selection.removeAllRanges()
    selection.addRange(range)
  }
}

export const SimplifiedRichTextEditor = React.memo(function SimplifiedRichTextEditor({
  block,
  onChange,
  onKeyDown,
  onSplashCommand,
  className = '',
  placeholder = 'Type something...',
  showPlaceholder = true, // default true for backward compatibility
}: SimplifiedRichTextEditorProps): JSX.Element {
  const editorRef = useRef<HTMLDivElement>(null)
  const [showToolbar, setShowToolbar] = useState(false)
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 })
  const cursorPositionRef = useRef<{ start: number; end: number } | null>(null)
  const isUserEditingRef = useRef(false) // Track when user is actively editing
  const lastContentRef = useRef<string>('') // Track last known content to prevent loops
  const shouldRestoreCursorRef = useRef(false) // Track when cursor should be restored

  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    const text = target.textContent || ''
    let html = target.innerHTML || ''

    // Simplified HTML normalization - only handle essential line breaks
    // Since Enter key handling is now controlled, we don't need aggressive normalization
    html = html.replace(/<br\s*\/?>/gi, '\n')
    
    // Clean up excessive newlines but preserve intentional line breaks
    html = html.replace(/\n{3,}/g, '\n\n')
    
    // Ensure text has proper newlines from the DOM
    // The textContent already contains newlines from the contenteditable

    // Immediately remove placeholder when user starts typing
    if (text.length > 0 && target.hasAttribute('data-placeholder')) {
      target.removeAttribute('data-placeholder')
    }

    // Prevent duplicate updates
    if (text === lastContentRef.current) {
      return
    }
    lastContentRef.current = text

    // CRITICAL FIX: Save cursor position BEFORE any state changes
    // Store cursor immediately to prevent loss
    if (editorRef.current && document.activeElement === editorRef.current) {
      const cursorPos = saveCursorPosition(editorRef.current)
      if (cursorPos) {
        cursorPositionRef.current = cursorPos
        shouldRestoreCursorRef.current = true
      }
    }

    // Mark as user editing with longer protection window to prevent conflicts
    isUserEditingRef.current = true
    // Use a longer delay to prevent premature external updates
    setTimeout(() => {
      isUserEditingRef.current = false
    }, 500) // Increased from 100ms to prevent cursor loss

    // Check for splash command on current line
    if (onSplashCommand && editorRef.current) {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        try {
          const range = selection.getRangeAt(0)
          const fullText = editorRef.current.textContent || ''

          // Get cursor position in the text
          const preCaretRange = range.cloneRange()
          preCaretRange.selectNodeContents(editorRef.current)
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

          // Check if current line starts with splash
          if (currentLineText.toLowerCase().startsWith('splash')) {
            const searchQuery = currentLineText.slice(6) // Remove "splash" (6 characters)
            console.log('🎯 Splash command detected in SimplifiedRichTextEditor:', {
              blockId: block.id,
              currentLineText,
              searchQuery,
              fullText,
              caretPosition
            })
            onSplashCommand(block.id, searchQuery)
          }
        } catch (error) {
          console.warn('Error detecting splash command:', error)
        }
      }
    }

    // Debug logging for splash command
    if (text.includes('splash')) {
      console.log('📝 SimplifiedRichTextEditor input:', {
        blockId: block.id,
        text,
        html,
        blockType: block.type
      })
    }

    // Always call onChange for immediate autosave and state sync
    onChange(block.id, {
      text, // Keep original text with newlines intact
      richText: html, // Store normalized HTML with consistent newlines
    })
    
    // Also trigger immediate state sync for markdown detection
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => {
        // Additional sync after idle to ensure state is up to date
        const currentText = target.textContent || ''
        if (currentText !== text) {
          onChange(block.id, {
            text: currentText,
            richText: target.innerHTML || '',
          })
        }
      })
    }
  }, [block.id, onChange])

  // Initialize content when block changes
  useEffect(() => {
    if (editorRef.current && !isUserEditingRef.current) {
      const currentText = editorRef.current.textContent || ''
      const blockContent = block.text || ''

      // Only update if content is actually different
      if (currentText !== blockContent) {
        // CRITICAL FIX: Use innerHTML with proper newline conversion
        // This preserves both formatting and line breaks
        if (block.richText) {
          // Convert newlines in richText to <br> tags for display
          const htmlWithBreaks = block.richText.replace(/\n/g, '<br>')
          editorRef.current.innerHTML = sanitizeHtml(htmlWithBreaks)
        } else if (blockContent) {
          // Convert plain text newlines to <br> for display
          const textWithBreaks = blockContent.replace(/\n/g, '<br>')
          editorRef.current.innerHTML = textWithBreaks
        } else {
          editorRef.current.textContent = ''
        }
        lastContentRef.current = blockContent
      }

      // Set placeholder if empty
      if (!blockContent || blockContent.trim() === '') {
        editorRef.current.setAttribute('data-placeholder', placeholder)
      } else {
        editorRef.current.removeAttribute('data-placeholder')
      }
    }
  }, [block.id, block.text, block.richText, placeholder])

  // CRITICAL FIX: Restore cursor position after React re-renders
  useLayoutEffect(() => {
    if (shouldRestoreCursorRef.current && cursorPositionRef.current && editorRef.current) {
      // Restore cursor immediately in layout effect for smoother experience
      const editor = editorRef.current
      const cursorPos = cursorPositionRef.current
      
      // Only restore if editor is still focused
      if (document.activeElement === editor) {
        restoreCursorPosition(editor, cursorPos)
      }
      
      shouldRestoreCursorRef.current = false
      cursorPositionRef.current = null
    }
  })

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    // Remove placeholder immediately when user starts typing any printable character
    if (editorRef.current && editorRef.current.hasAttribute('data-placeholder')) {
      const isPrintableChar = e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey
      if (isPrintableChar) {
        editorRef.current.removeAttribute('data-placeholder')
      }
    }

    // Handle keyboard shortcuts with simplified cursor management
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          document.execCommand('bold')
          break
        case 'i':
          e.preventDefault()
          document.execCommand('italic')
          break
        case 'u':
          e.preventDefault()
          document.execCommand('underline')
          break
        case 'k': {
          e.preventDefault()
          const url = window.prompt('Enter URL:')
          if (url) {
            document.execCommand('createLink', false, url)
          }
          break
        }
      }
    }

    // Call parent handler (this handles slash commands)
    if (onKeyDown) {
      onKeyDown(e.nativeEvent, block.id)
    }
  }, [block.id, onKeyDown])

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }, [])

  const handleFocus = useCallback(() => {
    // Remove placeholder when focused
    if (editorRef.current) {
      editorRef.current.removeAttribute('data-placeholder')
    }
  }, [])

  const handleBlur = useCallback(() => {
    // Trigger immediate save on blur to ensure no data loss
    if (editorRef.current) {
      const target = editorRef.current
      const text = target.textContent || ''
      let html = target.innerHTML || ''

      // Simplified HTML normalization consistent with handleInput
      html = html.replace(/<br\s*\/?>/gi, '\n')
      html = html.replace(/\n{3,}/g, '\n\n')

      // Force immediate save if content has changed
      if (text !== block.text || html !== block.richText) {
        onChange(block.id, {
          text,
          richText: html,
        })
      }

      // Re-evaluate placeholder when focus is lost
      const isEmpty = !text || text.trim() === ''
      if (isEmpty) {
        target.setAttribute('data-placeholder', placeholder)
      }
    }
    isUserEditingRef.current = false
  }, [block.id, block.text, block.richText, onChange, placeholder])

  // Update content when block changes externally (simplified)
  useEffect(() => {
    if (editorRef.current && !isUserEditingRef.current) {
      const blockContent = block.text || ''
      const currentText = editorRef.current.textContent || ''

      // Only update if content actually changed
      if (currentText !== blockContent) {
        if (block.richText) {
          // Convert newlines to <br> tags for proper display
          const htmlWithBreaks = block.richText.replace(/\n/g, '<br>')
          editorRef.current.innerHTML = sanitizeHtml(htmlWithBreaks)
        } else if (blockContent) {
          // Convert plain text newlines to <br> for display
          const textWithBreaks = blockContent.replace(/\n/g, '<br>')
          editorRef.current.innerHTML = textWithBreaks
        } else {
          editorRef.current.textContent = ''
        }
        lastContentRef.current = blockContent
      }
    }
  }, [block.richText, block.text])

  // Set placeholder - only show for truly empty blocks
  useEffect(() => {
    if (editorRef.current) {
      const isEmpty = !block.text || block.text.trim() === ''
      const hasNoContent = !editorRef.current.textContent || editorRef.current.textContent.trim() === ''
      const isFocused = editorRef.current.contains(document.activeElement)

      // Only show placeholder if showPlaceholder is true, block is empty, and not focused
      if (showPlaceholder && isEmpty && hasNoContent && !isFocused) {
        editorRef.current.setAttribute('data-placeholder', placeholder)
      } else {
        editorRef.current.removeAttribute('data-placeholder')
      }
    }
  }, [block.text, placeholder, showPlaceholder])

  // Initialize content on mount
  useEffect(() => {
    if (editorRef.current) {
      const content = block.richText || block.text || ''
      // Always set innerHTML, even for empty content
      editorRef.current.innerHTML = sanitizeHtml(content || '')
    }
  }, []) // Only run on mount

  // Handle text selection changes to show/hide toolbar
  useEffect(() => {
    const handleSelectionChange = (): void => {
      const selection = window.getSelection()
      if (!selection || !editorRef.current) return

      const hasSelection = !selection.isCollapsed && selection.toString().length > 0

      if (hasSelection) {
        // Check if selection is within this editor
        const range = selection.getRangeAt(0)
        const isWithinEditor = editorRef.current.contains(range.commonAncestorContainer)

        if (isWithinEditor) {
          // Calculate toolbar position
          const rect = range.getBoundingClientRect()
          const x = (rect.left + rect.right) / 2
          const y = rect.top - 50 // Position above selection

          setToolbarPosition({ x, y })
          setShowToolbar(true)
        } else {
          setShowToolbar(false)
        }
      } else {
        setShowToolbar(false)
      }
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [])

  const applyFormat = useCallback((command: string): void => {
    document.execCommand(command)
    editorRef.current?.focus()
  }, [])

  const insertLink = useCallback((): void => {
    const url = window.prompt('Enter URL:')
    if (url) {
      document.execCommand('createLink', false, url)
    }
    editorRef.current?.focus()
  }, [])

  return (
    <div className="relative">
      {/* Formatting Toolbar - appears on text selection */}
      {showToolbar && (
        <div
          className="fixed z-50 animate-in fade-in-0 zoom-in-95 duration-200"
          style={{
            left: toolbarPosition.x - 100, // Center the toolbar
            top: Math.max(10, toolbarPosition.y),
          }}
        >
          <div className="flex items-center gap-1 p-1 bg-white border border-stone-200 rounded-lg shadow-lg">
            <button
              type="button"
              onClick={() => applyFormat('bold')}
              className="p-1.5 rounded hover:bg-stone-100 text-stone-600"
              title="Bold (Ctrl+B)"
            >
              <Bold size={14} />
            </button>

            <button
              type="button"
              onClick={() => applyFormat('italic')}
              className="p-1.5 rounded hover:bg-stone-100 text-stone-600"
              title="Italic (Ctrl+I)"
            >
              <Italic size={14} />
            </button>

            <button
              type="button"
              onClick={() => applyFormat('underline')}
              className="p-1.5 rounded hover:bg-stone-100 text-stone-600"
              title="Underline (Ctrl+U)"
            >
              <Underline size={14} />
            </button>

            <button
              type="button"
              onClick={() => applyFormat('strikeThrough')}
              className="p-1.5 rounded hover:bg-stone-100 text-stone-600"
              title="Strikethrough"
            >
              <Strikethrough size={14} />
            </button>

            <div className="w-px h-4 bg-stone-300 mx-1" />

            <button
              type="button"
              onClick={insertLink}
              className="p-1.5 rounded hover:bg-stone-100 text-stone-600"
              title="Add Link (Ctrl+K)"
            >
              <LinkIcon size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`min-h-[1.5rem] focus:outline-none bg-white ${className}`}
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          minHeight: '1.5rem',
          padding: '0.5rem', // Keep consistent padding for all blocks
          borderRadius: '0.375rem',
          lineHeight: '1.8',
        }}
        data-block-id={block.id}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #a8a29e;
          font-style: italic;
          pointer-events: none;
          position: absolute;
        }

        [contenteditable]:focus:empty:before {
          opacity: 0.7;
        }

        [contenteditable]:not(:empty):before {
          display: none;
        }
        
        
        [contenteditable] a {
          color: #ea580c;
          text-decoration: underline;
        }
        
        [contenteditable] strong {
          font-weight: bold;
        }
        
        [contenteditable] em {
          font-style: italic;
        }
        
        [contenteditable] u {
          text-decoration: underline;
        }
        
        [contenteditable] s {
          text-decoration: line-through;
        }
        
        [contenteditable] code {
          background-color: #f5f5f4;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
          font-size: 0.875em;
        }
      `}</style>
    </div>
  )
})
