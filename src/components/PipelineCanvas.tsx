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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { PipelineNode } from './PipelineNode';
import { NodeConfigurationDialog } from './NodeConfigurationDialog';
import { generateNodeId, generateEdgeId, getComponentDefinition } from '@/lib/pipeline-utils';
import { ComponentDefinition } from '@/lib/pipeline-utils';

interface PipelineCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  showGrid?: boolean;
  snapToGrid?: boolean;
  className?: string;
}

const nodeTypes: NodeTypes = {
  pipelineNode: PipelineNode,
};

export const PipelineCanvas: React.FC<PipelineCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  showGrid = true,
  snapToGrid = false,
  className = ''
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, setNodes, setEdges } = useReactFlow();
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

  // Handle drag over canvas
  const onDragOver = useCallback((event: React.DragEvent) => {
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
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent) => {
    // Only hide drag indicator if leaving the canvas area
    if (!reactFlowWrapper.current?.contains(event.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  // Handle drop on canvas
  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const componentType = event.dataTransfer.getData('application/reactflow');
    const componentDataStr = event.dataTransfer.getData('application/json');
    
    if (!componentType) return;

    let componentData: ComponentDefinition | null = null;
    try {
      componentData = JSON.parse(componentDataStr);
    } catch {
      // Fallback to getting component definition by type
      componentData = getComponentDefinition(componentType);
    }

    if (!componentData) return;

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
  }, [screenToFlowPosition, setNodes, setEdges, edges]);

  // Handle connection between nodes
  const handleConnect = useCallback((params: Connection) => {
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
    onConnect(newEdge);
  }, [onConnect]);

  // Handle node events
  useEffect(() => {
    const handleNodeDelete = (event: CustomEvent) => {
      const { nodeId } = event.detail;
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) => eds.filter((edge) => 
        edge.source !== nodeId && edge.target !== nodeId
      ));
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
      const { nodeId, data } = event.detail;
      const originalNode = nodes.find(n => n.id === nodeId);
      if (originalNode) {
        const newNode: Node = {
          ...originalNode,
          id: generateNodeId(data.stepType),
          position: {
            x: originalNode.position.x + 250,
            y: originalNode.position.y + 50
          },
          data: { ...data }
        };
        setNodes((nds) => nds.concat(newNode));
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
  }, [nodes, setNodes, setEdges]);

  const handleConfigSave = (updatedData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === configDialog.nodeId
          ? { ...node, data: updatedData }
          : node
      )
    );
  };

  return (
    <>
      <div 
        ref={reactFlowWrapper} 
        className={`relative h-full ${className}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        {/* Drop Zone Indicator */}
        {isDragOver && (
          <div className="absolute inset-0 z-50 pointer-events-none">
            {/* Overlay */}
            <div className="absolute inset-0 bg-primary/5 border-2 border-dashed border-primary/30 rounded-lg" />
            
            {/* Drop Target Indicator */}
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
          snapToGrid={snapToGrid}
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
          {showGrid && (
            <Background 
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="hsl(var(--border))"
            />
          )}
        </ReactFlow>
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

export default PipelineCanvas;