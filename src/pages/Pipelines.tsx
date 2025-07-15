import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import PipelineCard from "@/components/PipelineCard";
import CreatePipelineDialog from "@/components/CreatePipelineDialog";
import StatsCard from "@/components/StatsCard";
import { Activity, GitBranch, CheckCircle, Clock, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

const Pipelines = () => {
  const [pipelines, setPipelines] = useState<Pipeline[]>([
    {
      name: "RustCI Deploy",
      description: "Clone and deploy RustCI repository",
      status: "success",
      lastRun: "2 minutes ago",
      repository: "RustCI",
      branch: "main",
      totalRuns: 45,
      successRate: "95.5%"
    },
    {
      name: "Test Pipeline",
      description: "Simple test pipeline with shell commands",
      status: "idle",
      repository: "RustCI",
      branch: "develop",
      totalRuns: 12,
      successRate: "83.3%"
    },
    {
      name: "Build & Test",
      description: "Comprehensive build and test pipeline",
      status: "failed",
      lastRun: "1 hour ago",
      repository: "RustCI",
      branch: "feature/ci-improvements",
      totalRuns: 8,
      successRate: "75.0%"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const { toast } = useToast();

  const handleTriggerPipeline = async (pipelineName: string) => {
    setPipelines(prev => prev.map(p => 
      p.name === pipelineName 
        ? { ...p, status: "running" as const }
        : p
    ));

    // Simulate pipeline execution
    setTimeout(() => {
      const success = Math.random() > 0.3;
      setPipelines(prev => prev.map(p => 
        p.name === pipelineName 
          ? { 
              ...p, 
              status: success ? "success" as const : "failed" as const,
              lastRun: "just now",
              totalRuns: p.totalRuns + 1
            }
          : p
      ));

      toast({
        title: success ? "Pipeline Completed" : "Pipeline Failed",
        description: `${pipelineName} ${success ? "completed successfully" : "failed during execution"}.`,
        variant: success ? "default" : "destructive",
      });
    }, 3000);
  };

  const handlePipelineCreate = (newPipeline: any) => {
    setPipelines(prev => [...prev, { ...newPipeline, totalRuns: 0, successRate: "0%" }]);
  };

  const filteredPipelines = pipelines.filter(pipeline => {
    const matchesSearch = pipeline.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pipeline.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || pipeline.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalPipelines: pipelines.length,
    activePipelines: pipelines.filter(p => p.status === "running").length,
    successfulRuns: pipelines.reduce((sum, p) => sum + Math.floor(p.totalRuns * parseFloat(p.successRate) / 100), 0),
    totalRuns: pipelines.reduce((sum, p) => sum + p.totalRuns, 0)
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      success: { label: "Success", variant: "default" as const, className: "bg-green-500 hover:bg-green-600" },
      running: { label: "Running", variant: "secondary" as const, className: "bg-blue-500 hover:bg-blue-600" },
      failed: { label: "Failed", variant: "destructive" as const, className: "" },
      idle: { label: "Idle", variant: "outline" as const, className: "" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.idle;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pipelines</h1>
            <p className="text-muted-foreground mt-1">Manage and monitor your CI/CD pipelines</p>
          </div>
          <CreatePipelineDialog onPipelineCreate={handlePipelineCreate} />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Pipelines"
            value={stats.totalPipelines}
            description="All configured pipelines"
            icon={GitBranch}
            color="primary"
          />
          <StatsCard
            title="Active Pipelines"
            value={stats.activePipelines}
            description="Currently running"
            icon={Activity}
            color="warning"
          />
          <StatsCard
            title="Successful Runs"
            value={stats.successfulRuns}
            description="Total successful executions"
            icon={CheckCircle}
            color="success"
            trend="up"
          />
          <StatsCard
            title="Total Runs"
            value={stats.totalRuns}
            description="All pipeline executions"
            icon={Clock}
            color="info"
          />
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search pipelines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
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
          <div className="flex gap-2">
            <Button
              variant={viewMode === "cards" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("cards")}
            >
              Cards
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              Table
            </Button>
          </div>
        </div>

        {/* Pipeline Content */}
        {viewMode === "cards" ? (
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
        ) : (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Repository</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead>Total Runs</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPipelines.map((pipeline, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{pipeline.name}</div>
                        <div className="text-sm text-muted-foreground">{pipeline.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>{pipeline.repository}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{pipeline.branch}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(pipeline.status)}</TableCell>
                    <TableCell>{pipeline.lastRun || "Never"}</TableCell>
                    <TableCell>{pipeline.successRate}</TableCell>
                    <TableCell>{pipeline.totalRuns}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTriggerPipeline(pipeline.name)}
                          disabled={pipeline.status === "running"}
                        >
                          {pipeline.status === "running" ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button size="sm" variant="outline">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {filteredPipelines.length === 0 && (
          <div className="text-center py-12">
            <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No pipelines found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria."
                : "Get started by creating your first pipeline."
              }
            </p>
            {!searchQuery && statusFilter === "all" && (
              <CreatePipelineDialog onPipelineCreate={handlePipelineCreate} />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Pipelines;