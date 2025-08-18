import React from 'react'
import Link from 'next/link'
import { LinkKeyword, LinkContext, ProcessedText } from '@/types/linking'
import { getKeywordsForContext, getLinkClassName, shouldExcludeKeyword } from './linkConfig'
import { getKeywordsWithOverrides } from './linkOverrides'

// Enhanced link tracking and management
interface LinkTrackingData {
  keyword: string
  url: string
  position: number
  context: string
  timestamp: number
}

interface PageLinkingState {
  linkedKeywords: Set<string>
  linkCount: number
  linkPositions: Map<string, number[]>
  linkHistory: LinkTrackingData[]
  lastReset: number
}

// Global state for tracking links across pages
const pageLinkingState = new Map<string, PageLinkingState>()

// Configuration constants
const DEFAULT_MAX_LINKS_PER_PAGE = 10
const DEFAULT_MAX_LINKS_PER_PARAGRAPH = 3
const MIN_DISTANCE_BETWEEN_LINKS = 50 // characters

// Legacy compatibility - maintain existing simple tracking
const linkedKeywordsPerPage = new Map<string, Set<string>>()

// Enhanced page linking state management
function getPageLinkingState(pageId: string): PageLinkingState {
  if (!pageLinkingState.has(pageId)) {
    pageLinkingState.set(pageId, {
      linkedKeywords: new Set(),
      linkCount: 0,
      linkPositions: new Map(),
      linkHistory: [],
      lastReset: Date.now()
    })
  }
  return pageLinkingState.get(pageId)!
}

// Reset tracking for a new page (enhanced version)
export function resetPageLinking(pageId: string) {
  // Clear any existing state for this page
  linkedKeywordsPerPage.delete(pageId)
  pageLinkingState.delete(pageId)

  // Initialize fresh state
  linkedKeywordsPerPage.set(pageId, new Set())
  pageLinkingState.set(pageId, {
    linkedKeywords: new Set(),
    linkCount: 0,
    linkPositions: new Map(),
    linkHistory: [],
    lastReset: Date.now()
  })

  // Debug logging (remove in production)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log(`[Internal Linking] Reset state for page: ${pageId}`)
  }
}

// Check if we should add more links to this page
function canAddMoreLinks(pageId: string, maxLinks?: number): boolean {
  const state = getPageLinkingState(pageId)
  const limit = maxLinks || DEFAULT_MAX_LINKS_PER_PAGE
  return state.linkCount < limit
}

// Check if a link position is too close to existing links
function isPositionTooClose(pageId: string, position: number): boolean {
  const state = getPageLinkingState(pageId)

  for (const positions of state.linkPositions.values()) {
    for (const existingPos of positions) {
      if (Math.abs(position - existingPos) < MIN_DISTANCE_BETWEEN_LINKS) {
        return true
      }
    }
  }
  return false
}

// Record a link being added
function recordLink(pageId: string, keyword: string, url: string, position: number, context: string) {
  const state = getPageLinkingState(pageId)

  // Add to linked keywords
  state.linkedKeywords.add(keyword.toLowerCase())

  // Increment link count
  state.linkCount++

  // Record position
  if (!state.linkPositions.has(keyword)) {
    state.linkPositions.set(keyword, [])
  }
  state.linkPositions.get(keyword)!.push(position)

  // Add to history
  state.linkHistory.push({
    keyword,
    url,
    position,
    context,
    timestamp: Date.now()
  })

  // Legacy compatibility
  markKeywordAsLinked(pageId, keyword)
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

  // Get keywords with topic support and apply overrides
  const baseKeywords = getKeywordsForContext(context, context.topics)
  const keywords = getKeywordsWithOverrides(baseKeywords, pageId)
  const linkClassName = getLinkClassName(context)
  const maxLinks = context.maxLinksPerPage || DEFAULT_MAX_LINKS_PER_PAGE
  const keywordsLinked: string[] = []
  let linksAdded = 0
  let processedText = text

  // Sort keywords by priority (highest first) and length (longest first)
  const sortedKeywords = keywords
    .filter(k => !shouldExcludeKeyword(k.keyword, context))
    .sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority
      }
      return b.keyword.length - a.keyword.length
    })

  // Process each keyword
  for (const keywordConfig of sortedKeywords) {
    const { keyword, url, wholeWordOnly = true } = keywordConfig

    // Check if we can add more links
    if (!canAddMoreLinks(pageId, maxLinks)) {
      break
    }

    // Skip if already linked on this page
    if (isKeywordAlreadyLinked(pageId, keyword)) {
      continue
    }

    const regex = createKeywordRegex(keyword, wholeWordOnly)
    const match = regex.exec(processedText)

    if (match) {
      const matchPosition = match.index

      // Check if position is too close to existing links
      if (isPositionTooClose(pageId, matchPosition)) {
        continue
      }

      // Only replace the first occurrence
      const firstMatch = match[0]
      const placeholder = `__INTERNAL_LINK_${Date.now()}_${Math.random().toString(36).substring(2, 11)}__`

      // Replace first occurrence with placeholder
      processedText = processedText.replace(regex, placeholder)

      // Store the link data for later replacement
      processedText = processedText.replace(
        placeholder,
        `<internal-link href="${url}" class="${linkClassName}">${firstMatch}</internal-link>`
      )

      // Record the link using enhanced tracking
      recordLink(pageId, keyword, url, matchPosition, context.type)
      keywordsLinked.push(keyword)
      linksAdded++
    }
  }

  // Debug logging (remove in production)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log(`[Internal Linking] Processed ${pageId}: ${linksAdded} links created`, keywordsLinked)
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
  _spanIndex: number // Kept for API compatibility but not used
): React.ReactNode {
  // Use the main pageId instead of creating unique span IDs
  // This ensures consistent linking state across all spans in the same page
  return addInternalLinks(text, context, pageId)
}

// Analytics and reporting functions
export function getLinkingStats(pageId: string): {
  totalLinks: number
  keywordsLinked: string[]
  linkHistory: LinkTrackingData[]
  averageDistance: number
} {
  const state = getPageLinkingState(pageId)

  // Calculate average distance between links
  const positions = Array.from(state.linkPositions.values()).flat()
  let totalDistance = 0
  let distanceCount = 0

  for (let i = 0; i < positions.length - 1; i++) {
    totalDistance += Math.abs(positions[i + 1] - positions[i])
    distanceCount++
  }

  const averageDistance = distanceCount > 0 ? totalDistance / distanceCount : 0

  return {
    totalLinks: state.linkCount,
    keywordsLinked: Array.from(state.linkedKeywords),
    linkHistory: [...state.linkHistory],
    averageDistance
  }
}

// Get all linking stats across all pages
export function getAllLinkingStats(): Record<string, ReturnType<typeof getLinkingStats>> {
  const stats: Record<string, ReturnType<typeof getLinkingStats>> = {}

  for (const [pageId] of pageLinkingState) {
    stats[pageId] = getLinkingStats(pageId)
  }

  return stats
}

// Clear old linking data (for memory management)
export function clearOldLinkingData(maxAge: number = 24 * 60 * 60 * 1000) { // 24 hours default
  const now = Date.now()
  const pagesToDelete: string[] = []

  for (const [pageId, state] of pageLinkingState) {
    if (now - state.lastReset > maxAge) {
      pagesToDelete.push(pageId)
    }
  }

  pagesToDelete.forEach(pageId => {
    pageLinkingState.delete(pageId)
    linkedKeywordsPerPage.delete(pageId)
  })

  return pagesToDelete.length
}
