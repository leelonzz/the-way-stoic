'use client'

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Journal from "@/pages/Journal";

const queryClient = new QueryClient();

export default function JournalPage(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ProtectedRoute>
          <AppLayout fullWidth>
            <Journal />
          </AppLayout>
        </ProtectedRoute>
      </TooltipProvider>
    </QueryClientProvider>
  );
}