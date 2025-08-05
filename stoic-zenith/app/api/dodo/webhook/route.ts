import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

interface DodoWebhookEvent {
  id: string
  type: string
  data: {
    id: string
    object: string
    [key: string]: any
  }
  created_at: string
}

interface PaymentEvent {
  id: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  amount: number
  currency: string
  customer_id: string
  subscription_id?: string
  product_id: string
  created_at: string
}

interface SubscriptionEvent {
  id: string
  status: 'active' | 'canceled' | 'past_due' | 'unpaid'
  customer_id: string
  product_id: string
  current_period_start: string
  current_period_end: string
  created_at: string
}

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-dodo-signature')
    const webhookSecret = process.env.DODO_WEBHOOK_SECRET

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: 'Missing signature or webhook secret' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature, webhookSecret)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const event: DodoWebhookEvent = JSON.parse(body)
    console.log('Received Dodo webhook event:', event.type)

    // Handle different event types
    switch (event.type) {
      case 'payment.completed':
        await handlePaymentCompleted(event.data as unknown as PaymentEvent)
        break

      case 'payment.failed':
        await handlePaymentFailed(event.data as unknown as PaymentEvent)
        break

      case 'subscription.created':
        await handleSubscriptionCreated(event.data as unknown as SubscriptionEvent)
        break

      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data as unknown as SubscriptionEvent)
        break

      case 'subscription.canceled':
        await handleSubscriptionCanceled(event.data as unknown as SubscriptionEvent)
        break

      case 'subscription.payment_failed':
        await handleSubscriptionPaymentFailed(event.data as unknown as SubscriptionEvent)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Dodo webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentCompleted(payment: PaymentEvent) {
  console.log('Payment completed:', payment.id)
  
  // Update your database with payment status
  // Update user subscription status
  // Send confirmation email
  // etc.
}

async function handlePaymentFailed(payment: PaymentEvent) {
  console.log('Payment failed:', payment.id)
  
  // Update your database with payment status
  // Notify user of payment failure
  // etc.
}

async function handleSubscriptionCreated(subscription: SubscriptionEvent) {
  console.log('Subscription created:', subscription.id)
  
  // Update your database with subscription details
  // Send welcome email
  // etc.
}

async function handleSubscriptionUpdated(subscription: SubscriptionEvent) {
  console.log('Subscription updated:', subscription.id)
  
  // Update your database with subscription changes
  // etc.
}

async function handleSubscriptionCanceled(subscription: SubscriptionEvent) {
  console.log('Subscription canceled:', subscription.id)
  
  // Update your database with subscription status
  // Send cancellation email
  // etc.
}

async function handleSubscriptionPaymentFailed(subscription: SubscriptionEvent) {
  console.log('Subscription payment failed:', subscription.id)
  
  // Update your database with subscription status
  // Notify user of payment failure
  // etc.
} 