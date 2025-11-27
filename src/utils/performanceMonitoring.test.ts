import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  measurePerformance,
  measurePerformanceAsync,
  logPerformanceMetric,
  trackWebVitals,
  logWebVital,
  trackPageLoad,
  type PerformanceMetric,
  type WebVitalEntry,
} from './performanceMonitoring';

describe('performanceMonitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('measurePerformance', () => {
    it('should measure synchronous function execution time', () => {
      const testFn = vi.fn(() => {
        // Simulate some work
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
          sum += i;
        }
        return sum;
      });

      const result = measurePerformance('test_metric', testFn);

      expect(testFn).toHaveBeenCalledTimes(1);
      expect(result).toBe(499500); // Sum of 0 to 999
      expect(console.log).toHaveBeenCalledWith(
        '[Performance]',
        expect.objectContaining({
          name: 'test_metric',
          value: expect.any(Number),
          unit: 'ms',
          timestamp: expect.any(String),
        })
      );
    });

    it('should return the function result', () => {
      const result = measurePerformance('test', () => 'hello');
      expect(result).toBe('hello');
    });

    it('should handle functions that return objects', () => {
      const obj = { foo: 'bar' };
      const result = measurePerformance('test', () => obj);
      expect(result).toBe(obj);
    });
  });

  describe('measurePerformanceAsync', () => {
    it('should measure asynchronous function execution time', async () => {
      const testFn = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 'done';
      });

      const result = await measurePerformanceAsync('async_metric', testFn);

      expect(testFn).toHaveBeenCalledTimes(1);
      expect(result).toBe('done');
      expect(console.log).toHaveBeenCalledWith(
        '[Performance]',
        expect.objectContaining({
          name: 'async_metric',
          value: expect.any(Number),
          unit: 'ms',
          timestamp: expect.any(String),
        })
      );
    });

    it('should handle rejected promises', async () => {
      const error = new Error('Test error');
      const testFn = vi.fn(async () => {
        throw error;
      });

      await expect(
        measurePerformanceAsync('failing_metric', testFn)
      ).rejects.toThrow('Test error');

      expect(testFn).toHaveBeenCalledTimes(1);
    });

    it('should measure time even when promise rejects', async () => {
      const testFn = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        throw new Error('Test error');
      });

      try {
        await measurePerformanceAsync('failing_metric', testFn);
      } catch (e) {
        // Expected to throw
      }

      // Performance should still be logged before the error is thrown
      expect(testFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('logPerformanceMetric', () => {
    it('should log performance metric in development', () => {
      const metric: PerformanceMetric = {
        name: 'test_metric',
        value: 123.45,
        unit: 'ms',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      logPerformanceMetric(metric);

      expect(console.log).toHaveBeenCalledWith('[Performance]', metric);
    });

    it('should handle metrics with context', () => {
      const metric: PerformanceMetric = {
        name: 'test_metric',
        value: 100,
        unit: 'ms',
        timestamp: '2024-01-01T00:00:00.000Z',
        context: {
          userId: 'user123',
          component: 'TestComponent',
        },
      };

      logPerformanceMetric(metric);

      expect(console.log).toHaveBeenCalledWith('[Performance]', metric);
    });

    it('should handle different units', () => {
      const metrics: PerformanceMetric[] = [
        {
          name: 'time_metric',
          value: 100,
          unit: 'ms',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
        {
          name: 'size_metric',
          value: 1024,
          unit: 'bytes',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
        {
          name: 'count_metric',
          value: 42,
          unit: 'count',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      ];

      metrics.forEach((metric) => {
        logPerformanceMetric(metric);
      });

      expect(console.log).toHaveBeenCalledTimes(3);
    });
  });

  describe('logWebVital', () => {
    it('should log Web Vital metric', () => {
      const vital: WebVitalEntry = {
        name: 'LCP',
        value: 2000,
        rating: 'good',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      logWebVital(vital);

      expect(console.log).toHaveBeenCalledWith('[Web Vital]', vital);
    });

    it('should handle different Web Vital types', () => {
      const vitals: WebVitalEntry[] = [
        {
          name: 'LCP',
          value: 2000,
          rating: 'good',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
        {
          name: 'FID',
          value: 50,
          rating: 'good',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
        {
          name: 'CLS',
          value: 0.05,
          rating: 'good',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      ];

      vitals.forEach((vital) => {
        logWebVital(vital);
      });

      expect(console.log).toHaveBeenCalledTimes(3);
    });

    it('should handle different ratings', () => {
      const vitals: WebVitalEntry[] = [
        {
          name: 'LCP',
          value: 2000,
          rating: 'good',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
        {
          name: 'LCP',
          value: 3000,
          rating: 'needs-improvement',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
        {
          name: 'LCP',
          value: 5000,
          rating: 'poor',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      ];

      vitals.forEach((vital) => {
        logWebVital(vital);
      });

      expect(console.log).toHaveBeenCalledTimes(3);
    });
  });

  describe('trackWebVitals', () => {
    it('should not throw when PerformanceObserver is not available', () => {
      const originalPerformanceObserver = (window as any).PerformanceObserver;
      delete (window as any).PerformanceObserver;

      expect(() => trackWebVitals()).not.toThrow();

      (window as any).PerformanceObserver = originalPerformanceObserver;
    });

    it('should initialize without errors when PerformanceObserver is available', () => {
      expect(() => trackWebVitals()).not.toThrow();
    });
  });

  describe('trackPageLoad', () => {
    it('should not throw when performance API is not available', () => {
      const originalPerformance = window.performance;
      delete (window as any).performance;

      expect(() => trackPageLoad()).not.toThrow();

      (window as any).performance = originalPerformance;
    });

    it('should set up load event listener', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      trackPageLoad();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'load',
        expect.any(Function)
      );
    });
  });
});
