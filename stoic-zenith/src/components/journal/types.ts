export interface JournalBlock {
  id: string
  type:
    | 'heading'
    | 'paragraph'
    | 'bullet-list'
    | 'numbered-list'
    | 'image'
    | 'quote'
    | 'code'
    | 'todo'
  level?: 1 | 2 | 3
  text: string
  // Rich text content stored as HTML for inline formatting
  richText?: string
  // Structured rich text content for advanced formatting
  content?: RichTextContent[]
  imageUrl?: string
  imageAlt?: string
  createdAt: Date
}

// Rich text content structure for inline formatting
export interface RichTextContent {
  type: 'text' | 'bold' | 'italic' | 'underline' | 'strike' | 'link' | 'code'
  text?: string
  href?: string // for links
  marks?: RichTextMark[]
  children?: RichTextContent[]
}

export interface RichTextMark {
  type: 'bold' | 'italic' | 'underline' | 'strike' | 'code' | 'link'
  attrs?: {
    href?: string
    target?: string
    class?: string
  }
}

export interface JournalEntry {
  id: string
  date: string
  blocks: JournalBlock[]
  thumbnail?: string
  preview?: string
  createdAt: Date
  updatedAt: Date
}

export interface CommandOption {
  id: string
  label: string
  description: string
  shortcut: string
  type: JournalBlock['type']
  level?: number
  icon: string
}
