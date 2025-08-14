'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { 
  AlertTriangle, 
  Trash2, 
  Shield,
  Loader2,
  Info
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface AccountCancellationProps {
  className?: string
}

export function AccountCancellation({ className }: AccountCancellationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState('')
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { user, session, profile, signOut } = useAuthContext()
  const { toast } = useToast()

  const handleCancelAccount = async () => {
    if (!user || !profile) return

    if (confirmEmail !== user.email) {
      toast({
        title: 'Email Mismatch',
        description: 'Please enter your email address exactly as shown',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsLoading(true)
      
      const response = await fetch('/api/account/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmEmail,
          reason: reason.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to cancel account')
      }

      const data = await response.json()
      
      toast({
        title: 'Account Cancelled',
        description: data.message || 'Your account has been cancelled successfully',
      })

      // Close dialog and sign out user
      setIsOpen(false)
      
      // Sign out after a brief delay to show the success message
      setTimeout(() => {
        signOut()
      }, 2000)

    } catch (error) {
      console.error('Error cancelling account:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to cancel account',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setConfirmEmail('')
    setReason('')
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <Trash2 className="h-5 w-5" />
          Cancel Account
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Cancelling your account will downgrade you to the Seeker plan and preserve your 
            trial usage history to prevent abuse. Your data will remain accessible.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <p className="text-sm text-stone">
            If you cancel your account:
          </p>
          <ul className="text-sm text-stone space-y-1 ml-4">
            <li>• Your subscription will be cancelled immediately</li>
            <li>• You'll be downgraded to the free Seeker plan</li>
            <li>• Your trial usage history will be preserved</li>
            <li>• You cannot use free trials again with this Google account</li>
            <li>• Your journal entries and data will remain accessible</li>
          </ul>
        </div>

        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button 
              variant="destructive" 
              className="w-full"
              disabled={!user}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Cancel My Account
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Cancel Account
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. Please confirm you want to cancel your account.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Alert variant="destructive">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Your trial usage will be permanently recorded 
                  to prevent abuse. You cannot access free trials again with this Google account.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="confirm-email">
                  Confirm your email address: <strong>{user?.email}</strong>
                </Label>
                <Input
                  id="confirm-email"
                  type="email"
                  placeholder="Enter your email address"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">
                  Reason for cancellation (optional)
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Help us improve by telling us why you're cancelling..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={isLoading}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Keep Account
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelAccount}
                disabled={isLoading || confirmEmail !== user?.email}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Cancel Account
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
