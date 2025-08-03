-- Create function to increment failed payment count
CREATE OR REPLACE FUNCTION increment_failed_payments(subscription_id TEXT)
RETURNS void AS $$
BEGIN
    UPDATE public.subscriptions
    SET 
        failed_payment_count = failed_payment_count + 1,
        updated_at = NOW()
    WHERE paypal_subscription_id = subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get subscription by PayPal ID
CREATE OR REPLACE FUNCTION get_subscription_by_paypal_id(paypal_id TEXT)
RETURNS TABLE(
    id UUID,
    user_id UUID,
    paypal_subscription_id TEXT,
    status TEXT,
    plan_type TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.user_id,
        s.paypal_subscription_id,
        s.status,
        s.plan_type
    FROM public.subscriptions s
    WHERE s.paypal_subscription_id = paypal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policy for webhook operations (service role access)
CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions
    FOR ALL USING (true) WITH CHECK (true);

-- Grant necessary permissions for webhook operations
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;