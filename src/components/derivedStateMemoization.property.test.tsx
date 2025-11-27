import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMemo, useState } from 'react';
import fc from 'fast-check';

/**
 * Feature: app-optimization, Property 17: Derived state memoization
 * Validates: Requirements 8.3
 * 
 * Property: For any expensive computation that derives state from props or state,
 * when the dependencies haven't changed, the computation should not be re-executed
 */

describe('Property 17: Derived state memoization', () => {
  it('useMemo prevents re-computation when dependencies unchanged', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 1, maxLength: 10 }),
        (numbers) => {
          const expensiveComputation = vi.fn((nums: number[]) => {
            return nums.reduce((sum, n) => sum + n, 0);
          });

          const { result, rerender } = renderHook(
            ({ data }) => {
              const sum = useMemo(() => expensiveComputation(data), [data]);
              return { sum };
            },
            { initialProps: { data: numbers } }
          );

          const initialCallCount = expensiveComputation.mock.calls.length;
          expect(initialCallCount).toBe(1);

          // Re-render with same data
          rerender({ data: numbers });

          // Computation should not have been called again
          expect(expensiveComputation.mock.calls.length).toBe(initialCallCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('useMemo re-computes when dependencies change', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 1, maxLength: 5 }),
          fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 1, maxLength: 5 })
        ).filter(([arr1, arr2]) => JSON.stringify(arr1) !== JSON.stringify(arr2)),
        ([numbers1, numbers2]) => {
          const expensiveComputation = vi.fn((nums: number[]) => {
            return nums.reduce((sum, n) => sum + n, 0);
          });

          const { result, rerender } = renderHook(
            ({ data }) => {
              const sum = useMemo(() => expensiveComputation(data), [data]);
              return { sum };
            },
            { initialProps: { data: numbers1 } }
          );

          expect(expensiveComputation.mock.calls.length).toBe(1);

          // Re-render with different data
          rerender({ data: numbers2 });

          // Computation should have been called again
          expect(expensiveComputation.mock.calls.length).toBe(2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('without useMemo, computation runs on every render', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 1, maxLength: 10 }),
        (numbers) => {
          const expensiveComputation = vi.fn((nums: number[]) => {
            return nums.reduce((sum, n) => sum + n, 0);
          });

          const { result, rerender } = renderHook(
            ({ data }) => {
              // No useMemo - computation runs every render
              const sum = expensiveComputation(data);
              return { sum };
            },
            { initialProps: { data: numbers } }
          );

          const initialCallCount = expensiveComputation.mock.calls.length;
          expect(initialCallCount).toBe(1);

          // Re-render with same data
          rerender({ data: numbers });

          // Without memoization, computation runs again
          expect(expensiveComputation.mock.calls.length).toBeGreaterThan(initialCallCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('useMemo with multiple dependencies only re-computes when any dependency changes', () => {
    fc.assert(
      fc.property(
        fc.record({
          multiplier: fc.integer({ min: 1, max: 10 }),
          offset: fc.integer({ min: 0, max: 100 }),
        }),
        (params) => {
          const expensiveComputation = vi.fn((mult: number, off: number) => {
            return mult * 10 + off;
          });

          const { result, rerender } = renderHook(
            ({ multiplier, offset }) => {
              const value = useMemo(
                () => expensiveComputation(multiplier, offset),
                [multiplier, offset]
              );
              return { value };
            },
            { initialProps: params }
          );

          expect(expensiveComputation.mock.calls.length).toBe(1);

          // Re-render with same dependencies
          rerender(params);

          // Should not re-compute
          expect(expensiveComputation.mock.calls.length).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('useMemo with complex objects uses reference equality', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.integer({ min: 1, max: 100 }),
          name: fc.string(),
        }),
        (obj) => {
          const expensiveComputation = vi.fn((data: typeof obj) => {
            return `${data.id}-${data.name}`;
          });

          const { result, rerender } = renderHook(
            ({ data }) => {
              const computed = useMemo(() => expensiveComputation(data), [data]);
              return { computed };
            },
            { initialProps: { data: obj } }
          );

          expect(expensiveComputation.mock.calls.length).toBe(1);

          // Re-render with same object reference
          rerender({ data: obj });

          // Should not re-compute (same reference)
          expect(expensiveComputation.mock.calls.length).toBe(1);

          // Re-render with new object (different reference, same values)
          rerender({ data: { ...obj } });

          // Should re-compute (different reference)
          expect(expensiveComputation.mock.calls.length).toBe(2);
        }
      ),
      { numRuns: 100 }
    );
  });
});
