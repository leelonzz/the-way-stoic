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

// Fallback quotes in case API is unavailable - use api-quote- prefix for consistency
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
  }
]