'use client'

import { useState, useEffect, useMemo } from "react";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { NavigationOptimizedCachedPage } from "@/components/layout/NavigationOptimizedCachedPage";
import HomePage from "@/components/HomePage";
import LandingPage from "@/components/LandingPage";
import LoginScreen from "@/components/auth/LoginScreen";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

function HomeSkeleton(): JSX.Element {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Greeting Skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-stone/10 rounded w-48 mb-2"></div>
          <div className="h-6 bg-stone/10 rounded w-64"></div>
        </div>

        {/* Daily Quote Skeleton */}
        <div className="mb-12">
          <div className="bg-white/30 rounded-xl p-8 border border-stone/5 max-w-4xl mx-auto">
            <div className="space-y-4">
              <div className="h-6 bg-stone/10 rounded w-full"></div>
              <div className="h-6 bg-stone/10 rounded w-5/6"></div>
              <div className="h-6 bg-stone/10 rounded w-4/6"></div>
              <div className="h-5 bg-stone/10 rounded w-32 mt-6"></div>
            </div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/30 rounded-xl p-6 border border-stone/5">
              <div className="space-y-3">
                <div className="h-5 bg-stone/10 rounded w-24"></div>
                <div className="h-8 bg-stone/10 rounded w-16"></div>
                <div className="h-4 bg-stone/10 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const [showAuth, setShowAuth] = useState(false);
  const { isAuthenticated, isLoading } = useAuthContext();

  // Check if user was previously authenticated to prevent showing login on reload
  const wasAuthenticated = useMemo(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('was-authenticated') === 'true';
    }
    return false;
  }, []);

  // Memoize the fallback to prevent unnecessary re-renders
  const fallback = useMemo(() => {
    // If loading, let ProtectedRoute handle it
    if (isLoading) return null;
    
    // If user was previously authenticated but not currently authenticated,
    // show loading instead of login to prevent flashing
    if (wasAuthenticated && !isAuthenticated) {
      return null; // Let ProtectedRoute show loading
    }
    
    // If not loading and not authenticated, show appropriate screen
    return showAuth ? (
      <LoginScreen 
        onBack={() => setShowAuth(false)}
      />
    ) : (
      <LandingPage onGetStarted={() => setShowAuth(true)} />
    );
  }, [showAuth, isLoading, isAuthenticated, wasAuthenticated]);

  // For authenticated users, show the dashboard directly
  // For unauthenticated users, show landing page first time, login after
  return (
    <ProtectedRoute fallback={fallback}>
      <AppLayout>
        <NavigationOptimizedCachedPage
          pageKey="home"
          fallback={<HomeSkeleton />}
          preserveOnNavigation={true}
          refreshOnlyWhenStale={true}
          maxAge={10 * 60 * 1000} // 10 minutes - longer cache for better navigation
          navigationRefreshThreshold={3 * 60 * 1000} // 3 minutes for quote content
        >
          <HomePage />
        </NavigationOptimizedCachedPage>
      </AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return <AppContent />;
}