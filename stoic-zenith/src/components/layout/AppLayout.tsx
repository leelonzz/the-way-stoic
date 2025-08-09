import React from 'react';
import { AppSidebar } from './AppSidebar';
import { useNavigationMonitor } from '@/hooks/useNavigationMonitor';
import { cn } from '@/lib/utils';

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
      <main className={cn(
        "flex-1 ml-64",
        fullWidth ? "flex flex-col min-h-screen overflow-hidden" : "overflow-auto"
      )}>
        {fullWidth ? (
          <div className="flex-1 min-h-0">
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