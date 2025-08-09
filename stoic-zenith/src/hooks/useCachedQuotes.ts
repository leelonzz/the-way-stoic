'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
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
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([])
  const [error, setError] = useState<string | null>(null)

  // Use cache-aware query for quotes - Disable auto-refresh to prevent UI flicker
  const quotesQuery = useNavigationCachedQuery(
    ['quotes', 'all'],
    async (): Promise<Quote[]> => {
      
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('❌ [CachedQuotes] Supabase error:', error)
        return FALLBACK_QUOTES
      }
      
      // If no quotes from database, use fallback quotes
      if (!data || data.length === 0) {
        return FALLBACK_QUOTES
      }

      return data
    },
    {
      cacheThreshold: 30 * 60 * 1000, // 30 minutes - much longer cache to prevent auto-refresh
      staleTime: 60 * 60 * 1000, // 60 minutes stale time - prevent background refetching
      gcTime: 120 * 60 * 1000, // 120 minutes garbage collection
      refetchOnMount: false, // Don't refetch on component mount
      refetchOnWindowFocus: false, // Don't refetch when window gains focus
      refetchOnReconnect: false, // Don't refetch on network reconnection
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

  // Stable daily quote management to prevent UI flicker
  const [stableDailyQuote, setStableDailyQuote] = useState<Quote | null>(null)
  const [isQuoteInitialized, setIsQuoteInitialized] = useState(false)

  // Initialize daily quote once and keep it stable for the entire session
  useEffect(() => {
    if (isQuoteInitialized) return

    const today = new Date()
    const dayKey = today.toISOString().slice(0, 10)
    const storageKey = `twstoic:daily-quote:${dayKey}`
    const sessionKey = `twstoic:session-quote:${dayKey}`

    // Function to calculate daily quote deterministically
    const calculateDailyQuote = (quotes: Quote[]): Quote => {
      const dayOfYear = Math.floor(
        (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
      )
      return quotes[dayOfYear % quotes.length]
    }

    try {
      // First priority: Check sessionStorage for current session's stable quote
      if (typeof window !== 'undefined') {
        const sessionStored = sessionStorage.getItem(sessionKey)
        if (sessionStored) {
          const parsed: Quote = JSON.parse(sessionStored)
          setStableDailyQuote(parsed)
          setIsQuoteInitialized(true)
          return
        }
      }

      // Second priority: Check localStorage for today's cached quote
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          const parsed: Quote = JSON.parse(stored)
          setStableDailyQuote(parsed)
          setIsQuoteInitialized(true)
          
          // Also cache in session storage for stability
          try {
            sessionStorage.setItem(sessionKey, stored)
          } catch (e) {
            // ignore storage errors
          }
          return
        }
      }

      // Third priority: Use database quotes if available
      const availableQuotes = quotesQuery.data
      if (availableQuotes && availableQuotes.length > 0) {
        const dailyQuote = calculateDailyQuote(availableQuotes)
        setStableDailyQuote(dailyQuote)
        setIsQuoteInitialized(true)

        // Cache to both localStorage and sessionStorage
        if (typeof window !== 'undefined') {
          try {
            const quoteJson = JSON.stringify(dailyQuote)
            localStorage.setItem(storageKey, quoteJson)
            sessionStorage.setItem(sessionKey, quoteJson)
          } catch (e) {
            // ignore storage errors
          }
        }
        return
      }

      // Fourth priority: Use fallback quotes if no database quotes
      if (FALLBACK_QUOTES.length > 0) {
        const dailyQuote = calculateDailyQuote(FALLBACK_QUOTES)
        setStableDailyQuote(dailyQuote)
        setIsQuoteInitialized(true)

        // Cache fallback in session storage only (not localStorage)
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem(sessionKey, JSON.stringify(dailyQuote))
          } catch (e) {
            // ignore storage errors
          }
        }
        return
      }

    } catch (e) {
      console.warn('Error initializing daily quote:', e)
      // Fallback to first available quote
      const quotes = quotesQuery.data || FALLBACK_QUOTES
      if (quotes.length > 0) {
        setStableDailyQuote(quotes[0])
        setIsQuoteInitialized(true)
      }
    }
  }, [quotesQuery.data, isQuoteInitialized])

  // Update quote when database data becomes available (but only if we're using fallback)
  useEffect(() => {
    if (!isQuoteInitialized || !quotesQuery.data || quotesQuery.data.length === 0) return

    // Only update if current quote is from fallback quotes
    const isCurrentlyFallback = stableDailyQuote && FALLBACK_QUOTES.some(fq => fq.id === stableDailyQuote.id)

    if (isCurrentlyFallback) {
      const today = new Date()
      const dayKey = today.toISOString().slice(0, 10)
      const storageKey = `twstoic:daily-quote:${dayKey}`

      const dayOfYear = Math.floor(
        (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
      )
      const newDailyQuote = quotesQuery.data[dayOfYear % quotesQuery.data.length]

      setStableDailyQuote(newDailyQuote)

      // Cache the real quote
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, JSON.stringify(newDailyQuote))
        } catch (e) {
          // ignore storage errors
        }
      }
    }
  }, [quotesQuery.data, stableDailyQuote, isQuoteInitialized])

  // Expose the stable daily quote
  const getDailyQuote = useMemo(() => {
    return stableDailyQuote
  }, [stableDailyQuote])

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

  // Fetch saved quotes function
  const fetchSavedQuotes = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('saved_quotes')
        .select(`
          id,
          quote_text,
          author,
          source,
          tags,
          saved_at,
          personal_note,
          collection_name,
          is_favorite,
          date_saved,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false })

      if (error) throw error

      const transformedData = (data || []).map(item => ({
        id: item.id,
        quote_id: item.id,
        notes: item.personal_note,
        created_at: item.created_at,
        quote: {
          id: item.id,
          text: item.quote_text,
          author: item.author,
          source: item.source,
          category: 'general',
          created_at: item.created_at,
          mood_tags: item.tags || []
        }
      }))

      setSavedQuotes(transformedData)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch saved quotes:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch saved quotes')
    }
  }, [user])

  // Force refresh function
  const forceRefresh = async () => {
    await quotesQuery.refetch()
    if (user) {
      await fetchSavedQuotes()
    }
  }

  // Fetch saved quotes when user changes
  useEffect(() => {
    if (user) {
      fetchSavedQuotes()
    } else {
      setSavedQuotes([])
      setError(null)
    }
  }, [user, fetchSavedQuotes])

  return {
    quotes: quotesQuery.data || FALLBACK_QUOTES,
    savedQuotes: savedQuotes,
    userQuotes: [], // TODO: Implement user quotes with cache-aware query
    loading: quotesQuery.isLoading && !quotesQuery.data && !stableDailyQuote, // Don't show loading if we have cached data or stable quote
    error: error, // Don't show quote fetching errors to user, only save/unsave errors
    isRefetching: quotesQuery.isFetching && !!quotesQuery.data, // Only show refetching if we have data
    getDailyQuote: () => getDailyQuote,
    searchQuotes,
    getQuotesByCategory,
    forceRefresh,
    // Implement save/unsave functions
    saveQuote: async (quoteId: string, notes?: string) => {
      if (!user) {
        setError('User not authenticated')
        return false
      }

      if (!user.id || typeof user.id !== 'string' || user.id.length < 10) {
        setError('Invalid user session. Please log out and log back in.')
        return false
      }

      try {
        const quotes = quotesQuery.data || FALLBACK_QUOTES
        const quote = quotes.find(q => q.id === quoteId)
        if (!quote) {
          console.warn('❌ Quote not found for saving:', quoteId)
          return false
        }

        const alreadySaved = savedQuotes.some(saved => 
          saved.quote.text === quote.text && saved.quote.author === quote.author
        )
        if (alreadySaved) {
          setError('Quote already saved')
          return false
        }

        const { error } = await supabase
          .from('saved_quotes')
          .insert({
            user_id: user.id,
            quote_text: quote.text,
            author: quote.author,
            source: quote.source,
            tags: quote.mood_tags || [],
            personal_note: notes,
            is_favorite: false,
            saved_at: new Date().toISOString()
          })

        if (error) {
          console.error('Database error when saving quote:', error)
          if (error.message.includes('Key is not present in table') ||
              error.message.includes('violates foreign key constraint')) {
            setError('User session is invalid. Please log out and log back in.')
            return false
          }
          throw error
        }

        await fetchSavedQuotes()
        setError(null)
        return true
      } catch (err) {
        console.error('Failed to save quote:', err)
        setError(err instanceof Error ? err.message : 'Failed to save quote')
        return false
      }
    },
    unsaveQuote: async (quoteId: string) => {
      if (!user) return false

      try {
        
        // First, try to find the saved quote directly by its ID
        let savedQuote = savedQuotes.find(saved => saved.id === quoteId)
        
        // If not found by saved quote ID, try to match by quote ID or content
        if (!savedQuote) {
          // Try to find by quote_id
          savedQuote = savedQuotes.find(saved => saved.quote_id === quoteId)
          
          // If still not found, try to match by content (backward compatibility)
          if (!savedQuote) {
            const quotes = quotesQuery.data || FALLBACK_QUOTES
            const quote = quotes.find(q => q.id === quoteId)
            
            if (quote) {
              savedQuote = savedQuotes.find(saved => 
                saved.quote.text === quote.text && saved.quote.author === quote.author
              )
            }
          }
        }
        
        if (!savedQuote) {
          console.warn('❌ Saved quote not found for unsaving:', quoteId)
          setError('Saved quote not found')
          return false
        }
        

        const { error } = await supabase
          .from('saved_quotes')
          .delete()
          .eq('id', savedQuote.id)
          .eq('user_id', user.id)

        if (error) throw error
        
        await fetchSavedQuotes()
        setError(null)
        return true
      } catch (err) {
        console.error('Failed to unsave quote:', err)
        setError(err instanceof Error ? err.message : 'Failed to unsave quote')
        return false
      }
    },
    isQuoteSaved: (quoteId: string) => {
      // First check if this quoteId is a saved quote ID directly
      if (savedQuotes.some(saved => saved.id === quoteId)) {
        return true
      }
      
      // Check if this quoteId matches a saved quote's quote_id
      if (savedQuotes.some(saved => saved.quote_id === quoteId)) {
        return true
      }
      
      // Fall back to content matching for backward compatibility
      const quotes = quotesQuery.data || FALLBACK_QUOTES
      const quote = quotes.find(q => q.id === quoteId)
      if (!quote) return false
      
      return savedQuotes.some(saved => 
        saved.quote.text === quote.text && saved.quote.author === quote.author
      )
    },
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
    isQuoteStable: isQuoteInitialized,
    hasStableQuote: !!stableDailyQuote,
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
