'use client';

import React, { ReactNode, useMemo, useEffect } from 'react';
import { useAuthContext } from './AuthProvider';
import LoginScreen from './LoginScreen';
import { MinimalLoadingScreen } from '@/components/ui/loading-spinner';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps): ReactNode {
  const { isAuthenticated, isLoading } = useAuthContext();

  // Check if user was previously authenticated
  const wasAuthenticated = useMemo(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('was-authenticated') === 'true';
    }
    return false;
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('🔍 ProtectedRoute state:', {
      isLoading,
      isAuthenticated,
      wasAuthenticated,
      showLogin: !isLoading && !isAuthenticated && !wasAuthenticated
    });
  }, [isLoading, isAuthenticated, wasAuthenticated]);

  // Show minimal loading while checking authentication
  if (isLoading) {
    console.log('⏳ Showing loading screen...');
    return <MinimalLoadingScreen />;
  }

  // If user was previously authenticated but not currently authenticated,
  // show loading to prevent login screen flash
  if (wasAuthenticated && !isAuthenticated) {
    console.log('🔄 User was authenticated, showing loading while restoring session...');
    return <MinimalLoadingScreen />;
  }

  // If not authenticated, show fallback (login screen or landing page)
  if (!isAuthenticated) {
    console.log('🚪 User not authenticated, showing login/landing page');
    return fallback || <LoginScreen />;
  }

  // User is authenticated, show the protected content
  console.log('✅ User authenticated, showing dashboard');
  return <>{children}</>;
}

export default ProtectedRoute;