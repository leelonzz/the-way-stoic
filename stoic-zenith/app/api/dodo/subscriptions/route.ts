import { NextRequest, NextResponse } from 'next/server'

interface CreateSubscriptionRequest {
  productId: string
  userId: string
  customerData: {
    email: string
    name: string
    phone?: string
    billingAddress: {
      street: string
      city: string
      state: string
      zipcode: string
      country: string
    }
  }
  returnUrl?: string
  cancelUrl?: string
}

// We'll use the MCP tools instead of manual API calls

export async function POST(request: NextRequest) {
  try {
    const body: CreateSubscriptionRequest = await request.json()
    const { productId, userId, customerData, returnUrl, cancelUrl } = body

    if (!productId || !userId || !customerData) {
      return NextResponse.json(
        { error: 'productId, userId, and customerData are required' },
        { status: 400 }
      )
    }

    // Create subscription using MCP tools directly
    // Note: In a real implementation, you would import and use the MCP tools here
    // For now, we'll simulate the MCP call structure
    const subscriptionData = {
      billing: customerData.billingAddress,
      customer: {
        email: customerData.email,
        name: customerData.name,
        phone_number: customerData.phone,
      },
      product_id: productId,
      quantity: 1,
      return_url: returnUrl,
      payment_link: true,
    }

    // This simulates what the MCP tools would return
    const subscription = {
      subscriptionId: `sub_${Date.now()}`,
      checkoutUrl: `https://checkout.dodopayments.com/${Date.now()}`,
      status: 'pending',
      customer: {
        customer_id: `cus_${Date.now()}`,
        email: customerData.email,
        name: customerData.name,
      },
      payment_id: `pay_${Date.now()}`,
    }

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Dodo subscription creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subscriptionId = searchParams.get('subscriptionId')

    if (subscriptionId) {
      // Return mock subscription details for now
      const mockSubscription = {
        subscription: {
          id: subscriptionId,
          status: 'active',
          product_id: 'pdt_1xvwazO5L41SzZeMegxyk',
          customer_id: 'cust_123',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
        }
      }
      return NextResponse.json(mockSubscription)
    }

    // Return empty list for now
    return NextResponse.json({ subscriptions: [] })
  } catch (error) {
    console.error('Dodo subscription fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}