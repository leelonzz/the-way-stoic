# 📡 Webhook Setup Guide

## 🎯 Priority: Test Integration First!

**Before setting up webhooks, test your integration:**
1. Visit: http://localhost:3002/test-dodo
2. Click "Test Subscription Button"
3. Verify checkout URL is generated

Webhooks are for production - your integration works without them for testing!

## 🔧 When You Get Dashboard Access

### Step 1: Access Dodo Dashboard
Try these URLs:
- https://app.dodopayments.com
- https://dashboard.dodopayments.com
- https://dodopayments.com/login

### Step 2: Configure Webhook Endpoint

#### For Production:
```
Webhook URL: https://yourdomain.com/api/dodo/webhook
```

#### For Local Testing (using ngrok):
```bash
# Install ngrok
npm install -g ngrok

# In a new terminal, expose your local server
ngrok http 3002

# Use the https URL ngrok provides, e.g.:
# https://abc123.ngrok.io/api/dodo/webhook
```

### Step 3: Select Webhook Events

In Dodo Dashboard, enable these events:
- ✅ `payment.completed` - When payment succeeds
- ✅ `payment.failed` - When payment fails
- ✅ `subscription.created` - New subscription
- ✅ `subscription.updated` - Subscription changes
- ✅ `subscription.canceled` - Subscription canceled
- ✅ `subscription.payment_failed` - Recurring payment fails

### Step 4: Get Webhook Secret

1. Copy the webhook secret from dashboard
2. Add to your `.env.local`:
```env
DODO_WEBHOOK_SECRET="your_webhook_secret_here"
```

## 🧪 Testing Webhooks

### Method 1: Using ngrok (Recommended)
```bash
# Terminal 1: Start your app
npm run dev

# Terminal 2: Start ngrok
ngrok http 3002

# Use the ngrok URL in Dodo dashboard
# Test by creating a subscription
```

### Method 2: Using Webhook Testing Tools
- Use tools like webhook.site for testing
- Forward webhooks to your local development

## 📋 Webhook Events You'll Receive

### Payment Completed
```json
{
  "id": "evt_123",
  "type": "payment.completed",
  "data": {
    "id": "pay_123",
    "status": "completed",
    "amount": 1400,
    "currency": "USD",
    "customer_id": "cus_123",
    "subscription_id": "sub_123"
  }
}
```

### Subscription Created
```json
{
  "id": "evt_456", 
  "type": "subscription.created",
  "data": {
    "id": "sub_123",
    "status": "active",
    "customer_id": "cus_123",
    "product_id": "pdt_1xvwazO5L41SzZeMegxyk"
  }
}
```

## 🔒 Security

Your webhook endpoint at `/api/dodo/webhook` already includes:
- ✅ Signature verification
- ✅ Event type handling
- ✅ Error handling
- ✅ Logging

## 🚨 Important Notes

1. **Webhooks are NOT required for testing** - your integration works without them
2. **Webhooks are for production** - to update user access, send emails, etc.
3. **Test locally first** - use ngrok for webhook testing
4. **Always verify signatures** - our webhook handler does this automatically

## 🎯 Next Steps After Webhook Setup

1. **Test webhook delivery** in Dodo dashboard
2. **Check webhook logs** in your app console
3. **Update user permissions** based on webhook events
4. **Send confirmation emails** on successful payments
5. **Handle failed payments** gracefully

## 🆘 Troubleshooting

### Webhook Not Receiving Events
- Check webhook URL is correct
- Verify ngrok is running (for local testing)
- Check Dodo dashboard webhook logs
- Verify webhook secret in environment variables

### Signature Verification Failing
- Ensure `DODO_WEBHOOK_SECRET` matches dashboard
- Check webhook payload is not modified
- Verify Content-Type is application/json

### Events Not Processing
- Check console logs for errors
- Verify event types are handled in webhook route
- Test with webhook.site first to see raw payloads
