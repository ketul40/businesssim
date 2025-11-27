/**
 * Performance monitoring utilities for tracking application performance metrics
 */

/**
 * Performance metric entry structure
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: string;
  context?: Record<string, any>;
}

/**
 * Web Vitals metric types
 */
export type WebVitalMetric = 'CLS' | 'FID' | 'LCP' | 'FCP' | 'TTFB' | 'INP';

/**
 * Web Vitals entry structure
 */
export interface WebVitalEntry {
  name: WebVitalMetric;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: string;
}

/**
 * Measures the performance of a synchronous function
 * @param metricName - Name of the metric being measured
 * @param fn - Function to measure
 * @returns The result of the function
 */
export function measurePerformance<T>(
  metricName: string,
  fn: () => T
): T {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  logPerformanceMetric({
    name: metricName,
    value: duration,
    unit: 'ms',
    timestamp: new Date().toISOString(),
  });

  return result;
}

/**
 * Measures the performance of an asynchronous function
 * @param metricName - Name of the metric being measured
 * @param fn - Async function to measure
 * @returns Promise resolving to the result of the function
 */
export async function measurePerformanceAsync<T>(
  metricName: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  logPerformanceMetric({
    name: metricName,
    value: duration,
    unit: 'ms',
    timestamp: new Date().toISOString(),
  });

  return result;
}

/**
 * Logs a performance metric
 * @param metric - The performance metric to log
 */
export function logPerformanceMetric(metric: PerformanceMetric): void {
  if (import.meta.env.DEV) {
    console.log('[Performance]', metric);
  }

  // In production, send to analytics service
  if (import.meta.env.PROD) {
    // TODO: Send to analytics service (e.g., Firebase Analytics, Google Analytics)
    // Example: analytics.logEvent('performance_metric', metric);
  }
}

/**
 * Gets the rating for a Web Vital metric based on thresholds
 */
function getWebVitalRating(
  name: WebVitalMetric,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<WebVitalMetric, { good: number; poor: number }> = {
    CLS: { good: 0.1, poor: 0.25 },
    FID: { good: 100, poor: 300 },
    LCP: { good: 2500, poor: 4000 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
    INP: { good: 200, poor: 500 },
  };

  const threshold = thresholds[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Tracks Web Vitals metrics using the Performance Observer API
 */
export function trackWebVitals(): void {
  // Track Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        
        if (lastEntry) {
          const value = lastEntry.renderTime || lastEntry.loadTime;
          logWebVital({
            name: 'LCP',
            value,
            rating: getWebVitalRating('LCP', value),
            timestamp: new Date().toISOString(),
          });
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      // LCP not supported
    }

    // Track First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          const value = entry.processingStart - entry.startTime;
          logWebVital({
            name: 'FID',
            value,
            rating: getWebVitalRating('FID', value),
            timestamp: new Date().toISOString(),
          });
        });
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      // FID not supported
    }

    // Track Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });

      // Log CLS when page is hidden or unloaded
      const logCLS = () => {
        logWebVital({
          name: 'CLS',
          value: clsValue,
          rating: getWebVitalRating('CLS', clsValue),
          timestamp: new Date().toISOString(),
        });
      };

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          logCLS();
        }
      });
      window.addEventListener('pagehide', logCLS);
    } catch (e) {
      // CLS not supported
    }

    // Track First Contentful Paint (FCP)
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.name === 'first-contentful-paint') {
            logWebVital({
              name: 'FCP',
              value: entry.startTime,
              rating: getWebVitalRating('FCP', entry.startTime),
              timestamp: new Date().toISOString(),
            });
          }
        });
      });
      fcpObserver.observe({ type: 'paint', buffered: true });
    } catch (e) {
      // FCP not supported
    }
  }

  // Track Time to First Byte (TTFB) using Navigation Timing API
  if ('performance' in window && 'getEntriesByType' in performance) {
    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navigationEntries.length > 0) {
      const navEntry = navigationEntries[0];
      if (navEntry) {
        const ttfb = navEntry.responseStart - navEntry.requestStart;
      
        logWebVital({
          name: 'TTFB',
          value: ttfb,
          rating: getWebVitalRating('TTFB', ttfb),
          timestamp: new Date().toISOString(),
        });
      }
    }
  }
}

/**
 * Logs a Web Vital metric
 * @param vital - The Web Vital entry to log
 */
export function logWebVital(vital: WebVitalEntry): void {
  if (import.meta.env.DEV) {
    console.log('[Web Vital]', vital);
  }

  // In production, send to analytics service
  if (import.meta.env.PROD) {
    // TODO: Send to analytics service
    // Example: analytics.logEvent('web_vital', vital);
  }
}

/**
 * Tracks page load performance
 */
export function trackPageLoad(): void {
  if ('performance' in window && 'getEntriesByType' in performance) {
    window.addEventListener('load', () => {
      // Wait a bit for all metrics to be available
      setTimeout(() => {
        const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        
        if (navigationEntries.length > 0) {
          const navEntry = navigationEntries[0];
          
          if (navEntry) {
            // Log various load metrics
            logPerformanceMetric({
              name: 'page_load_time',
              value: navEntry.loadEventEnd - navEntry.fetchStart,
              unit: 'ms',
              timestamp: new Date().toISOString(),
            });

            logPerformanceMetric({
              name: 'dom_content_loaded',
              value: navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
              unit: 'ms',
              timestamp: new Date().toISOString(),
            });

            logPerformanceMetric({
              name: 'dom_interactive',
              value: navEntry.domInteractive - navEntry.fetchStart,
              unit: 'ms',
              timestamp: new Date().toISOString(),
            });
          }
        }
      }, 0);
    });
  }
}

/**
 * Initializes all performance monitoring
 */
export function initPerformanceMonitoring(): void {
  trackWebVitals();
  trackPageLoad();
}
