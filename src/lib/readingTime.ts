interface ReadingTimeResult {
  text: string
  minutes: number
  time: number
  words: number
}

export function calculateReadingTime(content: any[]): ReadingTimeResult {
  if (!content || !Array.isArray(content)) {
    return {
      text: '1 min read',
      minutes: 1,
      time: 60000,
      words: 0
    }
  }

  // Extract text from Portable Text content
  const extractText = (blocks: any[]): string => {
    return blocks
      .map((block) => {
        if (block._type === 'block' && block.children) {
          return block.children
            .filter((child: any) => child._type === 'span')
            .map((child: any) => child.text || '')
            .join('')
        }
        return ''
      })
      .join(' ')
  }

  const text = extractText(content)
  const wordsPerMinute = 200 // Average reading speed
  const words = text.trim().split(/\s+/).filter(word => word.length > 0).length
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute))
  
  return {
    text: `${minutes} min read`,
    minutes,
    time: minutes * 60 * 1000,
    words
  }
}

export function formatReadingTime(minutes: number): string {
  if (minutes < 1) {
    return '1 min read'
  }
  return `${minutes} min read`
}