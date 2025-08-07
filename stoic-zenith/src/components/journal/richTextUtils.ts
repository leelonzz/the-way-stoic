import { RichTextContent, RichTextMark } from './types'
import DOMPurify from 'dompurify'

// Secure HTML sanitization using DOMPurify
export function sanitizeHtml(html: string): string {
  // Configure DOMPurify with allowed tags and attributes for rich text
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'code', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'a'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'style', 'javascript:']
  })
}

// Convert plain text to rich text with formatting
export function applyInlineFormatting(
  text: string,
  format: 'bold' | 'italic' | 'underline' | 'strike' | 'code',
  startOffset: number,
  endOffset: number
): string {
  if (startOffset >= endOffset || startOffset < 0 || endOffset > text.length) {
    return text
  }

  const before = text.substring(0, startOffset)
  const selected = text.substring(startOffset, endOffset)
  const after = text.substring(endOffset)

  const formatTags = {
    bold: ['<strong>', '</strong>'],
    italic: ['<em>', '</em>'],
    underline: ['<u>', '</u>'],
    strike: ['<s>', '</s>'],
    code: ['<code>', '</code>']
  }

  const [openTag, closeTag] = formatTags[format]
  return `${before}${openTag}${selected}${closeTag}${after}`
}

// Remove formatting from selected text
export function removeInlineFormatting(
  html: string,
  format: 'bold' | 'italic' | 'underline' | 'strike' | 'code' | 'all'
): string {
  if (format === 'all') {
    // Remove all formatting tags but preserve text
    return html.replace(/<\/?(?:strong|em|u|s|code|b|i)>/g, '')
  }

  const formatPatterns = {
    bold: /<\/?(?:strong|b)>/g,
    italic: /<\/?(?:em|i)>/g,
    underline: /<\/?u>/g,
    strike: /<\/?s>/g,
    code: /<\/?code>/g
  }

  return html.replace(formatPatterns[format], '')
}

// Check if text has specific formatting
export function hasFormatting(
  html: string,
  format: 'bold' | 'italic' | 'underline' | 'strike' | 'code'
): boolean {
  const formatPatterns = {
    bold: /<(?:strong|b)>/,
    italic: /<(?:em|i)>/,
    underline: /<u>/,
    strike: /<s>/,
    code: /<code>/
  }

  return formatPatterns[format].test(html)
}

// Toggle formatting on selected text
export function toggleInlineFormatting(
  html: string,
  format: 'bold' | 'italic' | 'underline' | 'strike' | 'code',
  startOffset: number,
  endOffset: number
): string {
  // Convert HTML to plain text for offset calculation
  const tempDiv = document.createElement('div')
  const sanitizedHtml = sanitizeHtml(html)
  tempDiv.innerHTML = sanitizedHtml
  const plainText = tempDiv.textContent || ''

  if (hasFormatting(html, format)) {
    return removeInlineFormatting(html, format)
  } else {
    return applyInlineFormatting(plainText, format, startOffset, endOffset)
  }
}

// Create a link with proper validation
export function createLink(text: string, url: string, title?: string): string {
  // Basic URL validation
  const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
  
  if (!urlPattern.test(url)) {
    // If no protocol, add https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }
  }

  const titleAttr = title ? ` title="${title}"` : ''
  return `<a href="${url}" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`
}

// Extract links from HTML
export function extractLinks(html: string): Array<{ text: string; url: string; title?: string }> {
  const tempDiv = document.createElement('div')
  const sanitizedHtml = sanitizeHtml(html)
  tempDiv.innerHTML = sanitizedHtml
  const links = tempDiv.querySelectorAll('a')
  
  return Array.from(links).map(link => ({
    text: link.textContent || '',
    url: link.href,
    title: link.title || undefined
  }))
}

// Convert rich text content to HTML
export function richTextToHtml(content: RichTextContent[]): string {
  return content.map(node => {
    if (node.type === 'text') {
      return node.text || ''
    }

    const tag = getHtmlTag(node.type)
    const attrs = getHtmlAttributes(node)
    const children = node.children ? richTextToHtml(node.children) : (node.text || '')
    
    return `<${tag}${attrs}>${children}</${tag}>`
  }).join('')
}

// Convert HTML to rich text content structure
export function htmlToRichText(html: string): RichTextContent[] {
  const tempDiv = document.createElement('div')
  const sanitizedHtml = sanitizeHtml(html)
  tempDiv.innerHTML = sanitizedHtml
  
  return parseNodeToRichText(tempDiv)
}

// Helper function to get HTML tag for rich text type
function getHtmlTag(type: RichTextContent['type']): string {
  const tagMap = {
    text: 'span',
    bold: 'strong',
    italic: 'em',
    underline: 'u',
    strike: 's',
    link: 'a',
    code: 'code'
  }
  return tagMap[type] || 'span'
}

// Helper function to get HTML attributes
function getHtmlAttributes(node: RichTextContent): string {
  if (node.type === 'link' && node.href) {
    return ` href="${node.href}" target="_blank" rel="noopener noreferrer"`
  }
  return ''
}

// Helper function to parse DOM node to rich text structure
function parseNodeToRichText(node: Node): RichTextContent[] {
  const result: RichTextContent[] = []

  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent || ''
      if (text.trim()) {
        result.push({ type: 'text', text })
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const element = child as Element
      const tagName = element.tagName.toLowerCase()
      
      let type: RichTextContent['type'] = 'text'
      let href: string | undefined

      switch (tagName) {
        case 'strong':
        case 'b':
          type = 'bold'
          break
        case 'em':
        case 'i':
          type = 'italic'
          break
        case 'u':
          type = 'underline'
          break
        case 's':
          type = 'strike'
          break
        case 'code':
          type = 'code'
          break
        case 'a':
          type = 'link'
          href = (element as HTMLAnchorElement).href
          break
      }

      const children = parseNodeToRichText(child)
      result.push({
        type,
        href,
        children: children.length > 0 ? children : undefined,
        text: children.length === 0 ? element.textContent || '' : undefined
      })
    }
  }

  return result
}

// Get plain text from rich text content
export function richTextToPlainText(content: RichTextContent[]): string {
  return content.map(node => {
    if (node.children) {
      return richTextToPlainText(node.children)
    }
    return node.text || ''
  }).join('')
}

// Preserve typography by filtering font-related styles
export function preserveTypography(html: string): string {
  const tempDiv = document.createElement('div')
  const sanitizedHtml = sanitizeHtml(html)
  tempDiv.innerHTML = sanitizedHtml

  // Remove font-family, font-size, and color styles to preserve design consistency
  const allElements = tempDiv.querySelectorAll('*')
  allElements.forEach(el => {
    if (el.hasAttribute('style')) {
      const style = el.getAttribute('style') || ''
      const filteredStyle = style
        .split(';')
        .filter(rule => {
          const property = rule.split(':')[0]?.trim().toLowerCase()
          return !['font-family', 'font-size', 'color', 'background-color'].includes(property)
        })
        .join(';')
      
      if (filteredStyle) {
        el.setAttribute('style', filteredStyle)
      } else {
        el.removeAttribute('style')
      }
    }
  })

  return tempDiv.innerHTML
}
