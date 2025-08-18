export interface LinkKeyword {
  keyword: string
  url: string
  priority: number // Higher number = higher priority for overlapping keywords
  caseSensitive?: boolean
  wholeWordOnly?: boolean
}

export interface LinkContext {
  type: 'blog-to-biography' | 'biography-to-blog' | 'general'
  currentPath?: string
  excludeKeywords?: string[] // Keywords to skip in this context
}

export interface LinkConfig {
  keywords: LinkKeyword[]
  maxLinksPerPage?: number
  linkClassName?: string
  excludeSelectors?: string[] // CSS selectors where linking should be avoided
}

export interface ProcessedText {
  content: React.ReactNode
  linksAdded: number
  keywordsLinked: string[]
}

export interface PhilosopherLink {
  name: string
  fullName: string
  slug: string
  variations: string[] // Alternative names/spellings
}
