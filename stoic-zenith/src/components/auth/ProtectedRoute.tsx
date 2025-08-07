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

  // Update wasAuthenticated whenever localStorage changes (cross-tab and same-tab)
  useEffect(() => {
    const updateWasAuthenticated = () => {
      setWasAuthenticated(localStorage.getItem('was-authenticated') === 'true');
    };
    window.addEventListener('storage', updateWasAuthenticated);
    window.addEventListener('localStorageChanged', updateWasAuthenticated);
    return () => {
      window.removeEventListener('storage', updateWasAuthenticated);
      window.removeEventListener('localStorageChanged', updateWasAuthenticated);
    };
  }, []);



  // Show minimal loading while checking authentication
  if (isLoading) {
    return <MinimalLoadingScreen />;
  }

  // If user was previously authenticated but not currently authenticated,
  // show loading to prevent login screen flash
  if (wasAuthenticated && !isAuthenticated) {
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