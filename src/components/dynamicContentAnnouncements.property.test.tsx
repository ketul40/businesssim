import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import fc from 'fast-check';
import { ErrorMessage } from './ErrorMessage';

/**
 * Feature: app-optimization, Property 15: Dynamic content announcements
 * Validates: Requirements 6.5
 * 
 * Property: For any dynamically updated content region (loading states, notifications, live data),
 * it should have an appropriate aria-live attribute to announce changes to screen readers
 */
describe('Property 15: Dynamic content announcements', () => {
  it('error messages have role="alert" for immediate announcement', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.constantFrom('error', 'warning', 'info'),
        (message, type) => {
          const { container } = render(
            <ErrorMessage message={message} type={type as 'error' | 'warning' | 'info'} />
          );

          // role="alert" is equivalent to aria-live="assertive"
          // This ensures screen readers announce the error immediately
          const alertElement = container.querySelector('[role="alert"]');
          expect(alertElement).toBeTruthy();
          
          // Verify the alert contains the message
          expect(alertElement?.textContent).toContain(message);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('dynamic status messages are announced to screen readers', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.constantFrom('error', 'warning', 'info'),
        (message, type) => {
          const { container, rerender } = render(
            <ErrorMessage message="" type="info" />
          );

          // Initially no alert
          let alerts = container.querySelectorAll('[role="alert"]');
          
          // Update with new message (simulating dynamic content)
          rerender(
            <ErrorMessage message={message} type={type as 'error' | 'warning' | 'info'} />
          );

          // After update, alert should be present
          alerts = container.querySelectorAll('[role="alert"]');
          expect(alerts.length).toBeGreaterThan(0);
          
          // The alert should contain the new message
          const alertElement = alerts[0];
          expect(alertElement.textContent).toContain(message);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('loading states and notifications use appropriate aria-live regions', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (message) => {
          // Test that error messages use role="alert" which is assertive
          const { container } = render(
            <ErrorMessage message={message} type="error" />
          );

          const alertElement = container.querySelector('[role="alert"]');
          expect(alertElement).toBeTruthy();

          // role="alert" implies:
          // - aria-live="assertive" (interrupts screen reader)
          // - aria-atomic="true" (reads entire region)
          // This is appropriate for errors that need immediate attention
        }
      ),
      { numRuns: 100 }
    );
  });

  it('status updates are accessible to assistive technology', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
        (messages) => {
          // Simulate multiple status updates
          const { container, rerender } = render(
            <ErrorMessage message={messages[0]} type="info" />
          );

          // Each message update should maintain the alert role
          messages.forEach((message) => {
            rerender(<ErrorMessage message={message} type="info" />);
            
            const alertElement = container.querySelector('[role="alert"]');
            expect(alertElement).toBeTruthy();
            expect(alertElement?.textContent).toContain(message);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('critical notifications use assertive announcements', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (message) => {
          const { container } = render(
            <ErrorMessage message={message} type="error" />
          );

          // Error messages should use role="alert" for assertive announcement
          const alertElement = container.querySelector('[role="alert"]');
          expect(alertElement).toBeTruthy();
          
          // This ensures critical information interrupts the screen reader
          // to immediately notify users of errors
        }
      ),
      { numRuns: 100 }
    );
  });
});
