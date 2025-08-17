export interface CacheEntry<T> {
  data: T
  timestamp: number
  expiryMs: number
}

export class CacheManager {
  private static readonly CACHE_PREFIX = 'stoic-cache-'

  static set<T>(
    key: string,
    data: T,
    expiryMs: number = 24 * 60 * 60 * 1000
  ): void {
    try {
      const cacheEntry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiryMs,
      }

      localStorage.setItem(
        `${this.CACHE_PREFIX}${key}`,
        JSON.stringify(cacheEntry)
      )
    } catch (error) {
      console.warn('Failed to cache data:', error)
    }
  }

  static get<T>(key: string): T | null {
    try {
      const cachedData = localStorage.getItem(`${this.CACHE_PREFIX}${key}`)
      if (!cachedData) return null

      const cacheEntry: CacheEntry<T> = JSON.parse(cachedData)
      const isExpired = Date.now() - cacheEntry.timestamp > cacheEntry.expiryMs

      if (isExpired) {
        this.remove(key)
        return null
      }

      return cacheEntry.data
    } catch {
      this.remove(key)
      return null
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(`${this.CACHE_PREFIX}${key}`)
    } catch (error) {
      console.warn('Failed to remove cache entry:', error)
    }
  }

  static clearUserCache(userId: string): void {
    try {
      const keysToRemove = [`profile-${userId}`, `calendar-${userId}`]

      keysToRemove.forEach(key => this.remove(key))

      // Also clear legacy keys if they exist
      localStorage.removeItem(`profile-${userId}`)
      localStorage.removeItem(`calendar-${userId}`)
    } catch (error) {
      console.warn('Failed to clear user cache:', error)
    }
  }

  static clearExpiredEntries(): void {
    try {
      const keysToCheck: string[] = []

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(this.CACHE_PREFIX)) {
          keysToCheck.push(key.replace(this.CACHE_PREFIX, ''))
        }
      }

      keysToCheck.forEach(key => {
        this.get(key) // This will auto-remove expired entries
      })
    } catch (error) {
      console.warn('Failed to clear expired cache entries:', error)
    }
  }

  static getCacheInfo(): { totalEntries: number; cacheSize: string } {
    try {
      let totalEntries = 0
      let totalSize = 0

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(this.CACHE_PREFIX)) {
          totalEntries++
          const value = localStorage.getItem(key)
          if (value) {
            totalSize += key.length + value.length
          }
        }
      }

      const cacheSize =
        totalSize < 1024
          ? `${totalSize} bytes`
          : totalSize < 1024 * 1024
            ? `${(totalSize / 1024).toFixed(1)} KB`
            : `${(totalSize / (1024 * 1024)).toFixed(1)} MB`

      return { totalEntries, cacheSize }
    } catch {
      return { totalEntries: 0, cacheSize: '0 bytes' }
    }
  }
}
