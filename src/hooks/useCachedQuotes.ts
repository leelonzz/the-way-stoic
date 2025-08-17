'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import { useQuoteSession } from './useQuoteSession'
import { quotePrefetchService } from '@/services/quotePrefetchService'
import { supabase } from '@/integrations/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { StoicQuote } from '@/services/stoicQuoteApi'

// Re-export types for compatibility
export type Quote = StoicQuote

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

/**
 * Hook for managing quotes with API integration and session storage
 * Replaces database-driven quote system with external API
 */
export function useCachedQuotes(user: User | null) {
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([])
  const [error, setError] = useState<string | null>(null)

  // Use the quote session hook for API-driven quotes with pre-fetching
  const quoteSession = useQuoteSession({
    maxSessionQuotes: 200, // Increased to handle pre-fetched quotes
    maxReloadsPerDay: 50,
    backgroundFetchThreshold: 15 // Trigger background fetch when 15 quotes remaining
  })

  // Create a quotes array from session data for compatibility
  const quotes = useMemo(() => {
    return quoteSession.allSessionQuotes || []
  }, [quoteSession.allSessionQuotes])

  // Merge errors from session and local state
  const combinedError = useMemo(() => {
    return error || quoteSession.error || null
  }, [error, quoteSession.error])

  // Loading state - only show loading if we don't have any quotes yet
  const loading = useMemo(() => {
    return quoteSession.isLoading && (!quoteSession.currentQuote && !quoteSession.dailyFirstQuote)
  }, [quoteSession.isLoading, quoteSession.currentQuote, quoteSession.dailyFirstQuote])

  // User quotes still come from database (Supabase)
  const [userQuotes, setUserQuotes] = useState<UserQuote[]>([])
  const [userQuotesLoading, setUserQuotesLoading] = useState(false)

  // Fetch user quotes from Supabase
  const fetchUserQuotes = useCallback(async () => {
    if (!user) {
      setUserQuotes([])
      return
    }

    setUserQuotesLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_quotes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [CachedQuotes] User quotes error:', error)
        setUserQuotes([])
        return
      }
      
      setUserQuotes(data || [])
    } catch (err) {
      console.error('Failed to fetch user quotes:', err)
      setUserQuotes([])
    } finally {
      setUserQuotesLoading(false)
    }
  }, [user])

  // Fetch user quotes when user changes
  useEffect(() => {
    fetchUserQuotes()
  }, [fetchUserQuotes])

  // Daily quote comes from session's daily first quote with immediate fallback
  const getDailyQuote = useCallback(() => {
    // Return any available quote immediately
    const quote = quoteSession.dailyFirstQuote || quoteSession.currentQuote
    
    // If we have quotes but no current/daily quote, return the first one
    if (!quote && quotes.length > 0) {
      return quotes[0]
    }
    
    return quote
  }, [quoteSession.dailyFirstQuote, quoteSession.currentQuote, quotes])

  // Search quotes function - searches through session quotes
  const searchQuotes = useMemo(() => {
    return (searchTerm: string): Quote[] => {
      if (!searchTerm.trim()) return quotes

      const term = searchTerm.toLowerCase()
      return quotes.filter(quote =>
        quote.text.toLowerCase().includes(term) ||
        quote.author.toLowerCase().includes(term) ||
        quote.category.toLowerCase().includes(term) ||
        quote.source?.toLowerCase().includes(term)
      )
    }
  }, [quotes])

  // Get quotes by category - searches through session quotes
  const getQuotesByCategory = useMemo(() => {
    return (category: string): Quote[] => {
      return quotes.filter(quote => quote.category === category)
    }
  }, [quotes])

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

  // Force refresh function - clears cache and pre-fetched quotes, refreshes everything
  const forceRefresh = async () => {
    console.log('[CachedQuotes] Force refresh triggered - clearing all caches')
    quoteSession.clearSession()
    quotePrefetchService.clearCache()
    if (user) {
      await fetchSavedQuotes()
    }
    // Trigger fresh pre-fetch after clearing
    quotePrefetchService.backgroundFetch().catch(error => {
      console.warn('[CachedQuotes] Background pre-fetch after force refresh failed:', error)
    })
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
    quotes: quotes,
    savedQuotes: savedQuotes,
    userQuotes: userQuotes,
    loading: loading || userQuotesLoading,
    error: combinedError,
    isRefetching: quoteSession.isLoading && quotes.length > 0,
    getDailyQuote,
    searchQuotes,
    getQuotesByCategory,
    forceRefresh,
    // Expose quote session for navigation
    quoteSession: {
      currentQuote: quoteSession.currentQuote,
      currentIndex: quoteSession.currentIndex,
      totalQuotes: quoteSession.totalQuotes,
      allSessionQuotes: quoteSession.allSessionQuotes,
      goToNext: quoteSession.goToNext,
      goToPrevious: quoteSession.goToPrevious,
      goToIndex: quoteSession.goToIndex,
      canGoNext: quoteSession.canGoNext,
      canGoPrevious: quoteSession.canGoPrevious,
      isLoading: quoteSession.isLoading,
      error: quoteSession.error
    },
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
        // Use the quotes from session/API
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
      const quote = quotes.find(q => q.id === quoteId)
      if (!quote) return false
      
      return savedQuotes.some(saved => 
        saved.quote.text === quote.text && saved.quote.author === quote.author
      )
    },
    createUserQuote: async (quote: Omit<UserQuote, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user) {
        setError('User not authenticated')
        return false
      }

      try {
        const { error } = await supabase
          .from('user_quotes')
          .insert({
            user_id: user.id,
            text: quote.text,
            author: quote.author,
            source: quote.source,
            category: quote.category,
            mood_tags: quote.mood_tags,
            is_private: quote.is_private
          })

        if (error) throw error

        await fetchUserQuotes()
        setError(null)
        return true
      } catch (err) {
        console.error('Failed to create user quote:', err)
        setError(err instanceof Error ? err.message : 'Failed to create quote')
        return false
      }
    },
    updateUserQuote: async (id: string, updates: Partial<UserQuote>) => {
      if (!user) {
        setError('User not authenticated')
        return false
      }

      try {
        const { error } = await supabase
          .from('user_quotes')
          .update(updates)
          .eq('id', id)
          .eq('user_id', user.id)

        if (error) throw error

        await fetchUserQuotes()
        setError(null)
        return true
      } catch (err) {
        console.error('Failed to update user quote:', err)
        setError(err instanceof Error ? err.message : 'Failed to update quote')
        return false
      }
    },
    deleteUserQuote: async (id: string) => {
      if (!user) {
        setError('User not authenticated')
        return false
      }

      try {
        const { error } = await supabase
          .from('user_quotes')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)

        if (error) throw error

        await fetchUserQuotes()
        setError(null)
        return true
      } catch (err) {
        console.error('Failed to delete user quote:', err)
        setError(err instanceof Error ? err.message : 'Failed to delete quote')
        return false
      }
    },
    refreshDailyQuote: async () => {
      return await quoteSession.reloadCurrentQuote()
    },
    reloadCount: quoteSession.reloadCount,
    maxReloads: quoteSession.maxReloads,
    canReload: quoteSession.canReload,
    // Additional useful properties
    isCached: quotes.length > 0 && !quoteSession.isLoading,
    lastUpdated: quoteSession.lastFetchTime,
    // Pre-fetch service status
    prefetchStatus: quotePrefetchService.getStatus(),
    triggerPrefetch: () => {
      quotePrefetchService.backgroundFetch().catch(error => {
        console.warn('[CachedQuotes] Manual pre-fetch failed:', error)
      })
    },
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
