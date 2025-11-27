import { FirebaseError } from 'firebase/app';
import { ApiError } from '../types/api';

/**
 * Maps Firebase error codes to user-friendly messages
 * @param code - Firebase error code
 * @returns User-friendly error message
 */
function getFirebaseErrorMessage(code: string): string {
  const errorMessages: Record<string, string> = {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'permission-denied': 'You do not have permission to perform this action.',
    'not-found': 'The requested resource was not found.',
    'already-exists': 'This resource already exists.',
    'resource-exhausted': 'Service quota exceeded. Please try again later.',
    'unauthenticated': 'Please sign in to continue.',
    'unavailable': 'Service temporarily unavailable. Please try again.',
  };

  return errorMessages[code] || 'An unexpected error occurred. Please try again.';
}

/**
 * Determines if a Firebase error is retryable
 * @param code - Firebase error code
 * @returns True if the error should be retried, false otherwise
 */
function isRetryableFirebaseError(code: string): boolean {
  const retryableErrors = [
    'unavailable',
    'deadline-exceeded',
    'resource-exhausted',
    'aborted',
    'internal',
    'auth/network-request-failed',
  ];

  return retryableErrors.includes(code);
}

/**
 * Handles API errors and converts them to a standardized format
 * @param error - The error to handle (can be any type)
 * @returns Standardized ApiError object with user-friendly message
 * @example
 * ```typescript
 * try {
 *   await fetchData();
 * } catch (error) {
 *   const apiError = handleApiError(error);
 *   showErrorMessage(apiError.userMessage);
 * }
 * ```
 */
export function handleApiError(error: unknown): ApiError {
  if (error instanceof FirebaseError) {
    return {
      code: error.code,
      message: error.message,
      userMessage: getFirebaseErrorMessage(error.code),
      retryable: isRetryableFirebaseError(error.code),
    };
  }

  if (error instanceof Error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message,
      userMessage: 'An unexpected error occurred. Please try again.',
      retryable: true,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: error ? JSON.stringify(error) : 'Unknown error',
    userMessage: 'An unexpected error occurred. Please try again.',
    retryable: true,
  };
}

/**
 * Retries a function with exponential backoff
 * 
 * Implements exponential backoff strategy: 1s, 2s, 4s delays between retries.
 * Only retries if the error is marked as retryable.
 * 
 * @param fn - The async function to retry
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns The result of the function
 * @throws The last error if all retries fail or error is not retryable
 * @example
 * ```typescript
 * const data = await retryWithBackoff(
 *   () => fetchUserData(userId),
 *   3
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const apiError = handleApiError(error);

      // Don't retry if error is not retryable or this is the last attempt
      if (!apiError.retryable || i === maxRetries - 1) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, i) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
