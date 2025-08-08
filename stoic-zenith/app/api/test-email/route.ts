import { NextRequest, NextResponse } from 'next/server'
import { sendSubscriptionConfirmationEmail, sendPaymentReceiptEmail } from '@/lib/email'

/**
 * Test endpoint for email functionality
 * This helps test email sending without needing actual payments
 */
export async function POST(request: NextRequest) {
  try {
    const { emailType, customerEmail, customerName } = await request.json()

    if (!emailType || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: emailType, customerEmail' },
        { status: 400 }
      )
    }

    let result

    if (emailType === 'subscription') {
      result = await sendSubscriptionConfirmationEmail({
        customerName: customerName || 'Test User',
        customerEmail: customerEmail,
        subscriptionId: 'sub_test_' + Date.now(),
        productName: 'The Stoic Way - Philosopher Plan',
        amount: 1400, // $14.00 in cents
        currency: 'USD',
        billingPeriod: 'Monthly',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
    } else if (emailType === 'payment') {
      result = await sendPaymentReceiptEmail({
        customerName: customerName || 'Test User',
        customerEmail: customerEmail,
        paymentId: 'pay_test_' + Date.now(),
        productName: 'The Stoic Way',
        amount: 1400, // $14.00 in cents
        currency: 'USD',
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid emailType. Use "subscription" or "payment"' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: result.success,
      message: `Test ${emailType} email sent`,
      emailId: result.emailId,
      error: result.error,
    })

  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json(
      { error: 'Failed to send test email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test email endpoint',
    usage: 'POST with { emailType: "subscription" | "payment", customerEmail: string, customerName?: string }',
    examples: [
      {
        emailType: 'subscription',
        customerEmail: 'test@example.com',
        customerName: 'Test User'
      },
      {
        emailType: 'payment',
        customerEmail: 'test@example.com',
        customerName: 'Test User'
      }
    ]
  })
}
