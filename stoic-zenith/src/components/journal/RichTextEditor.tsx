import React, { useState, useRef, useEffect } from 'react';
import { CommandMenu } from './CommandMenu';
import { JournalBlock, CommandOption } from './types';

interface RichTextEditorProps {
  blocks: JournalBlock[];
  onChange: (blocks: JournalBlock[]) => void;
  placeholder?: string;
}

export function RichTextEditor({ blocks, onChange, placeholder: _placeholder = "Start writing or type '/' for commands..." }: RichTextEditorProps) {
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
      requestAnimationFrame(() => {
        const newBlockElement = document.querySelector(`[data-block-id="${newBlockId}"]`) as HTMLElement;
        if (newBlockElement) {
          newBlockElement.focus();
          // Place cursor at the beginning
          const selection = window.getSelection();
          const range = document.createRange();
          range.setStart(newBlockElement, 0);
          range.setEnd(newBlockElement, 0);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      });
    } else if (e.key === 'Backspace' && block.text === '') {
      e.preventDefault();
      deleteBlock(blockId);
      const currentIndex = blocks.findIndex(b => b.id === blockId);
      if (currentIndex > 0) {
        const prevBlock = blocks[currentIndex - 1];
        requestAnimationFrame(() => {
          const prevBlockElement = document.querySelector(`[data-block-id="${prevBlock.id}"]`) as HTMLElement;
          if (prevBlockElement) {
            prevBlockElement.focus();
            // Place cursor at the end
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(prevBlockElement);
            range.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(range);
          }
        });
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

    if (command.type === 'image') {
      updateBlock(activeBlockId, { text: '' });
      handleImageUpload(activeBlockId);
    } else {
      updateBlock(activeBlockId, {
        type: command.type,
        level: command.level as 1 | 2 | 3,
        text: ''
      });
    }

    setShowCommandMenu(false);
    const currentActiveBlockId = activeBlockId;
    setActiveBlockId(null);

    // Focus the block after React re-renders
    requestAnimationFrame(() => {
      const blockElement = document.querySelector(`[data-block-id="${currentActiveBlockId}"]`) as HTMLElement;
      if (blockElement) {
        blockElement.focus();
        // Place cursor at the end
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(blockElement);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    });
  };

  const handleImageUpload = (blockId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          updateBlock(blockId, {
            type: 'image',
            imageUrl,
            imageAlt: file.name,
            text: file.name
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const renderBlock = (block: JournalBlock) => {
    const commonProps = {
      key: block.id,
      'data-block-id': block.id,
      contentEditable: true,
      suppressContentEditableWarning: true,
      onInput: (e: React.FormEvent<HTMLDivElement>) => handleInput(e, block.id),
      onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, block.id),
      className: "outline-none focus:ring-0 rounded px-1 py-1 min-h-[1.5rem] leading-relaxed",
      children: block.text || ''
    };

    switch (block.type) {
      case 'heading': {
        const HeadingTag = `h${block.level}` as 'h1' | 'h2' | 'h3';
        const headingClasses = {
          1: 'text-3xl font-bold text-stone-800 mb-6 leading-tight font-inknut',
          2: 'text-2xl font-semibold text-stone-800 mb-4 leading-tight font-inknut',
          3: 'text-xl font-medium text-stone-800 mb-3 leading-tight font-inknut'
        };
        return React.createElement(HeadingTag, {
          ...commonProps,
          className: `${commonProps.className} ${headingClasses[block.level!]}`
        });
      }

      case 'bullet-list':
        return (
          <div className="flex items-start gap-3 mb-3">
            <span className="text-stone-600 mt-1 select-none text-lg">•</span>
            <div {...commonProps} className={`${commonProps.className} flex-1 text-base text-stone-700 leading-relaxed font-inknut`} />
          </div>
        );

      case 'numbered-list': {
        const index = blocks.filter(b => b.type === 'numbered-list').indexOf(block) + 1;
        return (
          <div className="flex items-start gap-3 mb-3">
            <span className="text-stone-600 mt-1 select-none min-w-[24px] text-base font-medium">{index}.</span>
            <div {...commonProps} className={`${commonProps.className} flex-1 text-base text-stone-700 leading-relaxed font-inknut`} />
          </div>
        );
      }

      case 'image':
        return (
          <div className="mb-4">
            {block.imageUrl ? (
              <img
                src={block.imageUrl}
                alt={block.imageAlt || 'Uploaded image'}
                className="max-w-full h-auto rounded-lg shadow-sm"
              />
            ) : (
              <div
                className="border-2 border-dashed border-stone-300 rounded-lg p-8 text-center cursor-pointer hover:border-stone-400 transition-colors"
                onClick={() => handleImageUpload(block.id)}
              >
                <p className="text-stone-500">Click to upload an image</p>
              </div>
            )}
          </div>
        );

      default:
        return <div {...commonProps} className={`${commonProps.className} mb-4 text-base text-stone-700 leading-relaxed font-inknut`} />;
    }
  };

  useEffect(() => {
    if (blocks.length === 0) {
      onChange([createNewBlock()]);
    }
  }, [blocks.length, onChange]);

  return (
    <div className="relative h-full flex flex-col">
      <div 
        ref={editorRef}
        className="flex-1 p-6 bg-white focus-within:ring-0 overflow-y-auto"
      >
        {blocks.length === 0 && (
          <div className="text-stone-400 italic text-base leading-relaxed font-inknut">Write something...</div>
        )}
        {blocks.length === 1 && blocks[0].text === '' && (
          <div className="absolute top-6 left-6 text-stone-400 italic text-base leading-relaxed font-inknut pointer-events-none">
            Write something...
          </div>
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