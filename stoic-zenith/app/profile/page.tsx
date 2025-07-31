'use client'

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";

const queryClient = new QueryClient();

export default function ProfilePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppLayout>
          <div className="text-center py-20">
            <h1 className="text-3xl font-serif text-ink">Profile & Settings</h1>
            <p className="text-stone mt-4">Coming soon...</p>
          </div>
        </AppLayout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}