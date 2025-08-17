'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { stoicQuoteApi, type StoicQuote, FALLBACK_QUOTES } from '@/services/stoicQuoteApi'
import { quotePrefetchService } from '@/services/quotePrefetchService'
import { dailyQuoteCache, type DailyQuoteCache } from '@/services/dailyQuoteCache'

interface QuoteSessionData {
  quotes: StoicQuote[]
  currentIndex: number
  dailyFirstQuote: StoicQuote | null
  lastFetchTime: number
  sessionStartTime: number
  reloadCount: number
}

interface QuoteSessionOptions {
  maxSessionQuotes?: number
  sessionStorageKey?: string
  dailyStorageKey?: string
  reloadStorageKey?: string
  maxReloadsPerDay?: number
  backgroundFetchThreshold?: number
}

const DEFAULT_OPTIONS: Required<QuoteSessionOptions> = {
  maxSessionQuotes: 500,
  sessionStorageKey: 'twstoic:quote-session',
  dailyStorageKey: 'twstoic:daily-quote',
  reloadStorageKey: 'twstoic:reload-count',
  maxReloadsPerDay: 50,
  backgroundFetchThreshold: 15
}

// Memory management constants
const MEMORY_WINDOW_SIZE = 200 // Keep only recent 200 quotes in memory
const MEMORY_CLEANUP_THRESHOLD = 250 // Start cleanup when we have more than this many quotes

// Add localStorage key for persistent session data
const PERSISTENT_SESSION_KEY = 'twstoic:persistent-session'

/**
 * Hook for managing quote sessions with API integration
 * Handles session storage, daily resets, and navigation history
 */
export function useQuoteSession(options: QuoteSessionOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dailyCache, setDailyCache] = useState<DailyQuoteCache | null>(null)
  const isInitialized = useRef(false)

  // Initialize session state
  const [sessionData, setSessionData] = useState<QuoteSessionData>(() => {
    if (typeof window === 'undefined') {
      return {
        quotes: [],
        currentIndex: 0,
        dailyFirstQuote: null,
        lastFetchTime: 0,
        sessionStartTime: Date.now(),
        reloadCount: 0
      }
    }

    // First try to load from localStorage (persistent across page reloads)
    try {
      const todayKey = new Date().toISOString().slice(0, 10)
      const persistentStored = localStorage.getItem(`${PERSISTENT_SESSION_KEY}:${todayKey}`)
      
      if (persistentStored) {
        const persistentParsed = JSON.parse(persistentStored) as QuoteSessionData
        
        if (persistentParsed.quotes && Array.isArray(persistentParsed.quotes)) {
          console.log('[useQuoteSession] Restoring session from localStorage:', {
            quotesCount: persistentParsed.quotes.length,
            currentIndex: persistentParsed.currentIndex,
            sessionStartTime: persistentParsed.sessionStartTime
          })
          return {
            ...persistentParsed,
            currentIndex: persistentParsed.currentIndex || 0,
            sessionStartTime: persistentParsed.sessionStartTime || Date.now()
          }
        }
      }
    } catch (error) {
      console.warn('Failed to parse persistent session data:', error)
    }

    // Fallback to sessionStorage if localStorage doesn't have valid data
    try {
      const stored = sessionStorage.getItem(opts.sessionStorageKey)
      if (stored) {
        const parsed = JSON.parse(stored) as QuoteSessionData
        
        // Validate session data and preserve currentIndex
        if (parsed.quotes && Array.isArray(parsed.quotes)) {
          console.log('[useQuoteSession] Restoring session from sessionStorage:', {
            quotesCount: parsed.quotes.length,
            currentIndex: parsed.currentIndex,
            sessionStartTime: parsed.sessionStartTime
          })
          return {
            ...parsed,
            currentIndex: parsed.currentIndex || 0, // Preserve the current index
            sessionStartTime: parsed.sessionStartTime || Date.now()
          }
        }
      }
    } catch (error) {
      console.warn('Failed to parse session storage data:', error)
    }

    return {
      quotes: [],
      currentIndex: 0,
      dailyFirstQuote: null,
      lastFetchTime: 0,
      sessionStartTime: Date.now(),
      reloadCount: 0
    }
  })

  // Get today's key for daily storage
  const getTodayKey = useCallback(() => {
    return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  }, [])

  // Load persistent session from localStorage
  const loadPersistentSession = useCallback((): QuoteSessionData | null => {
    if (typeof window === 'undefined') return null

    try {
      const todayKey = getTodayKey()
      const stored = localStorage.getItem(`${PERSISTENT_SESSION_KEY}:${todayKey}`)
      
      if (stored) {
        const parsed = JSON.parse(stored) as QuoteSessionData
        console.log('[useQuoteSession] Loaded persistent session:', {
          quotesCount: parsed.quotes.length,
          currentIndex: parsed.currentIndex,
          sessionStartTime: parsed.sessionStartTime
        })
        return parsed
      }
    } catch (error) {
      console.warn('Failed to load persistent session:', error)
    }

    return null
  }, [getTodayKey])

  // Save persistent session to localStorage
  const savePersistentSession = useCallback((data: QuoteSessionData) => {
    if (typeof window === 'undefined') return

    try {
      const todayKey = getTodayKey()
      localStorage.setItem(`${PERSISTENT_SESSION_KEY}:${todayKey}`, JSON.stringify(data))
      console.log('[useQuoteSession] Saved persistent session:', {
        quotesCount: data.quotes.length,
        currentIndex: data.currentIndex
      })
    } catch (error) {
      console.warn('Failed to save persistent session:', error)
    }
  }, [getTodayKey])

  // Load daily first quote from localStorage
  const loadDailyFirstQuote = useCallback((): StoicQuote | null => {
    if (typeof window === 'undefined') return null

    try {
      const todayKey = getTodayKey()
      const stored = localStorage.getItem(`${opts.dailyStorageKey}:${todayKey}`)
      
      if (stored) {
        return JSON.parse(stored) as StoicQuote
      }
    } catch (error) {
      console.warn('Failed to load daily first quote:', error)
    }

    return null
  }, [opts.dailyStorageKey, getTodayKey])

  // Save daily first quote to localStorage
  const saveDailyFirstQuote = useCallback((quote: StoicQuote) => {
    if (typeof window === 'undefined') return

    try {
      const todayKey = getTodayKey()
      localStorage.setItem(`${opts.dailyStorageKey}:${todayKey}`, JSON.stringify(quote))
    } catch (error) {
      console.warn('Failed to save daily first quote:', error)
    }
  }, [opts.dailyStorageKey, getTodayKey])

  // Load reload count for today
  const loadReloadCount = useCallback((): number => {
    if (typeof window === 'undefined') return 0

    try {
      const todayKey = getTodayKey()
      const stored = localStorage.getItem(`${opts.reloadStorageKey}:${todayKey}`)
      return stored ? parseInt(stored, 10) : 0
    } catch (error) {
      console.warn('Failed to load reload count:', error)
      return 0
    }
  }, [opts.reloadStorageKey, getTodayKey])

  // Save reload count for today
  const saveReloadCount = useCallback((count: number) => {
    if (typeof window === 'undefined') return

    try {
      const todayKey = getTodayKey()
      localStorage.setItem(`${opts.reloadStorageKey}:${todayKey}`, count.toString())
    } catch (error) {
      console.warn('Failed to save reload count:', error)
    }
  }, [opts.reloadStorageKey, getTodayKey])

  // Persist session data to both sessionStorage and localStorage
  const persistSessionData = useCallback((data: QuoteSessionData) => {
    if (typeof window === 'undefined') return

    try {
      // Save to sessionStorage for immediate access
      sessionStorage.setItem(opts.sessionStorageKey, JSON.stringify(data))
      // Save to localStorage for persistence across page reloads
      savePersistentSession(data)
    } catch (error) {
      console.warn('Failed to persist session data:', error)
    }
  }, [opts.sessionStorageKey, savePersistentSession])

  // Memory cleanup function to manage sliding window
  const cleanupOldQuotes = useCallback((quotes: StoicQuote[], currentIndex: number): { quotes: StoicQuote[], newIndex: number } => {
    if (quotes.length <= MEMORY_CLEANUP_THRESHOLD) {
      return { quotes, newIndex: currentIndex }
    }

    // Calculate how many quotes to remove from the beginning
    const quotesToRemove = quotes.length - MEMORY_WINDOW_SIZE
    if (quotesToRemove <= 0) {
      return { quotes, newIndex: currentIndex }
    }

    // Don't remove quotes if current index is in the removal range
    // Keep at least 50 quotes before current position if possible
    const safeRemovalCount = Math.min(quotesToRemove, Math.max(0, currentIndex - 50))
    
    if (safeRemovalCount <= 0) {
      return { quotes, newIndex: currentIndex }
    }

    console.log(`[useQuoteSession] Cleaning up ${safeRemovalCount} old quotes to manage memory`)
    const cleanedQuotes = quotes.slice(safeRemovalCount)
    const newIndex = currentIndex - safeRemovalCount

    return { 
      quotes: cleanedQuotes, 
      newIndex: Math.max(0, newIndex) 
    }
  }, [])

  // Update session state and persist
  const updateSessionData = useCallback((updater: (prev: QuoteSessionData) => QuoteSessionData) => {
    setSessionData(prev => {
      const updated = updater(prev)
      
      // Apply memory management if needed
      if (updated.quotes.length > MEMORY_CLEANUP_THRESHOLD) {
        const { quotes: cleanedQuotes, newIndex } = cleanupOldQuotes(updated.quotes, updated.currentIndex)
        const finalUpdated = {
          ...updated,
          quotes: cleanedQuotes,
          currentIndex: newIndex
        }
        persistSessionData(finalUpdated)
        return finalUpdated
      }
      
      persistSessionData(updated)
      return updated
    })
  }, [persistSessionData, cleanupOldQuotes])

  // Fetch a new quote from API
  const fetchNewQuote = useCallback(async (): Promise<StoicQuote | null> => {
    try {
      setError(null)
      const quote = await stoicQuoteApi.fetchQuote()
      
      // Check if we already have this quote in session
      const isDuplicate = sessionData.quotes.some(existing => existing.id === quote.id)
      
      if (isDuplicate) {
        // If duplicate, try fetching another one
        console.log('[useQuoteSession] Duplicate quote received, fetching another...')
        return await stoicQuoteApi.fetchQuote()
      }
      
      console.log('[useQuoteSession] Successfully fetched new quote:', quote.id)
      return quote
    } catch (error) {
      console.error('[useQuoteSession] Failed to fetch quote from API:', error)
      
      // Set a more user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch quote'
      if (errorMessage.includes('Network error')) {
        setError('Unable to connect to the internet. Using offline quotes.')
      } else if (errorMessage.includes('timeout')) {
        setError('Request timed out. Using offline quotes.')
      } else {
        setError('Quote service unavailable. Using offline quotes.')
      }
      
      // Return a fallback quote that we don't already have
      const unusedFallbacks = FALLBACK_QUOTES.filter(fallback => 
        !sessionData.quotes.some(existing => existing.id === fallback.id)
      )
      
      const fallbackQuote = unusedFallbacks.length > 0 ? unusedFallbacks[0] : FALLBACK_QUOTES[0]
      console.log('[useQuoteSession] Using fallback quote:', fallbackQuote.id)
      return fallbackQuote
    }
  }, [sessionData.quotes])

  // Check if session is from today
  const isSessionFromToday = useCallback((sessionStartTime: number): boolean => {
    const todayKey = getTodayKey()
    const sessionDate = new Date(sessionStartTime).toISOString().slice(0, 10)
    return sessionDate === todayKey
  }, [getTodayKey])

  // Initialize session with daily cache integration
  const initializeSession = useCallback(async () => {
    if (isInitialized.current) return

    setIsLoading(true)
    isInitialized.current = true

    console.log('[useQuoteSession] Initializing session with daily cache...')

    try {
      // STEP 1: Check daily cache first
      const cache = dailyQuoteCache.loadDailyCache()
      
      if (cache && cache.quotesPool.length > 0) {
        console.log('[useQuoteSession] Found daily cache with quotes:', {
          quotesCount: cache.quotesPool.length,
          currentIndex: cache.currentIndex,
          reloadCount: cache.reloadCount
        })
        
        // Restore session from cache
        setDailyCache(cache)
        updateSessionData(prev => ({
          ...prev,
          quotes: cache.quotesPool,
          currentIndex: cache.currentIndex,
          dailyFirstQuote: cache.dailyQuote,
          reloadCount: cache.reloadCount,
          sessionStartTime: Date.now(),
          lastFetchTime: Date.now()
        }))

        // Start background pre-fetching if we're running low
        if (cache.quotesPool.length < opts.backgroundFetchThreshold) {
          console.log('[useQuoteSession] Low on cached quotes, starting background fetch')
          quotePrefetchService.backgroundFetch().catch(error => {
            console.warn('[useQuoteSession] Background pre-fetch failed:', error)
          })
        }
        return
      }

      // STEP 2: No cache found, try pre-fetched quotes
      console.log('[useQuoteSession] No daily cache, checking pre-fetched quotes...')
      try {
        const prefetchedQuotes = await quotePrefetchService.getPrefetchedQuotes()
        
        if (prefetchedQuotes && prefetchedQuotes.length > 0) {
          console.log(`[useQuoteSession] Using ${prefetchedQuotes.length} pre-fetched quotes`)
          
          // Create new daily cache
          const newCache = dailyQuoteCache.createDailyCache(prefetchedQuotes[0])
          const updatedCache = dailyQuoteCache.addQuotesToCache(prefetchedQuotes.slice(1), newCache)
          
          setDailyCache(updatedCache)
          updateSessionData(prev => ({
            ...prev,
            quotes: prefetchedQuotes,
            currentIndex: 0,
            dailyFirstQuote: prefetchedQuotes[0],
            reloadCount: 0,
            sessionStartTime: Date.now(),
            lastFetchTime: Date.now()
          }))
          return
        }
      } catch (prefetchError) {
        console.warn('[useQuoteSession] Pre-fetch service failed:', prefetchError)
      }
      
      // STEP 3: Fallback - fetch single quote from API
      console.log('[useQuoteSession] Fetching first quote from API...')
      const firstQuote = await fetchNewQuote()
      
      if (firstQuote) {
        console.log('[useQuoteSession] Creating daily cache with first quote:', firstQuote.id)
        
        // Create new daily cache with first quote
        const newCache = dailyQuoteCache.createDailyCache(firstQuote)
        setDailyCache(newCache)
        
        updateSessionData(prev => ({
          ...prev,
          quotes: [firstQuote],
          currentIndex: 0,
          dailyFirstQuote: firstQuote,
          reloadCount: 0,
          sessionStartTime: Date.now(),
          lastFetchTime: Date.now()
        }))

        // Start background pre-fetching for more quotes
        setTimeout(() => {
          quotePrefetchService.backgroundFetch().catch(error => {
            console.warn('[useQuoteSession] Background pre-fetch failed:', error)
          })
        }, 100)
      }
      
    } catch (error) {
      console.error('Failed to initialize quote session:', error)
      setError('Failed to load quotes')
      
      // Use fallback quotes
      console.log('[useQuoteSession] Using fallback quote')
      const fallbackQuote = FALLBACK_QUOTES[0]
      const fallbackCache = dailyQuoteCache.createDailyCache(fallbackQuote)
      setDailyCache(fallbackCache)
      
      updateSessionData(prev => ({
        ...prev,
        quotes: [fallbackQuote],
        currentIndex: 0,
        dailyFirstQuote: fallbackQuote,
        reloadCount: 0,
        sessionStartTime: Date.now(),
        lastFetchTime: Date.now()
      }))
    } finally {
      setIsLoading(false)
    }
  }, [updateSessionData, fetchNewQuote, opts.backgroundFetchThreshold])

  // Get current quote
  const getCurrentQuote = useCallback((): StoicQuote | null => {
    if (sessionData.quotes.length === 0) return null
    
    const index = Math.max(0, Math.min(sessionData.currentIndex, sessionData.quotes.length - 1))
    return sessionData.quotes[index] || null
  }, [sessionData.quotes, sessionData.currentIndex])

  // Navigate to next quote (use pre-fetched quotes first, then fetch from API)
  const goToNext = useCallback(async (): Promise<boolean> => {
    console.log('[useQuoteSession] goToNext called, current index:', sessionData.currentIndex)
    const nextIndex = sessionData.currentIndex + 1
    
    // If we have the next quote in session, use it
    if (nextIndex < sessionData.quotes.length) {
      console.log('[useQuoteSession] Using existing quote at index', nextIndex)
      updateSessionData(prev => ({ ...prev, currentIndex: nextIndex }))
      
      // Trigger background pre-fetch when running low on quotes
      const remainingQuotes = sessionData.quotes.length - nextIndex - 1
      if (remainingQuotes <= opts.backgroundFetchThreshold) {
        console.log(`[useQuoteSession] Running low on quotes (${remainingQuotes} remaining), triggering background fetch`)
        quotePrefetchService.backgroundFetch().catch(error => {
          console.warn('[useQuoteSession] Background pre-fetch failed:', error)
        })
      }
      
      return true
    }
    
    // Check if we've hit the session limit
    if (sessionData.quotes.length >= opts.maxSessionQuotes) {
      console.warn('[useQuoteSession] Reached maximum session quotes limit')
      return false
    }
    
    // Try to get quotes from pre-fetch service first
    console.log('[useQuoteSession] No more quotes in session, checking pre-fetch service...')
    try {
      const prefetchedQuotes = await quotePrefetchService.getPrefetchedQuotes()
      
      // Filter out quotes we already have
      const newQuotesFromPrefetch = prefetchedQuotes.filter(prefetchedQuote => 
        !sessionData.quotes.some(existingQuote => 
          existingQuote.id === prefetchedQuote.id ||
          (existingQuote.text === prefetchedQuote.text && existingQuote.author === prefetchedQuote.author)
        )
      )
      
      if (newQuotesFromPrefetch.length > 0) {
        console.log(`[useQuoteSession] Adding ${newQuotesFromPrefetch.length} pre-fetched quotes to session`)
        
        // Add new quotes and move to the first new one
        updateSessionData(prev => ({
          ...prev,
          quotes: [...prev.quotes, ...newQuotesFromPrefetch.slice(0, Math.min(10, newQuotesFromPrefetch.length))], // Add up to 10 quotes at a time
          currentIndex: prev.quotes.length, // Point to the first new quote
          lastFetchTime: Date.now()
        }))
        
        return true
      }
    } catch (error) {
      console.warn('[useQuoteSession] Pre-fetch service failed, falling back to API:', error)
    }
    
    // Fallback: Fetch a single quote from API
    console.log('[useQuoteSession] Fetching new quote from API...')
    setIsLoading(true)
    try {
      const newQuote = await fetchNewQuote()
      
      console.log('[useQuoteSession] Fetched new quote:', newQuote?.id)
      
      if (newQuote) {
        updateSessionData(prev => ({
          ...prev,
          quotes: [...prev.quotes, newQuote],
          currentIndex: prev.quotes.length, // Point to the new quote
          lastFetchTime: Date.now()
        }))
        return true
      }
      
      return false
    } catch (error) {
      console.error('Failed to fetch next quote:', error)
      setError('Failed to load next quote')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [sessionData.currentIndex, sessionData.quotes.length, opts.maxSessionQuotes, opts.backgroundFetchThreshold, updateSessionData, fetchNewQuote])

  // Navigate to previous quote
  const goToPrevious = useCallback((): boolean => {
    console.log('[useQuoteSession] goToPrevious called, current index:', sessionData.currentIndex)
    if (sessionData.currentIndex > 0) {
      console.log('[useQuoteSession] Going to previous quote at index', sessionData.currentIndex - 1)
      updateSessionData(prev => ({ ...prev, currentIndex: prev.currentIndex - 1 }))
      return true
    }
    console.log('[useQuoteSession] Cannot go to previous, already at first quote')
    return false
  }, [sessionData.currentIndex, updateSessionData])

  // Navigate to specific index
  const goToIndex = useCallback((index: number): boolean => {
    if (index >= 0 && index < sessionData.quotes.length) {
      updateSessionData(prev => ({ ...prev, currentIndex: index }))
      return true
    }
    return false
  }, [sessionData.quotes.length, updateSessionData])

  // Reload current quote with daily cache integration
  const reloadCurrentQuote = useCallback(async (): Promise<boolean> => {
    if (!dailyCache) {
      setError('Daily cache not initialized')
      return false
    }

    if (!dailyQuoteCache.canReload(dailyCache)) {
      setError(`Daily reload limit reached (${opts.maxReloadsPerDay})`)
      return false
    }
    
    setIsLoading(true)
    try {
      const newQuote = await fetchNewQuote()
      
      if (newQuote) {
        // Update daily cache
        const updatedCache = dailyQuoteCache.addQuoteToCache(newQuote, dailyCache)
        const finalCache = dailyQuoteCache.updateReloadCount(updatedCache, updatedCache.reloadCount + 1)
        setDailyCache(finalCache)

        // Update session data
        updateSessionData(prev => {
          const newQuotes = [...prev.quotes]
          newQuotes[prev.currentIndex] = newQuote
          
          return {
            ...prev,
            quotes: newQuotes,
            reloadCount: finalCache.reloadCount,
            lastFetchTime: Date.now()
          }
        })
        
        // Update localStorage reload count for compatibility
        saveReloadCount(finalCache.reloadCount)
        
        return true
      }
      
      return false
    } catch (error) {
      console.error('Failed to reload quote:', error)
      setError('Failed to reload quote')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [dailyCache, opts.maxReloadsPerDay, updateSessionData, fetchNewQuote, saveReloadCount])

  // Clear session data
  const clearSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(opts.sessionStorageKey)
    }
    
    setSessionData({
      quotes: [],
      currentIndex: 0,
      dailyFirstQuote: null,
      lastFetchTime: 0,
      sessionStartTime: Date.now(),
      reloadCount: 0
    })
  }, [opts.sessionStorageKey])

  // Initialize session on mount
  useEffect(() => {
    initializeSession()
  }, [initializeSession])

  // Update reload count from localStorage on mount
  useEffect(() => {
    const reloadCount = loadReloadCount()
    if (reloadCount !== sessionData.reloadCount) {
      updateSessionData(prev => ({ ...prev, reloadCount }))
    }
  }, [loadReloadCount, sessionData.reloadCount, updateSessionData])

  return {
    // State
    currentQuote: getCurrentQuote(),
    currentIndex: sessionData.currentIndex,
    totalQuotes: sessionData.quotes.length,
    isLoading,
    error,
    
    // Quote management
    dailyFirstQuote: sessionData.dailyFirstQuote,
    allSessionQuotes: sessionData.quotes,
    
    // Navigation
    goToNext,
    goToPrevious,
    goToIndex,
    canGoNext: sessionData.quotes.length < opts.maxSessionQuotes,
    canGoPrevious: sessionData.currentIndex > 0,
    
    // Reloading
    reloadCurrentQuote,
    reloadCount: dailyCache?.reloadCount || sessionData.reloadCount,
    maxReloads: opts.maxReloadsPerDay,
    canReload: dailyCache ? dailyQuoteCache.canReload(dailyCache) : sessionData.reloadCount < opts.maxReloadsPerDay,
    
    // Session management
    clearSession,
    sessionStartTime: sessionData.sessionStartTime,
    lastFetchTime: sessionData.lastFetchTime,
    
    // Daily cache status
    dailyCache,
    cacheStatus: dailyQuoteCache.getCacheStatus(),
    
    // Utility
    setError,
    clearError: () => setError(null)
  }
}