-- Add comprehensive onboarding survey fields to user_preferences table
-- This migration adds columns to store comprehensive user onboarding survey responses

-- Add new columns for comprehensive survey data
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS age_demographics DATE,
ADD COLUMN IF NOT EXISTS discovery_method TEXT,
ADD COLUMN IF NOT EXISTS stoic_familiarity TEXT CHECK (stoic_familiarity IN ('never_heard', 'heard_little', 'some_knowledge', 'well_versed', 'expert_practitioner')),
ADD COLUMN IF NOT EXISTS journal_goals TEXT[],
ADD COLUMN IF NOT EXISTS comprehensive_survey_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS comprehensive_survey_completed_at TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN public.user_preferences.age_demographics IS 'User''s birth date for age demographics and calendar defaults';
COMMENT ON COLUMN public.user_preferences.discovery_method IS 'How the user discovered the stoic journal application (search_engine, social_media, friend_referral, blog_article, app_store, other)';
COMMENT ON COLUMN public.user_preferences.stoic_familiarity IS 'User''s familiarity level with Stoic philosophy';
COMMENT ON COLUMN public.user_preferences.journal_goals IS 'Array of user''s primary goals for using the app (up to 2 selections)';
COMMENT ON COLUMN public.user_preferences.comprehensive_survey_completed IS 'Whether the user has completed the comprehensive onboarding survey';
COMMENT ON COLUMN public.user_preferences.comprehensive_survey_completed_at IS 'Timestamp when comprehensive survey was completed';

-- Create function to submit comprehensive survey
CREATE OR REPLACE FUNCTION public.submit_comprehensive_survey(
  p_user_id UUID,
  p_age_demographics DATE,
  p_discovery_method TEXT,
  p_stoic_familiarity TEXT,
  p_journal_goals TEXT[]
)
RETURNS public.user_preferences AS $$
DECLARE
  result public.user_preferences;
BEGIN
  INSERT INTO public.user_preferences (
    user_id,
    age_demographics,
    discovery_method,
    stoic_familiarity,
    journal_goals,
    comprehensive_survey_completed,
    comprehensive_survey_completed_at,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_age_demographics,
    p_discovery_method,
    p_stoic_familiarity,
    p_journal_goals,
    true,
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    age_demographics = EXCLUDED.age_demographics,
    discovery_method = EXCLUDED.discovery_method,
    stoic_familiarity = EXCLUDED.stoic_familiarity,
    journal_goals = EXCLUDED.journal_goals,
    comprehensive_survey_completed = true,
    comprehensive_survey_completed_at = NOW(),
    updated_at = NOW()
  RETURNING * INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.submit_comprehensive_survey(UUID, DATE, TEXT, TEXT, TEXT[]) TO authenticated;
