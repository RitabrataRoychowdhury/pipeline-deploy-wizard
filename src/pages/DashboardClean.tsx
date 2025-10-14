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

        {/* Pipelines */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Active Pipelines</h2>
            <Button variant="outline" onClick={() => navigate("/pipelines")}>
              View All
            </Button>
          </div>
          
          <div className="grid gap-6">
            {pipelines.map((pipeline, index) => (
              <PipelineCard
                key={index}
                name={pipeline.name}
                description={pipeline.description}
                status={pipeline.status}
                lastRun={pipeline.lastRun}
                repository={pipeline.repository}
                branch={pipeline.branch}
                onTrigger={() => handleTriggerPipeline(pipeline.name)}
                onConfigure={() => handleConfigurePipeline(pipeline.name)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardClean;
