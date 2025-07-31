
import React from 'react';
import { AppSidebar } from './AppSidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-hero">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-8">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
