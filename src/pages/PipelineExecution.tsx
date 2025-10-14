import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { PipelineGraphView } from '@/components/PipelineGraphView';
import {
  ArrowLeft,
  CheckCircle,
  Circle,
  XCircle,
  Loader2,
  Clock,
  Cpu,
  HardDrive,
  Network,
  Zap,
  Activity,
  Server,
  Database,
  GitBranch,
  Package,
  Rocket,
  Terminal,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  AlertTriangle,
  LayoutList,
  GitMerge,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PipelineStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  startTime?: string;
  endTime?: string;
  duration?: number;
  logs: LogEntry[];
  metrics: StepMetrics;
}

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
}

interface StepMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkIO: number;
  diskIO: number;
  kernelBypass: boolean;
  deploymentRoundtrip: number;
}

const mockSteps: PipelineStep[] = [
  {
    id: '1',
    name: 'Clone Repository',
    status: 'running',
    startTime: new Date().toISOString(),
    duration: 0,
    logs: [
      { timestamp: new Date().toTimeString().split(' ')[0], level: 'info', message: 'Initializing git clone...' },
    ],
    metrics: {
      cpuUsage: 15,
      memoryUsage: 256,
      networkIO: 1024,
      diskIO: 512,
      kernelBypass: true,
      deploymentRoundtrip: 45,
    },
  },
  {
    id: '2',
    name: 'Install Dependencies',
    status: 'pending',
    logs: [],
    metrics: {
      cpuUsage: 0,
      memoryUsage: 0,
      networkIO: 0,
      diskIO: 0,
      kernelBypass: false,
      deploymentRoundtrip: 0,
    },
  },
  {
    id: '3',
    name: 'Run Tests',
    status: 'pending',
    logs: [],
    metrics: {
      cpuUsage: 0,
      memoryUsage: 0,
      networkIO: 0,
      diskIO: 0,
      kernelBypass: false,
      deploymentRoundtrip: 0,
    },
  },
  {
    id: '4',
    name: 'Build Application',
    status: 'pending',
    logs: [],
    metrics: {
      cpuUsage: 0,
      memoryUsage: 0,
      networkIO: 0,
      diskIO: 0,
      kernelBypass: false,
      deploymentRoundtrip: 0,
    },
  },
  {
    id: '5',
    name: 'Deploy to Production',
    status: 'pending',
    logs: [],
    metrics: {
      cpuUsage: 0,
      memoryUsage: 0,
      networkIO: 0,
      diskIO: 0,
      kernelBypass: false,
      deploymentRoundtrip: 0,
    },
  },
];

export const PipelineExecution: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [steps, setSteps] = useState<PipelineStep[]>(mockSteps);
  const [selectedStep, setSelectedStep] = useState<string>('1');
  const [autoScroll, setAutoScroll] = useState(true);
  const [viewMode, setViewMode] = useState<'timeline' | 'graph'>('timeline');
  const logScrollRef = React.useRef<HTMLDivElement>(null);

  // Step durations in seconds (total ~5 minutes)
  const stepDurations = [10, 40, 80, 100, 70]; // Total: 300 seconds (5 minutes)
  const [startTime] = useState(Date.now());

  // Simulate real-time updates and step progression
  useEffect(() => {
    const interval = setInterval(() => {
      setSteps((prev) => {
        const updated = [...prev];
        const elapsed = (Date.now() - startTime) / 1000; // seconds elapsed
        
        let cumulativeTime = 0;
        updated.forEach((step, index) => {
          const stepDuration = stepDurations[index];
          const stepStartTime = cumulativeTime;
          const stepEndTime = cumulativeTime + stepDuration;
          
          if (elapsed < stepStartTime) {
            // Step hasn't started yet
            step.status = 'pending';
          } else if (elapsed >= stepStartTime && elapsed < stepEndTime) {
            // Step is running
            step.status = 'running';
            if (!step.startTime) {
              step.startTime = new Date(startTime + stepStartTime * 1000).toISOString();
            }
            step.duration = (elapsed - stepStartTime) * 1000;
            
            // Add log entries periodically
            if (step.logs.length < (elapsed - stepStartTime) / 2) {
              step.logs.push({
                timestamp: new Date().toTimeString().split(' ')[0],
                level: Math.random() > 0.9 ? 'warning' : Math.random() > 0.95 ? 'success' : 'info',
                message: getRandomLogMessage(step.name),
              });
            }
            
            // Update metrics
            const progress = (elapsed - stepStartTime) / stepDuration;
            step.metrics.cpuUsage = 20 + Math.sin(progress * Math.PI) * 50 + Math.random() * 10;
            step.metrics.memoryUsage = 256 + progress * 512 + Math.random() * 50;
            step.metrics.networkIO = Math.random() * 200;
            step.metrics.diskIO = Math.random() * 100;
            step.metrics.kernelBypass = true;
            step.metrics.deploymentRoundtrip = 10 + Math.random() * 40;
          } else {
            // Step completed
            step.status = 'success';
            if (!step.endTime) {
              step.endTime = new Date(startTime + stepEndTime * 1000).toISOString();
              step.duration = stepDuration * 1000;
              step.logs.push({
                timestamp: new Date().toTimeString().split(' ')[0],
                level: 'success',
                message: `${step.name} completed successfully!`,
              });
            }
          }
          
          cumulativeTime += stepDuration;
        });

        return updated;
      });
    }, 500); // Update every 500ms for smoother progress

    return () => clearInterval(interval);
  }, [startTime]);

  // Auto-scroll logs
  useEffect(() => {
    if (autoScroll && logScrollRef.current) {
      logScrollRef.current.scrollTop = logScrollRef.current.scrollHeight;
    }
  }, [steps, autoScroll]);

  const currentStep = steps.find((s) => s.id === selectedStep);
  const completedSteps = steps.filter((s) => s.status === 'success').length;
  const progress = (completedSteps / steps.length) * 100;

  const getStepIcon = (status: PipelineStep['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'skipped':
        return <Circle className="h-5 w-5 text-muted-foreground" />;
      default:
        return <Circle className="h-5 w-5 text-muted" />;
    }
  };

  const getLogLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'success':
        return 'text-green-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Rocket className="h-6 w-6 text-primary" />
                  Pipeline Execution
                </h1>
                <p className="text-sm text-muted-foreground">Build #42 • main branch</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <PlayCircle className="h-4 w-4 mr-2" />
                In Progress
              </Badge>
              
              {/* View Mode Toggle */}
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === 'timeline' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('timeline')}
                  className="h-8"
                >
                  <LayoutList className="h-4 w-4 mr-2" />
                  Timeline
                </Button>
                <Button
                  variant={viewMode === 'graph' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('graph')}
                  className="h-8"
                >
                  <GitMerge className="h-4 w-4 mr-2" />
                  Graph
                </Button>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {completedSteps} / {steps.length} steps completed
              </span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Graph View */}
        {viewMode === 'graph' && (
          <div className="mb-6">
            <PipelineGraphView 
              steps={steps} 
              selectedStep={selectedStep}
              onStepClick={setSelectedStep}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Steps Timeline */}
          {viewMode === 'timeline' && (
            <div className="lg:col-span-4">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Pipeline Steps</h2>
                <div className="space-y-1">
                  {steps.map((step, index) => (
                    <button
                      key={step.id}
                      onClick={() => setSelectedStep(step.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg transition-all duration-200",
                        "hover:bg-accent/50 flex items-center gap-3",
                        selectedStep === step.id && "bg-accent"
                      )}
                    >
                      <div className="flex-shrink-0">{getStepIcon(step.status)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium truncate">{step.name}</span>
                          {step.duration && (
                            <span className="text-xs text-muted-foreground">
                              {(step.duration / 1000).toFixed(1)}s
                            </span>
                          )}
                        </div>
                        {step.status === 'running' && (
                          <div className="mt-1">
                            <Progress value={45} className="h-1" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Logs and Metrics */}
          <div className={cn("space-y-6", viewMode === 'timeline' ? "lg:col-span-8" : "lg:col-span-12")}>
            {/* Real-time Metrics */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Real-time Metrics</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <MetricCard
                  icon={<Cpu className="h-5 w-5" />}
                  label="CPU Usage"
                  value={`${currentStep?.metrics.cpuUsage.toFixed(1)}%`}
                  trend={currentStep?.metrics.cpuUsage || 0}
                />
                <MetricCard
                  icon={<HardDrive className="h-5 w-5" />}
                  label="Memory"
                  value={`${currentStep?.metrics.memoryUsage.toFixed(0)} MB`}
                  trend={(currentStep?.metrics.memoryUsage || 0) / 10}
                />
                <MetricCard
                  icon={<Network className="h-5 w-5" />}
                  label="Network I/O"
                  value={`${currentStep?.metrics.networkIO.toFixed(0)} KB/s`}
                  trend={(currentStep?.metrics.networkIO || 0) / 20}
                />
                <MetricCard
                  icon={<Database className="h-5 w-5" />}
                  label="Disk I/O"
                  value={`${currentStep?.metrics.diskIO.toFixed(0)} KB/s`}
                  trend={(currentStep?.metrics.diskIO || 0) / 10}
                />
                <MetricCard
                  icon={<Zap className="h-5 w-5" />}
                  label="Kernel Bypass"
                  value={currentStep?.metrics.kernelBypass ? 'Enabled' : 'Disabled'}
                  trend={currentStep?.metrics.kernelBypass ? 100 : 0}
                  isBoolean
                />
                <MetricCard
                  icon={<Activity className="h-5 w-5" />}
                  label="Roundtrip"
                  value={`${currentStep?.metrics.deploymentRoundtrip || 0}ms`}
                  trend={100 - (currentStep?.metrics.deploymentRoundtrip || 0)}
                />
              </div>
            </Card>

            {/* Logs */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Execution Logs
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoScroll(!autoScroll)}
                >
                  {autoScroll ? 'Disable' : 'Enable'} Auto-scroll
                </Button>
              </div>
              
              <ScrollArea className="h-96 rounded-lg bg-muted/50 p-4 font-mono text-sm" ref={logScrollRef}>
                {currentStep?.logs.map((log, index) => (
                  <div key={index} className="mb-1 flex items-start gap-3">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {log.timestamp}
                    </span>
                    <span className={cn("flex-1", getLogLevelColor(log.level))}>
                      {log.message}
                    </span>
                  </div>
                ))}
                {currentStep?.status === 'running' && (
                  <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Processing...</span>
                  </div>
                )}
              </ScrollArea>
            </Card>

            {/* Runner Health */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Server className="h-5 w-5" />
                Runner Health
              </h2>
              <div className="space-y-3">
                <HealthIndicator label="Runner Status" value="Healthy" status="success" />
                <HealthIndicator label="Connection" value="Stable" status="success" />
                <HealthIndicator label="Uptime" value="99.98%" status="success" />
                <HealthIndicator label="Latency" value="12ms" status="success" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: number;
  isBoolean?: boolean;
}> = ({ icon, label, value, trend, isBoolean }) => (
  <div className="p-4 rounded-lg border bg-card hover:shadow-lg transition-shadow">
    <div className="flex items-center gap-2 mb-2">
      <div className="text-primary">{icon}</div>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
    <div className="text-2xl font-bold mb-2">{value}</div>
    {!isBoolean && (
      <Progress value={Math.min(100, trend)} className="h-1" />
    )}
  </div>
);

const HealthIndicator: React.FC<{
  label: string;
  value: string;
  status: 'success' | 'warning' | 'error';
}> = ({ label, value, status }) => (
  <div className="flex items-center justify-between p-3 rounded-lg border">
    <span className="text-sm font-medium">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-sm">{value}</span>
      <div
        className={cn(
          "h-2 w-2 rounded-full",
          status === 'success' && "bg-green-500",
          status === 'warning' && "bg-yellow-500",
          status === 'error' && "bg-red-500"
        )}
      />
    </div>
  </div>
);

function getRandomLogMessage(stepName: string): string {
  const messagesByStep: Record<string, string[]> = {
    'Clone Repository': [
      'Cloning from remote repository...',
      'Fetching branches and tags...',
      'Checking out main branch...',
      'Repository cloned successfully',
    ],
    'Install Dependencies': [
      'Resolving package dependencies...',
      'Downloading packages from registry...',
      'Installing node modules...',
      'Building native extensions...',
      'Cleaning up cache...',
    ],
    'Run Tests': [
      'Starting test suite...',
      'Running unit tests...',
      '✓ Authentication tests passed',
      '✓ API integration tests passed',
      '✓ Component rendering tests passed',
      'Running e2e tests...',
      'All tests completed',
    ],
    'Build Application': [
      'Compiling TypeScript...',
      'Bundling assets...',
      'Optimizing images...',
      'Generating production build...',
      'Minifying JavaScript...',
      'Creating source maps...',
    ],
    'Deploy to Production': [
      'Uploading build artifacts...',
      'Configuring CDN...',
      'Updating DNS records...',
      'Running health checks...',
      'Deployment successful!',
    ],
  };
  
  const messages = messagesByStep[stepName] || ['Processing...'];
  return messages[Math.floor(Math.random() * messages.length)];
}

export default PipelineExecution;
