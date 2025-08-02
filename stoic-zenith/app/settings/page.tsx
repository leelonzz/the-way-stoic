'use client'

import React, { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { PreferencesSettings } from "@/components/settings/PreferencesSettings";
import { useProfile } from '@/hooks/useProfile';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Hourglass } from '@/components/ui/Hourglass';
import { User } from 'lucide-react';

const queryClient = new QueryClient();

type SettingsSection = 'account' | 'preferences' | 'appearance' | 'notifications';

function SettingsContent() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');
  const { user } = useAuthContext();
  const { 
    profile, 
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
          <h1 className="text-3xl font-serif text-ink mb-4">Settings</h1>
          <p className="text-stone">Please sign in to access settings.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <Hourglass size="md" className="mx-auto" />
          <p className="text-stone">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-serif text-ink">Settings</h1>
        <p className="text-red-600 mt-4">Error: {error || 'Failed to load profile'}</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'account':
        return (
          <AccountSettings
            profile={profile}
            onUpdateProfile={updateProfile}
            onUpdateEmail={updateEmail}
            onUpdatePassword={updatePassword}
            onDeleteAccount={deleteAccount}
          />
        );
      case 'preferences':
        return <PreferencesSettings />;
      case 'appearance':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-serif text-ink mb-4">Appearance</h2>
            <p className="text-stone">Theme and appearance settings coming soon.</p>
          </div>
        );
      case 'notifications':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-serif text-ink mb-4">Notifications</h2>
            <p className="text-stone">Notification preferences coming soon.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-10">
        <h1 className="text-3xl font-serif text-ink mb-3">Settings</h1>
        <p className="text-stone/70 text-lg">Manage your account and preferences</p>
      </div>

      <div className="flex gap-10 min-h-[600px]">
        <div className="w-72 flex-shrink-0">
          <SettingsSidebar 
            activeSection={activeSection} 
            onSectionChange={setActiveSection} 
          />
        </div>
        
        <div className="flex-1 bg-white/30 rounded-xl border border-stone/5 shadow-sm">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppLayout>
          <SettingsContent />
        </AppLayout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}