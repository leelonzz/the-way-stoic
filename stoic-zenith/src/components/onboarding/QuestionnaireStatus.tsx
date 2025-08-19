import React, { useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useOnboardingQuestionnaire } from '@/hooks/useOnboardingQuestionnaire'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { CheckCircle, ClipboardList, ArrowRight } from 'lucide-react'

interface QuestionnaireStatusProps {
  onStartQuestionnaire?: () => void
  showCard?: boolean
  className?: string
}

export function QuestionnaireStatus({
  onStartQuestionnaire,
  showCard = false,
  className = '',
}: QuestionnaireStatusProps): React.JSX.Element | null {
  const { user } = useAuthContext()
  const {
    questionnaireState,
    loading,
    fetchQuestionnaireState,
    isQuestionnaireCompleted,
  } = useOnboardingQuestionnaire(user)

  useEffect(() => {
    if (user) {
      fetchQuestionnaireState()
    }
  }, [user, fetchQuestionnaireState])

  if (!user || loading) {
    return null
  }

  // Don't show anything if questionnaire is completed
  if (isQuestionnaireCompleted) {
    if (showCard) {
      return (
        <Card className={`bg-green-50 border-green-200 ${className}`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">
                  Questionnaire Completed
                </p>
                <p className="text-sm text-green-600">
                  Thank you for helping us personalize your experience!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }
    return null
  }

  // Show incomplete status
  if (showCard) {
    return (
      <Card className={`bg-blue-50 border-blue-200 ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            Complete Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 mb-4">
            Help us personalize your Stoic journey by completing a quick
            questionnaire. It takes less than 2 minutes and helps us recommend
            relevant content.
          </p>
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Optional • 4 questions
            </Badge>
            {onStartQuestionnaire && (
              <Button
                onClick={onStartQuestionnaire}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Start Questionnaire
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Simple badge version
  return (
    <Badge
      variant="secondary"
      className={`bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200 ${className}`}
      onClick={onStartQuestionnaire}
    >
      <ClipboardList className="w-3 h-3 mr-1" />
      Complete Profile
    </Badge>
  )
}

// Hook to check questionnaire completion status
export function useQuestionnaireCompletion(user: any) {
  const { isQuestionnaireCompleted, fetchQuestionnaireState } =
    useOnboardingQuestionnaire(user)

  useEffect(() => {
    if (user) {
      fetchQuestionnaireState()
    }
  }, [user, fetchQuestionnaireState])

  return { isQuestionnaireCompleted }
}
