import { useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import type { User } from '@supabase/supabase-js'

export interface QuestionnaireData {
  discoverySource: string
  stoicIntent: string[]
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  personalGoals: string[]
}

export interface QuestionnaireState extends QuestionnaireData {
  isCompleted: boolean
  completedAt: string | null
}

export interface UseOnboardingQuestionnaireReturn {
  questionnaireState: QuestionnaireState | null
  loading: boolean
  error: string | null
  submitQuestionnaire: (data: QuestionnaireData) => Promise<boolean>
  fetchQuestionnaireState: () => Promise<void>
  isQuestionnaireCompleted: boolean
}

// Discovery source options
export const DISCOVERY_SOURCES = [
  { value: 'social_media', label: 'Social Media (Instagram, Twitter, etc.)' },
  { value: 'search_engine', label: 'Search Engine (Google, Bing, etc.)' },
  { value: 'friend_referral', label: 'Recommended by a friend' },
  { value: 'blog_article', label: 'Blog or article' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'book_recommendation', label: 'Book recommendation' },
  { value: 'app_store', label: 'App Store/Play Store' },
  { value: 'other', label: 'Other' },
] as const

// Stoic intent options
export const STOIC_INTENT_OPTIONS = [
  { value: 'personal_growth', label: 'Personal growth and self-improvement' },
  { value: 'stress_management', label: 'Managing stress and anxiety' },
  { value: 'emotional_resilience', label: 'Building emotional resilience' },
  { value: 'mindfulness', label: 'Developing mindfulness and presence' },
  { value: 'life_philosophy', label: 'Finding a life philosophy' },
  { value: 'decision_making', label: 'Improving decision-making' },
  { value: 'relationships', label: 'Better relationships and communication' },
  { value: 'productivity', label: 'Increased focus and productivity' },
  { value: 'meaning_purpose', label: 'Finding meaning and purpose' },
  { value: 'academic_interest', label: 'Academic or intellectual interest' },
] as const

// Personal goals options
export const PERSONAL_GOALS_OPTIONS = [
  { value: 'daily_reflection', label: 'Develop a daily reflection practice' },
  { value: 'emotional_control', label: 'Better control over emotions' },
  { value: 'reduce_anxiety', label: 'Reduce anxiety and worry' },
  { value: 'improve_focus', label: 'Improve focus and concentration' },
  { value: 'build_habits', label: 'Build positive habits' },
  { value: 'overcome_challenges', label: 'Better handle life challenges' },
  {
    value: 'increase_gratitude',
    label: 'Cultivate gratitude and appreciation',
  },
  { value: 'improve_relationships', label: 'Strengthen relationships' },
  { value: 'find_purpose', label: 'Discover life purpose and direction' },
  { value: 'inner_peace', label: 'Achieve inner peace and contentment' },
] as const

export function useOnboardingQuestionnaire(
  user: User | null
): UseOnboardingQuestionnaireReturn {
  const [questionnaireState, setQuestionnaireState] =
    useState<QuestionnaireState | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchQuestionnaireState = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select(
          'discovery_source, stoic_intent, experience_level, personal_goals, questionnaire_completed, questionnaire_completed_at'
        )
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        throw error
      }

      if (data) {
        setQuestionnaireState({
          discoverySource: data.discovery_source || '',
          stoicIntent: data.stoic_intent || [],
          experienceLevel: data.experience_level || 'beginner',
          personalGoals: data.personal_goals || [],
          isCompleted: data.questionnaire_completed || false,
          completedAt: data.questionnaire_completed_at,
        })
      } else {
        // No preferences record exists yet
        setQuestionnaireState({
          discoverySource: '',
          stoicIntent: [],
          experienceLevel: 'beginner',
          personalGoals: [],
          isCompleted: false,
          completedAt: null,
        })
      }
    } catch (err) {
      console.error('Error fetching questionnaire state:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to load questionnaire data'
      )
    } finally {
      setLoading(false)
    }
  }, [user])

  const submitQuestionnaire = useCallback(
    async (data: QuestionnaireData): Promise<boolean> => {
      if (!user) {
        setError('User not authenticated')
        return false
      }

      setLoading(true)
      setError(null)

      try {
        const { data: result, error } = await supabase.rpc(
          'update_questionnaire_responses',
          {
            p_user_id: user.id,
            p_discovery_source: data.discoverySource,
            p_stoic_intent: data.stoicIntent,
            p_experience_level: data.experienceLevel,
            p_personal_goals: data.personalGoals,
          }
        )

        if (error) throw error

        // Update local state
        setQuestionnaireState({
          ...data,
          isCompleted: true,
          completedAt: new Date().toISOString(),
        })

        toast({
          title: 'Questionnaire completed!',
          description: 'Thank you for helping us personalize your experience.',
        })

        return true
      } catch (err) {
        console.error('Error submitting questionnaire:', err)
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to save questionnaire responses'
        setError(errorMessage)

        toast({
          title: 'Error saving responses',
          description: errorMessage,
          variant: 'destructive',
        })

        return false
      } finally {
        setLoading(false)
      }
    },
    [user, toast]
  )

  return {
    questionnaireState,
    loading,
    error,
    submitQuestionnaire,
    fetchQuestionnaireState,
    isQuestionnaireCompleted: questionnaireState?.isCompleted || false,
  }
}
