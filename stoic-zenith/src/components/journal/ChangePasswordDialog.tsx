'use client'

import React, { useState } from 'react'
import { Eye, EyeOff, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ChangePasswordDialogProps {
  isOpen: boolean
  onSuccess: () => void
  onCancel: () => void
}

export function ChangePasswordDialog({ isOpen, onSuccess, onCancel }: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChanging, setIsChanging] = useState(false)
  const [error, setError] = useState('')

  const passwordStrengthChecks = [
    { label: 'At least 8 characters', valid: newPassword.length >= 8 },
    { label: 'Contains uppercase letter', valid: /[A-Z]/.test(newPassword) },
    { label: 'Contains lowercase letter', valid: /[a-z]/.test(newPassword) },
    { label: 'Contains number or symbol', valid: /[\d\W]/.test(newPassword) },
  ]

  const isNewPasswordValid = passwordStrengthChecks.every(check => check.valid)
  const passwordsMatch = newPassword === confirmNewPassword && newPassword.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentPassword.trim()) {
      setError('Please enter your current password')
      return
    }

    if (!isNewPasswordValid) {
      setError('Please ensure your new password meets all requirements')
      return
    }

    if (!passwordsMatch) {
      setError('New passwords do not match')
      return
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password')
      return
    }

    setIsChanging(true)
    setError('')

    try {
      const response = await fetch('/api/journal/password/change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          currentPassword, 
          newPassword 
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        onSuccess()
        setCurrentPassword('')
        setNewPassword('')
        setConfirmNewPassword('')
      } else {
        setError(data.error || 'Failed to change password')
      }
    } catch (error) {
      setError('Failed to change password. Please try again.')
    } finally {
      setIsChanging(false)
    }
  }

  const handleCancel = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmNewPassword('')
    setError('')
    onCancel()
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => !isChanging && handleCancel()}>
      <DialogContent className="sm:max-w-md bg-parchment border-stone/20">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-stone/20 rounded-full flex items-center justify-center">
            <Key className="w-8 h-8 text-stone" />
          </div>
          <DialogTitle className="text-xl font-serif text-ink">
            Change Journal Password
          </DialogTitle>
          <DialogDescription className="text-stone">
            Enter your current password and create a new one.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {/* Current Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full px-4 py-3 pr-12 bg-white border border-stone/20 rounded-lg text-ink placeholder-stone/60 focus:outline-none focus:border-cta focus:ring-1 focus:ring-cta"
                  disabled={isChanging}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone hover:text-ink transition-colors"
                  disabled={isChanging}
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* New Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="w-full px-4 py-3 pr-12 bg-white border border-stone/20 rounded-lg text-ink placeholder-stone/60 focus:outline-none focus:border-cta focus:ring-1 focus:ring-cta"
                  disabled={isChanging}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone hover:text-ink transition-colors"
                  disabled={isChanging}
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="w-full px-4 py-3 pr-12 bg-white border border-stone/20 rounded-lg text-ink placeholder-stone/60 focus:outline-none focus:border-cta focus:ring-1 focus:ring-cta"
                  disabled={isChanging}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone hover:text-ink transition-colors"
                  disabled={isChanging}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Password Strength Indicators */}
            {newPassword.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-ink">Password Requirements</label>
                <div className="space-y-1">
                  {passwordStrengthChecks.map((check, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${check.valid ? 'bg-green-500' : 'bg-stone/30'}`} />
                      <span className={check.valid ? 'text-green-600' : 'text-stone'}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Password Match Indicator */}
            {confirmNewPassword.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${passwordsMatch ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={passwordsMatch ? 'text-green-600' : 'text-red-600'}>
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </span>
              </div>
            )}
            
            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isChanging}
              className="flex-1 border-stone/30 text-stone hover:bg-stone/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isChanging || !currentPassword.trim() || !isNewPasswordValid || !passwordsMatch}
              className="flex-1 bg-cta hover:bg-cta/90 text-white"
            >
              {isChanging ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}