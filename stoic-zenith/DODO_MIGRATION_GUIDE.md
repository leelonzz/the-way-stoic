# Dodo Payments Migration Guide

This guide will help you migrate from PayPal to Dodo Payments in your Stoic Zenith application.

## Overview

Dodo Payments is a comprehensive payment platform that offers:
- Global payment processing
- Subscription management
- Digital product delivery
- Multi-currency support
- Webhook notifications
- RESTful API

## Migration Steps

### Step 1: Setup Dodo Payments Account

1. **Create Account**
   - Visit [app.dodopayments.com](https://app.dodopayments.com)
   - Sign up for a merchant account
   - Complete business verification process

2. **Get API Credentials**
   - Navigate to API Settings in your dashboard
   - Generate API key and secret
   - Note down your webhook secret

3. **Configure Webhooks**
   - Set webhook URL to: `https://yourdomain.com/api/dodo/webhook`
   - Configure events: `payment.completed`, `payment.failed`, `subscription.*`

### Step 2: Update Environment Variables

Replace your PayPal environment variables with Dodo Payments equivalents:

```env
# Remove PayPal variables
# NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
# PAYPAL_CLIENT_SECRET=your_paypal_secret
# NEXT_PUBLIC_PAYPAL_ENVIRONMENT=sandbox

# Add Dodo Payments variables
NEXT_PUBLIC_DODO_API_KEY=your_dodo_api_key
DODO_SECRET_KEY=your_dodo_secret_key
NEXT_PUBLIC_DODO_ENVIRONMENT=test  # or 'live'
DODO_WEBHOOK_SECRET=your_webhook_secret
```

### Step 3: API Routes Migration

The following API routes have been created to replace PayPal routes:

#### `/api/dodo/subscriptions`
- **POST**: Create new subscription
- **GET**: Fetch subscriptions (with optional customer_id filter)

#### `/api/dodo/products`
- **POST**: Create new product
- **GET**: Fetch products

#### `/api/dodo/webhook`
- **POST**: Handle webhook events from Dodo Payments

### Step 4: Component Migration

#### Replace PayPal Provider
- **Old**: `PayPalProvider` from `@/components/providers/PayPalProvider`
- **New**: `DodoProvider` from `@/components/providers/DodoProvider`

#### Replace Subscription Button
- **Old**: `SubscriptionButton` from `@/components/subscription/SubscriptionButton`
- **New**: `DodoSubscriptionButton` from `@/components/subscription/DodoSubscriptionButton`

### Step 5: Database Schema Updates

You may need to update your database schema to accommodate Dodo Payments:

```sql
-- Update subscriptions table
ALTER TABLE subscriptions 
ADD COLUMN dodo_subscription_id VARCHAR(255),
ADD COLUMN dodo_customer_id VARCHAR(255),
ADD COLUMN dodo_product_id VARCHAR(255);

-- Update products table
ALTER TABLE products 
ADD COLUMN dodo_product_id VARCHAR(255);
```

### Step 6: Update Frontend Components

#### Update Profile Modal
Replace PayPal subscription button with Dodo subscription button:

```tsx
// Old
import { SubscriptionButton } from '@/components/subscription/SubscriptionButton'

// New
import { DodoSubscriptionButton } from '@/components/subscription/DodoSubscriptionButton'

// Usage
<DodoSubscriptionButton
  customerId={user.id}
  productId="your_product_id"
  productName="Premium Plan"
  price={29.99}
  currency="USD"
  onSuccess={(subscription) => {
    // Handle successful subscription
  }}
  onError={(error) => {
    // Handle error
  }}
/>
```

#### Update Settings Page
Replace PayPal-related settings with Dodo Payments settings.

### Step 7: Testing

1. **Test Mode**
   - Use test API keys
   - Create test products and subscriptions
   - Verify webhook handling

2. **Live Mode**
   - Switch to live API keys
   - Test with real payments
   - Monitor webhook events

### Step 8: Deployment

1. **Update Environment Variables**
   - Set production Dodo Payments credentials
   - Configure production webhook URL

2. **Database Migration**
   - Run database schema updates
   - Migrate existing subscription data

3. **Monitor**
   - Check webhook delivery
   - Monitor payment processing
   - Verify subscription management

## API Reference

### Authentication
Dodo Payments uses API key authentication:
```typescript
headers: {
  'Authorization': `Bearer ${apiKey}`,
  'Content-Type': 'application/json'
}
```

### Create Subscription
```typescript
POST /api/dodo/subscriptions
{
  "customer_id": "customer_123",
  "product_id": "product_456",
  "payment_method_id": "pm_789",
  "metadata": {
    "product_name": "Premium Plan",
    "price": 29.99,
    "currency": "USD"
  }
}
```

### Create Product
```typescript
POST /api/dodo/products
{
  "name": "Premium Plan",
  "description": "Access to premium features",
  "price": 29.99,
  "currency": "USD",
  "type": "subscription",
  "metadata": {
    "features": ["feature1", "feature2"]
  }
}
```

## Webhook Events

Dodo Payments sends the following webhook events:

- `payment.completed`: Payment successfully processed
- `payment.failed`: Payment failed
- `subscription.created`: New subscription created
- `subscription.updated`: Subscription updated
- `subscription.canceled`: Subscription canceled
- `subscription.payment_failed`: Subscription payment failed

## Error Handling

Common error scenarios and solutions:

1. **Invalid API Key**
   - Verify API key is correct
   - Check environment (test/live)

2. **Webhook Signature Verification Failed**
   - Verify webhook secret
   - Check signature calculation

3. **Subscription Creation Failed**
   - Verify customer and product IDs
   - Check payment method validity

## Support

- **Documentation**: [docs.dodopayments.com](https://docs.dodopayments.com)
- **API Reference**: [docs.dodopayments.com/api-reference](https://docs.dodopayments.com/api-reference)
- **Community**: [Discord](https://discord.gg/bYqAp4ayYh)

## Rollback Plan

If you need to rollback to PayPal:

1. **Revert Environment Variables**
   - Restore PayPal credentials
   - Remove Dodo Payments variables

2. **Revert Components**
   - Replace `DodoProvider` with `PayPalProvider`
   - Replace `DodoSubscriptionButton` with `SubscriptionButton`

3. **Revert API Routes**
   - Restore PayPal API routes
   - Remove Dodo Payments routes

4. **Database Rollback**
   - Restore original subscription data
   - Remove Dodo Payments fields

## Benefits of Dodo Payments

1. **Global Reach**: Accept payments from 100+ countries
2. **Multi-Currency**: Automatic currency conversion
3. **Digital Products**: Built-in license key management
4. **Compliance**: Handles taxes and regulations
5. **Analytics**: Comprehensive reporting and analytics
6. **Developer-Friendly**: Simple API and SDKs 