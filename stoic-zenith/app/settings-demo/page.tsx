'use client'

import React from 'react';
import { SettingsDemo } from '@/components/settings/SettingsDemo';
import { AppLayout } from '@/components/layout/AppLayout';

export default function SettingsDemoPage(): JSX.Element {
  return (
    <AppLayout>
      <SettingsDemo />
    </AppLayout>
  );
} 