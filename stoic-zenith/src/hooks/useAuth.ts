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
      await authHelpers.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
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
        
        // Get session directly without timeout to ensure we don't miss it
        const session = await authHelpers.getCurrentSession();
        
        console.log('📋 Current session:', session ? 'Found' : 'None', session?.user?.email);
        console.log('📋 Session details:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          accessToken: session?.access_token ? 'Present' : 'Missing',
          expiresAt: session?.expires_at,
          refreshToken: session?.refresh_token ? 'Present' : 'Missing'
        });
        
        if (mounted && mountedRef.current) {
          // If we have a session, update auth state immediately
          if (session?.user) {
            console.log('✅ Found valid session, updating auth state');
            await updateAuthState(session.user, session);
          } else {
            console.log('❌ No valid session found, user not authenticated');
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