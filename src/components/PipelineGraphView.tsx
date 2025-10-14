import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  CheckCircle,
  Circle,
  XCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';

interface PipelineStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  duration?: number;
}

interface PipelineGraphViewProps {
  steps: PipelineStep[];
  onStepClick?: (stepId: string) => void;
  selectedStep?: string;
}

export const PipelineGraphView: React.FC<PipelineGraphViewProps> = ({
  steps,
  onStepClick,
  selectedStep,
}) => {
  const getStepIcon = (status: PipelineStep['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-8 w-8 text-success" />;
      case 'running':
        return <Loader2 className="h-8 w-8 text-primary animate-spin" />;
      case 'failed':
        return <XCircle className="h-8 w-8 text-destructive" />;
      case 'skipped':
        return <Circle className="h-8 w-8 text-muted-foreground" />;
      default:
        return <Circle className="h-8 w-8 text-muted" />;
    }
  };

  const getStepColor = (status: PipelineStep['status']) => {
    switch (status) {
      case 'success':
        return 'border-success/50 bg-success/5';
      case 'running':
        return 'border-primary/50 bg-primary/5 shadow-lg shadow-primary/20 animate-pulse';
      case 'failed':
        return 'border-destructive/50 bg-destructive/5';
      case 'pending':
        return 'border-muted bg-muted/5';
      default:
        return 'border-border bg-card';
    }
  };

  return (
    <Card className="p-8 overflow-x-auto">
      <div className="flex items-center gap-4 min-w-max">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step Node */}
            <div
              onClick={() => onStepClick?.(step.id)}
              className={cn(
                "relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer min-w-[180px]",
                getStepColor(step.status),
                selectedStep === step.id && "ring-2 ring-primary ring-offset-2",
                "hover:scale-105 hover:shadow-xl"
              )}
            >
              {/* Icon */}
              <div className="flex items-center justify-center">
                {getStepIcon(step.status)}
              </div>

              {/* Step Name */}
              <div className="text-center">
                <div className="font-semibold text-sm mb-1">{step.name}</div>
                {step.duration !== undefined && (
                  <div className="text-xs text-muted-foreground">
                    {(step.duration / 1000).toFixed(1)}s
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className={cn(
                "absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-medium border",
                step.status === 'success' && "bg-success/20 text-success border-success/30",
                step.status === 'running' && "bg-primary/20 text-primary border-primary/30 animate-pulse",
                step.status === 'failed' && "bg-destructive/20 text-destructive border-destructive/30",
                step.status === 'pending' && "bg-muted text-muted-foreground border-muted-foreground/30"
              )}>
                {step.status}
              </div>
            </div>

            {/* Arrow Connector */}
            {index < steps.length - 1 && (
              <div className="flex items-center">
                <ArrowRight className={cn(
                  "h-6 w-6 transition-colors",
                  step.status === 'success' ? "text-success" : 
                  step.status === 'running' ? "text-primary animate-pulse" :
                  "text-muted-foreground"
                )} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </Card>
  );
};