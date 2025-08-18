import React from 'react'
import Link from 'next/link'
import { LinkKeyword, LinkContext, ProcessedText } from '@/types/linking'
import { getKeywordsForContext, getLinkClassName, shouldExcludeKeyword } from './linkConfig'

// Track linked keywords per page to avoid duplicate linking
const linkedKeywordsPerPage = new Map<string, Set<string>>()

// Reset tracking for a new page
export function resetPageLinking(pageId: string) {
  linkedKeywordsPerPage.set(pageId, new Set())
}

// Check if a keyword has already been linked on this page
function isKeywordAlreadyLinked(pageId: string, keyword: string): boolean {
  const linkedKeywords = linkedKeywordsPerPage.get(pageId)
  return linkedKeywords ? linkedKeywords.has(keyword.toLowerCase()) : false
}

// Mark a keyword as linked for this page
function markKeywordAsLinked(pageId: string, keyword: string) {
  let linkedKeywords = linkedKeywordsPerPage.get(pageId)
  if (!linkedKeywords) {
    linkedKeywords = new Set()
    linkedKeywordsPerPage.set(pageId, linkedKeywords)
  }
  linkedKeywords.add(keyword.toLowerCase())
}

// Escape special regex characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Create a regex pattern for finding keywords
function createKeywordRegex(keyword: string, wholeWordOnly = true): RegExp {
  const escaped = escapeRegExp(keyword)
  const pattern = wholeWordOnly ? `\\b${escaped}\\b` : escaped
  return new RegExp(pattern, 'gi')
}

// Process text and add internal links
export function processTextWithLinks(
  text: string, 
  context: LinkContext,
  pageId: string = 'default'
): ProcessedText {
  if (!text || typeof text !== 'string') {
    return {
      content: text,
      linksAdded: 0,
      keywordsLinked: []
    }
  }

  const keywords = getKeywordsForContext(context)
  const linkClassName = getLinkClassName(context)
  const keywordsLinked: string[] = []
  let linksAdded = 0
  let processedText = text

  // Sort keywords by priority (highest first) and length (longest first)
  const sortedKeywords = keywords.sort((a, b) => {
    if (a.priority !== b.priority) {
      return b.priority - a.priority
    }
    return b.keyword.length - a.keyword.length
  })

  // Process each keyword
  for (const keywordConfig of sortedKeywords) {
    const { keyword, url, wholeWordOnly = true } = keywordConfig

    // Skip if keyword should be excluded or already linked
    if (shouldExcludeKeyword(keyword, context) || 
        isKeywordAlreadyLinked(pageId, keyword)) {
      continue
    }

    const regex = createKeywordRegex(keyword, wholeWordOnly)
    const matches = processedText.match(regex)

    if (matches && matches.length > 0) {
      // Only replace the first occurrence
      const firstMatch = matches[0]
      const placeholder = `__INTERNAL_LINK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}__`
      
      // Replace first occurrence with placeholder
      processedText = processedText.replace(regex, placeholder)
      
      // Store the link data for later replacement
      processedText = processedText.replace(
        placeholder,
        `<internal-link href="${url}" class="${linkClassName}">${firstMatch}</internal-link>`
      )

      markKeywordAsLinked(pageId, keyword)
      keywordsLinked.push(keyword)
      linksAdded++
    }
  }

  return {
    content: processedText,
    linksAdded,
    keywordsLinked
  }
}

// Convert processed text with internal-link tags to React elements
export function convertToReactElements(processedText: string): React.ReactNode {
  if (typeof processedText !== 'string') {
    return processedText
  }

  // Split by internal-link tags
  const parts = processedText.split(/(<internal-link[^>]*>.*?<\/internal-link>)/g)
  
  return parts.map((part, index) => {
    // Check if this part is an internal link
    const linkMatch = part.match(/<internal-link href="([^"]*)" class="([^"]*)">(.*?)<\/internal-link>/)
    
    if (linkMatch) {
      const [, href, className, linkText] = linkMatch
      return React.createElement(
        Link,
        {
          key: index,
          href,
          className
        },
        linkText
      )
    }
    
    // Regular text
    return part || null
  }).filter(Boolean)
}

// Main function to process text and return React elements
export function addInternalLinks(
  text: string,
  context: LinkContext,
  pageId?: string
): React.ReactNode {
  const processed = processTextWithLinks(text, context, pageId)
  return convertToReactElements(processed.content as string)
}

// Utility function for processing paragraph text in PortableText
export function processPortableTextSpan(
  text: string,
  context: LinkContext,
  pageId: string,
  spanIndex: number
): React.ReactNode {
  const uniqueId = `${pageId}-span-${spanIndex}`
  return addInternalLinks(text, context, uniqueId)
}
