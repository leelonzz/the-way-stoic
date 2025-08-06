# 🚀 DodoPayments Integration Setup Guide

## Current Status: ⚠️ REQUIRES CONFIGURATION

Your DodoPayments integration code has been **updated and fixed** but requires proper configuration to work.

## 🔧 Critical Issues Fixed

### 1. **API Configuration** ✅ FIXED
- ✅ Updated environment variable name from `DODO_SECRET_KEY` to `DODO_PAYMENTS_API_KEY`
- ✅ Removed incorrect base URLs (DodoPayments SDK handles this automatically)
- ✅ Fixed authentication error handling

### 2. **Webhook Implementation** ✅ FIXED
- ✅ Updated to use Standard Webhooks specification
- ✅ Fixed webhook headers: `webhook-id`, `webhook-signature`, `webhook-timestamp`
- ✅ Updated event types to match official documentation:
  - `payment.succeeded` (was `payment.completed`)
  - `subscription.active` (was `subscription.created`)
  - `subscription.on_hold`, `subscription.failed`, `subscription.renewed`

### 3. **SDK Integration** ✅ FIXED
- ✅ Proper DodoPayments SDK usage
- ✅ Correct API endpoint configuration
- ✅ Enhanced error handling with troubleshooting steps

## 🔑 Required Setup Steps

### Step 1: Get Your DodoPayments Credentials

1. **Login to DodoPayments Dashboard**
   - Go to https://app.dodopayments.com/
   - Navigate to `Settings > API`

2. **Generate API Key**
   - Click "Generate API Key"
   - Copy the API key (starts with something like `dodo_test_...` or `dodo_live_...`)

3. **Setup Webhook**
   - Go to `Settings > Webhooks`
   - Create webhook endpoint: `https://yourdomain.com/api/dodo/webhook`
   - Copy the webhook secret key

### Step 2: Update Environment Variables

Update your `.env.local` file with your actual credentials:

```bash
# Dodo Payments Configuration
DODO_PAYMENTS_API_KEY="your-actual-api-key-here"  # Replace with your API key
NEXT_PUBLIC_DODO_ENVIRONMENT="test"  # or "live" for production
DODO_WEBHOOK_SECRET="your-actual-webhook-secret"  # Replace with webhook secret
```

### Step 3: Create Products in DodoPayments Dashboard

1. **Create One-time Products**
   - Go to `Products > Create Product`
   - Set product type to "One-time"
   - Note the Product ID for your code

2. **Create Subscription Products**
   - Go to `Products > Create Product`
   - Set product type to "Subscription"
   - Configure billing cycle (monthly/yearly)
   - Note the Product ID for your code

### Step 4: Test the Integration

1. **Test Payment Creation**
   ```bash
   curl -X POST http://localhost:3000/api/dodo/payments \
     -H "Content-Type: application/json" \
     -d '{
       "productId": "your-product-id",
       "userId": "test-user-123",
       "customerData": {
         "email": "test@example.com",
         "name": "Test User",
         "billingAddress": {
           "street": "123 Test St",
           "city": "Test City",
           "state": "Test State",
           "zipcode": "12345",
           "country": "US"
         }
       }
     }'
   ```

2. **Test Subscription Creation**
   ```bash
   curl -X POST http://localhost:3000/api/dodo/subscriptions \
     -H "Content-Type: application/json" \
     -d '{
       "productId": "your-subscription-product-id",
       "userId": "test-user-123",
       "customerData": {
         "email": "test@example.com",
         "name": "Test User",
         "billingAddress": {
           "street": "123 Test St",
           "city": "Test City",
           "state": "Test State",
           "zipcode": "12345",
           "country": "US"
         }
       }
     }'
   ```

## 🔍 Troubleshooting

### Common Issues

1. **401 Authentication Error**
   - ✅ Verify `DODO_PAYMENTS_API_KEY` is set correctly
   - ✅ Check API key is valid in DodoPayments dashboard
   - ✅ Ensure account is activated

2. **Product Not Found Error**
   - ✅ Verify product ID exists in your DodoPayments account
   - ✅ Check product is active/published

3. **Webhook Signature Verification Failed**
   - ✅ Verify `DODO_WEBHOOK_SECRET` matches dashboard
   - ✅ Ensure webhook URL is accessible from internet
   - ✅ Check webhook endpoint returns 200 status

### Testing Webhooks

1. **Use DodoPayments Dashboard**
   - Go to `Settings > Webhooks`
   - Click on your webhook endpoint
   - Use the "Testing" tab to send test events

2. **Use ngrok for Local Testing**
   ```bash
   # Install ngrok
   npm install -g ngrok
   
   # Expose local server
   ngrok http 3000
   
   # Use the ngrok URL in DodoPayments webhook settings
   # Example: https://abc123.ngrok.io/api/dodo/webhook
   ```

## 📋 Next Steps

1. **Replace placeholder values** in `.env.local` with actual credentials
2. **Create products** in DodoPayments dashboard
3. **Test the integration** using the provided curl commands
4. **Set up webhook endpoint** with your domain
5. **Test webhook delivery** using DodoPayments dashboard

## 🆘 Support

If you encounter issues:

1. **Check the console logs** for detailed error messages
2. **Verify all environment variables** are set correctly
3. **Test with DodoPayments test cards**: `4242 4242 4242 4242`
4. **Contact DodoPayments support** if API issues persist

## 📚 Documentation References

- [DodoPayments Integration Guide](https://docs.dodopayments.com/developer-resources/integration-guide)
- [Webhook Documentation](https://docs.dodopayments.com/developer-resources/webhooks)
- [API Reference](https://docs.dodopayments.com/api-reference/introduction)
