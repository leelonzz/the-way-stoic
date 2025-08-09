import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

// Browser-side Supabase client with cookie handling
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return document.cookie
            .split(';')
            .map(cookie => cookie.trim())
            .filter(cookie => cookie)
            .map(cookie => {
              const [name, ...rest] = cookie.split('=')
              return { name: name.trim(), value: rest.join('=') }
            })
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options = {} }) => {
            let cookieString = `${name}=${value}`

            // Always set path to root
            cookieString += `; path=${options.path || '/'}`

            // Set secure flag for production (HTTPS)
            const isProduction = process.env.NODE_ENV === 'production' ||
                                window.location.protocol === 'https:'
            if (isProduction || options.secure) {
              cookieString += '; secure'
            }

            // Set SameSite to Lax for better compatibility with OAuth flows
            const sameSite = options.sameSite || 'lax'
            cookieString += `; samesite=${sameSite}`

            if (options.maxAge) {
              cookieString += `; max-age=${options.maxAge}`
            }
            if (options.domain) {
              cookieString += `; domain=${options.domain}`
            }
            if (options.httpOnly) {
              cookieString += '; httponly'
            }

            document.cookie = cookieString
          })
        },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        debug: false,
        // Use cookies for storage in production
        storage: {
          getItem: (key: string) => {
            // First try localStorage, fallback to cookies
            try {
              const item = localStorage.getItem(key)
              if (item) return item
            } catch {}
            
            // Fallback to cookies
            const cookies = document.cookie.split(';')
            const cookie = cookies.find(c => c.trim().startsWith(`${key}=`))
            return cookie ? cookie.split('=')[1] : null
          },
          setItem: (key: string, value: string) => {
            // Store in both localStorage and cookies for reliability
            try {
              localStorage.setItem(key, value)
            } catch {}

            // Also store in cookies with long expiry and proper production settings
            const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
            const isProduction = process.env.NODE_ENV === 'production' ||
                                window.location.protocol === 'https:'
            const secureFlag = isProduction ? '; secure' : ''
            document.cookie = `${key}=${value}; expires=${expires.toUTCString()}; path=/${secureFlag}; samesite=lax`
          },
          removeItem: (key: string) => {
            try {
              localStorage.removeItem(key)
            } catch {}
            
            // Remove from cookies
            document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
          },
        },
      },
      global: {
        headers: {
          'X-Client-Info': 'stoic-zenith-web',
          'Cache-Control': 'no-cache',
        },
      },
    }
  )
}

// Singleton instance for browser client
let supabaseBrowserClient: ReturnType<typeof createSupabaseBrowserClient> | undefined

export function getSupabaseBrowserClient() {
  // Handle SSR gracefully
  if (typeof window === 'undefined') {
    // Return a mock client for SSR that won't break
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signInWithOAuth: () => Promise.resolve({ data: { url: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        exchangeCodeForSession: () => Promise.resolve({ data: { session: null }, error: null })
      },
      from: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: { code: 'PGRST116' } })
        })
      })
    } as any
  }
  
  if (!supabaseBrowserClient) {
    supabaseBrowserClient = createSupabaseBrowserClient()
  }
  
  return supabaseBrowserClient
}