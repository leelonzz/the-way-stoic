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
import { Hourglass } from '@/components/ui/Hourglass';

const queryClient = new QueryClient();

function CalendarContent(): JSX.Element {
  const { user, isAuthenticated } = useAuthContext();
  const { 
    lifeCalendarData, 
    loading: calendarLoading, 
    error, 
    updatePreferences, 
    getWeekData, 
    getMotivationalMessage,
    refetch 
  } = useLifeCalendar(user);

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

  if (calendarLoading && !lifeCalendarData.birthDate) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <Hourglass size="md" className="mx-auto" />
          <p className="text-stone">Loading your life calendar...</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 space-y-4">
        <h1 className="text-3xl font-serif text-ink">Memento Mori Calendar</h1>
        <p className="text-red-600 mt-4">Connection issue: {error}</p>
        <div className="space-y-2">
          <p className="text-stone/70 text-sm">Unable to load your calendar preferences</p>
          <button 
            onClick={() => refetch()}
            className="px-6 py-2 bg-cta hover:bg-cta/90 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
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

export default function CalendarPage(): JSX.Element {
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