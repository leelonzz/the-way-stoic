// Performance measurement utilities for journal page optimization
import React from 'react';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceTracker {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = typeof window !== 'undefined' && 'performance' in window;
  }

  // Start tracking a metric
  start(name: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const startTime = performance.now();
    this.metrics.set(name, {
      name,
      startTime,
      metadata
    });

    // Console debugging disabled
    // if (process.env.NODE_ENV === 'development') {
    //   console.log(`🚀 [Performance] Started tracking: ${name}`, metadata);
    // }
  }

  // End tracking a metric
  end(name: string, additionalMetadata?: Record<string, any>): number | null {
    if (!this.isEnabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      // Console debugging disabled
    // if (process.env.NODE_ENV === 'development') {
    //   console.warn(`⚠️ [Performance] Metric not found: ${name}`);
    // }
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;
    
    if (additionalMetadata) {
      metric.metadata = { ...metric.metadata, ...additionalMetadata };
    }

    // Console debugging disabled
    // if (process.env.NODE_ENV === 'development') {
    //   console.log(`✅ [Performance] ${name}: ${duration.toFixed(2)}ms`, metric.metadata);
    // }

    return duration;
  }

  // Get a specific metric
  getMetric(name: string): PerformanceMetric | null {
    return this.metrics.get(name) || null;
  }

  // Get all metrics
  getAllMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  // Clear all metrics
  clear(): void {
    this.metrics.clear();
  }

  // Get performance summary
  getSummary(): {
    totalMetrics: number;
    completedMetrics: number;
    averageDuration: number;
    slowestMetric: PerformanceMetric | null;
    fastestMetric: PerformanceMetric | null;
  } {
    const allMetrics = this.getAllMetrics();
    const completedMetrics = allMetrics.filter(m => m.duration !== undefined);
    
    const durations = completedMetrics.map(m => m.duration!);
    const averageDuration = durations.length > 0 
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
      : 0;

    const slowestMetric = completedMetrics.reduce((slowest, current) => 
      !slowest || (current.duration! > slowest.duration!) ? current : slowest, 
      null as PerformanceMetric | null
    );

    const fastestMetric = completedMetrics.reduce((fastest, current) => 
      !fastest || (current.duration! < fastest.duration!) ? current : fastest, 
      null as PerformanceMetric | null
    );

    return {
      totalMetrics: allMetrics.length,
      completedMetrics: completedMetrics.length,
      averageDuration,
      slowestMetric,
      fastestMetric
    };
  }

  // Log performance summary
  logSummary(): void {
    // Console debugging disabled
    return;

    // if (!this.isEnabled || process.env.NODE_ENV !== 'development') return;

    // const summary = this.getSummary();
    // console.group('📊 Performance Summary');
    // console.log(`Total metrics: ${summary.totalMetrics}`);
    // console.log(`Completed metrics: ${summary.completedMetrics}`);
    // console.log(`Average duration: ${summary.averageDuration.toFixed(2)}ms`);

    // if (summary.slowestMetric) {
    //   console.log(`Slowest: ${summary.slowestMetric.name} (${summary.slowestMetric.duration!.toFixed(2)}ms)`);
    // }

    // if (summary.fastestMetric) {
    //   console.log(`Fastest: ${summary.fastestMetric.name} (${summary.fastestMetric.duration!.toFixed(2)}ms)`);
    // }

    // console.groupEnd();
  }
}

// Global performance tracker instance
export const performanceTracker = new PerformanceTracker();

// Convenience functions for common journal page metrics
export const journalPerformance = {
  // Track page load time
  startPageLoad: () => performanceTracker.start('journal-page-load'),
  endPageLoad: () => performanceTracker.end('journal-page-load'),

  // Track data loading
  startDataLoad: (source: 'localStorage' | 'database' | 'cache') => 
    performanceTracker.start('journal-data-load', { source }),
  endDataLoad: (source: 'localStorage' | 'database' | 'cache', entryCount?: number) => 
    performanceTracker.end('journal-data-load', { source, entryCount }),

  // Track component rendering
  startComponentRender: (component: string) => 
    performanceTracker.start(`journal-render-${component}`),
  endComponentRender: (component: string) => 
    performanceTracker.end(`journal-render-${component}`),

  // Track entry selection
  startEntrySelection: () => performanceTracker.start('journal-entry-selection'),
  endEntrySelection: () => performanceTracker.end('journal-entry-selection'),

  // Track sync operations
  startSync: (type: 'background' | 'manual') => 
    performanceTracker.start('journal-sync', { type }),
  endSync: (type: 'background' | 'manual', success: boolean) => 
    performanceTracker.end('journal-sync', { type, success }),

  // Get journal-specific metrics
  getJournalMetrics: () => {
    const allMetrics = performanceTracker.getAllMetrics();
    return allMetrics.filter(m => m.name.startsWith('journal-'));
  },

  // Log journal performance summary
  logJournalSummary: () => {
    // Console debugging disabled
    return;

    // const journalMetrics = journalPerformance.getJournalMetrics();
    // if (journalMetrics.length === 0) return;

    // console.group('📝 Journal Performance Summary');
    // journalMetrics.forEach(metric => {
    //   if (metric.duration) {
    //     console.log(`${metric.name}: ${metric.duration.toFixed(2)}ms`, metric.metadata);
    //   }
    // });
    // console.groupEnd();
  }
};

// React hook for performance tracking
export function usePerformanceTracking(metricName: string, dependencies: any[] = []) {
  React.useEffect(() => {
    performanceTracker.start(metricName);
    return () => {
      performanceTracker.end(metricName);
    };
  }, dependencies);
}

// Higher-order component for performance tracking (commented out to avoid JSX issues in .ts file)
// Use this pattern in .tsx files if needed:
// export function withPerformanceTracking<P extends object>(
//   WrappedComponent: React.ComponentType<P>,
//   componentName: string
// ) {
//   const WithPerformanceTracking = (props: P) => {
//     React.useEffect(() => {
//       journalPerformance.startComponentRender(componentName);
//       return () => {
//         journalPerformance.endComponentRender(componentName);
//       };
//     }, []);
//
//     return React.createElement(WrappedComponent, props);
//   };
//
//   WithPerformanceTracking.displayName = `withPerformanceTracking(${componentName})`;
//   return WithPerformanceTracking;
// }

// Web Vitals integration (if available)
export function measureWebVitals() {
  if (typeof window === 'undefined') return;

  // Measure Core Web Vitals
  if ('web-vitals' in window) {
    // This would require installing web-vitals package
    // For now, we'll use basic performance API
  }

  // Measure basic metrics
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      // Console debugging disabled - metrics calculation commented out
      // const metrics = {
      //   'DNS Lookup': navigation.domainLookupEnd - navigation.domainLookupStart,
      //   'TCP Connection': navigation.connectEnd - navigation.connectStart,
      //   'Request': navigation.responseStart - navigation.requestStart,
      //   'Response': navigation.responseEnd - navigation.responseStart,
      //   'DOM Processing': navigation.domContentLoadedEventStart - navigation.responseEnd,
      //   'Load Complete': navigation.loadEventEnd - navigation.loadEventStart,
      //   'Total Load Time': navigation.loadEventEnd - navigation.fetchStart
      // };

      // Console debugging disabled
      // console.group('🌐 Web Performance Metrics');
      // Object.entries(metrics).forEach(([name, value]) => {
      //   console.log(`${name}: ${value.toFixed(2)}ms`);
      // });
      // console.groupEnd();
    }
  });
}

// Auto-start web vitals measurement in development - disabled
// if (process.env.NODE_ENV === 'development') {
//   measureWebVitals();
// }
