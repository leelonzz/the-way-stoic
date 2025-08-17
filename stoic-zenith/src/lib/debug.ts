/**
 * Centralized debug logging utility
 * Controls all console output based on environment variables
 */

// Environment variable checks
const isDebugEnabled = (): boolean => {
  if (typeof window === 'undefined') {
    // Server-side: check Node.js environment
    return process.env.NEXT_PUBLIC_DEBUG_ENABLED === 'true'
  }
  
  // Client-side: check both environment and localStorage override
  const envDebug = process.env.NEXT_PUBLIC_DEBUG_ENABLED === 'true'
  const localDebug = localStorage.getItem('debug-enabled') === 'true'
  
  return envDebug || localDebug
}

const isAuthDebugEnabled = (): boolean => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true'
  }
  
  const envDebug = process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true'
  const localDebug = localStorage.getItem('debug-auth') === 'true'
  
  return envDebug || localDebug
}

const isJournalDebugEnabled = (): boolean => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_DEBUG_JOURNAL === 'true'
  }
  
  const envDebug = process.env.NEXT_PUBLIC_DEBUG_JOURNAL === 'true'
  const localDebug = localStorage.getItem('debug-journal') === 'true'
  
  return envDebug || localDebug
}

const isPerformanceDebugEnabled = (): boolean => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_DEBUG_PERFORMANCE === 'true'
  }
  
  const envDebug = process.env.NEXT_PUBLIC_DEBUG_PERFORMANCE === 'true'
  const localDebug = localStorage.getItem('debug-performance') === 'true'
  
  return envDebug || localDebug
}

// Debug logging functions
export const debugLog = {
  // General debug logging
  log: (message: string, ...args: unknown[]): void => {
    if (isDebugEnabled()) {
      console.log(message, ...args)
    }
  },
  
  warn: (message: string, ...args: unknown[]): void => {
    if (isDebugEnabled()) {
      console.warn(message, ...args)
    }
  },
  
  error: (message: string, ...args: unknown[]): void => {
    if (isDebugEnabled()) {
      console.error(message, ...args)
    }
  },
  
  group: (label: string): void => {
    if (isDebugEnabled()) {
      console.group(label)
    }
  },
  
  groupEnd: (): void => {
    if (isDebugEnabled()) {
      console.groupEnd()
    }
  },
  
  // Authentication debug logging
  auth: {
    log: (message: string, ...args: unknown[]): void => {
      if (isAuthDebugEnabled()) {
        console.log(`🔐 ${message}`, ...args)
      }
    },
    
    warn: (message: string, ...args: unknown[]): void => {
      if (isAuthDebugEnabled()) {
        console.warn(`🔐 ${message}`, ...args)
      }
    },
    
    error: (message: string, ...args: unknown[]): void => {
      if (isAuthDebugEnabled()) {
        console.error(`🔐 ${message}`, ...args)
      }
    }
  },
  
  // Journal debug logging
  journal: {
    log: (message: string, ...args: unknown[]): void => {
      if (isJournalDebugEnabled()) {
        console.log(`📝 ${message}`, ...args)
      }
    },
    
    warn: (message: string, ...args: unknown[]): void => {
      if (isJournalDebugEnabled()) {
        console.warn(`📝 ${message}`, ...args)
      }
    },
    
    error: (message: string, ...args: unknown[]): void => {
      if (isJournalDebugEnabled()) {
        console.error(`📝 ${message}`, ...args)
      }
    }
  },
  
  // Performance debug logging
  performance: {
    log: (message: string, ...args: unknown[]): void => {
      if (isPerformanceDebugEnabled()) {
        console.log(`⚡ ${message}`, ...args)
      }
    },
    
    warn: (message: string, ...args: unknown[]): void => {
      if (isPerformanceDebugEnabled()) {
        console.warn(`⚡ ${message}`, ...args)
      }
    },
    
    error: (message: string, ...args: unknown[]): void => {
      if (isPerformanceDebugEnabled()) {
        console.error(`⚡ ${message}`, ...args)
      }
    },
    
    group: (label: string): void => {
      if (isPerformanceDebugEnabled()) {
        console.group(`📊 ${label}`)
      }
    },
    
    groupEnd: (): void => {
      if (isPerformanceDebugEnabled()) {
        console.groupEnd()
      }
    }
  }
}

// Utility functions for runtime debug control
export const debugControl = {
  // Enable/disable debug categories at runtime
  setDebugEnabled: (enabled: boolean): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('debug-enabled', enabled.toString())
    }
  },
  
  setAuthDebugEnabled: (enabled: boolean): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('debug-auth', enabled.toString())
    }
  },
  
  setJournalDebugEnabled: (enabled: boolean): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('debug-journal', enabled.toString())
    }
  },
  
  setPerformanceDebugEnabled: (enabled: boolean): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('debug-performance', enabled.toString())
    }
  },
  
  // Get current debug status
  getDebugStatus: () => ({
    general: isDebugEnabled(),
    auth: isAuthDebugEnabled(),
    journal: isJournalDebugEnabled(),
    performance: isPerformanceDebugEnabled()
  }),
  
  // Clear all debug settings
  clearDebugSettings: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('debug-enabled')
      localStorage.removeItem('debug-auth')
      localStorage.removeItem('debug-journal')
      localStorage.removeItem('debug-performance')
    }
  }
}

// Export for backward compatibility
export default debugLog
