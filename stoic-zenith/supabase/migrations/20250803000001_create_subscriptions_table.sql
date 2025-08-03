-- Create subscriptions table for tracking PayPal subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    paypal_subscription_id TEXT UNIQUE NOT NULL,
    paypal_plan_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    plan_type TEXT NOT NULL DEFAULT 'philosopher',
    amount DECIMAL(10,2) NOT NULL DEFAULT 14.00,
    currency TEXT NOT NULL DEFAULT 'USD',
    billing_cycle_start TIMESTAMP WITH TIME ZONE,
    billing_cycle_end TIMESTAMP WITH TIME ZONE,
    next_billing_time TIMESTAMP WITH TIME ZONE,
    last_payment_time TIMESTAMP WITH TIME ZONE,
    failed_payment_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_paypal_id ON public.subscriptions(paypal_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- Add subscription_status and plan_type to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'seeker',
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- Create function to update profile subscription status
CREATE OR REPLACE FUNCTION public.update_profile_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the profile with subscription information
    UPDATE public.profiles
    SET 
        subscription_status = CASE 
            WHEN NEW.status = 'ACTIVE' THEN 'active'
            WHEN NEW.status = 'CANCELLED' THEN 'cancelled'
            WHEN NEW.status = 'SUSPENDED' THEN 'suspended'
            WHEN NEW.status = 'EXPIRED' THEN 'expired'
            ELSE 'free'
        END,
        subscription_plan = CASE 
            WHEN NEW.status = 'ACTIVE' THEN NEW.plan_type
            ELSE 'seeker'
        END,
        subscription_expires_at = CASE 
            WHEN NEW.status = 'ACTIVE' THEN NEW.next_billing_time
            ELSE NULL
        END,
        updated_at = NOW()
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update profile when subscription changes
DROP TRIGGER IF EXISTS on_subscription_updated ON public.subscriptions;
CREATE TRIGGER on_subscription_updated
    AFTER INSERT OR UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_profile_subscription_status();

-- Create function to handle subscription expiry
CREATE OR REPLACE FUNCTION public.handle_subscription_expiry()
RETURNS void AS $$
BEGIN
    -- Update expired subscriptions
    UPDATE public.subscriptions
    SET 
        status = 'EXPIRED',
        updated_at = NOW()
    WHERE 
        status = 'ACTIVE' 
        AND next_billing_time < NOW() 
        AND failed_payment_count >= 3;
        
    -- Update profiles for expired subscriptions
    UPDATE public.profiles
    SET 
        subscription_status = 'expired',
        subscription_plan = 'seeker',
        subscription_expires_at = NULL,
        updated_at = NOW()
    WHERE id IN (
        SELECT user_id 
        FROM public.subscriptions 
        WHERE status = 'EXPIRED'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;