'use client'

import React, { 
  createContext, 
  useContext, 
  useState, 
  useCallback, 
  useRef, 
  ReactNode, 
  startTransition,
  useEffect
} from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { usePageCache } from './PageCacheProvider'

interface NavigationState {
  isTransitioning: boolean
  currentPath: string
  pendingPath: string | null
  transitionId: string | null
}

interface InstantNavigationContextType {
  navigationState: NavigationState
  navigateInstantly: (href: string, options?: { replace?: boolean }) => void
  isPathTransitioning: (path: string) => boolean
  completeTransition: () => void
}

const InstantNavigationContext = createContext<InstantNavigationContextType | null>(null)

interface InstantNavigationProviderProps {
  children: ReactNode
}

export function InstantNavigationProvider({ children }: InstantNavigationProviderProps): JSX.Element {
  const router = useRouter()
  const pathname = usePathname()
  const { isPageCached, getCachedPage } = usePageCache()
  
  const [navigationState, setNavigationState] = useState<NavigationState>({
    isTransitioning: false,
    currentPath: pathname,
    pendingPath: null,
    transitionId: null
  })
  
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Clear any pending transitions when pathname actually changes
  useEffect(() => {
    if (pathname !== navigationState.currentPath && navigationState.isTransitioning) {
      setNavigationState(prev => ({
        ...prev,
        isTransitioning: false,
        currentPath: pathname,
        pendingPath: null,
        transitionId: null
      }))
      
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
        transitionTimeoutRef.current = null
      }
    }
  }, [pathname, navigationState.currentPath, navigationState.isTransitioning])

  const completeTransition = useCallback(() => {
    setNavigationState(prev => ({
      ...prev,
      isTransitioning: false,
      currentPath: prev.pendingPath || prev.currentPath,
      pendingPath: null,
      transitionId: null
    }))
    
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current)
      transitionTimeoutRef.current = null
    }
  }, [])

  const navigateInstantly = useCallback((href: string, options: { replace?: boolean } = {}) => {
    // Don't navigate if already on this path
    if (href === pathname) return

    const transitionId = `transition-${Date.now()}-${Math.random().toString(36).slice(2)}`
    
    // Set transitioning state immediately for instant UI feedback
    setNavigationState(prev => ({
      ...prev,
      isTransitioning: true,
      pendingPath: href,
      transitionId
    }))

    // Check if page is cached for instant display
    const isCached = isPageCached(href.replace('/', '') || 'home')
    
    if (isCached) {
      // For cached pages, we can navigate faster
      startTransition(() => {
        if (options.replace) {
          router.replace(href)
        } else {
          router.push(href)
        }
      })
      
      // Complete transition faster for cached content
      transitionTimeoutRef.current = setTimeout(() => {
        completeTransition()
      }, 150)
    } else {
      // For non-cached pages, use longer transition time
      startTransition(() => {
        if (options.replace) {
          router.replace(href)
        } else {
          router.push(href)
        }
      })
      
      // Fallback to complete transition after reasonable time
      transitionTimeoutRef.current = setTimeout(() => {
        completeTransition()
      }, 800)
    }
  }, [pathname, router, isPageCached, completeTransition])

  const isPathTransitioning = useCallback((path: string) => {
    return navigationState.isTransitioning && navigationState.pendingPath === path
  }, [navigationState])

  const contextValue: InstantNavigationContextType = {
    navigationState,
    navigateInstantly,
    isPathTransitioning,
    completeTransition
  }

  return (
    <InstantNavigationContext.Provider value={contextValue}>
      {children}
    </InstantNavigationContext.Provider>
  )
}

export function useInstantNavigation(): InstantNavigationContextType {
  const context = useContext(InstantNavigationContext)
  if (!context) {
    throw new Error('useInstantNavigation must be used within an InstantNavigationProvider')
  }
  return context
}

// Hook for checking if current page is in transition
export function useNavigationTransition() {
  const { navigationState } = useInstantNavigation()
  const pathname = usePathname()
  
  return {
    isTransitioning: navigationState.isTransitioning,
    isCurrentPageTransitioning: navigationState.pendingPath !== pathname && navigationState.isTransitioning,
    pendingPath: navigationState.pendingPath,
    transitionId: navigationState.transitionId
  }
}