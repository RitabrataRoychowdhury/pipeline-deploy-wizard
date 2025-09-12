import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DemoNavbar from "@/components/DemoNavbar";
import PipelineCard from "@/components/PipelineCard";
import StatsCard from "@/components/StatsCard";
import RecentBuilds from "@/components/RecentBuilds";
import { Activity, GitBranch, CheckCircle, Clock, Plus, TrendingUp, Server, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import pipelinesData from "@/data/demo/pipelines.json";

interface Pipeline {
  name: string;
  description: string;
  status: "success" | "running" | "failed" | "idle";
  lastRun?: string;
  repository: string;
  branch: string;
}

const DemoDashboard = () => {
  const navigate = useNavigate();
  const [pipelines, setPipelines] = useState<Pipeline[]>(pipelinesData as any);

  const handleTriggerPipeline = (pipelineName: string) => {
    setPipelines(prev => prev.map(p => p.name === pipelineName ? { ...p, status: "running" } : p));
    setTimeout(() => {
      const success = Math.random() > 0.2;
      setPipelines(prev => prev.map(p => p.name === pipelineName ? { ...p, status: success ? "success" : "failed", lastRun: "just now" } : p));
    }, 1500);
  };

  const stats = {
    totalPipelines: pipelines.length,
    successfulBuilds: pipelines.filter(p => p.status === "success").length,
    runningBuilds: pipelines.filter(p => p.status === "running").length,
    uptime: "99.9%",
    avgBuildTime: "4.2m",
    deploymentsToday: 12,
    testsExecuted: 1247
  };

  return (
    <div className="min-h-screen bg-background">
      <DemoNavbar />
      <main className="container mx-auto px-6 py-8 space-y-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Demo Dashboard</h1>
          <p className="text-muted-foreground">All data is local JSON. No API calls.</p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <Button onClick={() => navigate("/demo/pipelines/builder")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Demo Pipeline
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard title="Active Pipelines" value={stats.totalPipelines} description="Total configured" icon={GitBranch} color="primary" />
          <StatsCard title="Successful Builds" value={stats.successfulBuilds} description="Last 30 days" icon={CheckCircle} color="success" />
          <StatsCard title="Running Jobs" value={stats.runningBuilds} description="Currently executing" icon={Clock} color="warning" />
          <StatsCard title="System Uptime" value={stats.uptime} description="Last 30 days" icon={Activity} color="info" />
        </div>

        <div className="space-y-6">
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
            />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <RecentBuilds />
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatsCard title="Avg Build Time" value={stats.avgBuildTime} description="Optimized performance" icon={TrendingUp} color="info" />
            <StatsCard title="Deployments Today" value={stats.deploymentsToday} description="Successful deployments" icon={Server} color="success" />
            <StatsCard title="Tests Executed" value={stats.testsExecuted} description="Last 24 hours" icon={Zap} color="primary" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DemoDashboard;

