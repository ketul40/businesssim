import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  initMonitoring,
  setMonitoringUser,
  clearMonitoringUser,
  getMonitoringConfig,
  isMonitoringInitialized,
  type MonitoringConfig,
} from './monitoring';

// Mock the imported modules
vi.mock('./performanceMonitoring', () => ({
  initPerformanceMonitoring: vi.fn(),
  measurePerformance: vi.fn(),
  measurePerformanceAsync: vi.fn(),
  logPerformanceMetric: vi.fn(),
  trackWebVitals: vi.fn(),
  trackPageLoad: vi.fn(),
}));

vi.mock('./analytics', () => ({
  setUserProperties: vi.fn(),
  trackUserAction: vi.fn(),
  trackPageView: vi.fn(),
  simulationAnalytics: {},
  authAnalytics: {},
  uiAnalytics: {},
}));

vi.mock('./errorLogging', () => ({
  logError: vi.fn(),
  logWarning: vi.fn(),
  logInfo: vi.fn(),
}));

describe('monitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Reset the module state by re-importing
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initMonitoring', () => {
    it('should initialize with default config', async () => {
      const { initMonitoring, isMonitoringInitialized } = await import('./monitoring');
      const { initPerformanceMonitoring } = await import('./performanceMonitoring');

      initMonitoring();

      expect(isMonitoringInitialized()).toBe(true);
      expect(initPerformanceMonitoring).toHaveBeenCalledTimes(1);
    });

    it('should initialize with custom config', async () => {
      const { initMonitoring, getMonitoringConfig } = await import('./monitoring');
      
      const customConfig: Partial<MonitoringConfig> = {
        enablePerformanceTracking: false,
        enableAnalytics: true,
        debug: false,
      };

      initMonitoring(customConfig);

      const config = getMonitoringConfig();
      expect(config.enablePerformanceTracking).toBe(false);
      expect(config.enableAnalytics).toBe(true);
      expect(config.debug).toBe(false);
    });

    it('should not initialize twice', async () => {
      const { initMonitoring } = await import('./monitoring');
      const { initPerformanceMonitoring } = await import('./performanceMonitoring');

      initMonitoring();
      initMonitoring();

      expect(initPerformanceMonitoring).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith('[Monitoring] Already initialized');
    });

    it('should skip performance tracking when disabled', async () => {
      const { initMonitoring } = await import('./monitoring');
      const { initPerformanceMonitoring } = await import('./performanceMonitoring');

      initMonitoring({ enablePerformanceTracking: false });

      expect(initPerformanceMonitoring).not.toHaveBeenCalled();
    });
  });

  describe('setMonitoringUser', () => {
    it('should set user properties when initialized', async () => {
      const { initMonitoring, setMonitoringUser } = await import('./monitoring');
      const { setUserProperties } = await import('./analytics');

      initMonitoring();
      setMonitoringUser('user123', {
        roleLevel: 'manager',
        totalSessions: 10,
      });

      expect(setUserProperties).toHaveBeenCalledWith({
        userId: 'user123',
        roleLevel: 'manager',
        totalSessions: 10,
      });
    });

    it('should warn when not initialized', async () => {
      const { setMonitoringUser } = await import('./monitoring');

      setMonitoringUser('user123');

      expect(console.warn).toHaveBeenCalledWith(
        '[Monitoring] Not initialized. Call initMonitoring() first.'
      );
    });

    it('should handle user without additional properties', async () => {
      const { initMonitoring, setMonitoringUser } = await import('./monitoring');
      const { setUserProperties } = await import('./analytics');

      initMonitoring();
      setMonitoringUser('user123');

      expect(setUserProperties).toHaveBeenCalledWith({
        userId: 'user123',
      });
    });

    it('should not set user when analytics disabled', async () => {
      const { initMonitoring, setMonitoringUser } = await import('./monitoring');
      const { setUserProperties } = await import('./analytics');

      initMonitoring({ enableAnalytics: false });
      setMonitoringUser('user123');

      expect(setUserProperties).not.toHaveBeenCalled();
    });
  });

  describe('clearMonitoringUser', () => {
    it('should clear user properties when initialized', async () => {
      const { initMonitoring, clearMonitoringUser } = await import('./monitoring');
      const { setUserProperties } = await import('./analytics');

      initMonitoring();
      clearMonitoringUser();

      expect(setUserProperties).toHaveBeenCalledWith({
        userId: undefined,
      });
    });

    it('should not throw when not initialized', async () => {
      const { clearMonitoringUser } = await import('./monitoring');

      expect(() => clearMonitoringUser()).not.toThrow();
    });

    it('should not clear user when analytics disabled', async () => {
      const { initMonitoring, clearMonitoringUser } = await import('./monitoring');
      const { setUserProperties } = await import('./analytics');

      initMonitoring({ enableAnalytics: false });
      clearMonitoringUser();

      expect(setUserProperties).not.toHaveBeenCalled();
    });
  });

  describe('getMonitoringConfig', () => {
    it('should return current config', async () => {
      const { initMonitoring, getMonitoringConfig } = await import('./monitoring');

      const customConfig: Partial<MonitoringConfig> = {
        enablePerformanceTracking: false,
        enableAnalytics: true,
        debug: true,
      };

      initMonitoring(customConfig);
      const config = getMonitoringConfig();

      expect(config.enablePerformanceTracking).toBe(false);
      expect(config.enableAnalytics).toBe(true);
      expect(config.debug).toBe(true);
    });

    it('should return a copy of config', async () => {
      const { initMonitoring, getMonitoringConfig } = await import('./monitoring');

      initMonitoring();
      const config1 = getMonitoringConfig();
      const config2 = getMonitoringConfig();

      expect(config1).not.toBe(config2);
      expect(config1).toEqual(config2);
    });
  });

  describe('isMonitoringInitialized', () => {
    it('should return false before initialization', async () => {
      const { isMonitoringInitialized } = await import('./monitoring');

      expect(isMonitoringInitialized()).toBe(false);
    });

    it('should return true after initialization', async () => {
      const { initMonitoring, isMonitoringInitialized } = await import('./monitoring');

      initMonitoring();

      expect(isMonitoringInitialized()).toBe(true);
    });
  });
});
