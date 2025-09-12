import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  EdgeTypes,
  BackgroundVariant,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
  SelectionMode,
  Panel,
  useOnSelectionChange,
  getRectOfNodes,
  getTransformForBounds,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { PipelineNode } from './PipelineNode';
import { CustomizableEdge, CustomEdgeData } from './CustomizableEdge';
import { EdgeConfigurationDialog } from './EdgeConfigurationDialog';
import { ConnectionToolbar } from './ConnectionToolbar';
import { NodeConfigurationDialog } from './NodeConfigurationDialog';
import { 
  generateNodeId, 
  generateEdgeId, 
  getComponentDefinition,
  setupKeyboardShortcuts,
  validatePipeline,
  autoLayoutNodes,
  PipelineNode as PipelineNodeType,
  PipelineEdge
} from '@/lib/pipeline-utils';
import { ComponentDefinition } from '@/lib/pipeline-utils';
import { Button } from '@/components/ui/button';
import { ActionButton } from '@/components/ui/action-button';
import { LoadingButton } from '@/components/ui/loading-button';
import { Badge } from '@/components/ui/badge';
import { 
  Grid3X3, 
  Move, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2,
  Save,
  Trash2,
  Copy,
  Scissors,
  Undo2,
  Redo2,
  Play,
  Pause,
  Settings,
  Eye,
  EyeOff,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Group,
  Ungroup,
  MousePointer2,
  Hand,
  Square,
  Circle,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Layers,
  Target,
  Navigation,
  Crosshair,
  Link,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface EnhancedPipelineCanvasProps {
  nodes?: Node[];
  edges?: Edge[];
  onNodesChange?: (changes: any) => void;
  onEdgesChange?: (changes: any) => void;
  onConnect?: (connection: Connection) => void;
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  showGrid?: boolean;
  snapToGrid?: boolean;
  className?: string;
  readOnly?: boolean;
}

interface NodeGroup {
  id: string;
  label: string;
  nodeIds: string[];
  position: { x: number; y: number };
  size: { width: number; height: number };
  color: string;
}

// Selection tool types
type SelectionTool = 'select' | 'pan' | 'connect';

// Connection types for quick selection
const connectionTypeDefaults: Record<string, Partial<CustomEdgeData>> = {
  default: {
    edgeType: 'default',
    animated: false,
    style: { stroke: '#6366f1', strokeWidth: 2 }
  },
  conditional: {
    edgeType: 'conditional',
    animated: true,
    style: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5,5' }
  },
  parallel: {
    edgeType: 'parallel',
    animated: true,
    style: { stroke: '#10b981', strokeWidth: 3 }
  },
  loop: {
    edgeType: 'loop',
    animated: true,
    style: { stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '10,5' }
  },
  error: {
    edgeType: 'error',
    animated: false,
    style: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '3,3' }
  },
  success: {
    edgeType: 'success',
    animated: false,
    style: { stroke: '#22c55e', strokeWidth: 2 }
  }
};

// Internal Canvas Component (wrapped by ReactFlowProvider)
const EnhancedPipelineCanvasInternal: React.FC<EnhancedPipelineCanvasProps> = ({
  nodes: initialNodes = [],
  edges: initialEdges = [],
  onNodesChange: externalOnNodesChange,
  onEdgesChange: externalOnEdgesChange,
  onConnect: externalOnConnect,
  onSave,
  showGrid = true,
  snapToGrid = false,
  className = '',
  readOnly = false
}) => {
  // Internal state management
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([]);
  const [nodeGroups, setNodeGroups] = useState<NodeGroup[]>([]);
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[]; groups: NodeGroup[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isGridVisible, setIsGridVisible] = useState(showGrid);
  const [isSnapToGrid, setIsSnapToGrid] = useState(snapToGrid);
  const [gridSize, setGridSize] = useState(20);
  const [selectionTool, setSelectionTool] = useState<SelectionTool>('select');
  const [selectedConnectionType, setSelectedConnectionType] = useState('default');
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [showMinimap, setShowMinimap] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showConnectionToolbar, setShowConnectionToolbar] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [configDialog, setConfigDialog] = useState<{
    isOpen: boolean;
    nodeId: string;
    nodeData: any;
  }>({
    isOpen: false,
    nodeId: '',
    nodeData: null
  });
  const [edgeConfigDialog, setEdgeConfigDialog] = useState<{
    isOpen: boolean;
    edgeId: string;
    edgeData: CustomEdgeData | null;
  }>({
    isOpen: false,
    edgeId: '',
    edgeData: null
  });

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { 
    screenToFlowPosition, 
    fitView, 
    zoomIn, 
    zoomOut, 
    setViewport, 
    getViewport,
    getNodes,
    getEdges,
    getZoom,
    project,
    flowToScreenPosition
  } = useReactFlow();

  // Custom node and edge types
  const nodeTypes: NodeTypes = {
    pipelineNode: PipelineNode as any,
  };

  const edgeTypes: EdgeTypes = {
    customizable: CustomizableEdge as any,
  };

  // Save state to history for undo/redo
  const saveToHistory = useCallback(() => {
    const currentState = { 
      nodes: getNodes(), 
      edges: getEdges(), 
      groups: nodeGroups 
    };
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(currentState);
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [getNodes, getEdges, historyIndex, nodeGroups]);

  // Undo functionality
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setNodeGroups(prevState.groups);
      setHistoryIndex(prev => prev - 1);
      toast.success('Undone');
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Redo functionality
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setNodeGroups(nextState.groups);
      setHistoryIndex(prev => prev + 1);
      toast.success('Redone');
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Handle connection between nodes with custom edge type
  const handleConnect = useCallback((params: Connection) => {
    if (readOnly) return;
    
    saveToHistory();
    
    const connectionDefaults = connectionTypeDefaults[selectedConnectionType] || connectionTypeDefaults.default;
    
    const newEdge: Edge = {
      ...params,
      id: generateEdgeId(params.source!, params.target!),
      type: 'customizable',
      animated: connectionDefaults.animated || false,
      style: connectionDefaults.style || { stroke: '#6366f1', strokeWidth: 2 },
      data: {
        ...connectionDefaults,
        label: '',
      } as CustomEdgeData,
    };
    
    setEdges((eds) => addEdge(newEdge, eds));
    externalOnConnect?.({ 
      ...newEdge, 
      sourceHandle: newEdge.sourceHandle || '', 
      targetHandle: newEdge.targetHandle || '' 
    });

    toast.success(`Added ${connectionDefaults.edgeType} connection`);
  }, [readOnly, setEdges, externalOnConnect, saveToHistory, selectedConnectionType]);

  // Handle selection changes
  useOnSelectionChange({
    onChange: ({ nodes, edges }) => {
      setSelectedNodes(nodes);
      setSelectedEdges(edges);
    },
  });

  // Handle edge configuration
  useEffect(() => {
    const handleEdgeConfigure = (event: CustomEvent) => {
      const { edgeId, data } = event.detail;
      setEdgeConfigDialog({
        isOpen: true,
        edgeId,
        edgeData: data
      });
    };

    const handleEdgeDelete = (event: CustomEvent) => {
      const { edgeId } = event.detail;
      saveToHistory();
      setEdges((eds) => eds.filter(edge => edge.id !== edgeId));
      toast.success('Connection deleted');
    };

    window.addEventListener('edge-configure', handleEdgeConfigure as EventListener);
    window.addEventListener('edge-delete', handleEdgeDelete as EventListener);

    return () => {
      window.removeEventListener('edge-configure', handleEdgeConfigure as EventListener);
      window.removeEventListener('edge-delete', handleEdgeDelete as EventListener);
    };
  }, [setEdges, saveToHistory]);

  // Handle edge configuration save
  const handleEdgeConfigSave = useCallback((edgeData: CustomEdgeData) => {
    saveToHistory();
    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === edgeConfigDialog.edgeId
          ? { 
              ...edge, 
              data: edgeData,
              style: edgeData.style,
              animated: edgeData.animated
            }
          : edge
      )
    );
    setEdgeConfigDialog({ isOpen: false, edgeId: '', edgeData: null });
    toast.success('Connection updated');
  }, [edgeConfigDialog.edgeId, setEdges, saveToHistory]);

  // Handle drag over canvas
  const onDragOver = useCallback((event: React.DragEvent) => {
    if (readOnly) return;
    
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    
    if (reactFlowWrapper.current) {
      const rect = reactFlowWrapper.current.getBoundingClientRect();
      setDragPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
    }
    
    setIsDragOver(true);
  }, [readOnly]);

  const onDragLeave = useCallback((event: React.DragEvent) => {
    if (!reactFlowWrapper.current?.contains(event.relatedTarget as Element)) {
      setIsDragOver(false);
    }
  }, []);

  // Handle drop on canvas
  const onDrop = useCallback((event: React.DragEvent) => {
    if (readOnly) return;
    
    event.preventDefault();
    setIsDragOver(false);

    const componentType = event.dataTransfer.getData('application/reactflow');
    const componentDataStr = event.dataTransfer.getData('application/json');
    
    if (!componentType) return;

    let componentData: ComponentDefinition | null = null;
    try {
      componentData = JSON.parse(componentDataStr);
    } catch {
      componentData = getComponentDefinition(componentType);
    }

    if (!componentData) return;

    saveToHistory();

    let position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    // Snap to grid if enabled
    if (isSnapToGrid) {
      position.x = Math.round(position.x / gridSize) * gridSize;
      position.y = Math.round(position.y / gridSize) * gridSize;
    }

    const newNode: Node = {
      id: generateNodeId(componentType),
      type: 'pipelineNode',
      position,
      data: {
        label: componentData.name,
        stepType: componentType,
        command: '',
        configuration: { ...componentData.defaultConfig },
        validation: {
          isValid: true,
          errors: [],
          warnings: []
        }
      },
    };

    setNodes((nds) => {
      const updatedNodes = nds.concat(newNode);
      
      // Auto-connect to the last selected node if it exists
      if (selectedNodes.length === 1) {
        const sourceNode = selectedNodes[0];
        const hasOutgoingConnection = edges.some(edge => edge.source === sourceNode.id);
        
        if (!hasOutgoingConnection) {
          const connectionDefaults = connectionTypeDefaults[selectedConnectionType] || connectionTypeDefaults.default;
          
          const newEdge: Edge = {
            id: generateEdgeId(sourceNode.id, newNode.id),
            source: sourceNode.id,
            target: newNode.id,
            type: 'customizable',
            animated: connectionDefaults.animated || false,
            style: connectionDefaults.style || { stroke: '#6366f1', strokeWidth: 2 },
            data: {
              ...connectionDefaults,
              label: '',
            } as CustomEdgeData,
          };
          setEdges((eds) => eds.concat(newEdge));
        }
      }
      
      return updatedNodes;
    });

    toast.success(`Added ${componentData.name} to pipeline`);
  }, [readOnly, screenToFlowPosition, setNodes, setEdges, edges, saveToHistory, selectedNodes, isSnapToGrid, gridSize, selectedConnectionType]);

  // Delete selected elements
  const deleteSelected = useCallback(() => {
    if (readOnly || (selectedNodes.length === 0 && selectedEdges.length === 0)) return;
    
    saveToHistory();
    
    const selectedNodeIds = selectedNodes.map(n => n.id);
    const selectedEdgeIds = selectedEdges.map(e => e.id);
    
    setNodes((nds) => nds.filter(node => !selectedNodeIds.includes(node.id)));
    setEdges((eds) => eds.filter(edge => 
      !selectedEdgeIds.includes(edge.id) &&
      !selectedNodeIds.includes(edge.source) &&
      !selectedNodeIds.includes(edge.target)
    ));
    
    // Remove nodes from groups
    setNodeGroups(prev => prev.map(group => ({
      ...group,
      nodeIds: group.nodeIds.filter(id => !selectedNodeIds.includes(id))
    })).filter(group => group.nodeIds.length > 0));
    
    toast.success(`Deleted ${selectedNodes.length} nodes and ${selectedEdges.length} connections`);
  }, [readOnly, selectedNodes, selectedEdges, setNodes, setEdges, saveToHistory]);

  // Save pipeline
  const savePipeline = useCallback(async () => {
    const validation = validatePipeline(nodes as PipelineNodeType[], edges as PipelineEdge[]);
    
    if (!validation.isValid) {
      throw new Error(`Cannot save: ${validation.errors.join(', ')}`);
    }
    
    if (validation.warnings.length > 0) {
      toast.warning(`Warnings: ${validation.warnings.join(', ')}`);
    }
    
    if (onSave) {
      await onSave(nodes, edges);
    }
  }, [nodes, edges, onSave]);

  // Update zoom level when viewport changes
  useEffect(() => {
    const updateZoom = () => {
      setZoomLevel(getZoom());
    };
    
    const interval = setInterval(updateZoom, 100);
    return () => clearInterval(interval);
  }, [getZoom]);

  // Setup keyboard shortcuts
  useEffect(() => {
    const cleanup = setupKeyboardShortcuts({
      onSave: savePipeline,
      onUndo: undo,
      onRedo: redo,
      onDelete: deleteSelected,
      onToggleGrid: () => setIsGridVisible(prev => !prev),
      onResetView: () => fitView({ padding: 0.2, duration: 300 }),
    });

    // Additional shortcuts for connection types
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = event.key;
      if (key >= '1' && key <= '6') {
        const connectionTypes = ['default', 'conditional', 'parallel', 'loop', 'error', 'success'];
        const index = parseInt(key) - 1;
        if (index < connectionTypes.length) {
          setSelectedConnectionType(connectionTypes[index]);
          toast.success(`Connection type: ${connectionTypes[index]}`);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      cleanup();
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [savePipeline, undo, redo, deleteSelected, fitView]);

  // Sync with external state changes
  useEffect(() => {
    if (externalOnNodesChange) {
      externalOnNodesChange(nodes);
    }
  }, [nodes, externalOnNodesChange]);

  useEffect(() => {
    if (externalOnEdgesChange) {
      externalOnEdgesChange(edges);
    }
  }, [edges, externalOnEdgesChange]);

  // Memoized selection info
  const selectionInfo = useMemo(() => {
    return {
      nodeCount: selectedNodes.length,
      edgeCount: selectedEdges.length,
      totalNodes: nodes.length,
      totalEdges: edges.length,
      canAlign: selectedNodes.length >= 2,
      canDistribute: selectedNodes.length >= 3,
      canGroup: selectedNodes.length >= 2,
    };
  }, [selectedNodes.length, selectedEdges.length, nodes.length, edges.length]);

  return (
    <>
      <div 
        ref={reactFlowWrapper} 
        className={`relative h-full ${className}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        {/* Connection Toolbar */}
        {showConnectionToolbar && !readOnly && (
          <Panel position="top-center" className="m-4">
            <ConnectionToolbar
              selectedConnectionType={selectedConnectionType}
              onConnectionTypeChange={setSelectedConnectionType}
              onShowStylePanel={() => {
                // Show style panel logic
                toast.info('Style panel coming soon!');
              }}
            />
          </Panel>
        )}

        {/* Selection Info */}
        <Panel position="top-right" className="m-4">
          <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl p-2 shadow-lg">
            <Badge variant="secondary" className="text-xs">
              Zoom: {Math.round(zoomLevel * 100)}%
            </Badge>
            
            {selectionInfo.nodeCount > 0 && (
              <Badge variant="default" className="text-xs">
                {selectionInfo.nodeCount} nodes
              </Badge>
            )}

            {selectionInfo.edgeCount > 0 && (
              <Badge variant="outline" className="text-xs">
                {selectionInfo.edgeCount} connections
              </Badge>
            )}
            
            <Badge variant="outline" className="text-xs">
              {selectionInfo.totalNodes} total
            </Badge>

            <Separator orientation="vertical" className="h-4" />

            <LoadingButton
              variant="ghost"
              size="sm"
              onClick={() => setShowConnectionToolbar(!showConnectionToolbar)}
              className={`h-8 w-8 p-0 ${showConnectionToolbar ? 'bg-primary text-primary-foreground' : ''}`}
              title="Toggle Connection Toolbar"
            >
              <Link className="h-4 w-4" />
            </LoadingButton>

            <LoadingButton
              variant="ghost"
              size="sm"
              onClick={() => setShowMinimap(!showMinimap)}
              className={`h-8 w-8 p-0 ${showMinimap ? 'bg-primary text-primary-foreground' : ''}`}
              title="Toggle Minimap"
            >
              <Navigation className="h-4 w-4" />
            </LoadingButton>
          </div>
        </Panel>

        {/* Drop Zone Indicator */}
        {isDragOver && !readOnly && (
          <div className="absolute inset-0 z-50 pointer-events-none">
            <div className="absolute inset-0 bg-primary/5 border-2 border-dashed border-primary/30 rounded-lg" />
            <div 
              className="absolute w-48 h-24 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: dragPosition.x,
                top: dragPosition.y
              }}
            >
              <div className="w-full h-full bg-primary/10 border-2 border-dashed border-primary rounded-xl flex items-center justify-center">
                <div className="text-primary font-medium text-sm">Drop here to add node</div>
              </div>
            </div>
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          snapToGrid={isSnapToGrid}
          snapGrid={[gridSize, gridSize]}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          minZoom={0.1}
          maxZoom={2}
          attributionPosition="bottom-left"
          connectionLineStyle={{ 
            stroke: connectionTypeDefaults[selectedConnectionType]?.style?.stroke || '#6366f1', 
            strokeWidth: connectionTypeDefaults[selectedConnectionType]?.style?.strokeWidth || 2,
            strokeDasharray: connectionTypeDefaults[selectedConnectionType]?.style?.strokeDasharray || undefined
          }}
          selectionMode={SelectionMode.Partial}
          panOnDrag={selectionTool === 'pan'}
          selectionOnDrag={selectionTool === 'select'}
          className="bg-background"
          nodesDraggable={!readOnly}
          nodesConnectable={!readOnly}
          elementsSelectable={!readOnly}
        >
          {showControls && (
            <Controls 
              className="!bg-background/95 !backdrop-blur-sm !border-border/50 !shadow-lg !rounded-xl"
              showInteractive={false}
            />
          )}
          
          {showMinimap && (
            <MiniMap 
              className="!bg-background/95 !backdrop-blur-sm !border-border/50 !shadow-lg !rounded-xl"
              nodeStrokeColor={(n) => n.selected ? '#6366f1' : '#e5e7eb'}
              nodeColor={(n) => n.selected ? '#6366f1' : '#f3f4f6'}
              nodeBorderRadius={8}
              pannable
              zoomable
            />
          )}
          
          {isGridVisible && (
            <Background 
              variant={BackgroundVariant.Dots}
              gap={gridSize}
              size={1}
              color="hsl(var(--border))"
            />
          )}
        </ReactFlow>

        {/* Bottom Action Bar */}
        {!readOnly && (
          <Panel position="bottom-center" className="m-4">
            <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl p-2 shadow-lg">
              <ActionButton
                action="delete"
                onAction={deleteSelected}
                variant="ghost"
                size="sm"
                disabled={selectedNodes.length === 0 && selectedEdges.length === 0}
                className="h-8 px-3 text-sm text-destructive hover:text-destructive"
                confirmAction={true}
                confirmMessage="Are you sure you want to delete the selected elements?"
                successMessage="Elements deleted!"
                errorMessage="Failed to delete elements"
              >
                Delete Selected
              </ActionButton>
              
              <Separator orientation="vertical" className="h-4" />
              
              <ActionButton
                action="save"
                onAction={savePipeline}
                size="sm"
                disabled={nodes.length === 0}
                className="h-8 px-3 text-sm"
                successMessage="Pipeline saved!"
                errorMessage="Failed to save pipeline"
              >
                Save Pipeline
              </ActionButton>
            </div>
          </Panel>
        )}
      </div>

      {/* Configuration Dialogs */}
      <NodeConfigurationDialog
        isOpen={configDialog.isOpen}
        onClose={() => setConfigDialog({ isOpen: false, nodeId: '', nodeData: null })}
        onSave={(updatedData) => {
          saveToHistory();
          setNodes((nds) =>
            nds.map((node) =>
              node.id === configDialog.nodeId
                ? { ...node, data: updatedData }
                : node
            )
          );
          setConfigDialog({ isOpen: false, nodeId: '', nodeData: null });
          toast.success('Node configuration updated');
        }}
        nodeData={configDialog.nodeData}
        nodeId={configDialog.nodeId}
      />

      <EdgeConfigurationDialog
        isOpen={edgeConfigDialog.isOpen}
        onClose={() => setEdgeConfigDialog({ isOpen: false, edgeId: '', edgeData: null })}
        onSave={handleEdgeConfigSave}
        edgeData={edgeConfigDialog.edgeData}
        edgeId={edgeConfigDialog.edgeId}
      />
    </>
  );
};

// Main component with ReactFlowProvider wrapper
export const EnhancedPipelineCanvas: React.FC<EnhancedPipelineCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <EnhancedPipelineCanvasInternal {...props} />
    </ReactFlowProvider>
  );
};

export default EnhancedPipelineCanvas;