import { toast } from '@/hooks/use-toast';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ErrorDetails {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  context: ErrorContext;
  stack?: string;
}

export class PipelineError extends Error {
  public readonly code: string;
  public readonly severity: 'low' | 'medium' | 'high' | 'critical';
  public readonly recoverable: boolean;
  public readonly context: ErrorContext;

  constructor(details: Omit<ErrorDetails, 'stack'>) {
    super(details.message);
    this.name = 'PipelineError';
    this.code = details.code;
    this.severity = details.severity;
    this.recoverable = details.recoverable;
    this.context = details.context;
  }
}

// Error codes for different types of pipeline errors
export const ERROR_CODES = {
  // Validation errors
  CIRCULAR_DEPENDENCY: 'CIRCULAR_DEPENDENCY',
  ORPHANED_NODES: 'ORPHANED_NODES',
  INVALID_NODE_CONFIG: 'INVALID_NODE_CONFIG',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_CONNECTION: 'INVALID_CONNECTION',
  
  // Save/Load errors
  SAVE_FAILED: 'SAVE_FAILED',
  LOAD_FAILED: 'LOAD_FAILED',
  AUTO_SAVE_FAILED: 'AUTO_SAVE_FAILED',
  CONFLICT_DETECTED: 'CONFLICT_DETECTED',
  
  // Export/Import errors
  EXPORT_FAILED: 'EXPORT_FAILED',
  IMPORT_FAILED: 'IMPORT_FAILED',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // General errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
} as const;

// User-friendly error messages
export const ERROR_MESSAGES = {
  [ERROR_CODES.CIRCULAR_DEPENDENCY]: {
    title: 'Circular Dependency Detected',
    message: 'Your pipeline contains a circular dependency. Please remove the loop to continue.',
    suggestion: 'Check your connections and remove any cycles in the flow.',
  },
  [ERROR_CODES.ORPHANED_NODES]: {
    title: 'Disconnected Nodes Found',
    message: 'Some nodes are not connected to the main pipeline flow.',
    suggestion: 'Connect all nodes or remove unused ones to improve pipeline clarity.',
  },
  [ERROR_CODES.INVALID_NODE_CONFIG]: {
    title: 'Invalid Node Configuration',
    message: 'One or more nodes have invalid configuration.',
    suggestion: 'Please check the highlighted nodes and fix their configuration.',
  },
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: {
    title: 'Missing Required Information',
    message: 'Some required fields are missing.',
    suggestion: 'Please fill in all required fields before proceeding.',
  },
  [ERROR_CODES.INVALID_CONNECTION]: {
    title: 'Invalid Connection',
    message: 'This connection is not allowed between these node types.',
    suggestion: 'Check the component documentation for valid connections.',
  },
  [ERROR_CODES.SAVE_FAILED]: {
    title: 'Save Failed',
    message: 'Unable to save your pipeline.',
    suggestion: 'Please try again. If the problem persists, check your connection.',
  },
  [ERROR_CODES.LOAD_FAILED]: {
    title: 'Load Failed',
    message: 'Unable to load the pipeline.',
    suggestion: 'The pipeline file may be corrupted or inaccessible.',
  },
  [ERROR_CODES.AUTO_SAVE_FAILED]: {
    title: 'Auto-save Failed',
    message: 'Automatic save encountered an error.',
    suggestion: 'Your changes may not be saved. Please save manually.',
  },
  [ERROR_CODES.CONFLICT_DETECTED]: {
    title: 'Conflict Detected',
    message: 'The pipeline has been modified by another user.',
    suggestion: 'Please review the changes and choose how to proceed.',
  },
  [ERROR_CODES.EXPORT_FAILED]: {
    title: 'Export Failed',
    message: 'Unable to export your pipeline.',
    suggestion: 'Please check your pipeline configuration and try again.',
  },
  [ERROR_CODES.IMPORT_FAILED]: {
    title: 'Import Failed',
    message: 'Unable to import the pipeline file.',
    suggestion: 'Please check that the file format is correct and try again.',
  },
  [ERROR_CODES.INVALID_FORMAT]: {
    title: 'Invalid File Format',
    message: 'The selected file is not in a supported format.',
    suggestion: 'Please select a valid JSON or YAML pipeline file.',
  },
  [ERROR_CODES.NETWORK_ERROR]: {
    title: 'Network Error',
    message: 'Unable to connect to the server.',
    suggestion: 'Please check your internet connection and try again.',
  },
  [ERROR_CODES.TIMEOUT_ERROR]: {
    title: 'Request Timeout',
    message: 'The operation took too long to complete.',
    suggestion: 'Please try again. If the problem persists, contact support.',
  },
  [ERROR_CODES.UNKNOWN_ERROR]: {
    title: 'Unexpected Error',
    message: 'An unexpected error occurred.',
    suggestion: 'Please try again. If the problem persists, contact support.',
  },
  [ERROR_CODES.PERMISSION_DENIED]: {
    title: 'Permission Denied',
    message: 'You do not have permission to perform this action.',
    suggestion: 'Please contact your administrator for access.',
  },
} as const;

// Error handler class
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: ErrorDetails[] = [];
  private maxLogSize = 100;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Handle different types of errors
  handleError(error: Error | PipelineError, context?: Partial<ErrorContext>): void {
    const errorDetails = this.createErrorDetails(error, context);
    this.logError(errorDetails);
    this.displayError(errorDetails);
    
    // Report critical errors
    if (errorDetails.severity === 'critical') {
      this.reportCriticalError(errorDetails);
    }
  }

  // Create standardized error details
  private createErrorDetails(error: Error | PipelineError, context?: Partial<ErrorContext>): ErrorDetails {
    if (error instanceof PipelineError) {
      return {
        code: error.code,
        message: error.message,
        severity: error.severity,
        recoverable: error.recoverable,
        context: { ...error.context, ...context },
        stack: error.stack,
      };
    }

    // Handle standard errors
    const errorCode = this.inferErrorCode(error);
    return {
      code: errorCode,
      message: error.message,
      severity: this.inferSeverity(error),
      recoverable: true,
      context: {
        component: 'unknown',
        action: 'unknown',
        timestamp: new Date(),
        ...context,
      },
      stack: error.stack,
    };
  }

  // Infer error code from standard errors
  private inferErrorCode(error: Error): string {
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return ERROR_CODES.NETWORK_ERROR;
    }
    if (error.message.includes('timeout')) {
      return ERROR_CODES.TIMEOUT_ERROR;
    }
    if (error.message.includes('permission') || error.message.includes('unauthorized')) {
      return ERROR_CODES.PERMISSION_DENIED;
    }
    return ERROR_CODES.UNKNOWN_ERROR;
  }

  // Infer error severity
  private inferSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    if (error.message.includes('critical') || error.message.includes('fatal')) {
      return 'critical';
    }
    if (error.message.includes('network') || error.message.includes('save')) {
      return 'high';
    }
    if (error.message.includes('validation') || error.message.includes('warning')) {
      return 'medium';
    }
    return 'low';
  }

  // Log error for debugging
  private logError(errorDetails: ErrorDetails): void {
    console.error('Pipeline Error:', errorDetails);
    
    this.errorLog.push(errorDetails);
    
    // Maintain log size
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }
  }

  // Display user-friendly error message
  private displayError(errorDetails: ErrorDetails): void {
    const errorInfo = ERROR_MESSAGES[errorDetails.code as keyof typeof ERROR_MESSAGES] || {
      title: 'Error',
      message: errorDetails.message,
      suggestion: 'Please try again.',
    };

    const variant = this.getToastVariant(errorDetails.severity);
    
    toast({
      variant,
      title: errorInfo.title,
      description: `${errorInfo.message} ${errorInfo.suggestion}`,
      duration: this.getToastDuration(errorDetails.severity),
    });
  }

  // Get toast variant based on severity
  private getToastVariant(severity: string): 'default' | 'destructive' {
    return severity === 'high' || severity === 'critical' ? 'destructive' : 'default';
  }

  // Get toast duration based on severity
  private getToastDuration(severity: string): number {
    switch (severity) {
      case 'critical':
        return 10000; // 10 seconds
      case 'high':
        return 7000;  // 7 seconds
      case 'medium':
        return 5000;  // 5 seconds
      default:
        return 3000;  // 3 seconds
    }
  }

  // Report critical errors (could be extended to send to monitoring service)
  private reportCriticalError(errorDetails: ErrorDetails): void {
    console.error('CRITICAL ERROR:', errorDetails);
    // In a real application, this would send to an error monitoring service
    // like Sentry, LogRocket, or similar
  }

  // Get recent errors for debugging
  getRecentErrors(count = 10): ErrorDetails[] {
    return this.errorLog.slice(-count);
  }

  // Clear error log
  clearErrorLog(): void {
    this.errorLog = [];
  }

  // Create specific pipeline errors
  static createValidationError(message: string, context?: Partial<ErrorContext>): PipelineError {
    return new PipelineError({
      code: ERROR_CODES.INVALID_NODE_CONFIG,
      message,
      severity: 'medium',
      recoverable: true,
      context: {
        component: 'validation',
        action: 'validate',
        timestamp: new Date(),
        ...context,
      },
    });
  }

  static createSaveError(message: string, context?: Partial<ErrorContext>): PipelineError {
    return new PipelineError({
      code: ERROR_CODES.SAVE_FAILED,
      message,
      severity: 'high',
      recoverable: true,
      context: {
        component: 'save',
        action: 'save',
        timestamp: new Date(),
        ...context,
      },
    });
  }

  static createNetworkError(message: string, context?: Partial<ErrorContext>): PipelineError {
    return new PipelineError({
      code: ERROR_CODES.NETWORK_ERROR,
      message,
      severity: 'high',
      recoverable: true,
      context: {
        component: 'network',
        action: 'request',
        timestamp: new Date(),
        ...context,
      },
    });
  }
}

// Utility functions for common error scenarios
export const handleAsyncError = async <T>(
  operation: () => Promise<T>,
  context?: Partial<ErrorContext>
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    ErrorHandler.getInstance().handleError(error as Error, context);
    return null;
  }
};

export const handleSyncError = <T>(
  operation: () => T,
  context?: Partial<ErrorContext>
): T | null => {
  try {
    return operation();
  } catch (error) {
    ErrorHandler.getInstance().handleError(error as Error, context);
    return null;
  }
};

// Recovery strategies
export interface RecoveryStrategy {
  name: string;
  description: string;
  action: () => Promise<void> | void;
}

export const createRecoveryStrategies = (
  errorCode: string,
  context: ErrorContext
): RecoveryStrategy[] => {
  const strategies: RecoveryStrategy[] = [];

  switch (errorCode) {
    case ERROR_CODES.CIRCULAR_DEPENDENCY:
      strategies.push({
        name: 'Auto-fix',
        description: 'Automatically remove problematic connections',
        action: () => {
          // This would be implemented to automatically fix cycles
          console.log('Auto-fixing circular dependencies');
        },
      });
      break;

    case ERROR_CODES.SAVE_FAILED:
      strategies.push(
        {
          name: 'Retry Save',
          description: 'Try saving again',
          action: () => {
            // Retry the save operation
            console.log('Retrying save operation');
          },
        },
        {
          name: 'Save Locally',
          description: 'Save to local storage as backup',
          action: () => {
            // Save to localStorage
            console.log('Saving to local storage');
          },
        }
      );
      break;

    case ERROR_CODES.NETWORK_ERROR:
      strategies.push({
        name: 'Retry',
        description: 'Retry the network request',
        action: () => {
          console.log('Retrying network request');
        },
      });
      break;
  }

  return strategies;
};