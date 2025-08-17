import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  message?: string
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory storage for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

function getClientId(req: NextRequest): string {
  // Try to get user ID from auth header, fallback to IP
  const authHeader = req.headers.get('authorization')
  if (authHeader) {
    return `user:${authHeader.substring(0, 20)}` // Use partial auth token as ID
  }
  
  // Fallback to IP address
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown'
  return `ip:${ip}`
}

export function withRateLimit(config: RateLimitConfig) {
  return function (handler: (req: NextRequest) => Promise<NextResponse>) {
    return async (req: NextRequest): Promise<NextResponse> => {
      const clientId = getClientId(req)
      const now = Date.now()
      const windowStart = now - config.windowMs
      
      let entry = rateLimitStore.get(clientId)
      
      // Clean up or initialize entry
      if (!entry || now > entry.resetTime) {
        entry = {
          count: 0,
          resetTime: now + config.windowMs
        }
        rateLimitStore.set(clientId, entry)
      }
      
      // Check if limit exceeded
      if (entry.count >= config.maxRequests) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
        
        return NextResponse.json(
          { 
            error: config.message || 'Too many requests',
            retryAfter: retryAfter
          },
          { 
            status: 429,
            headers: {
              'Retry-After': retryAfter.toString(),
              'X-RateLimit-Limit': config.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': entry.resetTime.toString()
            }
          }
        )
      }
      
      // Increment counter
      entry.count++
      rateLimitStore.set(clientId, entry)
      
      // Execute handler with rate limit headers
      const response = await handler(req)
      
      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', (config.maxRequests - entry.count).toString())
      response.headers.set('X-RateLimit-Reset', entry.resetTime.toString())
      
      return response
    }
  }
}

// Common rate limit configurations
export const authRateLimit = withRateLimit({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many authentication attempts'
})

export const apiRateLimit = withRateLimit({
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many API requests'
})

export const paymentRateLimit = withRateLimit({
  maxRequests: 10,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many payment attempts'
})