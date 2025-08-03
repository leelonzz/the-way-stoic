'use client'

import React from 'react';
import { EnhancedSettingsPage } from '@/components/settings/EnhancedSettingsPage';
import { AppLayout } from '@/components/layout/AppLayout';

export default function EnhancedSettingsPageRoute(): JSX.Element {
  const mockProfile = {
    name: 'Lee',
    email: 'leenhatlong210@gmail.com',
    avatar: undefined
  };

  return (
    <AppLayout>
      <EnhancedSettingsPage profile={mockProfile} />
    </AppLayout>
  );
} 