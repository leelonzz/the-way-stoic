-- Add dodo_customer_id to profiles table for webhook mapping
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS dodo_customer_id TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_dodo_customer_id 
ON profiles(dodo_customer_id);

-- Create webhook_logs table for debugging failed webhooks
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- Add RLS policies for webhook_logs (only service role can access)
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Create index for webhook logs
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at 
ON webhook_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed 
ON webhook_logs(processed);

-- Add comment for documentation
COMMENT ON COLUMN profiles.dodo_customer_id IS 'Dodo Payments customer ID for webhook user mapping';
COMMENT ON TABLE webhook_logs IS 'Stores webhook payloads for debugging and recovery';