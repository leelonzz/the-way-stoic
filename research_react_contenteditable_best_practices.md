# React contentEditable Best Practices Research Summary

_Generated: 2025-08-03 | Sources: 15_

## 🎯 Quick Reference

<key-points>
- Use specialized libraries like BlockNote, Slate.js, or react-contenteditable instead of raw contentEditable
- Implement proper caret position management using Selection API and Range methods
- Handle paste events to strip unwanted formatting and maintain typography consistency
- Avoid dangerouslySetInnerHTML by using structured data approaches and HTML sanitization
- Use unique keys based on stable IDs to prevent React duplicate key warnings
</key-points>

## 📋 Overview

<summary>
React contentEditable integration presents unique challenges due to conflicting DOM state management between React's virtual DOM and the browser's native contentEditable behavior. Modern solutions in 2025 focus on block-based editors that provide Notion/Google Docs-like experiences while maintaining clean React patterns and avoiding security vulnerabilities.
</summary>

## 🔧 Implementation Details

<details>

### Typography Styling in Empty Blocks

```tsx
// Maintain typography styling with CSS custom properties
const EditableBlock = ({ placeholder, typography = 'body1' }) => {
  const [content, setContent] = useState('')
  const editableRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={editableRef}
      contentEditable
      suppressContentEditableWarning
      className={`editable-block typography-${typography}`}
      data-placeholder={placeholder}
      onInput={e => setContent(e.currentTarget.textContent || '')}
      style={{
        minHeight: '1.5em',
        outline: 'none',
        '--typography-family':
          typography === 'heading' ? 'Inter, sans-serif' : 'inherit',
        '--typography-size': typography === 'heading' ? '1.5rem' : '1rem',
        '--typography-weight': typography === 'heading' ? '600' : '400',
      }}
    />
  )
}
```

```css
.editable-block {
  font-family: var(--typography-family);
  font-size: var(--typography-size);
  font-weight: var(--typography-weight);
  line-height: 1.6;
}

.editable-block:empty::before {
  content: attr(data-placeholder);
  color: #9ca3af;
  pointer-events: none;
}
```

### Hiding Block Structure from Users

```tsx
// Block-based editor with seamless UI
const BlockEditor = () => {
  const [blocks, setBlocks] = useState([
    { id: nanoid(), type: 'paragraph', content: '' },
  ])

  const renderBlock = useCallback(
    (block, index) => {
      return (
        <div
          key={block.id} // Stable unique ID prevents duplicate key warnings
          className="block-wrapper"
          style={{
            position: 'relative',
            marginBottom: '0.5rem',
          }}
        >
          <EditableBlock
            block={block}
            onChange={content => updateBlock(block.id, content)}
            onKeyDown={e => handleBlockKeydown(e, block.id, index)}
          />

          {/* Hide block controls until hover/focus */}
          <BlockControls
            blockId={block.id}
            className="block-controls"
            style={{
              opacity: 0,
              transition: 'opacity 0.2s ease',
            }}
          />
        </div>
      )
    },
    [blocks]
  )

  return <div className="editor-container">{blocks.map(renderBlock)}</div>
}
```

```css
.block-wrapper:hover .block-controls,
.block-wrapper:focus-within .block-controls {
  opacity: 1;
}

.editor-container {
  /* Hide scrollbars and block boundaries */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.editor-container::-webkit-scrollbar {
  display: none;
}
```

### Preventing Duplicate Key Warnings

```tsx
// Use stable IDs and proper key management
import { nanoid } from 'nanoid'

interface Block {
  id: string // Always use stable, unique IDs
  type: 'paragraph' | 'heading' | 'list'
  content: string
  metadata?: Record<string, any>
}

const useBlockManager = () => {
  const [blocks, setBlocks] = useState<Block[]>([])

  const addBlock = useCallback((type: Block['type'], afterId?: string) => {
    const newBlock: Block = {
      id: nanoid(), // Generate unique ID
      type,
      content: '',
    }

    setBlocks(prev => {
      if (!afterId) return [...prev, newBlock]

      const index = prev.findIndex(b => b.id === afterId)
      const newBlocks = [...prev]
      newBlocks.splice(index + 1, 0, newBlock)
      return newBlocks
    })

    return newBlock.id
  }, [])

  const removeBlock = useCallback((id: string) => {
    setBlocks(prev => prev.filter(block => block.id !== id))
  }, [])

  const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
    setBlocks(prev =>
      prev.map(block => (block.id === id ? { ...block, ...updates } : block))
    )
  }, [])

  return { blocks, addBlock, removeBlock, updateBlock }
}
```

### Clean Text Editor UX Patterns

```tsx
// Caret position management for seamless editing
const useCaretPosition = () => {
  const saveCaretPosition = useCallback((element: HTMLElement) => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return null

    const range = selection.getRangeAt(0)
    const caretPos = range.startOffset
    const containerElement = range.startContainer

    return { caretPos, containerElement }
  }, [])

  const restoreCaretPosition = useCallback(
    (
      element: HTMLElement,
      position: { caretPos: number; containerElement: Node }
    ) => {
      const range = document.createRange()
      const selection = window.getSelection()

      try {
        range.setStart(position.containerElement, position.caretPos)
        range.collapse(true)
        selection?.removeAllRanges()
        selection?.addRange(range)
      } catch (error) {
        // Fallback: set cursor to end
        range.selectNodeContents(element)
        range.collapse(false)
        selection?.removeAllRanges()
        selection?.addRange(range)
      }
    },
    []
  )

  return { saveCaretPosition, restoreCaretPosition }
}

// Handle paste events for clean text insertion
const handlePaste = useCallback((event: React.ClipboardEvent) => {
  event.preventDefault()

  const text = event.clipboardData.getData('text/plain')
  const htmlContent = event.clipboardData.getData('text/html')

  // Strip formatting, keep only plain text
  if (text) {
    document.execCommand('insertText', false, text)
  }
}, [])
```

### Proper Block Rendering Without dangerouslySetInnerHTML

```tsx
// Structured data approach instead of raw HTML
interface RichTextNode {
  type: 'text' | 'bold' | 'italic' | 'link'
  text?: string
  url?: string
  children?: RichTextNode[]
}

const RichTextRenderer: React.FC<{ nodes: RichTextNode[] }> = ({ nodes }) => {
  const renderNode = (node: RichTextNode, index: number): React.ReactNode => {
    switch (node.type) {
      case 'text':
        return <span key={index}>{node.text}</span>

      case 'bold':
        return <strong key={index}>{node.children?.map(renderNode)}</strong>

      case 'italic':
        return <em key={index}>{node.children?.map(renderNode)}</em>

      case 'link':
        return (
          <a
            key={index}
            href={node.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {node.children?.map(renderNode)}
          </a>
        )

      default:
        return null
    }
  }

  return <>{nodes.map(renderNode)}</>
}

// Safe HTML sanitization when needed
import DOMPurify from 'dompurify'

const SafeHtmlRenderer: React.FC<{ html: string }> = ({ html }) => {
  const sanitizedHtml = useMemo(() => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
    })
  }, [html])

  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
}
```

</details>

## ⚠️ Important Considerations

<warnings>
- contentEditable conflicts with React's virtual DOM - both try to manage DOM state
- Always use suppressContentEditableWarning to avoid React warnings when controlled
- Caret position can be lost during re-renders - implement position saving/restoration
- Paste events carry formatting that can break typography consistency
- Block-level operations require careful key management to prevent duplicate warnings
- Performance can degrade with large documents - implement virtualization for 100+ blocks
</warnings>

## 🔗 Resources

<references>
- [BlockNote](https://www.blocknotejs.org/) - Leading block-based React editor (Notion-style)
- [Slate.js](https://docs.slatejs.org/) - Completely customizable framework for building rich text editors
- [react-contenteditable](https://www.npmjs.com/package/react-contenteditable) - Simple wrapper for contentEditable in React
- [DOMPurify](https://github.com/cure53/DOMPurify) - HTML sanitization library for XSS protection
- [Draft.js](https://draftjs.org/) - Facebook's rich text editor framework for React
- [Editor.js](https://editorjs.io/) - Block-style editor with plugin architecture
- [React Selection API](https://developer.mozilla.org/en-US/docs/Web/API/Selection) - Browser API for caret management
- [React Event Handlers](https://react.dev/reference/react-dom/components/common#clipboard-events) - Official React documentation for event handling
</references>

## 🏷️ Metadata

<meta>
research-date: 2025-08-03
confidence: high
version-checked: React 18+, React 19
frameworks-evaluated: BlockNote, Slate, Draft.js, Editor.js, Quill
</meta>
