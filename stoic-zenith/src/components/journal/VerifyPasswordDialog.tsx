'use client'

import React, { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface VerifyPasswordDialogProps {
  isOpen: boolean
  onSuccess: () => void
  onCancel: () => void
}

export function VerifyPasswordDialog({ isOpen, onSuccess, onCancel }: VerifyPasswordDialogProps) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password.trim()) {
      setError('Please enter your password')
      return
    }

    setIsVerifying(true)
    setError('')

    try {
      const response = await fetch('/api/journal/password/verify', {
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
      } else {
        setError(data.error || 'Invalid password')
      }
    } catch (error) {
      setError('Failed to verify password. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleCancel = () => {
    setPassword('')
    setError('')
    onCancel()
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => !isVerifying && handleCancel()}>
      <DialogContent className="sm:max-w-md bg-parchment border-stone/20">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-stone/20 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-stone" />
          </div>
          <DialogTitle className="text-xl font-serif text-ink">
            Enter Journal Password
          </DialogTitle>
          <DialogDescription className="text-stone">
            Please enter your password to access your protected journal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 pr-12 bg-white border border-stone/20 rounded-lg text-ink placeholder-stone/60 focus:outline-none focus:border-cta focus:ring-1 focus:ring-cta"
                disabled={isVerifying}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone hover:text-ink transition-colors"
                disabled={isVerifying}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
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
              disabled={isVerifying}
              className="flex-1 border-stone/30 text-stone hover:bg-stone/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isVerifying || !password.trim()}
              className="flex-1 bg-cta hover:bg-cta/90 text-white"
            >
              {isVerifying ? 'Verifying...' : 'Unlock Journal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}