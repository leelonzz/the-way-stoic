import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} text-stone animate-spin`} />
    </div>
  );
}

export function MinimalLoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-hero via-parchment to-accent/10 flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
} 