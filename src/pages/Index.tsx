import { useState } from "react";
import Navbar from "@/components/Navbar";
import PipelineCard from "@/components/PipelineCard";
import CreatePipelineDialog from "@/components/CreatePipelineDialog";
import StatsCard from "@/components/StatsCard";
import RecentBuilds from "@/components/RecentBuilds";
import { Activity, GitBranch, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Pipeline {
  name: string;
  description: string;
  status: "success" | "running" | "failed" | "idle";
  lastRun?: string;
  repository: string;
  branch: string;
}

const Index = () => {
  const [pipelines, setPipelines] = useState<Pipeline[]>([
    {
      name: "RustCI Deploy",
      description: "Clone and deploy RustCI repository", 
      status: "success",
      lastRun: "2 minutes ago",
      repository: "RustCI",
      branch: "main"
    },
    {
      name: "Test Pipeline",
      description: "Simple test pipeline with shell commands",
      status: "idle",
      repository: "RustCI", 
      branch: "develop"
    }
  ]);

  const { toast } = useToast();

  const handleTriggerPipeline = async (pipelineName: string) => {
    // Update pipeline status to running
    setPipelines(prev => prev.map(p => 
      p.name === pipelineName 
        ? { ...p, status: "running" as const }
        : p
    ));

    try {
      const yamlContent = `name: "${pipelineName}"
description: "Triggered pipeline execution"
triggers:
  - trigger_type: manual
    config: {}
stages:
  - name: "Deploy"
    steps:
      - name: "clone-repo"
        step_type: repository
        config:
          repository_url: "https://github.com/RitabrataRoychowdhury/RustCI.git"
          branch: "main"
      - name: "build-project"
        step_type: shell
        config:
          command: "cd /tmp/rustci && cargo build --release"
      - name: "deploy-to-ssh"
        step_type: shell
        config:
          command: "scp -i ./build_context/ssh_keys/id_rsa -P 2222 /tmp/rustci/target/release/* user@localhost:/home/user/"
environment: {}
timeout: 3600
retry_count: 0`;

      // For demo purposes, use a hardcoded pipeline ID
      // In a real app, you'd store the pipeline ID when creating it
      const pipelineId = "07566ad7-ddcb-4573-9507-9af7304de812";

      // Send trigger request to backend
      const response = await fetch(`http://localhost:8000/api/ci/pipelines/${pipelineId}/trigger`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trigger_type: "manual",
        }),
      });

      // Simulate pipeline execution
      setTimeout(() => {
        const success = Math.random() > 0.3; // 70% success rate
        setPipelines(prev => prev.map(p => 
          p.name === pipelineName 
            ? { 
                ...p, 
                status: success ? "success" as const : "failed" as const,
                lastRun: "just now"
              }
            : p
        ));

        toast({
          title: success ? "Pipeline Completed" : "Pipeline Failed",
          description: `${pipelineName} ${success ? "completed successfully" : "failed during execution"}.`,
          variant: success ? "default" : "destructive",
        });
      }, 3000);

    } catch (error) {
      setPipelines(prev => prev.map(p => 
        p.name === pipelineName 
          ? { ...p, status: "failed" as const }
          : p
      ));

      toast({
        title: "Connection Error",
        description: "Could not connect to RustCI server. Make sure it's running on localhost:8000.",
        variant: "destructive",
      });
    }
  };

  const handlePipelineCreate = (newPipeline: any) => {
    setPipelines(prev => [...prev, newPipeline]);
  };

  const stats = {
    totalPipelines: pipelines.length,
    successfulBuilds: pipelines.filter(p => p.status === "success").length,
    runningBuilds: pipelines.filter(p => p.status === "running").length,
    uptime: "99.9%"
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Active Pipelines"
            value={stats.totalPipelines}
            description="Total configured pipelines"
            icon={GitBranch}
            color="primary"
          />
          <StatsCard
            title="Successful Builds"
            value={stats.successfulBuilds}
            description="Last 30 days"
            icon={CheckCircle}
            color="success"
            trend="up"
          />
          <StatsCard
            title="Running Jobs"
            value={stats.runningBuilds}
            description="Currently executing"
            icon={Clock}
            color="warning"
          />
          <StatsCard
            title="System Uptime"
            value={stats.uptime}
            description="Last 7 days"
            icon={Activity}
            color="info"
            trend="up"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pipelines */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Pipelines</h2>
              <CreatePipelineDialog onPipelineCreate={handlePipelineCreate} />
            </div>
            
            <div className="grid gap-4">
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
          </div>

          {/* Recent Builds */}
          <div className="space-y-6">
            <RecentBuilds />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
