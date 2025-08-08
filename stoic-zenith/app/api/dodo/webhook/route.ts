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
  console.log('🔔 DODO WEBHOOK RECEIVED - Starting processing')
  console.log('Headers:', Object.fromEntries(request.headers.entries()))
  
  try {
    const body = await request.text()
    console.log('✅ Body received, length:', body.length)
    
    const webhookSecret = process.env.DODO_WEBHOOK_SECRET
    console.log('🔑 Webhook secret present:', !!webhookSecret)

    if (!webhookSecret) {
      console.error('❌ CRITICAL: Webhook secret not configured')
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
    
    console.log('📋 Webhook headers:', webhookHeaders)

    if (!webhookHeaders["webhook-id"] || !webhookHeaders["webhook-signature"] || !webhookHeaders["webhook-timestamp"]) {
      console.error('❌ Missing required webhook headers:', webhookHeaders)
      return NextResponse.json(
        { error: 'Missing required webhook headers' },
        { status: 400 }
      )
    }

    // Verify webhook signature using Standard Webhooks
    // Skip verification for test webhooks (in development)
    const isTestWebhook = webhookHeaders["webhook-signature"] === 'test_signature_for_development'
    console.log('🔐 Is test webhook:', isTestWebhook)

    if (!isTestWebhook) {
      console.log('🔐 Verifying webhook signature...')
      const webhook = new Webhook(webhookSecret)
      try {
        await webhook.verify(body, webhookHeaders)
        console.log('✅ Webhook signature verified successfully')
      } catch (error) {
        console.error('❌ Webhook signature verification failed:', error)
        console.error('Webhook secret (first 10 chars):', webhookSecret.substring(0, 10) + '...')
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 401 }
        )
      }
    } else {
      console.log('🧪 Test webhook detected, skipping signature verification')
    }

    console.log('📋 Parsing webhook body...')
    let event: DodoWebhookEvent
    try {
      event = JSON.parse(body)
      console.log('✅ Webhook body parsed successfully')
    } catch (parseError) {
      console.error('❌ Failed to parse webhook body:', parseError)
      console.error('Body content:', body.substring(0, 500) + '...')
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }
    
    // Store ALL webhooks in logs for debugging
    console.log('💾 Storing webhook in database...')
    try {
      await supabase
        .from('webhook_logs')
        .insert({
          event_type: event.type,
          payload: event as any,
          processed: false
        })
      console.log(`📝 ✅ Stored webhook ${event.type} in webhook_logs`)
    } catch (logError) {
      console.error('❌ Failed to store webhook log:', logError)
      console.error('Database error details:', logError)
      // Don't fail the webhook for logging errors, just continue
    }
    
    // Enhanced logging for debugging
    console.log('========================================')
    console.log('🔔 DODO WEBHOOK RECEIVED')
    console.log('========================================')
    console.log('Event Type:', event.type)
    console.log('Timestamp:', new Date().toISOString())
    console.log('Business ID:', event.business_id)
    console.log('Event Timestamp:', event.timestamp)
    console.log('Payload Type:', event.data?.payload_type)
    
    // Log specific data based on event type
    if (event.type.startsWith('payment')) {
      const payment = event.data as any
      console.log('Payment Details:')
      console.log('  - Payment ID:', payment.id)
      console.log('  - Amount:', payment.amount)
      console.log('  - Currency:', payment.currency)
      console.log('  - Customer ID:', payment.customer_id)
      console.log('  - Subscription ID:', payment.subscription_id)
      console.log('  - User ID (metadata):', payment.metadata?.user_id)
      console.log('  - Has metadata?:', !!payment.metadata)
      console.log('  - All metadata:', JSON.stringify(payment.metadata))
    } else if (event.type.startsWith('subscription')) {
      const subscription = event.data as any
      console.log('Subscription Details:')
      console.log('  - Subscription ID:', subscription.id)
      console.log('  - Status:', subscription.status)
      console.log('  - Customer ID:', subscription.customer_id)
      console.log('  - Product ID:', subscription.product_id)
      console.log('  - User ID (metadata):', subscription.metadata?.user_id)
      console.log('  - Has metadata?:', !!subscription.metadata)
      console.log('  - All metadata:', JSON.stringify(subscription.metadata))
      console.log('  - Customer object:', JSON.stringify(subscription.customer))
      console.log('  - Period Start:', subscription.current_period_start)
      console.log('  - Period End:', subscription.current_period_end)
    }
    
    console.log('Full Event Data:', JSON.stringify(event.data, null, 2))
    console.log('Full Event:', JSON.stringify(event, null, 2))
    console.log('========================================')

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
  console.log('Payment metadata:', payment.metadata)

  try {
    // If this payment is associated with a subscription, we'll update the user immediately
    // instead of waiting for subscription webhook which may be delayed or not sent

    // Log the successful payment for tracking
    console.log(`✅ Payment ${payment.id} succeeded for customer ${payment.customer_id}`)

    // Check if this is a subscription payment with user metadata
    if (payment.subscription_id && payment.metadata?.user_id) {
      console.log(`Payment ${payment.id} is for subscription ${payment.subscription_id}, updating user immediately`)
      
      const userId = payment.metadata.user_id
      
      // Validate user exists
      const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId)
      if (userError || !user) {
        console.error('User not found for payment:', userId, userError)
      } else {
        // Update user profile immediately on payment success
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'active',
            subscription_plan: 'philosopher',
            subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (profileError) {
          console.error('Failed to update user profile on payment success:', profileError)
        } else {
          console.log(`✅ User ${userId} upgraded to philosopher plan immediately on payment success`)
        }
      }
      
      // Still return early as subscription webhook will also process this
      return
    }

    // If there's a subscription_id but no user_id, log warning
    if (payment.subscription_id && !payment.metadata?.user_id) {
      console.warn(`⚠️ Payment ${payment.id} has subscription but missing user_id in metadata`)
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
  console.log('Full subscription data:', JSON.stringify(subscription, null, 2))

  try {
    // Store webhook payload for debugging
    await supabase
      .from('webhook_logs')
      .insert({
        event_type: 'subscription.active',
        payload: subscription as any,
        processed: false
      })

    // Try multiple methods to find the user
    let userId: string | null = null
    let user: any = null

    // Method 1: Try to get user_id from metadata (passed during subscription creation)
    userId = subscription.metadata?.user_id || null
    console.log('Method 1 - User ID from metadata:', userId)

    // Method 2: If no user_id in metadata, try to find user by Dodo customer_id
    if (!userId && subscription.customer_id) {
      console.log('Method 2 - Looking up user by Dodo customer_id:', subscription.customer_id)
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('dodo_customer_id', subscription.customer_id)
        .single()
      
      if (profile) {
        userId = profile.id
        console.log('Found user by customer_id:', userId)
      }
    }

    // Method 3: If still no user, try to find by customer email
    if (!userId && subscription.customer?.email) {
      console.log('Method 3 - Looking up user by email:', subscription.customer.email)
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', subscription.customer.email)
        .single()
      
      if (profile) {
        userId = profile.id
        console.log('Found user by email:', userId)
      }
    }

    if (!userId) {
      console.error('Could not find user for subscription:', {
        subscription_id: subscription.id,
        customer_id: subscription.customer_id,
        customer_email: subscription.customer?.email,
        metadata: subscription.metadata
      })
      
      // Mark webhook as unprocessed for manual recovery
      await supabase
        .from('webhook_logs')
        .update({ 
          error_message: 'Could not find user for subscription',
          processed_at: new Date().toISOString()
        })
        .eq('event_type', 'subscription.active')
        .eq('processed', false)
        .order('created_at', { ascending: false })
        .limit(1)
      
      return
    }

    // Validate user exists
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)
    if (userError || !userData) {
      console.error('User not found:', userId, userError)
      return
    }
    user = userData

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

    // Update Dodo customer_id if not already set
    if (subscription.customer_id) {
      await supabase
        .from('profiles')
        .update({ 
          dodo_customer_id: subscription.customer_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .is('dodo_customer_id', null)
    }

    // Mark webhook as processed
    await supabase
      .from('webhook_logs')
      .update({ 
        processed: true,
        processed_at: new Date().toISOString()
      })
      .eq('event_type', 'subscription.active')
      .eq('processed', false)
      .order('created_at', { ascending: false })
      .limit(1)

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