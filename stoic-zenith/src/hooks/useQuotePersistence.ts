'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Quote } from './useCachedQuotes'

interface QuoteState {
  currentQuoteId: string | null
  searchTerm: string
  selectedCategory: string | null
  activeTab: string
  carouselIndex: number
  randomizedQuoteIds: string[] // Store user's randomized quote order
  randomSeed: string | null // Store seed for consistent randomization
}

interface QuotePersistenceOptions {
  storageKey?: string
  persistAcrossSessions?: boolean
  userId?: string | null // Add user ID for user-specific randomization
}

const DEFAULT_STATE: QuoteState = {
  currentQuoteId: null,
  searchTerm: '',
  selectedCategory: null,
  activeTab: 'library',
  carouselIndex: 0,
  randomizedQuoteIds: [],
  randomSeed: null
}

/**
 * Hook for persisting quote viewing state across page reloads and browser sessions
 * Handles quote carousel position, search state, category filtering, and current quote
 */
/**
 * Simple seeded random number generator for consistent randomization
 */
function seededRandom(seed: string): () => number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }

  return function() {
    hash = ((hash * 1103515245) + 12345) & 0x7fffffff
    return hash / 0x7fffffff
  }
}

/**
 * Shuffle array using seeded random for consistent results per user
 */
function shuffleWithSeed<T>(array: T[], seed: string): T[] {
  const shuffled = [...array]
  const random = seededRandom(seed)

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

export function useQuotePersistence(
  quotes: Quote[] = [],
  options: QuotePersistenceOptions = {}
) {
  const {
    storageKey = 'twstoic:quote-state',
    persistAcrossSessions = true,
    userId = null
  } = options

  // Track if we're still waiting for quotes to load
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize state from localStorage
  const [state, setState] = useState<QuoteState>(() => {
    if (typeof window === 'undefined') return DEFAULT_STATE

    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsedState = JSON.parse(stored) as QuoteState
        console.log(`[useQuotePersistence] Loaded state from ${storageKey}:`, parsedState)
        return { ...DEFAULT_STATE, ...parsedState }
      }
    } catch (error) {
      console.warn(`[useQuotePersistence] Failed to parse stored quote state from ${storageKey}:`, error)
    }

    console.log(`[useQuotePersistence] Using default state for ${storageKey}`)
    return DEFAULT_STATE
  })

  // Persist state to localStorage whenever it changes
  const persistState = useCallback((newState: Partial<QuoteState>) => {
    if (typeof window === 'undefined') return

    const updatedState = { ...state, ...newState }
    console.log(`[useQuotePersistence] Persisting state to ${storageKey}:`, updatedState)
    setState(updatedState)

    if (persistAcrossSessions) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedState))
        console.log(`[useQuotePersistence] Successfully saved to localStorage`)
      } catch (error) {
        console.warn(`[useQuotePersistence] Failed to persist quote state to ${storageKey}:`, error)
      }
    }
  }, [state, storageKey, persistAcrossSessions])

  // Find current quote based on stored ID
  const getCurrentQuote = useCallback((): Quote | null => {
    if (!state.currentQuoteId || quotes.length === 0) {
      console.log(`[useQuotePersistence] No current quote ID or no quotes available`, {
        currentQuoteId: state.currentQuoteId,
        quotesLength: quotes.length
      })
      return null
    }

    const quote = quotes.find(q => q.id === state.currentQuoteId)
    if (quote) {
      console.log(`[useQuotePersistence] Found current quote:`, quote.text.substring(0, 50) + '...')
      return quote
    }

    // If stored quote doesn't exist anymore, clear it and return first quote
    console.log(`[useQuotePersistence] Stored quote ID ${state.currentQuoteId} not found, resetting to first quote`)
    if (state.currentQuoteId) {
      persistState({ currentQuoteId: null, carouselIndex: 0 })
    }

    return quotes[0] || null
  }, [state.currentQuoteId, quotes, persistState])

  // Get carousel index for current quote
  const getCurrentIndex = useCallback((): number => {
    if (!state.currentQuoteId || quotes.length === 0) return 0

    const index = quotes.findIndex(q => q.id === state.currentQuoteId)
    return index >= 0 ? index : 0
  }, [state.currentQuoteId, quotes])

  // Set current quote and update index
  const setCurrentQuote = useCallback((quote: Quote | null, index?: number) => {
    const newIndex = index !== undefined ? index : (quote ? quotes.findIndex(q => q.id === quote.id) : 0)
    persistState({
      currentQuoteId: quote?.id || null,
      carouselIndex: Math.max(0, newIndex)
    })
  }, [quotes, persistState])

  // Set carousel index and update current quote
  const setCarouselIndex = useCallback((index: number) => {
    if (quotes.length === 0) return

    const clampedIndex = Math.max(0, Math.min(index, quotes.length - 1))
    const quote = quotes[clampedIndex]
    
    persistState({
      currentQuoteId: quote?.id || null,
      carouselIndex: clampedIndex
    })
  }, [quotes, persistState])

  // Set search term
  const setSearchTerm = useCallback((searchTerm: string) => {
    persistState({ searchTerm })
  }, [persistState])

  // Set selected category
  const setSelectedCategory = useCallback((category: string | null) => {
    persistState({ selectedCategory: category })
  }, [persistState])

  // Set active tab
  const setActiveTab = useCallback((tab: string) => {
    persistState({ activeTab: tab })
  }, [persistState])

  // Clear all persisted state
  const clearPersistedState = useCallback(() => {
    setState(DEFAULT_STATE)
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(storageKey)
      } catch (error) {
        console.warn('Failed to clear persisted quote state:', error)
      }
    }
  }, [storageKey])

  // Get filtered quotes based on current search and category (using randomized order)
  const getFilteredQuotes = useCallback((allQuotes: Quote[]): Quote[] => {
    // Start with randomized order for this user
    const randomizedQuotes = getRandomizedQuotes()
    let filtered = randomizedQuotes.length > 0 ? randomizedQuotes : allQuotes

    // Apply category filter
    if (state.selectedCategory) {
      filtered = filtered.filter(quote => quote.category === state.selectedCategory)
    }

    // Apply search filter
    if (state.searchTerm.trim()) {
      const searchLower = state.searchTerm.toLowerCase()
      filtered = filtered.filter(quote =>
        quote.text.toLowerCase().includes(searchLower) ||
        quote.author.toLowerCase().includes(searchLower) ||
        (quote.source && quote.source.toLowerCase().includes(searchLower)) ||
        quote.category.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }, [state.selectedCategory, state.searchTerm, getRandomizedQuotes])

  // Get randomized quotes for this user
  const getRandomizedQuotes = useCallback((): Quote[] => {
    if (quotes.length === 0) return []

    // If we have a stored randomized order and it matches current quotes, use it
    if (state.randomizedQuoteIds.length === quotes.length && state.randomSeed) {
      const randomizedQuotes = state.randomizedQuoteIds
        .map(id => quotes.find(q => q.id === id))
        .filter(Boolean) as Quote[]

      // Verify all quotes are still valid
      if (randomizedQuotes.length === quotes.length) {
        return randomizedQuotes
      }
    }

    // Create new randomized order for this user
    const seed = userId ? `user-${userId}-${quotes.length}` : `anonymous-${Date.now()}`
    const randomizedQuotes = shuffleWithSeed(quotes, seed)
    const randomizedIds = randomizedQuotes.map(q => q.id)

    console.log(`[useQuotePersistence] Creating randomized quote order for user:`, {
      userId: userId || 'anonymous',
      seed,
      totalQuotes: quotes.length,
      firstQuote: randomizedQuotes[0]?.text.substring(0, 50) + '...'
    })

    // Persist the randomized order
    persistState({
      randomizedQuoteIds: randomizedIds,
      randomSeed: seed
    })

    return randomizedQuotes
  }, [quotes, state.randomizedQuoteIds, state.randomSeed, userId, persistState])

  // Initialize current quote when quotes are loaded
  useEffect(() => {
    if (quotes.length > 0) {
      if (!isInitialized) {
        console.log(`[useQuotePersistence] Initializing with ${quotes.length} quotes for user:`, userId || 'anonymous')
        setIsInitialized(true)
      }

      const randomizedQuotes = getRandomizedQuotes()

      if (!state.currentQuoteId) {
        // Set first quote from randomized order as default
        const firstQuote = randomizedQuotes[0]
        if (firstQuote) {
          console.log(`[useQuotePersistence] Setting initial randomized quote:`, firstQuote.text.substring(0, 50) + '...')
          persistState({
            currentQuoteId: firstQuote.id,
            carouselIndex: 0
          })
        }
      } else {
        // Verify the current quote still exists
        const currentQuote = quotes.find(q => q.id === state.currentQuoteId)
        if (!currentQuote) {
          console.log(`[useQuotePersistence] Current quote ${state.currentQuoteId} no longer exists, resetting to randomized first`)
          const firstQuote = randomizedQuotes[0]
          if (firstQuote) {
            persistState({
              currentQuoteId: firstQuote.id,
              carouselIndex: 0
            })
          }
        }
      }
    }
  }, [quotes, state.currentQuoteId, persistState, isInitialized, userId, getRandomizedQuotes])

  // Validate and fix carousel index when quotes change
  useEffect(() => {
    if (quotes.length > 0 && state.carouselIndex >= quotes.length) {
      persistState({ carouselIndex: 0 })
    }
  }, [quotes.length, state.carouselIndex, persistState])

  return {
    // Current state
    currentQuoteId: state.currentQuoteId,
    searchTerm: state.searchTerm,
    selectedCategory: state.selectedCategory,
    activeTab: state.activeTab,
    carouselIndex: state.carouselIndex,

    // Computed values
    currentQuote: getCurrentQuote(),
    currentIndex: getCurrentIndex(),

    // State setters
    setCurrentQuote,
    setCarouselIndex,
    setSearchTerm,
    setSelectedCategory,
    setActiveTab,

    // Utility functions
    getFilteredQuotes,
    getRandomizedQuotes,
    clearPersistedState,

    // Helper for checking if state is persisted
    hasPersistedState: state.currentQuoteId !== null || state.searchTerm !== '' || state.selectedCategory !== null,

    // Initialization state
    isInitialized,

    // Randomization info
    randomSeed: state.randomSeed,
    hasRandomizedOrder: state.randomizedQuoteIds.length > 0
  }
}
