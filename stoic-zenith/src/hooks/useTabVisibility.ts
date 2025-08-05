import { useState, useEffect, useCallback, useRef } from 'react';

interface TabVisibilityState {
  isVisible: boolean;
  lastVisibilityChange: number;
  wasHiddenDuration: number;
}

interface TabVisibilityCallbacks {
  onVisible?: (state: TabVisibilityState) => void | Promise<void>;
  onHidden?: (state: TabVisibilityState) => void | Promise<void>;
}

interface UseTabVisibilityOptions {
  refreshThreshold?: number; // milliseconds
  enableLogging?: boolean;
}

interface UseTabVisibilityReturn extends TabVisibilityState {
  registerCallbacks: (id: string, callbacks: TabVisibilityCallbacks) => void;
  unregisterCallbacks: (id: string) => void;
  shouldRefresh: (lastRefreshTime: number) => boolean;
}

// Global state to ensure single event listener
let globalVisibilityState: TabVisibilityState = {
  isVisible: !document.hidden,
  lastVisibilityChange: Date.now(),
  wasHiddenDuration: 0
};

let globalCallbacks = new Map<string, TabVisibilityCallbacks>();
let globalListenerAttached = false;
let hiddenStartTime: number | null = null;

const handleGlobalVisibilityChange = async (): Promise<void> => {
  const wasVisible = globalVisibilityState.isVisible;
  const isVisible = !document.hidden;
  const now = Date.now();

  // Calculate how long the tab was hidden
  let wasHiddenDuration = 0;
  if (!isVisible && wasVisible) {
    // Tab became hidden - reset duration and start tracking
    hiddenStartTime = now;
    wasHiddenDuration = 0; // Reset to 0 when becoming hidden
  } else if (isVisible && !wasVisible && hiddenStartTime) {
    // Tab became visible - calculate actual hidden duration
    wasHiddenDuration = now - hiddenStartTime;
    hiddenStartTime = null;
  } else if (isVisible && wasVisible) {
    // Tab was already visible - reset duration to 0
    wasHiddenDuration = 0;
  }

  globalVisibilityState = {
    isVisible,
    lastVisibilityChange: now,
    wasHiddenDuration
  };

  console.log('🔍 [TabVisibility] Global visibility change:', {
    wasVisible,
    isVisible,
    wasHiddenDuration: Math.round(wasHiddenDuration / 1000),
    callbacksCount: globalCallbacks.size,
    hiddenStartTime,
    changeType: !isVisible && wasVisible ? 'BECAME_HIDDEN' :
                isVisible && !wasVisible ? 'BECAME_VISIBLE' :
                'NO_CHANGE'
  });

  // Execute callbacks based on visibility change
  const callbackPromises: Promise<void>[] = [];
  
  for (const [id, callbacks] of globalCallbacks.entries()) {
    try {
      if (isVisible && !wasVisible && callbacks.onVisible) {
        console.log(`🔍 [TabVisibility] Executing onVisible callback for: ${id}`);
        const result = callbacks.onVisible(globalVisibilityState);
        if (result instanceof Promise) {
          callbackPromises.push(result);
        }
      } else if (!isVisible && wasVisible && callbacks.onHidden) {
        console.log(`🔍 [TabVisibility] Executing onHidden callback for: ${id}`);
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
      console.log(`✅ [TabVisibility] All ${callbackPromises.length} async callbacks completed`);

      // Note: wasHiddenDuration is NOT reset here anymore - it will be reset
      // by the next visibility change or when callbacks need to check it again.
      // This allows shouldRefresh to work correctly on subsequent tab switches.
    } catch (error) {
      console.error('❌ [TabVisibility] Error in async callbacks:', error);
    }
  }
};

const attachGlobalListener = (): void => {
  if (!globalListenerAttached) {
    document.addEventListener('visibilitychange', handleGlobalVisibilityChange);
    globalListenerAttached = true;
    console.log('🔍 [TabVisibility] Global listener attached');
  }
};

const detachGlobalListener = (): void => {
  if (globalListenerAttached && globalCallbacks.size === 0) {
    document.removeEventListener('visibilitychange', handleGlobalVisibilityChange);
    globalListenerAttached = false;
    console.log('🔍 [TabVisibility] Global listener detached');
  }
};

export function useTabVisibility(
  options: UseTabVisibilityOptions = {}
): UseTabVisibilityReturn {
  const { refreshThreshold = 2000, enableLogging = true } = options; // Default 2 seconds
  const [state, setState] = useState<TabVisibilityState>(globalVisibilityState);
  const callbackIdRef = useRef<string>(`tab-visibility-${Date.now()}-${Math.random()}`);

  // Update local state when global state changes - simplified approach
  useEffect(() => {
    // Update local state immediately
    setState({ ...globalVisibilityState });

    // Set up interval to sync state regularly (as backup)
    const syncInterval = setInterval(() => {
      setState(prevState => {
        // Only update if state actually changed
        if (prevState.isVisible !== globalVisibilityState.isVisible ||
            prevState.lastVisibilityChange !== globalVisibilityState.lastVisibilityChange ||
            prevState.wasHiddenDuration !== globalVisibilityState.wasHiddenDuration) {
          return { ...globalVisibilityState };
        }
        return prevState;
      });
    }, 100); // Check every 100ms

    return () => {
      clearInterval(syncInterval);
    };
  }, []);

  const registerCallbacks = useCallback((id: string, callbacks: TabVisibilityCallbacks): void => {
    globalCallbacks.set(id, callbacks);
    attachGlobalListener();
    
    if (enableLogging) {
      console.log(`🔍 [TabVisibility] Registered callbacks for: ${id}`);
    }
  }, [enableLogging]);

  const unregisterCallbacks = useCallback((id: string): void => {
    globalCallbacks.delete(id);
    
    if (enableLogging) {
      console.log(`🔍 [TabVisibility] Unregistered callbacks for: ${id}`);
    }
    
    detachGlobalListener();
  }, [enableLogging]);

  const shouldRefresh = useCallback((lastRefreshTime: number): boolean => {
    const timeSinceLastRefresh = Date.now() - lastRefreshTime;
    const timeSinceVisibilityChange = Date.now() - state.lastVisibilityChange;

    // Refresh if:
    // 1. Tab just became visible (within last 3 seconds) AND was hidden for any duration
    // 2. It's been more than the threshold since last refresh
    const justBecameVisible = state.isVisible && timeSinceVisibilityChange < 3000;
    const wasActuallyHidden = state.wasHiddenDuration > 0;
    const timeThresholdExceeded = timeSinceLastRefresh > refreshThreshold;

    const shouldRefreshNow = (justBecameVisible && wasActuallyHidden) || timeThresholdExceeded;

    console.log('🔍 [TabVisibility] shouldRefresh check:', {
      justBecameVisible,
      wasActuallyHidden,
      timeThresholdExceeded,
      shouldRefreshNow,
      wasHiddenDuration: state.wasHiddenDuration,
      timeSinceVisibilityChange: Math.round(timeSinceVisibilityChange / 1000),
      timeSinceLastRefresh: Math.round(timeSinceLastRefresh / 1000)
    });

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
