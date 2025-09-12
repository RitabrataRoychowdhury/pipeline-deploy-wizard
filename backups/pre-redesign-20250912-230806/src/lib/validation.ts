import { PipelineNode, PipelineEdge, ValidationResult } from './pipeline-utils';
import { componentDefinitions } from './component-definitions';
import { ErrorHandler, ERROR_CODES, PipelineError } from './error-handling';

export interface ValidationRule {
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  validate: (nodes: PipelineNode[], edges: PipelineEdge[]) => ValidationIssue[];
}

export interface ValidationIssue {
  rule: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  nodeId?: string;
  edgeId?: string;
  suggestion?: string;
  autoFixable?: boolean;
}

export interface NodeValidationResult {
  nodeId: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface PipelineValidationResult extends ValidationResult {
  nodeValidations: NodeValidationResult[];
  issues: ValidationIssue[];
  canAutoFix: boolean;
  fixableIssues: ValidationIssue[];
}

// Enhanced validation rules
export const VALIDATION_RULES: ValidationRule[] = [
  {
    name: 'circular-dependency',
    description: 'Detect circular dependencies in pipeline flow',
    severity: 'error',
    validate: (nodes, edges) => {
      const issues: ValidationIssue[] = [];
      const cycles = findAllCycles(nodes, edges);
      
      cycles.forEach((cycle, index) => {
        issues.push({
          rule: 'circular-dependency',
          severity: 'error',
          message: `Circular dependency detected: ${cycle.join(' → ')}`,
          suggestion: 'Remove one of the connections in the cycle to fix this issue',
          autoFixable: true,
        });
      });
      
      return issues;
    },
  },
  {
    name: 'orphaned-nodes',
    description: 'Find nodes not connected to the main pipeline flow',
    severity: 'warning',
    validate: (nodes, edges) => {
      const issues: ValidationIssue[] = [];
      const connectedNodes = new Set<string>();
      
      edges.forEach(edge => {
        connectedNodes.add(edge.source);
        connectedNodes.add(edge.target);
      });
      
      nodes.forEach(node => {
        if (!connectedNodes.has(node.id)) {
          issues.push({
            rule: 'orphaned-nodes',
            severity: 'warning',
            message: `Node "${node.data.label}" is not connected to the pipeline`,
            nodeId: node.id,
            suggestion: 'Connect this node to the pipeline or remove it if not needed',
            autoFixable: false,
          });
        }
      });
      
      return issues;
    },
  },
  {
    name: 'missing-labels',
    description: 'Check for nodes without proper labels',
    severity: 'error',
    validate: (nodes) => {
      const issues: ValidationIssue[] = [];
      
      nodes.forEach(node => {
        if (!node.data.label || node.data.label.trim() === '') {
          issues.push({
            rule: 'missing-labels',
            severity: 'error',
            message: `Node is missing a label`,
            nodeId: node.id,
            suggestion: 'Add a descriptive label to identify this step',
            autoFixable: true,
          });
        }
      });
      
      return issues;
    },
  },
  {
    name: 'invalid-connections',
    description: 'Validate connections between incompatible node types',
    severity: 'error',
    validate: (nodes, edges) => {
      const issues: ValidationIssue[] = [];
      const nodeMap = new Map(nodes.map(node => [node.id, node]));
      
      edges.forEach(edge => {
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);
        
        if (sourceNode && targetNode) {
          const isValidConnection = validateNodeConnection(sourceNode, targetNode);
          if (!isValidConnection) {
            issues.push({
              rule: 'invalid-connections',
              severity: 'error',
              message: `Invalid connection between ${sourceNode.data.stepType} and ${targetNode.data.stepType}`,
              edgeId: edge.id,
              suggestion: 'Check component documentation for valid connection types',
              autoFixable: false,
            });
          }
        }
      });
      
      return issues;
    },
  },
  {
    name: 'missing-configuration',
    description: 'Check for nodes with missing required configuration',
    severity: 'error',
    validate: (nodes) => {
      const issues: ValidationIssue[] = [];
      
      nodes.forEach(node => {
        const componentDef = componentDefinitions.find(def => def.type === node.data.stepType);
        if (componentDef) {
          const requiredFields = getRequiredFields(componentDef);
          const config = node.data.configuration || {};
          
          requiredFields.forEach(field => {
            if (!config[field] || config[field] === '') {
              issues.push({
                rule: 'missing-configuration',
                severity: 'error',
                message: `Missing required configuration: ${field}`,
                nodeId: node.id,
                suggestion: `Configure the ${field} field for this component`,
                autoFixable: false,
              });
            }
          });
        }
      });
      
      return issues;
    },
  },
  {
    name: 'duplicate-labels',
    description: 'Check for nodes with duplicate labels',
    severity: 'warning',
    validate: (nodes) => {
      const issues: ValidationIssue[] = [];
      const labelCounts = new Map<string, string[]>();
      
      nodes.forEach(node => {
        const label = node.data.label?.trim().toLowerCase();
        if (label) {
          if (!labelCounts.has(label)) {
            labelCounts.set(label, []);
          }
          labelCounts.get(label)!.push(node.id);
        }
      });
      
      labelCounts.forEach((nodeIds, label) => {
        if (nodeIds.length > 1) {
          nodeIds.forEach(nodeId => {
            issues.push({
              rule: 'duplicate-labels',
              severity: 'warning',
              message: `Duplicate label "${label}" found`,
              nodeId,
              suggestion: 'Use unique labels to avoid confusion',
              autoFixable: true,
            });
          });
        }
      });
      
      return issues;
    },
  },
  {
    name: 'unreachable-nodes',
    description: 'Find nodes that cannot be reached from entry points',
    severity: 'warning',
    validate: (nodes, edges) => {
      const issues: ValidationIssue[] = [];
      const entryNodes = findEntryNodes(nodes, edges);
      const reachableNodes = findReachableNodes(entryNodes, edges);
      
      nodes.forEach(node => {
        if (!reachableNodes.has(node.id) && !entryNodes.includes(node.id)) {
          issues.push({
            rule: 'unreachable-nodes',
            severity: 'warning',
            message: `Node "${node.data.label}" is unreachable from pipeline entry points`,
            nodeId: node.id,
            suggestion: 'Connect this node to the main pipeline flow',
            autoFixable: false,
          });
        }
      });
      
      return issues;
    },
  },
  {
    name: 'performance-warnings',
    description: 'Check for potential performance issues',
    severity: 'info',
    validate: (nodes, edges) => {
      const issues: ValidationIssue[] = [];
      
      // Check for too many parallel branches
      const parallelBranches = countParallelBranches(nodes, edges);
      if (parallelBranches > 10) {
        issues.push({
          rule: 'performance-warnings',
          severity: 'info',
          message: `High number of parallel branches (${parallelBranches}) may impact performance`,
          suggestion: 'Consider grouping related steps or using sequential execution',
          autoFixable: false,
        });
      }
      
      // Check for very long pipelines
      const maxDepth = calculateMaxDepth(nodes, edges);
      if (maxDepth > 20) {
        issues.push({
          rule: 'performance-warnings',
          severity: 'info',
          message: `Pipeline depth (${maxDepth}) is very high`,
          suggestion: 'Consider breaking into smaller, modular pipelines',
          autoFixable: false,
        });
      }
      
      return issues;
    },
  },
];

// Enhanced validation class
export class PipelineValidator {
  private rules: ValidationRule[];
  private errorHandler: ErrorHandler;

  constructor(customRules: ValidationRule[] = []) {
    this.rules = [...VALIDATION_RULES, ...customRules];
    this.errorHandler = ErrorHandler.getInstance();
  }

  // Comprehensive pipeline validation
  validatePipeline(nodes: PipelineNode[], edges: PipelineEdge[]): PipelineValidationResult {
    try {
      const issues: ValidationIssue[] = [];
      const nodeValidations: NodeValidationResult[] = [];

      // Run all validation rules
      this.rules.forEach(rule => {
        try {
          const ruleIssues = rule.validate(nodes, edges);
          issues.push(...ruleIssues);
        } catch (error) {
          this.errorHandler.handleError(
            new PipelineError({
              code: ERROR_CODES.INVALID_NODE_CONFIG,
              message: `Validation rule "${rule.name}" failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
              severity: 'medium',
              recoverable: true,
              context: {
                component: 'validator',
                action: 'validate',
                timestamp: new Date(),
                metadata: { rule: rule.name },
              },
            })
          );
        }
      });

      // Validate individual nodes
      nodes.forEach(node => {
        const nodeValidation = this.validateNode(node);
        nodeValidations.push(nodeValidation);
      });

      // Separate errors and warnings
      const errors = issues.filter(issue => issue.severity === 'error').map(issue => issue.message);
      const warnings = issues.filter(issue => issue.severity === 'warning').map(issue => issue.message);
      const fixableIssues = issues.filter(issue => issue.autoFixable);

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        nodeValidations,
        issues,
        canAutoFix: fixableIssues.length > 0,
        fixableIssues,
      };
    } catch (error) {
      this.errorHandler.handleError(error as Error, {
        component: 'validator',
        action: 'validatePipeline',
        timestamp: new Date(),
      });

      return {
        isValid: false,
        errors: ['Validation failed due to an internal error'],
        warnings: [],
        nodeValidations: [],
        issues: [],
        canAutoFix: false,
        fixableIssues: [],
      };
    }
  }

  // Validate individual node
  validateNode(node: PipelineNode): NodeValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    try {
      // Check basic node properties
      if (!node.data.label || node.data.label.trim() === '') {
        errors.push('Node label is required');
      }

      if (!node.data.stepType) {
        errors.push('Node type is required');
      }

      // Validate against component definition
      const componentDef = componentDefinitions.find(def => def.type === node.data.stepType);
      if (!componentDef) {
        errors.push(`Unknown component type: ${node.data.stepType}`);
      } else {
        // Validate configuration
        const configValidation = this.validateNodeConfiguration(node, componentDef);
        errors.push(...configValidation.errors);
        warnings.push(...configValidation.warnings);
        suggestions.push(...configValidation.suggestions);
      }

      return {
        nodeId: node.id,
        isValid: errors.length === 0,
        errors,
        warnings,
        suggestions,
      };
    } catch (error) {
      this.errorHandler.handleError(error as Error, {
        component: 'validator',
        action: 'validateNode',
        timestamp: new Date(),
        metadata: { nodeId: node.id },
      });

      return {
        nodeId: node.id,
        isValid: false,
        errors: ['Node validation failed due to an internal error'],
        warnings: [],
        suggestions: [],
      };
    }
  }

  // Validate node configuration against component definition
  private validateNodeConfiguration(node: PipelineNode, componentDef: any): {
    errors: string[];
    warnings: string[];
    suggestions: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const config = node.data.configuration || {};
    const requiredFields = getRequiredFields(componentDef);

    // Check required fields
    requiredFields.forEach(field => {
      if (!config[field] || config[field] === '') {
        errors.push(`Required field "${field}" is missing`);
      }
    });

    // Check for deprecated configurations
    const deprecatedFields = getDeprecatedFields(componentDef);
    deprecatedFields.forEach(field => {
      if (config[field]) {
        warnings.push(`Field "${field}" is deprecated`);
        suggestions.push(`Consider using the recommended alternative for "${field}"`);
      }
    });

    return { errors, warnings, suggestions };
  }

  // Auto-fix certain validation issues
  autoFixIssues(nodes: PipelineNode[], edges: PipelineEdge[], issues: ValidationIssue[]): {
    nodes: PipelineNode[];
    edges: PipelineEdge[];
    fixedIssues: ValidationIssue[];
  } {
    let fixedNodes = [...nodes];
    let fixedEdges = [...edges];
    const fixedIssues: ValidationIssue[] = [];

    issues.forEach(issue => {
      if (!issue.autoFixable) return;

      try {
        switch (issue.rule) {
          case 'missing-labels':
            if (issue.nodeId) {
              const nodeIndex = fixedNodes.findIndex(n => n.id === issue.nodeId);
              if (nodeIndex !== -1) {
                fixedNodes[nodeIndex] = {
                  ...fixedNodes[nodeIndex],
                  data: {
                    ...fixedNodes[nodeIndex].data,
                    label: `${fixedNodes[nodeIndex].data.stepType}-${Date.now()}`,
                  },
                };
                fixedIssues.push(issue);
              }
            }
            break;

          case 'duplicate-labels':
            if (issue.nodeId) {
              const nodeIndex = fixedNodes.findIndex(n => n.id === issue.nodeId);
              if (nodeIndex !== -1) {
                const originalLabel = fixedNodes[nodeIndex].data.label;
                fixedNodes[nodeIndex] = {
                  ...fixedNodes[nodeIndex],
                  data: {
                    ...fixedNodes[nodeIndex].data,
                    label: `${originalLabel}-${Math.random().toString(36).substr(2, 4)}`,
                  },
                };
                fixedIssues.push(issue);
              }
            }
            break;

          case 'circular-dependency':
            // Remove the last edge in the cycle (simple strategy)
            const cycleEdges = findCycleEdges(fixedNodes, fixedEdges);
            if (cycleEdges.length > 0) {
              const edgeToRemove = cycleEdges[cycleEdges.length - 1];
              fixedEdges = fixedEdges.filter(edge => edge.id !== edgeToRemove.id);
              fixedIssues.push(issue);
            }
            break;
        }
      } catch (error) {
        this.errorHandler.handleError(error as Error, {
          component: 'validator',
          action: 'autoFix',
          timestamp: new Date(),
          metadata: { issue: issue.rule },
        });
      }
    });

    return {
      nodes: fixedNodes,
      edges: fixedEdges,
      fixedIssues,
    };
  }
}

// Helper functions
function findAllCycles(nodes: PipelineNode[], edges: PipelineEdge[]): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const path: string[] = [];
  
  const adjacencyList = buildAdjacencyList(edges);
  
  const dfs = (nodeId: string): void => {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);
    
    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      } else if (recursionStack.has(neighbor)) {
        // Found a cycle
        const cycleStart = path.indexOf(neighbor);
        const cycle = path.slice(cycleStart);
        cycle.push(neighbor); // Complete the cycle
        cycles.push(cycle);
      }
    }
    
    recursionStack.delete(nodeId);
    path.pop();
  };
  
  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      dfs(node.id);
    }
  });
  
  return cycles;
}

function buildAdjacencyList(edges: PipelineEdge[]): Map<string, string[]> {
  const adjacencyList = new Map<string, string[]>();
  
  edges.forEach(edge => {
    if (!adjacencyList.has(edge.source)) {
      adjacencyList.set(edge.source, []);
    }
    adjacencyList.get(edge.source)!.push(edge.target);
  });
  
  return adjacencyList;
}

function validateNodeConnection(sourceNode: PipelineNode, targetNode: PipelineNode): boolean {
  // Define connection rules based on component types
  const connectionRules: Record<string, string[]> = {
    'github-clone': ['docker-build', 'node-npm', 'python-build', 'normal-build'],
    'gitlab-clone': ['docker-build', 'node-npm', 'python-build', 'normal-build'],
    'docker-build': ['unit-tests', 'integration-tests', 'security-scan', 'deploy-local', 'deploy-ssh', 'deploy-k8s'],
    'node-npm': ['unit-tests', 'integration-tests', 'security-scan', 'deploy-local', 'deploy-ssh'],
    'unit-tests': ['integration-tests', 'security-scan', 'deploy-local', 'deploy-ssh', 'deploy-k8s'],
    'integration-tests': ['security-scan', 'deploy-local', 'deploy-ssh', 'deploy-k8s'],
    'security-scan': ['deploy-local', 'deploy-ssh', 'deploy-k8s'],
  };
  
  const allowedTargets = connectionRules[sourceNode.data.stepType];
  return !allowedTargets || allowedTargets.includes(targetNode.data.stepType);
}

function getRequiredFields(componentDef: any): string[] {
  // This would be defined in the component definition
  // For now, return common required fields
  const commonRequired: Record<string, string[]> = {
    'github-clone': ['repository', 'branch'],
    'gitlab-clone': ['repository', 'branch'],
    'docker-build': ['dockerfile'],
    'deploy-ssh': ['host', 'username'],
    'deploy-k8s': ['cluster', 'namespace'],
  };
  
  return commonRequired[componentDef.type] || [];
}

function getDeprecatedFields(componentDef: any): string[] {
  // This would be defined in the component definition
  return [];
}

function findEntryNodes(nodes: PipelineNode[], edges: PipelineEdge[]): string[] {
  const hasIncomingEdge = new Set(edges.map(edge => edge.target));
  return nodes.filter(node => !hasIncomingEdge.has(node.id)).map(node => node.id);
}

function findReachableNodes(entryNodes: string[], edges: PipelineEdge[]): Set<string> {
  const reachable = new Set<string>(entryNodes);
  const adjacencyList = buildAdjacencyList(edges);
  const queue = [...entryNodes];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = adjacencyList.get(current) || [];
    
    neighbors.forEach(neighbor => {
      if (!reachable.has(neighbor)) {
        reachable.add(neighbor);
        queue.push(neighbor);
      }
    });
  }
  
  return reachable;
}

function countParallelBranches(nodes: PipelineNode[], edges: PipelineEdge[]): number {
  const adjacencyList = buildAdjacencyList(edges);
  let maxParallel = 0;
  
  adjacencyList.forEach(neighbors => {
    maxParallel = Math.max(maxParallel, neighbors.length);
  });
  
  return maxParallel;
}

function calculateMaxDepth(nodes: PipelineNode[], edges: PipelineEdge[]): number {
  const entryNodes = findEntryNodes(nodes, edges);
  const adjacencyList = buildAdjacencyList(edges);
  let maxDepth = 0;
  
  const dfs = (nodeId: string, depth: number): void => {
    maxDepth = Math.max(maxDepth, depth);
    const neighbors = adjacencyList.get(nodeId) || [];
    neighbors.forEach(neighbor => dfs(neighbor, depth + 1));
  };
  
  entryNodes.forEach(nodeId => dfs(nodeId, 1));
  return maxDepth;
}

function findCycleEdges(nodes: PipelineNode[], edges: PipelineEdge[]): PipelineEdge[] {
  // Simple implementation - return edges that create cycles
  // This would need more sophisticated cycle detection
  return [];
}

// Export singleton validator instance
export const pipelineValidator = new PipelineValidator();