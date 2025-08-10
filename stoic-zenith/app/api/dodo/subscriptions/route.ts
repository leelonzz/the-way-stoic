import { NextRequest, NextResponse } from 'next/server'
import DodoPayments from 'dodopayments'
import { createClient } from '@supabase/supabase-js'
import { getEffectiveSubscriptionPlan } from '@/utils/subscription'
import { checkTrialEligibility } from '@/lib/trial-prevention'

interface CreateSubscriptionRequest {
  productId: string
  userId: string
  customerData: {
    email: string
    name: string
    phone?: string
    billingAddress: {
      street: string
      city: string
      state: string
      zipcode: string
      country: string
    }
  }
  returnUrl?: string
  cancelUrl?: string
}

// Initialize Dodo client with correct configuration
const environment = process.env.NEXT_PUBLIC_DODO_ENVIRONMENT || 'test'

const dodoClient = new DodoPayments({
  bearerToken: process.env.NEXT_PUBLIC_DODO_API_KEY || '',
  // Note: DodoPayments SDK uses the same base URL for both test and live environments
  // The environment is determined by the API key used
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  let profile: any = null
  let userId: string = ''
  let productId: string = ''
  let supabase: any = null

  try {
    const body: CreateSubscriptionRequest = await request.json()
    const { productId: reqProductId, userId: reqUserId, customerData, returnUrl } = body
    userId = reqUserId
    productId = reqProductId

    if (!productId || !userId || !customerData) {
      return NextResponse.json(
        { error: 'productId, userId, and customerData are required' },
        { status: 400 }
      )
    }

    if (!process.env.NEXT_PUBLIC_DODO_API_KEY) {
      console.error('NEXT_PUBLIC_DODO_API_KEY is not configured')
      return NextResponse.json(
        { error: 'Subscription service not configured' },
        { status: 500 }
      )
    }

    console.log('Creating subscription with Dodo SDK:', {
      productId,
      userId,
      environment
    })

    // Check if user is already on trial - prevent double subscription
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_plan, subscription_status, trial_expires_at, dodo_customer_id, has_used_trial')
      .eq('id', userId)
      .single()

    profile = profileData
    
    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Get effective plan to check if user is on trial
    const effectivePlan = getEffectiveSubscriptionPlan(profile)
    
    // Prevent trial users from upgrading while on trial
    if (effectivePlan === 'philosopher' && profile.subscription_status !== 'active') {
      return NextResponse.json(
        { 
          error: 'Trial users cannot upgrade while on trial',
          details: 'Please wait for your trial to expire before subscribing, or contact support to convert your trial to a paid subscription.'
        },
        { status: 409 }
      )
    }

    // Prevent users with active paid subscriptions from creating new ones
    if (profile.subscription_status === 'active' && profile.subscription_plan === 'philosopher') {
      return NextResponse.json(
        {
          error: 'User already has an active subscription',
          details: 'Please manage your existing subscription instead of creating a new one.'
        },
        { status: 409 }
      )
    }

    // Determine if user is a returning customer and trial eligibility
    // Validate customer_id format (should start with 'cust_' for Dodo)
    const hasValidCustomerId = profile.dodo_customer_id &&
      (profile.dodo_customer_id.startsWith('cust_') || profile.dodo_customer_id.startsWith('customer_'))
    const isReturningCustomer = hasValidCustomerId

    // Check comprehensive trial eligibility (includes cancelled subscription check)
    const trialEligibility = await checkTrialEligibility(userId)
    const trialPeriodDays = trialEligibility.eligible ? 7 : 0 // 7 days trial for eligible users, 0 for ineligible

    // If customer_id exists but is invalid format, clear it and treat as new customer
    if (profile.dodo_customer_id && !hasValidCustomerId) {
      console.warn('🚨 Invalid customer_id format detected:', profile.dodo_customer_id, 'treating as new customer')
    }

    console.log('Creating subscription for user:', {
      userId,
      isReturningCustomer,
      trialEligible: trialEligibility.eligible,
      trialPeriodDays,
      dodoCustomerId: profile.dodo_customer_id
    })

    // Create subscription using Dodo Payments SDK
    const subscriptionData: any = {
      billing: {
        city: customerData.billingAddress.city,
        country: customerData.billingAddress.country as any,
        state: customerData.billingAddress.state,
        street: customerData.billingAddress.street,
        zipcode: customerData.billingAddress.zipcode,
      },
      product_id: productId,
      quantity: 1,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success`,
      payment_link: true,
      trial_period_days: trialPeriodDays,
      metadata: {
        user_id: userId,
      },
    }

    // Handle customer creation vs existing customer
    if (isReturningCustomer) {
      // Use existing customer - pass ONLY customer_id as per Dodo API docs
      subscriptionData.customer = {
        customer_id: profile.dodo_customer_id
      }
    } else {
      // Create new customer
      subscriptionData.customer = {
        email: customerData.email,
        name: customerData.name,
        phone_number: customerData.phone,
        create_new_customer: true,
      }
    }

    console.log('🚀 Sending subscription data to Dodo:', JSON.stringify(subscriptionData, null, 2))
    
    const subscription = await dodoClient.subscriptions.create(subscriptionData)

    // Store the Dodo customer_id in the user's profile for webhook mapping
    if (subscription.customer?.customer_id) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          dodo_customer_id: subscription.customer.customer_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
      
      if (updateError) {
        console.error('Failed to store Dodo customer_id:', updateError)
        // Don't fail the request, just log the error
      } else {
        console.log(`Stored Dodo customer_id ${subscription.customer.customer_id} for user ${userId}`)
      }
    }

    return NextResponse.json({
      subscriptionId: subscription.subscription_id,
      checkoutUrl: subscription.payment_link || '',
      status: 'pending',
      customer: subscription.customer,
      payment_id: subscription.payment_id,
    })
  } catch (error) {
    console.error('🚨 Dodo subscription creation error:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      userId,
      productId,
      isReturningCustomer: !!profile?.dodo_customer_id,
      hasUsedTrial: profile?.has_used_trial
    })
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json(
        { 
          error: 'Dodo Payments authentication failed', 
          details: 'Please verify your API keys and account setup',
          troubleshooting: {
            step1: 'Check NEXT_PUBLIC_DODO_API_KEY in environment variables',
            step2: 'Verify account is activated in Dodo dashboard',
            step3: 'Ensure product exists in your Dodo account'
          }
        },
        { status: 401 }
      )
    }

    // Handle 404 errors (invalid customer_id or product_id)
    if (error instanceof Error && (error.message.includes('404') || error.message.includes('Not Found'))) {
      console.error('🚨 Dodo API returned 404 - likely invalid customer_id or product_id')
      
      // If this is a returning customer with invalid customer_id, clear it and suggest retry
      if (profile?.dodo_customer_id) {
        // Clear the invalid customer_id
        await supabase
          .from('profiles')
          .update({ 
            dodo_customer_id: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
        
        return NextResponse.json(
          { 
            error: 'Customer account needs to be reset', 
            details: 'Your customer account has been reset. Please try subscribing again.',
            retryable: true
          },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { 
          error: 'Subscription service error', 
          details: 'The subscription service is temporarily unavailable. Please try again later.'
        },
        { status: 503 }
      )
    }

    // Handle customer creation errors
    if (error instanceof Error && (
      error.message.includes('customer') || 
      error.message.includes('Customer') ||
      error.message.includes('duplicate')
    )) {
      return NextResponse.json(
        { 
          error: 'Customer creation failed', 
          details: 'There may be an issue with your existing customer account. Please contact support.',
          supportInfo: 'Please provide your user ID for assistance.'
        },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create subscription', 
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        userMessage: 'Unable to create subscription. Please try again or contact support if the problem persists.'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const subscriptionId = searchParams.get('subscriptionId')

    if (subscriptionId) {
      // Return mock subscription details for now
      const mockSubscription = {
        subscription: {
          id: subscriptionId,
          status: 'active',
          product_id: 'pdt_1xvwazO5L41SzZeMegxyk',
          customer_id: 'cust_123',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
        }
      }
      return NextResponse.json(mockSubscription)
    }

    // Return empty list for now
    return NextResponse.json({ subscriptions: [] })
  } catch (error) {
    console.error('Dodo subscription fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}