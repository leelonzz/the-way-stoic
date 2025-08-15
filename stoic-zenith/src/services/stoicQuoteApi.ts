'use client'

// Types for the external Stoic Quote API
export interface ApiQuoteResponse {
  data: {
    author: string
    quote: string
  }
}

export interface StoicQuote {
  id: string
  text: string
  author: string
  source?: string
  category: string
  created_at: string
  mood_tags?: string[]
}

// API configuration - use our proxy to avoid CORS issues
const API_BASE_URL = '/api/quotes'
const API_TIMEOUT = 10000 // 10 seconds

class StoicQuoteApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message)
    this.name = 'StoicQuoteApiError'
  }
}

/**
 * Service for interacting with the external Stoic Quote API
 */
export class StoicQuoteApiService {
  private static instance: StoicQuoteApiService
  private requestCount = 0
  private lastRequestTime = 0
  private readonly MIN_REQUEST_INTERVAL = 1000 // Minimum 1 second between requests

  static getInstance(): StoicQuoteApiService {
    if (!StoicQuoteApiService.instance) {
      StoicQuoteApiService.instance = new StoicQuoteApiService()
    }
    return StoicQuoteApiService.instance
  }

  /**
   * Rate limiting to prevent overwhelming the API
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const delay = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    
    this.lastRequestTime = Date.now()
    this.requestCount++
  }

  /**
   * Fetch a single quote from the API
   */
  async fetchQuote(): Promise<StoicQuote> {
    await this.rateLimit()

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

      const response = await fetch(`${API_BASE_URL}/stoic`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new StoicQuoteApiError(
          `API request failed: ${response.status} ${response.statusText}`,
          response.status
        )
      }

      const data: StoicQuote = await response.json()

      if (!data.text || !data.author || !data.id) {
        throw new StoicQuoteApiError('Invalid API response format')
      }

      // Data is already in our format from the proxy
      return data
    } catch (error) {
      if (error instanceof StoicQuoteApiError) {
        throw error
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new StoicQuoteApiError('Request timeout - API took too long to respond')
        }
        
        if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
          throw new StoicQuoteApiError('Network error - please check your internet connection')
        }

        // Log the actual error for debugging
        console.error('[StoicQuoteApiService] Fetch error:', error)
      }

      throw new StoicQuoteApiError('Unexpected error occurred while fetching quote')
    }
  }

  /**
   * Fetch multiple quotes with retry logic
   */
  async fetchMultipleQuotes(count: number = 5): Promise<StoicQuote[]> {
    const quotes: StoicQuote[] = []
    const maxRetries = 3
    
    for (let i = 0; i < count; i++) {
      let retries = 0
      
      while (retries < maxRetries) {
        try {
          const quote = await this.fetchQuote()
          
          // Ensure no duplicate quotes (check by text content)
          const isDuplicate = quotes.some(existingQuote => 
            existingQuote.text === quote.text
          )
          
          if (!isDuplicate) {
            quotes.push(quote)
            break
          } else {
            // If duplicate, try again (don't count as retry)
            console.log('Duplicate quote received, fetching another...')
          }
        } catch (error) {
          retries++
          console.warn(`Attempt ${retries} failed for quote ${i + 1}:`, error)
          
          if (retries >= maxRetries) {
            console.error(`Failed to fetch quote ${i + 1} after ${maxRetries} attempts`)
            // Continue to next quote instead of failing entirely
            break
          }
          
          // Exponential backoff for retries
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, retries) * 1000)
          )
        }
      }
    }

    if (quotes.length === 0) {
      throw new StoicQuoteApiError('Failed to fetch any quotes from the API')
    }

    return quotes
  }

  /**
   * Transform API response to internal quote format
   */
  private transformApiResponse(apiResponse: ApiQuoteResponse): StoicQuote {
    const { author, quote } = apiResponse.data
    
    // Generate a consistent ID based on content
    const id = this.generateQuoteId(quote, author)
    
    return {
      id,
      text: quote,
      author,
      source: undefined, // API doesn't provide source
      category: 'stoicism', // Default category for API quotes
      created_at: new Date().toISOString(),
      mood_tags: []
    }
  }

  /**
   * Generate a consistent ID for quotes based on content
   */
  private generateQuoteId(text: string, author: string): string {
    // Simple hash function for consistent IDs
    const content = `${text}|${author}`
    let hash = 0
    
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    return `api-quote-${Math.abs(hash)}`
  }

  /**
   * Get API service statistics
   */
  getStats() {
    return {
      requestCount: this.requestCount,
      lastRequestTime: this.lastRequestTime
    }
  }

  /**
   * Reset request statistics (useful for testing)
   */
  resetStats() {
    this.requestCount = 0
    this.lastRequestTime = 0
  }
}

// Export singleton instance
export const stoicQuoteApi = StoicQuoteApiService.getInstance()

// Expanded fallback quotes database for extended offline use
export const FALLBACK_QUOTES: StoicQuote[] = [
  {
    id: 'api-quote-fallback-1',
    text: "It's not what happens to you, but how you react to it that matters.",
    author: "Epictetus",
    source: "Discourses",
    category: "perspective",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-2',
    text: "You have power over your mind—not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
    source: "Meditations",
    category: "mindfulness",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-3',
    text: "The best revenge is not to be like your enemy.",
    author: "Marcus Aurelius",
    source: "Meditations",
    category: "virtue",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-4',
    text: "Wealth consists in not having great possessions, but in having few wants.",
    author: "Epictetus",
    category: "contentment",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-5',
    text: "The present moment is the only time over which we have dominion.",
    author: "Thích Nhất Hạnh",
    category: "mindfulness",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-6',
    text: "We suffer more often in imagination than in reality.",
    author: "Seneca",
    source: "Letters from a Stoic",
    category: "suffering",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-7',
    text: "The mind that is not baffled is not employed.",
    author: "Wendell Berry",
    category: "growth",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-8',
    text: "No person was ever honored for what he received. Honor has been the reward for what he gave.",
    author: "Calvin Coolidge",
    category: "service",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-9',
    text: "Don't explain your philosophy. Embody it.",
    author: "Epictetus",
    source: "Discourses",
    category: "action",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-10',
    text: "The happiness of your life depends upon the quality of your thoughts.",
    author: "Marcus Aurelius",
    source: "Meditations",
    category: "happiness",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-11',
    text: "First say to yourself what you would be; and then do what you have to do.",
    author: "Epictetus",
    source: "Discourses",
    category: "purpose",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-12',
    text: "Every new beginning comes from some other beginning's end.",
    author: "Seneca",
    source: "Letters from a Stoic",
    category: "change",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-13',
    text: "When we are no longer able to change a situation, we are challenged to change ourselves.",
    author: "Viktor Frankl",
    category: "adaptation",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-14',
    text: "Very little is needed to make a happy life; it is all within yourself, in your way of thinking.",
    author: "Marcus Aurelius",
    source: "Meditations",
    category: "happiness",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-15',
    text: "It is not the man who has too little, but the man who craves more, who is poor.",
    author: "Seneca",
    source: "Letters from a Stoic",
    category: "contentment",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-16',
    text: "The best way to take care of the future is to take care of the present moment.",
    author: "Thích Nhất Hạnh",
    category: "presence",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-17',
    text: "How much trouble he avoids who does not look to see what his neighbor says or does.",
    author: "Marcus Aurelius",
    source: "Meditations",
    category: "focus",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-18',
    text: "The art of living is more like wrestling than dancing.",
    author: "Marcus Aurelius",
    source: "Meditations",
    category: "resilience",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-19',
    text: "You become what you give your attention to.",
    author: "Epictetus",
    source: "Discourses",
    category: "attention",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-20',
    text: "True happiness is to enjoy the present, without anxious dependence upon the future.",
    author: "Seneca",
    source: "Letters from a Stoic",
    category: "happiness",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-21',
    text: "Confine yourself to the present.",
    author: "Marcus Aurelius",
    source: "Meditations",
    category: "presence",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-22',
    text: "The willing, destiny guides them. The unwilling, destiny drags them.",
    author: "Seneca",
    source: "Letters from a Stoic",
    category: "acceptance",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-23',
    text: "Be like the rocky headland on which the waves constantly break. It stands firm, and round it the seething waters are laid to rest.",
    author: "Marcus Aurelius",
    source: "Meditations",
    category: "steadiness",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-24',
    text: "No man is free who is not master of himself.",
    author: "Epictetus",
    source: "Discourses",
    category: "freedom",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-25',
    text: "Waste no more time arguing what a good man should be. Be one.",
    author: "Marcus Aurelius",
    source: "Meditations",
    category: "action",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-26',
    text: "The greatest remedy for anger is delay.",
    author: "Seneca",
    source: "Letters from a Stoic",
    category: "anger",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-27',
    text: "You are an actor in a play, which is as the author wants it to be.",
    author: "Epictetus",
    source: "Enchiridion",
    category: "acceptance",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-28',
    text: "The best revenge is massive success.",
    author: "Frank Sinatra",
    category: "success",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-29',
    text: "If you want to improve, be content to be thought foolish and stupid with regard to external things.",
    author: "Epictetus",
    source: "Enchiridion",
    category: "growth",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-30',
    text: "Loss is nothing else but change, and change is Nature's delight.",
    author: "Marcus Aurelius",
    source: "Meditations",
    category: "change",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-31',
    text: "It's not the load that breaks you down, it's the way you carry it.",
    author: "Lena Horne",
    category: "resilience",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-32',
    text: "The mind is everything. What you think you become.",
    author: "Buddha",
    category: "mindset",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-33',
    text: "A man's worth is measured by the worth of what he values.",
    author: "Marcus Aurelius",
    source: "Meditations",
    category: "values",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-34',
    text: "The brave may not live forever, but the cautious do not live at all.",
    author: "Richard Branson",
    category: "courage",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-35',
    text: "When you wake up in the morning, tell yourself: The people I deal with today will be meddling, ungrateful, arrogant, dishonest, jealous, and surly.",
    author: "Marcus Aurelius",
    source: "Meditations",
    category: "expectations",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-36',
    text: "He who laughs at himself never runs out of things to laugh at.",
    author: "Epictetus",
    source: "Discourses",
    category: "humor",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-37',
    text: "Nothing, to my way of thinking, is a better proof of a well-ordered mind than a man's ability to stop just where he is and pass some time in his own company.",
    author: "Seneca",
    source: "Letters from a Stoic",
    category: "solitude",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-38',
    text: "The universe is change; our life is what our thoughts make it.",
    author: "Marcus Aurelius",
    source: "Meditations",
    category: "perspective",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-39',
    text: "Freedom is the only worthy goal in life. It is won by disregarding things that lie beyond our control.",
    author: "Epictetus",
    source: "Discourses",
    category: "freedom",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-40',
    text: "Every moment we have a choice: to step forward into growth or to step back into safety.",
    author: "Abraham Maslow",
    category: "growth",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-41',
    text: "The obstacles in our path are not blocking us—they are redirecting us. Their purpose is not to interfere with our happiness; it is to point us toward new routes to our happiness.",
    author: "Barbara Johnson",
    category: "obstacles",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-42',
    text: "A ship in harbor is safe, but that is not what ships are built for.",
    author: "John A. Shedd",
    category: "courage",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-43',
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb",
    category: "action",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-44',
    text: "In the depth of winter, I finally learned that there was in me an invincible summer.",
    author: "Albert Camus",
    category: "resilience",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-45',
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
    category: "beginning",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-46',
    text: "Life is 10% what happens to you and 90% how you react to it.",
    author: "Charles R. Swindoll",
    category: "perspective",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-47',
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    category: "action",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-48',
    text: "Your limitation—it's only your imagination.",
    author: "Unknown",
    category: "potential",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-49',
    text: "Great things never come from comfort zones.",
    author: "Unknown",
    category: "growth",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'api-quote-fallback-50',
    text: "Dream it. Wish it. Do it.",
    author: "Unknown",
    category: "dreams",
    created_at: new Date().toISOString(),
    mood_tags: []
  }
]