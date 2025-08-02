-- Fix user_preferences table conflicts and improve upsert functionality
-- This migration addresses the 409 conflict errors

-- First, let's check if there are any duplicate user_id entries and clean them up
DELETE FROM public.user_preferences 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM public.user_preferences 
  GROUP BY user_id
);

-- Ensure the UNIQUE constraint is properly enforced
ALTER TABLE public.user_preferences DROP CONSTRAINT IF EXISTS user_preferences_user_id_key;
ALTER TABLE public.user_preferences ADD CONSTRAINT user_preferences_user_id_key UNIQUE (user_id);

-- Create a function for safe upsert operations
CREATE OR REPLACE FUNCTION public.upsert_user_preferences(
  p_user_id UUID,
  p_birth_date DATE,
  p_life_expectancy INTEGER DEFAULT 80,
  p_theme_preference TEXT DEFAULT 'light',
  p_notifications_enabled BOOLEAN DEFAULT true,
  p_daily_quote_time TIME DEFAULT '09:00:00',
  p_timezone TEXT DEFAULT 'UTC'
)
RETURNS public.user_preferences AS $$
DECLARE
  result public.user_preferences;
BEGIN
  INSERT INTO public.user_preferences (
    user_id,
    birth_date,
    life_expectancy,
    theme_preference,
    notifications_enabled,
    daily_quote_time,
    timezone,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_birth_date,
    p_life_expectancy,
    p_theme_preference,
    p_notifications_enabled,
    p_daily_quote_time,
    p_timezone,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    birth_date = EXCLUDED.birth_date,
    life_expectancy = EXCLUDED.life_expectancy,
    theme_preference = EXCLUDED.theme_preference,
    notifications_enabled = EXCLUDED.notifications_enabled,
    daily_quote_time = EXCLUDED.daily_quote_time,
    timezone = EXCLUDED.timezone,
    updated_at = NOW()
  RETURNING * INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.upsert_user_preferences(UUID, DATE, INTEGER, TEXT, BOOLEAN, TIME, TEXT) TO authenticated;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_created_at ON public.user_preferences(created_at);
CREATE INDEX IF NOT EXISTS idx_user_preferences_updated_at ON public.user_preferences(updated_at); 