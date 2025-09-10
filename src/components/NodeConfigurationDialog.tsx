import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { getComponentDefinition, validatePipeline } from '@/lib/pipeline-utils';
import { PipelineNode } from '@/lib/pipeline-utils';

interface NodeConfigurationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nodeData: any) => void;
  nodeData: any;
  nodeId: string;
}

export const NodeConfigurationDialog: React.FC<NodeConfigurationDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  nodeData,
  nodeId
}) => {
  const [formData, setFormData] = useState({
    label: '',
    command: '',
    configuration: {} as Record<string, any>
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  const componentDef = getComponentDefinition(nodeData?.stepType);

  useEffect(() => {
    if (nodeData) {
      setFormData({
        label: nodeData.label || '',
        command: nodeData.command || '',
        configuration: { ...componentDef?.defaultConfig, ...nodeData.configuration }
      });
    }
  }, [nodeData, componentDef]);

  const validateConfiguration = () => {
    const newErrors: string[] = [];
    const newWarnings: string[] = [];

    // Basic validation
    if (!formData.label.trim()) {
      newErrors.push('Node label is required');
    }

    // Component-specific validation
    if (componentDef) {
      Object.entries(componentDef.defaultConfig).forEach(([key, defaultValue]) => {
        const value = formData.configuration[key];
        
        // Check required fields (non-empty defaults are considered required)
        if (defaultValue !== '' && defaultValue !== null && defaultValue !== undefined) {
          if (!value || (typeof value === 'string' && !value.trim())) {
            if (key === 'repository' || key === 'host' || key === 'database') {
              newErrors.push(`${key} is required for ${componentDef.name}`);
            } else {
              newWarnings.push(`${key} is not configured for ${componentDef.name}`);
            }
          }
        }

        // Type-specific validation
        if (value) {
          if (key.includes('port') && isNaN(Number(value))) {
            newErrors.push(`${key} must be a valid port number`);
          }
          if (key.includes('url') || key.includes('repository')) {
            try {
              new URL(value);
            } catch {
              if (!value.includes('/') && !value.includes('@')) {
                newWarnings.push(`${key} might not be a valid URL or repository path`);
              }
            }
          }
        }
      });
    }

    setErrors(newErrors);
    setWarnings(newWarnings);
    return newErrors.length === 0;
  };

  useEffect(() => {
    validateConfiguration();
  }, [formData]);

  const handleSave = () => {
    if (validateConfiguration()) {
      const updatedData = {
        ...nodeData,
        ...formData,
        validation: {
          isValid: errors.length === 0,
          errors,
          warnings
        }
      };
      onSave(updatedData);
      onClose();
    }
  };

  const handleConfigurationChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        [key]: value
      }
    }));
  };

  const renderConfigField = (key: string, value: any) => {
    const fieldType = typeof value;
    const fieldId = `config-${key}`;

    if (fieldType === 'boolean') {
      return (
        <div key={key} className="flex items-center justify-between space-x-2">
          <Label htmlFor={fieldId} className="text-sm font-medium">
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </Label>
          <Switch
            id={fieldId}
            checked={formData.configuration[key] || false}
            onCheckedChange={(checked) => handleConfigurationChange(key, checked)}
          />
        </div>
      );
    }

    if (key.includes('type') || key.includes('provider') || key.includes('tool')) {
      const options = getSelectOptions(key, componentDef?.type);
      return (
        <div key={key} className="space-y-2">
          <Label htmlFor={fieldId} className="text-sm font-medium">
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </Label>
          <Select
            value={formData.configuration[key] || ''}
            onValueChange={(value) => handleConfigurationChange(key, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${key}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (key.includes('command') || key.includes('script') || key.includes('message')) {
      return (
        <div key={key} className="space-y-2">
          <Label htmlFor={fieldId} className="text-sm font-medium">
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </Label>
          <Textarea
            id={fieldId}
            value={formData.configuration[key] || ''}
            onChange={(e) => handleConfigurationChange(key, e.target.value)}
            placeholder={`Enter ${key}`}
            className="min-h-[80px]"
          />
        </div>
      );
    }

    return (
      <div key={key} className="space-y-2">
        <Label htmlFor={fieldId} className="text-sm font-medium">
          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
        </Label>
        <Input
          id={fieldId}
          type={fieldType === 'number' ? 'number' : 'text'}
          value={formData.configuration[key] || ''}
          onChange={(e) => handleConfigurationChange(key, e.target.value)}
          placeholder={`Enter ${key}`}
        />
      </div>
    );
  };

  const getSelectOptions = (key: string, componentType?: string): string[] => {
    const optionsMap: Record<string, string[]> = {
      type: ['postgresql', 'mysql', 'mongodb', 'redis'],
      provider: ['aws', 'azure', 'gcp', 'digitalocean'],
      tool: ['npm audit', 'snyk', 'sonarqube', 'bandit'],
      operation: ['copy', 'move', 'delete', 'create'],
      shell: ['/bin/bash', '/bin/sh', '/bin/zsh', 'cmd', 'powershell'],
      nodeVersion: ['16', '18', '20', 'latest'],
      pythonVersion: ['3.8', '3.9', '3.10', '3.11', '3.12'],
    };

    return optionsMap[key] || [];
  };

  if (!componentDef) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <componentDef.icon className="h-5 w-5" />
            Configure {componentDef.name}
          </DialogTitle>
          <DialogDescription>
            {componentDef.description}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Basic Configuration */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Basic Configuration</h3>
                <Badge variant="outline">{componentDef.type}</Badge>
              </div>

              <div className="space-y-2">
                <Label htmlFor="node-label" className="text-sm font-medium">
                  Node Label *
                </Label>
                <Input
                  id="node-label"
                  value={formData.label}
                  onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Enter a descriptive label for this node"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="node-command" className="text-sm font-medium">
                  Command (Optional)
                </Label>
                <Textarea
                  id="node-command"
                  value={formData.command}
                  onChange={(e) => setFormData(prev => ({ ...prev, command: e.target.value }))}
                  placeholder="Enter custom command to execute"
                  className="min-h-[80px]"
                />
              </div>
            </div>

            <Separator />

            {/* Component-Specific Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Component Configuration</h3>
              <div className="grid gap-4">
                {Object.entries(componentDef.defaultConfig).map(([key, value]) =>
                  renderConfigField(key, value)
                )}
              </div>
            </div>

            {/* Validation Results */}
            {(errors.length > 0 || warnings.length > 0) && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Validation</h3>
                  
                  {errors.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <span className="font-medium">Errors</span>
                      </div>
                      {errors.map((error, i) => (
                        <div key={i} className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                          {error}
                        </div>
                      ))}
                    </div>
                  )}

                  {warnings.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-yellow-600">
                        <Info className="h-4 w-4" />
                        <span className="font-medium">Warnings</span>
                      </div>
                      {warnings.map((warning, i) => (
                        <div key={i} className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                          {warning}
                        </div>
                      ))}
                    </div>
                  )}

                  {errors.length === 0 && warnings.length === 0 && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Configuration is valid</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={errors.length > 0}
          >
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NodeConfigurationDialog;