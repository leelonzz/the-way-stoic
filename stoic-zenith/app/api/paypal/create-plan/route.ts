import { NextResponse } from 'next/server'

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

export async function GET(): Promise<NextResponse> {
  try {
    const accessToken = await getPayPalAccessToken()
    const environment = process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT || 'sandbox'
    const baseUrl =
      environment === 'sandbox'
        ? 'https://api-m.sandbox.paypal.com'
        : 'https://api-m.paypal.com'

    // Create product first
    const productData = {
      name: 'Philosopher Plan',
      description: 'Stoic wisdom subscription',
      type: 'SERVICE',
      category: 'SOFTWARE',
    }

    const productResponse = await fetch(`${baseUrl}/v1/catalogs/products`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    })

    const product = await productResponse.json()
    console.log('Product created:', product)

    // Create plan
    const planData = {
      product_id: product.id,
      name: 'Philosopher Monthly',
      description: '$14/month subscription',
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
    }

    const planResponse = await fetch(`${baseUrl}/v1/billing/plans`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(planData),
    })

    const plan = await planResponse.json()
    console.log('Plan created:', plan)

    return NextResponse.json({
      success: true,
      product,
      plan,
      planId: plan.id,
    })
  } catch (error) {
    console.error('Plan creation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create plan',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
