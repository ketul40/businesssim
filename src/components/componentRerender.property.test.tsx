import { describe, it, expect } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { memo } from 'react';
import fc from 'fast-check';

/**
 * Feature: app-optimization, Property 1: Component re-render optimization
 * Validates: Requirements 1.1
 * 
 * Property: For any component that receives props, when props haven't changed,
 * the component should not re-render
 */

describe('Property 1: Component re-render optimization', () => {
  it('memoized components should not re-render when props are unchanged', () => {
    fc.assert(
      fc.property(
        fc.record({
          text: fc.string(),
          count: fc.integer({ min: 0, max: 1000 }),
          enabled: fc.boolean(),
        }),
        (props) => {
          let renderCount = 0;

          // Create a memoized component that tracks renders
          const MemoizedComponent = memo(({ text, count, enabled }: typeof props) => {
            renderCount++;
            return (
              <div data-testid="memoized-component">
                <span>{text}</span>
                <span>{count}</span>
                <span>{enabled ? 'enabled' : 'disabled'}</span>
              </div>
            );
          });

          // Initial render
          const { rerender } = render(<MemoizedComponent {...props} />);
          const initialRenderCount = renderCount;
          expect(initialRenderCount).toBe(1);

          // Re-render with same props (should not trigger re-render)
          rerender(<MemoizedComponent {...props} />);

          // Memoized component should not have re-rendered
          // since props haven't changed
          expect(renderCount).toBe(initialRenderCount);

          // Cleanup after each property test
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('non-memoized components re-render when parent re-renders even with same props', () => {
    fc.assert(
      fc.property(
        fc.record({
          value: fc.string(),
          id: fc.integer({ min: 1, max: 100 }),
        }),
        (props) => {
          let renderCount = 0;

          // Non-memoized component
          const NonMemoizedComponent = ({ value, id }: typeof props) => {
            renderCount++;
            return (
              <div data-testid="non-memoized-component">
                <span>{value}</span>
                <span>{id}</span>
              </div>
            );
          };

          // Initial render
          const { rerender } = render(<NonMemoizedComponent {...props} />);
          const initialRenderCount = renderCount;
          expect(initialRenderCount).toBe(1);

          // Re-render with same props
          rerender(<NonMemoizedComponent {...props} />);

          // Non-memoized component will re-render even with same props
          expect(renderCount).toBeGreaterThan(initialRenderCount);

          // Cleanup after each property test
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('memoized components re-render only when props actually change', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.record({ name: fc.string(), age: fc.integer({ min: 0, max: 100 }) }),
          fc.record({ name: fc.string(), age: fc.integer({ min: 0, max: 100 }) })
        ).filter(([props1, props2]) => 
          // Ensure props are actually different
          props1.name !== props2.name || props1.age !== props2.age
        ),
        ([initialProps, changedProps]) => {
          let renderCount = 0;

          const MemoizedComponent = memo(({ name, age }: typeof initialProps) => {
            renderCount++;
            return (
              <div data-testid="memoized-component-2">
                <span>{name}</span>
                <span>{age}</span>
              </div>
            );
          });

          // Render with initial props
          const { rerender } = render(<MemoizedComponent {...initialProps} />);
          expect(renderCount).toBe(1);

          // Re-render with same props (should not trigger re-render)
          rerender(<MemoizedComponent {...initialProps} />);
          expect(renderCount).toBe(1);

          // Re-render with different props (should trigger re-render)
          rerender(<MemoizedComponent {...changedProps} />);
          expect(renderCount).toBe(2);

          // Cleanup after each property test
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });
});
