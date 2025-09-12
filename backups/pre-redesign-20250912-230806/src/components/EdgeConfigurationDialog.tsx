import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowRight, 
  GitBranch, 
  Shuffle, 
  RotateCw, 
  XCircle, 
  CheckCircle,
  Palette,
  Settings,
  Zap
} from 'lucide-react';
import { CustomEdgeData } from './CustomizableEdge';

interface EdgeConfigurationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (edgeData: CustomEdgeData) => void;
  edgeData: CustomEdgeData | null;
  edgeId: string;
}

const edgeTypes = [
  { value: 'default', label: 'Default', icon: ArrowRight, color: '#6366f1', description: 'Standard sequential flow' },
  { value: 'conditional', label: 'Conditional', icon: GitBranch, color: '#f59e0b', description: 'Conditional branching based on criteria' },
  { value: 'parallel', label: 'Parallel', icon: Shuffle, color: '#10b981', description: 'Parallel execution paths' },
  { value: 'loop', label: 'Loop', icon: RotateCw, color: '#8b5cf6', description: 'Iterative loop execution' },
  { value: 'error', label: 'Error Handler', icon: XCircle, color: '#ef4444', description: 'Error handling flow' },
  { value: 'success', label: 'Success', icon: CheckCircle, color: '#22c55e', description: 'Success confirmation flow' },
];

const arrowStyles = [
  { value: 'simple', label: 'Simple Arrow', preview: '→' },
  { value: 'filled', label: 'Filled Arrow', preview: '➤' },
  { value: 'diamond', label: 'Diamond', preview: '◆' },
  { value: 'circle', label: 'Circle', preview: '●' },
  { value: 'square', label: 'Square', preview: '■' },
];

const connectionPaths = [
  { value: 'curved', label: 'Curved (Bezier)', description: 'Smooth curved connection' },
  { value: 'straight', label: 'Straight Line', description: 'Direct straight connection' },
  { value: 'orthogonal', label: 'Orthogonal', description: 'Right-angled connection' },
  { value: 'step', label: 'Step', description: 'Stepped connection with horizontal segment' },
];

const predefinedColors = [
  '#6366f1', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#22c55e',
  '#3b82f6', '#f97316', '#14b8a6', '#a855f7', '#f43f5e', '#84cc16',
  '#6b7280', '#1f2937', '#374151', '#4b5563', '#9ca3af', '#d1d5db'
];

export const EdgeConfigurationDialog: React.FC<EdgeConfigurationDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  edgeData,
  edgeId
}) => {
  const [formData, setFormData] = useState<CustomEdgeData>({
    edgeType: 'default',
    label: '',
    condition: '',
    probability: 1,
    animated: false,
    arrowStyle: 'filled',
    connectionPath: 'curved',
    style: {
      stroke: '#6366f1',
      strokeWidth: 2,
      strokeDasharray: undefined,
    }
  });

  // Initialize form data when dialog opens
  useEffect(() => {
    if (isOpen && edgeData) {
      setFormData({
        edgeType: edgeData.edgeType || 'default',
        label: edgeData.label || '',
        condition: edgeData.condition || '',
        probability: edgeData.probability || 1,
        animated: edgeData.animated || false,
        arrowStyle: edgeData.arrowStyle || 'filled',
        connectionPath: edgeData.connectionPath || 'curved',
        style: {
          stroke: edgeData.style?.stroke || '#6366f1',
          strokeWidth: edgeData.style?.strokeWidth || 2,
          strokeDasharray: edgeData.style?.strokeDasharray || undefined,
        }
      });
    }
  }, [isOpen, edgeData]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const updateFormData = (updates: Partial<CustomEdgeData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const updateStyle = (styleUpdates: Partial<NonNullable<CustomEdgeData['style']>>) => {
    setFormData(prev => ({
      ...prev,
      style: { ...prev.style, ...styleUpdates }
    }));
  };

  const selectedEdgeType = edgeTypes.find(type => type.value === formData.edgeType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configure Connection
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Edge Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Connection Type</Label>
            <div className="grid grid-cols-2 gap-3">
              {edgeTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.edgeType === type.value;
                
                return (
                  <button
                    key={type.value}
                    onClick={() => {
                      updateFormData({ edgeType: type.value as any });
                      updateStyle({ stroke: type.color });
                    }}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      isSelected 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50 hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4" style={{ color: type.color }} />
                      <span className="font-medium text-sm">{type.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Basic Properties */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Basic Properties</Label>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="label" className="text-xs">Label</Label>
                <Input
                  id="label"
                  placeholder="Optional label"
                  value={formData.label}
                  onChange={(e) => updateFormData({ label: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-2">
                  Animated
                  <Switch
                    checked={formData.animated}
                    onCheckedChange={(checked) => updateFormData({ animated: checked })}
                  />
                </Label>
              </div>
            </div>

            {/* Conditional Properties */}
            {formData.edgeType === 'conditional' && (
              <div className="space-y-2">
                <Label htmlFor="condition" className="text-xs">Condition Expression</Label>
                <Input
                  id="condition"
                  placeholder="e.g., status === 'success'"
                  value={formData.condition}
                  onChange={(e) => updateFormData({ condition: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Define the condition that must be met for this path to execute
                </p>
              </div>
            )}

            {/* Probability for conditional edges */}
            {formData.edgeType === 'conditional' && (
              <div className="space-y-2">
                <Label className="text-xs">
                  Probability: {Math.round((formData.probability || 1) * 100)}%
                </Label>
                <Slider
                  value={[formData.probability || 1]}
                  onValueChange={(value) => updateFormData({ probability: value[0] })}
                  min={0}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Visual Style */}
          <div className="space-y-4">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Visual Style
            </Label>

            {/* Arrow Style */}
            <div className="space-y-2">
              <Label className="text-xs">Arrow Style</Label>
              <Select
                value={formData.arrowStyle}
                onValueChange={(value) => updateFormData({ arrowStyle: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {arrowStyles.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg">{style.preview}</span>
                        <span>{style.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Connection Path */}
            <div className="space-y-2">
              <Label className="text-xs">Connection Path</Label>
              <Select
                value={formData.connectionPath}
                onValueChange={(value) => updateFormData({ connectionPath: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {connectionPaths.map((path) => (
                    <SelectItem key={path.value} value={path.value}>
                      <div>
                        <div className="font-medium">{path.label}</div>
                        <div className="text-xs text-muted-foreground">{path.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color Selection */}
            <div className="space-y-2">
              <Label className="text-xs">Color</Label>
              <div className="flex flex-wrap gap-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateStyle({ stroke: color })}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.style?.stroke === color 
                        ? 'border-foreground scale-110' 
                        : 'border-border hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <Input
                type="color"
                value={formData.style?.stroke || '#6366f1'}
                onChange={(e) => updateStyle({ stroke: e.target.value })}
                className="w-20 h-8 p-1 border rounded"
              />
            </div>

            {/* Stroke Width */}
            <div className="space-y-2">
              <Label className="text-xs">
                Thickness: {formData.style?.strokeWidth || 2}px
              </Label>
              <Slider
                value={[formData.style?.strokeWidth || 2]}
                onValueChange={(value) => updateStyle({ strokeWidth: value[0] })}
                min={1}
                max={8}
                step={1}
                className="w-full"
              />
            </div>

            {/* Dash Pattern */}
            <div className="space-y-2">
              <Label className="text-xs">Dash Pattern</Label>
              <Select
                value={formData.style?.strokeDasharray || 'none'}
                onValueChange={(value) => updateStyle({ 
                  strokeDasharray: value === 'none' ? undefined : value 
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Solid Line</SelectItem>
                  <SelectItem value="5,5">Dashed (5,5)</SelectItem>
                  <SelectItem value="10,5">Dashed (10,5)</SelectItem>
                  <SelectItem value="3,3">Dotted (3,3)</SelectItem>
                  <SelectItem value="10,5,5,5">Dash-Dot</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Preview</Label>
            <div className="p-4 border rounded-lg bg-muted/20">
              <svg width="200" height="60" className="mx-auto">
                <defs>
                  <marker
                    id="preview-arrow"
                    markerWidth="10"
                    markerHeight="10"
                    refX="5"
                    refY="3"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <path
                      d="M0,0 L0,6 L9,3 z"
                      fill={formData.style?.stroke || '#6366f1'}
                    />
                  </marker>
                </defs>
                <path
                  d="M20,30 Q100,10 180,30"
                  fill="none"
                  stroke={formData.style?.stroke || '#6366f1'}
                  strokeWidth={formData.style?.strokeWidth || 2}
                  strokeDasharray={formData.style?.strokeDasharray}
                  markerEnd="url(#preview-arrow)"
                />
                {formData.animated && (
                  <circle
                    r="3"
                    fill={formData.style?.stroke || '#6366f1'}
                    opacity="0.8"
                  >
                    <animateMotion
                      dur="2s"
                      repeatCount="indefinite"
                      path="M20,30 Q100,10 180,30"
                    />
                  </circle>
                )}
              </svg>
              <div className="text-center mt-2">
                <Badge variant="secondary" className="text-xs">
                  {selectedEdgeType?.label} Connection
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EdgeConfigurationDialog;