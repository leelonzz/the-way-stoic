// Keyboard shortcuts for rich text formatting
export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  action: string
  description: string
}

export const FORMATTING_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: 'b',
    ctrlKey: true,
    metaKey: true,
    action: 'bold',
    description: 'Toggle bold formatting',
  },
  {
    key: 'i',
    ctrlKey: true,
    metaKey: true,
    action: 'italic',
    description: 'Toggle italic formatting',
  },
  {
    key: 'u',
    ctrlKey: true,
    metaKey: true,
    action: 'underline',
    description: 'Toggle underline formatting',
  },
  {
    key: 'k',
    ctrlKey: true,
    metaKey: true,
    action: 'link',
    description: 'Add or edit link',
  },
  {
    key: '`',
    ctrlKey: true,
    metaKey: true,
    action: 'code',
    description: 'Toggle inline code formatting',
  },
  {
    key: 'Enter',
    shiftKey: true,
    action: 'lineBreak',
    description: 'Insert line break',
  },
  {
    key: 'z',
    ctrlKey: true,
    metaKey: true,
    action: 'undo',
    description: 'Undo last action',
  },
  {
    key: 'z',
    ctrlKey: true,
    metaKey: true,
    shiftKey: true,
    action: 'redo',
    description: 'Redo last action',
  },
  {
    key: 'a',
    ctrlKey: true,
    metaKey: true,
    action: 'selectAll',
    description: 'Select all text',
  },
]

// Block-level shortcuts
export const BLOCK_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: '1',
    ctrlKey: true,
    metaKey: true,
    action: 'heading1',
    description: 'Convert to Heading 1',
  },
  {
    key: '2',
    ctrlKey: true,
    metaKey: true,
    action: 'heading2',
    description: 'Convert to Heading 2',
  },
  {
    key: '3',
    ctrlKey: true,
    metaKey: true,
    action: 'heading3',
    description: 'Convert to Heading 3',
  },
  {
    key: '0',
    ctrlKey: true,
    metaKey: true,
    action: 'paragraph',
    description: 'Convert to paragraph',
  },
  {
    key: 'l',
    ctrlKey: true,
    metaKey: true,
    shiftKey: true,
    action: 'bulletList',
    description: 'Convert to bullet list',
  },
  {
    key: 'l',
    ctrlKey: true,
    metaKey: true,
    action: 'numberedList',
    description: 'Convert to numbered list',
  },
  {
    key: 'q',
    ctrlKey: true,
    metaKey: true,
    action: 'quote',
    description: 'Convert to quote',
  },
  {
    key: 'c',
    ctrlKey: true,
    metaKey: true,
    shiftKey: true,
    action: 'codeBlock',
    description: 'Convert to code block',
  },
]

// Check if a keyboard event matches a shortcut
export function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  
  // Check key
  if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) {
    return false
  }

  // Check modifiers
  const ctrlPressed = isMac ? event.metaKey : event.ctrlKey
  const metaPressed = isMac ? event.metaKey : event.ctrlKey
  
  if (shortcut.ctrlKey && !ctrlPressed) return false
  if (shortcut.metaKey && !metaPressed) return false
  if (shortcut.shiftKey && !event.shiftKey) return false
  if (shortcut.altKey && !event.altKey) return false

  return true
}

// Find matching shortcut for a keyboard event
export function findMatchingShortcut(
  event: KeyboardEvent,
  shortcuts: KeyboardShortcut[] = [...FORMATTING_SHORTCUTS, ...BLOCK_SHORTCUTS]
): KeyboardShortcut | null {
  return shortcuts.find(shortcut => matchesShortcut(event, shortcut)) || null
}

// Get display string for a shortcut
export function getShortcutDisplayString(shortcut: KeyboardShortcut): string {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const parts: string[] = []

  if (shortcut.ctrlKey || shortcut.metaKey) {
    parts.push(isMac ? '⌘' : 'Ctrl')
  }
  if (shortcut.shiftKey) {
    parts.push(isMac ? '⇧' : 'Shift')
  }
  if (shortcut.altKey) {
    parts.push(isMac ? '⌥' : 'Alt')
  }

  // Format key
  let key = shortcut.key
  if (key === ' ') key = 'Space'
  else if (key === 'Enter') key = isMac ? '↵' : 'Enter'
  else if (key === 'Backspace') key = isMac ? '⌫' : 'Backspace'
  else if (key === 'Delete') key = isMac ? '⌦' : 'Delete'
  else if (key === 'Tab') key = isMac ? '⇥' : 'Tab'
  else if (key === 'Escape') key = isMac ? '⎋' : 'Esc'
  else key = key.toUpperCase()

  parts.push(key)
  return parts.join(isMac ? '' : '+')
}

// Handle keyboard shortcuts for rich text formatting
export function handleFormattingShortcut(
  event: KeyboardEvent,
  editor: any, // TipTap editor instance
  onBlockAction?: (action: string) => void
): boolean {
  const shortcut = findMatchingShortcut(event)
  if (!shortcut) return false

  event.preventDefault()

  switch (shortcut.action) {
    case 'bold':
      editor?.chain().focus().toggleBold().run()
      return true
    case 'italic':
      editor?.chain().focus().toggleItalic().run()
      return true
    case 'underline':
      editor?.chain().focus().toggleUnderline().run()
      return true
    case 'code':
      editor?.chain().focus().toggleCode().run()
      return true
    case 'link':
      // Handle link creation/editing
      const url = window.prompt('Enter URL:')
      if (url) {
        editor?.chain().focus().setLink({ href: url }).run()
      }
      return true
    case 'undo':
      editor?.chain().focus().undo().run()
      return true
    case 'redo':
      editor?.chain().focus().redo().run()
      return true
    case 'selectAll':
      editor?.chain().focus().selectAll().run()
      return true
    case 'lineBreak':
      editor?.chain().focus().setHardBreak().run()
      return true
    
    // Block-level actions
    case 'heading1':
    case 'heading2':
    case 'heading3':
    case 'paragraph':
    case 'bulletList':
    case 'numberedList':
    case 'quote':
    case 'codeBlock':
      onBlockAction?.(shortcut.action)
      return true
    
    default:
      return false
  }
}

// Get all available shortcuts for help/documentation
export function getAllShortcuts(): { formatting: KeyboardShortcut[]; blocks: KeyboardShortcut[] } {
  return {
    formatting: FORMATTING_SHORTCUTS,
    blocks: BLOCK_SHORTCUTS,
  }
}

// Check if an event should be handled by the rich text editor
export function shouldHandleEvent(event: KeyboardEvent): boolean {
  // Don't handle if in an input or textarea
  const target = event.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
    return false
  }

  // Don't handle if a modifier key is pressed without a matching shortcut
  if (event.ctrlKey || event.metaKey) {
    return findMatchingShortcut(event) !== null
  }

  return true
}
