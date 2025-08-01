import { useState, useEffect, useCallback, useRef } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { authHelpers, type AuthState, type UserProfile } from '@/integrations/supabase/auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    error: null,
  });
  const [isClient, setIsClient] = useState(false);
  const initializingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    setIsClient(true);
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const setError = useCallback((error: string | null) => {
    setAuthState(prev => ({ ...prev, error, loading: false }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setAuthState(prev => ({ ...prev, loading }));
  }, []);

  const updateAuthState = useCallback(async (user: User | null, session: Session | null) => {
    if (!mountedRef.current) return;
    
    setLoading(true);
    
    try {
      let profile: UserProfile | null = null;
      
      if (user) {
        // For returning users, we can load profile asynchronously to speed up initial render
        const wasAuthenticated = localStorage.getItem('was-authenticated') === 'true';
        
        if (wasAuthenticated) {
          // For returning users, set auth state immediately and load profile in background
          setAuthState({
            user,
            session,
            profile: null, // Will be loaded asynchronously
            loading: false,
            error: null,
          });
          
          // Load profile in background
          try {
            profile = await authHelpers.getUserProfile(user.id);
            if (mountedRef.current) {
              setAuthState(prev => ({ ...prev, profile }));
            }
          } catch (profileError) {
            console.warn('Profile fetch failed, using basic profile from user metadata:', profileError);
            profile = {
              id: user.id,
              email: user.email!,
              full_name: user.user_metadata?.full_name || null,
              avatar_url: user.user_metadata?.avatar_url || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            if (mountedRef.current) {
              setAuthState(prev => ({ ...prev, profile }));
            }
          }
        } else {
          // For new users, load profile synchronously
          try {
            profile = await authHelpers.getUserProfile(user.id);
          } catch (profileError) {
            console.warn('Profile fetch failed, using basic profile from user metadata:', profileError);
            profile = {
              id: user.id,
              email: user.email!,
              full_name: user.user_metadata?.full_name || null,
              avatar_url: user.user_metadata?.avatar_url || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
          }
          
          if (mountedRef.current) {
            setAuthState({
              user,
              session,
              profile,
              loading: false,
              error: null,
            });
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
          });
        }
      }
    } catch (error) {
      console.error('Auth state update error:', error);
      if (mountedRef.current) {
        setError(error instanceof Error ? error.message : 'Authentication error');
      }
    }
  }, [setLoading, setError]);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await authHelpers.signInWithGoogle();
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign in with Google');
    }
  }, [setLoading, setError]);

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🚪 Signing out user...');
      await authHelpers.signOut();
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign out');
    }
  }, [setLoading, setError]);

  const refreshProfile = useCallback(async () => {
    if (!authState.user) return;
    
    try {
      const profile = await authHelpers.getUserProfile(authState.user.id);
      setAuthState(prev => ({ ...prev, profile }));
    } catch (error) {
      console.error('Profile refresh error:', error);
    }
  }, [authState.user]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!authState.user) return;
    
    try {
      const updatedProfile = await authHelpers.updateUserProfile(authState.user.id, updates);
      if (updatedProfile) {
        setAuthState(prev => ({ ...prev, profile: updatedProfile }));
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    }
  }, [authState.user, setError]);

  useEffect(() => {
    if (!isClient || initializingRef.current) return;
    
    initializingRef.current = true;
    let mounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing authentication...');
        
        // Check if user was previously authenticated
        const wasAuthenticated = localStorage.getItem('was-authenticated') === 'true';
        console.log('👤 Was previously authenticated:', wasAuthenticated);
        
        // Only set timeout for new users, not returning users
        if (!wasAuthenticated) {
          timeoutId = setTimeout(() => {
            console.warn('⏰ Auth initialization timeout for new user - setting as unauthenticated');
            if (mounted && mountedRef.current) {
              setAuthState({
                user: null,
                session: null,
                profile: null,
                loading: false,
                error: null,
              });
            }
          }, 5000); // Reduced timeout to 5 seconds for new users
        }
        
        // Fetch session - no timeout for returning users
        let session = null;
        try {
          session = await authHelpers.getCurrentSession();
        } catch (error) {
          console.warn('Session fetch failed:', error);
          session = null;
        }
        
        // Clear timeout if we got here in time
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        
        console.log('📋 Current session:', session ? 'Found' : 'None', session?.user?.email);
        
        if (mounted && mountedRef.current) {
          if (session?.user) {
            console.log('✅ Found valid session, updating auth state');
            // Mark user as authenticated for future page loads
            localStorage.setItem('was-authenticated', 'true');
            await updateAuthState(session.user, session);
          } else {
            console.log('❌ No valid session found, user not authenticated');
            // Clear authentication marker
            localStorage.removeItem('was-authenticated');
            setAuthState({
              user: null,
              session: null,
              profile: null,
              loading: false,
              error: null,
            });
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (mounted && mountedRef.current) {
          localStorage.removeItem('was-authenticated');
          setAuthState({
            user: null,
            session: null,
            profile: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to initialize authentication',
          });
        }
      }
    };

    // Initialize auth state
    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = authHelpers.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email || 'No user');
      
      if (mounted && mountedRef.current) {
        try {
          if (session?.user) {
            localStorage.setItem('was-authenticated', 'true');
          } else {
            localStorage.removeItem('was-authenticated');
          }
          await updateAuthState(session?.user ?? null, session);
        } catch (error) {
          console.error('Auth state change error:', error);
        }
      }
    });

    return () => {
      mounted = false;
      initializingRef.current = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription.unsubscribe();
    };
  }, [updateAuthState, setError, isClient]);

  return {
    ...authState,
    signInWithGoogle,
    signOut,
    refreshProfile,
    updateProfile,
    isAuthenticated: !!authState.user,
    isLoading: authState.loading,
  };
};

export default useAuth;