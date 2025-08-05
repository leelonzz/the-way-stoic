import { NextRequest, NextResponse } from 'next/server'

interface DodoSubscription {
  id: string
  status: string
  customer_id: string
  product_id: string
  current_period_start: string
  current_period_end: string
  created_at: string
  updated_at: string
}

interface CreateSubscriptionRequest {
  customer_id: string
  product_id: string
  payment_method_id?: string
  trial_end?: number
  metadata?: Record<string, any>
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

async function createDodoSubscription(
  accessToken: string,
  subscriptionData: CreateSubscriptionRequest
): Promise<DodoSubscription> {
  const environment = process.env.NEXT_PUBLIC_DODO_ENVIRONMENT || 'test'
  const baseUrl = environment === 'test' 
    ? 'https://api-test.dodopayments.com'
    : 'https://api.dodopayments.com'

  const response = await fetch(`${baseUrl}/v1/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(subscriptionData)
  })

  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(`Failed to create Dodo subscription: ${errorData}`)
  }

  return response.json()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customer_id, product_id, payment_method_id, trial_end, metadata } = body

    if (!customer_id || !product_id) {
      return NextResponse.json(
        { error: 'customer_id and product_id are required' },
        { status: 400 }
      )
    }

    const accessToken = await getDodoAccessToken()
    const subscription = await createDodoSubscription(accessToken, {
      customer_id,
      product_id,
      payment_method_id,
      trial_end,
      metadata
    })

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Dodo subscription creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customer_id')
    const subscriptionId = searchParams.get('subscription_id')

    const accessToken = await getDodoAccessToken()
    const environment = process.env.NEXT_PUBLIC_DODO_ENVIRONMENT || 'test'
    const baseUrl = environment === 'test' 
      ? 'https://api-test.dodopayments.com'
      : 'https://api.dodopayments.com'

    let url = `${baseUrl}/v1/subscriptions`
    if (subscriptionId) {
      url += `/${subscriptionId}`
    } else if (customerId) {
      url += `?customer_id=${customerId}`
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Failed to fetch Dodo subscriptions: ${errorData}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Dodo subscription fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
} 