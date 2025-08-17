import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import DodoPayments from 'dodopayments'

// Initialize Dodo client
const dodoClient = new DodoPayments({
  bearerToken: process.env.NEXT_PUBLIC_DODO_API_KEY || '',
})

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')
    const userId = searchParams.get('userId')

    if (!paymentId) {
      return NextResponse.json(
        { error: 'paymentId is required' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Initialize Supabase with service role key for server-side operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Validate user exists and get their dodo_customer_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('dodo_customer_id, email')
      .eq('id', userId)
      .single()

    if (profileError || !profile || !profile.dodo_customer_id) {
      return NextResponse.json(
        {
          error: 'User profile not found or no customer ID',
        },
        { status: 404 }
      )
    }

    console.log('Retrieving invoice for payment:', {
      paymentId,
      userId,
      customerEmail: profile.email,
    })

    try {
      // Try to get invoice using DodoPayments SDK
      const invoiceResponse =
        await dodoClient.invoices.payments.retrieve(paymentId)

      // If successful, return the invoice data as PDF
      if (invoiceResponse) {
        // Convert the response to a readable stream or blob
        const invoiceBlob =
          invoiceResponse instanceof Response
            ? await invoiceResponse.blob()
            : invoiceResponse

        // Set headers for PDF download
        return new NextResponse(invoiceBlob, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="invoice-${paymentId}.pdf"`,
            'Cache-Control': 'no-cache',
          },
        })
      }
    } catch (dodoError) {
      console.error('DodoPayments invoice retrieval failed:', dodoError)

      // If DodoPayments fails, create a simple invoice response
      return NextResponse.json(
        {
          error: 'Invoice not available from payment provider',
          message: 'Please contact support for your invoice',
          paymentId,
          customerEmail: profile.email,
          suggestion:
            'You can use the payment confirmation email as proof of payment',
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        error: 'Invoice not found',
      },
      { status: 404 }
    )
  } catch (error) {
    console.error('Invoice retrieval error:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to retrieve invoice',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { paymentId, userId } = body

    if (!paymentId || !userId) {
      return NextResponse.json(
        {
          error: 'paymentId and userId are required',
        },
        { status: 400 }
      )
    }

    // Same logic as GET but with POST body
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('dodo_customer_id, email')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        {
          error: 'User profile not found',
        },
        { status: 404 }
      )
    }

    try {
      const invoiceResponse =
        await dodoClient.invoices.payments.retrieve(paymentId)

      if (invoiceResponse) {
        return NextResponse.json({
          success: true,
          message: 'Invoice found',
          paymentId,
          downloadUrl: `/api/dodo/invoice?paymentId=${paymentId}&userId=${userId}`,
        })
      }
    } catch (dodoError) {
      console.error('Invoice check failed:', dodoError)
    }

    return NextResponse.json({
      success: false,
      error: 'Invoice not available',
      paymentId,
      customerEmail: profile.email,
    })
  } catch (error) {
    console.error('Invoice check error:', error)

    return NextResponse.json(
      {
        error: 'Failed to check invoice',
      },
      { status: 500 }
    )
  }
}
