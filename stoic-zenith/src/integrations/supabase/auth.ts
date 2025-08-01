import { supabase } from './client';
import type { User, Session, Provider } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export const authHelpers = {
  async signInWithGoogle() {
    try {
      console.log('🔐 Starting Google OAuth sign-in...');
      console.log('Redirect URL:', `${window.location.origin}/auth/callback`);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google' as Provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) {
        console.error('❌ Google sign-in error:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          details: error
        });
        throw error;
      }
      
      console.log('✅ Google OAuth initiated successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Unexpected error during Google sign-in:', error);
      throw error;
    }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Get user error:', error);
      throw error;
    }
    return user;
  },

  async getCurrentSession() {
    try {
      console.log('🔍 Fetching current session...');
      
      // For returning users, we can be more optimistic
      const wasAuthenticated = typeof window !== 'undefined' && localStorage.getItem('was-authenticated') === 'true';
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Get session error:', error);
        console.error('Session error details:', {
          message: error.message,
          status: error.status,
          code: error.code || 'unknown'
        });
        throw error;
      }
      
      if (session) {
        console.log('✅ Session retrieved successfully:', {
          userId: session.user?.id,
          email: session.user?.email,
          expiresAt: new Date(session.expires_at * 1000).toLocaleString(),
          hasRefreshToken: !!session.refresh_token
        });
      } else {
        console.log('ℹ️ No active session found');
        // Clear authentication marker if no session found
        if (typeof window !== 'undefined') {
          localStorage.removeItem('was-authenticated');
        }
      }
      
      return session;
    } catch (error) {
      console.error('❌ Unexpected error getting session:', error);
      // Clear authentication marker on error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('was-authenticated');
      }
      throw error;
    }
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          return await this.createUserProfile(userId);
        }
        console.warn('Profile fetch error, using fallback:', error);
        // Return a fallback profile instead of throwing
        const user = await this.getCurrentUser();
        if (user) {
          return {
            id: userId,
            email: user.email!,
            full_name: user.user_metadata?.full_name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
        return null;
      }

      return data;
    } catch (error) {
      console.error('Get user profile error:', error);
      // Return a basic profile as fallback
      try {
        const user = await this.getCurrentUser();
        if (user) {
          return {
            id: userId,
            email: user.email!,
            full_name: user.user_metadata?.full_name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
      } catch (fallbackError) {
        console.error('Fallback profile creation failed:', fallbackError);
      }
      return null;
    }
  },

  async createUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return null;

      const profileData = {
        id: userId,
        email: user.email!,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('Create user profile error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Create user profile error:', error);
      return null;
    }
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Update user profile error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Update user profile error:', error);
      return null;
    }
  },

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

export default authHelpers;