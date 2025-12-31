import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component for graceful error handling in React
 * Catches JavaScript errors in child component tree and displays fallback UI
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Only log errors in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Error info:', errorInfo.componentStack);
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We encountered an unexpected error. Please try again or refresh the page.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                Try again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Refresh page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
