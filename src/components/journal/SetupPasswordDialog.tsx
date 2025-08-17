'use client'

import React, { useState } from 'react'
import { Eye, EyeOff, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface SetupPasswordDialogProps {
  isOpen: boolean
  onSuccess: () => void
  onCancel: () => void
}

export function SetupPasswordDialog({ isOpen, onSuccess, onCancel }: SetupPasswordDialogProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSetupLoading, setIsSetupLoading] = useState(false)
  const [error, setError] = useState('')

  const passwordStrengthChecks = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'Contains uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', valid: /[a-z]/.test(password) },
    { label: 'Contains number or symbol', valid: /[\d\W]/.test(password) },
  ]

  const isPasswordValid = passwordStrengthChecks.every(check => check.valid)
  const passwordsMatch = password === confirmPassword && password.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isPasswordValid) {
      setError('Please ensure your password meets all requirements')
      return
    }

    if (!passwordsMatch) {
      setError('Passwords do not match')
      return
    }

    setIsSetupLoading(true)
    setError('')

    try {
      const response = await fetch('/api/journal/password/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        onSuccess()
        setPassword('')
        setConfirmPassword('')
      } else {
        setError(data.error || 'Failed to setup password')
      }
    } catch (error) {
      setError('Failed to setup password. Please try again.')
    } finally {
      setIsSetupLoading(false)
    }
  }

  const handleCancel = () => {
    setPassword('')
    setConfirmPassword('')
    setError('')
    onCancel()
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => !isSetupLoading && handleCancel()}>
      <DialogContent className="sm:max-w-md bg-parchment border-stone/20">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-stone/20 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-stone" />
          </div>
          <DialogTitle className="text-xl font-serif text-ink">
            Setup Journal Password
          </DialogTitle>
          <DialogDescription className="text-stone">
            Create a secure password to protect your journal entries.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 bg-white border border-stone/20 rounded-lg text-ink placeholder-stone/60 focus:outline-none focus:border-cta focus:ring-1 focus:ring-cta"
                  disabled={isSetupLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone hover:text-ink transition-colors"
                  disabled={isSetupLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 pr-12 bg-white border border-stone/20 rounded-lg text-ink placeholder-stone/60 focus:outline-none focus:border-cta focus:ring-1 focus:ring-cta"
                  disabled={isSetupLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone hover:text-ink transition-colors"
                  disabled={isSetupLoading}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Password Strength Indicators */}
            {password.length > 0 && (
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
            {confirmPassword.length > 0 && (
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
              disabled={isSetupLoading}
              className="flex-1 border-stone/30 text-stone hover:bg-stone/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSetupLoading || !isPasswordValid || !passwordsMatch}
              className="flex-1 bg-cta hover:bg-cta/90 text-white"
            >
              {isSetupLoading ? 'Setting up...' : 'Setup Password'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}