import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

interface ApiQuoteResponse {
  data: {
    author: string
    quote: string
  }
}

interface StoicQuote {
  id: string
  text: string
  author: string
  source?: string
  category: string
  created_at: string
  mood_tags?: string[]
}

const API_BASE_URL = 'https://stoic.tekloon.net'
const API_TIMEOUT = 10000 // 10 seconds

// Fallback quotes in case API fails
const FALLBACK_QUOTES: StoicQuote[] = [
  {
    id: 'fallback-1',
    text: 'You have power over your mind - not outside events. Realize this, and you will find strength.',
    author: 'Marcus Aurelius',
    source: 'Meditations',
    category: 'wisdom',
    created_at: new Date().toISOString(),
    mood_tags: ['strength', 'mindfulness'],
  },
  {
    id: 'fallback-2',
    text: 'The best revenge is not to be like your enemy.',
    author: 'Marcus Aurelius',
    source: 'Meditations',
    category: 'wisdom',
    created_at: new Date().toISOString(),
    mood_tags: ['forgiveness', 'wisdom'],
  },
  {
    id: 'fallback-3',
    text: 'It is not what happens to you, but how you react to it that matters.',
    author: 'Epictetus',
    source: 'Discourses',
    category: 'resilience',
    created_at: new Date().toISOString(),
    mood_tags: ['resilience', 'perspective'],
  },
]

function cleanQuoteText(text: string): string {
  let cleanText = text.trim()

  // Remove common patterns of author names and artifacts at the end of quotes

  // Pattern 1: Remove "@." at the end (appears to be an API artifact)
  cleanText = cleanText.replace(/\s*@\.\s*$/, '')

  // Pattern 2: Quote ending with ". Name" or ". Name."
  cleanText = cleanText.replace(/\.\s+[A-Z][a-zA-Z]*\.?\s*$/, '.')

  // Pattern 3: Quote ending with " Name" or " Name." (without period before name)
  cleanText = cleanText.replace(/\s+[A-Z][a-zA-Z]*\.?\s*$/, '')

  // Pattern 4: Quote ending with ", Name" or ", Name."
  cleanText = cleanText.replace(/,\s+[A-Z][a-zA-Z]*\.?\s*$/, '')

  // Pattern 5: Quote ending with "— Name" or "- Name"
  cleanText = cleanText.replace(/[—-]\s*[A-Z][a-zA-Z]*\.?\s*$/, '')

  // Pattern 6: More specific patterns for multi-word names like "William B."
  cleanText = cleanText.replace(/\s+[A-Z][a-zA-Z]*\s+[A-Z]\.?\s*$/, '')

  // Pattern 7: Remove social media handles and symbols at end
  cleanText = cleanText.replace(/\s*[@#]\w*\.?\s*$/, '')

  // Ensure the quote ends with proper punctuation
  if (cleanText && !cleanText.match(/[.!?]$/)) {
    cleanText += '.'
  }

  return cleanText
}

function transformApiResponse(data: ApiQuoteResponse): StoicQuote {
  const quoteId = `api-quote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  return {
    id: quoteId,
    text: cleanQuoteText(data.data.quote),
    author: data.data.author.trim(),
    source: 'Stoic Philosophy',
    category: 'wisdom',
    created_at: new Date().toISOString(),
    mood_tags: ['wisdom', 'philosophy'],
  }
}

export async function GET(request: NextRequest) {
  try {
    // Add CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json',
    }

    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    try {
      console.log('[Stoic API Proxy] Fetching quote from external API...')

      const response = await fetch(`${API_BASE_URL}/stoic-quote`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'StoicZenith/1.0',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.warn(
          `[Stoic API Proxy] API returned ${response.status}: ${response.statusText}`
        )
        throw new Error(`API request failed: ${response.status}`)
      }

      const data: ApiQuoteResponse = await response.json()

      if (!data.data || !data.data.quote || !data.data.quote.trim()) {
        console.warn('[Stoic API Proxy] Invalid API response format:', data)
        throw new Error('Invalid API response format')
      }

      // If author is empty, use a default
      if (!data.data.author || !data.data.author.trim()) {
        data.data.author = 'Unknown'
      }

      // Transform and return the quote
      const transformedQuote = transformApiResponse(data)
      console.log(
        '[Stoic API Proxy] Successfully fetched quote:',
        transformedQuote.id
      )

      return NextResponse.json(transformedQuote, { headers })
    } catch (fetchError) {
      console.error('[Stoic API Proxy] External API error:', fetchError)

      // Return a random fallback quote
      const randomIndex = Math.floor(Math.random() * FALLBACK_QUOTES.length)
      const fallbackQuote = {
        ...FALLBACK_QUOTES[randomIndex],
        id: `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
      }

      console.log('[Stoic API Proxy] Using fallback quote:', fallbackQuote.id)

      return NextResponse.json(fallbackQuote, {
        headers: {
          ...headers,
          'X-Fallback': 'true',
        },
      })
    }
  } catch (error) {
    console.error('[Stoic API Proxy] Unexpected error:', error)

    // Return the first fallback quote as last resort
    const fallbackQuote = {
      ...FALLBACK_QUOTES[0],
      id: `emergency-fallback-${Date.now()}`,
      created_at: new Date().toISOString(),
    }

    return NextResponse.json(fallbackQuote, {
      status: 200, // Still return 200 since we have a fallback
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'X-Fallback': 'true',
        'X-Emergency': 'true',
      },
    })
  }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
