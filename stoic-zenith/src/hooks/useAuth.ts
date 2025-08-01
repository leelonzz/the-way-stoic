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
        // Only fetch profile if we don't have database connectivity issues
        try {
          profile = await authHelpers.getUserProfile(user.id);
        } catch (profileError) {
          console.warn('Profile fetch failed, using basic profile from user metadata:', profileError);
          // Create a basic profile from user metadata as fallback
          profile = {
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
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
      // Clear localStorage session cache on signout
      localStorage.removeItem('supabase-session');
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

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing authentication...');
        
        // Set a timeout to prevent endless loading
        const authTimeout = setTimeout(() => {
          if (mounted && mountedRef.current) {
            console.warn('⏰ Auth initialization timeout, setting loading to false');
            setAuthState(prev => ({ ...prev, loading: false }));
          }
        }, 5000); // 5 second timeout
        
        // Check localStorage for session persistence first
        const persistedSession = localStorage.getItem('supabase-session');
        if (persistedSession) {
          console.log('📦 Found persisted session in localStorage');
        }
        
        // Get session with single attempt and timeout
        let session = null;
        try {
          const sessionPromise = authHelpers.getCurrentSession();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session fetch timeout')), 3000)
          );
          
          session = await Promise.race([sessionPromise, timeoutPromise]);
        } catch (error) {
          console.warn('Session fetch failed:', error);
          session = null;
        }
        
        console.log('📋 Current session:', session ? 'Found' : 'None', session?.user?.email);
        
        if (mounted && mountedRef.current) {
          clearTimeout(authTimeout);
          
          // If we have a session, update auth state immediately
          if (session?.user) {
            console.log('✅ Found valid session, updating auth state');
            // Cache session in localStorage for faster future loads
            localStorage.setItem('supabase-session', JSON.stringify({
              user: session.user,
              timestamp: Date.now()
            }));
            await updateAuthState(session.user, session);
          } else {
            console.log('❌ No valid session found, user not authenticated');
            // Clear any stale session data
            localStorage.removeItem('supabase-session');
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
        if (mounted && mountedRef.current) {
          // Clear any stale session data on error
          localStorage.removeItem('supabase-session');
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
          await updateAuthState(session?.user ?? null, session);
        } catch (error) {
          console.error('Auth state change error:', error);
        }
      }
    });

    return () => {
      mounted = false;
      initializingRef.current = false;
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