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

  // Timeout for wasAuthenticated state to prevent infinite loading
  useEffect(() => {
    if (wasAuthenticated && !isAuthenticated && !isLoading) {
      // Longer timeout for production due to network latency and CSP processing
      const isProduction = process.env.NODE_ENV === 'production'
      const timeoutDuration = isProduction ? 30000 : 15000 // 30s in production, 15s in dev

      const timeoutId = setTimeout(() => {
        console.warn(`ProtectedRoute: Authentication timeout reached after ${timeoutDuration/1000}s`);
        console.warn('This may indicate a network issue or session expiry');
        // Don't clear was-authenticated here - let useAuth manage it
        setAuthTimeoutReached(true);
      }, timeoutDuration);

      return () => clearTimeout(timeoutId);
    } else if (isAuthenticated) {
      // Reset timeout when user becomes authenticated
      setAuthTimeoutReached(false);
    }
  }, [wasAuthenticated, isAuthenticated, isLoading]);

  // Show minimal loading while checking authentication
  if (isLoading) {
    return <MinimalLoadingScreen />;
  }

  // If user was previously authenticated but not currently authenticated,
  // show loading to prevent login screen flash (but with timeout)
  if (wasAuthenticated && !isAuthenticated && !authTimeoutReached) {
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