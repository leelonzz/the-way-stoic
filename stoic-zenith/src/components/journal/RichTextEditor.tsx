import React, { useState, useRef, useEffect } from 'react';
import { CommandMenu } from './CommandMenu';
import { JournalBlock, CommandOption } from './types';

interface RichTextEditorProps {
  blocks: JournalBlock[];
  onChange: (blocks: JournalBlock[]) => void;
  placeholder?: string;
}

export function RichTextEditor({ blocks, onChange, placeholder = "Start writing or type '/' for commands..." }: RichTextEditorProps) {
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [commandMenuPosition, setCommandMenuPosition] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const createNewBlock = (type: JournalBlock['type'] = 'paragraph', level?: number): JournalBlock => ({
    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    level: level as 1 | 2 | 3,
    text: '',
    createdAt: new Date()
  });

  const updateBlock = (blockId: string, updates: Partial<JournalBlock>) => {
    const updatedBlocks = blocks.map(block =>
      block.id === blockId ? { ...block, ...updates } : block
    );
    onChange(updatedBlocks);
  };

  const addBlock = (afterBlockId?: string) => {
    const newBlock = createNewBlock();
    if (!afterBlockId) {
      onChange([...blocks, newBlock]);
    } else {
      const index = blocks.findIndex(b => b.id === afterBlockId);
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      onChange(newBlocks);
    }
    return newBlock.id;
  };

  const deleteBlock = (blockId: string) => {
    if (blocks.length === 1) return;
    const updatedBlocks = blocks.filter(block => block.id !== blockId);
    onChange(updatedBlocks);
  };

  const handleKeyDown = (e: React.KeyboardEvent, blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      if (showCommandMenu) {
        setShowCommandMenu(false);
        return;
      }
      const newBlockId = addBlock(blockId);
      setTimeout(() => {
        const newBlockElement = document.querySelector(`[data-block-id="${newBlockId}"]`) as HTMLElement;
        newBlockElement?.focus();
      }, 10);
    } else if (e.key === 'Backspace' && block.text === '') {
      e.preventDefault();
      deleteBlock(blockId);
      const currentIndex = blocks.findIndex(b => b.id === blockId);
      if (currentIndex > 0) {
        const prevBlock = blocks[currentIndex - 1];
        setTimeout(() => {
          const prevBlockElement = document.querySelector(`[data-block-id="${prevBlock.id}"]`) as HTMLElement;
          prevBlockElement?.focus();
        }, 10);
      }
    } else if (e.key === 'Escape') {
      setShowCommandMenu(false);
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>, blockId: string) => {
    const target = e.currentTarget;
    const text = target.textContent || '';
    
    updateBlock(blockId, { text });

    if (text.startsWith('/')) {
      const rect = target.getBoundingClientRect();
      setCommandMenuPosition({
        x: rect.left,
        y: rect.bottom + 5
      });
      setSearchQuery(text.slice(1));
      setActiveBlockId(blockId);
      setShowCommandMenu(true);
    } else {
      setShowCommandMenu(false);
    }
  };

  const handleCommandSelect = (command: CommandOption) => {
    if (!activeBlockId) return;

    updateBlock(activeBlockId, {
      type: command.type,
      level: command.level as 1 | 2 | 3,
      text: ''
    });

    setShowCommandMenu(false);
    setActiveBlockId(null);

    setTimeout(() => {
      const blockElement = document.querySelector(`[data-block-id="${activeBlockId}"]`) as HTMLElement;
      blockElement?.focus();
    }, 10);
  };

  const renderBlock = (block: JournalBlock) => {
    const commonProps = {
      key: block.id,
      'data-block-id': block.id,
      contentEditable: true,
      suppressContentEditableWarning: true,
      onInput: (e: React.FormEvent<HTMLDivElement>) => handleInput(e, block.id),
      onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, block.id),
      className: "outline-none focus:ring-2 focus:ring-cta/20 rounded px-2 py-2 min-h-[2rem] leading-relaxed",
      children: block.text
    };

    switch (block.type) {
      case 'heading':
        const HeadingTag = `h${block.level}` as 'h1' | 'h2' | 'h3';
        const headingClasses = {
          1: 'text-4xl font-bold text-ink mb-4 leading-tight font-serif',
          2: 'text-3xl font-semibold text-ink mb-3 leading-tight font-serif',
          3: 'text-2xl font-medium text-ink mb-2 leading-tight font-serif'
        };
        return React.createElement(HeadingTag, {
          ...commonProps,
          className: `${commonProps.className} ${headingClasses[block.level!]}`
        });

      case 'bullet-list':
        return (
          <div className="flex items-start gap-3 mb-2">
            <span className="text-ink mt-2 select-none text-lg">•</span>
            <div {...commonProps} className={`${commonProps.className} flex-1 text-lg text-ink leading-relaxed`} />
          </div>
        );

      case 'numbered-list':
        const index = blocks.filter(b => b.type === 'numbered-list').indexOf(block) + 1;
        return (
          <div className="flex items-start gap-3 mb-2">
            <span className="text-ink mt-2 select-none min-w-[24px] text-lg font-medium">{index}.</span>
            <div {...commonProps} className={`${commonProps.className} flex-1 text-lg text-ink leading-relaxed`} />
          </div>
        );

      default:
        return <div {...commonProps} className={`${commonProps.className} mb-3 text-lg text-ink leading-relaxed`} />;
    }
  };

  useEffect(() => {
    if (blocks.length === 0) {
      onChange([createNewBlock()]);
    }
  }, [blocks.length, onChange]);

  return (
    <div className="relative">
      <div 
        ref={editorRef}
        className="min-h-[500px] p-8 bg-white/70 rounded-xl border border-stone/20 focus-within:border-cta/30 shadow-sm"
      >
        {blocks.length === 0 && (
          <div className="text-stone/60 italic text-lg leading-relaxed">{placeholder}</div>
        )}
        {blocks.map(renderBlock)}
      </div>

      <CommandMenu
        isOpen={showCommandMenu}
        position={commandMenuPosition}
        searchQuery={searchQuery}
        onSelectCommand={handleCommandSelect}
        onClose={() => setShowCommandMenu(false)}
      />
    </div>
  );
}