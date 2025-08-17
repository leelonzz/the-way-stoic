import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createSupabaseMiddlewareClient } from '@/integrations/supabase/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Allow webhook endpoints to bypass authentication
  if (request.nextUrl.pathname.startsWith('/api/dodo/webhook') || 
      request.nextUrl.pathname.startsWith('/api/paypal/webhook')) {
    return response
  }

  try {
    // Create Supabase client for middleware
    const supabase = createSupabaseMiddlewareClient(request, response)
    
    // Refresh session if expired - this will automatically handle cookie refresh
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      // Session exists, refresh it to extend expiry
      await supabase.auth.getUser()
    }
    
    return response
  } catch (error) {
    console.warn('Middleware auth refresh failed:', error)
    // Don't block the request if auth refresh fails
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (except webhooks, which are handled above)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
    // Include auth callback for session handling
    '/auth/callback',
  ],
}
