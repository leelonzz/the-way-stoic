import React from 'react';
import { Hash, Type, List, ListOrdered, MinusCircle } from 'lucide-react';
import { CommandOption } from './types';

interface CommandMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  searchQuery: string;
  onSelectCommand: (command: CommandOption) => void;
  onClose: () => void;
}

const COMMANDS: CommandOption[] = [
  {
    id: 'h1',
    label: 'Heading 1',
    description: 'Large heading',
    shortcut: '/h1',
    type: 'heading',
    level: 1,
    icon: 'H1'
  },
  {
    id: 'h2',
    label: 'Heading 2',
    description: 'Medium heading',
    shortcut: '/h2',
    type: 'heading',
    level: 2,
    icon: 'H2'
  },
  {
    id: 'h3',
    label: 'Heading 3',
    description: 'Small heading',
    shortcut: '/h3',
    type: 'heading',
    level: 3,
    icon: 'H3'
  },
  {
    id: 'bullet',
    label: 'Bullet List',
    description: 'Unordered list',
    shortcut: '/bullet',
    type: 'bullet-list',
    icon: 'bullet'
  },
  {
    id: 'numbered',
    label: 'Numbered List',
    description: 'Ordered list',
    shortcut: '/numbered',
    type: 'numbered-list',
    icon: 'numbered'
  },
  {
    id: 'paragraph',
    label: 'Paragraph',
    description: 'Regular text',
    shortcut: '/p',
    type: 'paragraph',
    icon: 'paragraph'
  }
];

const getIcon = (iconType: string) => {
  switch (iconType) {
    case 'H1':
      return <Hash className="w-4 h-4" />;
    case 'H2':
      return <Hash className="w-4 h-4" />;
    case 'H3':
      return <Hash className="w-4 h-4" />;
    case 'bullet':
      return <List className="w-4 h-4" />;
    case 'numbered':
      return <ListOrdered className="w-4 h-4" />;
    case 'paragraph':
      return <Type className="w-4 h-4" />;
    default:
      return <MinusCircle className="w-4 h-4" />;
  }
};

export function CommandMenu({ isOpen, position, searchQuery, onSelectCommand, onClose }: CommandMenuProps) {
  if (!isOpen) return null;

  const filteredCommands = COMMANDS.filter(command =>
    command.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    command.shortcut.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      <div
        className="fixed z-50 bg-white rounded-lg shadow-lg border border-stone/20 py-2 min-w-[240px]"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        {filteredCommands.length === 0 ? (
          <div className="px-3 py-2 text-sm text-stone">
            No commands found
          </div>
        ) : (
          filteredCommands.map((command, index) => (
            <button
              key={command.id}
              onClick={() => onSelectCommand(command)}
              className={`
                w-full px-3 py-2 text-left hover:bg-sage/20 flex items-center gap-3
                ${index === 0 ? 'bg-sage/10' : ''}
              `}
            >
              <div className="text-stone">
                {getIcon(command.icon)}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-ink">
                  {command.label}
                </div>
                <div className="text-xs text-stone">
                  {command.description}
                </div>
              </div>
              <div className="text-xs text-stone/60 font-mono">
                {command.shortcut}
              </div>
            </button>
          ))
        )}
      </div>
    </>
  );
}