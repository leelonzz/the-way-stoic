'use client'
export const dynamic = 'force-dynamic'

import React, { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { NavigationOptimizedCachedPage } from '@/components/layout/NavigationOptimizedCachedPage'
import { SettingsSidebar } from '@/components/settings/SettingsSidebar'
import { AccountSettings } from '@/components/settings/AccountSettings'
import { PreferencesSettings } from '@/components/settings/PreferencesSettings'
import { SubscriptionManagement } from '@/components/subscription/SubscriptionManagement'
import { useProfile } from '@/hooks/useProfile'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { User } from 'lucide-react'

type SettingsSection =
  | 'account'
  | 'subscription'
  | 'preferences'
  | 'appearance'
  | 'notifications'

function SettingsContent(): JSX.Element {
  const [activeSection, setActiveSection] = useState<SettingsSection>('account')
  const { user } = useAuthContext()
  const {
    profile,
    loading,
    error,
    updateProfile,
    updateEmail,
    updatePassword,
    deleteAccount,
  } = useProfile(user)

  const { isAuthenticated } = useAuthContext()

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-20">
          <User className="w-16 h-16 text-stone/30 mx-auto mb-4" />
          <h1 className="text-3xl font-serif text-ink mb-4">Settings</h1>
          <p className="text-stone">Please sign in to access settings.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <LoadingSpinner size="md" className="mx-auto" />
          <p className="text-stone">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-serif text-ink">Settings</h1>
        <p className="text-red-600 mt-4">
          Error: {error || 'Failed to load profile'}
        </p>
      </div>
    )
  }

  const renderContent = (): JSX.Element | null => {
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
        )
      case 'subscription':
        return user ? (
          <div className="p-6">
            <h2 className="text-2xl font-serif text-ink mb-6">Subscription Management</h2>
            <SubscriptionManagement userId={user.id} />
          </div>
        ) : (
          <div className="p-6">
            <h2 className="text-2xl font-serif text-ink mb-4">Subscription</h2>
            <p className="text-stone">Please sign in to manage your subscription.</p>
          </div>
        )
      case 'preferences':
        return <PreferencesSettings />
      case 'appearance':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-serif text-ink mb-4">Appearance</h2>
            <p className="text-stone">
              Theme and appearance settings coming soon.
            </p>
          </div>
        )
      case 'notifications':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-serif text-ink mb-4">Notifications</h2>
            <p className="text-stone">Notification preferences coming soon.</p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-10">
        <h1 className="text-3xl font-serif text-ink mb-3">Settings</h1>
        <p className="text-stone/70 text-lg">
          Manage your account and preferences
        </p>
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
  )
}

function SettingsSkeleton(): JSX.Element {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-10">
        <div className="h-8 bg-stone/10 rounded w-48 mb-3"></div>
        <div className="h-5 bg-stone/10 rounded w-64"></div>
      </div>
      <div className="flex gap-10 min-h-[600px]">
        <div className="w-72 flex-shrink-0">
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 bg-stone/10 rounded"></div>
            ))}
          </div>
        </div>
        <div className="flex-1 bg-white/30 rounded-xl border border-stone/5">
          <div className="p-6 space-y-4">
            <div className="h-6 bg-stone/10 rounded w-32"></div>
            <div className="h-4 bg-stone/10 rounded w-48"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 bg-stone/10 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage(): JSX.Element {
  return (
    <ProtectedRoute>
      <AppLayout>
        <NavigationOptimizedCachedPage
          pageKey="settings"
          fallback={<SettingsSkeleton />}
          preserveOnNavigation={true}
          refreshOnlyWhenStale={false} // Settings rarely change
          maxAge={60 * 60 * 1000} // 1 hour - settings don't change frequently
        >
          <SettingsContent />
        </NavigationOptimizedCachedPage>
      </AppLayout>
    </ProtectedRoute>
  )
}
