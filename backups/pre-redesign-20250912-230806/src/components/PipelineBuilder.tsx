import { useState, useCallback, useRef, useEffect } from "react";
import { 
  Plus, Trash2, Move, Play, Settings, Download, GitBranch, Package, Server, Terminal, Zap, Database, 
  Cloud, Webhook, Clock, MonitorSpeaker, Code, FileText, Shield, Cpu, Network, HardDrive,
  Container, Globe, Lock, TestTube, Wrench, Layers, Archive, CheckCircle, AlertCircle,
  ChevronDown, FolderOpen, Boxes, Rocket, Bell, MessageSquare, Mail, Maximize, Minimize,
  Sun, Moon, X, Scissors
} from "lucide-react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  NodeTypes,
  useReactFlow,
  Handle,
  Position,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";

interface PipelineBuilderProps {
  onSave: (yaml: string) => void;
}

// Component categories for the palette
const componentCategories = {
  "Source Control": {
    icon: GitBranch,
    color: "bg-emerald-500",
    components: [
      { type: 'github-clone', label: 'GitHub Clone', icon: GitBranch, description: 'Clone from GitHub repository' },
      { type: 'gitlab-clone', label: 'GitLab Clone', icon: GitBranch, description: 'Clone from GitLab repository' },
      { type: 'git-checkout', label: 'Git Checkout', icon: Code, description: 'Switch branches or commits' },
    ]
  },
  "Build & Compile": {
    icon: Wrench,
    color: "bg-blue-500",
    components: [
      { type: 'normal-build', label: 'Normal Build', icon: Wrench, description: 'Standard build process' },
      { type: 'docker-build', label: 'Docker Build', icon: Container, description: 'Build Docker images' },
      { type: 'node-npm', label: 'Node.js NPM', icon: Globe, description: 'Build Node.js with NPM' },
    ]
  },
  "Testing": {
    icon: TestTube,
    color: "bg-yellow-500",
    components: [
      { type: 'unit-tests', label: 'Unit Tests', icon: CheckCircle, description: 'Run unit tests' },
      { type: 'integration-tests', label: 'Integration Tests', icon: Network, description: 'Run integration tests' },
    ]
  },
  "Deployment": {
    icon: Rocket,
    color: "bg-red-500",
    components: [
      { type: 'deploy-local', label: 'Local Deploy', icon: HardDrive, description: 'Deploy to local server' },
      { type: 'deploy-ssh', label: 'SSH Deploy', icon: Server, description: 'Deploy via SSH' },
      { type: 'deploy-k8s', label: 'Kubernetes Deploy', icon: Boxes, description: 'Deploy to Kubernetes cluster' },
    ]
  }
};

// Draggable component from palette
const DraggableNode = ({ type, label, icon: Icon, description, color }: any) => {
  const onDragStart = (event: any, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border-2 border-transparent 
        bg-gradient-to-br ${color} to-opacity-80 
        text-white p-4 cursor-grab hover:scale-105 
        transition-all duration-200 shadow-lg hover:shadow-xl
        hover:border-white/30 backdrop-blur-sm`}
      onDragStart={(event) => onDragStart(event, type)}
      draggable
      title={`Drag to add ${label}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm leading-tight">{label}</div>
        </div>
      </div>
      <div className="text-xs opacity-90 leading-tight">{description}</div>
      
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-60 transition-opacity">
        <Move className="h-3 w-3" />
      </div>
    </div>
  );
};

// Category dropdown component
const CategoryDropdown = ({ category, data, isOpen, onToggle }: any) => {
  const { icon: CategoryIcon, color, components } = data;

  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-3 rounded-lg border-2 
          ${isOpen ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-muted/50'}
          transition-all duration-200`}
      >
        <div className="flex items-center gap-2">
          <div className={`p-1.5 ${color} rounded-md`}>
            <CategoryIcon className="h-4 w-4 text-white" />
          </div>
          <span className="font-medium text-sm">{category}</span>
          <span className="text-xs text-muted-foreground">({components.length})</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="mt-2 space-y-2 pl-4">
          {components.map((component: any) => (
            <DraggableNode key={component.type} {...component} color={color} />
          ))}
        </div>
      )}
    </div>
  );
};

// Custom node component for the pipeline steps
const StepNode = ({ data, selected }: { data: any; selected?: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getNodeIcon = (stepType: string) => {
    const iconMap: { [key: string]: any } = {
      'github-clone': GitBranch,
      'gitlab-clone': GitBranch,
      'git-checkout': Code,
      'normal-build': Wrench,
      'docker-build': Container,
      'node-npm': Globe,
      'unit-tests': CheckCircle,
      'integration-tests': Network,
      'deploy-local': HardDrive,
      'deploy-ssh': Server,
      'deploy-k8s': Boxes,
      shell: Terminal,
      git: GitBranch,
      docker: Package,
      deploy: Server,
      test: Zap,
      database: Database,
    };
    return iconMap[stepType] || Terminal;
  };

  const getNodeColor = (stepType: string) => {
    // Find the category this step belongs to
    for (const [categoryName, categoryData] of Object.entries(componentCategories)) {
      const component = categoryData.components.find(c => c.type === stepType);
      if (component) {
        const colorClass = categoryData.color.replace('bg-', '');
        return {
          border: `border-${colorClass}`,
          bg: `bg-${colorClass}/10`,
          iconBg: categoryData.color,
        };
      }
    }
    
    // Default colors
    return { 
      border: 'border-border', 
      bg: 'bg-card', 
      iconBg: 'bg-muted' 
    };
  };

  const Icon = getNodeIcon(data.stepType);
  const colors = getNodeColor(data.stepType);

  return (
    <div
      className={`relative group min-w-[200px] ${colors.bg} ${colors.border} border-2 
        rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-200
        ${selected ? 'ring-2 ring-primary' : ''}
        ${isHovered ? 'scale-[1.02]' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Delete button on hover */}
      {isHovered && (
        <button
          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground 
            rounded-full w-6 h-6 flex items-center justify-center shadow-lg
            hover:bg-destructive/80 transition-colors z-10"
          onClick={(e) => {
            e.stopPropagation();
            // Handle node deletion
          }}
        >
          <X className="h-3 w-3" />
        </button>
      )}

      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-primary" />
      
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 ${colors.iconBg} rounded-lg`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm">{data.label}</div>
          <div className="text-xs text-muted-foreground">{data.stepType}</div>
        </div>
      </div>

      {data.command && (
        <div className="text-xs bg-muted p-2 rounded font-mono truncate">
          {data.command}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-primary" />
    </div>
  );
};

const nodeTypes: NodeTypes = {
  stepNode: StepNode,
};

export const PipelineBuilder = ({ onSave }: PipelineBuilderProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [openCategories, setOpenCategories] = useState<string[]>(['Source Control']);
  const [isComponentPaletteOpen, setIsComponentPaletteOpen] = useState(true);
  const [gridSize, setGridSize] = useState<[number, number]>([20, 20]);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  let nodeId = useRef(0);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const position = {
        x: event.clientX - reactFlowBounds.left - 100,
        y: event.clientY - reactFlowBounds.top - 50,
      };

      // Find component details
      let componentDetails = null;
      for (const category of Object.values(componentCategories)) {
        componentDetails = category.components.find(c => c.type === type);
        if (componentDetails) break;
      }

      const newNode: Node = {
        id: `node-${nodeId.current++}`,
        type: 'stepNode',
        position,
        data: {
          label: componentDetails?.label || type,
          stepType: type,
          command: '',
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSave = () => {
    const yamlContent = `
pipeline:
  name: "Generated Pipeline"
  stages:
    - name: "main"
      steps:
${nodes.map(node => `        - name: "${node.data.label}"
          type: "${node.data.stepType}"
          command: "${node.data.command || ''}"`).join('\n')}
`;
    onSave(yamlContent);
  };

  const clearAll = () => {
    setNodes([]);
    setEdges([]);
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (selectedNode) {
        setNodes(nds => nds.filter(n => n.id !== selectedNode.id));
        setEdges(eds => eds.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id));
        setSelectedNode(null);
      }
    }
  }, [selectedNode, setNodes, setEdges]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className={`h-full flex ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      {/* Component Palette */}
      <div className={`transition-all duration-300 ${isComponentPaletteOpen ? 'w-80' : 'w-0'} 
        overflow-hidden border-r bg-card/50 backdrop-blur-sm`}>
        <div className="p-4 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Components</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsComponentPaletteOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {Object.entries(componentCategories).map(([category, data]) => (
            <CategoryDropdown
              key={category}
              category={category}
              data={data}
              isOpen={openCategories.includes(category)}
              onToggle={() => toggleCategory(category)}
            />
          ))}
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative">
        {/* Floating Toolbar */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          {!isComponentPaletteOpen && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsComponentPaletteOpen(true)}
              className="bg-background/80 backdrop-blur-sm"
            >
              <Boxes className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            className="bg-background/80 backdrop-blur-sm"
          >
            Grid: {showGrid ? 'On' : 'Off'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSnapToGrid(!snapToGrid)}
            className="bg-background/80 backdrop-blur-sm"
          >
            Snap: {snapToGrid ? 'On' : 'Off'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="bg-background/80 backdrop-blur-sm"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="bg-background/80 backdrop-blur-sm"
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>

        {/* ReactFlow Canvas */}
        <div ref={reactFlowWrapper} className="h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid={snapToGrid}
            snapGrid={gridSize}
            onNodeClick={(_, node) => setSelectedNode(node)}
            onPaneClick={() => setSelectedNode(null)}
            className="bg-background"
          >
            <Controls />
            <MiniMap />
            {showGrid && <Background gap={gridSize[0]} size={1} />}
          </ReactFlow>
        </div>

        {/* Bottom Action Bar */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex gap-2 bg-background/80 backdrop-blur-sm rounded-lg p-2 border shadow-lg">
            <Button
              variant="destructive"
              size="sm"
              onClick={clearAll}
              disabled={nodes.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Reset view functionality
                const reactFlowInstance = (window as any).reactFlowInstance;
                if (reactFlowInstance) {
                  reactFlowInstance.fitView();
                }
              }}
            >
              Reset View
            </Button>
            
            <Button
              onClick={handleSave}
              size="sm"
              disabled={nodes.length === 0}
              className="bg-primary hover:bg-primary/90"
            >
              <Download className="h-4 w-4 mr-2" />
              Save Pipeline
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineBuilder;