'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthContext } from '@/components/auth/AuthProvider'

interface JournalPasswordState {
  isProtected: boolean | null
  isUnlocked: boolean
  isLoading: boolean
  error: string | null
}

export function useJournalPassword() {
  const { user, profile } = useAuthContext()
  const [state, setState] = useState<JournalPasswordState>({
    isProtected: null,
    isUnlocked: false,
    isLoading: true,
    error: null
  })

  // Check password protection status and session unlock
  const checkPasswordStatus = useCallback(() => {
    if (!user || !profile) {
      setState(prev => ({ ...prev, isLoading: true }))
      return
    }

    const isProtected = profile.journal_password_enabled === true
    
    if (isProtected) {
      // Check if session is already unlocked
      const sessionUnlocked = sessionStorage.getItem('journal:unlocked') === 'true'
      setState({
        isProtected: true,
        isUnlocked: sessionUnlocked,
        isLoading: false,
        error: null
      })
    } else {
      // No password protection
      setState({
        isProtected: false,
        isUnlocked: true,
        isLoading: false,
        error: null
      })
    }
  }, [user, profile])

  // Verify password
  const verifyPassword = useCallback(async (password: string): Promise<boolean> => {
    if (!password.trim()) {
      setState(prev => ({ ...prev, error: 'Password is required' }))
      return false
    }

    setState(prev => ({ ...prev, error: null }))

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
        // Set session unlock flag
        sessionStorage.setItem('journal:unlocked', 'true')
        setState(prev => ({ ...prev, isUnlocked: true, error: null }))
        return true
      } else {
        setState(prev => ({ ...prev, error: data.error || 'Invalid password' }))
        return false
      }
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to verify password' }))
      return false
    }
  }, [])

  // Setup password (enable protection)
  const setupPassword = useCallback(async (password: string): Promise<boolean> => {
    if (!password.trim() || password.length < 8) {
      setState(prev => ({ ...prev, error: 'Password must be at least 8 characters long' }))
      return false
    }

    setState(prev => ({ ...prev, error: null }))

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
        // Set session unlock flag since password was just set
        sessionStorage.setItem('journal:unlocked', 'true')
        setState(prev => ({ 
          ...prev, 
          isProtected: true, 
          isUnlocked: true, 
          error: null 
        }))
        return true
      } else {
        setState(prev => ({ ...prev, error: data.error || 'Failed to setup password' }))
        return false
      }
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to setup password' }))
      return false
    }
  }, [])

  // Change password
  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!currentPassword.trim() || !newPassword.trim()) {
      setState(prev => ({ ...prev, error: 'Both passwords are required' }))
      return false
    }

    if (newPassword.length < 8) {
      setState(prev => ({ ...prev, error: 'New password must be at least 8 characters long' }))
      return false
    }

    setState(prev => ({ ...prev, error: null }))

    try {
      const response = await fetch('/api/journal/password/change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setState(prev => ({ ...prev, error: null }))
        return true
      } else {
        setState(prev => ({ ...prev, error: data.error || 'Failed to change password' }))
        return false
      }
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to change password' }))
      return false
    }
  }, [])

  // Disable password protection
  const disablePassword = useCallback(async (password: string): Promise<boolean> => {
    if (!password.trim()) {
      setState(prev => ({ ...prev, error: 'Password is required' }))
      return false
    }

    setState(prev => ({ ...prev, error: null }))

    try {
      const response = await fetch('/api/journal/password/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: false, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Clear session unlock since protection is disabled
        sessionStorage.removeItem('journal:unlocked')
        setState(prev => ({ 
          ...prev, 
          isProtected: false, 
          isUnlocked: true, 
          error: null 
        }))
        return true
      } else {
        setState(prev => ({ ...prev, error: data.error || 'Failed to disable password protection' }))
        return false
      }
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to disable password protection' }))
      return false
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Lock journal (clear session unlock)
  const lockJournal = useCallback(() => {
    sessionStorage.removeItem('journal:unlocked')
    setState(prev => ({ ...prev, isUnlocked: false }))
  }, [])

  // Check status on mount and when user/profile changes
  useEffect(() => {
    checkPasswordStatus()
  }, [checkPasswordStatus])

  return {
    // State
    isProtected: state.isProtected,
    isUnlocked: state.isUnlocked,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    verifyPassword,
    setupPassword,
    changePassword,
    disablePassword,
    lockJournal,
    clearError,
    
    // Utilities
    needsPassword: state.isProtected === true && !state.isUnlocked,
    canAccess: state.isProtected === false || (state.isProtected === true && state.isUnlocked),
    refreshStatus: checkPasswordStatus
  }
}