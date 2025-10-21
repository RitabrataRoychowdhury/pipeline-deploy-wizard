import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PipelineCard from "@/components/PipelineCard";
import StatsCard from "@/components/StatsCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { BuildTriggerLoader } from "@/components/BuildTriggerLoader";
import { Activity, GitBranch, CheckCircle, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/usePageTitle";
import { AnalyticsChart } from "@/components/AnalyticsChart";
import dashboardBg from "@/assets/dashboard-bg.png";

interface Pipeline {
  name: string;
  description: string;
  status: "success" | "running" | "failed" | "idle";
  lastRun?: string;
  repository: string;
  branch: string;
}

const DashboardClean = () => {
  const navigate = useNavigate();
  usePageTitle();
  
  const [pipelines] = useState<Pipeline[]>([
    {
      name: "Production Deploy",
      description: "Main production deployment pipeline", 
      status: "success",
      lastRun: "2 minutes ago",
      repository: "RustCI/production",
      branch: "main"
    },
    {
      name: "Frontend Build",
      description: "React TypeScript frontend build",
      status: "running",
      lastRun: "5 minutes ago",
      repository: "RustCI/frontend", 
      branch: "develop"
    },
    {
      name: "API Tests",
      description: "Backend API integration tests",
      status: "success",
      lastRun: "12 minutes ago",
      repository: "RustCI/backend",
      branch: "feature/api-v2"
    }
  ]);

  const { toast } = useToast();
  const [showBuildLoader, setShowBuildLoader] = useState(false);
  const [triggeringPipeline, setTriggeringPipeline] = useState<string | null>(null);
  
  const handleTriggerPipeline = async (pipelineName: string) => {
    setTriggeringPipeline(pipelineName);
    setShowBuildLoader(true);
  };

  const handleConfigurePipeline = (pipelineName: string) => {
    navigate("/pipelines/builder");
    toast({
      title: "Configure Pipeline",
      description: `Opening configuration for ${pipelineName}`,
    });
  };

  const handleBuildLoaderComplete = () => {
    setTimeout(() => {
      setShowBuildLoader(false);
      navigate(`/pipelines/42/execution`);
      
      toast({
        title: "Pipeline Started",
        description: `${triggeringPipeline} is now running`,
      });
      
      setTriggeringPipeline(null);
    }, 300);
  };

  const stats = {
    totalPipelines: pipelines.length,
    successfulBuilds: pipelines.filter(p => p.status === "success").length,
    runningBuilds: pipelines.filter(p => p.status === "running").length,
    uptime: "99.97%",
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BuildTriggerLoader isVisible={showBuildLoader} onComplete={handleBuildLoaderComplete} />
      
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: `url(${dashboardBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-background/98 via-background/95 to-background/98" />
      
      <Navbar />
      
      {/* Breadcrumb */}
      <div className="container mx-auto px-6 pt-6 relative">
        <Breadcrumb />
      </div>
      
      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 space-y-8 relative">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">Monitor and manage your pipelines</p>
          </div>
          <Button
            onClick={() => navigate("/pipelines/builder")}
            size="lg"
            className="shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Pipeline
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Pipelines"
            value={stats.totalPipelines}
            description="Active pipelines"
            icon={GitBranch}
            color="primary"
          />
          <StatsCard
            title="Successful"
            value={stats.successfulBuilds}
            description="Recent builds"
            icon={CheckCircle}
            color="success"
            trend="up"
          />
          <StatsCard
            title="Running"
            value={stats.runningBuilds}
            description="Currently active"
            icon={Clock}
            color="warning"
          />
          <StatsCard
            title="Uptime"
            value={stats.uptime}
            description="Last 30 days"
            icon={Activity}
            color="info"
            trend="up"
          />
        </div>

        {/* Analytics Charts */}
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              System Analytics
            </h2>
            <p className="text-muted-foreground">Real-time performance metrics and insights</p>
          </div>
          <AnalyticsChart />
        </div>

        {/* Build Performance Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Build Time Trends */}
          <div className="bg-gradient-card border border-border/50 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Build Time Trends</h3>
                <p className="text-sm text-muted-foreground">Average build duration over time</p>
              </div>
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div className="h-64 flex items-end justify-between gap-2 pt-4">
              {[65, 72, 58, 80, 45, 52, 48, 55, 42, 38, 35, 40].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-primary to-primary/40 rounded-t-lg transition-all hover:from-primary hover:to-primary/60"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Success Rate */}
          <div className="bg-gradient-card border border-border/50 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Success Rate</h3>
                <p className="text-sm text-muted-foreground">Build success percentage</p>
              </div>
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div className="h-64 flex items-end justify-between gap-2 pt-4">
              {[95, 92, 98, 94, 97, 99, 96, 98, 99, 97, 98, 99].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-success to-success/40 rounded-t-lg transition-all hover:from-success hover:to-success/60"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deployment Frequency */}
          <div className="bg-gradient-card border border-border/50 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Deployment Frequency</h3>
                <p className="text-sm text-muted-foreground">Daily deployments</p>
              </div>
              <Clock className="h-5 w-5 text-info" />
            </div>
            <div className="h-64 flex items-end justify-between gap-2 pt-4">
              {[8, 12, 15, 11, 18, 14, 16, 20, 17, 22, 19, 24].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-info to-info/40 rounded-t-lg transition-all hover:from-info hover:to-info/60"
                    style={{ height: `${(height / 24) * 100}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* System Uptime */}
          <div className="bg-gradient-card border border-border/50 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">System Uptime</h3>
                <p className="text-sm text-muted-foreground">Service availability</p>
              </div>
              <Activity className="h-5 w-5 text-warning" />
            </div>
            <div className="h-64 flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg className="transform -rotate-90 w-48 h-48">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-muted/20"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 88}
                    strokeDashoffset={2 * Math.PI * 88 * (1 - 0.9997)}
                    className="text-warning"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-4xl font-bold text-warning">99.97%</span>
                  <span className="text-sm text-muted-foreground">Uptime</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-card border border-border/50 rounded-xl p-8 text-center space-y-6">
          <div>
            <h3 className="text-2xl font-semibold mb-2">Manage Your Pipelines</h3>
            <p className="text-muted-foreground">View all pipelines or create a new one to get started</p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={() => navigate("/pipelines")}
              size="lg"
              variant="outline"
              className="shadow-md"
            >
              <GitBranch className="h-5 w-5 mr-2" />
              View All Pipelines
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardClean;
