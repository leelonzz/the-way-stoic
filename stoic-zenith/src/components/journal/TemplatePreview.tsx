import React, { useState } from 'react'
import { JournalTemplate, JournalBlock } from './types'
import { Button } from '@/components/ui/button'

interface TemplatePreviewProps {
  template: JournalTemplate | null
  onUseNow: (
    template: JournalTemplate,
    insertionMode?: 'prepend' | 'append' | 'replace'
  ) => void
  onSaveToMyTemplates?: (template: JournalTemplate) => void
  showSaveOption?: boolean
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  onUseNow,
  onSaveToMyTemplates,
  showSaveOption = false,
}) => {
  const [insertionMode, setInsertionMode] = useState<
    'prepend' | 'append' | 'replace'
  >('prepend')
  if (!template) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">Select a template</p>
          <p className="text-sm mt-1">
            Choose a template from the left to preview it here
          </p>
        </div>
      </div>
    )
  }

  const renderBlock = (block: JournalBlock, index: number) => {
    const baseClasses = 'mb-3'

    switch (block.type) {
      case 'heading': {
        const headingClasses = {
          1: 'text-2xl font-bold text-gray-900',
          2: 'text-xl font-semibold text-gray-800',
          3: 'text-lg font-medium text-gray-700',
        }
        const className = `${baseClasses} ${headingClasses[block.level as keyof typeof headingClasses] || headingClasses[2]}`

        if (block.level === 1) {
          return (
            <h1 key={index} className={className}>
              {block.text}
            </h1>
          )
        } else if (block.level === 3) {
          return (
            <h3 key={index} className={className}>
              {block.text}
            </h3>
          )
        } else {
          return (
            <h2 key={index} className={className}>
              {block.text}
            </h2>
          )
        }
      }

      case 'paragraph':
        if (
          block.text.includes('TODAY I AM GRATEFUL FOR') ||
          block.text.includes('SIMPLE DELIGHTS') ||
          block.text.includes('3 GOOD THINGS') ||
          block.text.includes('MY FAVORITE MOMENTS')
        ) {
          return (
            <div
              key={index}
              className={`${baseClasses} bg-gray-100 px-3 py-2 rounded-md`}
            >
              <p className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                {block.text}
              </p>
            </div>
          )
        }

        if (block.text.trim() && block.text.includes(':')) {
          return (
            <p
              key={index}
              className={`${baseClasses} font-medium text-gray-800`}
            >
              {block.text}
            </p>
          )
        }

        return block.text.trim() ? (
          <p key={index} className={`${baseClasses} text-gray-600`}>
            {block.text}
          </p>
        ) : (
          <div key={index} className={`${baseClasses} h-4`}></div>
        )

      case 'bullet-list':
        return (
          <div key={index} className={`${baseClasses} flex items-start`}>
            <span className="text-gray-400 mr-2">•</span>
            <span className="text-gray-500 text-sm">
              Add your content here...
            </span>
          </div>
        )

      case 'numbered-list': {
        const number = block.text.match(/^\d+/)?.[0] || '1'
        return (
          <div key={index} className={`${baseClasses} flex items-start`}>
            <span className="text-gray-400 mr-2 font-medium">{number}.</span>
            <span className="text-gray-500 text-sm">
              Add your content here...
            </span>
          </div>
        )
      }

      case 'todo':
        return (
          <div key={index} className={`${baseClasses} flex items-start`}>
            <span className="text-gray-400 mr-2">□</span>
            <span className="text-gray-500 text-sm">Add your task here...</span>
          </div>
        )

      default:
        return (
          <p key={index} className={`${baseClasses} text-gray-600`}>
            {block.text}
          </p>
        )
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {template.name}
        </h2>
        {template.description && (
          <p className="text-gray-600">{template.description}</p>
        )}
      </div>

      {/* Content Preview */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl">
          {template.template_content.blocks.map((block, index) =>
            renderBlock(block, index)
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-gray-200 bg-white">
        {/* Insertion Mode Selector */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Insert template:
          </label>
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 text-xs rounded-md border ${
                insertionMode === 'prepend'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setInsertionMode('prepend')}
            >
              At beginning
            </button>
            <button
              className={`px-3 py-1 text-xs rounded-md border ${
                insertionMode === 'append'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setInsertionMode('append')}
            >
              At end
            </button>
            <button
              className={`px-3 py-1 text-xs rounded-md border ${
                insertionMode === 'replace'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setInsertionMode('replace')}
            >
              Replace all
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          {showSaveOption && onSaveToMyTemplates && (
            <Button
              variant="outline"
              onClick={() => onSaveToMyTemplates(template)}
              className="px-6"
            >
              Save to My Templates
            </Button>
          )}
          <Button
            onClick={() => onUseNow(template, insertionMode)}
            className="px-8 bg-blue-600 hover:bg-blue-700"
          >
            Use Now
          </Button>
        </div>
      </div>
    </div>
  )
}
