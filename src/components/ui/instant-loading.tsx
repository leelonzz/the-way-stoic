'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'
import { useNavigationTransition } from '@/components/providers/InstantNavigationProvider'

interface InstantLoadingProps {
  children?: React.ReactNode
  showLoader?: boolean
  className?: string
}

export function InstantLoading({ 
  children, 
  showLoader = true, 
  className = '' 
}: InstantLoadingProps): JSX.Element {
  const { isTransitioning } = useNavigationTransition()
  
  if (!isTransitioning) {
    return <>{children}</>
  }

  return (
    <div className={`relative ${className}`}>
      {children}
      {showLoader && (
        <div className="absolute top-2 right-2 z-50">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm border border-stone/10">
            <Loader2 className="w-3 h-3 animate-spin text-primary" />
            <span className="text-xs text-stone/70 font-medium">Loading...</span>
          </div>
        </div>
      )}
    </div>
  )
}

interface MinimalLoadingIndicatorProps {
  isVisible?: boolean
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  className?: string
}

export function MinimalLoadingIndicator({ 
  isVisible, 
  position = 'top-right',
  className = '' 
}: MinimalLoadingIndicatorProps): JSX.Element | null {
  const { isTransitioning } = useNavigationTransition()
  const shouldShow = isVisible !== undefined ? isVisible : isTransitioning
  
  if (!shouldShow) return null

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50 ${className}`}>
      <div className="flex items-center gap-2 bg-primary/90 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        <span className="text-xs text-white font-medium">Loading</span>
      </div>
    </div>
  )
}

interface ProgressBarProps {
  isVisible?: boolean
  className?: string
}

export function ProgressBar({ isVisible, className = '' }: ProgressBarProps): JSX.Element | null {
  const { isTransitioning } = useNavigationTransition()
  const shouldShow = isVisible !== undefined ? isVisible : isTransitioning
  
  if (!shouldShow) return null

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 h-0.5 bg-stone/10 ${className}`}>
      <div className="h-full bg-gradient-to-r from-primary to-accent animate-progress-bar" />
    </div>
  )
}

// Add this CSS animation to your globals.css or component
const progressBarStyles = `
@keyframes progress-bar {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(-25%); }
  100% { transform: translateX(0%); }
}

.animate-progress-bar {
  animation: progress-bar 800ms ease-in-out;
}
`

// You can inject this style if needed
if (typeof document !== 'undefined' && !document.querySelector('#progress-bar-styles')) {
  const style = document.createElement('style')
  style.id = 'progress-bar-styles'
  style.textContent = progressBarStyles
  document.head.appendChild(style)
}