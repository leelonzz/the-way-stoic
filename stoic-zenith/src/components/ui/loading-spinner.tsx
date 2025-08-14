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
    <div className="min-h-screen bg-gradient-to-br from-hero via-parchment to-accent/10 flex flex-col items-center justify-center">
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <div className="w-12 h-12 bg-stone/20 rounded-full flex items-center justify-center mb-3 mx-auto">
          <div className="w-6 h-6 bg-stone/40 rounded-full"></div>
        </div>
        <h2 className="text-lg font-serif text-stone/80">The Stoic Way</h2>
      </div>
      
      {/* Loading Spinner */}
      <LoadingSpinner size="lg" />
      
      {/* Loading Text */}
      <p className="text-stone/60 text-sm mt-4">Preparing your journey...</p>
    </div>
  );
}

export function BrandedLoadingScreen({ message = "Loading your wisdom..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-hero via-parchment to-accent/10 flex flex-col items-center justify-center">
      {/* Logo/Brand */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-stone/20 rounded-full flex items-center justify-center mb-4 mx-auto">
          <div className="w-8 h-8 bg-stone/40 rounded-full"></div>
        </div>
        <h1 className="text-2xl font-serif text-stone">The Stoic Way</h1>
        <p className="text-stone/70 text-sm mt-1">Philosophy for Daily Life</p>
      </div>

      {/* Loading Spinner */}
      <div className="flex items-center space-x-2">
        <Loader2 className="w-6 h-6 text-stone animate-spin" />
        <span className="text-stone/70 text-sm">{message}</span>
      </div>

      {/* Progress Animation */}
      <div className="mt-6 w-64">
        <div className="h-1 bg-stone/20 rounded-full overflow-hidden">
          <div className="h-full bg-stone/40 rounded-full w-1/3 animate-pulse"></div>
        </div>
      </div>
    </div>
  )
} 