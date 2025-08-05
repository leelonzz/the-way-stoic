import { NextRequest, NextResponse } from 'next/server'

interface DodoProduct {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  type: 'one_time' | 'subscription'
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
  metadata?: Record<string, unknown>
}

interface CreateProductRequest {
  name: string
  description?: string
  price: number
  currency: string
  type: 'one_time' | 'subscription'
  metadata?: Record<string, unknown>
}

async function getDodoAccessToken(): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_DODO_API_KEY
  const secretKey = process.env.DODO_SECRET_KEY
  const environment = process.env.NEXT_PUBLIC_DODO_ENVIRONMENT || 'test'

  if (!apiKey || !secretKey) {
    throw new Error('Dodo Payments credentials not configured')
  }

  const baseUrl = environment === 'test' 
    ? 'https://api-test.dodopayments.com'
    : 'https://api.dodopayments.com'

  const response = await fetch(`${baseUrl}/v1/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      secret_key: secretKey
    })
  })

  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(`Failed to get Dodo access token: ${errorData}`)
  }

  const data = await response.json()
  return data.access_token
}

async function createDodoProduct(
  accessToken: string,
  productData: CreateProductRequest
): Promise<DodoProduct> {
  const environment = process.env.NEXT_PUBLIC_DODO_ENVIRONMENT || 'test'
  const baseUrl = environment === 'test' 
    ? 'https://api-test.dodopayments.com'
    : 'https://api.dodopayments.com'

  const response = await fetch(`${baseUrl}/v1/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(productData)
  })

  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(`Failed to create Dodo product: ${errorData}`)
  }

  return response.json()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, price, currency, type, metadata } = body

    if (!name || !price || !currency || !type) {
      return NextResponse.json(
        { error: 'name, price, currency, and type are required' },
        { status: 400 }
      )
    }

    const accessToken = await getDodoAccessToken()
    const product = await createDodoProduct(accessToken, {
      name,
      description,
      price,
      currency,
      type,
      metadata
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Dodo product creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('product_id')
    const status = searchParams.get('status')

    const accessToken = await getDodoAccessToken()
    const environment = process.env.NEXT_PUBLIC_DODO_ENVIRONMENT || 'test'
    const baseUrl = environment === 'test' 
      ? 'https://api-test.dodopayments.com'
      : 'https://api.dodopayments.com'

    let url = `${baseUrl}/v1/products`
    if (productId) {
      url += `/${productId}`
    } else if (status) {
      url += `?status=${status}`
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Failed to fetch Dodo products: ${errorData}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Dodo product fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
} 