import { useState, useEffect, useCallback } from 'react';
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

  const setError = useCallback((error: string | null) => {
    setAuthState(prev => ({ ...prev, error, loading: false }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setAuthState(prev => ({ ...prev, loading }));
  }, []);

  const updateAuthState = useCallback(async (user: User | null, session: Session | null) => {
    setLoading(true);
    
    try {
      let profile: UserProfile | null = null;
      
      if (user) {
        profile = await authHelpers.getUserProfile(user.id);
      }

      setAuthState({
        user,
        session,
        profile,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Auth state update error:', error);
      setError(error instanceof Error ? error.message : 'Authentication error');
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
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const session = await authHelpers.getCurrentSession();
        if (mounted) {
          await updateAuthState(session?.user ?? null, session);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setError(error instanceof Error ? error.message : 'Failed to initialize authentication');
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = authHelpers.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (mounted) {
        await updateAuthState(session?.user ?? null, session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [updateAuthState, setError]);

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