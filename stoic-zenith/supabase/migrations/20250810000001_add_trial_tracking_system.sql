-- Add trial tracking system to prevent trial abuse
-- Migration: 20250810000001_add_trial_tracking_system.sql

-- Add Google account ID to profiles table for permanent trial tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS google_account_id TEXT,
ADD COLUMN IF NOT EXISTS has_used_trial BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS trial_used_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS account_cancelled_at TIMESTAMP WITH TIME ZONE;

-- Create permanent trial usage tracking table
-- This table persists even after account deletion to prevent trial abuse
CREATE TABLE IF NOT EXISTS public.trial_usage_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    google_account_id TEXT NOT NULL,
    user_id UUID, -- May be NULL if user account was deleted
    email TEXT NOT NULL,
    trial_started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    trial_ended_at TIMESTAMP WITH TIME ZONE,
    subscription_plan TEXT DEFAULT 'philosopher',
    account_deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create account cancellation history table
-- Tracks when users fully cancel their accounts to prevent circumventing restrictions
CREATE TABLE IF NOT EXISTS public.account_cancellation_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    google_account_id TEXT NOT NULL,
    user_id UUID NOT NULL,
    email TEXT NOT NULL,
    subscription_plan_at_cancellation TEXT,
    subscription_status_at_cancellation TEXT,
    had_used_trial BOOLEAN DEFAULT FALSE,
    cancelled_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.trial_usage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_cancellation_history ENABLE ROW LEVEL SECURITY;

-- Create policies for trial_usage_history (read-only for users, full access for service)
CREATE POLICY "Users can view own trial history" ON public.trial_usage_history
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can manage trial history" ON public.trial_usage_history
    FOR ALL USING (true) WITH CHECK (true);

-- Create policies for account_cancellation_history (read-only for users, full access for service)
CREATE POLICY "Users can view own cancellation history" ON public.account_cancellation_history
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can manage cancellation history" ON public.account_cancellation_history
    FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_google_account_id ON public.profiles(google_account_id);
CREATE INDEX IF NOT EXISTS idx_profiles_has_used_trial ON public.profiles(has_used_trial);
CREATE INDEX IF NOT EXISTS idx_trial_usage_google_account_id ON public.trial_usage_history(google_account_id);
CREATE INDEX IF NOT EXISTS idx_trial_usage_user_id ON public.trial_usage_history(user_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_google_account_id ON public.account_cancellation_history(google_account_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_user_id ON public.account_cancellation_history(user_id);

-- Create function to check if Google account has used trial
CREATE OR REPLACE FUNCTION public.has_google_account_used_trial(google_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    trial_used BOOLEAN := FALSE;
BEGIN
    -- Check if this Google account ID has any trial usage history
    SELECT EXISTS (
        SELECT 1 FROM public.trial_usage_history 
        WHERE google_account_id = google_id
    ) INTO trial_used;
    
    RETURN trial_used;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to record trial usage
CREATE OR REPLACE FUNCTION public.record_trial_usage(
    user_uuid UUID,
    google_id TEXT,
    user_email TEXT,
    plan_type TEXT DEFAULT 'philosopher'
)
RETURNS void AS $$
BEGIN
    -- Insert into trial usage history
    INSERT INTO public.trial_usage_history (
        google_account_id,
        user_id,
        email,
        subscription_plan,
        trial_started_at
    ) VALUES (
        google_id,
        user_uuid,
        user_email,
        plan_type,
        NOW()
    );
    
    -- Update user profile to mark trial as used
    UPDATE public.profiles
    SET 
        has_used_trial = TRUE,
        trial_used_at = NOW(),
        updated_at = NOW()
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to record account cancellation
CREATE OR REPLACE FUNCTION public.record_account_cancellation(
    user_uuid UUID,
    cancellation_reason TEXT DEFAULT NULL
)
RETURNS void AS $$
DECLARE
    user_profile RECORD;
BEGIN
    -- Get user profile information
    SELECT * FROM public.profiles WHERE id = user_uuid INTO user_profile;
    
    IF user_profile IS NOT NULL THEN
        -- Record the cancellation in history
        INSERT INTO public.account_cancellation_history (
            google_account_id,
            user_id,
            email,
            subscription_plan_at_cancellation,
            subscription_status_at_cancellation,
            had_used_trial,
            reason
        ) VALUES (
            user_profile.google_account_id,
            user_uuid,
            user_profile.email,
            user_profile.subscription_plan,
            user_profile.subscription_status,
            user_profile.has_used_trial,
            cancellation_reason
        );
        
        -- Update profile to mark account as cancelled
        UPDATE public.profiles
        SET 
            account_cancelled_at = NOW(),
            updated_at = NOW()
        WHERE id = user_uuid;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_user function to extract Google account ID
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    google_id TEXT;
    has_used_trial_before BOOLEAN := FALSE;
BEGIN
    -- Extract Google account ID from user metadata
    google_id := NEW.raw_user_meta_data->>'sub';

    -- Check if this Google account has used trial before
    IF google_id IS NOT NULL THEN
        has_used_trial_before := public.has_google_account_used_trial(google_id);
    END IF;

    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        avatar_url,
        google_account_id,
        has_used_trial
    )
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        google_id,
        has_used_trial_before
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
