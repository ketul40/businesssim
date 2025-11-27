import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import fc from 'fast-check';
import { useOnlineStatus } from './useOnlineStatus';

/**
 * Feature: app-optimization, Property 18: Offline state indicators
 * Validates: Requirements 10.1
 */

describe('Property 18: Offline state indicators', () => {
  beforeEach(() => {
    // Reset navigator.onLine to true
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  it('should detect offline state within 2 seconds', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // initial online status
        (initialOnlineStatus) => {
          // Set initial status
          Object.defineProperty(navigator, 'onLine', {
            writable: true,
            value: initialOnlineStatus,
          });

          const { result } = renderHook(() => useOnlineStatus());

          // Verify initial status
          expect(result.current).toBe(initialOnlineStatus);

          // Simulate going offline
          const startTime = Date.now();
          act(() => {
            window.dispatchEvent(new Event('offline'));
          });
          const endTime = Date.now();

          // Verify status changed to offline
          expect(result.current).toBe(false);

          // Verify it happened quickly (within 2 seconds)
          const duration = endTime - startTime;
          expect(duration).toBeLessThan(2000);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should detect online state within 2 seconds', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // initial online status
        (initialOnlineStatus) => {
          // Set initial status
          Object.defineProperty(navigator, 'onLine', {
            writable: true,
            value: initialOnlineStatus,
          });

          const { result } = renderHook(() => useOnlineStatus());

          // Verify initial status
          expect(result.current).toBe(initialOnlineStatus);

          // Simulate going online
          const startTime = Date.now();
          act(() => {
            window.dispatchEvent(new Event('online'));
          });
          const endTime = Date.now();

          // Verify status changed to online
          expect(result.current).toBe(true);

          // Verify it happened quickly (within 2 seconds)
          const duration = endTime - startTime;
          expect(duration).toBeLessThan(2000);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle rapid online/offline transitions correctly', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('online', 'offline'), { minLength: 1, maxLength: 20 }), // sequence of events
        (events) => {
          const { result } = renderHook(() => useOnlineStatus());

          // Apply all events
          events.forEach((event) => {
            act(() => {
              window.dispatchEvent(new Event(event));
            });
          });

          // Final status should match the last event
          const lastEvent = events[events.length - 1];
          const expectedStatus = lastEvent === 'online';
          expect(result.current).toBe(expectedStatus);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain consistent state across multiple status checks', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // target online status
        (targetStatus) => {
          const { result } = renderHook(() => useOnlineStatus());

          // Set the target status
          act(() => {
            const event = targetStatus ? 'online' : 'offline';
            window.dispatchEvent(new Event(event));
          });

          // Check status multiple times - should be consistent
          const status1 = result.current;
          const status2 = result.current;
          const status3 = result.current;

          expect(status1).toBe(targetStatus);
          expect(status2).toBe(targetStatus);
          expect(status3).toBe(targetStatus);
          expect(status1).toBe(status2);
          expect(status2).toBe(status3);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly reflect navigator.onLine initial state', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // initial navigator.onLine value
        (initialOnlineValue) => {
          // Set navigator.onLine before rendering hook
          Object.defineProperty(navigator, 'onLine', {
            writable: true,
            value: initialOnlineValue,
          });

          const { result } = renderHook(() => useOnlineStatus());

          // Hook should reflect the initial navigator.onLine value
          expect(result.current).toBe(initialOnlineValue);
        }
      ),
      { numRuns: 100 }
    );
  });
});
