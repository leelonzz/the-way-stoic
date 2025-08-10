import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import DodoPayments from 'dodopayments'

// Initialize Dodo client
const dodoClient = new DodoPayments({
  bearerToken: process.env.NEXT_PUBLIC_DODO_API_KEY || '',
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get user ID from request body
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Initialize Supabase with service role key for server-side operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }
    
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey
    )

    // Validate user exists
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId)
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's dodo_customer_id from profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('dodo_customer_id, email')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    if (!profile.dodo_customer_id) {
      return NextResponse.json({ 
        error: 'No subscription found. Please subscribe first to access billing portal.' 
      }, { status: 404 })
    }

    console.log('Creating customer portal session for:', {
      userId: user.id,
      dodoCustomerId: profile.dodo_customer_id
    })

    // Create customer portal session
    const portalSession = await dodoClient.customers.customerPortal.create(profile.dodo_customer_id)

    if (!portalSession.link) {
      throw new Error('Portal session link not generated')
    }

    return NextResponse.json({
      success: true,
      portalUrl: portalSession.link,
      message: 'Portal session created successfully'
    })

  } catch (error) {
    console.error('Customer portal creation error:', error)
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to create portal session'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Alternative method using query params for direct access
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }
    
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey
    )

    // Get user's dodo_customer_id from profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('dodo_customer_id')
      .eq('id', userId)
      .single()

    if (profileError || !profile || !profile.dodo_customer_id) {
      return NextResponse.json({ 
        error: 'Customer not found or no subscription' 
      }, { status: 404 })
    }

    // Create customer portal session
    const portalSession = await dodoClient.customers.customerPortal.create(profile.dodo_customer_id)

    // Redirect to portal
    return NextResponse.redirect(portalSession.link)

  } catch (error) {
    console.error('Customer portal redirect error:', error)
    
    return NextResponse.json({ 
      error: 'Failed to access portal'
    }, { status: 500 })
  }
}