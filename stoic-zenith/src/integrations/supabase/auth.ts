import { supabase } from './client';
import type { User, Session, Provider } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  subscription_status?: string;
  subscription_plan?: string;
  subscription_expires_at?: string;
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

// Utility function for retrying operations
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Don't retry on certain errors
      if (lastError.message.includes('PGRST116') || // Not found
          lastError.message.includes('invalid') ||
          lastError.message.includes('unauthorized')) {
        throw lastError;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

export const authHelpers = {
  async signInWithGoogle() {
    try {
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
    return retryOperation(async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Get user error:', error);
        throw error;
      }
      return user;
    });
  },

  async getCurrentSession() {
    const timeoutDuration = 10000 // 10 second timeout
    
    try {
      // For returning users, we can be more optimistic
      const wasAuthenticated = typeof window !== 'undefined' && localStorage.getItem('was-authenticated') === 'true';
      
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Session fetch timeout - taking too long to verify authentication'))
        }, timeoutDuration)
      })

      // Race between session fetch and timeout
      const sessionPromise = supabase.auth.getSession().then(async ({ data: { session }, error }) => {
        if (error) {
          console.error('❌ Get session error:', error);
          console.error('Session error details:', {
            message: error.message,
            status: error.status,
            code: error.code || 'unknown'
          });
          throw error;
        }

        // If no session but user was previously authenticated, try to refresh
        if (!session && wasAuthenticated) {
          console.log('🔄 No session found but user was authenticated, attempting refresh...');
          try {
            const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
            
            if (refreshError) {
              console.warn('❌ Session refresh failed:', refreshError);
              // Clear authentication marker on refresh failure
              if (typeof window !== 'undefined') {
                localStorage.removeItem('was-authenticated');
              }
              return null;
            }

            if (refreshedSession) {
              console.log('✅ Session refreshed successfully');
              return refreshedSession;
            }
          } catch (refreshErr) {
            console.warn('❌ Session refresh error:', refreshErr);
            // Clear authentication marker on refresh error
            if (typeof window !== 'undefined') {
              localStorage.removeItem('was-authenticated');
            }
            return null;
          }
        }

        if (session) {
          // Session found
        } else {
          // Clear authentication marker if no session found
          if (typeof window !== 'undefined') {
            localStorage.removeItem('was-authenticated');
          }
        }
        
        return session;
      })

      return await Promise.race([sessionPromise, timeoutPromise]);
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
    return retryOperation(async () => {
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
    });
  },

  async createUserProfile(userId: string): Promise<UserProfile | null> {
    return retryOperation(async () => {
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
    });
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    return retryOperation(async () => {
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
    });
  },

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

export default authHelpers;