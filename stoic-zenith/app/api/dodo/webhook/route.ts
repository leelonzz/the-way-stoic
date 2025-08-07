import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'standardwebhooks'
import { supabase } from '@/integrations/supabase/client'

interface DodoWebhookEvent {
  business_id: string
  type: string
  timestamp: string
  data: {
    payload_type: string
    [key: string]: any
  }
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const webhookSecret = process.env.DODO_WEBHOOK_SECRET

    if (!webhookSecret) {
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Get Standard Webhooks headers
    const webhookHeaders = {
      "webhook-id": request.headers.get("webhook-id") || "",
      "webhook-signature": request.headers.get("webhook-signature") || "",
      "webhook-timestamp": request.headers.get("webhook-timestamp") || "",
    }

    if (!webhookHeaders["webhook-id"] || !webhookHeaders["webhook-signature"] || !webhookHeaders["webhook-timestamp"]) {
      return NextResponse.json(
        { error: 'Missing required webhook headers' },
        { status: 400 }
      )
    }

    // Verify webhook signature using Standard Webhooks
    const webhook = new Webhook(webhookSecret)
    try {
      await webhook.verify(body, webhookHeaders)
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }

    const event: DodoWebhookEvent = JSON.parse(body)
    console.log('Received Dodo webhook event:', event.type)

    // Handle different event types according to Dodo Payments documentation
    switch (event.type) {
      case 'payment.succeeded':
        await handlePaymentSucceeded(event.data as unknown as PaymentEvent)
        break

      case 'payment.failed':
        await handlePaymentFailed(event.data as unknown as PaymentEvent)
        break

      case 'subscription.active':
        await handleSubscriptionActive(event.data as unknown as SubscriptionEvent)
        break

      case 'subscription.on_hold':
        await handleSubscriptionOnHold(event.data as unknown as SubscriptionEvent)
        break

      case 'subscription.failed':
        await handleSubscriptionFailed(event.data as unknown as SubscriptionEvent)
        break

      case 'subscription.renewed':
        await handleSubscriptionRenewed(event.data as unknown as SubscriptionEvent)
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

async function handlePaymentSucceeded(payment: PaymentEvent) {
  console.log('Payment succeeded:', payment.id)

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

async function handleSubscriptionActive(subscription: SubscriptionEvent) {
  console.log('Subscription activated:', subscription.id)

  try {
    // Extract customer information to find the user
    const customerId = (subscription as any).customer?.customer_id;
    if (!customerId) {
      console.error('No customer ID found in subscription event');
      return;
    }

    // Update user profile with subscription details
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_plan: 'philosopher',
        subscription_id: subscription.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', customerId); // Assuming customer_id is the user ID

    if (error) {
      console.error('Failed to update user subscription status:', error);
      throw error;
    }

    console.log(`✅ User ${customerId} subscription activated successfully`);
  } catch (error) {
    console.error('Error handling subscription activation:', error);
    throw error;
  }
}

async function handleSubscriptionOnHold(subscription: SubscriptionEvent) {
  console.log('Subscription on hold:', subscription.id)

  // Update your database with subscription status
  // Notify user of payment issues
  // etc.
}

async function handleSubscriptionFailed(subscription: SubscriptionEvent) {
  console.log('Subscription failed:', subscription.id)

  // Update your database with subscription status
  // Send failure notification
  // etc.
}

async function handleSubscriptionRenewed(subscription: SubscriptionEvent) {
  console.log('Subscription renewed:', subscription.id)

  // Update your database with subscription renewal
  // Send renewal confirmation
  // etc.
}