'use client'

import { stoicQuoteApi, type StoicQuote, FALLBACK_QUOTES } from './stoicQuoteApi'

interface PrefetchedQuoteData {
  quotes: StoicQuote[]
  fetchTime: number
  expiresAt: number
  totalFetched: number
}

interface PrefetchOptions {
  dailyQuoteCount?: number
  storageKey?: string
  maxRetries?: number
  backgroundFetchThreshold?: number
}

const DEFAULT_OPTIONS: Required<PrefetchOptions> = {
  dailyQuoteCount: 50,
  storageKey: 'twstoic:prefetched-quotes',
  maxRetries: 3,
  backgroundFetchThreshold: 10
}

class QuotePrefetchService {
  private static instance: QuotePrefetchService
  private options: Required<PrefetchOptions>
  private isPreFetching = false
  private prefetchPromise: Promise<StoicQuote[]> | null = null

  private constructor(options: PrefetchOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
  }

  static getInstance(options?: PrefetchOptions): QuotePrefetchService {
    if (!QuotePrefetchService.instance) {
      QuotePrefetchService.instance = new QuotePrefetchService(options)
    }
    return QuotePrefetchService.instance
  }

  private getTodayKey(): string {
    const today = new Date().toISOString().slice(0, 10)
    return `${this.options.storageKey}:${today}`
  }

  private getYesterdayKey(): string {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return `${this.options.storageKey}:${yesterday.toISOString().slice(0, 10)}`
  }

  private loadPrefetchedData(): PrefetchedQuoteData | null {
    if (typeof window === 'undefined') return null

    try {
      const todayKey = this.getTodayKey()
      const stored = localStorage.getItem(todayKey)
      
      if (stored) {
        const data = JSON.parse(stored) as PrefetchedQuoteData
        
        if (data.quotes && Array.isArray(data.quotes) && data.expiresAt > Date.now()) {
          console.log('[QuotePrefetchService] Loaded prefetched quotes:', {
            count: data.quotes.length,
            fetchTime: new Date(data.fetchTime).toLocaleTimeString(),
            expiresAt: new Date(data.expiresAt).toLocaleTimeString()
          })
          return data
        } else {
          console.log('[QuotePrefetchService] Prefetched data expired or invalid')
          localStorage.removeItem(todayKey)
        }
      }
    } catch (error) {
      console.warn('[QuotePrefetchService] Failed to load prefetched data:', error)
    }

    return null
  }

  private savePrefetchedData(quotes: StoicQuote[]): void {
    if (typeof window === 'undefined') return

    try {
      const now = Date.now()
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      const data: PrefetchedQuoteData = {
        quotes,
        fetchTime: now,
        expiresAt: tomorrow.getTime(),
        totalFetched: quotes.length
      }

      const todayKey = this.getTodayKey()
      localStorage.setItem(todayKey, JSON.stringify(data))
      
      console.log('[QuotePrefetchService] Saved prefetched quotes:', {
        count: quotes.length,
        key: todayKey,
        expiresAt: new Date(data.expiresAt).toLocaleString()
      })

      this.cleanupOldData()
    } catch (error) {
      console.warn('[QuotePrefetchService] Failed to save prefetched data:', error)
    }
  }

  private cleanupOldData(): void {
    if (typeof window === 'undefined') return

    try {
      const keysToRemove: string[] = []
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.options.storageKey) && !key.includes(this.getTodayKey().split(':')[1])) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
        console.log('[QuotePrefetchService] Cleaned up old data:', key)
      })
    } catch (error) {
      console.warn('[QuotePrefetchService] Failed to cleanup old data:', error)
    }
  }

  async getPrefetchedQuotes(): Promise<StoicQuote[]> {
    const cachedData = this.loadPrefetchedData()
    
    if (cachedData && cachedData.quotes.length > 0) {
      return cachedData.quotes
    }

    console.log('[QuotePrefetchService] No valid prefetched quotes, fetching from API...')
    return await this.fetchQuotes()
  }

  async fetchQuotes(count?: number): Promise<StoicQuote[]> {
    if (this.isPreFetching && this.prefetchPromise) {
      console.log('[QuotePrefetchService] Pre-fetch already in progress, waiting...')
      return await this.prefetchPromise
    }

    const quotesToFetch = count || this.options.dailyQuoteCount
    console.log(`[QuotePrefetchService] Starting to fetch ${quotesToFetch} quotes...`)

    this.isPreFetching = true
    this.prefetchPromise = this.performFetch(quotesToFetch)

    try {
      const quotes = await this.prefetchPromise
      this.savePrefetchedData(quotes)
      return quotes
    } finally {
      this.isPreFetching = false
      this.prefetchPromise = null
    }
  }

  private async performFetch(count: number): Promise<StoicQuote[]> {
    const quotes: StoicQuote[] = []
    const maxAttempts = count * 2
    let attempts = 0
    let consecutiveFailures = 0
    const maxConsecutiveFailures = 5

    while (quotes.length < count && attempts < maxAttempts) {
      if (consecutiveFailures >= maxConsecutiveFailures) {
        console.warn('[QuotePrefetchService] Too many consecutive failures, stopping fetch')
        break
      }

      try {
        console.log(`[QuotePrefetchService] Fetching quote ${quotes.length + 1}/${count} (attempt ${attempts + 1})`)
        
        const quote = await stoicQuoteApi.fetchQuote()
        
        const isDuplicate = quotes.some(existing => 
          existing.id === quote.id || 
          (existing.text === quote.text && existing.author === quote.author)
        )

        if (!isDuplicate) {
          quotes.push(quote)
          consecutiveFailures = 0
          console.log(`[QuotePrefetchService] Successfully fetched unique quote: ${quote.id}`)
        } else {
          console.log('[QuotePrefetchService] Duplicate quote received, trying again...')
        }

        await this.delay(100)
        
      } catch (error) {
        consecutiveFailures++
        console.warn(`[QuotePrefetchService] Failed to fetch quote ${quotes.length + 1}:`, error)
        
        const delay = Math.min(1000 * Math.pow(2, consecutiveFailures), 10000)
        await this.delay(delay)
      }
      
      attempts++
    }

    if (quotes.length === 0) {
      console.warn('[QuotePrefetchService] Failed to fetch any quotes, using fallbacks')
      return [...FALLBACK_QUOTES]
    }

    if (quotes.length < count) {
      console.warn(`[QuotePrefetchService] Only fetched ${quotes.length}/${count} quotes, filling with fallbacks`)
      const fallbacksNeeded = Math.min(count - quotes.length, FALLBACK_QUOTES.length)
      const fallbacksToAdd = FALLBACK_QUOTES.slice(0, fallbacksNeeded).filter(fallback =>
        !quotes.some(quote => quote.id === fallback.id)
      )
      quotes.push(...fallbacksToAdd)
    }

    console.log(`[QuotePrefetchService] Fetch completed: ${quotes.length} quotes total`)
    return quotes
  }

  async backgroundFetch(): Promise<void> {
    if (this.isPreFetching) {
      console.log('[QuotePrefetchService] Background fetch skipped - already pre-fetching')
      return
    }

    const cachedData = this.loadPrefetchedData()
    
    if (!cachedData || cachedData.quotes.length <= this.options.backgroundFetchThreshold) {
      console.log('[QuotePrefetchService] Background fetch triggered - low quote count')
      try {
        await this.fetchQuotes()
      } catch (error) {
        console.warn('[QuotePrefetchService] Background fetch failed:', error)
      }
    }
  }

  getRemainingQuotes(): number {
    const cachedData = this.loadPrefetchedData()
    return cachedData ? cachedData.quotes.length : 0
  }

  isDataExpired(): boolean {
    const cachedData = this.loadPrefetchedData()
    return !cachedData || cachedData.expiresAt <= Date.now()
  }

  clearCache(): void {
    if (typeof window === 'undefined') return

    try {
      const todayKey = this.getTodayKey()
      localStorage.removeItem(todayKey)
      console.log('[QuotePrefetchService] Cache cleared')
    } catch (error) {
      console.warn('[QuotePrefetchService] Failed to clear cache:', error)
    }
  }

  getStatus() {
    const cachedData = this.loadPrefetchedData()
    return {
      isPreFetching: this.isPreFetching,
      quotesAvailable: cachedData ? cachedData.quotes.length : 0,
      lastFetchTime: cachedData ? new Date(cachedData.fetchTime) : null,
      expiresAt: cachedData ? new Date(cachedData.expiresAt) : null,
      isExpired: this.isDataExpired()
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const quotePrefetchService = QuotePrefetchService.getInstance()
export { QuotePrefetchService }
export type { PrefetchedQuoteData, PrefetchOptions }