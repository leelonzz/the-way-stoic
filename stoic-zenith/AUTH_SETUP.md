# Authentication Setup Guide

This guide will help you set up Google OAuth authentication for The Stoic Way application.

## Prerequisites

- Supabase project already created
- Google Cloud Console account
- Domain/URL for OAuth callbacks

## 1. Supabase Configuration

### Database Setup

1. Run the migration to create the profiles table:
```sql
-- Run the SQL in /supabase/migrations/001_create_profiles_table.sql
-- This creates the profiles table, RLS policies, and triggers
```

2. Verify the profiles table was created successfully in your Supabase dashboard.

### Enable Google OAuth Provider

1. Go to your Supabase dashboard
2. Navigate to **Authentication > Providers**
3. Find **Google** and click **Enable**
4. You'll need to configure the Google OAuth credentials (next step)

## 2. Google Cloud Console Setup

### Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** (if not already enabled)

### Configure OAuth Consent Screen

1. Go to **APIs & Services > OAuth consent screen**
2. Choose **External** user type
3. Fill in the required information:
   - App name: "The Stoic Way"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
5. Save and continue

### Create OAuth Client ID

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth client ID**
3. Choose **Web application**
4. Add authorized redirect URIs:
   ```
   https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback (for development)
   ```
5. Copy the **Client ID** and **Client Secret**

## 3. Configure Supabase with Google Credentials

1. Back in Supabase dashboard, go to **Authentication > Providers**
2. Find Google provider and enter:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
3. Save the configuration

## 4. Environment Variables

Create or update your `.env.local` file:

```env
# These are already in your Supabase client configuration
NEXT_PUBLIC_SUPABASE_URL=https://xzindyqvzwbaeerlcbyx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Add these if you need them for additional configuration
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 5. Update Site URL (Important!)

1. In Supabase dashboard, go to **Authentication > URL Configuration**
2. Set **Site URL** to:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback`

## 6. Test the Authentication Flow

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000`
3. You should see the login screen
4. Click "Continue with Google"
5. Complete Google OAuth flow
6. You should be redirected back and see the dashboard with your profile in the sidebar

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error**:
   - Check that your redirect URIs in Google Cloud Console match exactly
   - Ensure Supabase redirect URLs are configured correctly

2. **"User not found" or profile not created**:
   - Check that the profiles table exists
   - Verify the trigger function is working
   - Check Supabase logs for errors

3. **Authentication state not persisting**:
   - Clear browser storage/cookies
   - Check that localStorage is working
   - Verify Supabase session configuration

4. **Profile picture not showing**:
   - Check Google OAuth scopes include profile access
   - Verify avatar_url is being stored in the database

### Debug Steps:

1. Check browser console for JavaScript errors
2. Check Supabase dashboard logs
3. Verify database entries in the profiles table
4. Test authentication in an incognito window

## Security Notes

- Never commit Google Client Secret to version control
- Use environment variables for sensitive data
- Keep Supabase service role key secure
- Regularly rotate OAuth credentials
- Monitor authentication logs for suspicious activity

## Next Steps

After authentication is working:
1. Add profile editing functionality
2. Implement user preferences
3. Add social features
4. Set up user analytics
5. Add account deletion/data export features

For any issues, check the Supabase documentation or contact support.