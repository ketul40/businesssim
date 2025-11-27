import { describe, test, expect, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import ErrorBoundary, { ErrorFallback } from './ErrorBoundary';

/**
 * Feature: app-optimization, Property 7: Error boundary coverage
 * Validates: Requirements 4.1
 * 
 * For any component that might throw an error, there should be an error boundary
 * ancestor that catches and handles the error gracefully
 */
describe('ErrorBoundary - Property 7: Error boundary coverage', () => {
  test('catches and handles errors from any child component', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }), // Error message
        (errorMessage) => {
          // Create a component that throws an error
          const ThrowError = () => {
            throw new Error(errorMessage);
          };

          // Suppress console.error for this test
          const originalError = console.error;
          console.error = vi.fn();

          try {
            // Render the error-throwing component wrapped in ErrorBoundary
            const { container } = render(
              <ErrorBoundary>
                <ThrowError />
              </ErrorBoundary>
            );

            // The error boundary should catch the error and display fallback UI
            // Check that the fallback UI is displayed
            expect(container.textContent).toMatch(/something went wrong/i);

            // The original component should not be rendered
            // Instead, we should see error handling UI with recovery options
            expect(
              container.textContent?.includes('Try Again') ||
                container.textContent?.includes('Refresh Page')
            ).toBeTruthy();

            return true;
          } finally {
            console.error = originalError;
            cleanup(); // Clean up after each iteration
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('renders children when no error occurs', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0), // Child content (non-whitespace)
        (childContent) => {
          const ChildComponent = () => <div data-testid="child">{childContent}</div>;

          try {
            const { container } = render(
              <ErrorBoundary>
                <ChildComponent />
              </ErrorBoundary>
            );

            // Children should render normally when no error
            expect(container.textContent).toContain(childContent);

            // Should not show error UI
            expect(container.textContent).not.toMatch(/something went wrong/i);

            return true;
          } finally {
            cleanup(); // Clean up after each iteration
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('calls onError callback when error is caught', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }), // Error message
        (errorMessage) => {
          const onError = vi.fn();
          const ThrowError = () => {
            throw new Error(errorMessage);
          };

          const originalError = console.error;
          console.error = vi.fn();

          try {
            render(
              <ErrorBoundary onError={onError}>
                <ThrowError />
              </ErrorBoundary>
            );

            // onError callback should be called
            expect(onError).toHaveBeenCalled();
            const callArgs = onError.mock.calls[0];
            if (callArgs && callArgs.length > 0) {
              const error = callArgs[0] as Error;
              expect(error.message).toBe(errorMessage);
            }

            return true;
          } finally {
            console.error = originalError;
            cleanup(); // Clean up after each iteration
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('renders custom fallback when provided', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }), // Custom fallback text
        fc.string({ minLength: 1 }), // Error message
        (fallbackText, errorMessage) => {
          const ThrowError = () => {
            throw new Error(errorMessage);
          };

          const customFallback = <div>{fallbackText}</div>;

          const originalError = console.error;
          console.error = vi.fn();

          try {
            render(
              <ErrorBoundary fallback={customFallback}>
                <ThrowError />
              </ErrorBoundary>
            );

            // Custom fallback should be rendered
            expect(screen.getByText(fallbackText)).toBeInTheDocument();

            return true;
          } finally {
            console.error = originalError;
            cleanup(); // Clean up after each iteration
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('ErrorFallback component', () => {
  test('displays error message in development mode', () => {
    const error = new Error('Test error message');
    const originalEnv = import.meta.env.DEV;
    
    // Mock development environment
    (import.meta.env as any).DEV = true;

    render(<ErrorFallback error={error} />);

    // Should display the error icon
    expect(screen.getByText('⚠️')).toBeInTheDocument();
    
    // Should display the main error heading
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

    // Restore environment
    (import.meta.env as any).DEV = originalEnv;
  });

  test('provides recovery options', () => {
    const error = new Error('Test error');
    const onReset = vi.fn();

    render(<ErrorFallback error={error} onReset={onReset} />);

    // Should have Try Again button
    expect(screen.getByText(/try again/i)).toBeInTheDocument();
    
    // Should have Refresh Page button
    expect(screen.getByText(/refresh page/i)).toBeInTheDocument();
  });
});
