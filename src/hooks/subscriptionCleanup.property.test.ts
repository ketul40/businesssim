import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import fc from 'fast-check';
import { useFirestore } from './useFirestore';
import { useOnlineStatus } from './useOnlineStatus';
import { useLocalStorage } from './useLocalStorage';
import { onSnapshot } from 'firebase/firestore';

/**
 * Feature: app-optimization, Property 2: Subscription cleanup on unmount
 * Validates: Requirements 1.3, 7.2, 7.4
 */

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn((...args) => args),
  getDocs: vi.fn(),
  onSnapshot: vi.fn(),
}));

vi.mock('../firebase/config', () => ({
  db: {},
}));

describe('Property 2: Subscription cleanup on unmount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should cleanup Firestore realtime listeners on unmount', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // collection name
        (collectionName) => {
          const mockUnsubscribe = vi.fn();

          vi.mocked(onSnapshot).mockImplementation(() => {
            return mockUnsubscribe;
          });

          const { unmount } = renderHook(() =>
            useFirestore({
              collectionName,
              realtime: true,
            })
          );

          // Unmount the hook
          unmount();

          // Verify unsubscribe was called
          expect(mockUnsubscribe).toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should cleanup window event listeners on unmount', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('online', 'offline'), // event type
        () => {
          const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

          const { unmount } = renderHook(() => useOnlineStatus());

          // Unmount the hook
          unmount();

          // Verify event listeners were removed
          expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
          expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));

          removeEventListenerSpy.mockRestore();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should cleanup localStorage event listeners on unmount', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // storage key
        fc.oneof(fc.string(), fc.integer(), fc.boolean(), fc.object()), // initial value
        (key, initialValue) => {
          const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

          const { unmount } = renderHook(() => useLocalStorage(key, initialValue));

          // Unmount the hook
          unmount();

          // Verify event listeners were removed
          expect(removeEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));
          expect(removeEventListenerSpy).toHaveBeenCalledWith('local-storage', expect.any(Function));

          removeEventListenerSpy.mockRestore();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not leak memory when mounting and unmounting multiple times', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }), // number of mount/unmount cycles
        (cycles) => {
          const mockUnsubscribe = vi.fn();

          vi.mocked(onSnapshot).mockImplementation(() => {
            return mockUnsubscribe;
          });

          // Mount and unmount multiple times
          for (let i = 0; i < cycles; i++) {
            const { unmount } = renderHook(() =>
              useFirestore({
                collectionName: `test-collection-${i}`,
                realtime: true,
              })
            );
            unmount();
          }

          // Verify unsubscribe was called for each mount
          expect(mockUnsubscribe).toHaveBeenCalledTimes(cycles);
        }
      ),
      { numRuns: 100 }
    );
  });
});
