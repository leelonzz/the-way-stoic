-- Add DodoPayments subscription support to profiles table and create dedicated tracking table
-- Migration: 20250808000001_add_dodo_subscription_support.sql

-- Add subscription_id field to profiles table for DodoPayments subscription IDs
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_id TEXT;

-- Create DodoPayments subscriptions table for detailed tracking
CREATE TABLE IF NOT EXISTS public.dodo_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    dodo_subscription_id TEXT UNIQUE NOT NULL,
    dodo_customer_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    plan_type TEXT NOT NULL DEFAULT 'philosopher',
    amount DECIMAL(10,2) NOT NULL DEFAULT 14.00,
    currency TEXT NOT NULL DEFAULT 'USD',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    next_billing_time TIMESTAMP WITH TIME ZONE,
    last_payment_time TIMESTAMP WITH TIME ZONE,
    failed_payment_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.dodo_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for dodo_subscriptions
CREATE POLICY "Users can view own dodo subscriptions" ON public.dodo_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dodo subscriptions" ON public.dodo_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dodo subscriptions" ON public.dodo_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_dodo_subscriptions_user_id ON public.dodo_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_dodo_subscriptions_dodo_id ON public.dodo_subscriptions(dodo_subscription_id);
CREATE INDEX IF NOT EXISTS idx_dodo_subscriptions_status ON public.dodo_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_dodo_subscriptions_customer_id ON public.dodo_subscriptions(dodo_customer_id);

-- Create function to update profile subscription status for DodoPayments
CREATE OR REPLACE FUNCTION public.update_profile_dodo_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the profile with DodoPayments subscription information
    UPDATE public.profiles
    SET 
        subscription_status = CASE 
            WHEN NEW.status = 'active' THEN 'active'
            WHEN NEW.status = 'canceled' THEN 'cancelled'
            WHEN NEW.status = 'past_due' THEN 'past_due'
            WHEN NEW.status = 'unpaid' THEN 'unpaid'
            ELSE 'free'
        END,
        subscription_plan = CASE 
            WHEN NEW.status = 'active' THEN NEW.plan_type
            ELSE 'seeker'
        END,
        subscription_id = NEW.dodo_subscription_id,
        subscription_expires_at = CASE 
            WHEN NEW.status = 'active' THEN NEW.current_period_end
            ELSE NULL
        END,
        updated_at = NOW()
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update profile when DodoPayments subscription changes
DROP TRIGGER IF EXISTS on_dodo_subscription_updated ON public.dodo_subscriptions;
CREATE TRIGGER on_dodo_subscription_updated
    AFTER INSERT OR UPDATE ON public.dodo_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_profile_dodo_subscription_status();

-- Create function to handle DodoPayments subscription expiry
CREATE OR REPLACE FUNCTION public.handle_dodo_subscription_expiry()
RETURNS void AS $$
BEGIN
    -- Update expired DodoPayments subscriptions
    UPDATE public.dodo_subscriptions
    SET 
        status = 'expired',
        updated_at = NOW()
    WHERE 
        status = 'active' 
        AND current_period_end < NOW() 
        AND failed_payment_count >= 3;
        
    -- Update profiles for expired DodoPayments subscriptions
    UPDATE public.profiles
    SET 
        subscription_status = 'expired',
        subscription_plan = 'seeker',
        subscription_id = NULL,
        subscription_expires_at = NULL,
        updated_at = NOW()
    WHERE id IN (
        SELECT user_id 
        FROM public.dodo_subscriptions 
        WHERE status = 'expired'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add service role policy for webhook operations
CREATE POLICY "Service role can manage dodo subscriptions" ON public.dodo_subscriptions
    FOR ALL USING (true) WITH CHECK (true);

-- Create function to find user by DodoPayments customer metadata
CREATE OR REPLACE FUNCTION public.get_user_by_dodo_metadata(subscription_metadata JSONB)
RETURNS UUID AS $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Extract user_id from metadata
    user_uuid := (subscription_metadata->>'user_id')::UUID;

    -- Validate that the user exists
    IF user_uuid IS NOT NULL AND EXISTS (SELECT 1 FROM auth.users WHERE id = user_uuid) THEN
        RETURN user_uuid;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment failed payment count for DodoPayments subscriptions
CREATE OR REPLACE FUNCTION increment_dodo_failed_payments(user_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.dodo_subscriptions
    SET
        failed_payment_count = failed_payment_count + 1,
        updated_at = NOW()
    WHERE user_id = user_uuid AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
