import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PipelineValidator, VALIDATION_RULES } from '../validation';
import { PipelineNode, PipelineEdge } from '../pipeline-utils';

// Mock component definitions
vi.mock('../component-definitions', () => ({
  componentDefinitions: [
    {
      type: 'github-clone',
      name: 'GitHub Clone',
      category: 'source',
      color: 'emerald',
      defaultConfig: {},
    },
    {
      type: 'docker-build',
      name: 'Docker Build',
      category: 'build',
      color: 'blue',
      defaultConfig: {},
    },
    {
      type: 'unit-tests',
      name: 'Unit Tests',
      category: 'test',
      color: 'purple',
      defaultConfig: {},
    },
  ],
}));

describe('PipelineValidator', () => {
  let validator: PipelineValidator;
  let mockNodes: PipelineNode[];
  let mockEdges: PipelineEdge[];

  beforeEach(() => {
    validator = new PipelineValidator();
    
    mockNodes = [
      {
        id: 'node-1',
        type: 'pipelineNode',
        position: { x: 0, y: 0 },
        data: {
          label: 'Clone Repository',
          stepType: 'github-clone',
          configuration: { repository: 'test/repo', branch: 'main' },
        },
      },
      {
        id: 'node-2',
        type: 'pipelineNode',
        position: { x: 200, y: 0 },
        data: {
          label: 'Build Docker Image',
          stepType: 'docker-build',
          configuration: { dockerfile: 'Dockerfile' },
        },
      },
      {
        id: 'node-3',
        type: 'pipelineNode',
        position: { x: 400, y: 0 },
        data: {
          label: 'Run Tests',
          stepType: 'unit-tests',
          configuration: {},
        },
      },
    ];

    mockEdges = [
      {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        type: 'smoothstep',
      },
      {
        id: 'edge-2',
        source: 'node-2',
        target: 'node-3',
        type: 'smoothstep',
      },
    ];
  });

  describe('validatePipeline', () => {
    it('should validate a correct pipeline', () => {
      const result = validator.validatePipeline(mockNodes, mockEdges);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.nodeValidations).toHaveLength(3);
    });

    it('should detect circular dependencies', () => {
      // Add edge that creates a cycle
      const cyclicEdges = [
        ...mockEdges,
        {
          id: 'edge-3',
          source: 'node-3',
          target: 'node-1',
          type: 'smoothstep',
        },
      ];

      const result = validator.validatePipeline(mockNodes, cyclicEdges);
      
      expect(result.isValid).toBe(false);
      expect(result.issues.some(issue => issue.rule === 'circular-dependency')).toBe(true);
    });

    it('should detect orphaned nodes', () => {
      const orphanedNodes = [
        ...mockNodes,
        {
          id: 'node-4',
          type: 'pipelineNode',
          position: { x: 600, y: 0 },
          data: {
            label: 'Orphaned Node',
            stepType: 'unit-tests',
            configuration: {},
          },
        },
      ];

      const result = validator.validatePipeline(orphanedNodes, mockEdges);
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.issues.some(issue => issue.rule === 'orphaned-nodes')).toBe(true);
    });

    it('should detect missing labels', () => {
      const nodesWithMissingLabels = [
        {
          ...mockNodes[0],
          data: {
            ...mockNodes[0].data,
            label: '',
          },
        },
        ...mockNodes.slice(1),
      ];

      const result = validator.validatePipeline(nodesWithMissingLabels, mockEdges);
      
      expect(result.isValid).toBe(false);
      expect(result.issues.some(issue => issue.rule === 'missing-labels')).toBe(true);
    });

    it('should detect duplicate labels', () => {
      const nodesWithDuplicateLabels = [
        mockNodes[0],
        {
          ...mockNodes[1],
          data: {
            ...mockNodes[1].data,
            label: mockNodes[0].data.label, // Same label as first node
          },
        },
        mockNodes[2],
      ];

      const result = validator.validatePipeline(nodesWithDuplicateLabels, mockEdges);
      
      expect(result.issues.some(issue => issue.rule === 'duplicate-labels')).toBe(true);
    });

    it('should detect unreachable nodes', () => {
      const unreachableNodes = [
        ...mockNodes,
        {
          id: 'node-4',
          type: 'pipelineNode',
          position: { x: 600, y: 200 },
          data: {
            label: 'Unreachable Node',
            stepType: 'unit-tests',
            configuration: {},
          },
        },
      ];

      const unreachableEdges = [
        ...mockEdges,
        // This node is connected but not reachable from entry points
        {
          id: 'edge-3',
          source: 'node-4',
          target: 'node-4', // Self-loop
          type: 'smoothstep',
        },
      ];

      const result = validator.validatePipeline(unreachableNodes, unreachableEdges);
      
      expect(result.issues.some(issue => issue.rule === 'unreachable-nodes')).toBe(true);
    });

    it('should detect performance warnings for many parallel branches', () => {
      // Create a node with many outgoing connections
      const manyBranchNodes = [
        mockNodes[0],
        ...Array.from({ length: 15 }, (_, i) => ({
          id: `branch-node-${i}`,
          type: 'pipelineNode' as const,
          position: { x: 200 + i * 50, y: i * 50 },
          data: {
            label: `Branch ${i}`,
            stepType: 'unit-tests',
            configuration: {},
          },
        })),
      ];

      const manyBranchEdges = Array.from({ length: 15 }, (_, i) => ({
        id: `branch-edge-${i}`,
        source: 'node-1',
        target: `branch-node-${i}`,
        type: 'smoothstep' as const,
      }));

      const result = validator.validatePipeline(manyBranchNodes, manyBranchEdges);
      
      expect(result.issues.some(issue => issue.rule === 'performance-warnings')).toBe(true);
    });
  });

  describe('validateNode', () => {
    it('should validate a correct node', () => {
      const result = validator.validateNode(mockNodes[0]);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing label', () => {
      const nodeWithoutLabel = {
        ...mockNodes[0],
        data: {
          ...mockNodes[0].data,
          label: '',
        },
      };

      const result = validator.validateNode(nodeWithoutLabel);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('label'))).toBe(true);
    });

    it('should detect missing step type', () => {
      const nodeWithoutStepType = {
        ...mockNodes[0],
        data: {
          ...mockNodes[0].data,
          stepType: '',
        },
      };

      const result = validator.validateNode(nodeWithoutStepType);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('type'))).toBe(true);
    });

    it('should detect unknown component type', () => {
      const nodeWithUnknownType = {
        ...mockNodes[0],
        data: {
          ...mockNodes[0].data,
          stepType: 'unknown-type',
        },
      };

      const result = validator.validateNode(nodeWithUnknownType);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('Unknown component type'))).toBe(true);
    });
  });

  describe('autoFixIssues', () => {
    it('should fix missing labels', () => {
      const nodesWithMissingLabels = [
        {
          ...mockNodes[0],
          data: {
            ...mockNodes[0].data,
            label: '',
          },
        },
        ...mockNodes.slice(1),
      ];

      const validationResult = validator.validatePipeline(nodesWithMissingLabels, mockEdges);
      const fixableIssues = validationResult.issues.filter(issue => issue.autoFixable);
      
      const { nodes: fixedNodes, fixedIssues } = validator.autoFixIssues(
        nodesWithMissingLabels,
        mockEdges,
        fixableIssues
      );

      expect(fixedIssues.length).toBeGreaterThan(0);
      expect(fixedNodes[0].data.label).not.toBe('');
      expect(fixedNodes[0].data.label).toContain(fixedNodes[0].data.stepType);
    });

    it('should fix duplicate labels', () => {
      const nodesWithDuplicateLabels = [
        mockNodes[0],
        {
          ...mockNodes[1],
          data: {
            ...mockNodes[1].data,
            label: mockNodes[0].data.label,
          },
        },
        mockNodes[2],
      ];

      const validationResult = validator.validatePipeline(nodesWithDuplicateLabels, mockEdges);
      const fixableIssues = validationResult.issues.filter(issue => issue.autoFixable);
      
      const { nodes: fixedNodes, fixedIssues } = validator.autoFixIssues(
        nodesWithDuplicateLabels,
        mockEdges,
        fixableIssues
      );

      expect(fixedIssues.length).toBeGreaterThan(0);
      expect(fixedNodes[0].data.label).not.toBe(fixedNodes[1].data.label);
    });

    it('should not modify non-fixable issues', () => {
      const validationResult = validator.validatePipeline(mockNodes, mockEdges);
      const nonFixableIssues = validationResult.issues.filter(issue => !issue.autoFixable);
      
      const { nodes: fixedNodes, edges: fixedEdges, fixedIssues } = validator.autoFixIssues(
        mockNodes,
        mockEdges,
        nonFixableIssues
      );

      expect(fixedIssues).toHaveLength(0);
      expect(fixedNodes).toEqual(mockNodes);
      expect(fixedEdges).toEqual(mockEdges);
    });
  });

  describe('validation rules', () => {
    it('should have all required validation rules', () => {
      const expectedRules = [
        'circular-dependency',
        'orphaned-nodes',
        'missing-labels',
        'invalid-connections',
        'missing-configuration',
        'duplicate-labels',
        'unreachable-nodes',
        'performance-warnings',
      ];

      const ruleNames = VALIDATION_RULES.map(rule => rule.name);
      
      expectedRules.forEach(expectedRule => {
        expect(ruleNames).toContain(expectedRule);
      });
    });

    it('should have proper rule structure', () => {
      VALIDATION_RULES.forEach(rule => {
        expect(rule).toHaveProperty('name');
        expect(rule).toHaveProperty('description');
        expect(rule).toHaveProperty('severity');
        expect(rule).toHaveProperty('validate');
        
        expect(typeof rule.name).toBe('string');
        expect(typeof rule.description).toBe('string');
        expect(['error', 'warning', 'info']).toContain(rule.severity);
        expect(typeof rule.validate).toBe('function');
      });
    });

    it('should execute all validation rules without errors', () => {
      VALIDATION_RULES.forEach(rule => {
        expect(() => {
          rule.validate(mockNodes, mockEdges);
        }).not.toThrow();
      });
    });
  });

  describe('custom validation rules', () => {
    it('should accept custom validation rules', () => {
      const customRule = {
        name: 'custom-rule',
        description: 'Custom validation rule',
        severity: 'warning' as const,
        validate: () => [{
          rule: 'custom-rule',
          severity: 'warning' as const,
          message: 'Custom validation message',
          autoFixable: false,
        }],
      };

      const customValidator = new PipelineValidator([customRule]);
      const result = customValidator.validatePipeline(mockNodes, mockEdges);
      
      expect(result.issues.some(issue => issue.rule === 'custom-rule')).toBe(true);
    });
  });
});