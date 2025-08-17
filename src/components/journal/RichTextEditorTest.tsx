import React, { useState } from 'react'
import { EnhancedRichTextEditor } from './EnhancedRichTextEditor'
import { JournalBlock } from './types'

// Test component to validate rich text editor functionality
export function RichTextEditorTest(): JSX.Element {
  const [blocks, setBlocks] = useState<JournalBlock[]>([
    {
      id: 'test-block-1',
      type: 'paragraph',
      text: 'Welcome to the enhanced rich text editor! Try these features:',
      richText: 'Welcome to the enhanced rich text editor! Try these features:',
      createdAt: new Date(),
    },
    {
      id: 'test-block-2',
      type: 'bullet-list',
      text: 'Bold text with Ctrl/Cmd+B',
      richText: 'Bold text with Ctrl/Cmd+B',
      createdAt: new Date(),
    },
    {
      id: 'test-block-3',
      type: 'bullet-list',
      text: 'Italic text with Ctrl/Cmd+I',
      richText: 'Italic text with Ctrl/Cmd+I',
      createdAt: new Date(),
    },
    {
      id: 'test-block-4',
      type: 'bullet-list',
      text: 'Underline text with Ctrl/Cmd+U',
      richText: 'Underline text with Ctrl/Cmd+U',
      createdAt: new Date(),
    },
    {
      id: 'test-block-5',
      type: 'bullet-list',
      text: 'Links with Ctrl/Cmd+K',
      richText: 'Links with Ctrl/Cmd+K',
      createdAt: new Date(),
    },
    {
      id: 'test-block-6',
      type: 'paragraph',
      text: 'Type / for block commands (headings, lists, quotes, etc.)',
      richText: 'Type / for block commands (headings, lists, quotes, etc.)',
      createdAt: new Date(),
    },
  ])

  const handleBlocksChange = (newBlocks: JournalBlock[]) => {
    setBlocks(newBlocks)

  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800 mb-2">
          Rich Text Editor Test
        </h1>
        <p className="text-stone-600">
          Test the enhanced rich text editor with inline formatting and block-level controls.
        </p>
      </div>

      <div className="bg-white border border-stone-200 rounded-lg shadow-sm">
        <EnhancedRichTextEditor
          blocks={blocks}
          onChange={handleBlocksChange}
        />
      </div>

      <div className="mt-6 p-4 bg-stone-50 rounded-lg">
        <h3 className="font-semibold text-stone-800 mb-2">Keyboard Shortcuts:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-stone-600">
          <div>• <kbd className="bg-white px-1 rounded">Ctrl/Cmd+B</kbd> - Bold</div>
          <div>• <kbd className="bg-white px-1 rounded">Ctrl/Cmd+I</kbd> - Italic</div>
          <div>• <kbd className="bg-white px-1 rounded">Ctrl/Cmd+U</kbd> - Underline</div>
          <div>• <kbd className="bg-white px-1 rounded">Ctrl/Cmd+K</kbd> - Link</div>
          <div>• <kbd className="bg-white px-1 rounded">/</kbd> - Block commands</div>
          <div>• <kbd className="bg-white px-1 rounded">Enter</kbd> - New block</div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-stone-50 rounded-lg">
        <h3 className="font-semibold text-stone-800 mb-2">Current Blocks Data:</h3>
        <pre className="text-xs text-stone-600 overflow-auto max-h-40">
          {JSON.stringify(blocks, null, 2)}
        </pre>
      </div>
    </div>
  )
}
