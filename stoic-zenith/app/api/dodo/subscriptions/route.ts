import { NextRequest, NextResponse } from 'next/server'
import DodoPayments from 'dodopayments'

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

// Initialize Dodo client with correct configuration
const environment = process.env.NEXT_PUBLIC_DODO_ENVIRONMENT || 'test'

const dodoClient = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY || '',
  // Note: DodoPayments SDK uses the same base URL for both test and live environments
  // The environment is determined by the API key used
})

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

    if (!process.env.DODO_PAYMENTS_API_KEY) {
      console.error('DODO_PAYMENTS_API_KEY is not configured')
      return NextResponse.json(
        { error: 'Subscription service not configured' },
        { status: 500 }
      )
    }

    console.log('Creating subscription with Dodo SDK:', {
      productId,
      userId,
      environment
    })

    // Create subscription using Dodo Payments SDK
    const subscription = await dodoClient.subscriptions.create({
      billing: {
        city: customerData.billingAddress.city,
        country: customerData.billingAddress.country as any,
        state: customerData.billingAddress.state,
        street: customerData.billingAddress.street,
        zipcode: customerData.billingAddress.zipcode,
      },
      customer: {
        email: customerData.email,
        name: customerData.name,
        phone_number: customerData.phone,
        create_new_customer: true,
      },
      product_id: productId,
      quantity: 1,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success`,
      payment_link: true,
      metadata: {
        user_id: userId,
      },
    })

    return NextResponse.json({
      subscriptionId: subscription.subscription_id,
      checkoutUrl: subscription.payment_link || '',
      status: 'pending',
      customer: subscription.customer,
      payment_id: subscription.payment_id,
    })
  } catch (error) {
    console.error('Dodo subscription creation error:', error)
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json(
        { 
          error: 'Dodo Payments authentication failed', 
          details: 'Please verify your API keys and account setup',
          troubleshooting: {
            step1: 'Check DODO_PAYMENTS_API_KEY in environment variables',
            step2: 'Verify account is activated in Dodo dashboard',
            step3: 'Ensure product exists in your Dodo account'
          }
        },
        { status: 401 }
      )
    }
    
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