/**
 * Central monitoring module that integrates performance, analytics, and error tracking
 */

import { initPerformanceMonitoring } from './performanceMonitoring';
import { setUserProperties, type UserProperties } from './analytics';

/**
 * Monitoring configuration options
 */
export interface MonitoringConfig {
  enablePerformanceTracking?: boolean;
  enableAnalytics?: boolean;
  enableErrorTracking?: boolean;
  debug?: boolean;
}

/**
 * Default monitoring configuration
 */
const defaultConfig: MonitoringConfig = {
  enablePerformanceTracking: true,
  enableAnalytics: true,
  enableErrorTracking: true,
  debug: import.meta.env.DEV,
};

let isInitialized = false;
let currentConfig: MonitoringConfig = defaultConfig;

/**
 * Initializes all monitoring systems
 * @param config - Optional configuration to override defaults
 */
export function initMonitoring(config?: Partial<MonitoringConfig>): void {
  if (isInitialized) {
    console.warn('[Monitoring] Already initialized');
    return;
  }

  currentConfig = { ...defaultConfig, ...config };

  if (currentConfig.debug) {
    console.log('[Monitoring] Initializing with config:', currentConfig);
  }

  // Initialize performance monitoring
  if (currentConfig.enablePerformanceTracking) {
    initPerformanceMonitoring();
    if (currentConfig.debug) {
      console.log('[Monitoring] Performance tracking enabled');
    }
  }

  // Analytics and error tracking are initialized on-demand
  // when their respective functions are called

  isInitialized = true;
}

/**
 * Sets the current user for monitoring
 * @param userId - The user ID
 * @param properties - Additional user properties
 */
export function setMonitoringUser(
  userId: string,
  properties?: Omit<UserProperties, 'userId'>
): void {
  if (!isInitialized) {
    console.warn('[Monitoring] Not initialized. Call initMonitoring() first.');
    return;
  }

  if (currentConfig.enableAnalytics) {
    setUserProperties({
      userId,
      ...properties,
    });
  }
}

/**
 * Clears the current user from monitoring (e.g., on sign out)
 */
export function clearMonitoringUser(): void {
  if (!isInitialized) {
    return;
  }

  if (currentConfig.enableAnalytics) {
    setUserProperties({
      userId: undefined,
    });
  }
}

/**
 * Gets the current monitoring configuration
 */
export function getMonitoringConfig(): MonitoringConfig {
  return { ...currentConfig };
}

/**
 * Checks if monitoring is initialized
 */
export function isMonitoringInitialized(): boolean {
  return isInitialized;
}

// Re-export commonly used functions for convenience
export {
  measurePerformance,
  measurePerformanceAsync,
  logPerformanceMetric,
  trackWebVitals,
  trackPageLoad,
} from './performanceMonitoring';

export {
  trackUserAction,
  trackPageView,
  simulationAnalytics,
  authAnalytics,
  uiAnalytics,
} from './analytics';

export { logError, logWarning, logInfo } from './errorLogging';
