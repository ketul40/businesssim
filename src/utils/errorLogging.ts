import { trackError } from './analytics';

/**
 * Error log entry structure
 */
export interface ErrorLog {
  error: Error;
  context: {
    userId?: string;
    sessionId?: string;
    component?: string;
    action?: string;
    [key: string]: string | undefined;
  };
  timestamp: string;
  userAgent: string;
  url: string;
  stackTrace?: string;
}

/**
 * Gets current user context for error logging
 */
function getCurrentUserContext(): { userId?: string } {
  // This will be populated from auth context in real usage
  // For now, return empty object
  return {};
}

/**
 * Logs an error with full context
 * @param error - The error object
 * @param context - Additional context about where/when the error occurred
 */
export function logError(
  error: Error,
  context: ErrorLog['context'] = {}
): void {
  const errorLog: ErrorLog = {
    error,
    context: {
      ...getCurrentUserContext(),
      ...context,
    },
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    stackTrace: error.stack,
  };

  // Log to console in development
  if (import.meta.env.DEV) {
    console.error('[Error Log]', errorLog);
  }

  // Track error in analytics
  trackError(
    error.message,
    (error as any).code,
    {
      component: context.component,
      action: context.action,
      url: errorLog.url,
    }
  );

  // In production, this would send to an error tracking service
  // Examples: Sentry, LogRocket, Firebase Crashlytics, etc.
  // For now, we'll just log to console
  if (import.meta.env.PROD) {
    // TODO: Send to error tracking service
    console.error('[Production Error]', {
      message: error.message,
      code: (error as any).code,
      timestamp: errorLog.timestamp,
      context: errorLog.context,
    });
  }
}

/**
 * Logs a warning (non-critical error)
 */
export function logWarning(
  message: string,
  context: ErrorLog['context'] = {}
): void {
  const warningLog = {
    message,
    context: {
      ...getCurrentUserContext(),
      ...context,
    },
    timestamp: new Date().toISOString(),
    url: window.location.href,
  };

  console.warn('[Warning]', warningLog);
}

/**
 * Logs an info message for debugging
 */
export function logInfo(
  message: string,
  data?: Record<string, any>
): void {
  if (import.meta.env.DEV) {
    console.log('[Info]', message, data);
  }
}
