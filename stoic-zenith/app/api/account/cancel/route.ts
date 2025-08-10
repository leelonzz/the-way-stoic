import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { recordAccountCancellation } from '@/lib/trial-prevention'
import { createClient } from '@supabase/supabase-js'

// Use service role client for account operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST - Cancel user account completely
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { reason, confirmEmail } = body

    // Verify email confirmation for security
    if (confirmEmail !== user.email) {
      return NextResponse.json(
        { error: 'Email confirmation does not match' },
        { status: 400 }
      )
    }

    // Record account cancellation in history
    const cancellationResult = await recordAccountCancellation(user.id, reason)
    if (!cancellationResult.success) {
      console.error('Failed to record account cancellation:', cancellationResult.error)
      // Continue with cancellation even if history recording fails
    }

    // Cancel any active subscriptions first
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_id, subscription_status')
      .eq('id', user.id)
      .single()

    if (profile?.subscription_id && profile.subscription_status === 'active') {
      try {
        // Cancel subscription via DodoPayments API
        const dodoResponse = await fetch(`https://api.dodopayments.com/v1/subscriptions/${profile.subscription_id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DODO_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cancel_at_next_billing_date: false, // Cancel immediately
            status: 'cancelled'
          }),
        })

        if (!dodoResponse.ok) {
          console.error('Failed to cancel subscription via DodoPayments')
        }
      } catch (error) {
        console.error('Error cancelling subscription:', error)
      }
    }

    // Update profile to mark as cancelled and downgrade to seeker
    await supabase
      .from('profiles')
      .update({
        subscription_status: 'cancelled',
        subscription_plan: 'seeker',
        subscription_expires_at: null,
        account_cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    // Note: We don't actually delete the user account from auth.users
    // This preserves the trial usage history and prevents circumventing restrictions
    // The account is marked as cancelled but the data remains for security

    return NextResponse.json({
      success: true,
      message: 'Account cancelled successfully. Your trial usage history has been preserved to prevent abuse.'
    })

  } catch (error) {
    console.error('Error cancelling account:', error)
    return NextResponse.json(
      { error: 'Failed to cancel account' },
      { status: 500 }
    )
  }
}
