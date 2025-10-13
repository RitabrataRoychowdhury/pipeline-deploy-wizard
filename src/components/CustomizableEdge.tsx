import React, { useState, useCallback } from 'react';
import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
  MarkerType,
  Position,
} from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  X, 
  ArrowRight, 
  ArrowDown, 
  ArrowUp, 
  ArrowLeft,
  GitBranch,
  Zap,
  RotateCw,
  Pause,
  Play,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Shuffle
} from 'lucide-react';

export interface CustomEdgeData extends Record<string, unknown> {
  label?: string;
  edgeType: 'default' | 'conditional' | 'parallel' | 'loop' | 'error' | 'success';
  condition?: string;
  probability?: number;
  animated?: boolean;
  style?: {
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
    markerEnd?: string;
    markerStart?: string;
  };
  arrowStyle?: 'simple' | 'filled' | 'diamond' | 'circle' | 'square';
  connectionPath?: 'straight' | 'curved' | 'orthogonal' | 'step';
}

interface CustomizableEdgeProps extends EdgeProps {
  data?: CustomEdgeData;
}

// Edge type configurations
const edgeTypeConfigs = {
  default: {
    color: '#6366f1',
    icon: ArrowRight,
    label: 'Default',
    strokeWidth: 2,
    animated: false,
    strokeDasharray: undefined,
  },
  conditional: {
    color: '#f59e0b',
    icon: GitBranch,
    label: 'Conditional',
    strokeWidth: 2,
    animated: true,
    strokeDasharray: '5,5',
  },
  parallel: {
    color: '#10b981',
    icon: Shuffle,
    label: 'Parallel',
    strokeWidth: 3,
    animated: true,
    strokeDasharray: undefined,
  },
  loop: {
    color: '#8b5cf6',
    icon: RotateCw,
    label: 'Loop',
    strokeWidth: 2,
    animated: true,
    strokeDasharray: '10,5',
  },
  error: {
    color: '#ef4444',
    icon: XCircle,
    label: 'Error Handler',
    strokeWidth: 2,
    animated: false,
    strokeDasharray: '3,3',
  },
  success: {
    color: '#22c55e',
    icon: CheckCircle,
    label: 'Success',
    strokeWidth: 2,
    animated: false,
    strokeDasharray: undefined,
  },
};

// Arrow marker configurations
const arrowMarkers = {
  simple: {
    id: 'arrow-simple',
    markerWidth: 10,
    markerHeight: 10,
    refX: 5,
    refY: 3,
    orient: 'auto',
    path: 'M0,0 L0,6 L9,3 z',
  },
  filled: {
    id: 'arrow-filled',
    markerWidth: 12,
    markerHeight: 12,
    refX: 6,
    refY: 3,
    orient: 'auto',
    path: 'M0,0 L0,6 L9,3 z',
  },
  diamond: {
    id: 'arrow-diamond',
    markerWidth: 12,
    markerHeight: 12,
    refX: 6,
    refY: 3,
    orient: 'auto',
    path: 'M0,3 L3,0 L6,3 L3,6 z',
  },
  circle: {
    id: 'arrow-circle',
    markerWidth: 10,
    markerHeight: 10,
    refX: 5,
    refY: 5,
    orient: 'auto',
    path: 'M5,5 m-3,0 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0',
  },
  square: {
    id: 'arrow-square',
    markerWidth: 10,
    markerHeight: 10,
    refX: 5,
    refY: 3,
    orient: 'auto',
    path: 'M1,1 L1,5 L5,5 L5,1 z',
  },
};

export const CustomizableEdge: React.FC<CustomizableEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data = {},
  selected,
  markerEnd,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const edgeType = data.edgeType || 'default';
  const config = edgeTypeConfigs[edgeType];
  const arrowStyle = data.arrowStyle || 'filled';
  const connectionPath = data.connectionPath || 'curved';

  // Calculate path based on connection type
  const getEdgePath = useCallback(() => {
    switch (connectionPath) {
      case 'straight':
        return `M${sourceX},${sourceY} L${targetX},${targetY}`;
      
      case 'orthogonal':
        const midX = sourceX + (targetX - sourceX) / 2;
        return `M${sourceX},${sourceY} L${midX},${sourceY} L${midX},${targetY} L${targetX},${targetY}`;
      
      case 'step':
        const stepX = sourceX + (targetX - sourceX) * 0.7;
        return `M${sourceX},${sourceY} L${stepX},${sourceY} L${stepX},${targetY} L${targetX},${targetY}`;
      
      case 'curved':
      default:
        const [path] = getBezierPath({
          sourceX,
          sourceY,
          sourcePosition,
          targetX,
          targetY,
          targetPosition,
        });
        return path;
    }
  }, [sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, connectionPath]);

  // Get label position
  const getLabelPosition = useCallback(() => {
    const midX = sourceX + (targetX - sourceX) / 2;
    const midY = sourceY + (targetY - sourceY) / 2;
    return { x: midX, y: midY };
  }, [sourceX, sourceY, targetX, targetY]);

  const edgePath = getEdgePath();
  const labelPosition = getLabelPosition();
  const EdgeIcon = config.icon;

  // Handle edge configuration
  const handleConfigClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setShowConfig(true);
    
    // Emit custom event for edge configuration
    window.dispatchEvent(new CustomEvent('edge-configure', {
      detail: { edgeId: id, data }
    }));
  }, [id, data]);

  // Handle edge deletion
  const handleDeleteClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Emit custom event for edge deletion
    window.dispatchEvent(new CustomEvent('edge-delete', {
      detail: { edgeId: id }
    }));
  }, [id]);

  // Get marker ID for the arrow style
  const getMarkerId = useCallback((style: string, color: string) => {
    return `${arrowMarkers[style as keyof typeof arrowMarkers].id}-${color.replace('#', '')}`;
  }, []);

  const markerId = getMarkerId(arrowStyle, config.color);

  return (
    <>
      {/* Define custom markers */}
      <defs>
        <marker
          id={markerId}
          markerWidth={arrowMarkers[arrowStyle as keyof typeof arrowMarkers].markerWidth}
          markerHeight={arrowMarkers[arrowStyle as keyof typeof arrowMarkers].markerHeight}
          refX={arrowMarkers[arrowStyle as keyof typeof arrowMarkers].refX}
          refY={arrowMarkers[arrowStyle as keyof typeof arrowMarkers].refY}
          orient={arrowMarkers[arrowStyle as keyof typeof arrowMarkers].orient}
          markerUnits="strokeWidth"
        >
          <path
            d={arrowMarkers[arrowStyle as keyof typeof arrowMarkers].path}
            fill={config.color}
            stroke={config.color}
            strokeWidth={1}
          />
        </marker>
      </defs>

      {/* Main edge path */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: data.style?.stroke || config.color,
          strokeWidth: data.style?.strokeWidth || config.strokeWidth,
          strokeDasharray: data.style?.strokeDasharray || config.strokeDasharray,
          opacity: selected ? 1 : isHovered ? 0.8 : 0.7,
          ...data.style,
        }}
        markerEnd={`url(#${markerId})`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Invisible wider path for easier interaction */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ cursor: 'pointer' }}
      />

      {/* Edge label and controls */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelPosition.x}px, ${labelPosition.y}px)`,
            pointerEvents: 'all',
          }}
          className={`transition-all duration-200 ${
            isHovered || selected ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
        >
          <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg p-2 shadow-lg">
            {/* Edge type indicator */}
            <Badge 
              variant="secondary" 
              className="text-xs flex items-center gap-1"
              style={{ color: config.color }}
            >
              <EdgeIcon className="h-3 w-3" />
              {config.label}
            </Badge>

            {/* Condition or label */}
            {(data.condition || data.label) && (
              <span className="text-xs text-muted-foreground max-w-24 truncate">
                {data.condition || data.label}
              </span>
            )}

            {/* Probability indicator */}
            {data.probability !== undefined && (
              <Badge variant="outline" className="text-xs">
                {Math.round(data.probability * 100)}%
              </Badge>
            )}

            {/* Control buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleConfigClick}
                title="Configure Edge"
              >
                <Settings className="h-3 w-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                onClick={handleDeleteClick}
                title="Delete Edge"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </EdgeLabelRenderer>

      {/* Animation indicators */}
      {(config.animated || data.animated) && (
        <g>
          <circle
            r="3"
            fill={config.color}
            opacity="0.8"
          >
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path={edgePath}
            />
          </circle>
        </g>
      )}

      {/* Conditional flow indicators */}
      {edgeType === 'conditional' && data.condition && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${sourceX + 30}px, ${sourceY - 20}px)`,
              pointerEvents: 'none',
            }}
          >
            <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded px-2 py-1">
              <span className="text-xs text-yellow-800 dark:text-yellow-200 font-mono">
                {data.condition}
              </span>
            </div>
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Loop indicators */}
      {edgeType === 'loop' && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelPosition.x}px, ${labelPosition.y - 30}px)`,
              pointerEvents: 'none',
            }}
          >
            <div className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/20 border border-purple-300 dark:border-purple-700 rounded px-2 py-1">
              <RotateCw className="h-3 w-3 text-purple-600 dark:text-purple-400" />
              <span className="text-xs text-purple-800 dark:text-purple-200">Loop</span>
            </div>
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Parallel execution indicators */}
      {edgeType === 'parallel' && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelPosition.x}px, ${labelPosition.y - 30}px)`,
              pointerEvents: 'none',
            }}
          >
            <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded px-2 py-1">
              <Shuffle className="h-3 w-3 text-green-600 dark:text-green-400" />
              <span className="text-xs text-green-800 dark:text-green-200">Parallel</span>
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default CustomizableEdge;