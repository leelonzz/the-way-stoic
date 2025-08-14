'use client'

import React, { useState, useEffect } from 'react'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { VerifyPasswordDialog } from './VerifyPasswordDialog'
import { BrandedLoadingScreen } from '@/components/ui/loading-spinner'

interface JournalPasswordGateProps {
  children: React.ReactNode
}

export function JournalPasswordGate({ children }: JournalPasswordGateProps) {
  const { user, profile } = useAuthContext()
  const [isPasswordProtected, setIsPasswordProtected] = useState<boolean | null>(null)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Optimized password protection check with faster resolution
  useEffect(() => {
    if (!user || !profile) return

    const checkPasswordProtection = () => {
      const isProtected = profile.journal_password_enabled === true
      setIsPasswordProtected(isProtected)

      if (isProtected) {
        // Check if session is already unlocked
        const sessionUnlocked = sessionStorage.getItem('journal:unlocked') === 'true'
        setIsUnlocked(sessionUnlocked)
        setShowPasswordDialog(!sessionUnlocked)
        setIsLoading(false) // Set loading false immediately for protected journals
      } else {
        // No password protection, allow access immediately
        setIsUnlocked(true)
        setShowPasswordDialog(false)
        setIsLoading(false)
      }
    }

    // Use setTimeout to prevent blocking the main thread
    const timeoutId = setTimeout(checkPasswordProtection, 0)
    return () => clearTimeout(timeoutId)
  }, [user, profile])

  // Early return for known unlocked state to reduce render cycles
  useEffect(() => {
    if (user && profile && profile.journal_password_enabled !== true) {
      setIsLoading(false)
      setIsUnlocked(true)
    }
  }, [user, profile])

  const handlePasswordVerified = () => {
    // Set session unlock flag
    sessionStorage.setItem('journal:unlocked', 'true')
    setIsUnlocked(true)
    setShowPasswordDialog(false)
  }

  const handlePasswordCancel = () => {
    // User cancelled password entry, they can't access journal
    setShowPasswordDialog(false)
    // Don't set unlocked to true
  }

  // Loading state
  if (isLoading) {
    return <BrandedLoadingScreen message="Checking journal access..." />
  }

  // Password protection not enabled, show journal
  if (isPasswordProtected === false) {
    return <>{children}</>
  }

  // Password protection enabled and unlocked, show journal
  if (isPasswordProtected === true && isUnlocked) {
    return <>{children}</>
  }

  // Password protection enabled but not unlocked
  if (isPasswordProtected === true && !isUnlocked) {
    if (showPasswordDialog) {
      return (
        <VerifyPasswordDialog
          isOpen={true}
          onSuccess={handlePasswordVerified}
          onCancel={handlePasswordCancel}
        />
      )
    } else {
      // User cancelled password entry, show access denied message
      return (
        <div className="h-full flex items-center justify-center bg-parchment">
          <div className="text-center p-8 max-w-md">
            <div className="w-16 h-16 mx-auto mb-6 bg-stone/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-stone" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-serif font-semibold text-ink mb-4">
              Journal Protected
            </h2>
            <p className="text-stone mb-6">
              Your journal is password protected. Please enter your password to continue.
            </p>
            <button
              onClick={() => setShowPasswordDialog(true)}
              className="px-6 py-3 bg-cta hover:bg-cta/90 text-white rounded-lg transition-colors font-medium"
            >
              Enter Password
            </button>
          </div>
        </div>
      )
    }
  }

  // Default fallback
  return <BrandedLoadingScreen message="Loading journal..." />
}