'use client';

import React, { ReactNode } from 'react';
import { useAuthContext } from './AuthProvider';
import LoginScreen from './LoginScreen';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return fallback || <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <>{children}</>;
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-hero via-parchment to-accent/10 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-cta rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
            <Brain className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div className="space-y-3">
          <Skeleton className="h-8 w-48 mx-auto bg-white/20" />
          <Skeleton className="h-4 w-32 mx-auto bg-white/20" />
        </div>
        
        <div className="space-y-2">
          <div className="w-6 h-6 border-2 border-cta border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-stone text-sm">Loading your stoic journey...</p>
        </div>
      </div>
    </div>
  );
}

export default ProtectedRoute;