import React, { useState, useCallback } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { X, Settings, Copy, Play, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getComponentDefinition, getComponentColor } from '@/lib/pipeline-utils';
import { PipelineNode as PipelineNodeType } from '@/lib/pipeline-utils';

interface PipelineNodeData {
  label: string;
  stepType: string;
  command?: string;
  configuration?: Record<string, any>;
  validation?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

export interface PipelineNodeProps extends NodeProps<PipelineNodeData> {
  data: PipelineNodeData;
}

export const PipelineNode: React.FC<PipelineNodeProps> = ({ 
  data, 
  selected, 
  id,
  dragging 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const componentDef = getComponentDefinition(data.stepType);
  const colors = getComponentColor(data.stepType);
  const Icon = componentDef?.icon;

  const hasErrors = data.validation?.errors && data.validation.errors.length > 0;
  const hasWarnings = data.validation?.warnings && data.validation.warnings.length > 0;
  const isValid = data.validation?.isValid !== false;

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    setShowActions(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    // Delay hiding actions to allow interaction
    setTimeout(() => setShowActions(false), 200);
  }, []);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // This will be handled by the parent component through ReactFlow events
    const deleteEvent = new CustomEvent('pipeline-node-delete', { 
      detail: { nodeId: id } 
    });
    window.dispatchEvent(deleteEvent);
  }, [id]);

  const handleConfigure = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const configureEvent = new CustomEvent('pipeline-node-configure', { 
      detail: { nodeId: id, data } 
    });
    window.dispatchEvent(configureEvent);
  }, [id, data]);

  const handleDuplicate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const duplicateEvent = new CustomEvent('pipeline-node-duplicate', { 
      detail: { nodeId: id, data } 
    });
    window.dispatchEvent(duplicateEvent);
  }, [id, data]);

  return (
    <TooltipProvider>
      <div
        className={`
          group relative min-w-[200px] max-w-[280px] rounded-xl border-2 shadow-lg
          transition-all duration-200 ease-out cursor-move
          ${colors.bg} ${colors.border}
          ${selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105' : ''}
          ${isHovered ? 'scale-[1.02] shadow-xl' : ''}
          ${dragging ? 'opacity-50 scale-95' : ''}
          ${hasErrors ? 'border-destructive' : hasWarnings ? 'border-yellow-500' : ''}
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Input Handle */}
        <Handle
          type="target"
          position={Position.Left}
          className={`
            w-3 h-3 !bg-primary border-2 border-background shadow-md
            transition-all duration-200 hover:scale-150
            ${isHovered ? 'scale-125' : ''}
          `}
        />

        {/* Floating Action Buttons */}
        <div className={`
          absolute -top-2 -right-2 z-10 flex gap-1
          transition-all duration-200 ease-out
          ${showActions && (isHovered || selected) ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}
        `}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="h-6 w-6 p-0 rounded-full shadow-lg"
                onClick={handleConfigure}
              >
                <Settings className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Configure node</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="h-6 w-6 p-0 rounded-full shadow-lg"
                onClick={handleDuplicate}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Duplicate node</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="h-6 w-6 p-0 rounded-full shadow-lg"
                onClick={handleDelete}
              >
                <X className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete node</TooltipContent>
          </Tooltip>
        </div>

        {/* Validation Status Indicator */}
        {data.validation && (
          <div className="absolute -top-1 -left-1 z-10">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`
                  w-4 h-4 rounded-full border-2 border-background shadow-sm
                  flex items-center justify-center
                  ${hasErrors ? 'bg-destructive' : hasWarnings ? 'bg-yellow-500' : 'bg-green-500'}
                `}>
                  {hasErrors ? (
                    <AlertCircle className="h-2.5 w-2.5 text-white" />
                  ) : (
                    <CheckCircle className="h-2.5 w-2.5 text-white" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  {hasErrors && (
                    <div>
                      <div className="font-medium text-destructive">Errors:</div>
                      {data.validation.errors.map((error, i) => (
                        <div key={i} className="text-xs">{error}</div>
                      ))}
                    </div>
                  )}
                  {hasWarnings && (
                    <div>
                      <div className="font-medium text-yellow-600">Warnings:</div>
                      {data.validation.warnings.map((warning, i) => (
                        <div key={i} className="text-xs">{warning}</div>
                      ))}
                    </div>
                  )}
                  {isValid && !hasWarnings && (
                    <div className="text-xs text-green-600">Node is valid</div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 p-4 pb-3">
          <div className={`
            p-2.5 ${colors.iconBg} rounded-xl shadow-md
            transition-transform duration-200
            ${isHovered ? 'scale-110' : ''}
          `}>
            {Icon && <Icon className="h-4 w-4 text-white" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-foreground truncate mb-0.5">
              {data.label}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                {componentDef?.name || data.stepType}
              </Badge>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4 space-y-2">
          {data.command && (
            <div className="p-2.5 bg-muted/50 rounded-lg border border-border/30 backdrop-blur-sm">
              <div className="text-xs font-mono text-muted-foreground">
                <div className="truncate" title={data.command}>
                  {data.command.length > 40 ? `${data.command.substring(0, 40)}...` : data.command}
                </div>
              </div>
            </div>
          )}

          {/* Configuration Summary */}
          {data.configuration && Object.keys(data.configuration).length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Configuration:</div>
              <div className="space-y-0.5">
                {Object.entries(data.configuration).slice(0, 2).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-muted-foreground truncate">{key}:</span>
                    <span className="font-mono text-foreground ml-2 truncate">
                      {String(value).length > 15 ? `${String(value).substring(0, 15)}...` : String(value)}
                    </span>
                  </div>
                ))}
                {Object.keys(data.configuration).length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{Object.keys(data.configuration).length - 2} more...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Output Handle */}
        <Handle
          type="source"
          position={Position.Right}
          className={`
            w-3 h-3 !bg-primary border-2 border-background shadow-md
            transition-all duration-200 hover:scale-150
            ${isHovered ? 'scale-125' : ''}
          `}
        />

        {/* Connection Status Indicator */}
        <div className={`
          absolute top-3 right-3 transition-all duration-200
          ${isHovered ? 'opacity-100 scale-100' : 'opacity-60 scale-75'}
        `}>
          <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-sm animate-pulse" />
        </div>

        {/* Drag Indicator */}
        <div className={`
          absolute bottom-2 right-2 transition-all duration-200
          ${dragging ? 'opacity-100' : 'opacity-0'}
        `}>
          <div className="flex gap-0.5">
            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PipelineNode;