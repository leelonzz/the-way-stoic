'use client'

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { User, Session } from '@supabase/supabase-js'
import type { UserProfile } from '@/integrations/supabase/auth'
import { MinimalLoadingScreen } from '@/components/ui/loading-spinner'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  isLoading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({
  children,
}: AuthProviderProps): React.ReactElement {
  const [isClient, setIsClient] = useState(false)
  const auth = useAuth()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Show minimal loading during hydration
  if (!isClient) {
    return <MinimalLoadingScreen />
  }

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

export default AuthProvider
