'use client';

import React, { ReactNode } from 'react';
import { useAuthContext } from './AuthProvider';
import LoginScreen from './LoginScreen';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps): ReactNode {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return fallback || <LoginScreen />;
  }

  return <>{children}</>;
}

function LoadingFallback(): ReactNode {
  const [hasTimedOut, setHasTimedOut] = React.useState(false);
  
  // Check if user was previously authenticated for different timeout behavior
  const wasAuthenticated = React.useMemo((): boolean => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('was-authenticated') === 'true';
    }
    return false;
  }, []);

  React.useEffect((): (() => void) | undefined => {
    // Only set timeout for new users, not returning users
    if (!wasAuthenticated) {
      const timeoutId = setTimeout((): void => {
        console.warn('⏰ Loading screen timeout (new user) - showing fallback');
        setHasTimedOut(true);
      }, 5000); // Reduced timeout to 5 seconds for new users

      return (): void => clearTimeout(timeoutId);
    }
    // No timeout for returning users - they should load quickly
    return undefined;
  }, [wasAuthenticated]);

  // For returning users, show a much shorter loading experience
  if (wasAuthenticated && !hasTimedOut) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hero via-parchment to-accent/10 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Loader2 className="w-12 h-12 text-stone animate-spin" />
          </div>
          <p className="text-stone text-sm">
            Restoring your session...
          </p>
        </div>
      </div>
    );
  }

  // For new users or timeout cases
  if (hasTimedOut) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hero via-parchment to-accent/10 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center shadow-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-xl font-serif font-semibold text-ink">
              {wasAuthenticated ? 'Connection taking longer than expected' : 'Loading took too long'}
            </h2>
            <p className="text-stone text-sm">
              {wasAuthenticated 
                ? 'Your session is being restored. Please refresh to continue.'
                : 'Please refresh the page or try logging in again'
              }
            </p>
          </div>
          
          <button 
            onClick={(): void => window.location.reload()}
            className="px-6 py-2 bg-cta text-white rounded-lg hover:bg-cta/80 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Default loading for new users
  return (
    <div className="min-h-screen bg-gradient-to-br from-hero via-parchment to-accent/10 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <Loader2 className="w-16 h-16 text-stone animate-spin" />
        </div>
        
        <div className="space-y-3">
          <Skeleton className="h-8 w-48 mx-auto bg-white/20" />
          <Skeleton className="h-4 w-32 mx-auto bg-white/20" />
        </div>
        
        <div className="space-y-2">
          <p className="text-stone text-sm">
            Loading your stoic journey...
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProtectedRoute;