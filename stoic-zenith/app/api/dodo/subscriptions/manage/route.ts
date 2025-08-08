import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role client for subscription management
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface SubscriptionUpdateRequest {
  subscriptionId: string
  action: 'cancel' | 'update' | 'reactivate'
  cancelAtNextBilling?: boolean
  metadata?: Record<string, any>
}

/**
 * GET - Retrieve user's subscription details
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Get user's profile to find subscription info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // If user has a subscription_id, fetch details from DodoPayments
    let subscriptionDetails = null
    if (profile.subscription_id) {
      try {
        // Call DodoPayments API to get subscription details
        const dodoResponse = await fetch(`https://api.dodopayments.com/v1/subscriptions/${profile.subscription_id}`, {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DODO_API_KEY}`,
            'Content-Type': 'application/json',
          },
        })

        if (dodoResponse.ok) {
          subscriptionDetails = await dodoResponse.json()
        } else {
          console.warn('Failed to fetch subscription from DodoPayments:', dodoResponse.status)
        }
      } catch (error) {
        console.error('Error fetching subscription from DodoPayments:', error)
      }
    }

    return NextResponse.json({
      profile: {
        subscription_status: profile.subscription_status,
        subscription_plan: profile.subscription_plan,
        subscription_expires_at: profile.subscription_expires_at,
        subscription_id: profile.subscription_id,
      },
      subscription: subscriptionDetails,
    })

  } catch (error) {
    console.error('Error retrieving subscription:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve subscription details' },
      { status: 500 }
    )
  }
}

/**
 * POST - Update subscription (cancel, reactivate, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const body: SubscriptionUpdateRequest = await request.json()
    const { subscriptionId, action, cancelAtNextBilling, metadata } = body

    if (!subscriptionId || !action) {
      return NextResponse.json(
        { error: 'subscriptionId and action are required' },
        { status: 400 }
      )
    }

    let dodoResponse
    let updateData: any = {}

    switch (action) {
      case 'cancel':
        // Cancel subscription via DodoPayments API
        updateData = {
          cancel_at_next_billing_date: cancelAtNextBilling ?? true,
          status: cancelAtNextBilling ? 'active' : 'cancelled',
          metadata: metadata || {}
        }

        dodoResponse = await fetch(`https://api.dodopayments.com/v1/subscriptions/${subscriptionId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DODO_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        })
        break

      case 'reactivate':
        // Reactivate subscription
        updateData = {
          cancel_at_next_billing_date: false,
          status: 'active',
          metadata: metadata || {}
        }

        dodoResponse = await fetch(`https://api.dodopayments.com/v1/subscriptions/${subscriptionId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DODO_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        })
        break

      case 'update':
        // Update subscription metadata or other fields
        updateData = metadata || {}

        dodoResponse = await fetch(`https://api.dodopayments.com/v1/subscriptions/${subscriptionId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DODO_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: cancel, reactivate, or update' },
          { status: 400 }
        )
    }

    if (!dodoResponse.ok) {
      const errorText = await dodoResponse.text()
      console.error('DodoPayments API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to update subscription', details: errorText },
        { status: dodoResponse.status }
      )
    }

    const updatedSubscription = await dodoResponse.json()

    // Update local profile if needed
    if (action === 'cancel' && !cancelAtNextBilling) {
      // Immediately cancel - update profile
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'cancelled',
          subscription_plan: 'seeker',
          subscription_expires_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('subscription_id', subscriptionId)
    }

    return NextResponse.json({
      success: true,
      action,
      subscription: updatedSubscription,
      message: getActionMessage(action, cancelAtNextBilling)
    })

  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}

function getActionMessage(action: string, cancelAtNextBilling?: boolean): string {
  switch (action) {
    case 'cancel':
      return cancelAtNextBilling 
        ? 'Subscription will be cancelled at the end of the current billing period'
        : 'Subscription has been cancelled immediately'
    case 'reactivate':
      return 'Subscription has been reactivated'
    case 'update':
      return 'Subscription has been updated'
    default:
      return 'Subscription action completed'
  }
}
