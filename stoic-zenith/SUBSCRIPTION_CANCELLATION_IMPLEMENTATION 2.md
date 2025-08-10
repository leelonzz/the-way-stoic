# Subscription Cancellation and Trial Prevention Implementation

This document describes the implementation of subscription cancellation logic with plan downgrade and trial prevention system.

## Overview

The implementation includes three main components:

1. **Plan Downgrade**: When users cancel their subscription, they are automatically downgraded to the "Seeker" plan
2. **Trial Prevention**: Users cannot access free trials again after canceling, tracked by Google account ID
3. **Account Cancellation**: Full account cancellation is tracked to prevent circumventing trial restrictions

## Database Schema Changes

### New Tables

#### `trial_usage_history`
Permanent record of trial usage that persists even after account deletion:
- `google_account_id` - Google account identifier (permanent tracking)
- `user_id` - User ID (may be NULL if account deleted)
- `email` - User email at time of trial
- `trial_started_at` - When trial was started
- `subscription_plan` - Plan type for the trial
- `account_deleted_at` - When account was deleted (if applicable)

#### `account_cancellation_history`
Tracks full account cancellations:
- `google_account_id` - Google account identifier
- `user_id` - User ID at time of cancellation
- `subscription_plan_at_cancellation` - Plan when cancelled
- `had_used_trial` - Whether user had used trial
- `cancelled_at` - When account was cancelled
- `reason` - Optional cancellation reason

### Updated Tables

#### `profiles`
Added new columns:
- `google_account_id` - Google account identifier from OAuth
- `has_used_trial` - Boolean flag for trial usage
- `trial_used_at` - Timestamp when trial was used
- `account_cancelled_at` - When account was cancelled

## API Endpoints

### Trial Eligibility
- `GET /api/trial/eligibility` - Check if user is eligible for trial
- `POST /api/trial/eligibility` - Start trial for eligible user

### Account Management
- `POST /api/account/cancel` - Cancel user account completely

### Subscription Management
- `POST /api/dodo/subscriptions/manage` - Updated to ensure plan downgrade

## Key Functions

### Database Functions

#### `has_google_account_used_trial(google_id TEXT)`
Checks if a Google account has previously used a trial.

#### `record_trial_usage(user_uuid, google_id, user_email, plan_type)`
Records trial usage in both profile and history tables.

#### `record_account_cancellation(user_uuid, cancellation_reason)`
Records account cancellation with full context.

### Application Functions

#### `checkTrialEligibility(userId)`
Comprehensive trial eligibility check considering:
- Google account ID presence
- Previous trial usage
- Account cancellation history

#### `recordTrialUsage(userId, planType)`
Safely records trial usage with validation.

#### `recordAccountCancellation(userId, reason)`
Records account cancellation with proper tracking.

## Implementation Details

### Plan Downgrade Logic

1. **Subscription Cancellation**: When a subscription is cancelled via DodoPayments API or webhook:
   - User is immediately downgraded to "seeker" plan
   - Subscription status set to "cancelled"
   - Subscription expiry date cleared

2. **Database Trigger**: The `update_profile_dodo_subscription_status()` function ensures:
   - Any non-active subscription status results in "seeker" plan
   - Handles both "canceled" and "cancelled" status variations

### Trial Prevention System

1. **Google Account Tracking**: Uses Google OAuth `sub` field as permanent identifier
2. **Cross-Account Prevention**: Trial usage tracked by Google account, not user account
3. **Persistent History**: Trial usage history survives account deletion
4. **New User Check**: When new users register, system checks if their Google account has used trial

### Security Measures

1. **Permanent Records**: Trial usage history cannot be deleted by users
2. **Google Account Binding**: Trial restrictions tied to Google account, not email
3. **Account Cancellation Tracking**: Full account cancellations are logged
4. **Re-registration Prevention**: Same Google account cannot circumvent restrictions

## User Interface Updates

### Components Added

#### `TrialEligibilityCheck`
- Shows trial availability status
- Displays appropriate messaging for ineligible users
- Provides trial start functionality

#### `AccountCancellation`
- Secure account cancellation with email confirmation
- Clear messaging about consequences
- Reason collection for feedback

### Updated Components

#### `SubscriptionManagement`
- Integrated trial eligibility check
- Updated for plan downgrade messaging

#### `EnhancedSettingsPage`
- Added account cancellation component
- Replaced simple delete button

## Testing

### Unit Tests
- `tests/subscription-cancellation.test.ts` - Comprehensive test suite

### Integration Test
- `scripts/test-subscription-system.js` - End-to-end integration test

### Test Coverage
- Trial eligibility for new users
- Trial denial for used accounts
- Subscription cancellation and downgrade
- Account cancellation tracking
- Cross-account trial prevention
- Re-registration restrictions

## Usage Examples

### Check Trial Eligibility
```typescript
import { checkTrialEligibility } from '@/lib/trial-prevention'

const eligibility = await checkTrialEligibility(userId)
if (eligibility.eligible) {
  // Show trial offer
} else {
  // Show subscription upgrade
}
```

### Record Trial Usage
```typescript
import { recordTrialUsage } from '@/lib/trial-prevention'

const result = await recordTrialUsage(userId, 'philosopher')
if (result.success) {
  // Trial started successfully
}
```

### Cancel Account
```typescript
const response = await fetch('/api/account/cancel', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    confirmEmail: userEmail,
    reason: 'Optional reason'
  })
})
```

## Migration Instructions

1. **Run Database Migration**:
   ```bash
   supabase migration up
   ```

2. **Update Environment Variables**:
   Ensure `SUPABASE_SERVICE_ROLE_KEY` is set for server-side operations.

3. **Test Implementation**:
   ```bash
   node scripts/test-subscription-system.js
   ```

4. **Deploy Components**:
   - Update subscription management pages
   - Add trial eligibility checks
   - Include account cancellation in settings

## Monitoring and Analytics

### Key Metrics to Track
- Trial conversion rates
- Subscription cancellation reasons
- Trial abuse attempts
- Re-registration patterns

### Logging
- All trial eligibility checks are logged
- Account cancellations are tracked with reasons
- Subscription changes are audited

## Future Enhancements

1. **Email Notifications**: Send confirmation emails for cancellations
2. **Grace Period**: Allow brief grace period for accidental cancellations
3. **Partial Refunds**: Implement prorated refund logic
4. **Win-back Campaigns**: Target cancelled users with special offers
5. **Advanced Analytics**: Detailed cancellation reason analysis

## Support and Troubleshooting

### Common Issues

1. **Google Account ID Missing**: Ensure OAuth scope includes profile information
2. **Trial Not Blocked**: Check database triggers are properly installed
3. **Plan Not Downgraded**: Verify webhook handlers are processing correctly

### Debug Commands

```sql
-- Check trial usage for Google account
SELECT * FROM trial_usage_history WHERE google_account_id = 'google-id';

-- Check account cancellation history
SELECT * FROM account_cancellation_history WHERE google_account_id = 'google-id';

-- Verify profile state
SELECT subscription_plan, subscription_status, has_used_trial 
FROM profiles WHERE id = 'user-id';
```
