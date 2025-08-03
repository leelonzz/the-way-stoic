import { NextRequest, NextResponse } from 'next/server';

interface CreateSubscriptionRequest {
  planId: string;
  userId: string;
  paymentToken?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

interface PayPalSubscription {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const environment = process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT || 'sandbox';
  
  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }

  const baseUrl = environment === 'sandbox' 
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token');
  }

  const data = await response.json();
  return data.access_token;
}

async function createPayPalSubscription(
  accessToken: string,
  planId: string,
  userId: string,
  paymentToken?: string,
  returnUrl?: string,
  cancelUrl?: string
): Promise<PayPalSubscription> {
  const environment = process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT || 'sandbox';
  const baseUrl = environment === 'sandbox' 
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const subscriptionData: Record<string, unknown> = {
    plan_id: planId,
    custom_id: userId,
    application_context: {
      brand_name: 'The Way Stoic',
      locale: 'en-US',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'SUBSCRIBE_NOW',
      payment_method: {
        payer_selected: 'PAYPAL',
        payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
      },
      return_url: returnUrl || `${appUrl}/subscription/success`,
      cancel_url: cancelUrl || `${appUrl}/subscription/cancel`,
    },
  };

  if (paymentToken) {
    subscriptionData.payment_source = {
      paypal: {
        vault_id: paymentToken,
      },
    };
  }

  const response = await fetch(`${baseUrl}/v1/billing/subscriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(subscriptionData),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to create PayPal subscription: ${errorData}`);
  }

  return response.json();
}

export async function POST(request: NextRequest) {
  try {
    const { planId, userId, paymentToken, returnUrl, cancelUrl }: CreateSubscriptionRequest = await request.json();

    if (!planId || !userId) {
      return NextResponse.json(
        { error: 'Plan ID and User ID are required' },
        { status: 400 }
      );
    }

    const accessToken = await getPayPalAccessToken();
    const subscription = await createPayPalSubscription(
      accessToken,
      planId,
      userId,
      paymentToken,
      returnUrl,
      cancelUrl
    );

    const approvalLink = subscription.links.find(link => link.rel === 'approve');

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status,
      approvalUrl: approvalLink?.href,
      subscription,
    });

  } catch (error) {
    console.error('PayPal subscription creation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create subscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('subscriptionId');

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    const accessToken = await getPayPalAccessToken();
    const environment = process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT || 'sandbox';
    const baseUrl = environment === 'sandbox' 
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';

    const response = await fetch(`${baseUrl}/v1/billing/subscriptions/${subscriptionId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subscription details');
    }

    const subscription = await response.json();

    return NextResponse.json({
      success: true,
      subscription,
    });

  } catch (error) {
    console.error('PayPal subscription fetch error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch subscription details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}