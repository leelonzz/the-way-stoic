import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface TabVisibilityState {
  isVisible: boolean;
  lastVisibilityChange: number;
  wasHiddenDuration: number;
}

interface TabVisibilityCallbacks {
  onVisible?: (state: TabVisibilityState) => void | Promise<void>;
  onHidden?: (state: TabVisibilityState) => void | Promise<void>;
  onNavigationReturn?: (state: TabVisibilityState) => void | Promise<void>;
}

interface UseTabVisibilityOptions {
  refreshThreshold?: number; // milliseconds
  enableLogging?: boolean;
  trackNavigation?: boolean; // Track SPA navigation
}

interface UseTabVisibilityReturn extends TabVisibilityState {
  registerCallbacks: (id: string, callbacks: TabVisibilityCallbacks) => void;
  unregisterCallbacks: (id: string) => void;
  shouldRefresh: (lastRefreshTime: number) => boolean;
}

// Global state to ensure single event listener
let globalVisibilityState: TabVisibilityState = {
  isVisible: typeof document !== 'undefined' ? !document.hidden : true,
  lastVisibilityChange: Date.now(),
  wasHiddenDuration: 0
};

// Global navigation tracking state
const globalNavigationState = {
  lastPathname: '',
  lastNavigationTime: Date.now(),
  isNavigationReturn: false
};

const globalCallbacks = new Map<string, TabVisibilityCallbacks>();
let globalListenerAttached = false;
let hiddenStartTime: number | null = null;

const handleGlobalVisibilityChange = async (): Promise<void> => {
  if (typeof document === 'undefined') return;
  
  const wasVisible = globalVisibilityState.isVisible;
  const isVisible = !document.hidden;
  const now = Date.now();

  // Calculate how long the tab was hidden
  let wasHiddenDuration = 0;
  if (!isVisible && wasVisible) {
    // Tab became hidden - start tracking
    hiddenStartTime = now;
    wasHiddenDuration = 0;
  } else if (isVisible && !wasVisible && hiddenStartTime) {
    // Tab became visible - calculate actual hidden duration
    wasHiddenDuration = now - hiddenStartTime;
    hiddenStartTime = null;
  }

  globalVisibilityState = {
    isVisible,
    lastVisibilityChange: now,
    wasHiddenDuration
  };


  // Execute callbacks based on visibility change
  const callbackPromises: Promise<void>[] = [];
  
  for (const [id, callbacks] of globalCallbacks.entries()) {
    try {
      if (isVisible && !wasVisible && callbacks.onVisible) {
        const result = callbacks.onVisible(globalVisibilityState);
        if (result instanceof Promise) {
          callbackPromises.push(result);
        }
      } else if (!isVisible && wasVisible && callbacks.onHidden) {
        const result = callbacks.onHidden(globalVisibilityState);
        if (result instanceof Promise) {
          callbackPromises.push(result);
        }
      }
    } catch (error) {
      console.error(`❌ [TabVisibility] Error in callback for ${id}:`, error);
    }
  }

  // Wait for all async callbacks to complete
  if (callbackPromises.length > 0) {
    try {
      await Promise.all(callbackPromises);
      console.log(`✅ [TabVisibility] All ${callbackPromises.length} callbacks completed`);
    } catch (error) {
      console.error('❌ [TabVisibility] Error in async callbacks:', error);
    }
  }
};

const attachGlobalListener = (): void => {
  if (typeof document === 'undefined') return;
  
  if (!globalListenerAttached) {
    document.addEventListener('visibilitychange', handleGlobalVisibilityChange);
    globalListenerAttached = true;
  }
};

const detachGlobalListener = (): void => {
  if (typeof document === 'undefined') return;

  if (globalListenerAttached && globalCallbacks.size === 0) {
    document.removeEventListener('visibilitychange', handleGlobalVisibilityChange);
    globalListenerAttached = false;
  }
};

// Handle navigation changes for SPA routing
const handleNavigationChange = async (pathname: string): Promise<void> => {
  const now = Date.now();
  const wasOnDifferentPage = globalNavigationState.lastPathname !== '' &&
                            globalNavigationState.lastPathname !== pathname;

  if (wasOnDifferentPage) {
    // User returned to this page from a different page
    const timeSinceLastNavigation = now - globalNavigationState.lastNavigationTime;


    // Create a synthetic visibility state for navigation return
    const syntheticState: TabVisibilityState = {
      isVisible: true,
      lastVisibilityChange: now,
      wasHiddenDuration: timeSinceLastNavigation
    };

    // Trigger onNavigationReturn callbacks
    for (const [id, callbacks] of globalCallbacks.entries()) {
      if (callbacks.onNavigationReturn) {
        try {
          await callbacks.onNavigationReturn(syntheticState);
        } catch (error) {
          console.error(`[TabVisibility] Error in onNavigationReturn callback for ${id}:`, error);
        }
      }
    }
  }

  globalNavigationState.lastPathname = pathname;
  globalNavigationState.lastNavigationTime = now;
};

export function useTabVisibility(
  options: UseTabVisibilityOptions = {}
): UseTabVisibilityReturn {
  const { refreshThreshold = 2000, enableLogging = true, trackNavigation = true } = options;
  const [state, setState] = useState<TabVisibilityState>(globalVisibilityState);
  const callbackIdRef = useRef<string>(`tab-visibility-${Date.now()}-${Math.random()}`);
  const pathname = usePathname();
  const lastPathnameRef = useRef<string>('');

  // Track navigation changes
  useEffect(() => {
    if (trackNavigation && pathname !== lastPathnameRef.current) {
      handleNavigationChange(pathname);
      lastPathnameRef.current = pathname;
    }
  }, [pathname, trackNavigation]);

  // Update local state when global state changes
  useEffect(() => {
    setState({ ...globalVisibilityState });

    const syncInterval = setInterval(() => {
      setState(prevState => {
        if (prevState.isVisible !== globalVisibilityState.isVisible ||
            prevState.lastVisibilityChange !== globalVisibilityState.lastVisibilityChange ||
            prevState.wasHiddenDuration !== globalVisibilityState.wasHiddenDuration) {
          return { ...globalVisibilityState };
        }
        return prevState;
      });
    }, 100);

    return () => {
      clearInterval(syncInterval);
    };
  }, []);

  const registerCallbacks = useCallback((id: string, callbacks: TabVisibilityCallbacks): void => {
    globalCallbacks.set(id, callbacks);
    attachGlobalListener();
    
    if (enableLogging) {
    }
  }, [enableLogging]);

  const unregisterCallbacks = useCallback((id: string): void => {
    globalCallbacks.delete(id);
    
    if (enableLogging) {
    }
    
    detachGlobalListener();
  }, [enableLogging]);

  const shouldRefresh = useCallback((lastRefreshTime: number): boolean => {
    const timeSinceLastRefresh = Date.now() - lastRefreshTime;
    const timeSinceVisibilityChange = Date.now() - state.lastVisibilityChange;

    // Simplified refresh logic:
    // 1. Tab just became visible AND was hidden for more than 1 second
    // 2. It's been more than the threshold since last refresh
    const justBecameVisible = state.isVisible && timeSinceVisibilityChange < 3000;
    const wasActuallyHidden = state.wasHiddenDuration > 30000; // At least 30 seconds
    const timeThresholdExceeded = timeSinceLastRefresh > refreshThreshold;

    const shouldRefreshNow = (justBecameVisible && wasActuallyHidden) || timeThresholdExceeded;


    return shouldRefreshNow;
  }, [state, refreshThreshold]);

  // Cleanup on unmount
  useEffect(() => {
    const callbackId = callbackIdRef.current;
    
    return () => {
      unregisterCallbacks(callbackId);
    };
  }, [unregisterCallbacks]);

  return {
    ...state,
    registerCallbacks,
    unregisterCallbacks,
    shouldRefresh
  };
}

export default useTabVisibility;
