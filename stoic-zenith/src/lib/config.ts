// Environment detection utilities
export const isProduction = () => {
  if (typeof window === 'undefined') return false;
  return window.location.hostname !== 'localhost' &&
         window.location.hostname !== '127.0.0.1' &&
         !window.location.hostname.includes('localhost');
};

export const isDevelopment = () => !isProduction();

// Production-aware timeout configurations
export const getTimeoutConfig = () => {
  const isProd = isProduction();
  return {
    // Authentication timeouts - longer in production for slower connections
    authTimeout: isProd ? 30000 : 10000, // 30s prod, 10s dev
    sessionTimeout: isProd ? 25000 : 8000, // 25s prod, 8s dev

    // Data loading timeouts - much longer in production
    dataTimeout: isProd ? 30000 : 15000, // 30s prod, 15s dev
    syncTimeout: isProd ? 45000 : 15000, // 45s prod, 15s dev

    // Retry configurations
    maxRetries: isProd ? 3 : 2,
    retryDelay: isProd ? 2000 : 1000,
  };
};

// Connection warming for production
export const warmConnection = async () => {
  if (!isProduction()) return;

  try {
    // Warm up the connection with a simple request
    const response = await fetch('/api/health', {
      method: 'HEAD',
      cache: 'no-cache'
    });
    console.log('🔥 Connection warmed:', response.ok);
  } catch (error) {
    console.warn('⚠️ Connection warming failed:', error);
  }
};

// Production-specific optimizations
export const getProductionOptimizations = () => {
  const isProd = isProduction();
  return {
    // Cache configurations
    cacheThreshold: isProd ? 15 * 60 * 1000 : 10 * 60 * 1000, // 15min prod, 10min dev
    staleTime: isProd ? 20 * 60 * 1000 : 5 * 60 * 1000, // 20min prod, 5min dev
    gcTime: isProd ? 45 * 60 * 1000 : 10 * 60 * 1000, // 45min prod, 10min dev

    // Network optimizations
    keepAlive: isProd,
    prefetchOnIdle: isProd,
    backgroundRefetch: isProd,
  };
};

export const config = {
  appUrl: "/", // Main app URL - adjust as needed
  appName: "The Way Stoic",
  appDescription: "Your daily companion for Stoic wisdom and personal growth"
} as const