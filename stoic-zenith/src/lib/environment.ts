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

export const getTimeouts = () => {
  const isProd = isProduction()
  
  return {
    // Auth timeouts - aggressive for fast initial load
    authInit: isProd ? 5000 : 3000, // 5s prod, 3s dev for initial auth
    authStateChange: isProd ? 10000 : 5000, // 10s prod, 5s dev
    
    // Data loading timeouts - can be longer since they're non-blocking
    dataFetch: isProd ? 30000 : 15000, // 30s prod, 15s dev
    journalSync: isProd ? 30000 : 15000, // 30s prod, 15s dev
    calendarFetch: isProd ? 30000 : 15000, // 30s prod, 15s dev
    
    // UI timeouts - quick for better UX
    protectedRoute: isProd ? 10000 : 5000, // 10s prod, 5s dev
    loadingScreen: isProd ? 15000 : 10000, // 15s prod, 10s dev
  }
}

export const getRetryConfig = () => {
  const isProd = isProduction()
  
  return {
    maxRetries: isProd ? 3 : 2,
    initialDelay: isProd ? 1000 : 500, // 1s prod, 500ms dev
    maxDelay: isProd ? 5000 : 2000, // 5s prod, 2s dev
    backoffMultiplier: 2,
  }
}

// Exponential backoff helper
export const exponentialBackoff = async (
  fn: () => Promise<any>,
  options?: {
    maxRetries?: number
    initialDelay?: number
    maxDelay?: number
    shouldRetry?: (error: any) => boolean
  }
): Promise<any> => {
  const config = {
    ...getRetryConfig(),
    ...options
  }
  
  let lastError: any
  
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
      
      console.log(`⏱️ Retry attempt ${attempt + 1}/${config.maxRetries} after ${delay}ms`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}