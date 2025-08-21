-- Update onboarding questionnaire to include birth_date in the update function
-- This migration updates the update_questionnaire_responses function to handle birth_date

-- Drop the existing function
DROP FUNCTION IF EXISTS public.update_questionnaire_responses(UUID, TEXT, TEXT[], TEXT, TEXT[]);

-- Create the updated function with birth_date parameter
CREATE OR REPLACE FUNCTION public.update_questionnaire_responses(
  p_user_id UUID,
  p_birth_date DATE,
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
    birth_date,
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
    birth_date = EXCLUDED.birth_date,
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

-- Add comment for documentation
COMMENT ON FUNCTION public.update_questionnaire_responses(UUID, DATE, TEXT, TEXT[], TEXT, TEXT[]) IS 'Updates user questionnaire responses including birth date, discovery source, stoic intent, experience level, and personal goals';
