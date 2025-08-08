import { NextRequest, NextResponse } from 'next/server'

/**
 * Test webhook endpoint to simulate DodoPayments webhook events
 * This helps test the subscription upgrade flow without needing actual DodoPayments webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const { eventType, subscriptionId, userId, customerId } = await request.json()

    if (!eventType || !subscriptionId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: eventType, subscriptionId, userId' },
        { status: 400 }
      )
    }

    // Simulate DodoPayments webhook payload
    const webhookPayload = {
      business_id: 'test_business_123',
      type: eventType,
      timestamp: new Date().toISOString(),
      data: {
        payload_type: 'subscription',
        id: subscriptionId,
        status: eventType === 'subscription.active' ? 'active' :
                eventType === 'subscription.cancelled' ? 'cancelled' : 'pending',
        customer_id: customerId || 'test_customer_123',
        product_id: 'pdt_1xvwazO5L41SzZeMegxyk',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          user_id: userId
        },
        customer: {
          customer_id: customerId || 'test_customer_123',
          email: 'test@example.com',
          name: 'Test User'
        },
        created_at: new Date().toISOString()
      }
    }

    // Create webhook headers for signature verification (simplified for testing)
    const webhookHeaders = {
      'webhook-id': `wh_${Date.now()}`,
      'webhook-signature': 'test_signature_for_development',
      'webhook-timestamp': Math.floor(Date.now() / 1000).toString(),
      'content-type': 'application/json'
    }

    // Send the webhook to our actual webhook handler
    const webhookUrl = `${request.nextUrl.origin}/api/dodo/webhook`
    
    console.log('🧪 Sending test webhook to:', webhookUrl)
    console.log('📦 Webhook payload:', JSON.stringify(webhookPayload, null, 2))

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: webhookHeaders,
      body: JSON.stringify(webhookPayload)
    })

    const webhookResult = await webhookResponse.text()

    return NextResponse.json({
      success: true,
      message: `Test webhook sent for ${eventType}`,
      webhookStatus: webhookResponse.status,
      webhookResponse: webhookResult,
      payload: webhookPayload
    })

  } catch (error) {
    console.error('Test webhook error:', error)
    return NextResponse.json(
      { error: 'Failed to send test webhook', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test webhook endpoint',
    usage: 'POST with { eventType, subscriptionId, userId, customerId? }',
    availableEvents: [
      'subscription.active',
      'subscription.on_hold',
      'subscription.failed',
      'subscription.renewed',
      'subscription.cancelled',
      'payment.succeeded',
      'payment.failed'
    ]
  })
}
