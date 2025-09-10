import { type Node, type Edge } from '@xyflow/react';
import { componentDefinitions } from './component-definitions';

export interface PipelineNode extends Node {
  data: {
    label: string;
    stepType: string;
    command?: string;
    configuration?: Record<string, any>;
    validation?: ValidationResult;
  };
}

export interface PipelineEdge extends Edge {
  data?: {
    condition?: string;
    label?: string;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ComponentDefinition {
  type: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  color: string;
  defaultConfig: Record<string, any>;
  tags?: string[];
}

export interface ComponentCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  components: ComponentDefinition[];
}

// Pipeline validation utilities
export const validatePipeline = (nodes: PipelineNode[], edges: PipelineEdge[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for circular dependencies
  const hasCycle = detectCycle(nodes, edges);
  if (hasCycle) {
    errors.push("Pipeline contains circular dependencies");
  }

  // Check for orphaned nodes
  const orphanedNodes = findOrphanedNodes(nodes, edges);
  if (orphanedNodes.length > 0) {
    warnings.push(`${orphanedNodes.length} nodes are not connected to the pipeline flow`);
  }

  // Check for missing required configurations
  nodes.forEach(node => {
    if (!node.data.label?.trim()) {
      errors.push(`Node ${node.id} is missing a label`);
    }
    if (!node.data.stepType) {
      errors.push(`Node ${node.id} is missing a step type`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Detect cycles in the pipeline graph
const detectCycle = (nodes: PipelineNode[], edges: PipelineEdge[]): boolean => {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  const adjacencyList = buildAdjacencyList(edges);
  
  const hasCycleDFS = (nodeId: string): boolean => {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    
    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycleDFS(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }
    
    recursionStack.delete(nodeId);
    return false;
  };
  
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (hasCycleDFS(node.id)) return true;
    }
  }
  
  return false;
};

// Build adjacency list from edges
const buildAdjacencyList = (edges: PipelineEdge[]): Map<string, string[]> => {
  const adjacencyList = new Map<string, string[]>();
  
  edges.forEach(edge => {
    if (!adjacencyList.has(edge.source)) {
      adjacencyList.set(edge.source, []);
    }
    adjacencyList.get(edge.source)!.push(edge.target);
  });
  
  return adjacencyList;
};

// Find nodes that are not connected to the main flow
const findOrphanedNodes = (nodes: PipelineNode[], edges: PipelineEdge[]): PipelineNode[] => {
  const connectedNodes = new Set<string>();
  
  edges.forEach(edge => {
    connectedNodes.add(edge.source);
    connectedNodes.add(edge.target);
  });
  
  return nodes.filter(node => !connectedNodes.has(node.id));
};

// Generate unique node ID
export const generateNodeId = (type: string): string => {
  return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Generate unique edge ID
export const generateEdgeId = (sourceId: string, targetId: string): string => {
  return `edge-${sourceId}-${targetId}`;
};

// Helper function to get component definition by type
export const getComponentDefinition = (type: string): ComponentDefinition | undefined => {
  return componentDefinitions.find(def => def.type === type);
};

// Convert pipeline to YAML format
export const pipelineToYAML = (nodes: PipelineNode[], edges: PipelineEdge[], name: string = "Generated Pipeline"): string => {
  const sortedNodes = topologicalSort(nodes, edges);
  
  return `
pipeline:
  name: "${name}"
  description: "Generated from visual pipeline builder"
  stages:
    - name: "main"
      steps:
${sortedNodes.map(node => `        - name: "${node.data.label}"
          type: "${node.data.stepType}"${node.data.command ? `
          command: "${node.data.command}"` : ''}${Object.keys(node.data.configuration || {}).length > 0 ? `
          config: ${JSON.stringify(node.data.configuration, null, 12).split('\n').map(line => `            ${line}`).join('\n').trim()}` : ''}`).join('\n')}
`.trim();
};

// Topological sort for proper execution order
const topologicalSort = (nodes: PipelineNode[], edges: PipelineEdge[]): PipelineNode[] => {
  const adjacencyList = buildAdjacencyList(edges);
  const inDegree = new Map<string, number>();
  const result: PipelineNode[] = [];
  const queue: string[] = [];
  
  // Initialize in-degree count
  nodes.forEach(node => {
    inDegree.set(node.id, 0);
  });
  
  edges.forEach(edge => {
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });
  
  // Find nodes with no incoming edges
  nodes.forEach(node => {
    if (inDegree.get(node.id) === 0) {
      queue.push(node.id);
    }
  });
  
  // Process nodes
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      result.push(node);
    }
    
    const neighbors = adjacencyList.get(nodeId) || [];
    neighbors.forEach(neighbor => {
      inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    });
  }
  
  // If result doesn't contain all nodes, there's a cycle
  if (result.length !== nodes.length) {
    // Return original order if there's a cycle
    return nodes;
  }
  
  return result;
};

// Auto-layout utilities
export const autoLayoutNodes = (nodes: PipelineNode[], edges: PipelineEdge[]): PipelineNode[] => {
  const layers = calculateLayers(nodes, edges);
  const nodeWidth = 200;
  const nodeHeight = 100;
  const horizontalSpacing = 250;
  const verticalSpacing = 150;
  
  return nodes.map(node => {
    const layer = layers.get(node.id) || 0;
    const nodesInLayer = Array.from(layers.entries()).filter(([_, l]) => l === layer).length;
    const indexInLayer = Array.from(layers.entries()).filter(([_, l]) => l === layer).findIndex(([id]) => id === node.id);
    
    return {
      ...node,
      position: {
        x: layer * horizontalSpacing,
        y: (indexInLayer - (nodesInLayer - 1) / 2) * verticalSpacing
      }
    };
  });
};

// Calculate layers for auto-layout
const calculateLayers = (nodes: PipelineNode[], edges: PipelineEdge[]): Map<string, number> => {
  const layers = new Map<string, number>();
  const adjacencyList = buildAdjacencyList(edges);
  const visited = new Set<string>();
  
  const calculateLayer = (nodeId: string): number => {
    if (layers.has(nodeId)) {
      return layers.get(nodeId)!;
    }
    
    if (visited.has(nodeId)) {
      return 0; // Cycle detected, assign to layer 0
    }
    
    visited.add(nodeId);
    
    const predecessors = edges.filter(edge => edge.target === nodeId).map(edge => edge.source);
    if (predecessors.length === 0) {
      layers.set(nodeId, 0);
      return 0;
    }
    
    const maxPredecessorLayer = Math.max(...predecessors.map(pred => calculateLayer(pred)));
    const layer = maxPredecessorLayer + 1;
    layers.set(nodeId, layer);
    
    visited.delete(nodeId);
    return layer;
  };
  
  nodes.forEach(node => {
    calculateLayer(node.id);
  });
  
  return layers;
};

// Color utilities for different component types
export const getComponentColor = (stepType: string): { border: string; bg: string; iconBg: string } => {
  const colorMap: { [key: string]: { border: string; bg: string; iconBg: string } } = {
    // Source Control
    'github-clone': { border: 'border-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', iconBg: 'bg-emerald-500' },
    'gitlab-clone': { border: 'border-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', iconBg: 'bg-emerald-500' },
    'git-checkout': { border: 'border-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', iconBg: 'bg-emerald-500' },
    
    // Build & Compile
    'docker-build': { border: 'border-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20', iconBg: 'bg-blue-500' },
    'node-npm': { border: 'border-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20', iconBg: 'bg-blue-500' },
    'normal-build': { border: 'border-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20', iconBg: 'bg-blue-500' },
    'python-build': { border: 'border-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20', iconBg: 'bg-blue-500' },
    
    // Testing
    'unit-tests': { border: 'border-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/20', iconBg: 'bg-purple-500' },
    'integration-tests': { border: 'border-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/20', iconBg: 'bg-purple-500' },
    'security-scan': { border: 'border-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/20', iconBg: 'bg-purple-500' },
    
    // Deployment
    'deploy-local': { border: 'border-red-500', bg: 'bg-red-50 dark:bg-red-950/20', iconBg: 'bg-red-500' },
    'deploy-ssh': { border: 'border-red-500', bg: 'bg-red-50 dark:bg-red-950/20', iconBg: 'bg-red-500' },
    'deploy-k8s': { border: 'border-red-500', bg: 'bg-red-50 dark:bg-red-950/20', iconBg: 'bg-red-500' },
    'deploy-cloud': { border: 'border-red-500', bg: 'bg-red-50 dark:bg-red-950/20', iconBg: 'bg-red-500' },
    
    // Database
    'database-migration': { border: 'border-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/20', iconBg: 'bg-yellow-500' },
    'database-backup': { border: 'border-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/20', iconBg: 'bg-yellow-500' },
    
    // Utilities
    'shell-command': { border: 'border-gray-500', bg: 'bg-gray-50 dark:bg-gray-950/20', iconBg: 'bg-gray-500' },
    'file-operations': { border: 'border-gray-500', bg: 'bg-gray-50 dark:bg-gray-950/20', iconBg: 'bg-gray-500' },
    'environment-setup': { border: 'border-gray-500', bg: 'bg-gray-50 dark:bg-gray-950/20', iconBg: 'bg-gray-500' },
    'notification': { border: 'border-gray-500', bg: 'bg-gray-50 dark:bg-gray-950/20', iconBg: 'bg-gray-500' },
  };
  
  return colorMap[stepType] || { 
    border: 'border-gray-500', 
    bg: 'bg-gray-50 dark:bg-gray-950/20', 
    iconBg: 'bg-gray-500' 
  };
};

// Keyboard shortcut utilities
export const setupKeyboardShortcuts = (callbacks: {
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onDelete?: () => void;
  onSelectAll?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onToggleGrid?: () => void;
  onTogglePalette?: () => void;
  onResetView?: () => void;
}) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    // Ignore shortcuts when typing in inputs
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }
    
    const { ctrlKey, metaKey, key, shiftKey } = event;
    const isModifierPressed = ctrlKey || metaKey;
    
    switch (key.toLowerCase()) {
      case 's':
        if (isModifierPressed) {
          event.preventDefault();
          callbacks.onSave?.();
        }
        break;
      case 'z':
        if (isModifierPressed && !shiftKey) {
          event.preventDefault();
          callbacks.onUndo?.();
        } else if (isModifierPressed && shiftKey) {
          event.preventDefault();
          callbacks.onRedo?.();
        }
        break;
      case 'y':
        if (isModifierPressed) {
          event.preventDefault();
          callbacks.onRedo?.();
        }
        break;
      case 'delete':
      case 'backspace':
        if (!isModifierPressed) {
          event.preventDefault();
          callbacks.onDelete?.();
        }
        break;
      case 'a':
        if (isModifierPressed) {
          event.preventDefault();
          callbacks.onSelectAll?.();
        }
        break;
      case 'c':
        if (isModifierPressed) {
          event.preventDefault();
          callbacks.onCopy?.();
        }
        break;
      case 'v':
        if (isModifierPressed) {
          event.preventDefault();
          callbacks.onPaste?.();
        }
        break;
      case 'g':
        if (!isModifierPressed) {
          event.preventDefault();
          callbacks.onToggleGrid?.();
        }
        break;
      case 'p':
        if (!isModifierPressed) {
          event.preventDefault();
          callbacks.onTogglePalette?.();
        }
        break;
      case 'r':
        if (!isModifierPressed) {
          event.preventDefault();
          callbacks.onResetView?.();
        }
        break;
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
};