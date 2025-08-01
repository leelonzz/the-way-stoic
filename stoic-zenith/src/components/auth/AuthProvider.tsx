'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { User, Session } from '@supabase/supabase-js';
import type { UserProfile } from '@/integrations/supabase/auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isClient, setIsClient] = useState(false);
  const auth = useAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hero via-parchment to-accent/10 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-cta rounded-2xl flex items-center justify-center shadow-xl animate-pulse mx-auto">
            <div className="w-8 h-8 bg-white rounded-lg"></div>
          </div>
          <div className="space-y-3">
            <div className="h-8 w-48 bg-white/20 rounded mx-auto"></div>
            <div className="h-4 w-32 bg-white/20 rounded mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export default AuthProvider;