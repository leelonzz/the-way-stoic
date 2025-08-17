'use client'

import type { StoicQuote } from './stoicQuoteApi'

interface DailyQuoteCache {
  userId: string
  date: string
  dailyQuote: StoicQuote | null
  quotesPool: StoicQuote[]
  currentIndex: number
  fetchCount: number
  reloadCount: number
  lastFetchedAt: string
  version: number
}

interface CacheOptions {
  maxQuotesPerDay?: number
  storageKeyPrefix?: string
  cacheDurationDays?: number
}

const DEFAULT_OPTIONS: Required<CacheOptions> = {
  maxQuotesPerDay: 50,
  storageKeyPrefix: 'twstoic:daily-cache',
  cacheDurationDays: 7
}

class DailyQuoteCacheService {
  private static instance: DailyQuoteCacheService
  private options: Required<CacheOptions>
  private userId: string | null = null
  private readonly CURRENT_VERSION = 1

  private constructor(options: CacheOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
  }

  static getInstance(options?: CacheOptions): DailyQuoteCacheService {
    if (!DailyQuoteCacheService.instance) {
      DailyQuoteCacheService.instance = new DailyQuoteCacheService(options)
    }
    return DailyQuoteCacheService.instance
  }

  /**
   * Generate or retrieve a unique user identifier
   */
  private getUserId(): string {
    if (this.userId) return this.userId

    if (typeof window === 'undefined') {
      this.userId = 'server-user'
      return this.userId
    }

    try {
      const stored = localStorage.getItem('twstoic:user-id')
      if (stored) {
        this.userId = stored
        return this.userId
      }

      // Generate new user ID
      const newUserId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('twstoic:user-id', newUserId)
      this.userId = newUserId
      
      console.log('[DailyQuoteCache] Generated new user ID:', newUserId)
      return this.userId
    } catch (error) {
      console.warn('[DailyQuoteCache] Failed to manage user ID:', error)
      this.userId = `fallback-${Math.random().toString(36).substr(2, 9)}`
      return this.userId
    }
  }

  /**
   * Get today's date in YYYY-MM-DD format
   */
  private getTodayKey(): string {
    return new Date().toISOString().slice(0, 10)
  }

  /**
   * Get cache key for specific user and date
   */
  private getCacheKey(date?: string): string {
    const userId = this.getUserId()
    const dateKey = date || this.getTodayKey()
    return `${this.options.storageKeyPrefix}:${userId}:${dateKey}`
  }

  /**
   * Load daily quote cache for today
   */
  loadDailyCache(date?: string): DailyQuoteCache | null {
    if (typeof window === 'undefined') return null

    try {
      const cacheKey = this.getCacheKey(date)
      const stored = localStorage.getItem(cacheKey)
      
      if (stored) {
        const cache = JSON.parse(stored) as DailyQuoteCache
        
        // Validate cache structure and version
        if (this.isValidCache(cache)) {
          console.log('[DailyQuoteCache] Loaded cache:', {
            date: cache.date,
            quotesCount: cache.quotesPool.length,
            currentIndex: cache.currentIndex,
            reloadCount: cache.reloadCount
          })
          return cache
        } else {
          console.log('[DailyQuoteCache] Invalid cache found, removing:', cacheKey)
          localStorage.removeItem(cacheKey)
        }
      }
    } catch (error) {
      console.warn('[DailyQuoteCache] Failed to load cache:', error)
    }

    return null
  }

  /**
   * Save daily quote cache
   */
  saveDailyCache(cache: DailyQuoteCache): void {
    if (typeof window === 'undefined') return

    try {
      const cacheKey = this.getCacheKey(cache.date)
      const cacheToSave = {
        ...cache,
        version: this.CURRENT_VERSION,
        lastFetchedAt: new Date().toISOString()
      }
      
      localStorage.setItem(cacheKey, JSON.stringify(cacheToSave))
      
      console.log('[DailyQuoteCache] Saved cache:', {
        key: cacheKey,
        quotesCount: cache.quotesPool.length,
        currentIndex: cache.currentIndex
      })

      // Cleanup old caches
      this.cleanupOldCaches()
    } catch (error) {
      console.warn('[DailyQuoteCache] Failed to save cache:', error)
    }
  }

  /**
   * Create new daily cache
   */
  createDailyCache(firstQuote?: StoicQuote): DailyQuoteCache {
    const userId = this.getUserId()
    const today = this.getTodayKey()
    
    const cache: DailyQuoteCache = {
      userId,
      date: today,
      dailyQuote: firstQuote || null,
      quotesPool: firstQuote ? [firstQuote] : [],
      currentIndex: 0,
      fetchCount: firstQuote ? 1 : 0,
      reloadCount: 0,
      lastFetchedAt: new Date().toISOString(),
      version: this.CURRENT_VERSION
    }

    this.saveDailyCache(cache)
    return cache
  }

  /**
   * Add quote to existing cache
   */
  addQuoteToCache(quote: StoicQuote, cache: DailyQuoteCache): DailyQuoteCache {
    // Check for duplicates
    const isDuplicate = cache.quotesPool.some(existing => 
      existing.id === quote.id || 
      (existing.text === quote.text && existing.author === quote.author)
    )

    if (isDuplicate) {
      console.log('[DailyQuoteCache] Duplicate quote detected, not adding')
      return cache
    }

    const updatedCache: DailyQuoteCache = {
      ...cache,
      quotesPool: [...cache.quotesPool, quote],
      fetchCount: cache.fetchCount + 1,
      lastFetchedAt: new Date().toISOString()
    }

    // Set as daily quote if it's the first one
    if (!updatedCache.dailyQuote) {
      updatedCache.dailyQuote = quote
    }

    this.saveDailyCache(updatedCache)
    return updatedCache
  }

  /**
   * Add multiple quotes to cache
   */
  addQuotesToCache(quotes: StoicQuote[], cache: DailyQuoteCache): DailyQuoteCache {
    let updatedCache = cache

    for (const quote of quotes) {
      updatedCache = this.addQuoteToCache(quote, updatedCache)
    }

    return updatedCache
  }

  /**
   * Update reload count
   */
  updateReloadCount(cache: DailyQuoteCache, newCount: number): DailyQuoteCache {
    const updatedCache: DailyQuoteCache = {
      ...cache,
      reloadCount: newCount,
      lastFetchedAt: new Date().toISOString()
    }

    this.saveDailyCache(updatedCache)
    return updatedCache
  }

  /**
   * Update current index
   */
  updateCurrentIndex(cache: DailyQuoteCache, newIndex: number): DailyQuoteCache {
    const validIndex = Math.max(0, Math.min(newIndex, cache.quotesPool.length - 1))
    
    const updatedCache: DailyQuoteCache = {
      ...cache,
      currentIndex: validIndex,
      lastFetchedAt: new Date().toISOString()
    }

    this.saveDailyCache(updatedCache)
    return updatedCache
  }

  /**
   * Get current quote from cache
   */
  getCurrentQuote(cache: DailyQuoteCache): StoicQuote | null {
    if (cache.quotesPool.length === 0) return null
    
    const index = Math.max(0, Math.min(cache.currentIndex, cache.quotesPool.length - 1))
    return cache.quotesPool[index] || null
  }

  /**
   * Check if user can reload more quotes
   */
  canReload(cache: DailyQuoteCache): boolean {
    return cache.reloadCount < this.options.maxQuotesPerDay
  }

  /**
   * Get remaining reloads
   */
  getRemainingReloads(cache: DailyQuoteCache): number {
    return Math.max(0, this.options.maxQuotesPerDay - cache.reloadCount)
  }

  /**
   * Validate cache structure
   */
  private isValidCache(cache: any): cache is DailyQuoteCache {
    return (
      cache &&
      typeof cache.userId === 'string' &&
      typeof cache.date === 'string' &&
      Array.isArray(cache.quotesPool) &&
      typeof cache.currentIndex === 'number' &&
      typeof cache.fetchCount === 'number' &&
      typeof cache.reloadCount === 'number' &&
      typeof cache.lastFetchedAt === 'string' &&
      cache.version === this.CURRENT_VERSION
    )
  }

  /**
   * Clean up old caches (older than configured days)
   */
  private cleanupOldCaches(): void {
    if (typeof window === 'undefined') return

    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - this.options.cacheDurationDays)
      const cutoffDateString = cutoffDate.toISOString().slice(0, 10)

      const keysToRemove: string[] = []
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.options.storageKeyPrefix)) {
          // Extract date from key (format: prefix:userId:YYYY-MM-DD)
          const datePart = key.split(':').pop()
          if (datePart && datePart < cutoffDateString) {
            keysToRemove.push(key)
          }
        }
      }

      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
        console.log('[DailyQuoteCache] Cleaned up old cache:', key)
      })
    } catch (error) {
      console.warn('[DailyQuoteCache] Failed to cleanup old caches:', error)
    }
  }

  /**
   * Clear all caches for current user
   */
  clearUserCaches(): void {
    if (typeof window === 'undefined') return

    try {
      const userId = this.getUserId()
      const keysToRemove: string[] = []
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.includes(`${this.options.storageKeyPrefix}:${userId}:`)) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
        console.log('[DailyQuoteCache] Cleared user cache:', key)
      })
    } catch (error) {
      console.warn('[DailyQuoteCache] Failed to clear user caches:', error)
    }
  }

  /**
   * Get cache status for debugging
   */
  getCacheStatus(): {
    userId: string
    todayKey: string
    hasCache: boolean
    quotesCount: number
    reloadCount: number
    remainingReloads: number
  } {
    const userId = this.getUserId()
    const todayKey = this.getTodayKey()
    const cache = this.loadDailyCache()
    
    return {
      userId,
      todayKey,
      hasCache: !!cache,
      quotesCount: cache?.quotesPool.length || 0,
      reloadCount: cache?.reloadCount || 0,
      remainingReloads: cache ? this.getRemainingReloads(cache) : this.options.maxQuotesPerDay
    }
  }
}

// Export singleton instance
export const dailyQuoteCache = DailyQuoteCacheService.getInstance()

// Export types
export type { DailyQuoteCache, CacheOptions }