import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  (process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string
)

interface PayPalWebhookEvent {
  id: string
  event_type: string
  resource_type: string
  summary: string
  resource: {
    id: string
    status?: string
    custom_id?: string
    plan_id?: string
    billing_info?: {
      next_billing_time?: string
      last_payment?: {
        time?: string
        amount?: {
          value?: string
          currency_code?: string
        }
      }
    }
    [key: string]: unknown
  }
  links: Array<{
    href: string
    rel: string
    method: string
  }>
  event_version: string
  create_time: string
}

function verifyPayPalWebhook(
  payload: string,
  headers: Record<string, string>,
  _webhookId: string
): boolean {
  try {
    const authAlgo = headers['paypal-auth-algo']
    const transmission = headers['paypal-transmission-id']
    const certId = headers['paypal-cert-id']
    const signature = headers['paypal-transmission-sig']
    const timestamp = headers['paypal-transmission-time']

    if (!authAlgo || !transmission || !certId || !signature || !timestamp) {
      console.log('Missing required webhook headers')
      return false
    }

    return true
  } catch (error) {
    console.error('Webhook verification error:', error)
    return false
  }
}

async function handleSubscriptionEvent(
  event: PayPalWebhookEvent
): Promise<void> {
  const { event_type, resource } = event
  const subscriptionId = resource.id
  const userId = resource.custom_id
  const planId = resource.plan_id

  console.log(
    `Processing ${event_type} for subscription ${subscriptionId}, user ${userId}`
  )

  try {
    switch (event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await updateSubscriptionInDatabase({
          paypal_subscription_id: subscriptionId,
          user_id: userId,
          status: 'ACTIVE',
          plan_id: planId,
          next_billing_time: resource.billing_info?.next_billing_time,
        })
        console.log(
          `Subscription ${subscriptionId} activated for user ${userId}`
        )
        break

      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await updateSubscriptionStatus(subscriptionId, 'CANCELLED')
        console.log(
          `Subscription ${subscriptionId} cancelled for user ${userId}`
        )
        break

      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        await updateSubscriptionStatus(subscriptionId, 'SUSPENDED')
        console.log(
          `Subscription ${subscriptionId} suspended for user ${userId}`
        )
        break

      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
        await incrementFailedPayments(subscriptionId)
        console.log(
          `Payment failed for subscription ${subscriptionId}, user ${userId}`
        )
        break

      case 'BILLING.SUBSCRIPTION.EXPIRED':
        await updateSubscriptionStatus(subscriptionId, 'EXPIRED')
        console.log(`Subscription ${subscriptionId} expired for user ${userId}`)
        break

      case 'PAYMENT.SALE.COMPLETED':
        await recordPayment(subscriptionId, resource.billing_info?.last_payment)
        console.log(
          `Payment completed for subscription ${subscriptionId}, user ${userId}`
        )
        break

      case 'PAYMENT.SALE.DENIED':
        await incrementFailedPayments(subscriptionId)
        console.log(
          `Payment denied for subscription ${subscriptionId}, user ${userId}`
        )
        break

      default:
        console.log(`Unhandled event type: ${event_type}`)
    }
  } catch (error) {
    console.error(`Error handling ${event_type}:`, error)
    throw error
  }
}

async function updateSubscriptionInDatabase(data: {
  paypal_subscription_id: string
  user_id?: string
  status: string
  plan_id?: string
  next_billing_time?: string
}): Promise<void> {
  const { error } = await supabase.from('subscriptions').upsert(
    {
      paypal_subscription_id: data.paypal_subscription_id,
      user_id: data.user_id,
      status: data.status,
      paypal_plan_id: data.plan_id,
      next_billing_time: data.next_billing_time,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'paypal_subscription_id',
    }
  )

  if (error) {
    console.error('Database update error:', error)
    throw error
  }
}

async function updateSubscriptionStatus(
  subscriptionId: string,
  status: string
): Promise<void> {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('paypal_subscription_id', subscriptionId)

  if (error) {
    console.error('Status update error:', error)
    throw error
  }
}

async function incrementFailedPayments(subscriptionId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_failed_payments', {
    subscription_id: subscriptionId,
  })

  if (error) {
    console.error('Failed payment increment error:', error)
    // Don't throw here, just log
  }
}

async function recordPayment(
  subscriptionId: string,
  _paymentInfo?: unknown
): Promise<void> {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      last_payment_time: new Date().toISOString(),
      failed_payment_count: 0, // Reset failed payments on successful payment
      updated_at: new Date().toISOString(),
    })
    .eq('paypal_subscription_id', subscriptionId)

  if (error) {
    console.error('Payment record error:', error)
    // Don't throw here, just log
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const payload = await request.text()
    const headers: Record<string, string> = {}

    request.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value
    })

    const webhookId = process.env.PAYPAL_WEBHOOK_ID

    if (webhookId && !verifyPayPalWebhook(payload, headers, webhookId)) {
      console.error('Webhook verification failed')
      return NextResponse.json(
        { error: 'Webhook verification failed' },
        { status: 401 }
      )
    }

    const event: PayPalWebhookEvent = JSON.parse(payload)

    if (
      event.resource_type === 'subscription' ||
      event.event_type.startsWith('BILLING.SUBSCRIPTION') ||
      event.event_type.startsWith('PAYMENT.SALE')
    ) {
      await handleSubscriptionEvent(event)
    }

    return NextResponse.json({ success: true, received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    message: 'PayPal webhook endpoint is active',
    timestamp: new Date().toISOString(),
  })
}
