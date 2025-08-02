-- Fix Calendar Issues - Run this in Supabase SQL Editor
-- This script fixes the 409 conflict errors and optimizes the user_preferences table

-- 1. Clean up any duplicate user_id entries (keep the most recent one based on created_at)
DELETE FROM public.user_preferences 
WHERE id NOT IN (
  SELECT id 
  FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
    FROM public.user_preferences
  ) ranked
  WHERE rn = 1
);

-- 2. Ensure the UNIQUE constraint is properly enforced
ALTER TABLE public.user_preferences DROP CONSTRAINT IF EXISTS user_preferences_user_id_key;
ALTER TABLE public.user_preferences ADD CONSTRAINT user_preferences_user_id_key UNIQUE (user_id);

-- 3. Create a function for safe upsert operations
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

-- 4. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.upsert_user_preferences(UUID, DATE, INTEGER, TEXT, BOOLEAN, TIME, TEXT) TO authenticated;

-- 5. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_created_at ON public.user_preferences(created_at);
CREATE INDEX IF NOT EXISTS idx_user_preferences_updated_at ON public.user_preferences(updated_at);

-- 6. Verify the fixes
SELECT 
  'Database fixes applied successfully!' as status,
  COUNT(*) as total_preferences,
  COUNT(DISTINCT user_id) as unique_users
FROM public.user_preferences; 