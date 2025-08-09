/**
 * Environment detection utilities
 */

export const isProduction = (): boolean => {
  if (typeof window === 'undefined') return false

  // Check for production domains
  const hostname = window.location.hostname
  return (
    hostname.includes('vercel.app') ||
    hostname.includes('vercel.sh') ||
    hostname.includes('stoiczenith.com') ||
    hostname.includes('thewaystoic.com') ||
    (process.env.NODE_ENV === 'production' && hostname !== 'localhost')
  )
}

export const isDevelopment = (): boolean => {
  if (typeof window === 'undefined') return true

  const hostname = window.location.hostname
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

export const getTimeouts = (): {
  authInit: number
  authStateChange: number
  dataFetch: number
  journalSync: number
  calendarFetch: number
  protectedRoute: number
  loadingScreen: number
} => {
  const isProd = isProduction()

  return {
    // Auth timeouts - shorter for faster fallback
    authInit: isProd ? 3000 : 5000, // 3s prod (faster fail), 5s dev for initial auth
    authStateChange: isProd ? 5000 : 10000, // 5s prod, 10s dev

    // Data loading timeouts - can be longer since they're non-blocking
    dataFetch: isProd ? 30000 : 15000, // 30s prod, 15s dev
    journalSync: isProd ? 30000 : 15000, // 30s prod, 15s dev
    calendarFetch: isProd ? 30000 : 15000, // 30s prod, 15s dev

    // UI timeouts - quick for better UX
    protectedRoute: isProd ? 5000 : 5000, // 5s both
    loadingScreen: isProd ? 8000 : 10000, // 8s prod, 10s dev
  }
}

export const getRetryConfig = (): {
  maxRetries: number
  initialDelay: number
  maxDelay: number
  backoffMultiplier: number
} => {
  const isProd = isProduction()

  return {
    maxRetries: isProd ? 3 : 2,
    initialDelay: isProd ? 1000 : 500, // 1s prod, 500ms dev
    maxDelay: isProd ? 5000 : 2000, // 5s prod, 2s dev
    backoffMultiplier: 2,
  }
}

// Exponential backoff helper
export const exponentialBackoff = async <T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number
    initialDelay?: number
    maxDelay?: number
    shouldRetry?: (error: unknown) => boolean
  }
): Promise<T> => {
  const config = {
    ...getRetryConfig(),
    ...options,
  }

  let lastError: unknown

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Check if we should retry
      if (options?.shouldRetry && !options.shouldRetry(error)) {
        throw error
      }

      // Don't retry on last attempt
      if (attempt === config.maxRetries) {
        throw error
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.initialDelay * Math.pow(config.backoffMultiplier, attempt),
        config.maxDelay
      )

      console.log(
        `⏱️ Retry attempt ${attempt + 1}/${config.maxRetries} after ${delay}ms`
      )
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}
