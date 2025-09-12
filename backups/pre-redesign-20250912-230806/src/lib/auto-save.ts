import { PipelineNode, PipelineEdge } from './pipeline-utils';
import { ErrorHandler, ERROR_CODES, PipelineError } from './error-handling';
import { toast } from '@/hooks/use-toast';

export interface PipelineData {
  id: string;
  name: string;
  description?: string;
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  metadata: {
    created: Date;
    modified: Date;
    version: string;
    checksum: string;
  };
}

export interface AutoSaveConfig {
  enabled: boolean;
  interval: number; // milliseconds
  maxRetries: number;
  conflictResolution: 'manual' | 'auto-merge' | 'overwrite';
  storageType: 'localStorage' | 'indexedDB' | 'server';
}

export interface SaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  saveError: string | null;
  conflictDetected: boolean;
}

export interface ConflictResolution {
  strategy: 'keep-local' | 'keep-remote' | 'merge' | 'manual';
  localData: PipelineData;
  remoteData: PipelineData;
  mergedData?: PipelineData;
}

// Auto-save manager class
export class AutoSaveManager {
  private config: AutoSaveConfig;
  private saveState: SaveState;
  private errorHandler: ErrorHandler;
  private saveTimer: NodeJS.Timeout | null = null;
  private retryCount = 0;
  private currentData: PipelineData | null = null;
  private listeners: Set<(state: SaveState) => void> = new Set();

  constructor(config: Partial<AutoSaveConfig> = {}) {
    this.config = {
      enabled: true,
      interval: 30000, // 30 seconds
      maxRetries: 3,
      conflictResolution: 'manual',
      storageType: 'localStorage',
      ...config,
    };

    this.saveState = {
      isSaving: false,
      lastSaved: null,
      hasUnsavedChanges: false,
      saveError: null,
      conflictDetected: false,
    };

    this.errorHandler = ErrorHandler.getInstance();
    this.setupAutoSave();
  }

  // Setup auto-save functionality
  private setupAutoSave(): void {
    if (this.config.enabled) {
      this.startAutoSave();
    }

    // Listen for page unload to save changes
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    
    // Listen for visibility change to save when tab becomes hidden
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  // Start auto-save timer
  startAutoSave(): void {
    if (this.saveTimer) {
      clearInterval(this.saveTimer);
    }

    this.saveTimer = setInterval(() => {
      if (this.saveState.hasUnsavedChanges && !this.saveState.isSaving) {
        this.performAutoSave();
      }
    }, this.config.interval);
  }

  // Stop auto-save timer
  stopAutoSave(): void {
    if (this.saveTimer) {
      clearInterval(this.saveTimer);
      this.saveTimer = null;
    }
  }

  // Update pipeline data and mark as changed
  updateData(nodes: PipelineNode[], edges: PipelineEdge[], metadata?: Partial<PipelineData['metadata']>): void {
    if (!this.currentData) {
      this.currentData = {
        id: metadata?.version || 'new-pipeline',
        name: 'Untitled Pipeline',
        nodes,
        edges,
        metadata: {
          created: new Date(),
          modified: new Date(),
          version: '1.0.0',
          checksum: this.generateChecksum(nodes, edges),
          ...metadata,
        },
      };
    } else {
      this.currentData = {
        ...this.currentData,
        nodes,
        edges,
        metadata: {
          ...this.currentData.metadata,
          modified: new Date(),
          checksum: this.generateChecksum(nodes, edges),
          ...metadata,
        },
      };
    }

    this.updateSaveState({
      hasUnsavedChanges: true,
      saveError: null,
    });
  }

  // Perform auto-save
  private async performAutoSave(): Promise<void> {
    if (!this.currentData || this.saveState.isSaving) {
      return;
    }

    this.updateSaveState({ isSaving: true, saveError: null });

    try {
      await this.saveData(this.currentData, true);
      this.retryCount = 0;
      
      this.updateSaveState({
        isSaving: false,
        hasUnsavedChanges: false,
        lastSaved: new Date(),
        saveError: null,
      });

      // Show subtle success notification for auto-save
      toast({
        title: 'Auto-saved',
        description: 'Your changes have been automatically saved',
        duration: 2000,
      });

    } catch (error) {
      this.handleSaveError(error as Error, true);
    }
  }

  // Manual save
  async save(force = false): Promise<boolean> {
    if (!this.currentData) {
      throw new PipelineError({
        code: ERROR_CODES.SAVE_FAILED,
        message: 'No data to save',
        severity: 'medium',
        recoverable: true,
        context: {
          component: 'auto-save',
          action: 'save',
          timestamp: new Date(),
        },
      });
    }

    this.updateSaveState({ isSaving: true, saveError: null });

    try {
      await this.saveData(this.currentData, false, force);
      this.retryCount = 0;
      
      this.updateSaveState({
        isSaving: false,
        hasUnsavedChanges: false,
        lastSaved: new Date(),
        saveError: null,
      });

      toast({
        title: 'Saved',
        description: 'Pipeline saved successfully',
        duration: 3000,
      });

      return true;

    } catch (error) {
      this.handleSaveError(error as Error, false);
      return false;
    }
  }

  // Save data to storage
  private async saveData(data: PipelineData, isAutoSave: boolean, force = false): Promise<void> {
    switch (this.config.storageType) {
      case 'localStorage':
        await this.saveToLocalStorage(data, force);
        break;
      case 'indexedDB':
        await this.saveToIndexedDB(data, force);
        break;
      case 'server':
        await this.saveToServer(data, isAutoSave, force);
        break;
      default:
        throw new Error(`Unsupported storage type: ${this.config.storageType}`);
    }
  }

  // Save to localStorage
  private async saveToLocalStorage(data: PipelineData, force: boolean): Promise<void> {
    try {
      const key = `pipeline_${data.id}`;
      
      if (!force) {
        // Check for conflicts
        const existing = localStorage.getItem(key);
        if (existing) {
          const existingData: PipelineData = JSON.parse(existing);
          if (existingData.metadata.checksum !== data.metadata.checksum) {
            await this.handleConflict(data, existingData);
            return;
          }
        }
      }

      localStorage.setItem(key, JSON.stringify(data));
      
      // Also save to backup key
      localStorage.setItem(`${key}_backup`, JSON.stringify(data));
      
    } catch (error) {
      throw new PipelineError({
        code: ERROR_CODES.SAVE_FAILED,
        message: `Failed to save to localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'high',
        recoverable: true,
        context: {
          component: 'auto-save',
          action: 'saveToLocalStorage',
          timestamp: new Date(),
        },
      });
    }
  }

  // Save to IndexedDB
  private async saveToIndexedDB(data: PipelineData, force: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PipelineDB', 1);
      
      request.onerror = () => {
        reject(new PipelineError({
          code: ERROR_CODES.SAVE_FAILED,
          message: 'Failed to open IndexedDB',
          severity: 'high',
          recoverable: true,
          context: {
            component: 'auto-save',
            action: 'saveToIndexedDB',
            timestamp: new Date(),
          },
        }));
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('pipelines')) {
          db.createObjectStore('pipelines', { keyPath: 'id' });
        }
      };

      request.onsuccess = async (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['pipelines'], 'readwrite');
        const store = transaction.objectStore('pipelines');

        if (!force) {
          // Check for conflicts
          const getRequest = store.get(data.id);
          getRequest.onsuccess = async () => {
            const existing = getRequest.result;
            if (existing && existing.metadata.checksum !== data.metadata.checksum) {
              await this.handleConflict(data, existing);
              resolve();
              return;
            }
            
            // No conflict, proceed with save
            const putRequest = store.put(data);
            putRequest.onsuccess = () => resolve();
            putRequest.onerror = () => reject(new Error('Failed to save to IndexedDB'));
          };
        } else {
          const putRequest = store.put(data);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(new Error('Failed to save to IndexedDB'));
        }
      };
    });
  }

  // Save to server
  private async saveToServer(data: PipelineData, isAutoSave: boolean, force: boolean): Promise<void> {
    try {
      const response = await fetch('/api/pipelines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auto-Save': isAutoSave.toString(),
          'X-Force-Save': force.toString(),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 409) {
          // Conflict detected
          const conflictData = await response.json();
          await this.handleConflict(data, conflictData.existing);
          return;
        }
        
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      // Update local data with server response
      if (result.metadata) {
        this.currentData = { ...data, metadata: { ...data.metadata, ...result.metadata } };
      }

    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new PipelineError({
          code: ERROR_CODES.NETWORK_ERROR,
          message: 'Network error while saving to server',
          severity: 'high',
          recoverable: true,
          context: {
            component: 'auto-save',
            action: 'saveToServer',
            timestamp: new Date(),
          },
        });
      }
      
      throw new PipelineError({
        code: ERROR_CODES.SAVE_FAILED,
        message: `Failed to save to server: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'high',
        recoverable: true,
        context: {
          component: 'auto-save',
          action: 'saveToServer',
          timestamp: new Date(),
        },
      });
    }
  }

  // Handle save conflicts
  private async handleConflict(localData: PipelineData, remoteData: PipelineData): Promise<void> {
    this.updateSaveState({ conflictDetected: true });

    const resolution: ConflictResolution = {
      strategy: this.config.conflictResolution === 'manual' ? 'manual' : this.config.conflictResolution as any,
      localData,
      remoteData,
    };

    switch (this.config.conflictResolution) {
      case 'auto-merge':
        resolution.mergedData = this.mergeData(localData, remoteData);
        resolution.strategy = 'merge';
        break;
      case 'overwrite':
        resolution.strategy = 'keep-local';
        break;
      case 'manual':
      default:
        // Show conflict resolution UI
        await this.showConflictResolutionDialog(resolution);
        break;
    }

    await this.applyConflictResolution(resolution);
  }

  // Merge conflicting data
  private mergeData(localData: PipelineData, remoteData: PipelineData): PipelineData {
    // Simple merge strategy - prefer local changes but keep remote metadata
    return {
      ...localData,
      metadata: {
        ...remoteData.metadata,
        modified: new Date(),
        version: this.incrementVersion(remoteData.metadata.version),
        checksum: this.generateChecksum(localData.nodes, localData.edges),
      },
    };
  }

  // Show conflict resolution dialog
  private async showConflictResolutionDialog(resolution: ConflictResolution): Promise<void> {
    return new Promise((resolve) => {
      // This would show a modal dialog for conflict resolution
      // For now, we'll default to keeping local changes
      toast({
        title: 'Conflict Detected',
        description: 'The pipeline has been modified elsewhere. Your local changes will be preserved.',
        duration: 5000,
      });
      
      resolution.strategy = 'keep-local';
      resolve();
    });
  }

  // Apply conflict resolution
  private async applyConflictResolution(resolution: ConflictResolution): Promise<void> {
    let dataToSave: PipelineData;

    switch (resolution.strategy) {
      case 'keep-local':
        dataToSave = resolution.localData;
        break;
      case 'keep-remote':
        dataToSave = resolution.remoteData;
        this.currentData = resolution.remoteData;
        break;
      case 'merge':
        dataToSave = resolution.mergedData!;
        this.currentData = resolution.mergedData!;
        break;
      default:
        throw new Error(`Unknown conflict resolution strategy: ${resolution.strategy}`);
    }

    // Force save the resolved data
    await this.saveData(dataToSave, false, true);
    
    this.updateSaveState({ conflictDetected: false });
  }

  // Handle save errors
  private handleSaveError(error: Error, isAutoSave: boolean): void {
    this.retryCount++;
    
    this.updateSaveState({
      isSaving: false,
      saveError: error.message,
    });

    if (this.retryCount < this.config.maxRetries) {
      // Retry after a delay
      setTimeout(() => {
        if (isAutoSave) {
          this.performAutoSave();
        }
      }, Math.pow(2, this.retryCount) * 1000); // Exponential backoff
    } else {
      // Max retries reached
      this.errorHandler.handleError(
        ErrorHandler.createSaveError(
          `Save failed after ${this.config.maxRetries} attempts: ${error.message}`,
          {
            component: 'auto-save',
            action: isAutoSave ? 'auto-save' : 'manual-save',
            timestamp: new Date(),
            metadata: { retryCount: this.retryCount },
          }
        )
      );
      
      this.retryCount = 0;
    }
  }

  // Handle page unload
  private handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.saveState.hasUnsavedChanges) {
      event.preventDefault();
      event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      
      // Try to save synchronously (limited time)
      if (this.currentData) {
        try {
          localStorage.setItem(`pipeline_${this.currentData.id}_emergency`, JSON.stringify(this.currentData));
        } catch (error) {
          console.error('Emergency save failed:', error);
        }
      }
    }
  }

  // Handle visibility change
  private handleVisibilityChange(): void {
    if (document.hidden && this.saveState.hasUnsavedChanges) {
      // Tab is becoming hidden, try to save
      this.performAutoSave();
    }
  }

  // Update save state and notify listeners
  private updateSaveState(updates: Partial<SaveState>): void {
    this.saveState = { ...this.saveState, ...updates };
    this.listeners.forEach(listener => listener(this.saveState));
  }

  // Subscribe to save state changes
  subscribe(listener: (state: SaveState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Get current save state
  getSaveState(): SaveState {
    return { ...this.saveState };
  }

  // Load data from storage
  async loadData(id: string): Promise<PipelineData | null> {
    try {
      switch (this.config.storageType) {
        case 'localStorage':
          return this.loadFromLocalStorage(id);
        case 'indexedDB':
          return await this.loadFromIndexedDB(id);
        case 'server':
          return await this.loadFromServer(id);
        default:
          throw new Error(`Unsupported storage type: ${this.config.storageType}`);
      }
    } catch (error) {
      this.errorHandler.handleError(error as Error, {
        component: 'auto-save',
        action: 'loadData',
        timestamp: new Date(),
        metadata: { pipelineId: id },
      });
      return null;
    }
  }

  // Load from localStorage
  private loadFromLocalStorage(id: string): PipelineData | null {
    try {
      const data = localStorage.getItem(`pipeline_${id}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      // Try backup
      try {
        const backup = localStorage.getItem(`pipeline_${id}_backup`);
        return backup ? JSON.parse(backup) : null;
      } catch (backupError) {
        return null;
      }
    }
  }

  // Load from IndexedDB
  private async loadFromIndexedDB(id: string): Promise<PipelineData | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PipelineDB', 1);
      
      request.onerror = () => reject(new Error('Failed to open IndexedDB'));
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['pipelines'], 'readonly');
        const store = transaction.objectStore('pipelines');
        const getRequest = store.get(id);
        
        getRequest.onsuccess = () => resolve(getRequest.result || null);
        getRequest.onerror = () => resolve(null);
      };
    });
  }

  // Load from server
  private async loadFromServer(id: string): Promise<PipelineData | null> {
    try {
      const response = await fetch(`/api/pipelines/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new PipelineError({
        code: ERROR_CODES.LOAD_FAILED,
        message: `Failed to load from server: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'high',
        recoverable: true,
        context: {
          component: 'auto-save',
          action: 'loadFromServer',
          timestamp: new Date(),
        },
      });
    }
  }

  // Utility methods
  private generateChecksum(nodes: PipelineNode[], edges: PipelineEdge[]): string {
    const data = JSON.stringify({ nodes, edges });
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0] || '1'}.${parts[1] || '0'}.${patch}`;
  }

  // Cleanup
  destroy(): void {
    this.stopAutoSave();
    window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    this.listeners.clear();
  }
}

// Export singleton instance
export const autoSaveManager = new AutoSaveManager();