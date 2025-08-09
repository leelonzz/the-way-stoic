'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { useAuthContext } from './AuthProvider';
import LoginScreen from './LoginScreen';
import { MinimalLoadingScreen } from '@/components/ui/loading-spinner';

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
  const [quickTimeout, setQuickTimeout] = useState(false);

  // Update wasAuthenticated whenever localStorage changes (cross-tab and same-tab)
  useEffect(() => {
    const updateWasAuthenticated = (): void => {
      const newWasAuth = localStorage.getItem('was-authenticated') === 'true';
      setWasAuthenticated(newWasAuth);
      // Reset timeout when auth state changes
      if (!newWasAuth) {
        setAuthTimeoutReached(false);
      }
    };
    window.addEventListener('storage', updateWasAuthenticated);
    window.addEventListener('localStorageChanged', updateWasAuthenticated);
    return (): void => {
      window.removeEventListener('storage', updateWasAuthenticated);
      window.removeEventListener('localStorageChanged', updateWasAuthenticated);
    };
  }, []);

  // Quick timeout for initial render (8s)
  useEffect(() => {
    if (isLoading && !quickTimeout) {
      const quickTimeoutId = setTimeout((): void => {
        setQuickTimeout(true);
      }, 8000); // 8 second quick timeout - more patient for auth

      return (): void => clearTimeout(quickTimeoutId);
    }
  }, [isLoading, quickTimeout]);

  // Longer timeout for wasAuthenticated state
  useEffect(() => {
    if (wasAuthenticated && !isAuthenticated && !isLoading) {
      // Only start timeout after a brief delay to allow auth state to propagate
      const initialDelayId = setTimeout((): void => {
        if (!isAuthenticated && !isLoading) {
          console.warn('⏱️ Auth state not updated after initial delay, starting timeout');

          // Longer timeout as fallback - be more patient (8 seconds)
          const longTimeoutId = setTimeout((): void => {
            if (!isAuthenticated) {
              console.warn('🔐 Auth timeout - clearing session');
              localStorage.removeItem('was-authenticated');
              setWasAuthenticated(false);
              setAuthTimeoutReached(true);
              window.dispatchEvent(new Event('localStorageChanged'));
            }
          }, 8000); // 8 second timeout for safety

          return (): void => {
            clearTimeout(longTimeoutId);
          };
        }
      }, 2000); // Wait 2 seconds before starting timeout logic

      return (): void => {
        clearTimeout(initialDelayId);
      };
    }

    // Reset timeout when user becomes authenticated
    if (isAuthenticated) {
      setAuthTimeoutReached(false);
      setQuickTimeout(false);
    }
  }, [wasAuthenticated, isAuthenticated, isLoading]);

  // Show minimal loading while checking authentication (with quick timeout)
  if (isLoading && !quickTimeout) {
    return <MinimalLoadingScreen />;
  }

  // If user was previously authenticated but not currently authenticated,
  // show loading briefly to prevent login screen flash
  if (wasAuthenticated && !isAuthenticated && !authTimeoutReached && !quickTimeout) {
    return <MinimalLoadingScreen />;
  }

  // If not authenticated, show fallback (login screen or landing page)
  if (!isAuthenticated) {
    return fallback || <LoginScreen />;
  }

  // User is authenticated, show the protected content
  return <>{children}</>;
}

export default ProtectedRoute;