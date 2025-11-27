import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { logError, logWarning, ErrorLog } from './errorLogging';

// Mock the analytics module
vi.mock('./analytics', () => ({
  trackError: vi.fn(),
}));

describe('errorLogging', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    vi.clearAllMocks();
  });

  describe('logError', () => {
    /**
     * Feature: app-optimization, Property 9: Error logging context
     * Validates: Requirements 4.3
     * 
     * Property: For any error that is logged, the log entry should include
     * timestamp, error message, stack trace, and relevant application context.
     */
    it('should include all required context in error logs', () => {
      fc.assert(
        fc.property(
          // Generate random error messages
          fc.string({ minLength: 1 }),
          // Generate random context objects
          fc.record({
            userId: fc.option(fc.string(), { nil: undefined }),
            sessionId: fc.option(fc.string(), { nil: undefined }),
            component: fc.option(fc.string(), { nil: undefined }),
            action: fc.option(fc.string(), { nil: undefined }),
          }),
          (errorMessage, context) => {
            // Clear previous calls for this property test iteration
            consoleErrorSpy.mockClear();
            
            const error = new Error(errorMessage);
            
            // Call logError
            logError(error, context);

            // Verify console.error was called
            expect(consoleErrorSpy).toHaveBeenCalled();

            // Get the logged error object (should be the most recent call)
            const callIndex = consoleErrorSpy.mock.calls.length - 1;
            const loggedData = consoleErrorSpy.mock.calls[callIndex];
            expect(loggedData).toBeDefined();
            expect(loggedData.length).toBeGreaterThan(1);

            const errorLog = loggedData[1] as ErrorLog;

            // Property 1: Must include the error object
            expect(errorLog.error).toBeDefined();
            expect(errorLog.error).toBeInstanceOf(Error);
            // The error message should match what we created
            expect(errorLog.error.message).toBe(error.message);

            // Property 2: Must include timestamp in ISO format
            expect(errorLog.timestamp).toBeDefined();
            expect(typeof errorLog.timestamp).toBe('string');
            expect(errorLog.timestamp.length).toBeGreaterThan(0);
            // Verify it's a valid ISO timestamp
            expect(() => new Date(errorLog.timestamp)).not.toThrow();
            expect(new Date(errorLog.timestamp).toISOString()).toBe(errorLog.timestamp);

            // Property 3: Must include userAgent
            expect(errorLog.userAgent).toBeDefined();
            expect(typeof errorLog.userAgent).toBe('string');

            // Property 4: Must include URL
            expect(errorLog.url).toBeDefined();
            expect(typeof errorLog.url).toBe('string');

            // Property 5: Must include stack trace if available
            if (error.stack) {
              expect(errorLog.stackTrace).toBeDefined();
              expect(errorLog.stackTrace).toBe(error.stack);
            }

            // Property 6: Must include provided context
            expect(errorLog.context).toBeDefined();
            expect(typeof errorLog.context).toBe('object');

            // Property 7: Context should include all provided fields
            if (context.userId !== undefined) {
              expect(errorLog.context.userId).toBe(context.userId);
            }
            if (context.sessionId !== undefined) {
              expect(errorLog.context.sessionId).toBe(context.sessionId);
            }
            if (context.component !== undefined) {
              expect(errorLog.context.component).toBe(context.component);
            }
            if (context.action !== undefined) {
              expect(errorLog.context.action).toBe(context.action);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Error logs should work with minimal context
     */
    it('should handle errors with no additional context', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          (errorMessage) => {
            const error = new Error(errorMessage);
            
            // Call logError without context
            logError(error);

            // Verify console.error was called
            expect(consoleErrorSpy).toHaveBeenCalled();

            const loggedData = consoleErrorSpy.mock.calls[0];
            const errorLog = loggedData[1] as ErrorLog;

            // Property: All required fields should still be present
            expect(errorLog.error).toBeDefined();
            expect(errorLog.timestamp).toBeDefined();
            expect(errorLog.userAgent).toBeDefined();
            expect(errorLog.url).toBeDefined();
            expect(errorLog.context).toBeDefined();
            expect(typeof errorLog.context).toBe('object');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Error logs should preserve custom context fields
     */
    it('should preserve custom context fields beyond standard ones', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.dictionary(
            fc.string({ minLength: 1, maxLength: 20 }),
            fc.string({ minLength: 1 }) // Ensure non-empty strings
          ),
          (errorMessage, customContext) => {
            // Clear previous calls for this property test iteration
            consoleErrorSpy.mockClear();
            
            const error = new Error(errorMessage);
            
            // Call logError with custom context
            logError(error, customContext);

            const callIndex = consoleErrorSpy.mock.calls.length - 1;
            const loggedData = consoleErrorSpy.mock.calls[callIndex];
            const errorLog = loggedData[1] as ErrorLog;

            // Property: All custom context fields should be preserved
            for (const [key, value] of Object.entries(customContext)) {
              expect(errorLog.context[key]).toBe(value);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Timestamps should be chronologically ordered for sequential errors
     */
    it('should generate chronologically ordered timestamps for sequential errors', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1 }), { minLength: 2, maxLength: 5 }),
          (errorMessages) => {
            const timestamps: string[] = [];

            // Log multiple errors sequentially
            for (const message of errorMessages) {
              const error = new Error(message);
              logError(error);

              const loggedData = consoleErrorSpy.mock.calls[consoleErrorSpy.mock.calls.length - 1];
              const errorLog = loggedData[1] as ErrorLog;
              timestamps.push(errorLog.timestamp);
            }

            // Property: Timestamps should be in chronological order (or equal if logged in same millisecond)
            for (let i = 1; i < timestamps.length; i++) {
              const prevTimestamp = timestamps[i - 1];
              const currTimestamp = timestamps[i];
              if (prevTimestamp !== undefined && currTimestamp !== undefined) {
                const prevTime = new Date(prevTimestamp).getTime();
                const currTime = new Date(currTimestamp).getTime();
                expect(currTime).toBeGreaterThanOrEqual(prevTime);
              }
            }

            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('logWarning', () => {
    /**
     * Property: Warning logs should include required context
     */
    it('should include timestamp, message, and context in warning logs', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.record({
            userId: fc.option(fc.string(), { nil: undefined }),
            component: fc.option(fc.string(), { nil: undefined }),
          }),
          (warningMessage, context) => {
            logWarning(warningMessage, context);

            // Verify console.warn was called
            expect(consoleWarnSpy).toHaveBeenCalled();

            const loggedData = consoleWarnSpy.mock.calls[0];
            const warningLog = loggedData[1];

            // Property: Must include message (should match what we passed)
            expect(warningLog.message).toBeDefined();
            expect(typeof warningLog.message).toBe('string');

            // Property: Must include timestamp
            expect(warningLog.timestamp).toBeDefined();
            expect(typeof warningLog.timestamp).toBe('string');
            expect(() => new Date(warningLog.timestamp)).not.toThrow();

            // Property: Must include context
            expect(warningLog.context).toBeDefined();
            expect(typeof warningLog.context).toBe('object');

            // Property: Must include URL
            expect(warningLog.url).toBeDefined();
            expect(typeof warningLog.url).toBe('string');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
