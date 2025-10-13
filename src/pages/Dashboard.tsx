import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PipelineCard from "@/components/PipelineCard";
import StatsCard from "@/components/StatsCard";
import RecentBuilds from "@/components/RecentBuilds";
import { Breadcrumb } from "@/components/Breadcrumb";
import { BuildTriggerLoader } from "@/components/BuildTriggerLoader";
import { Activity, GitBranch, CheckCircle, Clock, Plus, TrendingUp, Server, Zap, Settings, Filter, BarChart3, Users, Globe, Shield } from "lucide-react";
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
  const [showBuildLoader, setShowBuildLoader] = useState(false);
  const [triggeringPipeline, setTriggeringPipeline] = useState<string | null>(null);
  const handleTriggerPipeline = async (pipelineName: string) => {
    // Show build trigger loader
    setTriggeringPipeline(pipelineName);
    setShowBuildLoader(true);
  };

  const handleBuildLoaderComplete = () => {
    // Navigate to execution page
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
    failedBuilds: pipelines.filter(p => p.status === "failed").length,
    uptime: "99.97%",
    avgBuildTime: "4.2m",
    deploymentsToday: 12,
    testsExecuted: 1247
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
      {/* Professional background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--success)/0.03),transparent_50%)]" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <Navbar />
      
      {/* Professional Breadcrumb Navigation */}
      <div className="container mx-auto px-6 pt-6 relative">
        <div className="flex items-center justify-between">
          <Breadcrumb />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-full">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-xs font-medium text-success uppercase tracking-wider">All Systems Operational</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dashboard Content */}
      <main ref={dashboardRef} className="container mx-auto px-6 py-8 space-y-12 relative">
        {/* Professional Header Section */}
        <div className="text-center space-y-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Enterprise Dashboard</span>
            </div>
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight tracking-tight">
              RustCI Control Center
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Comprehensive CI/CD pipeline management with real-time monitoring, analytics, and enterprise-grade controls.
              <br />
              <span className="text-lg font-medium text-foreground/80">Streamline your development workflow with professional precision.</span>
            </p>
          </div>
          
          {/* Action Bar */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button
              onClick={() => navigate("/pipelines/builder")}
              className="bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 h-12 px-8 text-base font-semibold"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Pipeline
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-12 px-6 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90 hover:border-primary/30 transition-all duration-200">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter & Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-md border-border/40 shadow-xl min-w-48">
                <DropdownMenuItem className="hover:bg-primary/10 cursor-pointer">All Pipelines</DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-primary/10 cursor-pointer">Active Only</DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-primary/10 cursor-pointer">Failed Only</DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-primary/10 cursor-pointer">Recently Updated</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-12 px-6 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90 hover:border-primary/30 transition-all duration-200">
                  <Settings className="h-4 w-4 mr-2" />
                  View Options
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-md border-border/40 shadow-xl min-w-48">
                <DropdownMenuItem className="hover:bg-primary/10 cursor-pointer">Compact View</DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-primary/10 cursor-pointer">Detailed View</DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-primary/10 cursor-pointer">Grid Layout</DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-primary/10 cursor-pointer">List Layout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Professional Analytics Section */}
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">System Analytics</h2>
            <p className="text-muted-foreground text-lg">Real-time performance metrics and insights</p>
          </div>
          <AnalyticsChart />
        </div>

        {/* Primary Metrics Grid */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-primary to-primary/60 rounded-full" />
                Key Performance Indicators
              </h2>
              <p className="text-muted-foreground mt-2 text-lg">Monitor critical system metrics at a glance</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        </div>

        {/* Secondary Metrics Grid */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-success to-success/60 rounded-full" />
                Performance Metrics
              </h2>
              <p className="text-muted-foreground mt-1">Detailed operational statistics</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        </div>

        {/* Professional Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Enhanced Pipelines Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-gradient-to-b from-primary via-primary to-primary/60 rounded-full shadow-sm" />
                  Pipeline Management
                </h2>
                <p className="text-muted-foreground text-lg">Monitor, configure, and execute your CI/CD workflows</p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate("/pipelines")}
                  variant="outline"
                  className="h-11 px-6 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90 hover:border-primary/30 transition-all duration-200"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View All Pipelines
                </Button>
              </div>
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
            
            {/* Quick Actions Panel */}
            <div className="bg-gradient-card border border-border/50 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-info to-info/60 rounded-full" />
                <h3 className="text-xl font-semibold text-foreground">Quick Actions</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => navigate("/pipelines/builder")}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-md hover:shadow-lg transition-all duration-200 h-12"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Pipeline
                </Button>
                <Button
                  variant="outline"
                  className="h-12 bg-background/60 backdrop-blur-sm hover:bg-background/80 transition-all duration-200"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Team Settings
                </Button>
                <Button
                  variant="outline"
                  className="h-12 bg-background/60 backdrop-blur-sm hover:bg-background/80 transition-all duration-200"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-8">
            <RecentBuilds />
            
            {/* System Status Panel */}
            <div className="bg-gradient-card border border-border/50 rounded-xl p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-success to-success/60 rounded-full" />
                <h3 className="text-xl font-semibold text-foreground">System Status</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    <span className="font-medium text-success">Build Servers</span>
                  </div>
                  <span className="text-sm text-success font-semibold">Online</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    <span className="font-medium text-success">Database</span>
                  </div>
                  <span className="text-sm text-success font-semibold">Healthy</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-info/10 border border-info/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-info" />
                    <span className="font-medium text-info">API Gateway</span>
                  </div>
                  <span className="text-sm text-info font-semibold">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Build Trigger Loader */}
      <BuildTriggerLoader 
        isVisible={showBuildLoader} 
        onComplete={handleBuildLoaderComplete}
      />
    </div>
  );
};

export default Dashboard;