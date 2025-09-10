import React, { useCallback, useRef, useState, useEffect } from 'react';
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
  BackgroundVariant,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { PipelineNode } from './PipelineNode';
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
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

interface PipelineCanvasProps {
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

// Internal Canvas Component (wrapped by ReactFlowProvider)
const PipelineCanvasInternal: React.FC<PipelineCanvasProps> = ({
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
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isGridVisible, setIsGridVisible] = useState(showGrid);
  const [isSnapToGrid, setIsSnapToGrid] = useState(snapToGrid);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [configDialog, setConfigDialog] = useState<{
    isOpen: boolean;
    nodeId: string;
    nodeData: any;
  }>({
    isOpen: false,
    nodeId: '',
    nodeData: null
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
    getEdges
  } = useReactFlow();

  // Custom node types
  const nodeTypes: NodeTypes = {
    pipelineNode: PipelineNode,
  };

  // Save state to history for undo/redo
  const saveToHistory = useCallback(() => {
    const currentState = { nodes: getNodes(), edges: getEdges() };
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(currentState);
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [getNodes, getEdges, historyIndex]);

  // Undo functionality
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(prev => prev - 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Redo functionality
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(prev => prev + 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

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
    if (!reactFlowWrapper.current?.contains(event.relatedTarget as Node)) {
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

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

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
      
      // Auto-connect to the last node if it exists and has no outgoing connections
      if (nds.length > 0) {
        const lastNode = nds[nds.length - 1];
        const hasOutgoingConnection = edges.some(edge => edge.source === lastNode.id);
        
        if (!hasOutgoingConnection) {
          const newEdge: Edge = {
            id: generateEdgeId(lastNode.id, newNode.id),
            source: lastNode.id,
            target: newNode.id,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#6366f1', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#6366f1',
            },
          };
          setEdges((eds) => eds.concat(newEdge));
        }
      }
      
      return updatedNodes;
    });

    toast.success(`Added ${componentData.name} to pipeline`);
  }, [readOnly, screenToFlowPosition, setNodes, setEdges, edges, saveToHistory]);

  // Handle connection between nodes
  const handleConnect = useCallback((params: Connection) => {
    if (readOnly) return;
    
    saveToHistory();
    
    const newEdge: Edge = {
      ...params,
      id: generateEdgeId(params.source!, params.target!),
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#6366f1',
      },
    };
    
    setEdges((eds) => addEdge(newEdge, eds));
    externalOnConnect?.(newEdge);
  }, [readOnly, setEdges, externalOnConnect, saveToHistory]);

  // Handle node selection
  const handleSelectionChange = useCallback(({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) => {
    setSelectedNodes(nodes);
    setSelectedEdges(edges);
  }, []);

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
    
    toast.success(`Deleted ${selectedNodes.length} nodes and ${selectedEdges.length} connections`);
  }, [readOnly, selectedNodes, selectedEdges, setNodes, setEdges, saveToHistory]);

  // Copy selected nodes
  const copySelected = useCallback(() => {
    if (selectedNodes.length === 0) return;
    
    const clipboardData = {
      nodes: selectedNodes,
      edges: edges.filter(edge => 
        selectedNodes.some(n => n.id === edge.source) &&
        selectedNodes.some(n => n.id === edge.target)
      )
    };
    
    navigator.clipboard.writeText(JSON.stringify(clipboardData));
    toast.success(`Copied ${selectedNodes.length} nodes to clipboard`);
  }, [selectedNodes, edges]);

  // Paste nodes from clipboard
  const pasteNodes = useCallback(async () => {
    if (readOnly) return;
    
    try {
      const clipboardText = await navigator.clipboard.readText();
      const clipboardData = JSON.parse(clipboardText);
      
      if (!clipboardData.nodes || !Array.isArray(clipboardData.nodes)) return;
      
      saveToHistory();
      
      const idMapping = new Map<string, string>();
      const newNodes = clipboardData.nodes.map((node: Node) => {
        const newId = generateNodeId(node.data.stepType);
        idMapping.set(node.id, newId);
        
        return {
          ...node,
          id: newId,
          position: {
            x: node.position.x + 50,
            y: node.position.y + 50
          },
          selected: false
        };
      });
      
      const newEdges = (clipboardData.edges || []).map((edge: Edge) => ({
        ...edge,
        id: generateEdgeId(idMapping.get(edge.source)!, idMapping.get(edge.target)!),
        source: idMapping.get(edge.source)!,
        target: idMapping.get(edge.target)!,
        selected: false
      }));
      
      setNodes((nds) => nds.concat(newNodes));
      setEdges((eds) => eds.concat(newEdges));
      
      toast.success(`Pasted ${newNodes.length} nodes`);
    } catch (error) {
      toast.error('Failed to paste nodes from clipboard');
    }
  }, [readOnly, setNodes, setEdges, saveToHistory]);

  // Auto-layout nodes
  const autoLayout = useCallback(async () => {
    if (readOnly) return;
    
    saveToHistory();
    const layoutedNodes = autoLayoutNodes(nodes as PipelineNodeType[], edges as PipelineEdge[]);
    setNodes(layoutedNodes);
  }, [readOnly, nodes, edges, setNodes, saveToHistory]);

  // Clear all nodes and edges
  const clearAll = useCallback(async () => {
    if (readOnly) return;
    
    saveToHistory();
    setNodes([]);
    setEdges([]);
  }, [readOnly, setNodes, setEdges, saveToHistory]);

  // Reset view to fit all nodes
  const resetView = useCallback(() => {
    fitView({ padding: 0.2, duration: 300 });
  }, [fitView]);

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

  // Handle node events
  useEffect(() => {
    const handleNodeDelete = (event: CustomEvent) => {
      if (readOnly) return;
      
      const { nodeId } = event.detail;
      saveToHistory();
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) => eds.filter((edge) => 
        edge.source !== nodeId && edge.target !== nodeId
      ));
      toast.success('Node deleted');
    };

    const handleNodeConfigure = (event: CustomEvent) => {
      const { nodeId, data } = event.detail;
      setConfigDialog({
        isOpen: true,
        nodeId,
        nodeData: data
      });
    };

    const handleNodeDuplicate = (event: CustomEvent) => {
      if (readOnly) return;
      
      const { nodeId, data } = event.detail;
      const originalNode = nodes.find(n => n.id === nodeId);
      if (originalNode) {
        saveToHistory();
        const newNode: Node = {
          ...originalNode,
          id: generateNodeId(data.stepType),
          position: {
            x: originalNode.position.x + 250,
            y: originalNode.position.y + 50
          },
          data: { ...data },
          selected: false
        };
        setNodes((nds) => nds.concat(newNode));
        toast.success('Node duplicated');
      }
    };

    window.addEventListener('pipeline-node-delete', handleNodeDelete as EventListener);
    window.addEventListener('pipeline-node-configure', handleNodeConfigure as EventListener);
    window.addEventListener('pipeline-node-duplicate', handleNodeDuplicate as EventListener);

    return () => {
      window.removeEventListener('pipeline-node-delete', handleNodeDelete as EventListener);
      window.removeEventListener('pipeline-node-configure', handleNodeConfigure as EventListener);
      window.removeEventListener('pipeline-node-duplicate', handleNodeDuplicate as EventListener);
    };
  }, [nodes, setNodes, setEdges, readOnly, saveToHistory]);

  // Setup keyboard shortcuts
  useEffect(() => {
    const cleanup = setupKeyboardShortcuts({
      onSave: savePipeline,
      onUndo: undo,
      onRedo: redo,
      onDelete: deleteSelected,
      onSelectAll: () => {
        setNodes((nds) => nds.map(node => ({ ...node, selected: true })));
        setEdges((eds) => eds.map(edge => ({ ...edge, selected: true })));
      },
      onCopy: copySelected,
      onPaste: pasteNodes,
      onToggleGrid: () => setIsGridVisible(prev => !prev),
      onResetView: resetView,
    });

    return cleanup;
  }, [savePipeline, undo, redo, deleteSelected, copySelected, pasteNodes, resetView, setNodes, setEdges]);

  // Handle configuration save
  const handleConfigSave = useCallback((updatedData: any) => {
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
  }, [configDialog.nodeId, setNodes, saveToHistory]);

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

  return (
    <>
      <div 
        ref={reactFlowWrapper} 
        className={`relative h-full ${className}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        {/* Floating Toolbar */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl p-2 shadow-lg">
          {/* View Controls */}
          <LoadingButton
            variant="ghost"
            size="sm"
            onClick={() => setIsGridVisible(!isGridVisible)}
            className={`h-8 w-8 p-0 ${isGridVisible ? 'bg-primary text-primary-foreground' : ''}`}
            title="Toggle Grid (G)"
          >
            <Grid3X3 className="h-4 w-4" />
          </LoadingButton>
          
          <LoadingButton
            variant="ghost"
            size="sm"
            onClick={() => setIsSnapToGrid(!isSnapToGrid)}
            className={`h-8 w-8 p-0 ${isSnapToGrid ? 'bg-primary text-primary-foreground' : ''}`}
            title="Toggle Snap to Grid"
          >
            <Move className="h-4 w-4" />
          </LoadingButton>

          <div className="w-px h-4 bg-border" />

          {/* Zoom Controls */}
          <LoadingButton
            variant="ghost"
            size="sm"
            onClick={() => zoomIn({ duration: 300 })}
            className="h-8 w-8 p-0"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </LoadingButton>
          
          <LoadingButton
            variant="ghost"
            size="sm"
            onClick={() => zoomOut({ duration: 300 })}
            className="h-8 w-8 p-0"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </LoadingButton>
          
          <LoadingButton
            variant="ghost"
            size="sm"
            onClick={resetView}
            className="h-8 w-8 p-0"
            title="Reset View (R)"
          >
            <RotateCcw className="h-4 w-4" />
          </LoadingButton>

          {!readOnly && (
            <>
              <div className="w-px h-4 bg-border" />

              {/* Edit Controls */}
              <LoadingButton
                variant="ghost"
                size="sm"
                onClick={undo}
                disabled={historyIndex <= 0}
                className="h-8 w-8 p-0"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="h-4 w-4" />
              </LoadingButton>
              
              <LoadingButton
                variant="ghost"
                size="sm"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="h-8 w-8 p-0"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="h-4 w-4" />
              </LoadingButton>

              <div className="w-px h-4 bg-border" />

              <LoadingButton
                variant="ghost"
                size="sm"
                onClick={copySelected}
                disabled={selectedNodes.length === 0}
                className="h-8 w-8 p-0"
                title="Copy (Ctrl+C)"
              >
                <Copy className="h-4 w-4" />
              </LoadingButton>
              
              <LoadingButton
                variant="ghost"
                size="sm"
                onClick={deleteSelected}
                disabled={selectedNodes.length === 0 && selectedEdges.length === 0}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                title="Delete (Del)"
              >
                <Trash2 className="h-4 w-4" />
              </LoadingButton>

              <div className="w-px h-4 bg-border" />

              <ActionButton
                action="custom"
                onAction={autoLayout}
                variant="ghost"
                size="sm"
                disabled={nodes.length === 0}
                className="h-8 w-8 p-0"
                title="Auto Layout"
                icon={Settings}
                successMessage="Auto-layout applied!"
                errorMessage="Failed to apply auto-layout"
              >
              </ActionButton>
            </>
          )}
        </div>

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
          onSelectionChange={handleSelectionChange}
          nodeTypes={nodeTypes}
          snapToGrid={isSnapToGrid}
          snapGrid={[20, 20]}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          minZoom={0.1}
          maxZoom={2}
          attributionPosition="bottom-left"
          connectionLineStyle={{ 
            stroke: '#6366f1', 
            strokeWidth: 2,
            strokeDasharray: '5,5'
          }}
          connectionLineComponent={({ fromX, fromY, toX, toY }) => (
            <g>
              <defs>
                <marker
                  id="connectionline-arrow"
                  markerWidth="10"
                  markerHeight="10"
                  refX="5"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <polygon points="0,0 0,6 9,3" fill="#6366f1" />
                </marker>
              </defs>
              <path
                d={`M${fromX},${fromY} C${fromX + 50},${fromY} ${toX - 50},${toY} ${toX},${toY}`}
                stroke="#6366f1"
                strokeWidth="2"
                fill="none"
                strokeDasharray="5,5"
                markerEnd="url(#connectionline-arrow)"
              />
            </g>
          )}
          className="bg-background"
          nodesDraggable={!readOnly}
          nodesConnectable={!readOnly}
          elementsSelectable={!readOnly}
        >
          <Controls 
            className="!bg-background/95 !backdrop-blur-sm !border-border/50 !shadow-lg !rounded-xl"
            showInteractive={false}
          />
          <MiniMap 
            className="!bg-background/95 !backdrop-blur-sm !border-border/50 !shadow-lg !rounded-xl"
            nodeStrokeColor={(n) => n.selected ? '#6366f1' : '#e5e7eb'}
            nodeColor={(n) => n.selected ? '#6366f1' : '#f3f4f6'}
            nodeBorderRadius={8}
          />
          {isGridVisible && (
            <Background 
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="hsl(var(--border))"
            />
          )}
        </ReactFlow>

        {/* Bottom Action Bar */}
        {!readOnly && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
            <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl p-2 shadow-lg">
              <ActionButton
                action="delete"
                onAction={clearAll}
                variant="ghost"
                size="sm"
                disabled={nodes.length === 0}
                className="h-8 px-3 text-sm text-destructive hover:text-destructive"
                confirmAction={true}
                confirmMessage="Are you sure you want to clear all nodes and connections? This action cannot be undone."
                successMessage="Pipeline cleared!"
                errorMessage="Failed to clear pipeline"
              >
                Clear All
              </ActionButton>
              
              <div className="w-px h-4 bg-border" />
              
              <ActionButton
                action="custom"
                onAction={autoLayout}
                variant="ghost"
                size="sm"
                disabled={nodes.length === 0}
                className="h-8 px-3 text-sm"
                icon={Settings}
                successMessage="Auto-layout applied!"
                errorMessage="Failed to apply auto-layout"
              >
                Auto Layout
              </ActionButton>
              
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
          </div>
        )}
      </div>

      {/* Configuration Dialog */}
      <NodeConfigurationDialog
        isOpen={configDialog.isOpen}
        onClose={() => setConfigDialog({ isOpen: false, nodeId: '', nodeData: null })}
        onSave={handleConfigSave}
        nodeData={configDialog.nodeData}
        nodeId={configDialog.nodeId}
      />
    </>
  );
};

// Main component with ReactFlowProvider wrapper
export const PipelineCanvas: React.FC<PipelineCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <PipelineCanvasInternal {...props} />
    </ReactFlowProvider>
  );
};

export default PipelineCanvas;