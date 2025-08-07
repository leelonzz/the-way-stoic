'use client'

import { useMemo } from 'react'
import { useNavigationCachedQuery } from './useCacheAwareQuery'
import { supabase } from '@/integrations/supabase/client'
import type { User } from '@supabase/supabase-js'

export interface Quote {
  id: string
  text: string
  author: string
  source?: string
  category: string
  created_at: string
  mood_tags?: string[]
}

export interface SavedQuote {
  id: string
  quote_id: string
  notes?: string
  created_at: string
  quote: Quote
}

export interface UserQuote {
  id: string
  text: string
  author: string
  source?: string
  category: string
  mood_tags: string[]
  is_private: boolean
  created_at: string
  updated_at: string
}

// Fallback quotes in case database is unavailable
const FALLBACK_QUOTES: Quote[] = [
  {
    id: 'fallback-1',
    text: "It's not what happens to you, but how you react to it that matters.",
    author: "Epictetus",
    source: "Discourses",
    category: "perspective",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'fallback-2',
    text: "You have power over your mind—not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
    source: "Meditations",
    category: "mindfulness",
    created_at: new Date().toISOString(),
    mood_tags: []
  },
  {
    id: 'fallback-3',
    text: "The best revenge is not to be like your enemy.",
    author: "Marcus Aurelius",
    source: "Meditations",
    category: "virtue",
    created_at: new Date().toISOString(),
    mood_tags: []
  }
]

/**
 * Cache-aware quotes hook that respects page navigation cache
 * Prevents redundant API calls when navigating between cached pages
 */
export function useCachedQuotes(user: User | null) {
  // Use cache-aware query for quotes
  const quotesQuery = useNavigationCachedQuery(
    ['quotes', 'all'],
    async (): Promise<Quote[]> => {
      console.log('🔄 [CachedQuotes] Fetching quotes from Supabase...')
      
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('✅ [CachedQuotes] Quotes fetched successfully:', data?.length || 0, 'quotes')
      
      // If no quotes from database, use fallback quotes
      if (!data || data.length === 0) {
        console.log('📝 [CachedQuotes] No quotes from database, using fallback quotes')
        return FALLBACK_QUOTES
      }

      return data
    },
    {
      cacheThreshold: 10 * 60 * 1000, // 10 minutes - longer cache for quotes
      staleTime: 15 * 60 * 1000, // 15 minutes stale time
      gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
      retry: (failureCount, error) => {
        // Don't retry on auth errors, but retry on network errors
        if (error?.message?.includes('auth') || error?.message?.includes('permission')) {
          return false
        }
        return failureCount < 2
      },
      // Use fallback data on error
      placeholderData: FALLBACK_QUOTES,
    }
  )

  // Get daily quote with memoization
  const getDailyQuote = useMemo(() => {
    const quotes = quotesQuery.data || FALLBACK_QUOTES
    if (quotes.length === 0) return null

    // Calculate daily quote based on day of year
    const today = new Date()
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    return quotes[dayOfYear % quotes.length]
  }, [quotesQuery.data])

  // Search quotes function
  const searchQuotes = useMemo(() => {
    return (searchTerm: string): Quote[] => {
      const quotes = quotesQuery.data || FALLBACK_QUOTES
      if (!searchTerm.trim()) return quotes

      const term = searchTerm.toLowerCase()
      return quotes.filter(quote =>
        quote.text.toLowerCase().includes(term) ||
        quote.author.toLowerCase().includes(term) ||
        quote.category.toLowerCase().includes(term) ||
        quote.source?.toLowerCase().includes(term)
      )
    }
  }, [quotesQuery.data])

  // Get quotes by category
  const getQuotesByCategory = useMemo(() => {
    return (category: string): Quote[] => {
      const quotes = quotesQuery.data || FALLBACK_QUOTES
      return quotes.filter(quote => quote.category === category)
    }
  }, [quotesQuery.data])

  // Force refresh function
  const forceRefresh = async () => {
    console.log('🔄 [CachedQuotes] Force refresh requested')
    await quotesQuery.refetch()
  }

  return {
    quotes: quotesQuery.data || FALLBACK_QUOTES,
    savedQuotes: [], // TODO: Implement saved quotes with cache-aware query
    userQuotes: [], // TODO: Implement user quotes with cache-aware query
    loading: quotesQuery.isLoading && !quotesQuery.data, // Don't show loading if we have cached data
    error: quotesQuery.error?.message || null,
    isRefetching: quotesQuery.isFetching && !!quotesQuery.data, // Only show refetching if we have data
    getDailyQuote: () => getDailyQuote,
    searchQuotes,
    getQuotesByCategory,
    forceRefresh,
    // Placeholder functions for compatibility
    saveQuote: async (_quoteId: string, _notes?: string) => {
      console.warn('saveQuote not implemented in cached version')
      return false
    },
    unsaveQuote: async (_quoteId: string) => {
      console.warn('unsaveQuote not implemented in cached version')
      return false
    },
    isQuoteSaved: (_quoteId: string) => false,
    createUserQuote: async (_quote: Omit<UserQuote, 'id' | 'created_at' | 'updated_at'>) => {
      console.warn('createUserQuote not implemented in cached version')
      return false
    },
    updateUserQuote: async (_id: string, _updates: Partial<UserQuote>) => {
      console.warn('updateUserQuote not implemented in cached version')
      return false
    },
    deleteUserQuote: async (_id: string) => {
      console.warn('deleteUserQuote not implemented in cached version')
      return false
    },
    refreshDailyQuote: () => getDailyQuote,
    reloadCount: 0,
    maxReloads: 10,
    canReload: true,
    // Additional useful properties
    isCached: !quotesQuery.isLoading && !!quotesQuery.data,
    lastUpdated: quotesQuery.dataUpdatedAt,
  }
}

/**
 * Lightweight hook for just the daily quote (used in HomePage)
 */
export function useDailyQuote(user: User | null) {
  const { getDailyQuote, loading, error } = useCachedQuotes(user)
  
  return {
    dailyQuote: getDailyQuote(),
    loading,
    error,
  }
}
