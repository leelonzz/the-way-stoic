'use client'

import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, BarChart3, Settings } from 'lucide-react';
import { useLifeCalendar } from '@/hooks/useLifeCalendar';
import { LifeCalendarGrid } from '@/components/calendar/LifeCalendarGrid';
import { LifeCalendarSetup } from '@/components/calendar/LifeCalendarSetup';
import { MementoMoriInsights } from '@/components/calendar/MementoMoriInsights';
import { useAuthContext } from '@/components/auth/AuthProvider';

const queryClient = new QueryClient();

function CalendarContent() {
  const { user } = useAuthContext();
  const { 
    lifeCalendarData, 
    loading, 
    error, 
    updatePreferences, 
    getWeekData, 
    getMotivationalMessage 
  } = useLifeCalendar(user);
  
  const { isAuthenticated } = useAuthContext();

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-20">
          <CalendarIcon className="w-16 h-16 text-stone/30 mx-auto mb-4" />
          <h1 className="text-3xl font-serif text-ink mb-4">Memento Mori Calendar</h1>
          <p className="text-stone">Please sign in to create your life calendar and track your time.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-cta border-t-transparent mx-auto"></div>
          <p className="text-stone">Loading your life calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-serif text-ink">Memento Mori Calendar</h1>
        <p className="text-red-600 mt-4">Error: {error}</p>
      </div>
    );
  }

  const hasSetupData = lifeCalendarData.birthDate !== null;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-serif text-ink">Memento Mori</h1>
        <p className="text-stone">Remember you must die - Live with intention</p>
      </div>

      {!hasSetupData ? (
        <div className="max-w-2xl mx-auto">
          <LifeCalendarSetup 
            onSetup={updatePreferences}
            initialBirthDate={lifeCalendarData.birthDate}
            initialLifeExpectancy={lifeCalendarData.lifeExpectancy}
          />
        </div>
      ) : (
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/50">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Life Calendar
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-2xl font-serif text-ink">Your Life Visualized</h2>
              <p className="text-stone/70">
                Each square represents one week. Time is finite—make it count.
              </p>
            </div>
            
            <LifeCalendarGrid 
              data={lifeCalendarData} 
              getWeekData={getWeekData} 
            />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <MementoMoriInsights 
              data={lifeCalendarData} 
              motivationalMessage={getMotivationalMessage()} 
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <LifeCalendarSetup 
                onSetup={updatePreferences}
                initialBirthDate={lifeCalendarData.birthDate}
                initialLifeExpectancy={lifeCalendarData.lifeExpectancy}
              />
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default function CalendarPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ProtectedRoute>
          <AppLayout>
            <CalendarContent />
          </AppLayout>
        </ProtectedRoute>
      </TooltipProvider>
    </QueryClientProvider>
  );
}