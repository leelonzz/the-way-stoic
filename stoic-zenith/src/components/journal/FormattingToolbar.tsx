import React from 'react'
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Link, 
  Code,
  Type,
  Hash,
  List,
  ListOrdered,
  Quote,
  MoreHorizontal
} from 'lucide-react'
import { getShortcutDisplayString, FORMATTING_SHORTCUTS, BLOCK_SHORTCUTS } from './keyboardShortcuts'

interface FormattingToolbarProps {
  editor: any // TipTap editor instance
  onBlockAction?: (action: string) => void
  className?: string
  showBlockControls?: boolean
}

export function FormattingToolbar({
  editor,
  onBlockAction,
  className = '',
  showBlockControls = false
}: FormattingToolbarProps): JSX.Element {
  if (!editor) {
    return <div />
  }

  const formatButtons = [
    {
      icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      title: 'Bold',
      shortcut: getShortcutDisplayString(FORMATTING_SHORTCUTS.find(s => s.action === 'bold')!),
    },
    {
      icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      title: 'Italic',
      shortcut: getShortcutDisplayString(FORMATTING_SHORTCUTS.find(s => s.action === 'italic')!),
    },
    {
      icon: Underline,
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'),
      title: 'Underline',
      shortcut: getShortcutDisplayString(FORMATTING_SHORTCUTS.find(s => s.action === 'underline')!),
    },
    {
      icon: Strikethrough,
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike'),
      title: 'Strikethrough',
      shortcut: '',
    },
    {
      icon: Code,
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive('code'),
      title: 'Inline Code',
      shortcut: getShortcutDisplayString(FORMATTING_SHORTCUTS.find(s => s.action === 'code')!),
    },
  ]

  const blockButtons = [
    {
      icon: Type,
      action: () => onBlockAction?.('paragraph'),
      isActive: false,
      title: 'Paragraph',
      shortcut: getShortcutDisplayString(BLOCK_SHORTCUTS.find(s => s.action === 'paragraph')!),
    },
    {
      icon: Hash,
      action: () => onBlockAction?.('heading1'),
      isActive: false,
      title: 'Heading 1',
      shortcut: getShortcutDisplayString(BLOCK_SHORTCUTS.find(s => s.action === 'heading1')!),
    },
    {
      icon: List,
      action: () => onBlockAction?.('bulletList'),
      isActive: false,
      title: 'Bullet List',
      shortcut: getShortcutDisplayString(BLOCK_SHORTCUTS.find(s => s.action === 'bulletList')!),
    },
    {
      icon: ListOrdered,
      action: () => onBlockAction?.('numberedList'),
      isActive: false,
      title: 'Numbered List',
      shortcut: getShortcutDisplayString(BLOCK_SHORTCUTS.find(s => s.action === 'numberedList')!),
    },
    {
      icon: Quote,
      action: () => onBlockAction?.('quote'),
      isActive: false,
      title: 'Quote',
      shortcut: getShortcutDisplayString(BLOCK_SHORTCUTS.find(s => s.action === 'quote')!),
    },
  ]

  const handleLinkAction = () => {
    const url = window.prompt('Enter URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  return (
    <div className={`flex items-center gap-1 p-2 bg-white border border-stone-200 rounded-lg shadow-lg ${className}`}>
      {/* Text Formatting */}
      <div className="flex items-center gap-1">
        {formatButtons.map((button, index) => (
          <button
            key={index}
            onClick={button.action}
            className={`p-2 rounded hover:bg-stone-100 transition-colors ${
              button.isActive ? 'bg-stone-200 text-stone-900' : 'text-stone-600'
            }`}
            title={`${button.title}${button.shortcut ? ` (${button.shortcut})` : ''}`}
          >
            <button.icon size={16} />
          </button>
        ))}
        
        <button
          onClick={handleLinkAction}
          className={`p-2 rounded hover:bg-stone-100 transition-colors ${
            editor.isActive('link') ? 'bg-stone-200 text-stone-900' : 'text-stone-600'
          }`}
          title={`Link (${getShortcutDisplayString(FORMATTING_SHORTCUTS.find(s => s.action === 'link')!)})`}
        >
          <Link size={16} />
        </button>
      </div>

      {/* Separator */}
      {showBlockControls && (
        <>
          <div className="w-px h-6 bg-stone-300 mx-1" />
          
          {/* Block Controls */}
          <div className="flex items-center gap-1">
            {blockButtons.map((button, index) => (
              <button
                key={index}
                onClick={button.action}
                className={`p-2 rounded hover:bg-stone-100 transition-colors ${
                  button.isActive ? 'bg-stone-200 text-stone-900' : 'text-stone-600'
                }`}
                title={`${button.title}${button.shortcut ? ` (${button.shortcut})` : ''}`}
              >
                <button.icon size={16} />
              </button>
            ))}
          </div>
        </>
      )}

      {/* More Options */}
      <div className="w-px h-6 bg-stone-300 mx-1" />
      <button
        className="p-2 rounded hover:bg-stone-100 text-stone-600 transition-colors"
        title="More options"
      >
        <MoreHorizontal size={16} />
      </button>
    </div>
  )
}

// Floating toolbar that appears on text selection
interface FloatingToolbarProps {
  editor: any
  onBlockAction?: (action: string) => void
}

export function FloatingToolbar({ editor, onBlockAction }: FloatingToolbarProps): JSX.Element | null {
  const [position, setPosition] = React.useState({ x: 0, y: 0, visible: false })

  React.useEffect(() => {
    if (!editor) return

    const updatePosition = () => {
      const { from, to } = editor.state.selection
      
      // Only show if there's a selection
      if (from === to) {
        setPosition(prev => ({ ...prev, visible: false }))
        return
      }

      // Get selection coordinates
      const start = editor.view.coordsAtPos(from)
      const end = editor.view.coordsAtPos(to)
      
      const x = (start.left + end.left) / 2
      const y = start.top - 60 // Position above selection
      
      setPosition({ x, y, visible: true })
    }

    // Update position on selection change
    editor.on('selectionUpdate', updatePosition)
    editor.on('transaction', updatePosition)

    return () => {
      editor.off('selectionUpdate', updatePosition)
      editor.off('transaction', updatePosition)
    }
  }, [editor])

  if (!position.visible) {
    return null
  }

  return (
    <div
      className="fixed z-50"
      style={{
        left: position.x - 150, // Center the toolbar
        top: Math.max(10, position.y),
      }}
    >
      <FormattingToolbar
        editor={editor}
        onBlockAction={onBlockAction}
        className="animate-in fade-in-0 zoom-in-95 duration-200"
      />
    </div>
  )
}

// Static toolbar for persistent access
export function StaticToolbar({ editor, onBlockAction }: FloatingToolbarProps): JSX.Element {
  return (
    <div className="border-b border-stone-200 p-2 bg-stone-50">
      <FormattingToolbar
        editor={editor}
        onBlockAction={onBlockAction}
        showBlockControls={true}
        className="justify-start"
      />
    </div>
  )
}
