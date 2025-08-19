import { LinkKeyword, LinkContext, PhilosopherLink } from '@/types/linking'
import { getAllPhilosophers } from './philosopherDataClient'

// Stoicism-related keywords that should link back to the main guide
const STOICISM_KEYWORDS: LinkKeyword[] = [
  // Core Stoicism terms
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
  },

  // Core Stoic concepts and virtues
  {
    keyword: 'virtue ethics',
    url: '/blog/stoicism-complete-guide',
    priority: 75,
    wholeWordOnly: true
  },
  {
    keyword: 'cardinal virtues',
    url: '/blog/stoicism-complete-guide',
    priority: 80,
    wholeWordOnly: true
  },
  {
    keyword: 'dichotomy of control',
    url: '/blog/stoicism-complete-guide',
    priority: 85,
    wholeWordOnly: true
  },
  {
    keyword: 'preferred indifferents',
    url: '/blog/stoicism-complete-guide',
    priority: 70,
    wholeWordOnly: true
  },
  {
    keyword: 'Stoic sage',
    url: '/blog/stoicism-complete-guide',
    priority: 75,
    wholeWordOnly: true
  },
  {
    keyword: 'Stoic exercises',
    url: '/blog/stoicism-complete-guide',
    priority: 80,
    wholeWordOnly: true
  },
  {
    keyword: 'negative visualization',
    url: '/blog/stoicism-complete-guide',
    priority: 75,
    wholeWordOnly: true
  },
  {
    keyword: 'memento mori',
    url: '/blog/stoicism-complete-guide',
    priority: 70,
    wholeWordOnly: true
  },
  {
    keyword: 'amor fati',
    url: '/blog/stoicism-complete-guide',
    priority: 75,
    wholeWordOnly: true
  },
  {
    keyword: 'premeditatio malorum',
    url: '/blog/stoicism-complete-guide',
    priority: 70,
    wholeWordOnly: true
  },

  // Stoic texts and works
  {
    keyword: 'Meditations',
    url: '/biography/marcus-aurelius',
    priority: 85,
    wholeWordOnly: true
  },
  {
    keyword: 'Enchiridion',
    url: '/biography/epictetus',
    priority: 85,
    wholeWordOnly: true
  },
  {
    keyword: 'Letters from a Stoic',
    url: '/biography/seneca',
    priority: 85,
    wholeWordOnly: true
  },
  {
    keyword: 'Discourses',
    url: '/biography/epictetus',
    priority: 80,
    wholeWordOnly: true
  },
  {
    keyword: 'On Anger',
    url: '/biography/seneca',
    priority: 75,
    wholeWordOnly: true
  },
  {
    keyword: 'On the Shortness of Life',
    url: '/biography/seneca',
    priority: 75,
    wholeWordOnly: true
  },
  {
    keyword: 'A Guide to the Good Life',
    url: 'https://www.goodreads.com/book/show/5617966-a-guide-to-the-good-life',
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

    // Add common variations and alternative names
    if (philosopher.name === 'Seneca') {
      keywords.push({
        keyword: 'Seneca the Younger',
        url: `/biography/${philosopher.slug}`,
        priority: 95,
        wholeWordOnly: true
      })
      keywords.push({
        keyword: 'Lucius Annaeus Seneca',
        url: `/biography/${philosopher.slug}`,
        priority: 90,
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
      keywords.push({
        keyword: 'Marcus Porcius Cato',
        url: `/biography/${philosopher.slug}`,
        priority: 90,
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
      keywords.push({
        keyword: 'Marcus Aurelius Antoninus',
        url: `/biography/${philosopher.slug}`,
        priority: 90,
        wholeWordOnly: true
      })
      keywords.push({
        keyword: 'the philosopher emperor',
        url: `/biography/${philosopher.slug}`,
        priority: 80,
        wholeWordOnly: true
      })
    }

    if (philosopher.name === 'Epictetus') {
      keywords.push({
        keyword: 'the slave philosopher',
        url: `/biography/${philosopher.slug}`,
        priority: 75,
        wholeWordOnly: true
      })
    }

    if (philosopher.name === 'Zeno of Citium') {
      keywords.push({
        keyword: 'Zeno the Stoic',
        url: `/biography/${philosopher.slug}`,
        priority: 85,
        wholeWordOnly: true
      })
      keywords.push({
        keyword: 'founder of Stoicism',
        url: `/biography/${philosopher.slug}`,
        priority: 80,
        wholeWordOnly: true
      })
    }

    if (philosopher.name === 'Musonius Rufus') {
      keywords.push({
        keyword: 'Gaius Musonius Rufus',
        url: `/biography/${philosopher.slug}`,
        priority: 90,
        wholeWordOnly: true
      })
      keywords.push({
        keyword: 'teacher of Epictetus',
        url: `/biography/${philosopher.slug}`,
        priority: 80,
        wholeWordOnly: true
      })
    }
  })

  return keywords
}

// Topic-specific keywords for different content themes
const TOPIC_KEYWORDS: Record<string, LinkKeyword[]> = {
  emotions: [
    {
      keyword: 'emotional resilience',
      url: '/blog/stoicism-complete-guide',
      priority: 75,
      wholeWordOnly: true
    },
    {
      keyword: 'managing emotions',
      url: '/blog/stoicism-complete-guide',
      priority: 70,
      wholeWordOnly: true
    },
    {
      keyword: 'emotional intelligence',
      url: '/blog/stoicism-complete-guide',
      priority: 65,
      wholeWordOnly: true
    }
  ],
  leadership: [
    {
      keyword: 'Stoic leadership',
      url: '/biography/marcus-aurelius',
      priority: 80,
      wholeWordOnly: true
    },
    {
      keyword: 'philosopher king',
      url: '/biography/marcus-aurelius',
      priority: 75,
      wholeWordOnly: true
    },
    {
      keyword: 'ethical leadership',
      url: '/blog/stoicism-complete-guide',
      priority: 70,
      wholeWordOnly: true
    }
  ],
  adversity: [
    {
      keyword: 'overcoming adversity',
      url: '/blog/stoicism-complete-guide',
      priority: 75,
      wholeWordOnly: true
    },
    {
      keyword: 'resilience',
      url: '/blog/stoicism-complete-guide',
      priority: 70,
      wholeWordOnly: false
    },
    {
      keyword: 'facing challenges',
      url: '/blog/stoicism-complete-guide',
      priority: 65,
      wholeWordOnly: true
    }
  ],
  mindfulness: [
    {
      keyword: 'present moment',
      url: '/blog/stoicism-complete-guide',
      priority: 70,
      wholeWordOnly: true
    },
    {
      keyword: 'mindful living',
      url: '/blog/stoicism-complete-guide',
      priority: 65,
      wholeWordOnly: true
    },
    {
      keyword: 'self-awareness',
      url: '/blog/stoicism-complete-guide',
      priority: 65,
      wholeWordOnly: true
    }
  ]
}

// Get topic-specific keywords
export function getTopicKeywords(topics: string[]): LinkKeyword[] {
  const keywords: LinkKeyword[] = []

  topics.forEach(topic => {
    if (TOPIC_KEYWORDS[topic]) {
      keywords.push(...TOPIC_KEYWORDS[topic])
    }
  })

  return keywords
}

// Get keywords based on context
export function getKeywordsForContext(context: LinkContext, topics?: string[]): LinkKeyword[] {
  let baseKeywords: LinkKeyword[] = []

  switch (context.type) {
    case 'blog-to-biography':
      baseKeywords = generatePhilosopherKeywords()
      break

    case 'biography-to-blog':
      baseKeywords = STOICISM_KEYWORDS
      break

    case 'general':
      baseKeywords = [...generatePhilosopherKeywords(), ...STOICISM_KEYWORDS]
      break

    default:
      baseKeywords = []
  }

  // Add topic-specific keywords if provided
  if (topics && topics.length > 0) {
    const topicKeywords = getTopicKeywords(topics)
    baseKeywords = [...baseKeywords, ...topicKeywords]
  }

  return baseKeywords
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
