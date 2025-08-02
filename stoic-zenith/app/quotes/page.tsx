'use client'

import React from 'react'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DailyStoicWisdom } from '@/components/quotes/DailyStoicWisdom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'

const queryClient = new QueryClient()

export default function QuotesPage(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ProtectedRoute>
          <AppLayout fullWidth>
            <DailyStoicWisdom />
          </AppLayout>
        </ProtectedRoute>
      </TooltipProvider>
    </QueryClientProvider>
  )
}
