import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import fc from 'fast-check';
import { ErrorMessage } from './ErrorMessage';

/**
 * Feature: app-optimization, Property 14: Color-independent information
 * Validates: Requirements 6.4
 * 
 * Property: For any UI element that uses color to convey information (success, error, warning),
 * it should also provide a non-color indicator (icon, text, or pattern)
 */
describe('Property 14: Color-independent information', () => {
  it('error messages include non-color indicators (icons and text)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.constantFrom('error', 'warning', 'info'),
        (message, type) => {
          const { container } = render(
            <ErrorMessage message={message} type={type as 'error' | 'warning' | 'info'} />
          );

          // Check that the error message has a role="alert" for screen readers
          const alertElement = container.querySelector('[role="alert"]');
          expect(alertElement).toBeTruthy();

          // Check that there's an icon (emoji) present
          const iconElement = container.querySelector('span');
          expect(iconElement).toBeTruthy();
          
          // Verify icon content is not empty (contains emoji)
          const iconText = iconElement?.textContent || '';
          expect(iconText.length).toBeGreaterThan(0);
          
          // Verify the message text is present
          const messageElement = container.querySelector('p');
          expect(messageElement).toBeTruthy();
          expect(messageElement?.textContent).toBe(message);

          // The component should not rely solely on background color
          // It should have both icon and text content
          const hasIcon = iconText.length > 0;
          const hasText = (messageElement?.textContent || '').length > 0;
          expect(hasIcon && hasText).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('buttons with only icons have aria-label for non-visual users', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('error', 'warning', 'info'),
        fc.string({ minLength: 1, maxLength: 100 }),
        (type, message) => {
          const mockRetry = () => {};
          const mockDismiss = () => {};

          const { container } = render(
            <ErrorMessage
              message={message}
              type={type as 'error' | 'warning' | 'info'}
              onRetry={mockRetry}
              onDismiss={mockDismiss}
            />
          );

          // All action buttons should have aria-label
          const buttons = container.querySelectorAll('button');
          buttons.forEach((button) => {
            const ariaLabel = button.getAttribute('aria-label');
            expect(ariaLabel).toBeTruthy();
            expect(ariaLabel!.length).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('status indicators combine color with text/icons', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('error', 'warning', 'info'),
        fc.string({ minLength: 1, maxLength: 100 }),
        (type, message) => {
          const { container } = render(
            <ErrorMessage message={message} type={type as 'error' | 'warning' | 'info'} />
          );

          // The component should have:
          // 1. A visual icon (emoji)
          const icon = container.querySelector('span');
          expect(icon?.textContent).toBeTruthy();

          // 2. Text content
          const textContent = container.querySelector('p');
          expect(textContent?.textContent).toBe(message);

          // 3. Semantic role for assistive technology
          const alert = container.querySelector('[role="alert"]');
          expect(alert).toBeTruthy();

          // This ensures information is conveyed through multiple channels,
          // not just color
        }
      ),
      { numRuns: 100 }
    );
  });
});
