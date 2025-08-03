import React, { useState } from 'react'
import { SingleEditableRichTextEditor } from './SingleEditableRichTextEditor'
import { JournalBlock } from './types'

export function MultiBlockTest(): JSX.Element {
  const [blocks, setBlocks] = useState<JournalBlock[]>([
    {
      id: 'block-1',
      type: 'heading',
      level: 1,
      text: 'Test Multi-Block Selection',
      createdAt: new Date(),
    },
    {
      id: 'block-2',
      type: 'paragraph',
      text: 'This is the first paragraph. You should be able to select text across multiple blocks.',
      createdAt: new Date(),
    },
    {
      id: 'block-3',
      type: 'bullet-list',
      text: 'First bullet point',
      createdAt: new Date(),
    },
    {
      id: 'block-4',
      type: 'bullet-list',
      text: 'Second bullet point with more text to test selection',
      createdAt: new Date(),
    },
    {
      id: 'block-5',
      type: 'paragraph',
      text: 'Final paragraph. Try selecting from the first paragraph to this one!',
      createdAt: new Date(),
    },
  ])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Multi-Block Selection Test</h1>
        <p className="text-gray-600">
          Try selecting text across multiple blocks and dragging it around. 
          You should now be able to:
        </p>
        <ul className="list-disc ml-6 mt-2 text-gray-600">
          <li>Select text across multiple lines/blocks</li>
          <li>Drag selected text to reposition it</li>
          <li>Use Ctrl+C, Ctrl+V, Ctrl+X for copy/paste/cut</li>
          <li>Use markdown shortcuts like # for headers, - for bullets</li>
        </ul>
      </div>
      
      <div className="border rounded-lg h-96">
        <SingleEditableRichTextEditor
          blocks={blocks}
          onChange={setBlocks}
          placeholder="Start typing to test multi-block selection..."
        />
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <details>
          <summary>Current blocks data (for debugging)</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(blocks, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  )
}