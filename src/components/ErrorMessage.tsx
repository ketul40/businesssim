

export interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'info';
}

/**
 * Reusable error message component for displaying user-friendly error messages
 */
export function ErrorMessage({
  message,
  onRetry,
  onDismiss,
  type = 'error',
}: ErrorMessageProps): JSX.Element {
  const styles = {
    container: {
      padding: '1rem',
      borderRadius: '8px',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      backgroundColor: type === 'error' ? '#fee' : type === 'warning' ? '#fff3cd' : '#d1ecf1',
      border: `1px solid ${type === 'error' ? '#fcc' : type === 'warning' ? '#ffeaa7' : '#bee5eb'}`,
    },
    icon: {
      fontSize: '1.25rem',
      flexShrink: 0,
    },
    content: {
      flex: 1,
    },
    message: {
      margin: 0,
      color: type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#0c5460',
      fontSize: '0.95rem',
    },
    actions: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '0.75rem',
    },
    button: {
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    retryButton: {
      backgroundColor: type === 'error' ? '#dc3545' : '#007bff',
      color: 'white',
    },
    dismissButton: {
      backgroundColor: 'transparent',
      color: type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#0c5460',
      border: '1px solid currentColor',
    },
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❌';
    }
  };

  return (
    <div style={styles.container} role="alert">
      <span style={styles.icon}>{getIcon()}</span>
      <div style={styles.content}>
        <p style={styles.message}>{message}</p>
        {(onRetry || onDismiss) && (
          <div style={styles.actions}>
            {onRetry && (
              <button
                onClick={onRetry}
                style={{ ...styles.button, ...styles.retryButton }}
                aria-label="Retry action"
              >
                Try Again
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                style={{ ...styles.button, ...styles.dismissButton }}
                aria-label="Dismiss error"
              >
                Dismiss
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Inline error message for form fields
 */
export interface InlineErrorProps {
  message: string;
}

export function InlineError({ message }: InlineErrorProps): JSX.Element {
  return (
    <div
      style={{
        color: '#dc3545',
        fontSize: '0.875rem',
        marginTop: '0.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
      }}
      role="alert"
    >
      <span>⚠️</span>
      <span>{message}</span>
    </div>
  );
}
