import { useState } from "react";
import { Plus, Trash2, Move, Play, Settings } from "lucide-react";
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
  step_type: "shell" | "repository";
  config: {
    command?: string;
    repository_url?: string;
    branch?: string;
    deployment_type?: string;
  };
}

interface Stage {
  id: string;
  name: string;
  steps: Step[];
}

interface Pipeline {
  name: string;
  description: string;
  stages: Stage[];
  environment: Record<string, string>;
  timeout: number;
  retry_count: number;
}

interface PipelineBuilderProps {
  onSave: (yaml: string) => void;
}

export function PipelineBuilder({ onSave }: PipelineBuilderProps) {
  const [pipeline, setPipeline] = useState<Pipeline>({
    name: "",
    description: "",
    stages: [],
    environment: {},
    timeout: 3600,
    retry_count: 0,
  });

  const [envKey, setEnvKey] = useState("");
  const [envValue, setEnvValue] = useState("");

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
  - trigger_type: manual
    config: {}

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

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
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
  );
}