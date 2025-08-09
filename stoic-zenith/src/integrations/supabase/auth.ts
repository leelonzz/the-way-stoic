import { supabase } from './client';
import type { User, Session, Provider } from '@supabase/supabase-js'
import { getTimeoutConfig, isProduction } from '@/lib/config';

// Debug flag - set to false for production
const DEBUG_AUTH = false;

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

      // Retry on timeout and network errors
      const shouldRetry = lastError.message.includes('timeout') ||
                         lastError.message.includes('fetch') ||
                         lastError.message.includes('network') ||
                         lastError.message.includes('AbortError') ||
                         lastError.name === 'AbortError';

      if (!shouldRetry) {
        throw lastError;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Session recovery function for handling authentication timeouts
async function recoverSession(): Promise<Session | null> {
  try {
    // First try to get the session from storage
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      if (DEBUG_AUTH) console.warn('⚠️ Session recovery failed:', error);
      return null;
    }

    if (session) {
      if (DEBUG_AUTH) console.log('✅ Session recovered from storage');
      return session;
    }

    // If no session in storage, try to refresh
    const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();

    if (refreshError) {
      if (DEBUG_AUTH) console.warn('⚠️ Session refresh failed:', refreshError);
      return null;
    }

    if (DEBUG_AUTH) console.log('✅ Session refreshed successfully');
    return refreshedSession;
  } catch (error) {
    if (DEBUG_AUTH) console.error('❌ Session recovery error:', error);
    return null;
  }
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
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          // Try session recovery on timeout/network errors
          if (error.message.includes('timeout') || error.message.includes('fetch')) {
            const session = await recoverSession();
            if (session?.user) {
              if (DEBUG_AUTH) console.log('✅ User recovered via session recovery');
              return session.user;
            }
          }
          console.error('Get user error:', error);
          throw error;
        }
        return user;
      } catch (error) {
        // Last resort: try session recovery
        const session = await recoverSession();
        if (session?.user) {
          if (DEBUG_AUTH) console.log('✅ User recovered via fallback session recovery');
          return session.user;
        }
        throw error;
      }
    });
  },

  async getCurrentSession() {
    // Production-aware timeout configuration
    const timeoutConfig = getTimeoutConfig();
    const timeoutDuration = timeoutConfig.sessionTimeout;
    
    try {
      // For returning users, we can be more optimistic
      const wasAuthenticated = typeof window !== 'undefined' && localStorage.getItem('was-authenticated') === 'true';
      
      // Create timeout promise - but handle differently in production
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          const errorMsg = `Session fetch timeout - taking too long to verify authentication (${timeoutDuration}ms)`;

          // In production, be more lenient with timeouts
          if (isProduction() && wasAuthenticated) {
            console.warn('🔄 Production session timeout - will attempt recovery');
            // Don't reject immediately, let the session promise continue
            setTimeout(() => reject(new Error(errorMsg)), 5000); // Give extra 5s in production
          } else {
            reject(new Error(errorMsg));
          }
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

          // Distinguish between auth errors and network errors
          const isAuthError = error.message?.includes('unauthorized') ||
                             error.message?.includes('invalid') ||
                             error.status === 401 ||
                             error.status === 403;

          const isNetworkError = error.message?.includes('timeout') ||
                                error.message?.includes('fetch') ||
                                error.message?.includes('network');

          // Only clear auth state on actual auth errors, not network issues
          if (isAuthError) {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('was-authenticated');
            }
          } else if (isNetworkError && isProduction()) {
            console.log('🌐 Network error in production, attempting recovery...');
            // Try session recovery for network errors in production
            try {
              const recoveredSession = await recoverSession();
              if (recoveredSession) {
                if (DEBUG_AUTH) console.log('✅ Session recovered from network error');
                return recoveredSession;
              }
            } catch (recoveryError) {
              console.warn('❌ Session recovery failed:', recoveryError);
            }
          }

          throw error;
        }

        // If no session but user was previously authenticated, try to refresh
        if (!session && wasAuthenticated) {
          if (DEBUG_AUTH) console.log('🔄 No session found but user was authenticated, attempting refresh...');
          try {
            const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
            
            if (refreshError) {
              console.warn('❌ Session refresh failed:', refreshError);

              // Only clear auth marker on actual auth errors, not network issues
              const isAuthError = refreshError.message?.includes('unauthorized') ||
                                 refreshError.message?.includes('invalid') ||
                                 refreshError.status === 401 ||
                                 refreshError.status === 403;

              if (isAuthError && typeof window !== 'undefined') {
                localStorage.removeItem('was-authenticated');
              }
              return null;
            }

            if (refreshedSession) {
              if (DEBUG_AUTH) console.log('✅ Session refreshed successfully');
              return refreshedSession;
            }
          } catch (refreshErr) {
            console.warn('❌ Session refresh error:', refreshErr);

            // Only clear auth marker on actual auth errors
            const isAuthError = refreshErr?.message?.includes('unauthorized') ||
                               refreshErr?.message?.includes('invalid');

            if (isAuthError && typeof window !== 'undefined') {
              localStorage.removeItem('was-authenticated');
            }
            return null;
          }
        }

        if (session) {
          // Session found
        } else {
          // Only clear authentication marker if we're sure there's no session
          // Don't clear on network errors in production
          if (typeof window !== 'undefined' && !isProduction()) {
            localStorage.removeItem('was-authenticated');
          }
        }
        
        return session;
      })

      return await Promise.race([sessionPromise, timeoutPromise]);
    } catch (error) {
      console.error('❌ Unexpected error getting session:', error);

      // Distinguish between different error types
      const isTimeoutError = error?.message?.includes('timeout');
      const isNetworkError = error?.message?.includes('fetch') ||
                           error?.message?.includes('network') ||
                           error?.name === 'AbortError';

      // Only clear authentication marker on actual auth errors, not timeouts/network issues in production
      if (typeof window !== 'undefined') {
        const shouldClearAuth = !isProduction() || (!isTimeoutError && !isNetworkError);

        if (shouldClearAuth) {
          localStorage.removeItem('was-authenticated');
        } else {
          console.log('🔄 Keeping auth state due to network/timeout error in production');
        }
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