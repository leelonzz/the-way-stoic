import { NextRequest, NextResponse } from 'next/server'
import { randomBytes, createHmac } from 'crypto'

const CSRF_SECRET = process.env.CSRF_SECRET || 'your-csrf-secret-key'

export function generateCSRFToken(): string {
  const token = randomBytes(32).toString('hex')
  const timestamp = Date.now().toString()
  const signature = createHmac('sha256', CSRF_SECRET)
    .update(token + timestamp)
    .digest('hex')
  
  return `${token}.${timestamp}.${signature}`
}

export function verifyCSRFToken(token: string): boolean {
  try {
    const [tokenPart, timestamp, signature] = token.split('.')
    
    if (!tokenPart || !timestamp || !signature) {
      return false
    }

    // Check if token is not expired (24 hours)
    const tokenAge = Date.now() - parseInt(timestamp)
    if (tokenAge > 24 * 60 * 60 * 1000) {
      return false
    }

    // Verify signature
    const expectedSignature = createHmac('sha256', CSRF_SECRET)
      .update(tokenPart + timestamp)
      .digest('hex')
    
    return signature === expectedSignature
  } catch {
    return false
  }
}

export function withCSRF(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Skip CSRF for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return handler(req)
    }

    const csrfToken = req.headers.get('x-csrf-token') || req.headers.get('X-CSRF-Token')
    
    if (!csrfToken || !verifyCSRFToken(csrfToken)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      )
    }

    return handler(req)
  }
}