import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Package,
  Move,
  Grid3X3,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  Trash2,
  X,
  Layers,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  ZoomIn,
  Save,
  GitBranch,
  Terminal,
  Container,
  Code
} from "lucide-react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  Handle,
  Position,
  type NodeTypes,
  MarkerType,
  useReactFlow,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Import the component categories from your original file
const componentCategories = {
  "Source Control": {
    icon: GitBranch,
    color: "bg-emerald-500",
    components: [
      { type: "github-clone", name: "GitHub Clone", description: "Clone from GitHub repository", icon: GitBranch },
      { type: "gitlab-clone", name: "GitLab Clone", description: "Clone from GitLab repository", icon: GitBranch },
      { type: "git-checkout", name: "Git Checkout", description: "Checkout specific branch/tag", icon: Code }
    ]
  },
  "Build & Compile": {
    icon: Package,
    color: "bg-blue-500",
    components: [
      { type: "docker-build", name: "Docker Build", description: "Build Docker image", icon: Container },
      { type: "node-npm", name: "NPM Install", description: "Install Node.js dependencies", icon: Package },
      { type: "python-pip", name: "Pip Install", description: "Install Python packages", icon: Code }
    ]
  },
  "Testing": {
    icon: Terminal,
    color: "bg-purple-500",
    components: [
      { type: "unit-tests", name: "Unit Tests", description: "Run unit tests", icon: Terminal },
      { type: "integration-tests", name: "Integration Tests", description: "Run integration tests", icon: Terminal }
    ]
  }
};

interface DraggableNodeProps {
  component: any;
  color: string;
}

const DraggableNode = ({ component, color }: DraggableNodeProps) => {
  const onDragStart = (event: any, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className={`group relative bg-card hover:bg-accent/50 border border-border/50 rounded-lg p-3 cursor-grab active:cursor-grabbing
        transition-all duration-200 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5`}
      onDragStart={(event) => onDragStart(event, component.type)}
      draggable
    >
      <div className="flex items-center gap-3">
        <div className={`p-1.5 ${color} rounded-md group-hover:scale-110 transition-transform duration-200`}>
          <component.icon className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm text-foreground truncate">{component.name}</div>
          <div className="text-xs text-muted-foreground/80 line-clamp-2">{component.description}</div>
        </div>
      </div>
      
      {/* Drag indicator */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Move className="h-3 w-3 text-muted-foreground" />
      </div>
    </div>
  );
};

const StepNode = ({ data, selected }: { data: any; selected?: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getNodeIcon = (stepType: string) => {
    const iconMap: { [key: string]: any } = {
      'github-clone': GitBranch,
      'gitlab-clone': GitBranch,
      'git-checkout': Code,
      'docker-build': Container,
      'node-npm': Package,
      'python-pip': Code,
      'unit-tests': Terminal,
      'integration-tests': Terminal,
    };
    return iconMap[stepType] || Terminal;
  };

  const getNodeColor = (stepType: string) => {
    const colorMap: { [key: string]: any } = {
      'github-clone': { border: 'border-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', iconBg: 'bg-emerald-500' },
      'gitlab-clone': { border: 'border-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', iconBg: 'bg-emerald-500' },
      'git-checkout': { border: 'border-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', iconBg: 'bg-emerald-500' },
      'docker-build': { border: 'border-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20', iconBg: 'bg-blue-500' },
      'node-npm': { border: 'border-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20', iconBg: 'bg-blue-500' },
      'python-pip': { border: 'border-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20', iconBg: 'bg-blue-500' },
      'unit-tests': { border: 'border-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/20', iconBg: 'bg-purple-500' },
      'integration-tests': { border: 'border-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/20', iconBg: 'bg-purple-500' },
    };
    return colorMap[stepType] || { border: 'border-gray-500', bg: 'bg-gray-50 dark:bg-gray-950/20', iconBg: 'bg-gray-500' };
  };

  const Icon = getNodeIcon(data.stepType);
  const colors = getNodeColor(data.stepType);

  return (
    <div 
      className={`group relative overflow-hidden rounded-2xl border-2 ${colors.border} ${colors.bg} 
        min-w-[200px] max-w-[240px] backdrop-blur-sm transition-all duration-300 ease-out
        ${selected ? 'ring-2 ring-primary/50 ring-offset-2 ring-offset-background scale-105' : 'hover:scale-[1.02]'}
        ${isHovered ? 'shadow-2xl border-primary/50' : 'shadow-lg hover:shadow-xl'}
        cursor-move active:cursor-grabbing`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating action buttons */}
      <div className={`absolute -top-2 -right-2 z-10 transition-all duration-200 ${
        isHovered || selected ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
      }`}>
        <Button
          variant="destructive"
          size="sm"
          className="h-6 w-6 p-0 rounded-full shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 !bg-primary border-2 border-background shadow-lg hover:scale-150 transition-all duration-200"
      />
      
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <div className={`p-2.5 ${colors.iconBg} rounded-xl shadow-md group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-foreground truncate mb-0.5">{data.label}</div>
          <div className="text-xs text-muted-foreground/80 capitalize font-medium">
            {data.stepType.replace('-', ' ')}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-4 pb-4 space-y-2">
        {data.command && (
          <div className="p-2.5 bg-muted/50 rounded-lg border border-border/30 backdrop-blur-sm">
            <div className="text-xs font-mono text-muted-foreground truncate">
              {data.command.length > 30 ? `${data.command.substring(0, 30)}...` : data.command}
            </div>
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 !bg-primary border-2 border-background shadow-lg hover:scale-150 transition-all duration-200"
      />
      
      {/* Connection indicator */}
      <div className={`absolute top-3 right-3 transition-all duration-200 ${
        isHovered ? 'opacity-100 scale-100' : 'opacity-60 scale-75'
      }`}>
        <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-sm animate-pulse"></div>
      </div>
    </div>
  );
};

const nodeTypes: NodeTypes = {
  stepNode: StepNode,
};

interface WhiteboardGraphBuilderProps {
  onSave?: (nodes: Node[], edges: Edge[]) => void;
}

export const WhiteboardGraphBuilder = ({ onSave }: WhiteboardGraphBuilderProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>({
    "Source Control": true,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [showPalette, setShowPalette] = useState(true);
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition, setViewport, getViewport } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#6366f1',
      },
    }, eds)),
    [setEdges],
  );

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      setNodes((nds) => nds.filter((node) => !deleted.some((d) => d.id === node.id)));
      setEdges((eds) => eds.filter((edge) => 
        !deleted.some((d) => d.id === edge.source || d.id === edge.target)
      ));
    },
    [setNodes, setEdges]
  );

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      setEdges((eds) => eds.filter((edge) => !deleted.some((d) => d.id === edge.id)));
    },
    [setEdges]
  );

  const deleteSelectedElements = useCallback(() => {
    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) => eds.filter((edge) => !edge.selected));
  }, [setNodes, setEdges]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && 
          (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA')) {
        event.preventDefault();
        deleteSelectedElements();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelectedElements]);

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${type}-${Date.now()}`,
        type: 'stepNode',
        position,
        data: { 
          label: `${type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`, 
          stepType: type,
          command: type.includes('npm') ? 'npm install' : type.includes('pip') ? 'pip install -r requirements.txt' : '',
        },
      };

      setNodes((nds) => {
        const updatedNodes = nds.concat(newNode);
        
        // Auto-connect to the last node if it exists
        if (nds.length > 0) {
          const lastNode = nds[nds.length - 1];
          const newEdge = {
            id: `e-${lastNode.id}-${newNode.id}`,
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
        
        return updatedNodes;
      });
    },
    [screenToFlowPosition, setNodes, setEdges],
  );

  return (
    <div className={`h-full flex relative ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''} ${isDarkMode ? 'dark' : ''}`}>
      {/* Floating Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl p-2 shadow-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPalette(!showPalette)}
          className={`h-8 w-8 p-0 ${showPalette ? 'bg-primary text-primary-foreground' : ''}`}
        >
          <Package className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowGrid(!showGrid)}
          className={`h-8 w-8 p-0 ${showGrid ? 'bg-primary text-primary-foreground' : ''}`}
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSnapToGrid(!snapToGrid)}
          className={`h-8 w-8 p-0 ${snapToGrid ? 'bg-primary text-primary-foreground' : ''}`}
        >
          <Move className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="h-8 w-8 p-0"
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="h-8 w-8 p-0"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <Button
          variant="ghost"
          size="sm"
          onClick={deleteSelectedElements}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Left Sidebar - Component Palette */}
      <div className={`w-80 bg-background/80 backdrop-blur-sm border-r border-border/50 flex flex-col overflow-hidden transition-all duration-300 ${
        showPalette ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Components
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPalette(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Drag components to the canvas</p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {Object.entries(componentCategories).map(([categoryName, categoryData]) => (
              <div key={categoryName} className="space-y-2">
                <Button
                  variant="ghost"
                  onClick={() => setOpenCategories(prev => ({ ...prev, [categoryName]: !prev[categoryName] }))}
                  className="w-full justify-between p-2 h-auto font-medium text-sm hover:bg-accent/50"
                >
                  <span className="flex items-center gap-2">
                    <categoryData.icon className="h-4 w-4" />
                    {categoryName}
                  </span>
                  {openCategories[categoryName] ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </Button>
                
                {openCategories[categoryName] && (
                  <div className="pl-2 space-y-1">
                    {categoryData.components.map((component) => (
                      <DraggableNode key={component.type} component={component} color={categoryData.color} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative bg-gradient-to-br from-background to-muted/20">
        <ReactFlow
          ref={reactFlowWrapper}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          snapToGrid={snapToGrid}
          snapGrid={[20, 20]}
          connectionLineStyle={{ stroke: '#6366f1', strokeWidth: 2 }}
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
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          minZoom={0.1}
          maxZoom={2}
          attributionPosition="bottom-left"
          className={`transition-all duration-300 ${isDarkMode ? 'react-flow-dark' : ''}`}
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
              color={isDarkMode ? "#374151" : "#e5e7eb"}
            />
          )}
        </ReactFlow>

        {/* Quick Actions - Floating Bottom Bar */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl p-2 shadow-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setNodes([]);
                setEdges([]);
              }}
              className="h-8 px-3 text-sm"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Clear All
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setViewport({ x: 0, y: 0, zoom: 0.8 }, { duration: 300 });
              }}
              className="h-8 px-3 text-sm"
            >
              <ZoomIn className="h-4 w-4 mr-1" />
              Reset View
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => onSave?.(nodes, edges)}
              className="h-8 px-3 text-sm"
            >
              <Save className="h-4 w-4 mr-1" />
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};