import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role client for webhook operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Get unprocessed webhooks
    const { data: webhooks, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .eq('processed', false)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch webhooks' }, { status: 500 })
    }

    return NextResponse.json({
      unprocessed: webhooks?.length || 0,
      webhooks: webhooks || []
    })
  } catch (error) {
    console.error('Webhook recovery fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch webhooks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { webhookId, userId, customerId } = await request.json()

    if (!webhookId) {
      return NextResponse.json({ error: 'webhookId is required' }, { status: 400 })
    }

    // Get the webhook from logs
    const { data: webhook, error: fetchError } = await supabase
      .from('webhook_logs')
      .select('*')
      .eq('id', webhookId)
      .single()

    if (fetchError || !webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 })
    }

    console.log('Processing webhook recovery:', {
      webhookId,
      eventType: webhook.event_type,
      userId,
      customerId
    })

    const payload = webhook.payload
    let targetUserId = userId

    // If no userId provided, try to find it
    if (!targetUserId) {
      // Try customer_id lookup
      if (customerId || payload?.data?.customer_id) {
        const lookupCustomerId = customerId || payload?.data?.customer_id
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('dodo_customer_id', lookupCustomerId)
          .single()
        
        if (profile) {
          targetUserId = profile.id
          console.log('Found user by customer_id:', targetUserId)
        }
      }

      // Try email lookup
      if (!targetUserId && payload?.data?.customer?.email) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', payload.data.customer.email)
          .single()
        
        if (profile) {
          targetUserId = profile.id
          console.log('Found user by email:', targetUserId)
        }
      }
    }

    if (!targetUserId) {
      return NextResponse.json({ 
        error: 'Could not determine user for webhook',
        suggestion: 'Please provide userId or customerId'
      }, { status: 400 })
    }

    // Process based on event type
    let result = null
    
    if (webhook.event_type === 'subscription.active' || webhook.event_type === 'payment.succeeded') {
      // Update user to philosopher plan
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_plan: 'philosopher',
          subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          subscription_id: payload?.data?.id || payload?.data?.subscription_id,
          dodo_customer_id: customerId || payload?.data?.customer_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', targetUserId)
        .select()
        .single()

      if (updateError) {
        console.error('Failed to update profile:', updateError)
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
      }

      result = { message: 'User upgraded to philosopher plan' }
    } else if (webhook.event_type === 'subscription.cancelled') {
      // Downgrade to seeker plan
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'cancelled',
          subscription_plan: 'seeker',
          subscription_expires_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', targetUserId)
        .select()
        .single()

      if (updateError) {
        console.error('Failed to update profile:', updateError)
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
      }

      result = { message: 'User downgraded to seeker plan' }
    } else {
      result = { message: `Event type ${webhook.event_type} not implemented for recovery` }
    }

    // Mark webhook as processed
    await supabase
      .from('webhook_logs')
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
        error_message: null
      })
      .eq('id', webhookId)

    return NextResponse.json({
      success: true,
      userId: targetUserId,
      result
    })

  } catch (error) {
    console.error('Webhook recovery error:', error)
    return NextResponse.json({ 
      error: 'Failed to process webhook recovery',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE endpoint to clear processed webhooks
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clearAll = searchParams.get('all') === 'true'

    const query = supabase
      .from('webhook_logs')
      .delete()
    
    if (!clearAll) {
      query.eq('processed', true)
    }

    const { error } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to clear webhooks' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: clearAll ? 'All webhooks cleared' : 'Processed webhooks cleared'
    })

  } catch (error) {
    console.error('Webhook clear error:', error)
    return NextResponse.json({ error: 'Failed to clear webhooks' }, { status: 500 })
  }
}