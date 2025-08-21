'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useOnboardingSurvey,
  DISCOVERY_METHOD_OPTIONS,
  STOIC_FAMILIARITY_OPTIONS,
  JOURNAL_GOALS_OPTIONS,
  type SurveyData,
} from '@/hooks/useOnboardingSurvey'
import { useAuthContext } from '@/components/auth/AuthProvider'
import {
  Calendar,
  Users,
  BookOpen,
  Target,
  SkipForward,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const surveySchema = z.object({
  ageDemographics: z.date({
    required_error: 'Please select your birth date',
  }),
  discoveryMethod: z.string().min(1, 'Please select how you discovered us'),
  stoicFamiliarity: z.enum(
    [
      'never_heard',
      'heard_little',
      'some_knowledge',
      'well_versed',
      'expert_practitioner',
    ],
    {
      required_error: 'Please select your familiarity level',
    }
  ),
  journalGoals: z
    .array(z.string())
    .min(1, 'Please select at least one goal')
    .max(2, 'Please select at most 2 goals'),
})

type FormData = z.infer<typeof surveySchema>

interface OnboardingSurveyModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete?: () => void
  onSkip?: () => void
}

export function OnboardingSurveyModal({
  isOpen,
  onClose,
  onComplete,
  onSkip,
}: OnboardingSurveyModalProps): React.JSX.Element {
  const { user } = useAuthContext()
  const {
    surveyState,
    loading,
    submitSurvey,
    fetchSurveyState,
    isSurveyCompleted,
  } = useOnboardingSurvey(user)

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  const form = useForm<FormData>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      ageDemographics: new Date(),
      discoveryMethod: '',
      stoicFamiliarity: 'never_heard',
      journalGoals: [],
    },
  })

  // Load existing data when component mounts
  useEffect(() => {
    if (user && isOpen) {
      fetchSurveyState()
    }
  }, [user, isOpen, fetchSurveyState])

  // Close modal if survey is already completed
  useEffect(() => {
    if (isSurveyCompleted && isOpen) {
      onClose()
    }
  }, [isSurveyCompleted, isOpen, onClose])

  const onSubmit = async (data: FormData) => {
    const success = await submitSurvey(data)
    if (success) {
      onComplete?.()
      onClose()
    }
  }

  const handleSkip = () => {
    onSkip?.()
    onClose()
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

  const canProceed = () => {
    const values = form.getValues()
    switch (currentStep) {
      case 1:
        return values.ageDemographics
      case 2:
        return values.discoveryMethod
      case 3:
        return values.stoicFamiliarity
      case 4:
        return values.journalGoals.length > 0 && values.journalGoals.length <= 2
      default:
        return true
    }
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-stone-600">Loading...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start mb-4">
            <div>
              <DialogTitle className="text-2xl font-serif text-ink">
                Welcome to Your Stoic Journey
              </DialogTitle>
              <DialogDescription className="text-stone-600 mt-2">
                Help us personalize your experience with a quick 5-question
                survey
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-stone-500 hover:text-stone-700"
            >
              <SkipForward className="w-4 h-4 mr-1" />
              Skip Survey
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-stone-600">
              <span>
                Question {currentStep} of {totalSteps}
              </span>
              <span>
                {Math.round((currentStep / totalSteps) * 100)}% complete
              </span>
            </div>
            <Progress
              value={(currentStep / totalSteps) * 100}
              className="h-2"
            />
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Age Demographics */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-medium text-ink">
                    What is your birth date?
                  </h3>
                </div>
                <p className="text-sm text-stone-600 mb-4">
                  This helps us set appropriate calendar navigation defaults and
                  content recommendations.
                </p>
                <FormField
                  control={form.control}
                  name="ageDemographics"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="date"
                          value={
                            field.value
                              ? field.value.toISOString().split('T')[0]
                              : ''
                          }
                          onChange={e =>
                            field.onChange(new Date(e.target.value))
                          }
                          className="bg-white/70"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 2: Discovery Method */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-medium text-ink">
                    How did you discover our stoic journal application?
                  </h3>
                </div>
                <p className="text-sm text-stone-600 mb-4">
                  This helps us understand user acquisition channels.
                </p>
                <FormField
                  control={form.control}
                  name="discoveryMethod"
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
                            {DISCOVERY_METHOD_OPTIONS.map(option => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 3: Stoic Philosophy Familiarity */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-medium text-ink">
                    How familiar are you with Stoic philosophy?
                  </h3>
                </div>
                <p className="text-sm text-stone-600 mb-4">
                  This helps us tailor content depth and provide appropriate
                  educational resources.
                </p>
                <FormField
                  control={form.control}
                  name="stoicFamiliarity"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="space-y-3"
                        >
                          {STOIC_FAMILIARITY_OPTIONS.map(option => (
                            <div
                              key={option.value}
                              className="flex items-center space-x-2"
                            >
                              <RadioGroupItem
                                value={option.value}
                                id={option.value}
                              />
                              <Label
                                htmlFor={option.value}
                                className="cursor-pointer"
                              >
                                {option.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 4: Journal Goals */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-medium text-ink">
                    What is your primary goal for using this app?
                  </h3>
                </div>
                <p className="text-sm text-stone-600 mb-4">
                  Select up to 2 options. This helps us customize prompt
                  suggestions and feature recommendations.
                </p>
                <FormField
                  control={form.control}
                  name="journalGoals"
                  render={() => (
                    <FormItem>
                      <div className="space-y-3">
                        {JOURNAL_GOALS_OPTIONS.map(option => (
                          <FormField
                            key={option.value}
                            control={form.control}
                            name="journalGoals"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(
                                      option.value
                                    )}
                                    onCheckedChange={checked => {
                                      const currentValues = field.value || []
                                      if (checked) {
                                        if (currentValues.length < 2) {
                                          field.onChange([
                                            ...currentValues,
                                            option.value,
                                          ])
                                        }
                                      } else {
                                        field.onChange(
                                          currentValues.filter(
                                            value => value !== option.value
                                          )
                                        )
                                      }
                                    }}
                                    disabled={
                                      !field.value?.includes(option.value) &&
                                      (field.value?.length || 0) >= 2
                                    }
                                  />
                                </FormControl>
                                <FormLabel className="cursor-pointer">
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

            {/* Step 5: Review and Submit */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-ink mb-4">
                  Review Your Responses
                </h3>
                <div className="space-y-3 bg-stone-50 p-4 rounded-lg">
                  <div>
                    <strong>Birth Date:</strong>{' '}
                    {form.getValues().ageDemographics?.toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Discovery Method:</strong>{' '}
                    {
                      DISCOVERY_METHOD_OPTIONS.find(
                        opt => opt.value === form.getValues().discoveryMethod
                      )?.label
                    }
                  </div>
                  <div>
                    <strong>Stoic Familiarity:</strong>{' '}
                    {
                      STOIC_FAMILIARITY_OPTIONS.find(
                        opt => opt.value === form.getValues().stoicFamiliarity
                      )?.label
                    }
                  </div>
                  <div>
                    <strong>Journal Goals:</strong>{' '}
                    {form
                      .getValues()
                      .journalGoals?.map(
                        goal =>
                          JOURNAL_GOALS_OPTIONS.find(opt => opt.value === goal)
                            ?.label
                      )
                      .join(', ')}
                  </div>
                </div>
                <p className="text-sm text-stone-600">
                  Thank you for taking the time to help us personalize your
                  experience!
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? 'Submitting...' : 'Complete Survey'}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
