// Debug utility for monitoring data persistence issues

interface DebugInfo {
  timestamp: string;
  user: string | null;
  profileLoaded: boolean;
  preferencesLoaded: boolean;
  cacheHit: boolean;
  localStorageHit: boolean;
  errors: string[];
}

class DebugLogger {
  private logs: DebugInfo[] = [];
  private maxLogs = 50;

  log(info: Omit<DebugInfo, 'timestamp'>) {
    const logEntry: DebugInfo = {
      ...info,
      timestamp: new Date().toISOString(),
    };

    this.logs.unshift(logEntry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔍 Debug: ${logEntry.timestamp}`);
      console.log('User:', logEntry.user);
      console.log('Profile loaded:', logEntry.profileLoaded);
      console.log('Preferences loaded:', logEntry.preferencesLoaded);
      console.log('Cache hit:', logEntry.cacheHit);
      console.log('LocalStorage hit:', logEntry.localStorageHit);
      if (logEntry.errors.length > 0) {
        console.error('Errors:', logEntry.errors);
      }
      console.groupEnd();
    }
  }

  getLogs(): DebugInfo[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  // Check if there are persistent issues
  hasPersistentIssues(): boolean {
    const recentLogs = this.logs.slice(0, 10); // Last 10 logs
    const errorCount = recentLogs.filter(log => log.errors.length > 0).length;
    const successCount = recentLogs.filter(log => 
      log.profileLoaded && log.preferencesLoaded && log.errors.length === 0
    ).length;
    
    return errorCount > successCount;
  }
}

export const debugLogger = new DebugLogger();

// Utility to check if data is being lost
export const checkDataPersistence = (userId: string | null) => {
  if (!userId) return;

  const profileCache = localStorage.getItem(`profile_${userId}`);
  const preferencesCache = localStorage.getItem(`life_calendar_prefs_${userId}`);
  
  debugLogger.log({
    user: userId,
    profileLoaded: !!profileCache,
    preferencesLoaded: !!preferencesCache,
    cacheHit: false, // Will be set by individual hooks
    localStorageHit: !!(profileCache || preferencesCache),
    errors: [],
  });
};

// Export for use in components
export default debugLogger; 