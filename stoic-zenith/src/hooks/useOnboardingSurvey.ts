import { useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import type { User } from '@supabase/supabase-js'

export interface SurveyData {
  ageDemographics: Date
  discoveryMethod: string
  stoicFamiliarity:
    | 'never_heard'
    | 'heard_little'
    | 'some_knowledge'
    | 'well_versed'
    | 'expert_practitioner'
  journalGoals: string[]
}

export interface SurveyState extends SurveyData {
  isCompleted: boolean
  completedAt: string | null
}

export interface UseOnboardingSurveyReturn {
  surveyState: SurveyState | null
  loading: boolean
  error: string | null
  submitSurvey: (data: SurveyData) => Promise<boolean>
  fetchSurveyState: () => Promise<void>
  isSurveyCompleted: boolean
}

// Discovery method options
export const DISCOVERY_METHOD_OPTIONS = [
  { value: 'search_engine', label: 'Search engine (Google, Bing, etc.)' },
  { value: 'social_media', label: 'Social media (Instagram, Twitter, etc.)' },
  { value: 'friend_referral', label: 'Friend/colleague recommendation' },
  { value: 'blog_article', label: 'Blog/article' },
  { value: 'app_store', label: 'App store' },
  { value: 'other', label: 'Other' },
] as const

// Stoic familiarity options
export const STOIC_FAMILIARITY_OPTIONS = [
  { value: 'never_heard', label: 'Never heard of it' },
  { value: 'heard_little', label: "Heard of it but don't know much" },
  { value: 'some_knowledge', label: 'Some knowledge' },
  { value: 'well_versed', label: 'Well-versed' },
  { value: 'expert_practitioner', label: 'Expert/practitioner' },
] as const

// Journal goals options
export const JOURNAL_GOALS_OPTIONS = [
  { value: 'daily_reflection', label: 'Daily reflection' },
  { value: 'stress_management', label: 'Stress management' },
  { value: 'personal_growth', label: 'Personal growth' },
  { value: 'habit_tracking', label: 'Habit tracking' },
  { value: 'creative_writing', label: 'Creative writing' },
  { value: 'philosophical_study', label: 'Philosophical study' },
  { value: 'mental_health_support', label: 'Mental health support' },
] as const

export function useOnboardingSurvey(
  user: User | null
): UseOnboardingSurveyReturn {
  const [surveyState, setSurveyState] = useState<SurveyState | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchSurveyState = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select(
          'age_demographics, discovery_method, stoic_familiarity, journal_goals, comprehensive_survey_completed, comprehensive_survey_completed_at'
        )
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        throw error
      }

      if (data) {
        setSurveyState({
          ageDemographics: data.age_demographics
            ? new Date(data.age_demographics)
            : new Date(),
          discoveryMethod: data.discovery_method || '',
          stoicFamiliarity: data.stoic_familiarity || 'never_heard',
          journalGoals: data.journal_goals || [],
          isCompleted: data.comprehensive_survey_completed || false,
          completedAt: data.comprehensive_survey_completed_at,
        })
      } else {
        // No preferences found - new user
        setSurveyState({
          ageDemographics: new Date(),
          discoveryMethod: '',
          stoicFamiliarity: 'never_heard',
          journalGoals: [],
          isCompleted: false,
          completedAt: null,
        })
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch survey state'
      setError(errorMessage)
      console.error('Error fetching survey state:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  const submitSurvey = useCallback(
    async (data: SurveyData): Promise<boolean> => {
      if (!user) {
        setError('User not authenticated')
        return false
      }

      setLoading(true)
      setError(null)

      try {
        const { data: result, error } = await supabase.rpc(
          'submit_comprehensive_survey',
          {
            p_user_id: user.id,
            p_age_demographics: data.ageDemographics
              .toISOString()
              .split('T')[0],
            p_discovery_method: data.discoveryMethod,
            p_stoic_familiarity: data.stoicFamiliarity,
            p_journal_goals: data.journalGoals,
          }
        )

        if (error) throw error

        // Update local state
        setSurveyState({
          ...data,
          isCompleted: true,
          completedAt: new Date().toISOString(),
        })

        toast({
          title: 'Survey completed!',
          description: 'Thank you for helping us personalize your experience.',
        })

        return true
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to submit survey'
        setError(errorMessage)
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
        console.error('Error submitting survey:', err)
        return false
      } finally {
        setLoading(false)
      }
    },
    [user, toast]
  )

  const isSurveyCompleted = surveyState?.isCompleted || false

  return {
    surveyState,
    loading,
    error,
    submitSurvey,
    fetchSurveyState,
    isSurveyCompleted,
  }
}
