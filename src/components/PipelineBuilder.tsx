import { useState, useCallback, useRef } from "react";
import { Plus, Trash2, Move, Play, Settings, Download, GitBranch, Package, Server, Terminal, Zap, Database, Cloud, Webhook, Clock, MonitorSpeaker } from "lucide-react";
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
  ReactFlowProvider,
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

interface Step {
  id: string;
  name: string;
  step_type: "shell" | "repository" | "docker" | "deploy" | "git" | "test";
  config: {
    command?: string;
    repository_url?: string;
    branch?: string;
    deployment_type?: "local" | "docker" | "ssh" | "kubernetes" | "custom";
    docker_image?: string;
    docker_tag?: string;
    ssh_host?: string;
    ssh_port?: number;
    ssh_user?: string;
    ssh_password?: string;
    test_framework?: "cargo" | "npm" | "pytest" | "junit" | "custom";
    test_command?: string;
    database_url?: string;
    migration_command?: string;
    environment?: Record<string, string>;
  };
}

interface Stage {
  id: string;
  name: string;
  steps: Step[];
}

interface TriggerConfig {
  trigger_type: "manual" | "webhook" | "schedule";
  config: {
    webhook_url?: string;
    secret?: string;
    schedule?: string; // cron expression
    branch?: string;
  };
}

interface Pipeline {
  name: string;
  description: string;
  stages: Stage[];
  environment: Record<string, string>;
  timeout: number;
  retry_count: number;
  triggers: TriggerConfig[];
}

interface PipelineBuilderProps {
  onSave: (yaml: string) => void;
}

// Component palette items
const componentTypes = [
  { type: 'git', label: 'Git Clone', icon: GitBranch, color: 'bg-green-500', description: 'Clone repository from Git' },
  { type: 'shell', label: 'Shell Command', icon: Terminal, color: 'bg-blue-500', description: 'Execute shell commands' },
  { type: 'docker', label: 'Docker Build', icon: Package, color: 'bg-purple-500', description: 'Build and manage Docker images' },
  { type: 'deploy', label: 'Deploy', icon: Server, color: 'bg-red-500', description: 'Deploy to various targets' },
  { type: 'test', label: 'Test', icon: Zap, color: 'bg-yellow-500', description: 'Run automated tests' },
  { type: 'database', label: 'Database', icon: Database, color: 'bg-indigo-500', description: 'Database operations & migrations' },
];

// Draggable component from palette
const DraggableNode = ({ type, label, icon: Icon, color }: any) => {
  const onDragStart = (event: any, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className={`${color} text-white p-3 rounded-lg cursor-grab hover:opacity-80 transition-opacity shadow-md`}
      onDragStart={(event) => onDragStart(event, type)}
      draggable
      title={`Drag to add ${label}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="text-xs opacity-80">{componentTypes.find(c => c.type === type)?.description}</div>
    </div>
  );
};

// Enhanced step node for the graph
const StepNode = ({ data, selected }: { data: any; selected?: boolean }) => {
  const getNodeIcon = (stepType: string) => {
    const iconMap: { [key: string]: any } = {
      git: GitBranch,
      shell: Terminal,
      docker: Package,
      deploy: Server,
      test: Zap,
      database: Database,
    };
    return iconMap[stepType] || Terminal;
  };

  const getNodeColor = (stepType: string) => {
    const colorMap: { [key: string]: string } = {
      git: 'border-green-500 bg-green-50',
      shell: 'border-blue-500 bg-blue-50',
      docker: 'border-purple-500 bg-purple-50',
      deploy: 'border-red-500 bg-red-50',
      test: 'border-yellow-500 bg-yellow-50',
      database: 'border-indigo-500 bg-indigo-50',
    };
    return colorMap[stepType] || 'border-gray-500 bg-gray-50';
  };

  const Icon = getNodeIcon(data.stepType);

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 min-w-[200px] relative ${getNodeColor(data.stepType)} ${selected ? 'ring-2 ring-primary' : ''}`}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-gray-400 border-2 border-white"
      />
      
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4" />
        <div className="font-bold text-sm">{data.label}</div>
      </div>
      <div className="text-xs text-muted-foreground mb-1">{data.stepType}</div>
      {data.command && (
        <div className="text-xs font-mono bg-background/50 p-1 rounded truncate">
          {data.command.substring(0, 40)}...
        </div>
      )}

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-gray-400 border-2 border-white"
      />
    </div>
  );
};

const nodeTypes: NodeTypes = {
  stepNode: StepNode,
};

// Graph builder component
const GraphBuilder = ({ pipeline, setPipeline }: { pipeline: Pipeline; setPipeline: any }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    }, eds)),
    [setEdges],
  );

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
          label: `New ${type} step`, 
          stepType: type,
          command: type === 'shell' ? 'echo "Hello World"' : ''
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
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          };
          setEdges((eds) => eds.concat(newEdge));
        }
        
        return updatedNodes;
      });
    },
    [screenToFlowPosition, setNodes],
  );

  // Convert nodes back to pipeline
  const updatePipelineFromGraph = useCallback(() => {
    if (nodes.length === 0) return;

    // Sort nodes by position to maintain flow order
    const sortedNodes = [...nodes].sort((a, b) => a.position.x - b.position.x);

    const newStage: Stage = {
      id: 'graph-stage',
      name: 'Graph Generated Stage',
      steps: sortedNodes.map(node => ({
        id: node.id,
        name: node.data.label.toLowerCase().replace(/\s+/g, '-'),
        step_type: node.data.stepType,
        config: {
          command: node.data.command || '',
          deployment_type: node.data.stepType === 'deploy' ? 'custom' : undefined,
        }
      }))
    };

    setPipeline((prev: Pipeline) => ({
      ...prev,
      stages: [newStage]
    }));
  }, [nodes, setPipeline]);

  return (
    <div className="flex h-[600px] gap-4">
      {/* Component Palette */}
      <div className="w-64 border-r pr-4">
        <h3 className="font-semibold mb-4">Components</h3>
        <div className="space-y-3">
          {componentTypes.map((component) => (
            <DraggableNode key={component.type} {...component} />
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <Button 
            onClick={updatePipelineFromGraph}
            className="w-full"
            variant="outline"
          >
            Update Pipeline
          </Button>
          <Button 
            onClick={() => {
              setNodes([]);
              setEdges([]);
            }}
            className="w-full"
            variant="destructive"
            size="sm"
          >
            Clear Canvas
          </Button>
        </div>
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-2">Instructions:</h4>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>• Drag components to canvas</li>
            <li>• Connect nodes using handles</li>
            <li>• Components auto-connect when dropped</li>
            <li>• Update pipeline to save changes</li>
          </ul>
        </div>
      </div>

      {/* Graph Canvas */}
      <div className="flex-1" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => setSelectedNode(node.id)}
          fitView
          className="bg-background"
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          }}
        >
          <Controls />
          <MiniMap />
          <Background gap={20} />
        </ReactFlow>
      </div>
    </div>
  );
};

export function PipelineBuilder({ onSave }: PipelineBuilderProps) {
  const [pipeline, setPipeline] = useState<Pipeline>({
    name: "",
    description: "",
    stages: [],
    environment: {},
    timeout: 3600,
    retry_count: 0,
    triggers: [{ trigger_type: "manual", config: {} }],
  });

  const [envKey, setEnvKey] = useState("");
  const [envValue, setEnvValue] = useState("");
  const [viewMode, setViewMode] = useState<"visual" | "yaml" | "graph">("visual");

  const addStage = () => {
    const newStage: Stage = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Stage ${pipeline.stages.length + 1}`,
      steps: [],
    };
    setPipeline(prev => ({
      ...prev,
      stages: [...prev.stages, newStage]
    }));
  };

  const addStep = (stageId: string) => {
    const newStep: Step = {
      id: Math.random().toString(36).substr(2, 9),
      name: "new-step",
      step_type: "shell",
      config: { command: "" },
    };
    setPipeline(prev => ({
      ...prev,
      stages: prev.stages.map(stage =>
        stage.id === stageId
          ? { ...stage, steps: [...stage.steps, newStep] }
          : stage
      )
    }));
  };

  const updateStage = (stageId: string, field: keyof Stage, value: any) => {
    setPipeline(prev => ({
      ...prev,
      stages: prev.stages.map(stage =>
        stage.id === stageId ? { ...stage, [field]: value } : stage
      )
    }));
  };

  const updateStep = (stageId: string, stepId: string, field: string, value: any) => {
    setPipeline(prev => ({
      ...prev,
      stages: prev.stages.map(stage =>
        stage.id === stageId
          ? {
              ...stage,
              steps: stage.steps.map(step =>
                step.id === stepId
                  ? field.startsWith('config.')
                    ? { ...step, config: { ...step.config, [field.split('.')[1]]: value } }
                    : { ...step, [field]: value }
                  : step
              )
            }
          : stage
      )
    }));
  };

  const removeStage = (stageId: string) => {
    setPipeline(prev => ({
      ...prev,
      stages: prev.stages.filter(stage => stage.id !== stageId)
    }));
  };

  const removeStep = (stageId: string, stepId: string) => {
    setPipeline(prev => ({
      ...prev,
      stages: prev.stages.map(stage =>
        stage.id === stageId
          ? { ...stage, steps: stage.steps.filter(step => step.id !== stepId) }
          : stage
      )
    }));
  };

  const addEnvironmentVariable = () => {
    if (envKey && envValue) {
      setPipeline(prev => ({
        ...prev,
        environment: { ...prev.environment, [envKey]: envValue }
      }));
      setEnvKey("");
      setEnvValue("");
    }
  };

  const removeEnvironmentVariable = (key: string) => {
    setPipeline(prev => ({
      ...prev,
      environment: Object.fromEntries(
        Object.entries(prev.environment).filter(([k]) => k !== key)
      )
    }));
  };

  const generateYAML = () => {
    const yamlContent = `name: "${pipeline.name}"
description: "${pipeline.description}"

triggers:
${pipeline.triggers.map(trigger => `  - trigger_type: ${trigger.trigger_type}
    config: {}`).join('\n')}

stages:
${pipeline.stages.map(stage => `  - name: "${stage.name}"
    steps:
${stage.steps.map(step => {
  const stepYaml = `      - name: "${step.name}"
        step_type: ${step.step_type}
        config:`;
  
  if (step.step_type === "shell") {
    let config = `          command: |
            ${step.config.command?.split('\n').join('\n            ') || ''}`;
    
    if (step.config.deployment_type) {
      config = `          deployment_type: ${step.config.deployment_type}
${config}`;
    }
    return stepYaml + '\n' + config;
  } else {
    return stepYaml + `
          repository_url: "${step.config.repository_url || ''}"
          branch: "${step.config.branch || 'main'}"`;
  }
}).join('\n')}`)
      .join('\n')}

environment: ${Object.keys(pipeline.environment).length > 0 ? 
  '\n' + Object.entries(pipeline.environment).map(([k, v]) => `  ${k}: "${v}"`).join('\n') : 
  '{}'}
timeout: ${pipeline.timeout}
retry_count: ${pipeline.retry_count}`;

    return yamlContent;
  };

  const handleSave = () => {
    const yaml = generateYAML();
    onSave(yaml);
  };

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pipeline Builder</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "visual" ? "default" : "outline"}
                onClick={() => setViewMode("visual")}
              >
                Visual Editor
              </Button>
              <Button
                variant={viewMode === "graph" ? "default" : "outline"}
                onClick={() => setViewMode("graph")}
              >
                Graph Builder
              </Button>
              <Button
                variant={viewMode === "yaml" ? "default" : "outline"}
                onClick={() => setViewMode("yaml")}
              >
                YAML View
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {viewMode === "graph" && (
        <Card>
          <CardHeader>
            <CardTitle>Visual Pipeline Builder</CardTitle>
            <p className="text-sm text-muted-foreground">
              Drag components from the left panel to build your pipeline
            </p>
          </CardHeader>
          <CardContent>
            <ReactFlowProvider>
              <GraphBuilder pipeline={pipeline} setPipeline={setPipeline} />
            </ReactFlowProvider>
          </CardContent>
        </Card>
      )}

      {viewMode === "yaml" && (
        <Card>
          <CardHeader>
            <CardTitle>Generated YAML</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto whitespace-pre-wrap">
              {generateYAML()}
            </pre>
          </CardContent>
        </Card>
      )}

      {viewMode === "visual" && (
        <div className="space-y-6">
          {/* Pipeline Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Pipeline Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pipeline-name">Pipeline Name</Label>
              <Input
                id="pipeline-name"
                value={pipeline.name}
                onChange={(e) => setPipeline(prev => ({ ...prev, name: e.target.value }))}
                placeholder="My Pipeline"
              />
            </div>
            <div>
              <Label htmlFor="pipeline-description">Description</Label>
              <Input
                id="pipeline-description"
                value={pipeline.description}
                onChange={(e) => setPipeline(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Pipeline description"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timeout">Timeout (seconds)</Label>
              <Input
                id="timeout"
                type="number"
                value={pipeline.timeout}
                onChange={(e) => setPipeline(prev => ({ ...prev, timeout: parseInt(e.target.value) || 3600 }))}
              />
            </div>
            <div>
              <Label htmlFor="retry-count">Retry Count</Label>
              <Input
                id="retry-count"
                type="number"
                value={pipeline.retry_count}
                onChange={(e) => setPipeline(prev => ({ ...prev, retry_count: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Triggers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Pipeline Triggers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pipeline.triggers.map((trigger, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Trigger {index + 1}</Badge>
                  <Select
                    value={trigger.trigger_type}
                    onValueChange={(value: "manual" | "webhook" | "schedule") => {
                      const newTriggers = [...pipeline.triggers];
                      newTriggers[index] = { ...trigger, trigger_type: value, config: {} };
                      setPipeline(prev => ({ ...prev, triggers: newTriggers }));
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="webhook">Webhook</SelectItem>
                      <SelectItem value="schedule">Schedule</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {pipeline.triggers.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newTriggers = pipeline.triggers.filter((_, i) => i !== index);
                      setPipeline(prev => ({ ...prev, triggers: newTriggers }));
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {trigger.trigger_type === "webhook" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Webhook URL</Label>
                    <Input
                      value={trigger.config.webhook_url || ""}
                      onChange={(e) => {
                        const newTriggers = [...pipeline.triggers];
                        newTriggers[index].config.webhook_url = e.target.value;
                        setPipeline(prev => ({ ...prev, triggers: newTriggers }));
                      }}
                      placeholder="https://api.github.com/repos/user/repo"
                    />
                  </div>
                  <div>
                    <Label>Secret (optional)</Label>
                    <Input
                      type="password"
                      value={trigger.config.secret || ""}
                      onChange={(e) => {
                        const newTriggers = [...pipeline.triggers];
                        newTriggers[index].config.secret = e.target.value;
                        setPipeline(prev => ({ ...prev, triggers: newTriggers }));
                      }}
                      placeholder="webhook secret"
                    />
                  </div>
                </div>
              )}
              
              {trigger.trigger_type === "schedule" && (
                <div>
                  <Label>Cron Expression</Label>
                  <Input
                    value={trigger.config.schedule || ""}
                    onChange={(e) => {
                      const newTriggers = [...pipeline.triggers];
                      newTriggers[index].config.schedule = e.target.value;
                      setPipeline(prev => ({ ...prev, triggers: newTriggers }));
                    }}
                    placeholder="0 0 * * *"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Example: "0 0 * * *" runs daily at midnight
                  </p>
                </div>
              )}
            </div>
          ))}
          
          <Button
            variant="outline"
            onClick={() => {
              setPipeline(prev => ({
                ...prev,
                triggers: [...prev.triggers, { trigger_type: "manual", config: {} }]
              }));
            }}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Trigger
          </Button>
        </CardContent>
      </Card>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MonitorSpeaker className="h-5 w-5" />
            Environment Variables
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Key"
              value={envKey}
              onChange={(e) => setEnvKey(e.target.value)}
            />
            <Input
              placeholder="Value"
              value={envValue}
              onChange={(e) => setEnvValue(e.target.value)}
            />
            <Button onClick={addEnvironmentVariable}>Add</Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {Object.entries(pipeline.environment).map(([key, value]) => (
              <Badge key={key} variant="secondary" className="gap-1">
                {key}={value}
                <Trash2 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeEnvironmentVariable(key)}
                />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Pipeline Flow
            </span>
            <Button onClick={addStage}>
              <Plus className="h-4 w-4 mr-2" />
              Add Stage
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {pipeline.stages.map((stage, stageIndex) => (
              <div key={stage.id} className="relative">
                {/* Stage */}
                <Card className="border-l-4 border-l-primary">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Stage {stageIndex + 1}</Badge>
                        <Input
                          value={stage.name}
                          onChange={(e) => updateStage(stage.id, 'name', e.target.value)}
                          className="font-medium"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStage(stage.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Steps */}
                    {stage.steps.map((step, stepIndex) => (
                      <Card key={step.id} className="bg-muted/50">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">Step {stepIndex + 1}</Badge>
                              <Move className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeStep(stage.id, step.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <Label>Step Name</Label>
                              <Input
                                value={step.name}
                                onChange={(e) => updateStep(stage.id, step.id, 'name', e.target.value)}
                                placeholder="step-name"
                              />
                            </div>
                            <div>
                              <Label>Step Type</Label>
                              <Select
                                value={step.step_type}
                                onValueChange={(value) => updateStep(stage.id, step.id, 'step_type', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="shell">Shell Command</SelectItem>
                                  <SelectItem value="repository">Repository</SelectItem>
                                  <SelectItem value="docker">Docker Build</SelectItem>
                                  <SelectItem value="deploy">Deploy</SelectItem>
                                  <SelectItem value="git">Git Clone</SelectItem>
                                  <SelectItem value="test">Test</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {step.step_type === "shell" && (
                            <div className="space-y-4">
                              <div>
                                <Label>Deployment Type (optional)</Label>
                                <Select
                                  value={step.config.deployment_type || ""}
                                  onValueChange={(value) => updateStep(stage.id, step.id, 'config.deployment_type', value || undefined)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Auto-detect" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="">Auto-detect</SelectItem>
                                    <SelectItem value="local">Local</SelectItem>
                                    <SelectItem value="docker">Docker</SelectItem>
                                    <SelectItem value="ssh">SSH</SelectItem>
                                    <SelectItem value="kubernetes">Kubernetes</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Command</Label>
                                <Textarea
                                  value={step.config.command || ""}
                                  onChange={(e) => updateStep(stage.id, step.id, 'config.command', e.target.value)}
                                  placeholder="Enter shell command..."
                                  rows={4}
                                />
                              </div>
                            </div>
                          )}

                          {step.step_type === "repository" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Repository URL</Label>
                                <Input
                                  value={step.config.repository_url || ""}
                                  onChange={(e) => updateStep(stage.id, step.id, 'config.repository_url', e.target.value)}
                                  placeholder="https://github.com/user/repo.git"
                                />
                              </div>
                              <div>
                                <Label>Branch</Label>
                                <Input
                                  value={step.config.branch || "main"}
                                  onChange={(e) => updateStep(stage.id, step.id, 'config.branch', e.target.value)}
                                  placeholder="main"
                                />
                              </div>
                            </div>
                          )}

                          {step.step_type === "docker" && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Docker Image</Label>
                                  <Input
                                    value={step.config.docker_image || ""}
                                    onChange={(e) => updateStep(stage.id, step.id, 'config.docker_image', e.target.value)}
                                    placeholder="rust:latest"
                                  />
                                </div>
                                <div>
                                  <Label>Tag</Label>
                                  <Input
                                    value={step.config.docker_tag || ""}
                                    onChange={(e) => updateStep(stage.id, step.id, 'config.docker_tag', e.target.value)}
                                    placeholder="latest"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label>Build Command</Label>
                                <Textarea
                                  value={step.config.command || ""}
                                  onChange={(e) => updateStep(stage.id, step.id, 'config.command', e.target.value)}
                                  placeholder="docker build -t my-app:latest ."
                                  rows={3}
                                />
                              </div>
                            </div>
                          )}

                          {step.step_type === "deploy" && (
                            <div className="space-y-4">
                              <div>
                                <Label>Deployment Type</Label>
                                <Select
                                  value={step.config.deployment_type || "local"}
                                  onValueChange={(value) => updateStep(stage.id, step.id, 'config.deployment_type', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="local">Local</SelectItem>
                                    <SelectItem value="docker">Docker</SelectItem>
                                    <SelectItem value="ssh">SSH</SelectItem>
                                    <SelectItem value="kubernetes">Kubernetes</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {step.config.deployment_type === "ssh" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label>SSH Host</Label>
                                    <Input
                                      value={step.config.ssh_host || ""}
                                      onChange={(e) => updateStep(stage.id, step.id, 'config.ssh_host', e.target.value)}
                                      placeholder="localhost"
                                    />
                                  </div>
                                  <div>
                                    <Label>SSH Port</Label>
                                    <Input
                                      type="number"
                                      value={step.config.ssh_port || ""}
                                      onChange={(e) => updateStep(stage.id, step.id, 'config.ssh_port', parseInt(e.target.value) || 22)}
                                      placeholder="22"
                                    />
                                  </div>
                                  <div>
                                    <Label>SSH User</Label>
                                    <Input
                                      value={step.config.ssh_user || ""}
                                      onChange={(e) => updateStep(stage.id, step.id, 'config.ssh_user', e.target.value)}
                                      placeholder="user"
                                    />
                                  </div>
                                </div>
                              )}
                              
                              <div>
                                <Label>Deploy Command</Label>
                                <Textarea
                                  value={step.config.command || ""}
                                  onChange={(e) => updateStep(stage.id, step.id, 'config.command', e.target.value)}
                                  placeholder="docker run -d --name app -p 8000:8000 my-app:latest"
                                  rows={3}
                                />
                              </div>
                            </div>
                          )}

                          {step.step_type === "test" && (
                            <div className="space-y-4">
                              <div>
                                <Label>Test Framework</Label>
                                <Select
                                  value={step.config.test_framework || "custom"}
                                  onValueChange={(value) => updateStep(stage.id, step.id, 'config.test_framework', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="cargo">Cargo (Rust)</SelectItem>
                                    <SelectItem value="npm">NPM (Node.js)</SelectItem>
                                    <SelectItem value="pytest">PyTest (Python)</SelectItem>
                                    <SelectItem value="junit">JUnit (Java)</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Test Command</Label>
                                <Textarea
                                  value={step.config.test_command || step.config.command || ""}
                                  onChange={(e) => {
                                    updateStep(stage.id, step.id, 'config.test_command', e.target.value);
                                    updateStep(stage.id, step.id, 'config.command', e.target.value);
                                  }}
                                  placeholder="cargo test --all"
                                  rows={3}
                                />
                              </div>
                            </div>
                          )}

                          {step.step_type === "git" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Repository URL</Label>
                                <Input
                                  value={step.config.repository_url || ""}
                                  onChange={(e) => updateStep(stage.id, step.id, 'config.repository_url', e.target.value)}
                                  placeholder="https://github.com/user/repo.git"
                                />
                              </div>
                              <div>
                                <Label>Branch</Label>
                                <Input
                                  value={step.config.branch || "main"}
                                  onChange={(e) => updateStep(stage.id, step.id, 'config.branch', e.target.value)}
                                  placeholder="main"
                                />
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    
                    <Button
                      variant="outline"
                      onClick={() => addStep(stage.id)}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Step
                    </Button>
                  </CardContent>
                </Card>

                {/* Flow Arrow */}
                {stageIndex < pipeline.stages.length - 1 && (
                  <div className="flex justify-center py-4">
                    <div className="w-px h-8 bg-border"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="min-w-32">
              Save Pipeline
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}