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

  // Check for persisted session state to determine initial showAuth value
  useEffect(() => {
    const persistedSession = localStorage.getItem('supabase-session');
    if (persistedSession) {
      try {
        const sessionData = JSON.parse(persistedSession);
        // If we have a recent session (less than 1 hour old), don't show landing page
        const sessionAge = Date.now() - sessionData.timestamp;
        if (sessionAge < 3600000) { // 1 hour
          console.log('Found recent persisted session, skipping landing page');
          return; // Don't set showAuth, let auth system handle it
        }
      } catch (error) {
        console.warn('Failed to parse persisted session:', error);
        localStorage.removeItem('supabase-session');
      }
    }
  }, []);
  // Prevent hydration mismatch by only rendering client-specific content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('Auth state:', { isAuthenticated, isLoading, hasUser: !!user, mounted });
  }, [isAuthenticated, isLoading, user, mounted]);

  // Show loading state during SSR and while auth is loading
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
  
  // Show loading state while auth is initializing - no timeout interruption
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hero via-parchment to-accent/10 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-6 h-6 border-2 border-cta border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-stone text-sm">Loading your stoic journey...</p>
        </div>
      </div>
    );
  }

  // If authenticated, show the main app - bypass landing page entirely
  if (isAuthenticated) {
    console.log('✅ User authenticated, showing dashboard');
    return (
      <AppLayout>
        <Dashboard />
      </AppLayout>
    );
  }

  // If we have a user but isAuthenticated is false, still show dashboard
  if (user && !isLoading) {
    console.log('✅ User found but not marked as authenticated, showing dashboard anyway');
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

  // Default: show landing page only if definitely not authenticated
  console.log('Showing landing page - no authentication detected');
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