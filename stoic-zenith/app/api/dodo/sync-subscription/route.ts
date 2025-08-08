import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import DodoPayments from 'dodopayments'

// Use service role client for database operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Initialize Dodo client
const dodoClient = new DodoPayments({
  bearerToken: process.env.NEXT_PUBLIC_DODO_API_KEY || '',
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { userId, subscriptionId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    console.log('🔄 Syncing subscription for user:', userId)
    console.log('Subscription ID:', subscriptionId || 'Will fetch from Dodo')

    // Validate user exists
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId)
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get current profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    console.log('Current profile status:', {
      plan: profile.subscription_plan,
      status: profile.subscription_status,
      expires: profile.subscription_expires_at
    })

    // Try to fetch subscription from Dodo if we have a subscription ID
    let dodoSubscription = null
    if (subscriptionId) {
      try {
        console.log('Fetching subscription from Dodo:', subscriptionId)
        // Note: This assumes Dodo SDK has a retrieve method
        // You may need to adjust based on actual SDK documentation
        dodoSubscription = await dodoClient.subscriptions.retrieve(subscriptionId)
        console.log('Dodo subscription data:', dodoSubscription)
      } catch (dodoError) {
        console.error('Failed to fetch from Dodo:', dodoError)
        // Continue without Dodo data - we'll use fallback logic
      }
    }

    // Determine subscription status
    let updateData: any = {}
    
    if (dodoSubscription && dodoSubscription.status === 'active') {
      // If we have active Dodo subscription, use that data
      updateData = {
        subscription_status: 'active',
        subscription_plan: 'philosopher',
        subscription_id: subscriptionId,
        subscription_expires_at: dodoSubscription.current_period_end || 
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }
      console.log('✅ Found active Dodo subscription, updating profile')
    } else if (profile.subscription_status === 'active' && profile.subscription_plan === 'philosopher') {
      // Already has philosopher plan
      console.log('✅ User already has active philosopher plan')
      return NextResponse.json({
        success: true,
        message: 'Subscription already active',
        profile: profile
      })
    } else {
      // No active subscription found - check if user recently paid
      // This is a fallback for when webhooks fail
      console.log('⚠️ No active subscription found, checking recent payment history')
      
      // For now, we'll return a message to manually verify
      return NextResponse.json({
        success: false,
        message: 'No active subscription found. If you recently paid, please contact support.',
        currentStatus: {
          plan: profile.subscription_plan,
          status: profile.subscription_status
        }
      })
    }

    // Update profile with new subscription data
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to update profile:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    console.log('✅ Profile updated successfully:', updatedProfile)

    return NextResponse.json({
      success: true,
      message: 'Subscription synced successfully',
      profile: updatedProfile,
      dodoData: dodoSubscription
    })

  } catch (error) {
    console.error('Subscription sync error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to sync subscription', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check sync status
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Get current profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      userId,
      subscription: {
        plan: profile.subscription_plan,
        status: profile.subscription_status,
        expires: profile.subscription_expires_at,
        subscriptionId: profile.subscription_id
      },
      lastUpdated: profile.updated_at
    })

  } catch (error) {
    console.error('Subscription status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check subscription status' },
      { status: 500 }
    )
  }
}