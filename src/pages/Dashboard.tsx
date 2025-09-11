import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PipelineCard from "@/components/PipelineCard";
import StatsCard from "@/components/StatsCard";
import RecentBuilds from "@/components/RecentBuilds";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Activity, GitBranch, CheckCircle, Clock, Plus, TrendingUp, Server, Zap, Settings, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/usePageTitle";
import { AnalyticsChart } from "@/components/AnalyticsChart";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Pipeline {
  name: string;
  description: string;
  status: "success" | "running" | "failed" | "idle";
  lastRun?: string;
  repository: string;
  branch: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const dashboardRef = useRef<HTMLDivElement>(null);
  
  // Set page title
  usePageTitle();
  
  const [pipelines, setPipelines] = useState<Pipeline[]>([
    {
      name: "RustCI Production Deploy",
      description: "Production deployment pipeline for RustCI with comprehensive testing and monitoring", 
      status: "success",
      lastRun: "2 minutes ago",
      repository: "RustCI/production",
      branch: "main"
    },
    {
      name: "Frontend Build & Test",
      description: "React TypeScript frontend with comprehensive test suite and build optimization",
      status: "running",
      lastRun: "5 minutes ago",
      repository: "RustCI/frontend", 
      branch: "develop"
    },
    {
      name: "API Integration Pipeline",
      description: "Backend API integration tests with database migrations and performance testing",
      status: "success",
      lastRun: "12 minutes ago",
      repository: "RustCI/backend",
      branch: "feature/api-v2"
    },
    {
      name: "Security Audit Pipeline",
      description: "Automated security scanning and vulnerability assessment",
      status: "idle",
      repository: "RustCI/security", 
      branch: "main"
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

    // Simulate pipeline execution
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate
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
        title: success ? "Pipeline Completed Successfully" : "Pipeline Failed",
        description: `${pipelineName} ${success ? "executed successfully with all tests passing" : "failed during execution - check logs for details"}.`,
        variant: success ? "default" : "destructive",
      });
    }, 5000);
  };

  const stats = {
    totalPipelines: pipelines.length,
    successfulBuilds: pipelines.filter(p => p.status === "success").length,
    runningBuilds: pipelines.filter(p => p.status === "running").length,
    failedBuilds: pipelines.filter(p => p.status === "failed").length,
    uptime: "99.97%",
    avgBuildTime: "4.2m",
    deploymentsToday: 12,
    testsExecuted: 1247
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative">
      <Navbar />
      
      {/* Breadcrumb Navigation */}
      <div className="container mx-auto px-6 pt-4">
        <Breadcrumb />
      </div>
      
      {/* Dashboard Content */}
      <main ref={dashboardRef} className="container mx-auto px-6 py-8 space-y-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                RustCI Dashboard
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Real-time insights and comprehensive analytics for your CI/CD pipelines. 
                Monitor, manage, and optimize your development workflows.
              </p>
            </div>
            <div className="flex gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border/40">
                  <DropdownMenuItem>All Pipelines</DropdownMenuItem>
                  <DropdownMenuItem>Active Only</DropdownMenuItem>
                  <DropdownMenuItem>Failed Only</DropdownMenuItem>
                  <DropdownMenuItem>Recently Updated</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    View Options
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border/40">
                  <DropdownMenuItem>Compact View</DropdownMenuItem>
                  <DropdownMenuItem>Detailed View</DropdownMenuItem>
                  <DropdownMenuItem>Grid Layout</DropdownMenuItem>
                  <DropdownMenuItem>List Layout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <AnalyticsChart />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <StatsCard
            title="Active Pipelines"
            value={stats.totalPipelines}
            description="Total configured pipelines"
            icon={GitBranch}
            color="primary"
            trend="up"
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
            trend="up"
          />
          <StatsCard
            title="System Uptime"
            value={stats.uptime}
            description="Last 30 days"
            icon={Activity}
            color="info"
            trend="up"
          />
        </div>

        {/* Additional Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <StatsCard
            title="Avg Build Time"
            value={stats.avgBuildTime}
            description="Optimized performance"
            icon={TrendingUp}
            color="info"
            trend="down"
          />
          <StatsCard
            title="Deployments Today"
            value={stats.deploymentsToday}
            description="Successful deployments"
            icon={Server}
            color="success"
            trend="up"
          />
          <StatsCard
            title="Tests Executed"
            value={stats.testsExecuted.toLocaleString()}
            description="Last 24 hours"
            icon={Zap}
            color="primary"
            trend="up"
          />
          <StatsCard
            title="Failed Builds"
            value={stats.failedBuilds}
            description="Requiring attention"
            icon={Activity}
            color="warning"
            trend="down"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Pipelines Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Pipeline Management</h2>
                <p className="text-muted-foreground mt-1">Monitor and manage your CI/CD workflows</p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate("/pipelines/builder")}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Pipeline
                </Button>
                <Button
                  onClick={() => navigate("/pipelines")}
                  variant="outline"
                >
                  View All
                </Button>
              </div>
            </div>
            
            <div className="grid gap-8">
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
          <div className="space-y-8">
            <RecentBuilds />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;