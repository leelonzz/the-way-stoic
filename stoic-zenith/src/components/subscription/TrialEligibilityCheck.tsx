'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Crown, 
  Clock,
  Shield,
  Loader2
} from 'lucide-react'

interface TrialEligibilityResult {
  eligible: boolean
  reason?: string
  hasUsedTrial: boolean
  trialUsedAt?: string
  googleAccountId?: string
}

interface TrialEligibilityCheckProps {
  onTrialStart?: () => void
  onUpgrade?: () => void
  className?: string
}

export function TrialEligibilityCheck({ 
  onTrialStart, 
  onUpgrade, 
  className 
}: TrialEligibilityCheckProps) {
  const [eligibility, setEligibility] = useState<TrialEligibilityResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [startingTrial, setStartingTrial] = useState(false)
  const { user, session, profile } = useAuthContext()
  const { toast } = useToast()

  useEffect(() => {
    if (user && profile) {
      checkEligibility()
    }
  }, [user, profile])

  const checkEligibility = async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await fetch('/api/trial/eligibility', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to check trial eligibility')
      }

      const data = await response.json()
      setEligibility(data)
    } catch (error) {
      console.error('Error checking trial eligibility:', error)
      toast({
        title: 'Error',
        description: 'Failed to check trial eligibility',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const startTrial = async () => {
    if (!user || !eligibility?.eligible) return

    try {
      setStartingTrial(true)
      const response = await fetch('/api/trial/eligibility', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planType: 'philosopher' }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to start trial')
      }

      toast({
        title: 'Trial Started!',
        description: 'Your free trial has been activated. Enjoy premium features!',
      })

      onTrialStart?.()
    } catch (error) {
      console.error('Error starting trial:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start trial',
        variant: 'destructive',
      })
    } finally {
      setStartingTrial(false)
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-stone" />
          <span className="ml-2 text-stone">Checking trial eligibility...</span>
        </CardContent>
      </Card>
    )
  }

  if (!eligibility) {
    return (
      <Alert className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Unable to check trial eligibility. Please try again later.
        </AlertDescription>
      </Alert>
    )
  }

  // User has active subscription
  if (profile?.subscription_status === 'active' && profile?.subscription_plan === 'philosopher') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-600" />
            Premium Active
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-stone">You have full access to all premium features</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // User is eligible for trial
  if (eligibility.eligible) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-600" />
            Free Trial Available
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-stone">You're eligible for a free trial</span>
          </div>
          
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Start your free trial to access premium features including AI mentor chat, 
              advanced analytics, and exclusive content.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button
              onClick={startTrial}
              disabled={startingTrial}
              className="bg-cta hover:bg-cta/90 text-white flex-1"
            >
              {startingTrial ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting Trial...
                </>
              ) : (
                <>
                  <Crown className="h-4 w-4 mr-2" />
                  Start Free Trial
                </>
              )}
            </Button>
            
            <Button
              onClick={onUpgrade}
              variant="outline"
              className="border-cta text-cta hover:bg-cta/10"
            >
              Subscribe Now
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // User is not eligible for trial
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-600" />
          Trial Not Available
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {eligibility.reason || 'You are not eligible for a free trial'}
          </AlertDescription>
        </Alert>

        {eligibility.hasUsedTrial && eligibility.trialUsedAt && (
          <div className="flex items-center gap-2 text-sm text-stone">
            <Clock className="h-4 w-4" />
            <span>
              Trial used on {new Date(eligibility.trialUsedAt).toLocaleDateString()}
            </span>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm text-stone">
            To access premium features, please subscribe to the Philosopher plan.
          </p>
          
          <Button
            onClick={onUpgrade}
            className="bg-cta hover:bg-cta/90 text-white w-full"
          >
            <Crown className="h-4 w-4 mr-2" />
            Subscribe to Premium
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
