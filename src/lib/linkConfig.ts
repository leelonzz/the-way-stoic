import { LinkKeyword, LinkContext, PhilosopherLink } from '@/types/linking'
import { getAllPhilosophers } from './philosopherData'

// Stoicism-related keywords that should link back to the main guide
const STOICISM_KEYWORDS: LinkKeyword[] = [
  {
    keyword: 'Stoicism',
    url: '/blog/stoicism-complete-guide',
    priority: 100,
    wholeWordOnly: true
  },
  {
    keyword: 'Stoic philosophy',
    url: '/blog/stoicism-complete-guide',
    priority: 90,
    wholeWordOnly: true
  },
  {
    keyword: 'Stoic principles',
    url: '/blog/stoicism-complete-guide',
    priority: 85,
    wholeWordOnly: true
  },
  {
    keyword: 'Stoic teachings',
    url: '/blog/stoicism-complete-guide',
    priority: 85,
    wholeWordOnly: true
  },
  {
    keyword: 'Stoic school',
    url: '/blog/stoicism-complete-guide',
    priority: 80,
    wholeWordOnly: true
  },
  {
    keyword: 'Stoic doctrine',
    url: '/blog/stoicism-complete-guide',
    priority: 80,
    wholeWordOnly: true
  },
  {
    keyword: 'Stoic ethics',
    url: '/blog/stoicism-complete-guide',
    priority: 75,
    wholeWordOnly: true
  },
  {
    keyword: 'ancient Stoicism',
    url: '/blog/stoicism-complete-guide',
    priority: 70,
    wholeWordOnly: true
  },
  {
    keyword: 'Roman Stoicism',
    url: '/blog/stoicism-complete-guide',
    priority: 70,
    wholeWordOnly: true
  }
]

// Generate philosopher keywords from the CSV data
function generatePhilosopherKeywords(): LinkKeyword[] {
  const philosophers = getAllPhilosophers()
  const keywords: LinkKeyword[] = []

  philosophers.forEach(philosopher => {
    // Add full name with highest priority
    if (philosopher.fullName && philosopher.fullName !== philosopher.name) {
      keywords.push({
        keyword: philosopher.fullName,
        url: `/biography/${philosopher.slug}`,
        priority: 100,
        wholeWordOnly: true
      })
    }

    // Add short name with slightly lower priority
    if (philosopher.name) {
      keywords.push({
        keyword: philosopher.name,
        url: `/biography/${philosopher.slug}`,
        priority: 90,
        wholeWordOnly: true
      })
    }

    // Add common variations
    if (philosopher.name === 'Seneca') {
      keywords.push({
        keyword: 'Seneca the Younger',
        url: `/biography/${philosopher.slug}`,
        priority: 95,
        wholeWordOnly: true
      })
    }

    if (philosopher.name === 'Cato the Younger') {
      keywords.push({
        keyword: 'Cato',
        url: `/biography/${philosopher.slug}`,
        priority: 85,
        wholeWordOnly: true
      })
    }

    if (philosopher.name === 'Marcus Aurelius') {
      keywords.push({
        keyword: 'Emperor Marcus Aurelius',
        url: `/biography/${philosopher.slug}`,
        priority: 95,
        wholeWordOnly: true
      })
    }
  })

  return keywords
}

// Get keywords based on context
export function getKeywordsForContext(context: LinkContext): LinkKeyword[] {
  switch (context.type) {
    case 'blog-to-biography':
      return generatePhilosopherKeywords()
    
    case 'biography-to-blog':
      return STOICISM_KEYWORDS
    
    case 'general':
      return [...generatePhilosopherKeywords(), ...STOICISM_KEYWORDS]
    
    default:
      return []
  }
}

// Get link styling based on context
export function getLinkClassName(context: LinkContext): string {
  switch (context.type) {
    case 'blog-to-biography':
      return 'text-amber-700 hover:text-amber-900 underline font-medium transition-colors'
    
    case 'biography-to-blog':
      return 'text-blue-700 hover:text-blue-900 underline font-medium transition-colors'
    
    default:
      return 'text-blue-600 hover:text-blue-800 underline transition-colors'
  }
}

// Check if a keyword should be excluded in the current context
export function shouldExcludeKeyword(keyword: string, context: LinkContext): boolean {
  if (!context.excludeKeywords) return false
  
  return context.excludeKeywords.some(excluded => 
    excluded.toLowerCase() === keyword.toLowerCase()
  )
}
