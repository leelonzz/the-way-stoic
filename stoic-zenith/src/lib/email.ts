import { Resend } from 'resend'

// Initialize Resend with API key (handle missing key gracefully)
const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

export interface EmailTemplate {
  to: string
  subject: string
  html: string
  text?: string
}

export interface SubscriptionReceiptData {
  customerName: string
  customerEmail: string
  subscriptionId: string
  productName: string
  amount: number
  currency: string
  billingPeriod: string
  nextBillingDate: string
  receiptUrl?: string
}

export interface PaymentReceiptData {
  customerName: string
  customerEmail: string
  paymentId: string
  productName: string
  amount: number
  currency: string
  receiptUrl?: string
}

/**
 * Send subscription confirmation email
 */
export async function sendSubscriptionConfirmationEmail(data: SubscriptionReceiptData) {
  try {
    // Check if Resend is configured
    if (!resend) {
      console.log('📧 Resend API key not configured - simulating email send')
      console.log('📧 Would send subscription confirmation email to:', data.customerEmail)
      console.log('📧 Email subject: Welcome to The Stoic Way - Subscription Confirmed')
      return { success: true, emailId: 'simulated_' + Date.now(), simulated: true }
    }

    const emailTemplate = createSubscriptionConfirmationTemplate(data)

    const result = await resend.emails.send({
      from: 'The Stoic Way <noreply@thewaystoic.site>',
      to: data.customerEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      headers: {
        'X-Entity-Ref-ID': data.subscriptionId,
        'List-Unsubscribe': `<${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      tags: [
        { name: 'category', value: 'subscription_confirmation' },
        { name: 'environment', value: process.env.NODE_ENV || 'development' }
      ]
    })

    console.log('✅ Subscription confirmation email sent:', result.data?.id)
    return { success: true, emailId: result.data?.id }

  } catch (error) {
    console.error('❌ Failed to send subscription confirmation email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Send payment receipt email
 */
export async function sendPaymentReceiptEmail(data: PaymentReceiptData) {
  try {
    // Check if Resend is configured
    if (!resend) {
      console.log('📧 Resend API key not configured - simulating email send')
      console.log('📧 Would send payment receipt email to:', data.customerEmail)
      console.log('📧 Email subject: Payment Receipt - The Stoic Way')
      return { success: true, emailId: 'simulated_' + Date.now(), simulated: true }
    }

    const emailTemplate = createPaymentReceiptTemplate(data)

    const result = await resend.emails.send({
      from: 'The Stoic Way <noreply@thewaystoic.site>',
      to: data.customerEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      headers: {
        'X-Entity-Ref-ID': data.paymentId,
        'List-Unsubscribe': `<${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      tags: [
        { name: 'category', value: 'payment_receipt' },
        { name: 'environment', value: process.env.NODE_ENV || 'development' }
      ]
    })

    console.log('✅ Payment receipt email sent:', result.data?.id)
    return { success: true, emailId: result.data?.id }

  } catch (error) {
    console.error('❌ Failed to send payment receipt email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Create subscription confirmation email template
 */
function createSubscriptionConfirmationTemplate(data: SubscriptionReceiptData): EmailTemplate {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: data.currency.toUpperCase(),
  }).format(data.amount / 100) // Convert cents to dollars

  const subject = `Welcome to The Stoic Way - Subscription Confirmed`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f6f0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #8B4513; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .receipt-box { background-color: #f8f6f0; border: 1px solid #e5e3db; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .amount { font-size: 24px; font-weight: bold; color: #8B4513; }
        .footer { background-color: #f8f6f0; padding: 20px; text-align: center; font-size: 14px; color: #666; }
        .button { display: inline-block; background-color: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏛️ The Stoic Way</h1>
          <p>Welcome to the Philosopher Plan</p>
        </div>
        
        <div class="content">
          <h2>Subscription Confirmed!</h2>
          
          <p>Dear ${data.customerName},</p>
          
          <p>Thank you for subscribing to The Stoic Way! Your subscription has been successfully activated, and you now have access to all premium features.</p>
          
          <div class="receipt-box">
            <h3>📋 Subscription Details</h3>
            <p><strong>Plan:</strong> ${data.productName}</p>
            <p><strong>Amount:</strong> <span class="amount">${formattedAmount}</span></p>
            <p><strong>Billing Period:</strong> ${data.billingPeriod}</p>
            <p><strong>Next Billing Date:</strong> ${new Date(data.nextBillingDate).toLocaleDateString()}</p>
            <p><strong>Subscription ID:</strong> ${data.subscriptionId}</p>
          </div>
          
          <h3>🎯 What's Included</h3>
          <ul>
            <li>Unlimited chat with Stoic philosophers (Marcus Aurelius, Seneca, Epictetus)</li>
            <li>Advanced streak analytics and insights</li>
            <li>Personalized philosophical guidance</li>
            <li>Export your journal entries</li>
            <li>Priority support</li>
          </ul>
          
          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="button">Start Your Journey</a>
          </p>
          
          <p>If you have any questions, feel free to reach out to our support team.</p>
          
          <p>Welcome to the path of wisdom!</p>
          <p><em>The Stoic Way Team</em></p>
        </div>
        
        <div class="footer">
          <p>This email was sent to ${data.customerEmail}</p>
          <p>© 2024 The Stoic Way. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Welcome to The Stoic Way - Subscription Confirmed

Dear ${data.customerName},

Thank you for subscribing to The Stoic Way! Your subscription has been successfully activated.

Subscription Details:
- Plan: ${data.productName}
- Amount: ${formattedAmount}
- Billing Period: ${data.billingPeriod}
- Next Billing Date: ${new Date(data.nextBillingDate).toLocaleDateString()}
- Subscription ID: ${data.subscriptionId}

What's Included:
- Unlimited chat with Stoic philosophers
- Advanced streak analytics and insights
- Personalized philosophical guidance
- Export your journal entries
- Priority support

Start your journey: ${process.env.NEXT_PUBLIC_APP_URL}

Welcome to the path of wisdom!
The Stoic Way Team
  `

  return { to: data.customerEmail, subject, html, text }
}

/**
 * Create payment receipt email template
 */
function createPaymentReceiptTemplate(data: PaymentReceiptData): EmailTemplate {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: data.currency.toUpperCase(),
  }).format(data.amount / 100)

  const subject = `Payment Receipt - The Stoic Way`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f6f0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #8B4513; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .receipt-box { background-color: #f8f6f0; border: 1px solid #e5e3db; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .amount { font-size: 24px; font-weight: bold; color: #8B4513; }
        .footer { background-color: #f8f6f0; padding: 20px; text-align: center; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏛️ The Stoic Way</h1>
          <p>Payment Receipt</p>
        </div>
        
        <div class="content">
          <h2>Payment Successful!</h2>
          
          <p>Dear ${data.customerName},</p>
          
          <p>Thank you for your payment. Your transaction has been processed successfully.</p>
          
          <div class="receipt-box">
            <h3>💳 Payment Details</h3>
            <p><strong>Product:</strong> ${data.productName}</p>
            <p><strong>Amount:</strong> <span class="amount">${formattedAmount}</span></p>
            <p><strong>Payment ID:</strong> ${data.paymentId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p>If you have any questions about this payment, please contact our support team.</p>
          
          <p>Thank you for choosing The Stoic Way!</p>
          <p><em>The Stoic Way Team</em></p>
        </div>
        
        <div class="footer">
          <p>This email was sent to ${data.customerEmail}</p>
          <p>© 2024 The Stoic Way. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Payment Receipt - The Stoic Way

Dear ${data.customerName},

Thank you for your payment. Your transaction has been processed successfully.

Payment Details:
- Product: ${data.productName}
- Amount: ${formattedAmount}
- Payment ID: ${data.paymentId}
- Date: ${new Date().toLocaleDateString()}

Thank you for choosing The Stoic Way!
The Stoic Way Team
  `

  return { to: data.customerEmail, subject, html, text }
}
