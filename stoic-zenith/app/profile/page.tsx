'use client'

import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Settings, BarChart3, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useProfile } from '@/hooks/useProfile';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileSettings } from '@/components/profile/ProfileSettings';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Hourglass } from '@/components/ui/Hourglass';

const queryClient = new QueryClient();

function ProfileContent() {
  const { user } = useAuthContext();
  const { 
    profile, 
    stats, 
    loading, 
    error, 
    updateProfile, 
    updateEmail, 
    updatePassword, 
    deleteAccount 
  } = useProfile(user);
  
  const { isAuthenticated } = useAuthContext();

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-20">
          <User className="w-16 h-16 text-stone/30 mx-auto mb-4" />
          <h1 className="text-3xl font-serif text-ink mb-4">Profile & Settings</h1>
          <p className="text-stone">Please sign in to view and manage your profile.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <Hourglass size="md" className="mx-auto" />
          <p className="text-stone">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-serif text-ink">Profile & Settings</h1>
        <p className="text-red-600 mt-4">Error: {error || 'Failed to load profile'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-serif text-ink">Your Profile</h1>
        <p className="text-stone">Manage your account and track your progress</p>
      </div>

      <ProfileHeader profile={profile} stats={stats} />

      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/50">
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Progress & Stats
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Account Settings
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-6">
          {stats ? (
            <ProfileStats stats={stats} />
          ) : (
            <div className="text-center py-12">
              <p className="text-stone">Loading your statistics...</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="text-center py-12">
            <div className="max-w-md mx-auto space-y-4">
              <Settings className="w-16 h-16 text-stone/30 mx-auto" />
              <h3 className="text-xl font-serif text-ink">Account Settings</h3>
              <p className="text-stone/70">
                Manage your account settings, preferences, and security options in the dedicated settings page.
              </p>
              <Link href="/settings">
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-cta hover:bg-cta/90 text-white rounded-lg transition-colors">
                  <Settings className="w-4 h-4" />
                  Go to Settings
                  <ExternalLink className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <div className="text-center py-12">
            <div className="max-w-md mx-auto space-y-4">
              <Settings className="w-16 h-16 text-stone/30 mx-auto" />
              <h3 className="text-xl font-serif text-ink">Preferences Coming Soon</h3>
              <p className="text-stone/70">
                Theme settings, notification preferences, and other customization options 
                will be available here in a future update.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppLayout>
          <ProfileContent />
        </AppLayout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}