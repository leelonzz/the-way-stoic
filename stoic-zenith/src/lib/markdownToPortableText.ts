import { marked } from 'marked'
import { htmlToBlocks } from '@portabletext/block-tools'
import { Schema } from '@sanity/schema'

const blockContentType = Schema.compile({
  name: 'myBlog',
  types: [
    {
      type: 'object',
      name: 'blockContent',
      fields: [
        {
          title: 'Body',
          name: 'body',
          type: 'array',
          of: [
            {
              type: 'block',
              styles: [
                { title: 'Normal', value: 'normal' },
                { title: 'H1', value: 'h1' },
                { title: 'H2', value: 'h2' },
                { title: 'H3', value: 'h3' },
                { title: 'H4', value: 'h4' },
                { title: 'Quote', value: 'blockquote' },
              ],
              marks: {
                decorators: [
                  { title: 'Strong', value: 'strong' },
                  { title: 'Emphasis', value: 'em' },
                  { title: 'Code', value: 'code' },
                ],
                annotations: [
                  {
                    title: 'URL',
                    name: 'link',
                    type: 'object',
                    fields: [
                      {
                        title: 'URL',
                        name: 'href',
                        type: 'url',
                      },
                    ],
                  },
                ],
              },
            },
            {
              type: 'image',
              options: { hotspot: true },
              fields: [
                {
                  name: 'alt',
                  type: 'string',
                  title: 'Alt text',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}).get('blockContent')

export function markdownToPortableText(markdown: string) {
  try {
    // Convert markdown to HTML using marked
    const html = marked.parse(markdown)
    
    // Use browser's DOMParser if available (client-side)
    const parseHtml = (htmlString: string) => {
      if (typeof window !== 'undefined') {
        const parser = new DOMParser()
        return parser.parseFromString(htmlString, 'text/html')
      }
      // Fallback for server-side - create a simple HTML structure
      return {
        body: {
          innerHTML: htmlString,
          querySelector: () => null,
          querySelectorAll: () => [],
        },
      } as any
    }
    
    // Convert HTML to Portable Text blocks
    const blocks = htmlToBlocks(html, blockContentType, {
      parseHtml,
      rules: [
        // Custom rule for handling code blocks
        {
          deserialize(el: any, next: any, block: any) {
            if (el.tagName === 'PRE') {
              const code = el.querySelector?.('code')
              if (code) {
                return block({
                  _type: 'block',
                  style: 'normal',
                  children: [
                    {
                      _type: 'span',
                      text: code.textContent || '',
                      marks: ['code'],
                    },
                  ],
                })
              }
            }
            return undefined
          },
        },
        // Custom rule for inline code
        {
          deserialize(el: any, next: any, block: any) {
            if (el.tagName === 'CODE' && el.parentElement?.tagName !== 'PRE') {
              return {
                _type: 'span',
                text: el.textContent || '',
                marks: ['code'],
              }
            }
            return undefined
          },
        },
      ],
    })
    
    return blocks
  } catch (error) {
    console.error('Error converting markdown to portable text:', error)
    throw new Error('Failed to convert markdown to portable text')
  }
}

export function isValidMarkdown(text: string): boolean {
  // Simple validation to check if text contains markdown syntax
  const markdownPatterns = [
    /^#{1,6}\s+/m,  // Headers
    /\*\*.*\*\*/,   // Bold
    /\*.*\*/,       // Italic
    /`.*`/,         // Inline code
    /```[\s\S]*```/, // Code blocks
    /^\* |^\- |^\+ /m, // Unordered lists
    /^\d+\. /m,     // Ordered lists
    /\[.*\]\(.*\)/, // Links
    /!\[.*\]\(.*\)/ // Images
  ]
  
  return markdownPatterns.some(pattern => pattern.test(text))
}