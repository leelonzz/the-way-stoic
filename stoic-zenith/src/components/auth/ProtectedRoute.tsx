'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { useAuthContext } from './AuthProvider';
import LoginScreen from './LoginScreen';
import { MinimalLoadingScreen } from '@/components/ui/loading-spinner';
import { getTimeoutConfig, isProduction } from '@/lib/config';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps): ReactNode {
  const { isAuthenticated, isLoading } = useAuthContext();
  const [wasAuthenticated, setWasAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('was-authenticated') === 'true';
    }
    return false;
  });
  const [authTimeoutReached, setAuthTimeoutReached] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Update wasAuthenticated whenever localStorage changes (cross-tab and same-tab)
  useEffect(() => {
    const updateWasAuthenticated = () => {
      const newWasAuth = localStorage.getItem('was-authenticated') === 'true';
      setWasAuthenticated(newWasAuth);
      // Reset timeout when auth state changes
      if (!newWasAuth) {
        setAuthTimeoutReached(false);
      }
    };
    window.addEventListener('storage', updateWasAuthenticated);
    window.addEventListener('localStorageChanged', updateWasAuthenticated);
    return () => {
      window.removeEventListener('storage', updateWasAuthenticated);
      window.removeEventListener('localStorageChanged', updateWasAuthenticated);
    };
  }, []);

  // Production-aware timeout for wasAuthenticated state to prevent infinite loading
  useEffect(() => {
    if (wasAuthenticated && !isAuthenticated && !isLoading) {
      const timeoutConfig = getTimeoutConfig();
      const timeoutDuration = timeoutConfig.authTimeout; // 30s prod, 10s dev

      const timeoutId = setTimeout(() => {
        console.warn(`Authentication timeout reached after ${timeoutDuration}ms`);

        // In production, be more lenient - don't immediately clear auth state
        if (isProduction() && retryCount < 2) {
          console.log('🔄 Production timeout - attempting retry instead of clearing auth');
          setRetryCount(prev => prev + 1);
          // Don't clear auth state, just increment retry count
          return;
        }

        // Clear auth state after retries exhausted or in development
        console.warn('Clearing was-authenticated flag after timeout/retries');
        localStorage.removeItem('was-authenticated');
        setWasAuthenticated(false);
        setAuthTimeoutReached(true);
        // Dispatch event to notify other components
        window.dispatchEvent(new Event('localStorageChanged'));
      }, timeoutDuration);

      return () => clearTimeout(timeoutId);
    }
  }, [wasAuthenticated, isAuthenticated, isLoading, retryCount]);

  // Show minimal loading while checking authentication
  if (isLoading) {
    return <MinimalLoadingScreen />;
  }

  // If user was previously authenticated but not currently authenticated,
  // show loading to prevent login screen flash (but with timeout)
  if (wasAuthenticated && !isAuthenticated && !authTimeoutReached) {
    return <MinimalLoadingScreen />;
  }

  // If timeout reached in production and we have retries left, show retry option
  if (authTimeoutReached && isProduction() && retryCount > 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">
            Connection Taking Longer Than Expected
          </h2>
          <p className="text-stone-600 mb-6">
            We're having trouble connecting to verify your authentication. This might be due to a slow connection.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setAuthTimeoutReached(false);
                setRetryCount(0);
                // Trigger a re-check
                window.location.reload();
              }}
              className="px-6 py-3 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors"
            >
              Retry Connection
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('was-authenticated');
                setWasAuthenticated(false);
                setAuthTimeoutReached(false);
                setRetryCount(0);
              }}
              className="px-6 py-3 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
            >
              Sign In Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, show fallback (login screen or landing page)
  if (!isAuthenticated) {
    return fallback || <LoginScreen />;
  }

  // User is authenticated, show the protected content
  return <>{children}</>;
}

export default ProtectedRoute;