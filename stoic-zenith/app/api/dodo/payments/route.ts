import { NextRequest, NextResponse } from 'next/server'

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

export async function POST(request: NextRequest) {
  try {
    const body: CreatePaymentRequest = await request.json()
    const { productId, userId, customerData, returnUrl } = body

    if (!productId || !userId || !customerData) {
      return NextResponse.json(
        { error: 'productId, userId, and customerData are required' },
        { status: 400 }
      )
    }

    // Create customer first
    const customerResponse = await fetch('/api/dodo/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: customerData.email,
        name: customerData.name,
        phone_number: customerData.phone,
      }),
    })

    if (!customerResponse.ok) {
      throw new Error('Failed to create customer')
    }

    const customer = await customerResponse.json()

    // For now, return a mock payment response
    // In a real implementation, this would use the MCP tools to create a payment
    const mockPayment = {
      paymentId: `pay_${Date.now()}`,
      checkoutUrl: `https://checkout.dodopayments.com/payment/${Date.now()}`,
      status: 'pending',
      customer_id: customer.customer_id,
      product_id: productId,
      return_url: returnUrl,
    }

    return NextResponse.json(mockPayment)
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
