import React, { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ComponentPalette } from './ComponentPalette';
import { PipelineCanvas } from './PipelineCanvas';
import { Package, Grid3X3, Move, Save, RotateCcw } from 'lucide-react';

export const PipelineNodeDemo: React.FC = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [showPalette, setShowPalette] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);

  const handleNodesChange = (changes: any) => {
    setNodes(changes);
  };

  const handleEdgesChange = (changes: any) => {
    setEdges(changes);
  };

  const handleConnect = (connection: any) => {
    setEdges((eds) => [...eds, connection]);
  };

  const clearAll = () => {
    setNodes([]);
    setEdges([]);
  };

  const saveConfiguration = () => {
    const config = {
      nodes,
      edges,
      timestamp: new Date().toISOString()
    };
    console.log('Pipeline Configuration:', config);
    // Here you would typically save to backend or local storage
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pipeline Node System Demo</h1>
            <p className="text-muted-foreground">
              Consolidated pipeline node system with drag-and-drop functionality
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {nodes.length} nodes
            </Badge>
            <Badge variant="outline">
              {edges.length} connections
            </Badge>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-border/50 p-2">
        <div className="flex items-center gap-2">
          <Button
            variant={showPalette ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPalette(!showPalette)}
          >
            <Package className="h-4 w-4 mr-2" />
            Components
          </Button>
          
          <Button
            variant={showGrid ? "default" : "outline"}
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            Grid
          </Button>
          
          <Button
            variant={snapToGrid ? "default" : "outline"}
            size="sm"
            onClick={() => setSnapToGrid(!snapToGrid)}
          >
            <Move className="h-4 w-4 mr-2" />
            Snap
          </Button>

          <div className="flex-1" />

          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            disabled={nodes.length === 0}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear All
          </Button>

          <Button
            size="sm"
            onClick={saveConfiguration}
            disabled={nodes.length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <ReactFlowProvider>
          <ComponentPalette
            isOpen={showPalette}
            onClose={() => setShowPalette(false)}
          />
          
          <div className="flex-1 relative">
            <PipelineCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onConnect={handleConnect}
              showGrid={showGrid}
              snapToGrid={snapToGrid}
            />
          </div>
        </ReactFlowProvider>
      </div>

      {/* Status Bar */}
      <div className="border-t border-border/50 p-2 bg-muted/30">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Ready • Drag components from the palette to build your pipeline
          </div>
          <div className="flex items-center gap-4">
            <span>Nodes: {nodes.length}</span>
            <span>Edges: {edges.length}</span>
            <span>Grid: {showGrid ? 'On' : 'Off'}</span>
            <span>Snap: {snapToGrid ? 'On' : 'Off'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineNodeDemo;