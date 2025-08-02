'use client'

import { useState, useEffect, useMemo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import HomePage from "@/components/HomePage";
import LandingPage from "@/components/LandingPage";
import LoginScreen from "@/components/auth/LoginScreen";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

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
        <HomePage />
      </AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}