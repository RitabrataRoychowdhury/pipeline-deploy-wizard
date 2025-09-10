import { useEffect, useRef, useCallback } from 'react';
import { PipelineNode, PipelineEdge } from '@/lib/pipeline-utils';
import { autoSaveManager, AutoSaveConfig, SaveState } from '@/lib/auto-save';
import { useErrorHandler } from '@/components/ErrorBoundary';

interface UseAutoSaveOptions extends Partial<AutoSaveConfig> {
  pipelineId?: string;
  pipelineName?: string;
  onSaveStateChange?: (state: SaveState) => void;
  onConflictDetected?: (localData: any, remoteData: any) => void;
}

interface UseAutoSaveReturn {
  saveState: SaveState;
  updateData: (nodes: PipelineNode[], edges: PipelineEdge[]) => void;
  save: (force?: boolean) => Promise<boolean>;
  loadData: (id: string) => Promise<any>;
  startAutoSave: () => void;
  stopAutoSave: () => void;
}

export function useAutoSave(options: UseAutoSaveOptions = {}): UseAutoSaveReturn {
  const { handleError } = useErrorHandler();
  const saveStateRef = useRef<SaveState>(autoSaveManager.getSaveState());
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Initialize auto-save manager with options
  useEffect(() => {
    // Configure auto-save manager
    if (options.enabled !== undefined || 
        options.interval !== undefined || 
        options.maxRetries !== undefined ||
        options.conflictResolution !== undefined ||
        options.storageType !== undefined) {
      
      // Create new instance with custom config if needed
      // For now, we'll use the singleton with default config
    }

    // Subscribe to save state changes
    unsubscribeRef.current = autoSaveManager.subscribe((state) => {
      saveStateRef.current = state;
      options.onSaveStateChange?.(state);
    });

    return () => {
      unsubscribeRef.current?.();
    };
  }, [options.onSaveStateChange]);

  // Update pipeline data
  const updateData = useCallback((nodes: PipelineNode[], edges: PipelineEdge[]) => {
    try {
      const metadata = {
        version: options.pipelineId || 'default',
        ...(options.pipelineName && { name: options.pipelineName }),
      };
      
      autoSaveManager.updateData(nodes, edges, metadata);
    } catch (error) {
      handleError(error as Error, {
        action: 'updateData',
        pipelineId: options.pipelineId,
      });
    }
  }, [options.pipelineId, options.pipelineName, handleError]);

  // Manual save
  const save = useCallback(async (force = false): Promise<boolean> => {
    try {
      return await autoSaveManager.save(force);
    } catch (error) {
      handleError(error as Error, {
        action: 'save',
        pipelineId: options.pipelineId,
      });
      return false;
    }
  }, [options.pipelineId, handleError]);

  // Load data
  const loadData = useCallback(async (id: string) => {
    try {
      return await autoSaveManager.loadData(id);
    } catch (error) {
      handleError(error as Error, {
        action: 'loadData',
        pipelineId: id,
      });
      return null;
    }
  }, [handleError]);

  // Start auto-save
  const startAutoSave = useCallback(() => {
    try {
      autoSaveManager.startAutoSave();
    } catch (error) {
      handleError(error as Error, {
        action: 'startAutoSave',
        pipelineId: options.pipelineId,
      });
    }
  }, [options.pipelineId, handleError]);

  // Stop auto-save
  const stopAutoSave = useCallback(() => {
    try {
      autoSaveManager.stopAutoSave();
    } catch (error) {
      handleError(error as Error, {
        action: 'stopAutoSave',
        pipelineId: options.pipelineId,
      });
    }
  }, [options.pipelineId, handleError]);

  return {
    saveState: saveStateRef.current,
    updateData,
    save,
    loadData,
    startAutoSave,
    stopAutoSave,
  };
}

// Hook for save status indicator
export function useSaveStatus() {
  const saveState = autoSaveManager.getSaveState();
  
  const getSaveStatusText = useCallback(() => {
    if (saveState.isSaving) {
      return 'Saving...';
    }
    
    if (saveState.saveError) {
      return 'Save failed';
    }
    
    if (saveState.hasUnsavedChanges) {
      return 'Unsaved changes';
    }
    
    if (saveState.lastSaved) {
      const timeDiff = Date.now() - saveState.lastSaved.getTime();
      const minutes = Math.floor(timeDiff / 60000);
      
      if (minutes < 1) {
        return 'Saved just now';
      } else if (minutes < 60) {
        return `Saved ${minutes}m ago`;
      } else {
        const hours = Math.floor(minutes / 60);
        return `Saved ${hours}h ago`;
      }
    }
    
    return 'Not saved';
  }, [saveState]);

  const getSaveStatusColor = useCallback(() => {
    if (saveState.isSaving) {
      return 'text-blue-500';
    }
    
    if (saveState.saveError) {
      return 'text-red-500';
    }
    
    if (saveState.hasUnsavedChanges) {
      return 'text-yellow-500';
    }
    
    return 'text-green-500';
  }, [saveState]);

  return {
    saveState,
    statusText: getSaveStatusText(),
    statusColor: getSaveStatusColor(),
  };
}

// Hook for keyboard shortcuts related to saving
export function useSaveShortcuts(onSave: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+S or Cmd+S
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        onSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSave]);
}

// Hook for handling unsaved changes warning
export function useUnsavedChangesWarning(hasUnsavedChanges: boolean) {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);
}

export default useAutoSave;