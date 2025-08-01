'use client'

import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import LandingPage from "@/components/LandingPage";
import LoginScreen from "@/components/auth/LoginScreen";

const queryClient = new QueryClient();

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const [showAuth, setShowAuth] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Prevent hydration mismatch by only rendering client-specific content after mount
  useEffect(() => {
    setMounted(true);
    
    // Set a longer timeout to allow auth to initialize properly
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Auth loading timeout reached');
        setLoadingTimeout(true);
      }
    }, 3000); // Reduced to 3 seconds
    
    return () => clearTimeout(timeout);
  }, [isLoading]);

  // Debug logging
  useEffect(() => {
    console.log('Auth state:', { isAuthenticated, isLoading, hasUser: !!user, mounted, loadingTimeout });
  }, [isAuthenticated, isLoading, user, mounted, loadingTimeout]);

  // Show loading state during SSR and while auth is loading (with timeout)
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hero via-parchment to-accent/10 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-6 h-6 border-2 border-cta border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-stone text-sm">Loading your stoic journey...</p>
        </div>
      </div>
    );
  }
  
  // Show loading state while auth is still loading (no timeout fallback for now)
  if (isLoading && !loadingTimeout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hero via-parchment to-accent/10 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-6 h-6 border-2 border-cta border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-stone text-sm">Loading your stoic journey...</p>
        </div>
      </div>
    );
  }
  
  // Handle loading timeout - but still check if user is actually authenticated
  if (isLoading && loadingTimeout) {
    console.warn('Auth loading timeout reached');
    // If we have a user but loading is stuck, show the dashboard anyway
    if (user) {
      console.log('User found despite loading timeout, showing dashboard');
      return (
        <AppLayout>
          <Dashboard />
        </AppLayout>
      );
    }
    // Otherwise show landing page
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  // If authenticated, show the main app
  if (isAuthenticated) {
    return (
      <AppLayout>
        <Dashboard />
      </AppLayout>
    );
  }

  // If not authenticated and user wants to see auth
  if (showAuth) {
    return <LoginScreen onBack={() => setShowAuth(false)} />;
  }

  // Default: show landing page
  return <LandingPage onGetStarted={() => setShowAuth(true)} />;
}

export default function HomePage() {
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