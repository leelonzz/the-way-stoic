'use client'

import React, { useState } from 'react'
import { Shield, Lock, Key, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { SetupPasswordDialog } from '@/components/journal/SetupPasswordDialog'
import { ChangePasswordDialog } from '@/components/journal/ChangePasswordDialog'

export function JournalSecuritySection() {
  const { profile, refreshProfile } = useAuthContext()
  const [isToggling, setIsToggling] = useState(false)
  const [showSetupDialog, setShowSetupDialog] = useState(false)
  const [showChangeDialog, setShowChangeDialog] = useState(false)
  const [showDisableDialog, setShowDisableDialog] = useState(false)
  const [disablePassword, setDisablePassword] = useState('')
  const [showDisablePassword, setShowDisablePassword] = useState(false)
  const [error, setError] = useState('')

  const isPasswordEnabled = profile?.journal_password_enabled === true

  const handleToggleProtection = async (enabled: boolean) => {
    if (enabled) {
      // User wants to enable protection
      setShowSetupDialog(true)
    } else {
      // User wants to disable protection
      setShowDisableDialog(true)
    }
  }

  const handleSetupSuccess = async () => {
    setShowSetupDialog(false)
    await refreshProfile()
  }

  const handleChangeSuccess = async () => {
    setShowChangeDialog(false)
    await refreshProfile()
  }

  const handleDisableSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!disablePassword.trim()) {
      setError('Please enter your password')
      return
    }

    setIsToggling(true)
    setError('')

    try {
      const response = await fetch('/api/journal/password/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          enabled: false, 
          password: disablePassword 
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setShowDisableDialog(false)
        setDisablePassword('')
        // Clear the session unlock since protection is now disabled
        sessionStorage.removeItem('journal:unlocked')
        await refreshProfile()
      } else {
        setError(data.error || 'Failed to disable password protection')
      }
    } catch (error) {
      setError('Failed to disable password protection. Please try again.')
    } finally {
      setIsToggling(false)
    }
  }

  const handleDisableCancel = () => {
    setShowDisableDialog(false)
    setDisablePassword('')
    setError('')
  }

  return (
    <>
      <div className="space-y-6">
        <h3 className="text-lg font-serif font-semibold text-ink flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Journal Security
        </h3>
        
        <div className="space-y-4">
          {/* Password Protection Toggle */}
          <div className="flex items-center justify-between py-4 border-b border-stone/20">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Lock className="w-4 h-4 text-stone" />
                <div className="text-sm font-medium text-ink">Password Protection</div>
              </div>
              <div className="text-sm text-stone">
                {isPasswordEnabled 
                  ? 'Your journal is password protected' 
                  : 'Protect your journal with a password'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleProtection(!isPasswordEnabled)}
                disabled={isToggling}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cta focus:ring-offset-2 ${
                  isPasswordEnabled ? 'bg-cta' : 'bg-stone/30'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isPasswordEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Change Password Button (only show if password is enabled) */}
          {isPasswordEnabled && (
            <div className="flex items-center justify-between py-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Key className="w-4 h-4 text-stone" />
                  <div className="text-sm font-medium text-ink">Change Password</div>
                </div>
                <div className="text-sm text-stone">
                  Update your journal password
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChangeDialog(true)}
                className="border-stone/30 text-ink hover:bg-stone/5"
              >
                Change Password
              </Button>
            </div>
          )}

          {/* Security Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">How it works:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Password is required only when you open a new tab</li>
                  <li>• Your session stays unlocked until you close the tab</li>
                  <li>• Passwords are securely encrypted and never stored in plain text</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Password Dialog */}
      <SetupPasswordDialog
        isOpen={showSetupDialog}
        onSuccess={handleSetupSuccess}
        onCancel={() => setShowSetupDialog(false)}
      />

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        isOpen={showChangeDialog}
        onSuccess={handleChangeSuccess}
        onCancel={() => setShowChangeDialog(false)}
      />

      {/* Disable Password Dialog */}
      {showDisableDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-parchment border border-stone/20 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-ink mb-2">
                Disable Password Protection
              </h3>
              <p className="text-stone">
                Enter your password to disable journal protection.
              </p>
            </div>

            <form onSubmit={handleDisableSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-ink">Current Password</label>
                <div className="relative">
                  <input
                    type={showDisablePassword ? 'text' : 'password'}
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 bg-white border border-stone/20 rounded-lg text-ink placeholder-stone/60 focus:outline-none focus:border-cta focus:ring-1 focus:ring-cta"
                    disabled={isToggling}
                  />
                  <button
                    type="button"
                    onClick={() => setShowDisablePassword(!showDisablePassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone hover:text-ink transition-colors"
                    disabled={isToggling}
                  >
                    {showDisablePassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDisableCancel}
                  disabled={isToggling}
                  className="flex-1 border-stone/30 text-stone hover:bg-stone/5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isToggling || !disablePassword.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {isToggling ? 'Disabling...' : 'Disable Protection'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}