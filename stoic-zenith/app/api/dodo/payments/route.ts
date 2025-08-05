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

const dodoClient = new DodoPayments({
  bearerToken: process.env.DODO_SECRET_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body: CreatePaymentRequest = await request.json()
    const { productId, userId, customerData, returnUrl, cancelUrl } = body

    if (!productId || !userId || !customerData) {
      return NextResponse.json(
        { error: 'productId, userId, and customerData are required' },
        { status: 400 }
      )
    }

    if (!process.env.DODO_SECRET_KEY) {
      console.error('DODO_SECRET_KEY is not configured')
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      )
    }

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
    return NextResponse.json(
      { error: 'Failed to create payment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')

    if (paymentId) {
      // Return mock payment details
      const mockPayment = {
        payment: {
          id: paymentId,
          status: 'completed',
          product_id: 'pdt_1xvwazO5L41SzZeMegxyk',
          customer_id: 'cust_123',
          amount: 1400,
          currency: 'USD',
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
