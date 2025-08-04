import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Strike from '@tiptap/extension-strike'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Link as LinkIcon, Code } from 'lucide-react'
import { JournalBlock } from './types'
import { sanitizeHtml, preserveTypography } from './richTextUtils'
import { handleFormattingShortcut } from './keyboardShortcuts'
import { LinkEditor } from './LinkEditor'

interface TipTapRichTextEditorProps {
  block: JournalBlock
  onChange: (blockId: string, updates: Partial<JournalBlock>) => void
  onKeyDown?: (e: KeyboardEvent, blockId: string) => void
  className?: string
  placeholder?: string
}

export function TipTapRichTextEditor({
  block,
  onChange,
  onKeyDown,
  className = '',
  placeholder = 'Type something...'
}: TipTapRichTextEditorProps): JSX.Element {
  const editorRef = useRef<HTMLDivElement>(null)
  const [showLinkEditor, setShowLinkEditor] = useState(false)
  const [linkEditorPosition, setLinkEditorPosition] = useState({ x: 0, y: 0 })
  const [currentLinkData, setCurrentLinkData] = useState({ url: '', text: '' })

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable block-level elements since we handle them at the block level
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        // Keep only inline formatting
        bold: {},
        italic: {},
        code: {},
        strike: false, // We'll use our custom Strike extension
        // Disable paragraph since we handle blocks differently
        paragraph: false,
      }),
      Underline,
      Strike,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: block.richText || block.text || '',
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none ${className}`,
        'data-block-id': block.id,
      },
      handleKeyDown: (view, event) => {
        // Handle formatting shortcuts first
        if (handleKeyboardShortcut(event)) {
          return true // Prevent default and stop propagation
        }

        // Call the parent's key handler if provided
        if (onKeyDown) {
          onKeyDown(event, block.id)
        }
        return false // Let TipTap handle the event
      },
      handlePaste: (view, event, slice) => {
        // Get clipboard data
        const clipboardData = event.clipboardData
        if (!clipboardData) return false

        const htmlContent = clipboardData.getData('text/html')
        const plainText = clipboardData.getData('text/plain')

        // If there's HTML content, sanitize and preserve typography
        if (htmlContent) {
          const sanitizedHtml = preserveTypography(sanitizeHtml(htmlContent))

          // Create a temporary div to parse the sanitized HTML
          const tempDiv = document.createElement('div')
          tempDiv.innerHTML = sanitizedHtml

          // Remove any remaining unwanted elements or attributes
          const unwantedElements = tempDiv.querySelectorAll('script, style, meta, link')
          unwantedElements.forEach(el => el.remove())

          // Remove font-related styles and classes
          const allElements = tempDiv.querySelectorAll('*')
          allElements.forEach(el => {
            // Remove classes that might affect typography
            const classList = Array.from(el.classList)
            classList.forEach(className => {
              if (className.includes('font') || className.includes('text-') || className.includes('color')) {
                el.classList.remove(className)
              }
            })

            // Remove empty class attributes
            if (el.classList.length === 0) {
              el.removeAttribute('class')
            }
          })

          // Insert the cleaned HTML
          const cleanedHtml = tempDiv.innerHTML
          if (cleanedHtml.trim()) {
            editor?.commands.insertContent(cleanedHtml)
            return true // Prevent default paste
          }
        }

        // Fallback to plain text
        if (plainText) {
          editor?.commands.insertContent(plainText)
          return true // Prevent default paste
        }

        return false // Let TipTap handle the paste
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const plainText = editor.getText()
      
      // Preserve typography and sanitize HTML
      const sanitizedHtml = preserveTypography(sanitizeHtml(html))
      
      onChange(block.id, {
        text: plainText,
        richText: sanitizedHtml,
      })
    },
  })

  // Update editor content when block changes externally
  useEffect(() => {
    if (editor && !editor.isFocused) {
      const currentContent = editor.getHTML()
      const newContent = block.richText || block.text || ''
      
      if (currentContent !== newContent) {
        editor.commands.setContent(newContent)
      }
    }
  }, [editor, block.richText, block.text])

  const setLink = useCallback(() => {
    if (!editor) return

    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to)
    const previousUrl = editor.getAttributes('link').href

    // Get cursor position for link editor
    const coords = editor.view.coordsAtPos(from)
    setLinkEditorPosition({
      x: coords.left,
      y: coords.bottom + 10,
    })

    setCurrentLinkData({
      url: previousUrl || '',
      text: selectedText || '',
    })

    setShowLinkEditor(true)
  }, [editor])

  const handleLinkSave = useCallback((url: string, text: string) => {
    if (!editor) return

    const { from, to } = editor.state.selection

    if (from === to) {
      // No selection, insert new link
      editor.chain().focus().insertContent(`<a href="${url}">${text}</a>`).run()
    } else {
      // Update existing selection
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }

    setShowLinkEditor(false)
  }, [editor])

  const handleLinkRemove = useCallback(() => {
    if (!editor) return
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    setShowLinkEditor(false)
  }, [editor])

  const handleLinkCancel = useCallback(() => {
    setShowLinkEditor(false)
  }, [])

  // Enhanced keyboard shortcut handler
  const handleKeyboardShortcut = useCallback((event: KeyboardEvent) => {
    if (!editor) return false

    // Handle link shortcut specially to show our custom editor
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault()
      setLink()
      return true
    }

    return handleFormattingShortcut(event, editor)
  }, [editor, setLink])

  if (!editor) {
    return (
      <div className="min-h-[1.5rem] p-2 text-stone-500 italic">
        Loading editor...
      </div>
    )
  }

  return (
    <div className="relative">

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="min-h-[1.5rem] focus-within:outline-none"
      />

      {/* Link Editor */}
      <LinkEditor
        isOpen={showLinkEditor}
        initialUrl={currentLinkData.url}
        initialText={currentLinkData.text}
        onSave={handleLinkSave}
        onRemove={currentLinkData.url ? handleLinkRemove : undefined}
        onCancel={handleLinkCancel}
        position={linkEditorPosition}
      />
    </div>
  )
}
