/**
 * ErrorBoundary Component
 * Catches React errors and displays a fallback UI
 */

import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-red-500"
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
              
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Algo salió mal
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                La aplicación encontró un error inesperado.
              </p>

              {this.state.error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded text-left">
                  <p className="text-xs font-mono text-red-800 dark:text-red-400 break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <button
                onClick={this.handleReset}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Recargar aplicación
              </button>

              <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">
                Si el problema persiste, contacta al administrador
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
