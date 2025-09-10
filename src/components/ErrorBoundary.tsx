import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorHandler, ERROR_CODES, PipelineError } from '@/lib/error-handling';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  private errorHandler: ErrorHandler;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
    this.errorHandler = ErrorHandler.getInstance();
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Handle the error through our error handling system
    const pipelineError = new PipelineError({
      code: ERROR_CODES.UNKNOWN_ERROR,
      message: `React Error Boundary caught an error: ${error.message}`,
      severity: 'high',
      recoverable: true,
      context: {
        component: 'ErrorBoundary',
        action: 'componentDidCatch',
        timestamp: new Date(),
        metadata: {
          errorId: this.state.errorId,
          componentStack: errorInfo.componentStack,
          errorStack: error.stack,
        },
      },
    });

    this.errorHandler.handleError(pipelineError);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to console for development
    console.group('🚨 Error Boundary Caught Error');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    
    // Create error report
    const errorReport = {
      id: errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      error: {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
      },
      errorInfo: {
        componentStack: errorInfo?.componentStack,
      },
      recentErrors: this.errorHandler.getRecentErrors(5),
    };

    // In a real application, this would send to an error reporting service
    console.log('Error Report:', errorReport);
    
    // Copy to clipboard for now
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2)).then(() => {
      alert('Error report copied to clipboard. Please share this with support.');
    }).catch(() => {
      alert('Failed to copy error report. Please manually copy the console output.');
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Something went wrong</CardTitle>
              <CardDescription>
                An unexpected error occurred in the pipeline builder. Don't worry, your work might still be saved.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Alert>
                <Bug className="h-4 w-4" />
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription className="mt-2">
                  <div className="space-y-2">
                    <p><strong>Error ID:</strong> {this.state.errorId}</p>
                    <p><strong>Message:</strong> {this.state.error?.message}</p>
                    <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Error Stack (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                <Alert>
                  <AlertTitle>Stack Trace (Development)</AlertTitle>
                  <AlertDescription>
                    <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-auto max-h-32">
                      {this.state.error.stack}
                    </pre>
                  </AlertDescription>
                </Alert>
              )}

              {/* Component Stack (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.errorInfo?.componentStack && (
                <Alert>
                  <AlertTitle>Component Stack (Development)</AlertTitle>
                  <AlertDescription>
                    <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-auto max-h-32">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </AlertDescription>
                </Alert>
              )}

              {/* Recovery Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <Button onClick={this.handleReload} variant="outline" className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
                
                <Button onClick={this.handleGoHome} variant="outline" className="flex-1">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>

              {/* Report Error */}
              <div className="text-center">
                <Button onClick={this.handleReportError} variant="ghost" size="sm">
                  <Bug className="w-4 h-4 mr-2" />
                  Report This Error
                </Button>
              </div>

              {/* Help Text */}
              <div className="text-center text-sm text-muted-foreground">
                <p>If this problem persists, try:</p>
                <ul className="mt-2 space-y-1">
                  <li>• Refreshing the page</li>
                  <li>• Clearing your browser cache</li>
                  <li>• Checking your internet connection</li>
                  <li>• Contacting support with the error ID above</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Hook for handling errors in functional components
export function useErrorHandler() {
  const errorHandler = ErrorHandler.getInstance();

  const handleError = React.useCallback((error: Error, context?: any) => {
    errorHandler.handleError(error, {
      component: 'useErrorHandler',
      action: 'handleError',
      timestamp: new Date(),
      metadata: context,
    });
  }, [errorHandler]);

  const handleAsyncError = React.useCallback(async <T>(
    operation: () => Promise<T>,
    context?: any
  ): Promise<T | null> => {
    try {
      return await operation();
    } catch (error) {
      handleError(error as Error, context);
      return null;
    }
  }, [handleError]);

  return { handleError, handleAsyncError };
}

// Component for displaying error messages
interface ErrorDisplayProps {
  error: Error | string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorDisplay({ error, onRetry, onDismiss, className }: ErrorDisplayProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <Alert className={className} variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="mt-2">
        <p>{errorMessage}</p>
        {(onRetry || onDismiss) && (
          <div className="flex gap-2 mt-3">
            {onRetry && (
              <Button onClick={onRetry} size="sm" variant="outline">
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            )}
            {onDismiss && (
              <Button onClick={onDismiss} size="sm" variant="ghost">
                Dismiss
              </Button>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

export default ErrorBoundary;