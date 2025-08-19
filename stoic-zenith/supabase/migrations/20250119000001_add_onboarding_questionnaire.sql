-- Add onboarding questionnaire fields to user_preferences table
-- This migration adds columns to store user onboarding questionnaire responses

-- Add new columns for questionnaire data
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS discovery_source TEXT,
ADD COLUMN IF NOT EXISTS stoic_intent TEXT[],
ADD COLUMN IF NOT EXISTS experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
ADD COLUMN IF NOT EXISTS personal_goals TEXT[],
ADD COLUMN IF NOT EXISTS questionnaire_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS questionnaire_completed_at TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN public.user_preferences.discovery_source IS 'How the user discovered the app (social_media, search, referral, etc.)';
COMMENT ON COLUMN public.user_preferences.stoic_intent IS 'Array of reasons why user is interested in Stoic philosophy';
COMMENT ON COLUMN public.user_preferences.experience_level IS 'User''s familiarity with Stoic philosophy (beginner, intermediate, advanced)';
COMMENT ON COLUMN public.user_preferences.personal_goals IS 'Array of what the user hopes to achieve';
COMMENT ON COLUMN public.user_preferences.questionnaire_completed IS 'Whether the user has completed the onboarding questionnaire';
COMMENT ON COLUMN public.user_preferences.questionnaire_completed_at IS 'Timestamp when questionnaire was completed';

-- Update the upsert function to include new fields
CREATE OR REPLACE FUNCTION public.upsert_user_preferences(
  p_user_id UUID,
  p_birth_date DATE DEFAULT NULL,
  p_life_expectancy INTEGER DEFAULT 80,
  p_theme_preference TEXT DEFAULT 'light',
  p_notifications_enabled BOOLEAN DEFAULT true,
  p_daily_quote_time TIME DEFAULT '09:00:00',
  p_timezone TEXT DEFAULT 'UTC',
  p_discovery_source TEXT DEFAULT NULL,
  p_stoic_intent TEXT[] DEFAULT NULL,
  p_experience_level TEXT DEFAULT NULL,
  p_personal_goals TEXT[] DEFAULT NULL,
  p_questionnaire_completed BOOLEAN DEFAULT NULL,
  p_questionnaire_completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
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
    discovery_source,
    stoic_intent,
    experience_level,
    personal_goals,
    questionnaire_completed,
    questionnaire_completed_at,
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
    p_discovery_source,
    p_stoic_intent,
    p_experience_level,
    p_personal_goals,
    p_questionnaire_completed,
    p_questionnaire_completed_at,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    birth_date = COALESCE(EXCLUDED.birth_date, user_preferences.birth_date),
    life_expectancy = COALESCE(EXCLUDED.life_expectancy, user_preferences.life_expectancy),
    theme_preference = COALESCE(EXCLUDED.theme_preference, user_preferences.theme_preference),
    notifications_enabled = COALESCE(EXCLUDED.notifications_enabled, user_preferences.notifications_enabled),
    daily_quote_time = COALESCE(EXCLUDED.daily_quote_time, user_preferences.daily_quote_time),
    timezone = COALESCE(EXCLUDED.timezone, user_preferences.timezone),
    discovery_source = COALESCE(EXCLUDED.discovery_source, user_preferences.discovery_source),
    stoic_intent = COALESCE(EXCLUDED.stoic_intent, user_preferences.stoic_intent),
    experience_level = COALESCE(EXCLUDED.experience_level, user_preferences.experience_level),
    personal_goals = COALESCE(EXCLUDED.personal_goals, user_preferences.personal_goals),
    questionnaire_completed = COALESCE(EXCLUDED.questionnaire_completed, user_preferences.questionnaire_completed),
    questionnaire_completed_at = COALESCE(EXCLUDED.questionnaire_completed_at, user_preferences.questionnaire_completed_at),
    updated_at = NOW()
  RETURNING * INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function specifically for updating questionnaire data
CREATE OR REPLACE FUNCTION public.update_questionnaire_responses(
  p_user_id UUID,
  p_discovery_source TEXT,
  p_stoic_intent TEXT[],
  p_experience_level TEXT,
  p_personal_goals TEXT[]
)
RETURNS public.user_preferences AS $$
DECLARE
  result public.user_preferences;
BEGIN
  INSERT INTO public.user_preferences (
    user_id,
    discovery_source,
    stoic_intent,
    experience_level,
    personal_goals,
    questionnaire_completed,
    questionnaire_completed_at,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_discovery_source,
    p_stoic_intent,
    p_experience_level,
    p_personal_goals,
    true,
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    discovery_source = EXCLUDED.discovery_source,
    stoic_intent = EXCLUDED.stoic_intent,
    experience_level = EXCLUDED.experience_level,
    personal_goals = EXCLUDED.personal_goals,
    questionnaire_completed = true,
    questionnaire_completed_at = NOW(),
    updated_at = NOW()
  RETURNING * INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
