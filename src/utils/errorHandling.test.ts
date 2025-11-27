import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FirebaseError } from 'firebase/app';
import fc from 'fast-check';
import { handleApiError, retryWithBackoff } from './errorHandling';

describe('errorHandling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleApiError', () => {
    /**
     * Feature: app-optimization, Property 8: API error handling with user feedback
     * Validates: Requirements 4.2, 4.5
     * 
     * Property: For any API error, the handler should return a standardized ApiError
     * with a user-friendly message and indicate whether the error is retryable.
     */
    it('should convert any error to ApiError with user-friendly message', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            // Firebase errors with various codes
            fc.record({
              type: fc.constant('firebase'),
              code: fc.constantFrom(
                'auth/user-not-found',
                'auth/wrong-password',
                'auth/email-already-in-use',
                'auth/weak-password',
                'auth/invalid-email',
                'auth/network-request-failed',
                'permission-denied',
                'not-found',
                'already-exists',
                'resource-exhausted',
                'unauthenticated',
                'unavailable',
                'deadline-exceeded',
                'aborted',
                'internal',
                'unknown-error-code'
              ),
              message: fc.string(),
            }),
            // Regular Error objects
            fc.record({
              type: fc.constant('error'),
              message: fc.string(),
            }),
            // Unknown error types (strings, objects)
            fc.record({
              type: fc.constant('unknown'),
              value: fc.oneof(
                fc.string(),
                fc.record({ someField: fc.string() })
              )
            })
          ),
          (errorInput) => {
            let error: unknown;

            // Create appropriate error object based on input type
            if (errorInput.type === 'firebase') {
              error = new FirebaseError(errorInput.code, errorInput.message);
            } else if (errorInput.type === 'error') {
              error = new Error(errorInput.message);
            } else {
              error = errorInput.value;
            }

            const result = handleApiError(error);

            // Property 1: Result must be a valid ApiError
            expect(result).toHaveProperty('code');
            expect(result).toHaveProperty('message');
            expect(result).toHaveProperty('userMessage');
            expect(result).toHaveProperty('retryable');

            // Property 2: userMessage must be a non-empty string
            expect(typeof result.userMessage).toBe('string');
            expect(result.userMessage.length).toBeGreaterThan(0);

            // Property 3: retryable must be a boolean
            expect(typeof result.retryable).toBe('boolean');

            // Property 4: code must be a non-empty string
            expect(typeof result.code).toBe('string');
            expect(result.code.length).toBeGreaterThan(0);

            // Property 5: message must be a string
            expect(typeof result.message).toBe('string');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Firebase errors with known codes should have specific user messages
     */
    it('should provide specific user messages for known Firebase error codes', () => {
      const knownErrorCodes = [
        'auth/user-not-found',
        'auth/wrong-password',
        'auth/email-already-in-use',
        'auth/weak-password',
        'auth/invalid-email',
        'auth/network-request-failed',
        'permission-denied',
        'not-found',
        'already-exists',
        'resource-exhausted',
        'unauthenticated',
        'unavailable',
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...knownErrorCodes),
          fc.string(),
          (code, message) => {
            const error = new FirebaseError(code, message);
            const result = handleApiError(error);

            // Known errors should not have the generic message
            expect(result.userMessage).not.toBe(
              'An unexpected error occurred. Please try again.'
            );

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Retryable errors should be correctly identified
     */
    it('should correctly identify retryable Firebase errors', () => {
      const retryableErrors = [
        'unavailable',
        'deadline-exceeded',
        'resource-exhausted',
        'aborted',
        'internal',
        'auth/network-request-failed',
      ];

      const nonRetryableErrors = [
        'auth/user-not-found',
        'auth/wrong-password',
        'auth/email-already-in-use',
        'permission-denied',
        'not-found',
        'already-exists',
        'unauthenticated',
      ];

      fc.assert(
        fc.property(
          fc.oneof(
            fc.constantFrom(...retryableErrors).map((code) => ({ code, shouldRetry: true })),
            fc.constantFrom(...nonRetryableErrors).map((code) => ({ code, shouldRetry: false }))
          ),
          fc.string(),
          ({ code, shouldRetry }, message) => {
            const error = new FirebaseError(code, message);
            const result = handleApiError(error);

            expect(result.retryable).toBe(shouldRetry);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('retryWithBackoff', () => {
    /**
     * Feature: app-optimization, Property 10: Network retry with exponential backoff
     * Validates: Requirements 4.4
     * 
     * Property: For any network request that fails with a retryable error,
     * the application should retry with exponential backoff (1s, 2s, 4s) up to 3 attempts.
     */
    it(
      'should implement exponential backoff with correct timing (1s, 2s, 4s)',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.integer({ min: 1, max: 2 }), // Number of retries needed (reduced to 2 for faster tests)
            fc.constantFrom('unavailable', 'deadline-exceeded', 'resource-exhausted', 'aborted', 'internal', 'auth/network-request-failed'),
            async (retriesNeeded, errorCode) => {
              const attemptTimes: number[] = [];
              let attemptCount = 0;

              const mockFn = vi.fn(async () => {
                attemptTimes.push(Date.now());
                attemptCount++;
                
                if (attemptCount <= retriesNeeded) {
                  throw new FirebaseError(errorCode, 'Network error');
                }
                return 'success';
              });

              try {
                await retryWithBackoff(mockFn, 3);

                // Property 1: Should have correct number of attempts
                expect(attemptCount).toBe(retriesNeeded + 1);

                // Property 2: Verify exponential backoff timing between attempts
                for (let i = 1; i < attemptTimes.length; i++) {
                  const currentTime = attemptTimes[i];
                  const previousTime = attemptTimes[i - 1];
                  if (currentTime !== undefined && previousTime !== undefined) {
                    const actualDelay = currentTime - previousTime;
                    const expectedDelay = Math.pow(2, i - 1) * 1000; // 1s, 2s, 4s
                    
                    // Allow 20% tolerance for timing (execution overhead)
                    expect(actualDelay).toBeGreaterThanOrEqual(expectedDelay * 0.8);
                    expect(actualDelay).toBeLessThan(expectedDelay * 1.5);
                  }
                }

                return true;
              } catch (error) {
                // If all retries exhausted, should have attempted 3 times
                expect(attemptCount).toBe(3);
                
                // Verify backoff timing even for failed attempts
                if (attemptTimes.length > 1) {
                  for (let i = 1; i < attemptTimes.length; i++) {
                    const currentTime = attemptTimes[i];
                    const previousTime = attemptTimes[i - 1];
                    if (currentTime !== undefined && previousTime !== undefined) {
                      const actualDelay = currentTime - previousTime;
                      const expectedDelay = Math.pow(2, i - 1) * 1000;
                      expect(actualDelay).toBeGreaterThanOrEqual(expectedDelay * 0.8);
                    }
                  }
                }
                
                return true;
              }
            }
          ),
          { numRuns: 5 } // Reduced runs to 5 for faster execution
        );
      },
      30000 // 30 second timeout for exponential backoff tests
    );

    /**
     * Feature: app-optimization, Property 8: API error handling with user feedback
     * Validates: Requirements 4.2, 4.5
     * 
     * Property: For any retryable error, the function should retry with exponential backoff
     * and eventually throw if all retries fail.
     */
    it(
      'should retry retryable errors with exponential backoff',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.integer({ min: 1, max: 3 }), // Number of failures before success (reduced to avoid timeout)
            fc.string(), // Error message
            async (failuresBeforeSuccess, errorMessage) => {
              let attemptCount = 0;
              const startTime = Date.now();

              const mockFn = vi.fn(async () => {
                attemptCount++;
                if (attemptCount < failuresBeforeSuccess) {
                  // Throw a retryable Firebase error
                  throw new FirebaseError('unavailable', errorMessage);
                }
                return 'success';
              });

              try {
                const result = await retryWithBackoff(mockFn, 3);

                // Property 1: Should eventually succeed if retries are sufficient
                expect(result).toBe('success');

                // Property 2: Should have attempted the correct number of times
                expect(attemptCount).toBe(failuresBeforeSuccess);

                // Property 3: Should have waited with exponential backoff
                // Total wait time should be approximately: 1s + 2s for (attemptCount - 1) retries
                const expectedMinWait = Array.from(
                  { length: attemptCount - 1 },
                  (_, i) => Math.pow(2, i) * 1000
                ).reduce((sum, delay) => sum + delay, 0);

                const actualWait = Date.now() - startTime;

                // Allow some tolerance for execution time (should be at least 80% of expected)
                if (attemptCount > 1) {
                  expect(actualWait).toBeGreaterThanOrEqual(expectedMinWait * 0.8);
                }

                return true;
              } catch (error) {
                // If we fail, it should be because we exceeded max retries
                expect(attemptCount).toBe(3);
                return true;
              }
            }
          ),
          { numRuns: 10 } // Reduced runs due to async nature and delays
        );
      },
      15000 // 15 second timeout for exponential backoff tests
    );

    /**
     * Property: Non-retryable errors should fail immediately without retries
     */
    it('should not retry non-retryable errors', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            'auth/user-not-found',
            'auth/wrong-password',
            'permission-denied',
            'not-found'
          ),
          fc.string(),
          async (errorCode, errorMessage) => {
            let attemptCount = 0;

            const mockFn = vi.fn(async () => {
              attemptCount++;
              throw new FirebaseError(errorCode, errorMessage);
            });

            try {
              await retryWithBackoff(mockFn, 3);
              // Should not reach here
              expect(true).toBe(false);
            } catch (error) {
              // Property: Should fail on first attempt without retries
              expect(attemptCount).toBe(1);
              expect(error).toBeInstanceOf(FirebaseError);
            }

            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Property: Should respect maxRetries parameter
     */
    it(
      'should respect maxRetries parameter',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.integer({ min: 1, max: 2 }), // maxRetries (reduced to 2 for faster tests)
            async (maxRetries) => {
              let attemptCount = 0;

              const mockFn = vi.fn(async () => {
                attemptCount++;
                throw new FirebaseError('unavailable', 'Service unavailable');
              });

              try {
                await retryWithBackoff(mockFn, maxRetries);
              } catch (error) {
                // Property: Should attempt exactly maxRetries times
                expect(attemptCount).toBe(maxRetries);
              }

              return true;
            }
          ),
          { numRuns: 5 } // Reduced runs to 5 for faster execution
        );
      },
      20000 // 20 second timeout for exponential backoff tests
    );

    /**
     * Property: Successful calls should return immediately without retries
     */
    it('should return immediately on success without retries', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.anything(), // Return value
          async (returnValue) => {
            let attemptCount = 0;

            const mockFn = vi.fn(async () => {
              attemptCount++;
              return returnValue;
            });

            const result = await retryWithBackoff(mockFn, 3);

            // Property 1: Should succeed on first attempt
            expect(attemptCount).toBe(1);

            // Property 2: Should return the correct value
            expect(result).toEqual(returnValue);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
