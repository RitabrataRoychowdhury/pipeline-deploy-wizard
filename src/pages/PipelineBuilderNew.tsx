import React, { useState, useCallback } from 'react';
import { PipelineCanvas } from '@/components/PipelineCanvas';
import { ComponentPalette } from '@/components/ComponentPalette';
import { Button } from '@/components/ui/button';
import { ActionButton } from '@/components/ui/action-button';
import { LoadingButton } from '@/components/ui/loading-button';
import { 
  Package, 
  X, 
  Maximize2, 
  Minimize2,
  Save,
  FileText,
  Settings,
  Play,
  Eye,
  EyeOff,
  Download,
  Copy
} from 'lucide-react';
import { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';
import { pipelineToYAML, validatePipeline, PipelineNode, PipelineEdge } from '@/lib/pipeline-utils';

interface PipelineBuilderNewProps {
  onSave?: (yaml: string) => void;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  readOnly?: boolean;
}

export const PipelineBuilderNew: React.FC<PipelineBuilderNewProps> = ({
  onSave,
  initialNodes = [],
  initialEdges = [],
  readOnly = false
}) => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [isPaletteOpen, setIsPaletteOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [pipelineName, setPipelineName] = useState('My Pipeline');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
  const handleConnect = useCallback((connection: any) => {
    setEdges((eds) => [...eds, connection]);
    setHasUnsavedChanges(true);
  }, []);

  // Save pipeline
  const handleSave = useCallback(async (savedNodes?: Node[], savedEdges?: Edge[]) => {
    const nodesToSave = savedNodes || nodes;
    const edgesToSave = savedEdges || edges;
    
    setIsSaving(true);
    
    try {
      const validation = validatePipeline(nodesToSave as PipelineNode[], edgesToSave as PipelineEdge[]);
      
      if (!validation.isValid) {
        throw new Error(`Cannot save pipeline: ${validation.errors.join(', ')}`);
      }

      if (validation.warnings.length > 0) {
        toast.warning(`Pipeline warnings: ${validation.warnings.join(', ')}`);
      }

      const yaml = pipelineToYAML(nodesToSave as PipelineNode[], edgesToSave as PipelineEdge[], pipelineName);
      
      if (onSave) {
        await onSave(yaml);
      }
      
      // Update local state
      setNodes(nodesToSave);
      setEdges(edgesToSave);
      setHasUnsavedChanges(false);
      
      toast.success('Pipeline saved successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save pipeline';
      toast.error(errorMessage);
      throw error; // Re-throw for ActionButton to handle
    } finally {
      setIsSaving(false);
    }
  }, [onSave, pipelineName, nodes, edges]);

  // Generate YAML preview
  const generateYAMLPreview = useCallback(() => {
    try {
      return pipelineToYAML(nodes as PipelineNode[], edges as PipelineEdge[], pipelineName);
    } catch (error) {
      return `# Error generating YAML preview: ${error}`;
    }
  }, [nodes, edges, pipelineName]);

  // Export pipeline as YAML file
  const handleExportYAML = useCallback(async () => {
    const validation = validatePipeline(nodes as PipelineNode[], edges as PipelineEdge[]);
    
    if (!validation.isValid) {
      throw new Error(`Cannot export pipeline: ${validation.errors.join(', ')}`);
    }

    const yaml = generateYAMLPreview();
    return {
      yaml,
      name: pipelineName
    };
  }, [nodes, edges, pipelineName, generateYAMLPreview]);

  // Copy YAML to clipboard
  const handleCopyYAML = useCallback(async () => {
    const validation = validatePipeline(nodes as PipelineNode[], edges as PipelineEdge[]);
    
    if (!validation.isValid) {
      throw new Error(`Cannot copy pipeline: ${validation.errors.join(', ')}`);
    }

    return generateYAMLPreview();
  }, [nodes, edges, generateYAMLPreview]);

  // Clear pipeline
  const handleClearPipeline = useCallback(async () => {
    setNodes([]);
    setEdges([]);
    setHasUnsavedChanges(false);
  }, []);

  // Handle unsaved changes warning
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return (
    <div className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Pipeline Builder</h1>
          <input
            type="text"
            value={pipelineName}
            onChange={(e) => setPipelineName(e.target.value)}
            className="px-3 py-1 text-sm border rounded-md bg-background"
            placeholder="Pipeline name"
            disabled={readOnly}
          />
        </div>
        
        <div className="flex items-center gap-2">
          {!readOnly && (
            <>
              <LoadingButton
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="gap-2"
                icon={showPreview ? EyeOff : Eye}
              >
                {showPreview ? 'Hide' : 'Show'} YAML
              </LoadingButton>
              
              <LoadingButton
                variant="outline"
                size="sm"
                onClick={() => setIsPaletteOpen(!isPaletteOpen)}
                className="gap-2"
                icon={Package}
              >
                {isPaletteOpen ? 'Hide' : 'Show'} Components
              </LoadingButton>

              <ActionButton
                action="save"
                onAction={() => handleSave()}
                loading={isSaving}
                disabled={nodes.length === 0}
                size="sm"
                className="gap-2"
                successMessage="Pipeline saved!"
                errorMessage="Failed to save pipeline"
              >
                Save Pipeline
              </ActionButton>

              <ActionButton
                action="export"
                onAction={handleExportYAML}
                disabled={nodes.length === 0}
                size="sm"
                className="gap-2"
                successMessage="Pipeline exported!"
                errorMessage="Failed to export pipeline"
              >
                Export YAML
              </ActionButton>

              <ActionButton
                action="delete"
                onAction={handleClearPipeline}
                disabled={nodes.length === 0}
                size="sm"
                variant="outline"
                className="gap-2 text-destructive hover:text-destructive"
                confirmAction={true}
                confirmMessage="Are you sure you want to clear the entire pipeline? This action cannot be undone."
                successMessage="Pipeline cleared"
                errorMessage="Failed to clear pipeline"
              >
                Clear All
              </ActionButton>
            </>
          )}
          
          <LoadingButton
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="gap-2"
            icon={isFullscreen ? Minimize2 : Maximize2}
          >
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </LoadingButton>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Component Palette */}
        {isPaletteOpen && !readOnly && (
          <div className="w-80 border-r bg-background/50 backdrop-blur-sm">
            <ComponentPalette 
              isOpen={isPaletteOpen}
              onClose={() => setIsPaletteOpen(false)}
            />
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 relative">
          <PipelineCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={handleConnect}
            onSave={handleSave}
            readOnly={readOnly}
            className="h-full"
          />
        </div>

        {/* YAML Preview Panel */}
        {showPreview && (
          <div className="w-96 border-l bg-background/50 backdrop-blur-sm flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  YAML Preview
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              <pre className="text-xs bg-muted/50 p-3 rounded-lg overflow-auto">
                <code>{generateYAMLPreview()}</code>
              </pre>
            </div>
            
            <div className="p-4 border-t space-y-2">
              <ActionButton
                action="copy"
                onAction={handleCopyYAML}
                className="w-full gap-2"
                size="sm"
                disabled={nodes.length === 0}
                successMessage="YAML copied to clipboard!"
                errorMessage="Failed to copy YAML"
              >
                Copy YAML
              </ActionButton>
              
              <ActionButton
                action="export"
                onAction={handleExportYAML}
                variant="outline"
                className="w-full gap-2"
                size="sm"
                disabled={nodes.length === 0}
                icon={Download}
                successMessage="YAML file downloaded!"
                errorMessage="Failed to download YAML"
              >
                Download YAML
              </ActionButton>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t bg-background/95 backdrop-blur-sm text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>{nodes.length} nodes</span>
          <span>{edges.length} connections</span>
          {hasUnsavedChanges && (
            <span className="text-yellow-600 flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse" />
              Unsaved changes
            </span>
          )}
          {nodes.length > 0 && !hasUnsavedChanges && (
            <span className="text-green-600">
              ✓ Pipeline saved
            </span>
          )}
          {nodes.length === 0 && (
            <span className="text-muted-foreground">
              Add components to start building
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-xs">
          <span>Keyboard shortcuts:</span>
          <kbd className="px-1 py-0.5 bg-muted rounded">G</kbd>
          <span>Grid</span>
          <kbd className="px-1 py-0.5 bg-muted rounded">R</kbd>
          <span>Reset</span>
          <kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+S</kbd>
          <span>Save</span>
          <kbd className="px-1 py-0.5 bg-muted rounded">Del</kbd>
          <span>Delete</span>
        </div>
      </div>
    </div>
  );
};

export default PipelineBuilderNew;