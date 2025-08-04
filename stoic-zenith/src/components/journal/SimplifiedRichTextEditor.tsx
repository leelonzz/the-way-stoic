import React, { useCallback, useRef, useEffect, useState } from 'react'
import { JournalBlock } from './types'
import { Bold, Italic, Underline, Strikethrough, Link as LinkIcon, Code } from 'lucide-react'

interface SimplifiedRichTextEditorProps {
  block: JournalBlock
  onChange: (blockId: string, updates: Partial<JournalBlock>) => void
  onKeyDown?: (e: KeyboardEvent, blockId: string) => void
  className?: string
  placeholder?: string
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
  let nodeStack = [element]
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

export function SimplifiedRichTextEditor({
  block,
  onChange,
  onKeyDown,
  className = '',
  placeholder = 'Type something...'
}: SimplifiedRichTextEditorProps): JSX.Element {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showToolbar, setShowToolbar] = useState(false)
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 })
  const cursorPositionRef = useRef<{ start: number; end: number } | null>(null)

  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    if (isUpdating) return

    const target = e.currentTarget
    const text = target.textContent || ''
    const html = target.innerHTML || ''

    // Immediately remove placeholder when user starts typing
    if (text.length > 0 && target.hasAttribute('data-placeholder')) {
      target.removeAttribute('data-placeholder')
    }

    // Save cursor position before updating
    if (editorRef.current) {
      cursorPositionRef.current = saveCursorPosition(editorRef.current)
    }

    onChange(block.id, {
      text,
      richText: html,
    })
  }, [block.id, onChange, isUpdating])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    // Remove placeholder immediately when user starts typing any printable character
    if (editorRef.current && editorRef.current.hasAttribute('data-placeholder')) {
      const isPrintableChar = e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey
      if (isPrintableChar) {
        editorRef.current.removeAttribute('data-placeholder')
      }
    }

    // Save cursor position before any operations
    if (editorRef.current) {
      cursorPositionRef.current = saveCursorPosition(editorRef.current)
    }

    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          document.execCommand('bold')
          // Restore cursor after formatting
          setTimeout(() => {
            if (editorRef.current && cursorPositionRef.current) {
              restoreCursorPosition(editorRef.current, cursorPositionRef.current)
            }
          }, 0)
          break
        case 'i':
          e.preventDefault()
          document.execCommand('italic')
          setTimeout(() => {
            if (editorRef.current && cursorPositionRef.current) {
              restoreCursorPosition(editorRef.current, cursorPositionRef.current)
            }
          }, 0)
          break
        case 'u':
          e.preventDefault()
          document.execCommand('underline')
          setTimeout(() => {
            if (editorRef.current && cursorPositionRef.current) {
              restoreCursorPosition(editorRef.current, cursorPositionRef.current)
            }
          }, 0)
          break
        case 'k':
          e.preventDefault()
          const url = window.prompt('Enter URL:')
          if (url) {
            document.execCommand('createLink', false, url)
            setTimeout(() => {
              if (editorRef.current && cursorPositionRef.current) {
                restoreCursorPosition(editorRef.current, cursorPositionRef.current)
              }
            }, 0)
          }
          break
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
    // Re-evaluate placeholder when focus is lost
    if (editorRef.current && !isUpdating) {
      const isEmpty = !block.text || block.text.trim() === ''
      const hasNoContent = !editorRef.current.textContent || editorRef.current.textContent.trim() === ''

      if (isEmpty && hasNoContent) {
        editorRef.current.setAttribute('data-placeholder', placeholder)
      }
    }
  }, [block.text, placeholder, isUpdating])

  // Update content when block changes externally
  useEffect(() => {
    if (editorRef.current && !isUpdating) {
      const content = block.richText || block.text || ''
      const currentContent = editorRef.current.innerHTML

      // Only update if content actually changed and we're not currently editing
      if (currentContent !== content && !editorRef.current.contains(document.activeElement)) {
        setIsUpdating(true)
        editorRef.current.innerHTML = content

        // Restore cursor position if we have one saved
        if (cursorPositionRef.current) {
          setTimeout(() => {
            if (editorRef.current) {
              restoreCursorPosition(editorRef.current, cursorPositionRef.current!)
              cursorPositionRef.current = null
            }
            setIsUpdating(false)
          }, 0)
        } else {
          setIsUpdating(false)
        }
      }
    }
  }, [block.richText, block.text, isUpdating])

  // Set placeholder - only show for truly empty blocks
  useEffect(() => {
    if (editorRef.current && !isUpdating) {
      const isEmpty = !block.text || block.text.trim() === ''
      const hasNoContent = !editorRef.current.textContent || editorRef.current.textContent.trim() === ''
      const isFocused = editorRef.current.contains(document.activeElement)

      // Only show placeholder if block is empty AND not currently focused
      if (isEmpty && hasNoContent && !isFocused) {
        editorRef.current.setAttribute('data-placeholder', placeholder)
      } else {
        editorRef.current.removeAttribute('data-placeholder')
      }
    }
  }, [block.text, placeholder, isUpdating])

  // Initialize content on mount
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      const content = block.richText || block.text || ''
      if (content) {
        editorRef.current.innerHTML = content
      }
    }
  }, []) // Only run on mount

  // Handle text selection changes to show/hide toolbar
  useEffect(() => {
    const handleSelectionChange = () => {
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

  const applyFormat = useCallback((command: string) => {
    // Save cursor position before formatting
    if (editorRef.current) {
      cursorPositionRef.current = saveCursorPosition(editorRef.current)
    }

    document.execCommand(command)
    editorRef.current?.focus()

    // Restore cursor position after formatting
    setTimeout(() => {
      if (editorRef.current && cursorPositionRef.current) {
        restoreCursorPosition(editorRef.current, cursorPositionRef.current)
      }
    }, 0)
  }, [])

  const insertLink = useCallback(() => {
    // Save cursor position before link insertion
    if (editorRef.current) {
      cursorPositionRef.current = saveCursorPosition(editorRef.current)
    }

    const url = window.prompt('Enter URL:')
    if (url) {
      document.execCommand('createLink', false, url)
    }
    editorRef.current?.focus()

    // Restore cursor position after link insertion
    setTimeout(() => {
      if (editorRef.current && cursorPositionRef.current) {
        restoreCursorPosition(editorRef.current, cursorPositionRef.current)
      }
    }, 0)
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
        className={`min-h-[1.5rem] focus:outline-none ${className}`}
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
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
}
