/**
 * Error Boundary Component
 * Gracefully catches rendering errors and displays a fallback UI
 */

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { logClientError } from '../utils/errorLogger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to Firestore
    logClientError({
      message: `React ErrorBoundary catch: ${error.message || 'Unknown Error'}`,
      stack: error.stack || errorInfo.componentStack || '',
      type: 'exception'
    });

    // Call the optional callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 px-4">
          <div className="max-w-md w-full space-y-6 text-center">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-full border border-rose-200 dark:border-rose-800/50">
                <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-zinc-100">
                Something went wrong
              </h1>
              <p className="text-sm text-neutral-600 dark:text-zinc-400">
                We encountered an unexpected error while rendering this page. Please try refreshing your browser or contact support if the problem persists.
              </p>
            </div>

            {/* Error Details (Development Only) */}
            {(import.meta as any).env?.DEV && this.state.error && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 rounded-xl p-4 text-left space-y-2 overflow-auto max-h-48">
                <p className="text-[11px] font-mono font-bold text-rose-700 dark:text-rose-400">
                  Error: {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <details className="text-[10px] font-mono text-rose-600 dark:text-rose-300">
                    <summary className="cursor-pointer font-semibold mb-2 hover:underline">
                      Stack Trace
                    </summary>
                    <pre className="whitespace-pre-wrap break-words">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-3 bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 px-4 py-3 bg-neutral-100 dark:bg-zinc-800 hover:bg-neutral-200 dark:hover:bg-zinc-700 text-neutral-900 dark:text-zinc-100 font-semibold rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                Go Home
              </button>
            </div>

            {/* Support Info */}
            <div className="pt-4 border-t border-neutral-200 dark:border-zinc-800">
              <p className="text-xs text-neutral-500 dark:text-zinc-400">
                Need help?{' '}
                <a
                  href="https://zipytiny.app/support"
                  className="text-[#0071e3] hover:underline font-medium"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook to use Error Boundary with functional components
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  if (error) {
    throw error;
  }

  return setError;
};
