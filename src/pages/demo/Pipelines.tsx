import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DemoNavbar from "@/components/DemoNavbar";
import { useToast } from "@/hooks/use-toast";
import PipelineCard from "@/components/PipelineCard";
import StatsCard from "@/components/StatsCard";
import { Activity, GitBranch, CheckCircle, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import pipelinesData from "@/data/demo/pipelines.json";

interface Pipeline {
  name: string;
  description: string;
  status: "success" | "running" | "failed" | "idle";
  lastRun?: string;
  repository: string;
  branch: string;
  totalRuns: number;
  successRate: string;
}

const DemoPipelines = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pipelines, setPipelines] = useState<Pipeline[]>(pipelinesData as any);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleTriggerPipeline = (pipelineName: string) => {
    setPipelines(prev => prev.map(p => p.name === pipelineName ? { ...p, status: "running" } : p));
    setTimeout(() => {
      const success = Math.random() > 0.3;
      setPipelines(prev => prev.map(p => p.name === pipelineName ? { ...p, status: success ? "success" : "failed", lastRun: "just now", totalRuns: p.totalRuns + 1 } : p));
      toast({
        title: success ? "Pipeline Completed" : "Pipeline Failed",
        description: `${pipelineName} ${success ? "completed successfully" : "failed during execution"}.`,
        variant: success ? "default" : "destructive",
      });
    }, 1200);
  };

  const filteredPipelines = useMemo(() => (
    pipelines.filter(pipeline => {
      const matchesSearch = pipeline.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           pipeline.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || pipeline.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
  ), [pipelines, searchQuery, statusFilter]);

  const stats = useMemo(() => ({
    totalPipelines: pipelines.length,
    activePipelines: pipelines.filter(p => p.status === "running").length,
    successfulRuns: pipelines.reduce((sum, p) => sum + Math.floor(p.totalRuns * parseFloat(p.successRate) / 100), 0),
    totalRuns: pipelines.reduce((sum, p) => sum + p.totalRuns, 0)
  }), [pipelines]);

  return (
    <div className="min-h-screen bg-background">
      <DemoNavbar />
      <main className="container mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Demo Pipelines</h1>
            <p className="text-muted-foreground mt-1">Local JSON only. No backend calls.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/demo/pipelines/builder")}>
              <Plus className="h-4 w-4 mr-2" />
              Visual Builder
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard title="Total Pipelines" value={stats.totalPipelines} description="All configured" icon={GitBranch} color="primary" />
          <StatsCard title="Active Pipelines" value={stats.activePipelines} description="Currently running" icon={Activity} color="warning" />
          <StatsCard title="Successful Runs" value={stats.successfulRuns} description="Total successes" icon={CheckCircle} color="success" />
          <StatsCard title="Total Runs" value={stats.totalRuns} description="All executions" icon={Clock} color="info" />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1 max-w-md">
              <Input placeholder="Search pipelines..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="idle">Idle</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-6">
          {filteredPipelines.map((pipeline, index) => (
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
      </main>
    </div>
  );
};

export default DemoPipelines;

