import React, { useState } from 'react'
import { EnhancedRichTextEditor } from '../components/journal/EnhancedRichTextEditor'
import { JournalBlock } from '../components/journal/types'

export default function TestSplashPage() {
  const [blocks, setBlocks] = useState<JournalBlock[]>([
    {
      id: 'test-block-1',
      type: 'paragraph',
      text: 'Regular paragraph\nType "splash" here on line 2 →',
      richText: 'Regular paragraph\nType "splash" here on line 2 →',
      createdAt: new Date(),
    },
    {
      id: 'test-block-2',
      type: 'heading',
      level: 1,
      text: 'This is a heading\nType "splash" here on line 2 →',
      richText: 'This is a heading\nType "splash" here on line 2 →',
      createdAt: new Date(),
    },
    {
      id: 'test-block-3',
      type: 'bullet-list',
      text: 'Bullet list item\nType "splash" here on line 2 →',
      richText: 'Bullet list item\nType "splash" here on line 2 →',
      createdAt: new Date(),
    },
    {
      id: 'test-block-4',
      type: 'quote',
      text: 'Quote block\nType "splash" here on line 2 →',
      richText: 'Quote block\nType "splash" here on line 2 →',
      createdAt: new Date(),
    },
    {
      id: 'test-block-5',
      type: 'paragraph',
      text: '',
      richText: '',
      createdAt: new Date(),
    }
  ])

  const handleBlocksChange = (newBlocks: JournalBlock[]) => {
    setBlocks(newBlocks)
    console.log('🔄 Blocks updated:', newBlocks)

    // Debug splash command specifically
    newBlocks.forEach(block => {
      if (block.text.includes('splash')) {
        console.log('🎯 Block with splash detected:', {
          id: block.id,
          type: block.type,
          text: block.text,
          richText: block.richText
        })
      }
    })
  }

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-800 mb-4">
            Splash Command Test Page
          </h1>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">
              Test Instructions:
            </h2>
            <ol className="list-decimal list-inside text-blue-700 space-y-1">
              <li><strong>Test 1:</strong> Click at the end of line 2 in the paragraph block and type "splash"</li>
              <li><strong>Test 2:</strong> Click at the end of line 2 in the heading block and type "splash"</li>
              <li><strong>Test 3:</strong> Click at the end of line 2 in the bullet list block and type "splash"</li>
              <li><strong>Test 4:</strong> Click at the end of line 2 in the quote block and type "splash"</li>
              <li><strong>Test 5:</strong> Try different cases: "SPLASH", "SpLaSh" - all should work</li>
              <li><strong>Test 6:</strong> Try typing "splash h1" to filter for heading commands</li>
              <li><strong>Test 7:</strong> Click in the empty block and type "splash" - should also work</li>
              <li><strong>Test 8:</strong> Select a command to verify it transforms the block correctly</li>
            </ol>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-green-800 mb-2">
              Expected Behavior:
            </h2>
            <ul className="list-disc list-inside text-green-700 space-y-1">
              <li>✅ Splash command should work in any case (lowercase, uppercase, mixed)</li>
              <li>✅ Command menu should appear below the text</li>
              <li>✅ Typing after "splash" should filter the commands</li>
              <li>✅ Selecting a command should transform the block</li>
              <li>✅ Should work on any line, not just the first</li>
              <li>✅ Should work in ALL block types: paragraphs, headings, bullet lists, quotes, code blocks</li>
              <li>✅ Should work when previous lines contain rich text formatting</li>
            </ul>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-lg shadow-sm p-6">
          <EnhancedRichTextEditor
            blocks={blocks}
            onChange={handleBlocksChange}
            showPlaceholder={true}
          />
        </div>

        <div className="mt-8 bg-stone-100 border border-stone-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-stone-800 mb-2">
            Debug Info:
          </h3>
          <pre className="text-sm text-stone-600 overflow-auto">
            {JSON.stringify(blocks, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
