import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowRight, 
  GitBranch, 
  Shuffle, 
  RotateCw, 
  XCircle, 
  CheckCircle,
  MousePointer2,
  Zap,
  Settings,
  Palette
} from 'lucide-react';
import { CustomEdgeData } from './CustomizableEdge';

interface ConnectionToolbarProps {
  selectedConnectionType: string;
  onConnectionTypeChange: (type: string) => void;
  onShowStylePanel: () => void;
  className?: string;
}

const connectionTypes = [
  {
    id: 'default',
    label: 'Default',
    icon: ArrowRight,
    color: '#6366f1',
    description: 'Standard sequential flow',
    shortcut: '1'
  },
  {
    id: 'conditional',
    label: 'Conditional',
    icon: GitBranch,
    color: '#f59e0b',
    description: 'Conditional branching',
    shortcut: '2'
  },
  {
    id: 'parallel',
    label: 'Parallel',
    icon: Shuffle,
    color: '#10b981',
    description: 'Parallel execution',
    shortcut: '3'
  },
  {
    id: 'loop',
    label: 'Loop',
    icon: RotateCw,
    color: '#8b5cf6',
    description: 'Iterative loop',
    shortcut: '4'
  },
  {
    id: 'error',
    label: 'Error',
    icon: XCircle,
    color: '#ef4444',
    description: 'Error handling',
    shortcut: '5'
  },
  {
    id: 'success',
    label: 'Success',
    icon: CheckCircle,
    color: '#22c55e',
    description: 'Success confirmation',
    shortcut: '6'
  }
];

export const ConnectionToolbar: React.FC<ConnectionToolbarProps> = ({
  selectedConnectionType,
  onConnectionTypeChange,
  onShowStylePanel,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const selectedType = connectionTypes.find(type => type.id === selectedConnectionType);

  return (
    <div className={`flex items-center gap-2 bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl p-2 shadow-lg ${className}`}>
      {/* Connection Mode Indicator */}
      <div className="flex items-center gap-2">
        <MousePointer2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Connection:</span>
      </div>

      <Separator orientation="vertical" className="h-4" />

      {/* Quick Type Selector */}
      {!isExpanded ? (
        <div className="flex items-center gap-2">
          <Button
            variant={selectedConnectionType === selectedType?.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="h-8 px-3 text-sm flex items-center gap-2"
            style={{ 
              color: selectedType?.color,
              borderColor: selectedConnectionType === selectedType?.id ? selectedType?.color : undefined
            }}
          >
            {selectedType && <selectedType.icon className="h-4 w-4" />}
            {selectedType?.label || 'Default'}
          </Button>
          
          <Badge variant="outline" className="text-xs">
            {selectedType?.shortcut}
          </Badge>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          {connectionTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedConnectionType === type.id;
            
            return (
              <Button
                key={type.id}
                variant={isSelected ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  onConnectionTypeChange(type.id);
                  setIsExpanded(false);
                }}
                className="h-8 w-8 p-0"
                title={`${type.label} (${type.shortcut})\n${type.description}`}
                style={{
                  color: isSelected ? 'white' : type.color,
                  backgroundColor: isSelected ? type.color : undefined,
                  borderColor: isSelected ? type.color : undefined
                }}
              >
                <Icon className="h-4 w-4" />
              </Button>
            );
          })}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="h-8 w-8 p-0 ml-2"
            title="Collapse"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
          </Button>
        </div>
      )}

      <Separator orientation="vertical" className="h-4" />

      {/* Style Panel Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onShowStylePanel}
        className="h-8 w-8 p-0"
        title="Connection Styles"
      >
        <Palette className="h-4 w-4" />
      </Button>

      {/* Quick Actions */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        title="Advanced Settings"
      >
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ConnectionToolbar;