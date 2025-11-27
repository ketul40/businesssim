import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCallback, useState } from 'react';
import fc from 'fast-check';

/**
 * Feature: app-optimization, Property 3: Stable callback references
 * Validates: Requirements 1.4
 * 
 * Property: For any callback function passed as a prop, when the callback's
 * dependencies haven't changed, the callback reference should remain stable
 * across re-renders
 */

describe('Property 3: Stable callback references', () => {
  it('useCallback returns stable reference when dependencies unchanged', () => {
    fc.assert(
      fc.property(
        fc.record({
          initialValue: fc.integer({ min: 0, max: 1000 }),
          dependency: fc.string(),
        }),
        ({ initialValue, dependency }) => {
          const { result, rerender } = renderHook(
            ({ dep }) => {
              const [count, setCount] = useState(initialValue);
              
              // Callback with dependency
              const callback = useCallback(() => {
                setCount(prev => prev + 1);
                return dep;
              }, [dep]);
              
              return { callback, count };
            },
            { initialProps: { dep: dependency } }
          );

          const firstCallback = result.current.callback;

          // Re-render with same dependency
          rerender({ dep: dependency });

          const secondCallback = result.current.callback;

          // Callback reference should be stable when dependency hasn't changed
          expect(firstCallback).toBe(secondCallback);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('useCallback returns new reference when dependencies change', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.string(),
          fc.string()
        ).filter(([dep1, dep2]) => dep1 !== dep2),
        ([dependency1, dependency2]) => {
          const { result, rerender } = renderHook(
            ({ dep }) => {
              const callback = useCallback(() => {
                return dep;
              }, [dep]);
              
              return { callback };
            },
            { initialProps: { dep: dependency1 } }
          );

          const firstCallback = result.current.callback;

          // Re-render with different dependency
          rerender({ dep: dependency2 });

          const secondCallback = result.current.callback;

          // Callback reference should change when dependency changes
          expect(firstCallback).not.toBe(secondCallback);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('callbacks without dependencies remain stable across all re-renders', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 1, maxLength: 10 }),
        (values) => {
          const { result, rerender } = renderHook(() => {
            const [, setState] = useState(0);
            
            // Callback with no dependencies
            const stableCallback = useCallback(() => {
              return 'stable';
            }, []);
            
            return { stableCallback, setState };
          });

          const initialCallback = result.current.callback;

          // Re-render multiple times
          for (const value of values) {
            result.current.setState(value);
            rerender();
          }

          const finalCallback = result.current.callback;

          // Callback should remain stable across all re-renders
          expect(initialCallback).toBe(finalCallback);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('multiple callbacks with same dependencies share stability', () => {
    fc.assert(
      fc.property(
        fc.record({
          sharedDep: fc.integer({ min: 0, max: 100 }),
          rerenderCount: fc.integer({ min: 1, max: 5 }),
        }),
        ({ sharedDep, rerenderCount }) => {
          const { result, rerender } = renderHook(
            ({ dep }) => {
              const callback1 = useCallback(() => dep * 2, [dep]);
              const callback2 = useCallback(() => dep + 10, [dep]);
              
              return { callback1, callback2 };
            },
            { initialProps: { dep: sharedDep } }
          );

          const initialCallback1 = result.current.callback1;
          const initialCallback2 = result.current.callback2;

          // Re-render multiple times with same dependency
          for (let i = 0; i < rerenderCount; i++) {
            rerender({ dep: sharedDep });
          }

          // Both callbacks should remain stable
          expect(result.current.callback1).toBe(initialCallback1);
          expect(result.current.callback2).toBe(initialCallback2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('callback stability is maintained with complex dependency objects', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.integer({ min: 1, max: 100 }),
          name: fc.string(),
        }),
        (dependency) => {
          const { result, rerender } = renderHook(
            ({ dep }) => {
              // Using primitive dependency (id) for stability
              const callback = useCallback(() => {
                return dep.id;
              }, [dep.id]);
              
              return { callback };
            },
            { initialProps: { dep: dependency } }
          );

          const firstCallback = result.current.callback;

          // Re-render with same dependency values
          rerender({ dep: { ...dependency } });

          const secondCallback = result.current.callback;

          // Callback should be stable when primitive dependency hasn't changed
          expect(firstCallback).toBe(secondCallback);
        }
      ),
      { numRuns: 100 }
    );
  });
});
