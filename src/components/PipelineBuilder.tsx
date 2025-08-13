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
import { Slider } from "@/components/ui/slider";

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

// Comprehensive component categories to compete with Jenkins
const componentCategories = {
  "Source Control": {
    icon: GitBranch,
    color: "bg-emerald-500",
    components: [
      { type: 'github-clone', label: 'GitHub Clone', icon: GitBranch, description: 'Clone from GitHub repository' },
      { type: 'gitlab-clone', label: 'GitLab Clone', icon: GitBranch, description: 'Clone from GitLab repository' },
      { type: 'bitbucket-clone', label: 'Bitbucket Clone', icon: GitBranch, description: 'Clone from Bitbucket repository' },
      { type: 'git-checkout', label: 'Git Checkout', icon: Code, description: 'Switch branches or commits' },
      { type: 'git-merge', label: 'Git Merge', icon: Archive, description: 'Merge branches' },
      { type: 'git-tag', label: 'Git Tag', icon: Archive, description: 'Create Git tags' },
      { type: 'github-release', label: 'GitHub Release', icon: Archive, description: 'Create GitHub releases' },
      { type: 'gitlab-release', label: 'GitLab Release', icon: Archive, description: 'Create GitLab releases' },
    ]
  },
  "Build & Compile": {
    icon: Wrench,
    color: "bg-blue-500",
    components: [
      { type: 'normal-build', label: 'Normal Build', icon: Wrench, description: 'Standard build process' },
      { type: 'docker-build', label: 'Docker Build', icon: Container, description: 'Build Docker images' },
      { type: 'helm-build', label: 'Helm Chart Build', icon: Boxes, description: 'Build Helm charts for Kubernetes' },
      { type: 'rust-cargo', label: 'Rust Cargo', icon: Package, description: 'Build Rust projects with Cargo' },
      { type: 'node-npm', label: 'Node.js NPM', icon: Globe, description: 'Build Node.js with NPM' },
      { type: 'node-yarn', label: 'Node.js Yarn', icon: Globe, description: 'Build Node.js with Yarn' },
      { type: 'python-pip', label: 'Python Pip', icon: Code, description: 'Build Python with Pip' },
      { type: 'maven-build', label: 'Maven Build', icon: Layers, description: 'Build Java with Maven' },
      { type: 'gradle-build', label: 'Gradle Build', icon: Layers, description: 'Build Java with Gradle' },
      { type: 'go-build', label: 'Go Build', icon: Package, description: 'Build Go applications' },
      { type: 'dotnet-build', label: '.NET Build', icon: Package, description: 'Build .NET applications' },
    ]
  },
  "Testing & Security": {
    icon: TestTube,
    color: "bg-yellow-500",
    components: [
      { type: 'unit-tests', label: 'Unit Tests', icon: CheckCircle, description: 'Run unit tests' },
      { type: 'integration-tests', label: 'Integration Tests', icon: Network, description: 'Run integration tests' },
      { type: 'e2e-tests', label: 'E2E Tests', icon: Globe, description: 'End-to-end testing' },
      { type: 'owasp-zap', label: 'OWASP ZAP', icon: Shield, description: 'OWASP ZAP security scan' },
      { type: 'owasp-dependency', label: 'OWASP Dependency Check', icon: Shield, description: 'Check for vulnerable dependencies' },
      { type: 'snyk-scan', label: 'Snyk Security', icon: Shield, description: 'Snyk vulnerability scanning' },
      { type: 'sonarqube', label: 'SonarQube', icon: FileText, description: 'Code quality with SonarQube' },
      { type: 'sast-scan', label: 'SAST Scan', icon: Shield, description: 'Static Application Security Testing' },
      { type: 'dast-scan', label: 'DAST Scan', icon: Shield, description: 'Dynamic Application Security Testing' },
      { type: 'performance-test', label: 'Performance Test', icon: Cpu, description: 'Load and performance testing' },
      { type: 'accessibility-test', label: 'Accessibility Test', icon: CheckCircle, description: 'Accessibility compliance testing' },
    ]
  },
  "Containerization": {
    icon: Container,
    color: "bg-purple-500",
    components: [
      { type: 'docker-build', label: 'Docker Build', icon: Package, description: 'Build Docker images' },
      { type: 'docker-push', label: 'Docker Push', icon: Cloud, description: 'Push to Docker registry' },
      { type: 'docker-scan', label: 'Docker Security Scan', icon: Shield, description: 'Scan Docker images for vulnerabilities' },
      { type: 'docker-compose', label: 'Docker Compose', icon: Layers, description: 'Multi-container deployment' },
      { type: 'buildah', label: 'Buildah', icon: Container, description: 'Build OCI container images' },
      { type: 'podman', label: 'Podman', icon: Container, description: 'Podman container operations' },
      { type: 'kaniko', label: 'Kaniko', icon: Package, description: 'Build container images in Kubernetes' },
    ]
  },
  "Kubernetes & Helm": {
    icon: Boxes,
    color: "bg-cyan-500",
    components: [
      { type: 'helm-deploy', label: 'Helm Deploy', icon: Boxes, description: 'Deploy with Helm charts' },
      { type: 'helm-upgrade', label: 'Helm Upgrade', icon: Rocket, description: 'Upgrade Helm releases' },
      { type: 'helm-rollback', label: 'Helm Rollback', icon: Archive, description: 'Rollback Helm releases' },
      { type: 'kubectl-apply', label: 'Kubectl Apply', icon: Server, description: 'Apply Kubernetes manifests' },
      { type: 'kustomize', label: 'Kustomize', icon: Layers, description: 'Kubernetes native configuration management' },
      { type: 'k8s-secrets', label: 'K8s Secrets', icon: Lock, description: 'Manage Kubernetes secrets' },
    ]
  },
  "Deployment": {
    icon: Rocket,
    color: "bg-red-500",
    components: [
      { type: 'deploy-local', label: 'Local Deploy', icon: HardDrive, description: 'Deploy to local server' },
      { type: 'deploy-ssh', label: 'SSH Deploy', icon: Server, description: 'Deploy via SSH' },
      { type: 'deploy-k8s', label: 'Kubernetes Deploy', icon: Boxes, description: 'Deploy to Kubernetes cluster' },
      { type: 'deploy-aws', label: 'AWS Deploy', icon: Cloud, description: 'Deploy to AWS' },
      { type: 'deploy-azure', label: 'Azure Deploy', icon: Cloud, description: 'Deploy to Azure' },
      { type: 'deploy-gcp', label: 'GCP Deploy', icon: Cloud, description: 'Deploy to Google Cloud' },
      { type: 'deploy-heroku', label: 'Heroku Deploy', icon: Cloud, description: 'Deploy to Heroku' },
      { type: 'deploy-vercel', label: 'Vercel Deploy', icon: Globe, description: 'Deploy to Vercel' },
      { type: 'deploy-netlify', label: 'Netlify Deploy', icon: Globe, description: 'Deploy to Netlify' },
    ]
  },
  "Monitoring & Observability": {
    icon: MonitorSpeaker,
    color: "bg-teal-500",
    components: [
      { type: 'prometheus-setup', label: 'Prometheus', icon: MonitorSpeaker, description: 'Set up Prometheus monitoring' },
      { type: 'grafana-setup', label: 'Grafana', icon: MonitorSpeaker, description: 'Set up Grafana dashboards' },
      { type: 'loki-setup', label: 'Loki', icon: FileText, description: 'Set up Loki log aggregation' },
      { type: 'datadog-setup', label: 'DataDog', icon: MonitorSpeaker, description: 'Set up DataDog monitoring' },
      { type: 'newrelic-setup', label: 'New Relic', icon: MonitorSpeaker, description: 'Set up New Relic APM' },
      { type: 'elk-setup', label: 'ELK Stack', icon: FileText, description: 'Set up ELK stack logging' },
      { type: 'jaeger-setup', label: 'Jaeger', icon: Network, description: 'Set up Jaeger tracing' },
      { type: 'health-check', label: 'Health Check', icon: CheckCircle, description: 'Application health monitoring' },
      { type: 'smoke-test', label: 'Smoke Test', icon: AlertCircle, description: 'Basic functionality verification' },
    ]
  },
  "Database": {
    icon: Database,
    color: "bg-indigo-500",
    components: [
      { type: 'db-migrate', label: 'DB Migration', icon: Database, description: 'Run database migrations' },
      { type: 'db-backup', label: 'DB Backup', icon: Archive, description: 'Backup database' },
      { type: 'db-restore', label: 'DB Restore', icon: Download, description: 'Restore database from backup' },
      { type: 'db-seed', label: 'DB Seed', icon: Package, description: 'Seed database with test data' },
      { type: 'db-health', label: 'DB Health Check', icon: CheckCircle, description: 'Check database connectivity' },
      { type: 'redis-setup', label: 'Redis Setup', icon: Database, description: 'Configure Redis cache' },
      { type: 'mongodb-setup', label: 'MongoDB Setup', icon: Database, description: 'Configure MongoDB' },
      { type: 'postgres-setup', label: 'PostgreSQL Setup', icon: Database, description: 'Configure PostgreSQL' },
    ]
  },
  "Notifications": {
    icon: Bell,
    color: "bg-orange-500",
    components: [
      { type: 'slack-notify', label: 'Slack Notification', icon: MessageSquare, description: 'Send Slack notifications' },
      { type: 'email-notify', label: 'Email Notification', icon: Mail, description: 'Send email notifications' },
      { type: 'teams-notify', label: 'Teams Notification', icon: MessageSquare, description: 'Send Microsoft Teams notifications' },
      { type: 'webhook-notify', label: 'Webhook', icon: Webhook, description: 'Send webhook notifications' },
      { type: 'jira-update', label: 'JIRA Update', icon: AlertCircle, description: 'Update JIRA tickets' },
    ]
  }
};

// Draggable component from palette with enhanced styling
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
      
      {/* Drag indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-60 transition-opacity">
        <Move className="h-3 w-3" />
      </div>
    </div>
  );
};

// Enhanced category dropdown component
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

// Enhanced step node for the graph with better styling
const StepNode = ({ data, selected }: { data: any; selected?: boolean }) => {
  const getNodeIcon = (stepType: string) => {
    // Comprehensive icon mapping for all step types
    const iconMap: { [key: string]: any } = {
      // Source Control
      'github-clone': GitBranch, 'gitlab-clone': GitBranch, 'bitbucket-clone': GitBranch,
      'git-checkout': Code, 'git-merge': Archive, 'git-tag': Archive,
      'github-release': Archive, 'gitlab-release': Archive,
      
      // Build & Compile
      'normal-build': Wrench, 'docker-build': Container, 'helm-build': Boxes,
      'rust-cargo': Package, 'node-npm': Globe, 'node-yarn': Globe,
      'python-pip': Code, 'maven-build': Layers, 'gradle-build': Layers,
      'go-build': Package, 'dotnet-build': Package,
      
      // Testing & Security
      'unit-tests': CheckCircle, 'integration-tests': Network, 'e2e-tests': Globe,
      'owasp-zap': Shield, 'owasp-dependency': Shield, 'snyk-scan': Shield,
      'sonarqube': FileText, 'sast-scan': Shield, 'dast-scan': Shield,
      'performance-test': Cpu, 'accessibility-test': CheckCircle,
      
      // Containerization
      'docker-push': Cloud, 'docker-scan': Shield, 'docker-compose': Layers,
      'buildah': Container, 'podman': Container, 'kaniko': Package,
      
      // Kubernetes & Helm
      'helm-deploy': Boxes, 'helm-upgrade': Rocket, 'helm-rollback': Archive,
      'kubectl-apply': Server, 'kustomize': Layers, 'k8s-secrets': Lock,
      
      // Deployment
      'deploy-local': HardDrive, 'deploy-ssh': Server, 'deploy-k8s': Boxes,
      'deploy-aws': Cloud, 'deploy-azure': Cloud, 'deploy-gcp': Cloud,
      'deploy-heroku': Cloud, 'deploy-vercel': Globe, 'deploy-netlify': Globe,
      
      // Monitoring & Observability
      'prometheus-setup': MonitorSpeaker, 'grafana-setup': MonitorSpeaker,
      'loki-setup': FileText, 'datadog-setup': MonitorSpeaker,
      'newrelic-setup': MonitorSpeaker, 'elk-setup': FileText,
      'jaeger-setup': Network, 'health-check': CheckCircle, 'smoke-test': AlertCircle,
      
      // Database
      'db-migrate': Database, 'db-backup': Archive, 'db-restore': Download,
      'db-seed': Package, 'db-health': CheckCircle, 'redis-setup': Database,
      'mongodb-setup': Database, 'postgres-setup': Database,
      
      // Notifications
      'slack-notify': MessageSquare, 'email-notify': Mail, 'teams-notify': MessageSquare,
      'webhook-notify': Webhook, 'jira-update': AlertCircle,
      
      // Legacy mappings
      git: GitBranch, shell: Terminal, docker: Package, deploy: Server, test: Zap, database: Database,
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
    
    // Legacy color mappings
    const colorMap: { [key: string]: any } = {
      git: { border: 'border-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', iconBg: 'bg-emerald-500' },
      shell: { border: 'border-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20', iconBg: 'bg-blue-500' },
      docker: { border: 'border-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/20', iconBg: 'bg-purple-500' },
      deploy: { border: 'border-red-500', bg: 'bg-red-50 dark:bg-red-950/20', iconBg: 'bg-red-500' },
      test: { border: 'border-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/20', iconBg: 'bg-yellow-500' },
      database: { border: 'border-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/20', iconBg: 'bg-indigo-500' },
    };
    return colorMap[stepType] || { border: 'border-gray-500', bg: 'bg-gray-50 dark:bg-gray-950/20', iconBg: 'bg-gray-500' };
  };

  const Icon = getNodeIcon(data.stepType);
  const colors = getNodeColor(data.stepType);

  return (
    <div className={`group relative overflow-hidden rounded-xl border-2 ${colors.border} ${colors.bg} 
      min-w-[240px] max-w-[280px] shadow-lg hover:shadow-xl transition-all duration-200
      ${selected ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
      
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-white border-2 border-gray-400 shadow-sm hover:scale-110 transition-transform"
      />
      
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <div className={`p-2 ${colors.iconBg} rounded-lg shadow-sm`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-foreground truncate">{data.label}</div>
          <div className="text-xs text-muted-foreground capitalize">{data.stepType.replace('-', ' ')}</div>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-4 pb-4">
        {data.command && (
          <div className="mt-2 p-2 bg-background/70 rounded-md border">
            <div className="text-xs font-mono text-muted-foreground truncate">
              {data.command.length > 35 ? `${data.command.substring(0, 35)}...` : data.command}
            </div>
          </div>
        )}
        
        {data.repository_url && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <GitBranch className="h-3 w-3" />
            <span className="truncate">{data.repository_url.split('/').pop()?.replace('.git', '')}</span>
          </div>
        )}
        
        {data.docker_image && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Container className="h-3 w-3" />
            <span className="truncate">{data.docker_image}</span>
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-white border-2 border-gray-400 shadow-sm hover:scale-110 transition-transform"
      />
      
      {/* Status indicator */}
      <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full opacity-60"></div>
    </div>
  );
};

const nodeTypes: NodeTypes = {
  stepNode: StepNode,
};

// Enhanced graph builder component
const GraphBuilder = ({ pipeline, setPipeline }: { pipeline: Pipeline; setPipeline: any }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>({
    "Source Control": true,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

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

  // Delete functions
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

  // Handle keyboard shortcuts
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
          command: type.includes('shell') ? 'echo "Hello World"' : '',
          repository_url: type.includes('git') ? 'https://github.com/user/repo.git' : '',
          docker_image: type.includes('docker') ? 'node:18-alpine' : '',
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
    <div className={`h-full flex ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''} ${isDarkMode ? 'dark' : ''}`}>
      {/* Left Sidebar - Component Palette */}
      <div className="w-80 bg-card border-r border-border flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Pipeline Components</h2>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="h-8 w-8 p-0"
                title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsFullscreen(!isFullscreen);
                  // Toggle body overflow for proper fullscreen
                  if (!isFullscreen) {
                    document.body.style.overflow = 'hidden';
                  } else {
                    document.body.style.overflow = '';
                  }
                }}
                className="h-8 w-8 p-0 transition-transform hover:scale-110"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Compete with Jenkins - drag components to build enterprise-grade pipelines</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {Object.entries(componentCategories).map(([category, data]) => (
            <CategoryDropdown
              key={category}
              category={category}
              data={data}
              isOpen={openCategories[category]}
              onToggle={() => setOpenCategories(prev => ({
                ...prev,
                [category]: !prev[category]
              }))}
            />
          ))}
        </div>
        
        <div className="p-4 border-t border-border space-y-2">
          <Button 
            onClick={updatePipelineFromGraph}
            className="w-full"
            size="sm"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Update Pipeline
          </Button>
          <Button 
            onClick={deleteSelectedElements}
            className="w-full"
            variant="destructive"
            size="sm"
          >
            <Scissors className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
          <Button 
            onClick={() => {
              setNodes([]);
              setEdges([]);
            }}
            className="w-full"
            variant="outline"
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Canvas
          </Button>
          <div className="text-xs text-muted-foreground text-center pt-2">
            Press Delete/Backspace to remove selected items
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative">
        <div ref={reactFlowWrapper} className="h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodesDelete={onNodesDelete}
            onEdgesDelete={onEdgesDelete}
            nodeTypes={nodeTypes}
            fitView
            className={`${isDarkMode ? 'bg-gray-900' : 'bg-muted/30'}`}
            attributionPosition="bottom-left"
            deleteKeyCode="Delete"
          >
            <Controls className="bg-background border border-border" />
            <MiniMap 
              className="bg-background border border-border"
              nodeColor={() => '#6366f1'}
            />
            <Background 
              gap={20} 
              size={1} 
              className={`${isDarkMode ? 'opacity-30' : 'opacity-50'}`} 
            />
            
            {/* Empty state */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center p-8">
                  <div className="mx-auto mb-4 w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <FolderOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Enterprise CI/CD Pipeline Builder</h3>
                  <p className="text-muted-foreground mb-4">Drag components from the left sidebar to create Jenkins-level pipelines</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>• GitHub, GitLab, Bitbucket integration</div>
                    <div>• Docker, Helm, Kubernetes deployments</div>
                    <div>• OWASP ZAP, Snyk security scanning</div>
                    <div>• Prometheus, Grafana, DataDog monitoring</div>
                  </div>
                </div>
              </div>
            )}
          </ReactFlow>
        </div>
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

  const handleLoad = () => {
    // Create a file input to load YAML files
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.yml,.yaml';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          try {
            // Basic implementation - would need YAML parser for full functionality
            console.log("Loaded pipeline:", content);
            alert('Pipeline loaded successfully! (Demo mode - full YAML parsing coming soon)');
          } catch (error) {
            console.error("Error parsing YAML:", error);
            alert('Error loading pipeline file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleRun = async () => {
    try {
      const yamlContent = generateYAML();
      console.log("Running pipeline with config:", yamlContent);
      
      // Simulate pipeline execution for demo
      alert('Pipeline execution started! (Demo mode - check console for configuration)');
      
      // In real implementation, this would call the backend
      // const response = await fetch('/api/pipelines/execute', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ config: yamlContent })
      // });
    } catch (error) {
      console.error("Error executing pipeline:", error);
      alert('Error executing pipeline');
    }
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

          <div className="flex justify-end gap-2">
            <Button onClick={handleLoad} variant="outline" className="min-w-32">
              <FolderOpen className="h-4 w-4 mr-2" />
              Load Pipeline
            </Button>
            <Button onClick={handleRun} variant="outline" className="min-w-32">
              <Play className="h-4 w-4 mr-2" />
              Run Pipeline
            </Button>
            <Button onClick={handleSave} className="min-w-32">
              <Download className="h-4 w-4 mr-2" />
              Save Pipeline
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}