'use client'

import { useState, useEffect, useMemo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
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

  // Memoize the fallback to prevent unnecessary re-renders
  const fallback = useMemo(() => {
    if (isLoading) return null; // Let ProtectedRoute handle loading
    
    return showAuth ? (
      <LoginScreen 
        onBack={() => setShowAuth(false)}
      />
    ) : (
      <LandingPage onGetStarted={() => setShowAuth(true)} />
    );
  }, [showAuth, isLoading]);

  // For authenticated users, show the dashboard directly
  // For unauthenticated users, show landing page first time, login after
  return (
    <ProtectedRoute fallback={fallback}>
      <AppLayout>
        <Dashboard />
      </AppLayout>
    </ProtectedRoute>
  );
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