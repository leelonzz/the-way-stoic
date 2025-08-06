import { NextRequest, NextResponse } from 'next/server'
import DodoPayments from 'dodopayments'

interface CreatePaymentRequest {
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
  bearerToken: process.env.NEXT_PUBLIC_DODO_API_KEY || '',
  // Note: DodoPayments SDK uses the same base URL for both test and live environments
  // The environment is determined by the API key used
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: CreatePaymentRequest = await request.json()
    const { productId, userId, customerData, returnUrl } = body

    if (!productId || !userId || !customerData) {
      return NextResponse.json(
        { error: 'productId, userId, and customerData are required' },
        { status: 400 }
      )
    }

    if (!process.env.NEXT_PUBLIC_DODO_API_KEY) {
      console.error('NEXT_PUBLIC_DODO_API_KEY is not configured')
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      )
    }

    console.log('Creating payment with Dodo SDK:', {
      productId,
      userId,
      environment
    })

    // Create payment using Dodo Payments SDK
    const payment = await dodoClient.payments.create({
      payment_link: true,
      billing: {
        city: customerData.billingAddress.city,
        country: customerData.billingAddress.country as any, // Dodo uses specific country codes
        state: customerData.billingAddress.state,
        street: customerData.billingAddress.street,
        zipcode: customerData.billingAddress.zipcode,
      },
      customer: {
        email: customerData.email,
        name: customerData.name,
        create_new_customer: true,
      },
      product_cart: [{
        product_id: productId,
        quantity: 1,
      }],
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      metadata: {
        user_id: userId,
      },
    })

    return NextResponse.json({
      paymentId: payment.payment_id,
      checkoutUrl: payment.payment_link || '',
      status: 'pending',
    })
  } catch (error) {
    console.error('Dodo payment creation error:', error)
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json(
        { 
          error: 'Dodo Payments authentication failed', 
          details: 'Please verify your API keys and account setup',
          troubleshooting: {
            step1: 'Check NEXT_PUBLIC_DODO_API_KEY in environment variables',
            step2: 'Verify account is activated in Dodo dashboard',
            step3: 'Ensure product exists in your Dodo account'
          }
        },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create payment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')

    if (paymentId) {
      // Return mock payment details for now
      const mockPayment = {
        payment: {
          id: paymentId,
          status: 'completed',
          amount: 1499,
          currency: 'usd',
          created_at: new Date().toISOString(),
        }
      }
      return NextResponse.json(mockPayment)
    }

    // Return empty list for now
    return NextResponse.json({ payments: [] })
  } catch (error) {
    console.error('Dodo payment fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}
