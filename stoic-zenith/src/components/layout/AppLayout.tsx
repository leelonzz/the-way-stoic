
import React from 'react';
import { AppSidebar } from './AppSidebar';
import { useNavigationMonitor } from '@/hooks/useNavigationMonitor';

interface AppLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export function AppLayout({ children, fullWidth = false }: AppLayoutProps) {
  // Initialize navigation monitoring
  useNavigationMonitor()

  return (
    <div className="flex min-h-screen bg-hero">
      <AppSidebar />
      <main className="flex-1 overflow-auto ml-64">
        {fullWidth ? (
          <div className="h-full">
            {children}
          </div>
        ) : (
          <div className="max-w-5xl mx-auto p-6">
            {children}
          </div>
        )}
      </main>
    </div>
  );
}
