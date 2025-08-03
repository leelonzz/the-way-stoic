import React, { useEffect, useState } from 'react'
import {
  Hash,
  Type,
  List,
  ListOrdered,
  MinusCircle,
  Image,
  Quote,
  Code,
} from 'lucide-react'
import { CommandOption } from './types'

interface CommandMenuProps {
  isOpen: boolean
  position: { x: number; y: number }
  searchQuery: string
  onSelectCommand: (command: CommandOption) => void
  onClose: () => void
}

const COMMANDS: CommandOption[] = [
  {
    id: 'h1',
    label: 'Heading 1',
    description: 'Large heading (# or /h1)',
    shortcut: '#',
    type: 'heading',
    level: 1,
    icon: 'H1',
  },
  {
    id: 'h1-slash',
    label: 'Heading 1',
    description: 'Large heading',
    shortcut: '/h1',
    type: 'heading',
    level: 1,
    icon: 'H1',
  },
  {
    id: 'h2',
    label: 'Heading 2',
    description: 'Medium heading (## or /h2)',
    shortcut: '##',
    type: 'heading',
    level: 2,
    icon: 'H2',
  },
  {
    id: 'h2-slash',
    label: 'Heading 2',
    description: 'Medium heading',
    shortcut: '/h2',
    type: 'heading',
    level: 2,
    icon: 'H2',
  },
  {
    id: 'h3',
    label: 'Heading 3',
    description: 'Small heading (### or /h3)',
    shortcut: '###',
    type: 'heading',
    level: 3,
    icon: 'H3',
  },
  {
    id: 'h3-slash',
    label: 'Heading 3',
    description: 'Small heading',
    shortcut: '/h3',
    type: 'heading',
    level: 3,
    icon: 'H3',
  },
  {
    id: 'bullet',
    label: 'Bullet List',
    description: 'Unordered list (- or /bullet)',
    shortcut: '-',
    type: 'bullet-list',
    icon: 'bullet',
  },
  {
    id: 'bullet-slash',
    label: 'Bullet List',
    description: 'Unordered list',
    shortcut: '/bullet',
    type: 'bullet-list',
    icon: 'bullet',
  },
  {
    id: 'bullet-short',
    label: 'Bullet List',
    description: 'Unordered list',
    shortcut: '/ul',
    type: 'bullet-list',
    icon: 'bullet',
  },
  {
    id: 'numbered',
    label: 'Numbered List',
    description: 'Ordered list (1. or /numbered)',
    shortcut: '1.',
    type: 'numbered-list',
    icon: 'numbered',
  },
  {
    id: 'numbered-slash',
    label: 'Numbered List',
    description: 'Ordered list',
    shortcut: '/numbered',
    type: 'numbered-list',
    icon: 'numbered',
  },
  {
    id: 'numbered-short',
    label: 'Numbered List',
    description: 'Ordered list',
    shortcut: '/ol',
    type: 'numbered-list',
    icon: 'numbered',
  },
  {
    id: 'paragraph',
    label: 'Paragraph',
    description: 'Regular text',
    shortcut: '/p',
    type: 'paragraph',
    icon: 'paragraph',
  },
  {
    id: 'image',
    label: 'Image',
    description: 'Upload an image',
    shortcut: '/image',
    type: 'image',
    icon: 'image',
  },
  {
    id: 'quote',
    label: 'Quote',
    description: 'Block quote (> or /quote)',
    shortcut: '>',
    type: 'quote',
    icon: 'quote',
  },
  {
    id: 'quote-slash',
    label: 'Quote',
    description: 'Block quote',
    shortcut: '/quote',
    type: 'quote',
    icon: 'quote',
  },
  {
    id: 'quote-short',
    label: 'Quote',
    description: 'Block quote',
    shortcut: '/q',
    type: 'quote',
    icon: 'quote',
  },
  {
    id: 'code',
    label: 'Code Block',
    description: 'Code snippet (``` or /code)',
    shortcut: '```',
    type: 'code',
    icon: 'code',
  },
  {
    id: 'code-slash',
    label: 'Code Block',
    description: 'Code snippet',
    shortcut: '/code',
    type: 'code',
    icon: 'code',
  },
]

const getIcon = (iconType: string): JSX.Element => {
  switch (iconType) {
    case 'H1':
      return <Hash className="w-4 h-4" />
    case 'H2':
      return <Hash className="w-4 h-4" />
    case 'H3':
      return <Hash className="w-4 h-4" />
    case 'bullet':
      return <List className="w-4 h-4" />
    case 'numbered':
      return <ListOrdered className="w-4 h-4" />
    case 'paragraph':
      return <Type className="w-4 h-4" />
    case 'image':
      return <Image className="w-4 h-4" />
    case 'quote':
      return <Quote className="w-4 h-4" />
    case 'code':
      return <Code className="w-4 h-4" />
    default:
      return <MinusCircle className="w-4 h-4" />
  }
}

export function CommandMenu({
  isOpen,
  position,
  searchQuery,
  onSelectCommand,
  onClose,
}: CommandMenuProps): JSX.Element | null {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const filteredCommands = COMMANDS.filter(
    command =>
      command.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      command.shortcut.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Reset selection when commands change
  useEffect(() => {
    setSelectedIndex(0)
  }, [searchQuery])

  // Handle keyboard navigation
  useEffect((): (() => void) => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent): void => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => (prev + 1) % filteredCommands.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev =>
            prev === 0 ? filteredCommands.length - 1 : prev - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            onSelectCommand(filteredCommands[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredCommands, selectedIndex, onSelectCommand, onClose])

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        role="menu"
        className="fixed z-50 bg-white rounded-lg shadow-lg border border-stone-200 py-2 min-w-[240px]"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        {filteredCommands.length === 0 ? (
          <div className="px-3 py-2 text-sm text-stone-500">
            No commands found
          </div>
        ) : (
          filteredCommands.map((command, index) => (
            <button
              key={command.id}
              onClick={() => onSelectCommand(command)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`
                w-full px-3 py-2 text-left hover:bg-orange-50 flex items-center gap-3 transition-colors
                ${index === selectedIndex ? 'bg-orange-50 border-l-2 border-orange-400' : ''}
              `}
            >
              <div className="text-stone-600">{getIcon(command.icon)}</div>
              <div className="flex-1">
                <div className="text-sm font-medium text-stone-800 font-inknut">
                  {command.label}
                </div>
                <div className="text-xs text-stone-600 font-inknut">
                  {command.description}
                </div>
              </div>
              <div className="text-xs text-stone-400 font-mono bg-stone-100 px-2 py-1 rounded">
                {command.shortcut}
              </div>
            </button>
          ))
        )}
      </div>
    </>
  )
}
