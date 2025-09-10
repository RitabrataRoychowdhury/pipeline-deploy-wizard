import React, { useState, useCallback } from 'react';
import { PipelineCanvas } from '@/components/PipelineCanvas';
import { ComponentPalette } from '@/components/ComponentPalette';
import { Button } from '@/components/ui/button';
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
  EyeOff
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

  // Handle nodes change
  const handleNodesChange = useCallback((changes: any) => {
    setNodes(changes);
  }, []);

  // Handle edges change
  const handleEdgesChange = useCallback((changes: any) => {
    setEdges(changes);
  }, []);

  // Handle connection
  const handleConnect = useCallback((connection: any) => {
    setEdges((eds) => [...eds, connection]);
  }, []);

  // Save pipeline
  const handleSave = useCallback((savedNodes: Node[], savedEdges: Edge[]) => {
    const validation = validatePipeline(savedNodes as PipelineNode[], savedEdges as PipelineEdge[]);
    
    if (!validation.isValid) {
      toast.error(`Cannot save pipeline: ${validation.errors.join(', ')}`);
      return;
    }

    if (validation.warnings.length > 0) {
      toast.warning(`Pipeline warnings: ${validation.warnings.join(', ')}`);
    }

    const yaml = pipelineToYAML(savedNodes as PipelineNode[], savedEdges as PipelineEdge[], pipelineName);
    onSave?.(yaml);
    
    // Update local state
    setNodes(savedNodes);
    setEdges(savedEdges);
    
    toast.success('Pipeline saved successfully!');
  }, [onSave, pipelineName]);

  // Generate YAML preview
  const generateYAMLPreview = useCallback(() => {
    try {
      return pipelineToYAML(nodes as PipelineNode[], edges as PipelineEdge[], pipelineName);
    } catch (error) {
      return `# Error generating YAML preview: ${error}`;
    }
  }, [nodes, edges, pipelineName]);

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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="gap-2"
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPreview ? 'Hide' : 'Show'} YAML
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPaletteOpen(!isPaletteOpen)}
                className="gap-2"
              >
                <Package className="h-4 w-4" />
                {isPaletteOpen ? 'Hide' : 'Show'} Components
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="gap-2"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </Button>
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
            
            <div className="p-4 border-t">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(generateYAMLPreview());
                  toast.success('YAML copied to clipboard');
                }}
                className="w-full gap-2"
                size="sm"
              >
                <FileText className="h-4 w-4" />
                Copy YAML
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t bg-background/95 backdrop-blur-sm text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>{nodes.length} nodes</span>
          <span>{edges.length} connections</span>
          {nodes.length > 0 && (
            <span className="text-green-600">
              ✓ Pipeline ready
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