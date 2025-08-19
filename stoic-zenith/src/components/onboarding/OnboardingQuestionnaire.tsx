'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  useOnboardingQuestionnaire,
  DISCOVERY_SOURCES,
  STOIC_INTENT_OPTIONS,
  PERSONAL_GOALS_OPTIONS,
  type QuestionnaireData,
} from '@/hooks/useOnboardingQuestionnaire'
import { useAuthContext } from '@/components/auth/AuthProvider'
import {
  CheckCircle,
  Users,
  Target,
  BookOpen,
  Lightbulb,
  SkipForward,
} from 'lucide-react'

const questionnaireSchema = z.object({
  discoverySource: z.string().min(1, 'Please select how you discovered us'),
  stoicIntent: z.array(z.string()).min(1, 'Please select at least one reason'),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced'], {
    required_error: 'Please select your experience level',
  }),
  personalGoals: z.array(z.string()).min(1, 'Please select at least one goal'),
})

type FormData = z.infer<typeof questionnaireSchema>

interface OnboardingQuestionnaireProps {
  onComplete?: () => void
  onSkip?: () => void
}

export function OnboardingQuestionnaire({
  onComplete,
  onSkip,
}: OnboardingQuestionnaireProps): React.JSX.Element {
  const { user } = useAuthContext()
  const {
    questionnaireState,
    loading,
    submitQuestionnaire,
    fetchQuestionnaireState,
    isQuestionnaireCompleted,
  } = useOnboardingQuestionnaire(user)

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const form = useForm<FormData>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: {
      discoverySource: '',
      stoicIntent: [],
      experienceLevel: 'beginner',
      personalGoals: [],
    },
  })

  // Load existing data when component mounts
  useEffect(() => {
    if (user) {
      fetchQuestionnaireState()
    }
  }, [user, fetchQuestionnaireState])

  // Populate form with existing data
  useEffect(() => {
    if (questionnaireState && !isQuestionnaireCompleted) {
      form.reset({
        discoverySource: questionnaireState.discoverySource,
        stoicIntent: questionnaireState.stoicIntent,
        experienceLevel: questionnaireState.experienceLevel,
        personalGoals: questionnaireState.personalGoals,
      })
    }
  }, [questionnaireState, isQuestionnaireCompleted, form])

  const onSubmit = async (data: FormData) => {
    const success = await submitQuestionnaire(data)
    if (success) {
      onComplete?.()
    }
  }

  const handleSkip = () => {
    onSkip?.()
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getStepValidation = () => {
    const values = form.getValues()
    switch (currentStep) {
      case 1:
        return !!values.discoverySource
      case 2:
        return values.stoicIntent.length > 0
      case 3:
        return !!values.experienceLevel
      case 4:
        return values.personalGoals.length > 0
      default:
        return false
    }
  }

  if (isQuestionnaireCompleted) {
    return (
      <Card className="bg-gradient-to-br from-hero/10 to-cta/5 border-hero/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-serif text-ink">
            Questionnaire Completed
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-stone/70 mb-4">
            Thank you for completing the onboarding questionnaire! We'll use
            your responses to personalize your Stoic journey.
          </p>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Completed on{' '}
            {questionnaireState?.completedAt
              ? new Date(questionnaireState.completedAt).toLocaleDateString()
              : 'Unknown'}
          </Badge>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-hero/10 to-cta/5 border-hero/20">
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-2xl font-serif text-ink">
            Welcome to Your Stoic Journey
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-stone/60 hover:text-stone"
          >
            <SkipForward className="w-4 h-4 mr-1" />
            Skip for now
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-stone/60">
            <span>
              Step {currentStep} of {totalSteps}
            </span>
            <span>
              {Math.round((currentStep / totalSteps) * 100)}% complete
            </span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Discovery Source */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-cta" />
                  <h3 className="text-lg font-medium text-ink">
                    How did you discover us?
                  </h3>
                </div>
                <FormField
                  control={form.control}
                  name="discoverySource"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="bg-white/70">
                            <SelectValue placeholder="Select how you found us" />
                          </SelectTrigger>
                          <SelectContent>
                            {DISCOVERY_SOURCES.map(source => (
                              <SelectItem
                                key={source.value}
                                value={source.value}
                              >
                                {source.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        This helps us understand how people discover Stoic
                        philosophy
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 2: Stoic Intent */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-cta" />
                  <h3 className="text-lg font-medium text-ink">
                    What brings you to Stoic philosophy?
                  </h3>
                </div>
                <FormField
                  control={form.control}
                  name="stoicIntent"
                  render={() => (
                    <FormItem>
                      <FormDescription className="mb-4">
                        Select all that apply - understanding your motivations
                        helps us provide relevant content
                      </FormDescription>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {STOIC_INTENT_OPTIONS.map(option => (
                          <FormField
                            key={option.value}
                            control={form.control}
                            name="stoicIntent"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(
                                      option.value
                                    )}
                                    onCheckedChange={checked => {
                                      const updatedValue = checked
                                        ? [...(field.value || []), option.value]
                                        : (field.value || []).filter(
                                            value => value !== option.value
                                          )
                                      field.onChange(updatedValue)
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal leading-5">
                                  {option.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 3: Experience Level */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-cta" />
                  <h3 className="text-lg font-medium text-ink">
                    How familiar are you with Stoic philosophy?
                  </h3>
                </div>
                <FormField
                  control={form.control}
                  name="experienceLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormDescription className="mb-4">
                        This helps us recommend content at the right level for
                        you
                      </FormDescription>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="space-y-3"
                        >
                          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-stone/5">
                            <RadioGroupItem value="beginner" id="beginner" />
                            <div className="flex-1">
                              <label
                                htmlFor="beginner"
                                className="font-medium cursor-pointer"
                              >
                                Beginner
                              </label>
                              <p className="text-sm text-stone/60">
                                New to Stoicism or just getting started
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-stone/5">
                            <RadioGroupItem
                              value="intermediate"
                              id="intermediate"
                            />
                            <div className="flex-1">
                              <label
                                htmlFor="intermediate"
                                className="font-medium cursor-pointer"
                              >
                                Intermediate
                              </label>
                              <p className="text-sm text-stone/60">
                                Familiar with basic concepts and some key
                                philosophers
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-stone/5">
                            <RadioGroupItem value="advanced" id="advanced" />
                            <div className="flex-1">
                              <label
                                htmlFor="advanced"
                                className="font-medium cursor-pointer"
                              >
                                Advanced
                              </label>
                              <p className="text-sm text-stone/60">
                                Well-versed in Stoic texts and actively
                                practicing
                              </p>
                            </div>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 4: Personal Goals */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-cta" />
                  <h3 className="text-lg font-medium text-ink">
                    What do you hope to achieve?
                  </h3>
                </div>
                <FormField
                  control={form.control}
                  name="personalGoals"
                  render={() => (
                    <FormItem>
                      <FormDescription className="mb-4">
                        Select your goals so we can provide personalized
                        recommendations and track your progress
                      </FormDescription>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {PERSONAL_GOALS_OPTIONS.map(goal => (
                          <FormField
                            key={goal.value}
                            control={form.control}
                            name="personalGoals"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(goal.value)}
                                    onCheckedChange={checked => {
                                      const updatedValue = checked
                                        ? [...(field.value || []), goal.value]
                                        : (field.value || []).filter(
                                            value => value !== goal.value
                                          )
                                      field.onChange(updatedValue)
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal leading-5">
                                  {goal.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!getStepValidation()}
                  className="bg-cta hover:bg-cta/90"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading || !getStepValidation()}
                  className="bg-cta hover:bg-cta/90"
                >
                  {loading ? 'Saving...' : 'Complete'}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
