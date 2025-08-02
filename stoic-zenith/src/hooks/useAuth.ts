import { useState, useEffect, useCallback, useRef } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import {
  authHelpers,
  type AuthState,
  type UserProfile,
} from '@/integrations/supabase/auth'

export const useAuth = (): AuthState & {
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  isAuthenticated: boolean
  isLoading: boolean
} => {
  // Initialize with better default loading state
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Always start with loading true to prevent flashing
    if (typeof window !== 'undefined') {
      const wasAuthenticated = localStorage.getItem('was-authenticated') === 'true'
      return {
        user: null,
        session: null,
        profile: null,
        loading: true, // Always start loading to prevent login screen flash
        error: null,
      }
    }
    return {
      user: null,
      session: null,
      profile: null,
      loading: true,
      error: null,
    }
  })
  const [isClient, setIsClient] = useState(false)
  const initializingRef = useRef(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    setIsClient(true)
    mountedRef.current = true
    return (): void => {
      mountedRef.current = false
    }
  }, [])

  const setError = useCallback((error: string | null) => {
    setAuthState(prev => ({ ...prev, error, loading: false }))
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    setAuthState(prev => ({ ...prev, loading }))
  }, [])

  const getCachedProfile = useCallback((userId: string): UserProfile | null => {
    try {
      const cachedData = localStorage.getItem(`profile-${userId}`)
      if (!cachedData) return null

      const { profile, timestamp } = JSON.parse(cachedData)
      const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000 // 24 hours

      if (isExpired) {
        localStorage.removeItem(`profile-${userId}`)
        return null
      }

      return profile
    } catch {
      return null
    }
  }, [])

  const setCachedProfile = useCallback(
    (userId: string, profile: UserProfile) => {
      try {
        localStorage.setItem(
          `profile-${userId}`,
          JSON.stringify({
            profile,
            timestamp: Date.now(),
          })
        )
      } catch (error) {
        console.warn('Failed to cache profile:', error)
      }
    },
    []
  )

  const updateAuthState = useCallback(
    async (user: User | null, session: Session | null) => {
      if (!mountedRef.current) return

      setLoading(true)

      try {
        let profile: UserProfile | null = null

        if (user) {
          // Try to get cached profile first
          const cachedProfile = getCachedProfile(user.id)
          const _wasAuthenticated =
            localStorage.getItem('was-authenticated') === 'true'

          if (_wasAuthenticated && cachedProfile) {
            // For returning users with cached profile, set immediately
            setAuthState({
              user,
              session,
              profile: cachedProfile,
              loading: false,
              error: null,
            })

            // Update profile in background
            try {
              profile = await authHelpers.getUserProfile(user.id)
              if (profile && mountedRef.current) {
                setCachedProfile(user.id, profile)
                setAuthState(prev => ({ ...prev, profile }))
              }
            } catch (profileError) {
              console.warn('Background profile fetch failed:', profileError)
            }
          } else {
            // For new users or no cache, load profile synchronously
            try {
              profile = await authHelpers.getUserProfile(user.id)
              if (profile) {
                setCachedProfile(user.id, profile)
              }
            } catch (profileError) {
              console.warn(
                'Profile fetch failed, using basic profile from user metadata:',
                profileError
              )
              profile = {
                id: user.id,
                email: user.email ?? '',
                full_name: user.user_metadata?.full_name || null,
                avatar_url: user.user_metadata?.avatar_url || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
              if (profile) {
                setCachedProfile(user.id, profile)
              }
            }

            if (mountedRef.current) {
              setAuthState({
                user,
                session,
                profile,
                loading: false,
                error: null,
              })
            }
          }
        } else {
          if (mountedRef.current) {
            setAuthState({
              user: null,
              session: null,
              profile: null,
              loading: false,
              error: null,
            })
          }
        }
      } catch (error) {
        console.error('Auth state update error:', error)
        if (mountedRef.current) {
          setError(
            error instanceof Error ? error.message : 'Authentication error'
          )
        }
      }
    },
    [setLoading, setError, getCachedProfile, setCachedProfile]
  )

  const signInWithGoogle = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      await authHelpers.signInWithGoogle()
    } catch (error) {
      console.error('Google sign-in error:', error)
      setError(
        error instanceof Error ? error.message : 'Failed to sign in with Google'
      )
    }
  }, [setLoading, setError])

  const signOut = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('🚪 Signing out user...')

      // Clear all cached data
      const userId = authState.user?.id
      if (userId) {
        localStorage.removeItem(`profile-${userId}`)
        localStorage.removeItem(`calendar-${userId}`)
      }
      localStorage.removeItem('was-authenticated')

      await authHelpers.signOut()
      console.log('✅ Sign out successful')

      // Clear auth state
      setAuthState({
        user: null,
        session: null,
        profile: null,
        loading: false,
        error: null,
      })
    } catch (error) {
      console.error('❌ Sign out error:', error)
      setError(error instanceof Error ? error.message : 'Failed to sign out')
    }
  }, [setLoading, setError, authState.user?.id])

  const refreshProfile = useCallback(async () => {
    if (!authState.user) return

    try {
      const profile = await authHelpers.getUserProfile(authState.user.id)
      setAuthState(prev => ({ ...prev, profile }))
    } catch (error) {
      console.error('Profile refresh error:', error)
    }
  }, [authState.user])

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!authState.user) return

      try {
        const updatedProfile = await authHelpers.updateUserProfile(
          authState.user.id,
          updates
        )
        if (updatedProfile) {
          setCachedProfile(authState.user.id, updatedProfile)
          setAuthState(prev => ({ ...prev, profile: updatedProfile }))
        }
      } catch (error) {
        console.error('Profile update error:', error)
        setError(
          error instanceof Error ? error.message : 'Failed to update profile'
        )
      }
    },
    [authState.user, setError, setCachedProfile]
  )

  useEffect(() => {
    if (!isClient || initializingRef.current) return

    initializingRef.current = true
    let mounted = true

    const initializeAuth = async (): Promise<void> => {
      try {
        console.log('🔄 Initializing authentication...')

        // Check if user was previously authenticated
        const wasAuthenticated =
          localStorage.getItem('was-authenticated') === 'true'
        console.log('👤 Was previously authenticated:', wasAuthenticated)

        // Always start with loading true to prevent login screen flash
        setAuthState(prev => ({ ...prev, loading: true }))

        // Add a small delay for returning users to ensure smooth transition
        if (wasAuthenticated) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Fetch session
        let session = null
        try {
          session = await authHelpers.getCurrentSession()
        } catch (error) {
          console.warn('Session fetch failed:', error)
          session = null
        }

        console.log(
          '📋 Current session:',
          session ? 'Found' : 'None',
          session?.user?.email
        )

        if (mounted && mountedRef.current) {
          if (session?.user) {
            console.log('✅ Found valid session, updating auth state')
            // Mark user as authenticated for future page loads
            localStorage.setItem('was-authenticated', 'true')
            await updateAuthState(session.user, session)
          } else {
            console.log('❌ No valid session found, user not authenticated')
            // Clear authentication marker
            localStorage.removeItem('was-authenticated')
            setAuthState({
              user: null,
              session: null,
              profile: null,
              loading: false,
              error: null,
            })
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        if (mounted && mountedRef.current) {
          localStorage.removeItem('was-authenticated')
          setAuthState({
            user: null,
            session: null,
            profile: null,
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to initialize authentication',
          })
        }
      }
    }

    // Initialize auth state
    initializeAuth()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = authHelpers.onAuthStateChange(async (event, session) => {
      console.log(
        '🔄 Auth state changed:',
        event,
        session?.user?.email || 'No user'
      )

      if (mounted && mountedRef.current) {
        try {
          if (session?.user) {
            localStorage.setItem('was-authenticated', 'true')
            await updateAuthState(session.user, session)
          } else {
            // Only clear auth state if it's a sign out event
            if (event === 'SIGNED_OUT') {
              localStorage.removeItem('was-authenticated')
              setAuthState({
                user: null,
                session: null,
                profile: null,
                loading: false,
                error: null,
              })
            }
          }
        } catch (error) {
          console.error('Auth state change error:', error)
        }
      }
    })

    return (): void => {
      mounted = false
      initializingRef.current = false
      subscription.unsubscribe()
    }
  }, [updateAuthState, setError, isClient])

  return {
    ...authState,
    signInWithGoogle,
    signOut,
    refreshProfile,
    updateProfile,
    isAuthenticated: !!authState.user,
    isLoading: authState.loading,
  }
}

export default useAuth
