# Authentication Troubleshooting Guide

## Current Issues Identified ✅ FIXED

The following issues have been resolved:

1. **Content Security Policy (CSP) blocking Supabase** ✅ **FIXED**
   - Updated `next.config.ts` to allow Supabase and Google OAuth domains
   - Added proper `connect-src`, `frame-src`, and other CSP directives

2. **Enhanced Error Logging** ✅ **ADDED**
   - Added detailed console logging for auth flow debugging
   - Enhanced error reporting in auth helpers and hooks

## Next Setup Steps Required

### 1. Supabase Dashboard Configuration

**Go to your Supabase Dashboard: https://supabase.com/dashboard**

#### A. Enable Google OAuth Provider
1. Navigate to **Authentication > Providers**
2. Find **Google** and click **Enable**
3. You'll need Google OAuth credentials (see step 2)

#### B. Configure Site URL and Redirect URLs
1. Go to **Authentication > URL Configuration**
2. Set **Site URL**: `http://localhost:3000`
3. Add **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   ```

#### C. Create Profiles Table
1. Go to **Table Editor**
2. Click **New Table**
3. Run this SQL in the SQL Editor:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. Google Cloud Console Setup

**Go to: https://console.cloud.google.com/**

#### A. Create/Select Project
1. Create a new project or select existing one
2. Enable **Google+ API** (now called Google People API)

#### B. Configure OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**
2. Choose **External** user type
3. Fill required fields:
   - App name: "The Stoic Way"
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
5. Save and continue

#### C. Create OAuth Client ID
1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth client ID**
3. Choose **Web application**
4. Add **Authorized redirect URIs**:
   ```
   https://xzindyqvzwbaeerlcbyx.supabase.co/auth/v1/callback
   ```
5. Copy **Client ID** and **Client Secret**

#### D. Configure Supabase with Google Credentials
1. Back in Supabase dashboard > **Authentication > Providers**
2. Find Google provider and enter:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
3. Save configuration

### 3. Testing the Authentication Flow

After completing the setup above:

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Open browser console** (F12) for debugging

3. **Visit**: `http://localhost:3000`

4. **Click "Continue with Google"**

5. **Check console logs** for detailed debugging info:
   - Look for 🔐, ✅, ❌ emoji prefixed logs
   - Check for any remaining CORS errors
   - Verify OAuth flow completion

### 4. Common Issues & Solutions

#### Issue: "redirect_uri_mismatch"
**Solution**: Verify exact match in Google Cloud Console:
- `https://xzindyqvzwbaeerlcbyx.supabase.co/auth/v1/callback`

#### Issue: Still getting CORS errors
**Solution**: 
1. Clear browser cache/cookies
2. Try incognito mode
3. Verify CSP update took effect (restart dev server)

#### Issue: Authentication completes but no profile in sidebar
**Solution**: 
1. Check if profiles table exists
2. Verify RLS policies are active
3. Check console for profile creation errors

#### Issue: Session not persisting
**Solution**:
1. Check localStorage in browser dev tools
2. Verify Supabase session configuration
3. Clear all browser data and try again

### 5. Debug Console Messages

You should see these console messages during successful auth:

```
🔐 Starting Google OAuth sign-in...
Redirect URL: http://localhost:3000/auth/callback
✅ Google OAuth initiated successfully: [data]
🔄 Processing auth callback...
✅ Auth callback successful: user@gmail.com
🔄 Auth state changed: SIGNED_IN user@gmail.com
📋 Current session: Found user@gmail.com
```

### 6. Still Having Issues?

If authentication is still not working after following all steps:

1. **Check Supabase Logs**: Dashboard > Logs
2. **Verify Google OAuth Setup**: Test with a simple OAuth tester
3. **Clear All Browser Data**: Cookies, localStorage, cache
4. **Try Different Browser**: Or incognito mode
5. **Check Network Tab**: Look for 401/403 errors

## Status: Ready for Testing ✅

The code changes are complete. You now need to:
1. Complete Supabase dashboard configuration
2. Set up Google OAuth credentials
3. Test the authentication flow

After setup, the login should work perfectly with user profile display in the sidebar!