import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ErrorHandler, PipelineError, ERROR_CODES, ERROR_MESSAGES } from '../error-handling';

// Mock toast function
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;
  let consoleSpy: any;

  beforeEach(() => {
    errorHandler = ErrorHandler.getInstance();
    errorHandler.clearErrorLog();
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.restore();
  });

  describe('PipelineError', () => {
    it('should create a PipelineError with correct properties', () => {
      const error = new PipelineError({
        code: ERROR_CODES.CIRCULAR_DEPENDENCY,
        message: 'Test error',
        severity: 'high',
        recoverable: true,
        context: {
          component: 'test',
          action: 'test',
          timestamp: new Date(),
        },
      });

      expect(error.name).toBe('PipelineError');
      expect(error.code).toBe(ERROR_CODES.CIRCULAR_DEPENDENCY);
      expect(error.message).toBe('Test error');
      expect(error.severity).toBe('high');
      expect(error.recoverable).toBe(true);
    });
  });

  describe('ErrorHandler.handleError', () => {
    it('should handle PipelineError correctly', () => {
      const error = new PipelineError({
        code: ERROR_CODES.SAVE_FAILED,
        message: 'Save failed',
        severity: 'high',
        recoverable: true,
        context: {
          component: 'test',
          action: 'save',
          timestamp: new Date(),
        },
      });

      errorHandler.handleError(error);

      const recentErrors = errorHandler.getRecentErrors(1);
      expect(recentErrors).toHaveLength(1);
      expect(recentErrors[0].code).toBe(ERROR_CODES.SAVE_FAILED);
    });

    it('should handle standard Error correctly', () => {
      const error = new Error('Network error occurred');
      
      errorHandler.handleError(error, {
        component: 'test',
        action: 'network',
      });

      const recentErrors = errorHandler.getRecentErrors(1);
      expect(recentErrors).toHaveLength(1);
      expect(recentErrors[0].code).toBe(ERROR_CODES.NETWORK_ERROR);
    });

    it('should infer error codes correctly', () => {
      const networkError = new Error('fetch failed');
      const timeoutError = new Error('timeout exceeded');
      const permissionError = new Error('permission denied');

      errorHandler.handleError(networkError);
      errorHandler.handleError(timeoutError);
      errorHandler.handleError(permissionError);

      const recentErrors = errorHandler.getRecentErrors(3);
      expect(recentErrors[0].code).toBe(ERROR_CODES.NETWORK_ERROR);
      expect(recentErrors[1].code).toBe(ERROR_CODES.TIMEOUT_ERROR);
      expect(recentErrors[2].code).toBe(ERROR_CODES.PERMISSION_DENIED);
    });
  });

  describe('Error creation helpers', () => {
    it('should create validation error correctly', () => {
      const error = ErrorHandler.createValidationError('Invalid node configuration');
      
      expect(error.code).toBe(ERROR_CODES.INVALID_NODE_CONFIG);
      expect(error.severity).toBe('medium');
      expect(error.recoverable).toBe(true);
    });

    it('should create save error correctly', () => {
      const error = ErrorHandler.createSaveError('Failed to save pipeline');
      
      expect(error.code).toBe(ERROR_CODES.SAVE_FAILED);
      expect(error.severity).toBe('high');
      expect(error.recoverable).toBe(true);
    });

    it('should create network error correctly', () => {
      const error = ErrorHandler.createNetworkError('Connection failed');
      
      expect(error.code).toBe(ERROR_CODES.NETWORK_ERROR);
      expect(error.severity).toBe('high');
      expect(error.recoverable).toBe(true);
    });
  });

  describe('Error log management', () => {
    it('should maintain error log size limit', () => {
      // Create more errors than the max log size (100)
      for (let i = 0; i < 150; i++) {
        const error = new Error(`Error ${i}`);
        errorHandler.handleError(error);
      }

      const recentErrors = errorHandler.getRecentErrors(200);
      expect(recentErrors.length).toBeLessThanOrEqual(100);
    });

    it('should clear error log', () => {
      const error = new Error('Test error');
      errorHandler.handleError(error);
      
      expect(errorHandler.getRecentErrors(1)).toHaveLength(1);
      
      errorHandler.clearErrorLog();
      expect(errorHandler.getRecentErrors(1)).toHaveLength(0);
    });
  });

  describe('Error messages', () => {
    it('should have messages for all error codes', () => {
      Object.values(ERROR_CODES).forEach(code => {
        expect(ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES]).toBeDefined();
      });
    });

    it('should have proper message structure', () => {
      const message = ERROR_MESSAGES[ERROR_CODES.CIRCULAR_DEPENDENCY];
      
      expect(message).toHaveProperty('title');
      expect(message).toHaveProperty('message');
      expect(message).toHaveProperty('suggestion');
      expect(typeof message.title).toBe('string');
      expect(typeof message.message).toBe('string');
      expect(typeof message.suggestion).toBe('string');
    });
  });
});

describe('Error handling utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleAsyncError', () => {
    it('should return result on success', async () => {
      const { handleAsyncError } = await import('../error-handling');
      
      const operation = vi.fn().mockResolvedValue('success');
      const result = await handleAsyncError(operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledOnce();
    });

    it('should return null on error', async () => {
      const { handleAsyncError } = await import('../error-handling');
      
      const operation = vi.fn().mockRejectedValue(new Error('Test error'));
      const result = await handleAsyncError(operation);
      
      expect(result).toBeNull();
      expect(operation).toHaveBeenCalledOnce();
    });
  });

  describe('handleSyncError', () => {
    it('should return result on success', async () => {
      const { handleSyncError } = await import('../error-handling');
      
      const operation = vi.fn().mockReturnValue('success');
      const result = handleSyncError(operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledOnce();
    });

    it('should return null on error', async () => {
      const { handleSyncError } = await import('../error-handling');
      
      const operation = vi.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      const result = handleSyncError(operation);
      
      expect(result).toBeNull();
      expect(operation).toHaveBeenCalledOnce();
    });
  });
});

describe('Recovery strategies', () => {
  it('should create appropriate recovery strategies for circular dependency', async () => {
    const { createRecoveryStrategies, ERROR_CODES } = await import('../error-handling');
    
    const strategies = createRecoveryStrategies(ERROR_CODES.CIRCULAR_DEPENDENCY, {
      component: 'test',
      action: 'test',
      timestamp: new Date(),
    });
    
    expect(strategies).toHaveLength(1);
    expect(strategies[0].name).toBe('Auto-fix');
    expect(strategies[0].description).toContain('automatically remove');
  });

  it('should create appropriate recovery strategies for save failure', async () => {
    const { createRecoveryStrategies, ERROR_CODES } = await import('../error-handling');
    
    const strategies = createRecoveryStrategies(ERROR_CODES.SAVE_FAILED, {
      component: 'test',
      action: 'test',
      timestamp: new Date(),
    });
    
    expect(strategies).toHaveLength(2);
    expect(strategies[0].name).toBe('Retry Save');
    expect(strategies[1].name).toBe('Save Locally');
  });

  it('should create appropriate recovery strategies for network error', async () => {
    const { createRecoveryStrategies, ERROR_CODES } = await import('../error-handling');
    
    const strategies = createRecoveryStrategies(ERROR_CODES.NETWORK_ERROR, {
      component: 'test',
      action: 'test',
      timestamp: new Date(),
    });
    
    expect(strategies).toHaveLength(1);
    expect(strategies[0].name).toBe('Retry');
  });
});