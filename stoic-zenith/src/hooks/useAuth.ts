import { useState, useEffect, useCallback, useRef } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import {
  authHelpers,
  type AuthState,
  type UserProfile,
} from '@/integrations/supabase/auth'
import { supabase } from '@/integrations/supabase/client'
import { getTimeouts, exponentialBackoff } from '@/lib/environment'

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
      const _wasAuthenticated = localStorage.getItem('was-authenticated') === 'true'
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

  const clearCachedProfile = useCallback((userId: string) => {
    try {
      localStorage.removeItem(`profile-${userId}`)
    } catch {
      // Ignore localStorage errors
    }
  }, [])

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

          if (cachedProfile) {
            // Use cached profile immediately for fast loading
            setAuthState({
              user,
              session,
              profile: cachedProfile,
              loading: false,
              error: null,
            })

            // Update profile in background (non-blocking)
            authHelpers.getUserProfile(user.id)
              .then(freshProfile => {
                if (freshProfile && mountedRef.current) {
                  setCachedProfile(user.id, freshProfile)
                  setAuthState(prev => ({ ...prev, profile: freshProfile }))
                }
              })
              .catch(err => console.warn('Background profile update failed:', err))
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

      // Clear all cached data immediately
      const userId = authState.user?.id
      if (userId) {
        localStorage.removeItem(`profile-${userId}`)
        localStorage.removeItem(`calendar-${userId}`)
      }
      // Clear authentication marker immediately
      localStorage.removeItem('was-authenticated')
      // Dispatch custom event for same-tab listeners
      window.dispatchEvent(new Event('localStorageChanged'))

      // Clear auth state immediately to prevent loading state
      setAuthState({
        user: null,
        session: null,
        profile: null,
        loading: false,
        error: null,
      })

      // Then sign out from Supabase
      await authHelpers.signOut()
    } catch (error) {
      console.error('❌ Sign out error:', error)
      setError(error instanceof Error ? error.message : 'Failed to sign out')
      // Even if sign out fails, clear the auth state
      setAuthState({
        user: null,
        session: null,
        profile: null,
        loading: false,
        error: null,
      })
    }
  }, [setLoading, setError, authState.user?.id])

  // Listen for localStorage changes (cross-tab and same-tab)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent | CustomEvent): void => {
      if (
        (event && 'key' in event && event.key === 'was-authenticated') ||
        event.type === 'localStorageChanged'
      ) {
        // Force re-check of auth state
        setAuthState({
          user: null,
          session: null,
          profile: null,
          loading: false,
          error: null,
        })
      }
    }
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('localStorageChanged', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('localStorageChanged', handleStorageChange)
    }
  }, [])

  const refreshProfile = useCallback(async (): Promise<void> => {
    if (!authState.user) return

    try {
      // Clear cached profile data first
      clearCachedProfile(authState.user.id)

      const profile = await authHelpers.getUserProfile(authState.user.id)
      if (profile) {
        setCachedProfile(authState.user.id, profile)
      }
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
    [authState.user, setError, setCachedProfile, clearCachedProfile]
  )

  useEffect(() => {
    if (!isClient || initializingRef.current) return

    initializingRef.current = true
    let mounted = true

    const initializeAuth = async (): Promise<void> => {
      const timeouts = getTimeouts()
      let timeoutId: NodeJS.Timeout | null = null

      try {
        // Check if user was previously authenticated
        const wasAuthenticated =
          localStorage.getItem('was-authenticated') === 'true'

        // Always start with loading true to prevent login screen flash
        setAuthState(prev => ({ ...prev, loading: true }))

        // Use getUser() for more reliable auth verification in production
        const userPromise = exponentialBackoff(
          () => supabase.auth.getUser(),
          {
            maxRetries: 1, // Just one retry for fast initial load
            shouldRetry: (error) => {
              // Don't retry on auth errors
              if (error?.message?.includes('401') || 
                  error?.message?.includes('403') ||
                  error?.message?.includes('Invalid')) {
                return false
              }
              return true
            }
          }
        )

        // Quick auth check with aggressive timeout - use getUser() for reliability
        const authPromise = Promise.race([
          userPromise,
          new Promise<{ data: { user: null }, error: null }>(resolve => setTimeout(() => {
            console.warn('⏱️ Auth timeout - using cached state')
            resolve({ data: { user: null }, error: null })
          }, timeouts.authInit))
        ]).then(async result => {
          if (mounted && mountedRef.current) {
            const user = result?.data?.user
            
            if (user) {
              // User is authenticated - get session
              localStorage.setItem('was-authenticated', 'true')
              
              const { data: { session } } = await supabase.auth.getSession()
              
              // Fast path - use cached profile if available
              const cachedProfile = getCachedProfile(user.id)
              setAuthState({
                user,
                session,
                profile: cachedProfile,
                loading: false,
                error: null,
              })
              
              // Update profile in background if no cache
              if (!cachedProfile) {
                updateAuthState(user, session).catch(console.warn)
              }
            } else if (result && !wasAuthenticated) {
              // Clear auth if definitive "no user" response and user wasn't previously authenticated
              localStorage.removeItem('was-authenticated')
              setAuthState({
                user: null,
                session: null,
                profile: null,
                loading: false,
                error: null,
              })
            } else {
              // Timeout or preserve existing state
              setAuthState(prev => ({ ...prev, loading: false }))
            }
          }
        }).catch(error => {
          console.warn('⚠️ Auth check failed:', error)
          
          if (mounted && mountedRef.current) {
            const isAuthError = error?.message?.includes('401') || 
                                error?.message?.includes('403') ||
                                error?.message?.includes('Invalid token')
            
            if (isAuthError) {
              localStorage.removeItem('was-authenticated')
              setAuthState({
                user: null,
                session: null,
                profile: null,
                loading: false,
                error: null,
              })
            } else {
              // Network/timeout error - just stop loading
              setAuthState(prev => ({ ...prev, loading: false }))
            }
          }
        })

        await authPromise
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        
        // Clean up timeout
        if (timeoutId) {
          clearTimeout(timeoutId)
        }

        if (mounted && mountedRef.current) {
          // Don't clear was-authenticated for transient errors
          setAuthState({
            user: null,
            session: null,
            profile: null,
            loading: false,
            error: null,
          })
        }
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      }
    }

    // Initialize auth state
    initializeAuth()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = authHelpers.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state change:', event, session?.user?.email || 'no user')

      if (mounted && mountedRef.current) {
        try {
          if (session?.user) {
            console.log('✅ User session found, updating auth state')
            localStorage.setItem('was-authenticated', 'true')
            await updateAuthState(session.user, session)
          } else {
            console.log('❌ No user session, event:', event)
            // Only clear auth state on explicit sign-out or user removal
            if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
              console.log('🚪 Explicit logout event, clearing auth')
              localStorage.removeItem('was-authenticated')
              setAuthState({
                user: null,
                session: null,
                profile: null,
                loading: false,
                error: null,
              })
            } else if (event === 'TOKEN_REFRESHED') {
              // Token refresh without user means auth is invalid
              console.warn('🔐 Token refresh failed, clearing auth')
              localStorage.removeItem('was-authenticated')
              setAuthState({
                user: null,
                session: null,
                profile: null,
                loading: false,
                error: null,
              })
            } else {
              console.log('⚠️ Session lost but not explicit logout, keeping loading state')
            }
          }
        } catch (error) {
          console.error('Auth state change error:', error)
          // Only clear auth on actual auth errors, not network issues
          const isAuthError = error?.message?.includes('401') || 
                              error?.message?.includes('403') ||
                              error?.message?.includes('Invalid')
          
          if (isAuthError) {
            localStorage.removeItem('was-authenticated')
          }
          
          setAuthState({
            user: null,
            session: null,
            profile: null,
            loading: false,
            error: null,
          })
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
