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

class ErrorBoundary extends Component<Props, State> {
  private errorHandler: ErrorHandler;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
    this.errorHandler = new ErrorHandler();
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId: Date.now().toString(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.errorHandler.handleError(error, {
      component: 'ErrorBoundary',
      action: 'componentDidCatch',
      timestamp: new Date(),
      metadata: { errorInfo },
    });

    this.setState({
      errorInfo,
      errorId: Date.now().toString(),
    });

    // Call optional error callback
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    
    // In a real application, you would send this to your error reporting service
    console.error('Error Report:', {
      errorId,
      error: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
    });

    // You could also open a modal with error reporting form
    alert('Error report has been logged. Thank you for helping us improve!');
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorId } = this.state;
      const isProduction = process.env.NODE_ENV === 'production';

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-bold">Something went wrong</CardTitle>
              <CardDescription className="text-base">
                We apologize for the inconvenience. An unexpected error has occurred.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Error Alert */}
              <Alert variant="destructive">
                <Bug className="h-4 w-4" />
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription>
                  {isProduction ? (
                    `An error occurred while processing your request. Error ID: ${errorId}`
                  ) : (
                    <div className="space-y-2">
                      <p><strong>Error:</strong> {error?.message}</p>
                      {error?.stack && (
                        <details className="text-sm">
                          <summary className="cursor-pointer">Stack trace</summary>
                          <pre className="mt-2 overflow-auto text-xs">{error.stack}</pre>
                        </details>
                      )}
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={this.handleRetry} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>

                <Button 
                  variant="outline" 
                  onClick={this.handleReportError}
                  className="flex items-center gap-2"
                >
                  <Bug className="h-4 w-4" />
                  Report Error
                </Button>
              </div>

              {/* Help Text */}
              <div className="text-center text-sm text-muted-foreground">
                <p>If this problem persists, please contact our support team.</p>
                {errorId && (
                  <p className="mt-1 font-mono">Error ID: {errorId}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Utility hook for handling errors in functional components
export const useErrorHandler = () => {
  const errorHandler = React.useMemo(() => new ErrorHandler(), []);

  const handleError = React.useCallback((error: Error, context?: any) => {
    errorHandler.handleError(error, {
      component: 'useErrorHandler',
      action: 'handleError',
      timestamp: new Date(),
      metadata: context,
    });
  }, [errorHandler]);

  const handleAsyncError = React.useCallback(async (
    operation: () => Promise<any>,
    context?: any
  ): Promise<any> => {
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
  error: Error | PipelineError;
  className?: string;
  variant?: 'default' | 'destructive';
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  className = '', 
  variant = 'destructive' 
}) => {
  const isPipelineError = error instanceof PipelineError;
  
  return (
    <Alert variant={variant} className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>
        {isPipelineError ? `Pipeline Error (${error.code})` : 'Error'}
      </AlertTitle>
      <AlertDescription>
        {error.message}
        {isPipelineError && error.context && (
          <details className="mt-2 text-sm">
            <summary className="cursor-pointer">Error Context</summary>
            <pre className="mt-1 overflow-auto text-xs">
              {JSON.stringify(error.context, null, 2)}
            </pre>
          </details>
        )}
      </AlertDescription>
    </Alert>
  );
};

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Global error boundary for the entire application
export const GlobalErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo);
      console.error('Global Error:', error, errorInfo);
    }
  };

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};