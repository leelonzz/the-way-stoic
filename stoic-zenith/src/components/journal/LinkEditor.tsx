import React, { useState, useEffect, useRef } from 'react'
import { Link, ExternalLink, Unlink, Check, X } from 'lucide-react'

interface LinkEditorProps {
  isOpen: boolean
  initialUrl?: string
  initialText?: string
  onSave: (url: string, text: string) => void
  onRemove?: () => void
  onCancel: () => void
  position?: { x: number; y: number }
}

export function LinkEditor({
  isOpen,
  initialUrl = '',
  initialText = '',
  onSave,
  onRemove,
  onCancel,
  position = { x: 0, y: 0 }
}: LinkEditorProps): JSX.Element | null {
  const [url, setUrl] = useState(initialUrl)
  const [text, setText] = useState(initialText)
  const [isValidUrl, setIsValidUrl] = useState(true)
  const urlInputRef = useRef<HTMLInputElement>(null)
  const textInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl)
      setText(initialText)
      // Focus URL input after a short delay to ensure the component is rendered
      setTimeout(() => {
        urlInputRef.current?.focus()
        urlInputRef.current?.select()
      }, 100)
    }
  }, [isOpen, initialUrl, initialText])

  useEffect(() => {
    // Validate URL
    if (url.trim() === '') {
      setIsValidUrl(true)
      return
    }

    try {
      // Basic URL validation
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
      setIsValidUrl(urlPattern.test(url))
    } catch {
      setIsValidUrl(false)
    }
  }, [url])

  const handleSave = () => {
    if (!url.trim()) {
      onCancel()
      return
    }

    if (!isValidUrl) {
      urlInputRef.current?.focus()
      return
    }

    let finalUrl = url.trim()
    // Add https:// if no protocol is specified
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl
    }

    const finalText = text.trim() || finalUrl
    onSave(finalUrl, finalText)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    } else if (e.key === 'Tab' && e.target === urlInputRef.current) {
      e.preventDefault()
      textInputRef.current?.focus()
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onCancel} />
      
      {/* Link Editor */}
      <div
        className="fixed z-50 bg-white border border-stone-200 rounded-lg shadow-lg p-4 min-w-[320px]"
        style={{
          left: Math.max(10, Math.min(position.x, window.innerWidth - 340)),
          top: Math.max(10, Math.min(position.y, window.innerHeight - 200)),
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Link size={16} className="text-stone-600" />
          <span className="font-medium text-stone-800">
            {initialUrl ? 'Edit Link' : 'Add Link'}
          </span>
        </div>

        <div className="space-y-3">
          {/* URL Input */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">
              URL
            </label>
            <input
              ref={urlInputRef}
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://example.com"
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                !isValidUrl && url.trim() !== ''
                  ? 'border-red-300 bg-red-50'
                  : 'border-stone-300'
              }`}
            />
            {!isValidUrl && url.trim() !== '' && (
              <p className="text-xs text-red-600 mt-1">
                Please enter a valid URL
              </p>
            )}
          </div>

          {/* Text Input */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">
              Display Text (optional)
            </label>
            <input
              ref={textInputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Link text"
              className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={!isValidUrl || !url.trim()}
                className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={14} />
                Save
              </button>
              
              <button
                onClick={onCancel}
                className="flex items-center gap-1 px-3 py-1.5 border border-stone-300 text-stone-700 rounded-md text-sm font-medium hover:bg-stone-50"
              >
                <X size={14} />
                Cancel
              </button>
            </div>

            {onRemove && initialUrl && (
              <button
                onClick={onRemove}
                className="flex items-center gap-1 px-2 py-1.5 text-red-600 rounded-md text-sm font-medium hover:bg-red-50"
                title="Remove link"
              >
                <Unlink size={14} />
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Preview */}
        {url.trim() && isValidUrl && (
          <div className="mt-3 pt-3 border-t border-stone-200">
            <div className="flex items-center gap-2 text-xs text-stone-600">
              <ExternalLink size={12} />
              <span>Preview:</span>
              <a
                href={url.startsWith('http') ? url : `https://${url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 underline truncate max-w-[200px]"
              >
                {text.trim() || url}
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
