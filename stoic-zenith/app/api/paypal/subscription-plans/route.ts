import { NextRequest, NextResponse } from 'next/server'

interface PayPalPlan {
  id: string
  name: string
  description: string
  billing_cycles: {
    frequency: {
      interval_unit: string
      interval_count: number
    }
    tenure_type: string
    sequence: number
    total_cycles: number
    pricing_scheme: {
      fixed_price: {
        value: string
        currency_code: string
      }
    }
  }[]
  payment_preferences: {
    auto_bill_outstanding: boolean
    setup_fee_failure_action: string
    payment_failure_threshold: number
  }
  taxes: {
    percentage: string
    inclusive: boolean
  }
}

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  const environment = process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT || 'sandbox'

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured')
  }

  const baseUrl =
    environment === 'sandbox'
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com'

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token')
  }

  const data = await response.json()
  return data.access_token
}

async function createPayPalProduct(
  accessToken: string,
  productData: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const environment = process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT || 'sandbox'
  const baseUrl =
    environment === 'sandbox'
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com'

  const response = await fetch(`${baseUrl}/v1/catalogs/products`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(productData),
  })

  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(`Failed to create PayPal product: ${errorData}`)
  }

  return response.json()
}

async function createPayPalPlan(
  accessToken: string,
  planData: Omit<PayPalPlan, 'id'>
): Promise<PayPalPlan> {
  const environment = process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT || 'sandbox'
  const baseUrl =
    environment === 'sandbox'
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com'

  const response = await fetch(`${baseUrl}/v1/billing/plans`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(planData),
  })

  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(`Failed to create PayPal plan: ${errorData}`)
  }

  return response.json()
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { planType } = await request.json()

    if (planType !== 'philosopher') {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 })
    }

    const accessToken = await getPayPalAccessToken()

    // First, create the product
    const productData = {
      id: 'STOIC_PHILOSOPHER_PRODUCT',
      name: 'Philosopher Plan',
      description: 'For dedicated practitioners of stoic wisdom',
      type: 'SERVICE',
      category: 'SOFTWARE',
    }

    let productId = 'STOIC_PHILOSOPHER_PRODUCT'
    try {
      const product = await createPayPalProduct(accessToken, productData)
      productId = product.id
    } catch (error) {
      // Product might already exist, use the existing ID
      console.log('Product creation failed, using existing ID:', error)
    }

    // Then create the subscription plan
    const planData = {
      product_id: productId,
      name: 'Philosopher Monthly Subscription',
      description: 'For dedicated practitioners of stoic wisdom - $14/month',
      billing_cycles: [
        {
          frequency: {
            interval_unit: 'MONTH',
            interval_count: 1,
          },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: {
              value: '14.00',
              currency_code: 'USD',
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3,
      },
      taxes: {
        percentage: '0.00',
        inclusive: false,
      },
    }

    const plan = await createPayPalPlan(accessToken, planData)

    return NextResponse.json({
      success: true,
      planId: plan.id,
      plan,
    })
  } catch (error) {
    console.error('PayPal plan creation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create subscription plan',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET(): Promise<NextResponse> {
  try {
    const accessToken = await getPayPalAccessToken()
    const environment = process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT || 'sandbox'
    const baseUrl =
      environment === 'sandbox'
        ? 'https://api-m.sandbox.paypal.com'
        : 'https://api-m.paypal.com'

    const response = await fetch(`${baseUrl}/v1/billing/plans`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch plans')
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      plans: data.plans || [],
    })
  } catch (error) {
    console.error('PayPal plans fetch error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch subscription plans',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
