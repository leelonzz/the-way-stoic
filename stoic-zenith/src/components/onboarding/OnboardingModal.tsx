'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { OnboardingQuestionnaire } from './OnboardingQuestionnaire'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete?: () => void
  onSkip?: () => void
}

export function OnboardingModal({
  isOpen,
  onClose,
  onComplete,
  onSkip,
}: OnboardingModalProps): React.JSX.Element {
  const handleComplete = () => {
    onComplete?.()
    onClose()
  }

  const handleSkip = () => {
    onSkip?.()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>Welcome Survey</DialogTitle>
          <DialogDescription>
            Help us personalize your stoic journal experience
          </DialogDescription>
        </DialogHeader>
        <OnboardingQuestionnaire
          onComplete={handleComplete}
          onSkip={handleSkip}
        />
      </DialogContent>
    </Dialog>
  )
}
