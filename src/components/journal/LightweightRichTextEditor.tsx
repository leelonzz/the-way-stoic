'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { JournalBlock } from './types'

interface LightweightRichTextEditorProps {
  block: JournalBlock
  onChange: (blockId: string, updates: Partial<JournalBlock>) => void
  onKeyDown?: (e: KeyboardEvent, blockId: string) => void
  className?: string
  placeholder?: string
}

/**
 * Lightweight text editor that loads instantly without TipTap bundle
 * Falls back to full TipTap editor when advanced features are needed
 */
export function LightweightRichTextEditor({
  block,
  onChange,
  onKeyDown,
  className = '',
  placeholder = 'Type something...'
}: LightweightRichTextEditorProps): JSX.Element {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isAdvancedMode, setIsAdvancedMode] = useState(false)
  const [TipTapEditor, setTipTapEditor] = useState<React.ComponentType<any> | null>(null)

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [])

  // Handle text change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    onChange(block.id, { text: newText })
    adjustTextareaHeight()
  }, [block.id, onChange, adjustTextareaHeight])

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const nativeEvent = e.nativeEvent

    // Check for advanced formatting shortcuts that require TipTap
    if (e.metaKey || e.ctrlKey) {
      if (e.key === 'k' || e.key === 'u') { // Link or underline - switch to advanced
        e.preventDefault()
        setIsAdvancedMode(true)
        return
      }
    }

    // Call parent handler
    if (onKeyDown) {
      onKeyDown(nativeEvent, block.id)
    }
  }, [block.id, onKeyDown])

  // Load TipTap editor dynamically when needed
  useEffect(() => {
    if (isAdvancedMode && !TipTapEditor) {
      import('./TipTapRichTextEditor').then((module) => {
        setTipTapEditor(() => module.TipTapRichTextEditor)
      })
    }
  }, [isAdvancedMode, TipTapEditor])

  // Auto-resize on content change
  useEffect(() => {
    adjustTextareaHeight()
  }, [block.text, adjustTextareaHeight])

  // Check if content has rich formatting that requires TipTap
  const hasRichFormatting = block.richText && block.richText !== block.text

  // Switch to advanced mode if rich formatting is detected
  useEffect(() => {
    if (hasRichFormatting && !isAdvancedMode) {
      setIsAdvancedMode(true)
    }
  }, [hasRichFormatting, isAdvancedMode])

  // Render TipTap editor if advanced mode is active and loaded
  if (isAdvancedMode && TipTapEditor) {
    return (
      <TipTapEditor
        block={block}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className={className}
        placeholder={placeholder}
      />
    )
  }

  // Render lightweight textarea for fast loading
  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={block.text || ''}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full resize-none border-none outline-none bg-transparent overflow-hidden min-h-[1.5rem] ${className}`}
        style={{
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit',
        }}
        autoComplete="off"
        spellCheck="true"
      />
      
      {/* Upgrade button for advanced features */}
      {!isAdvancedMode && (
        <button
          onClick={() => setIsAdvancedMode(true)}
          className="absolute -top-8 right-0 text-xs text-stone-500 hover:text-stone-700 transition-colors"
          title="Switch to rich text editor"
        >
          Rich text
        </button>
      )}
    </div>
  )
}