import { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '../utils/errorLogging';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to our error logging service
    logError(error, {
      component: errorInfo.componentStack?.split('\n')[1]?.trim(),
      action: 'component_error',
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

/**
 * Default error fallback UI component
 */
interface ErrorFallbackProps {
  error: Error | null;
  onReset?: () => void;
}

function ErrorFallback({ error, onReset }: ErrorFallbackProps): JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: '3rem',
          marginBottom: '1rem',
        }}
      >
        ⚠️
      </div>
      <h2 style={{ marginBottom: '1rem' }}>Something went wrong</h2>
      <p style={{ color: '#666', marginBottom: '1.5rem', maxWidth: '500px' }}>
        We encountered an unexpected error. Please try refreshing the page or contact support if
        the problem persists.
      </p>
      {import.meta.env.DEV && error && (
        <details style={{ marginBottom: '1.5rem', textAlign: 'left', maxWidth: '600px' }}>
          <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
            Error Details (Development Only)
          </summary>
          <pre
            style={{
              background: '#f5f5f5',
              padding: '1rem',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '0.875rem',
            }}
          >
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </details>
      )}
      <div style={{ display: 'flex', gap: '1rem' }}>
        {onReset && (
          <button
            onClick={onReset}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Try Again
          </button>
        )}
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

export default ErrorBoundary;
export { ErrorFallback };
