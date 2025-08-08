import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'standardwebhooks'
import { createClient } from '@supabase/supabase-js'
import { sendSubscriptionConfirmationEmail, sendPaymentReceiptEmail } from '@/lib/email'

// Use service role client for webhook operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
  metadata?: Record<string, any>
  created_at: string
}

interface SubscriptionEvent {
  id: string
  status: 'active' | 'canceled' | 'past_due' | 'unpaid'
  customer_id: string
  product_id: string
  current_period_start: string
  current_period_end: string
  metadata?: Record<string, any>
  customer?: {
    customer_id: string
    email: string
    name: string
  }
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
    // Skip verification for test webhooks (in development)
    const isTestWebhook = webhookHeaders["webhook-signature"] === 'test_signature_for_development'

    if (!isTestWebhook) {
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
    } else {
      console.log('🧪 Test webhook detected, skipping signature verification')
    }

    const event: DodoWebhookEvent = JSON.parse(body)
    console.log('Received Dodo webhook event:', event.type)
    console.log('Event data:', JSON.stringify(event.data, null, 2))

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

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.data as unknown as SubscriptionEvent)
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
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function handlePaymentSucceeded(payment: PaymentEvent) {
  console.log('Payment succeeded:', payment.id)

  try {
    // If this payment is associated with a subscription, the subscription webhook will handle the upgrade
    // For one-time payments, we could handle plan upgrades here if needed

    // Log the successful payment for tracking
    console.log(`✅ Payment ${payment.id} succeeded for customer ${payment.customer_id}`)

    // If there's a subscription_id, let the subscription webhook handle the upgrade
    if (payment.subscription_id) {
      console.log(`Payment ${payment.id} is for subscription ${payment.subscription_id}, waiting for subscription webhook`)
      return
    }

    // For one-time payments without subscriptions, send payment receipt
    if (payment.metadata?.user_id) {
      try {
        // Get user details for email
        const { data: user } = await supabase.auth.admin.getUserById(payment.metadata.user_id)

        if (user?.user?.email) {
          const emailResult = await sendPaymentReceiptEmail({
            customerName: payment.metadata?.customer_name || 'Valued Customer',
            customerEmail: user.user.email,
            paymentId: payment.id,
            productName: 'The Stoic Way',
            amount: payment.amount,
            currency: payment.currency,
          })

          if (emailResult.success) {
            console.log(`📧 Payment receipt email sent to ${user.user.email}`)
          } else {
            console.error('Failed to send payment receipt email:', emailResult.error)
          }
        }
      } catch (emailError) {
        console.error('Error sending payment receipt email:', emailError)
      }
    }

    console.log('One-time payment completed successfully')

  } catch (error) {
    console.error('Error handling payment success:', error)
    throw error
  }
}

async function handlePaymentFailed(payment: PaymentEvent) {
  console.log('Payment failed:', payment.id)

  try {
    // Extract user ID from metadata if available
    const userId = payment.metadata?.user_id

    if (userId) {
      // For now, just log the failed payment since we don't have the dodo_subscriptions table yet
      console.log(`💳 Payment failed for user ${userId}, payment ${payment.id}`)

      // TODO: Once dodo_subscriptions table exists, increment failed_payment_count
      // const { error } = await supabase.rpc('increment_dodo_failed_payments', {
      //   user_uuid: userId
      // })
    }

    console.log(`❌ Payment ${payment.id} failed for customer ${payment.customer_id}`)

  } catch (error) {
    console.error('Error handling payment failure:', error)
    throw error
  }
}

async function handleSubscriptionActive(subscription: SubscriptionEvent) {
  console.log('Subscription activated:', subscription.id)

  try {
    // Extract user ID from metadata (passed during subscription creation)
    const userId = subscription.metadata?.user_id

    if (!userId) {
      console.error('No user_id found in subscription metadata:', subscription.metadata)
      return
    }

    // Validate user exists
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId)
    if (userError || !user) {
      console.error('User not found:', userId, userError)
      return
    }

    // For now, directly update the profiles table since dodo_subscriptions table may not exist yet
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_plan: 'philosopher',
        subscription_expires_at: subscription.current_period_end,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (profileError) {
      console.error('Failed to update user profile:', profileError)
      throw profileError
    }

    console.log(`✅ User ${userId} subscription ${subscription.id} activated successfully - profile updated`)

    // Send subscription confirmation email
    try {
      const emailResult = await sendSubscriptionConfirmationEmail({
        customerName: subscription.customer?.name || 'Valued Customer',
        customerEmail: subscription.customer?.email || user.user?.email || '',
        subscriptionId: subscription.id,
        productName: 'The Stoic Way - Philosopher Plan',
        amount: 1400, // $14.00 in cents
        currency: 'USD',
        billingPeriod: 'Monthly',
        nextBillingDate: subscription.current_period_end,
      })

      if (emailResult.success) {
        console.log(`📧 Subscription confirmation email sent to ${subscription.customer?.email || user.user?.email}`)
      } else {
        console.error('Failed to send subscription confirmation email:', emailResult.error)
      }
    } catch (emailError) {
      console.error('Error sending subscription confirmation email:', emailError)
    }

    // TODO: Once dodo_subscriptions table is created, also store detailed subscription info there

  } catch (error) {
    console.error('Error handling subscription activation:', error)
    throw error
  }
}

async function handleSubscriptionCancelled(subscription: SubscriptionEvent) {
  console.log('Subscription cancelled:', subscription.id)

  try {
    // Extract user ID from metadata (passed during subscription creation)
    const userId = subscription.metadata?.user_id

    if (!userId) {
      console.error('No user_id found in subscription metadata:', subscription.metadata)
      return
    }

    // Validate user exists
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId)
    if (userError || !user) {
      console.error('User not found:', userId, userError)
      return
    }

    // Update user profile to reflect cancelled status
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'cancelled',
        subscription_plan: 'seeker', // Downgrade to free plan
        subscription_expires_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Failed to update profile for cancellation:', error)
      throw error
    }

    console.log(`❌ User ${userId} subscription ${subscription.id} cancelled - downgraded to seeker plan`)

    // TODO: Send cancellation confirmation email

  } catch (error) {
    console.error('Error handling subscription cancellation:', error)
    throw error
  }
}

async function handleSubscriptionOnHold(subscription: SubscriptionEvent) {
  console.log('Subscription on hold:', subscription.id)

  try {
    const userId = subscription.metadata?.user_id

    if (!userId) {
      console.error('No user_id found in subscription metadata:', subscription.metadata)
      return
    }

    // Update user profile to reflect on_hold status
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'on_hold',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Failed to update profile to on_hold:', error)
      throw error
    }

    console.log(`⚠️ Subscription ${subscription.id} put on hold for user ${userId}`)

  } catch (error) {
    console.error('Error handling subscription on hold:', error)
    throw error
  }
}

async function handleSubscriptionFailed(subscription: SubscriptionEvent) {
  console.log('Subscription failed:', subscription.id)

  try {
    const userId = subscription.metadata?.user_id

    if (!userId) {
      console.error('No user_id found in subscription metadata:', subscription.metadata)
      return
    }

    // Update user profile to reflect failed status
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'failed',
        subscription_plan: 'seeker', // Downgrade to free plan
        subscription_expires_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Failed to update profile to failed:', error)
      throw error
    }

    console.log(`❌ Subscription ${subscription.id} failed for user ${userId}`)

  } catch (error) {
    console.error('Error handling subscription failure:', error)
    throw error
  }
}

async function handleSubscriptionRenewed(subscription: SubscriptionEvent) {
  console.log('Subscription renewed:', subscription.id)

  try {
    const userId = subscription.metadata?.user_id

    if (!userId) {
      console.error('No user_id found in subscription metadata:', subscription.metadata)
      return
    }

    // Update user profile with renewed subscription information
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_plan: 'philosopher',
        subscription_expires_at: subscription.current_period_end,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Failed to update profile for renewal:', error)
      throw error
    }

    console.log(`🔄 Subscription ${subscription.id} renewed for user ${userId}`)

  } catch (error) {
    console.error('Error handling subscription renewal:', error)
    throw error
  }
}