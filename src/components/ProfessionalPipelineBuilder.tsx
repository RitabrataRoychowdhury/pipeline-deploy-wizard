import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Node, Edge, Connection } from '@xyflow/react';
import { EnhancedPipelineCanvas } from './EnhancedPipelineCanvas';
import { AdvancedComponentPalette } from './AdvancedComponentPalette';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { ActionButton } from '@/components/ui/action-button';
import { 
  Package, 
  Maximize2, 
  Minimize2, 
  Sun, 
  Moon, 
  Settings, 
  Download, 
  Upload,
  FileText,
  Save,
  FolderOpen,
  Eye,
  EyeOff,
  Layers,
  Navigation,
  Grid3X3,
  Move,
  RotateCcw,
  Zap,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  exportPipelineData, 
  importPipelineData, 
  validatePipeline,
  PipelineNode as PipelineNodeType,
  PipelineEdge
} from '@/lib/pipeline-utils';

interface ProfessionalPipelineBuilderProps {
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  onLoad?: () => Promise<{ nodes: Node[]; edges: Edge[]; name: string } | null>;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  pipelineName?: string;
  readOnly?: boolean;
  className?: string;
}

export const ProfessionalPipelineBuilder: React.FC<ProfessionalPipelineBuilderProps> = ({
  onSave,
  onLoad,
  initialNodes = [],
  initialEdges = [],
  pipelineName = 'New Pipeline',
  readOnly = false,
  className = ''
}) => {
  // State management
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [currentPipelineName, setCurrentPipelineName] = useState(pipelineName);
  const [isComponentPaletteOpen, setIsComponentPaletteOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'paused' | 'completed' | 'error'>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle nodes change
  const handleNodesChange = useCallback((changes: any) => {
    setNodes(changes);
    setHasUnsavedChanges(true);
  }, []);

  // Handle edges change
  const handleEdgesChange = useCallback((changes: any) => {
    setEdges(changes);
    setHasUnsavedChanges(true);
  }, []);

  // Handle connection
  const handleConnect = useCallback((connection: Connection) => {
    setHasUnsavedChanges(true);
  }, []);

  // Save pipeline
  const handleSave = useCallback(async (nodesToSave: Node[], edgesToSave: Edge[]) => {
    try {
      if (onSave) {
        await onSave(nodesToSave, edgesToSave);
      }
      setHasUnsavedChanges(false);
      toast.success('Pipeline saved successfully!');
    } catch (error) {
      toast.error(`Failed to save pipeline: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }, [onSave]);

  // Load pipeline
  const handleLoad = useCallback(async () => {
    try {
      if (onLoad) {
        const result = await onLoad();
        if (result) {
          setNodes(result.nodes);
          setEdges(result.edges);
          setCurrentPipelineName(result.name);
          setHasUnsavedChanges(false);
          toast.success('Pipeline loaded successfully!');
        }
      }
    } catch (error) {
      toast.error(`Failed to load pipeline: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }, [onLoad]);

  // Export pipeline
  const handleExport = useCallback(async (format: 'yaml' | 'json' = 'yaml') => {
    try {
      const exportData = await exportPipelineData(
        nodes as PipelineNodeType[], 
        edges as PipelineEdge[], 
        currentPipelineName,
        format
      );
      
      const blob = new Blob([exportData.content], { type: exportData.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportData.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Pipeline exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(`Failed to export pipeline: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }, [nodes, edges, currentPipelineName]);

  // Import pipeline
  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = importPipelineData(content);
        
        setNodes(importedData.nodes);
        setEdges(importedData.edges);
        setCurrentPipelineName(importedData.name);
        setHasUnsavedChanges(true);
        
        toast.success('Pipeline imported successfully!');
      } catch (error) {
        toast.error(`Failed to import pipeline: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  }, []);

  // Validate pipeline
  const handleValidate = useCallback(() => {
    try {
      const validation = validatePipeline(nodes as PipelineNodeType[], edges as PipelineEdge[]);
      
      if (validation.isValid) {
        toast.success('Pipeline validation passed!');
      } else {
        toast.error(`Pipeline validation failed: ${validation.errors.join(', ')}`);
      }
      
      if (validation.warnings.length > 0) {
        toast.warning(`Warnings: ${validation.warnings.join(', ')}`);
      }
      
      return validation;
    } catch (error) {
      toast.error(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors: ['Validation failed'], warnings: [] };
    }
  }, [nodes, edges]);

  // Execute pipeline (mock implementation)
  const handleExecute = useCallback(async () => {
    const validation = handleValidate();
    if (!validation.isValid) {
      toast.error('Cannot execute invalid pipeline');
      return;
    }

    setIsExecuting(true);
    setExecutionStatus('running');
    
    try {
      // Mock execution - in real implementation, this would trigger actual pipeline execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setExecutionStatus('completed');
      toast.success('Pipeline executed successfully!');
    } catch (error) {
      setExecutionStatus('error');
      toast.error(`Pipeline execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExecuting(false);
      setTimeout(() => setExecutionStatus('idle'), 3000);
    }
  }, [handleValidate]);

  // Pause execution (mock implementation)
  const handlePause = useCallback(() => {
    setExecutionStatus('paused');
    toast.info('Pipeline execution paused');
  }, []);

  // Stop execution (mock implementation)
  const handleStop = useCallback(() => {
    setIsExecuting(false);
    setExecutionStatus('idle');
    toast.info('Pipeline execution stopped');
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
    document.documentElement.classList.toggle('dark');
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const { ctrlKey, metaKey, key } = event;
      const isModifierPressed = ctrlKey || metaKey;

      switch (key.toLowerCase()) {
        case 's':
          if (isModifierPressed) {
            event.preventDefault();
            handleSave(nodes, edges);
          }
          break;
        case 'o':
          if (isModifierPressed) {
            event.preventDefault();
            handleLoad();
          }
          break;
        case 'e':
          if (isModifierPressed) {
            event.preventDefault();
            handleExport();
          }
          break;
        case 'p':
          if (!isModifierPressed) {
            event.preventDefault();
            setIsComponentPaletteOpen(prev => !prev);
          }
          break;
        case 'f11':
          event.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [nodes, edges, handleSave, handleLoad, handleExport, toggleFullscreen]);

  // Get execution status color
  const getExecutionStatusColor = () => {
    switch (executionStatus) {
      case 'running': return 'text-blue-500';
      case 'paused': return 'text-yellow-500';
      case 'completed': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  // Get execution status icon
  const getExecutionStatusIcon = () => {
    switch (executionStatus) {
      case 'running': return Play;
      case 'paused': return Pause;
      case 'completed': return Zap;
      case 'error': return Square;
      default: return Square;
    }
  };

  const StatusIcon = getExecutionStatusIcon();

  return (
    <div className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''} ${className}`}>
      {/* Top Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            {currentPipelineName}
            {hasUnsavedChanges && <span className="text-orange-500">*</span>}
          </h1>
          
          <Badge variant={executionStatus === 'idle' ? 'secondary' : 'default'} className={getExecutionStatusColor()}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {executionStatus.charAt(0).toUpperCase() + executionStatus.slice(1)}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* File Operations */}
          <div className="flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.yaml,.yml"
              onChange={handleImport}
              className="hidden"
            />
            
            <ActionButton
              action="custom"
              onAction={handleLoad}
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-sm"
              icon={FolderOpen}
              successMessage="Pipeline loaded!"
              errorMessage="Failed to load pipeline"
              disabled={readOnly}
            >
              Load
            </ActionButton>
            
            <ActionButton
              action="save"
              onAction={() => handleSave(nodes, edges)}
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-sm"
              disabled={nodes.length === 0 || readOnly}
              successMessage="Pipeline saved!"
              errorMessage="Failed to save pipeline"
            >
              Save
            </ActionButton>
            
            <ActionButton
              action="custom"
              onAction={() => fileInputRef.current?.click()}
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-sm"
              icon={Upload}
              disabled={readOnly}
            >
              Import
            </ActionButton>
            
            <ActionButton
              action="custom"
              onAction={() => handleExport('yaml')}
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-sm"
              icon={Download}
              disabled={nodes.length === 0}
              successMessage="Pipeline exported!"
              errorMessage="Failed to export pipeline"
            >
              Export
            </ActionButton>
          </div>

          <Separator orientation="vertical" className="h-4" />

          {/* Execution Controls */}
          {!readOnly && (
            <div className="flex items-center gap-1">
              <ActionButton
                action="custom"
                onAction={() => { handleValidate(); }}
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-sm"
                icon={FileText}
                disabled={nodes.length === 0}
                successMessage="Validation passed!"
                errorMessage="Validation failed"
              >
                Validate
              </ActionButton>
              
              <ActionButton
                action="custom"
                onAction={handleExecute}
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-sm"
                icon={Play}
                disabled={nodes.length === 0 || isExecuting}
                loading={isExecuting}
                successMessage="Pipeline executed!"
                errorMessage="Execution failed"
              >
                Execute
              </ActionButton>
              
              {executionStatus === 'running' && (
                <>
                  <ActionButton
                    action="custom"
                    onAction={handlePause}
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-sm"
                    icon={Pause}
                  >
                    Pause
                  </ActionButton>
                  
                  <ActionButton
                    action="custom"
                    onAction={handleStop}
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-sm text-destructive hover:text-destructive"
                    icon={Square}
                  >
                    Stop
                  </ActionButton>
                </>
              )}
            </div>
          )}

          <Separator orientation="vertical" className="h-4" />

          {/* View Controls */}
          <div className="flex items-center gap-1">
            <LoadingButton
              variant="ghost"
              size="sm"
              onClick={() => setIsComponentPaletteOpen(!isComponentPaletteOpen)}
              className={`h-8 w-8 p-0 ${isComponentPaletteOpen ? 'bg-primary text-primary-foreground' : ''}`}
              title="Toggle Component Palette (P)"
            >
              <Layers className="h-4 w-4" />
            </LoadingButton>
            
            <LoadingButton
              variant="ghost"
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
              className={`h-8 w-8 p-0 ${showGrid ? 'bg-primary text-primary-foreground' : ''}`}
              title="Toggle Grid"
            >
              <Grid3X3 className="h-4 w-4" />
            </LoadingButton>
            
            <LoadingButton
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="h-8 w-8 p-0"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </LoadingButton>
            
            <LoadingButton
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="h-8 w-8 p-0"
              title="Toggle Fullscreen (F11)"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </LoadingButton>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Component Palette */}
        <AdvancedComponentPalette
          isOpen={isComponentPaletteOpen}
          onClose={() => setIsComponentPaletteOpen(false)}
        />

        {/* Canvas */}
        <div className="flex-1 relative">
          <EnhancedPipelineCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={handleConnect}
            onSave={handleSave}
            showGrid={showGrid}
            snapToGrid={snapToGrid}
            readOnly={readOnly}
            className="h-full"
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-border/50 bg-muted/20 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>{nodes.length} nodes</span>
          <span>{edges.length} connections</span>
          {hasUnsavedChanges && <span className="text-orange-500">Unsaved changes</span>}
        </div>
        
        <div className="flex items-center gap-4">
          <span>Professional Pipeline Builder</span>
          <span>Press P to toggle palette, F11 for fullscreen</span>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalPipelineBuilder;