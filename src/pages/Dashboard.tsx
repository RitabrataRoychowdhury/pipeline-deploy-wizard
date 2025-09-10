import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import Navbar from "@/components/Navbar";
import PipelineCard from "@/components/PipelineCard";
import StatsCard from "@/components/StatsCard";
import RecentBuilds from "@/components/RecentBuilds";
import { EarthDashboard } from "@/components/3d/EarthDashboard";
import { Activity, GitBranch, CheckCircle, Clock, Plus, TrendingUp, Server, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const dashboardRef = useRef<HTMLDivElement>(null);
  
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

  useEffect(() => {
    // Mouse position tracking
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    // Scroll-triggered dashboard animation
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 200 && !isTransitioning && !showDashboard) {
        triggerTransition();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isTransitioning, showDashboard]);

  const triggerTransition = () => {
    setIsTransitioning(true);
    
    toast({
      title: "Dashboard Loading",
      description: "Transitioning to enterprise dashboard view",
    });

    // Start transition sequence
    setTimeout(() => {
      setShowDashboard(true);
      animateDashboardComponents();
    }, 1500);
  };

  const animateDashboardComponents = () => {
    const steps = [
      () => setAnimationStep(1), // Stats cards
      () => setAnimationStep(2), // Pipelines
      () => setAnimationStep(3), // Recent builds
      () => setAnimationStep(4), // Complete
    ];

    steps.forEach((step, i) => {
      setTimeout(step, i * 600);
    });
  };

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
      
      {/* 3D Earth Container */}
      {!showDashboard && (
        <div className="fixed inset-0 z-10">
          <Canvas
            camera={{ position: [0, 0, 10], fov: 60 }}
            gl={{ 
              antialias: true, 
              alpha: true,
              powerPreference: "high-performance"
            }}
          >
            <PerspectiveCamera makeDefault position={[0, 0, 10]} />
            
            {/* Enhanced Lighting */}
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1.2} color="#60a5fa" />
            <pointLight position={[-10, -10, -10]} intensity={0.8} color="#3b82f6" />
            <pointLight position={[0, 10, -10]} intensity={1} color="#1d4ed8" />
            
            <Environment preset="city" />
            
            <EarthDashboard
              onTransition={triggerTransition}
              mousePosition={mousePosition}
              isTransitioning={isTransitioning}
            />
            
            <OrbitControls
              enableZoom={true}
              enablePan={false}
              autoRotate={false}
              maxDistance={15}
              minDistance={5}
            />
          </Canvas>
          
          {/* Overlay Instructions */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="text-center text-white/80 glass-card p-8 max-w-md mx-4">
              <h1 className="text-4xl font-bold mb-4 text-enterprise-heading bg-gradient-to-r from-primary-light to-info bg-clip-text text-transparent">
                RustCI Dashboard
              </h1>
              <p className="text-lg mb-2 text-enterprise">Click the Earth or scroll down to access dashboard</p>
              <p className="text-sm opacity-70">Enterprise-grade CI/CD pipeline management</p>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      {showDashboard && (
        <main ref={dashboardRef} className="container mx-auto px-6 py-20 space-y-12 relative z-20">
          {/* Header Section */}
          <div className={`transition-all duration-1000 ${animationStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold mb-6 text-enterprise-heading bg-gradient-to-r from-primary via-info to-success bg-clip-text text-transparent">
                Enterprise Dashboard
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-enterprise">
                Real-time insights and comprehensive analytics for your CI/CD pipelines. 
                Monitor, manage, and optimize your development workflows with enterprise-grade precision.
              </p>
            </div>
          </div>

          {/* Stats Overview - Enhanced Grid */}
          <div className={`transition-all duration-1000 ${animationStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

          {/* Main Content Grid */}
          <div className={`transition-all duration-1000 delay-300 ${animationStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Pipelines Section - Enhanced */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground text-enterprise-heading">Pipeline Management</h2>
                    <p className="text-muted-foreground text-enterprise mt-2">Monitor and manage your CI/CD workflows</p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => navigate("/pipeline-builder")}
                      className="glass-button hover:shadow-glow-primary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Pipeline
                    </Button>
                    <Button
                      onClick={() => navigate("/pipelines")}
                      variant="outline"
                      className="glass-button"
                    >
                      View All
                    </Button>
                  </div>
                </div>
                
                <div className="grid gap-6">
                  {pipelines.map((pipeline, index) => (
                    <div 
                      key={index}
                      className={`transition-all duration-700 ${animationStep >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                      style={{ transitionDelay: `${index * 150}ms` }}
                    >
                      <PipelineCard
                        name={pipeline.name}
                        description={pipeline.description}
                        status={pipeline.status}
                        lastRun={pipeline.lastRun}
                        repository={pipeline.repository}
                        branch={pipeline.branch}
                        onTrigger={() => handleTriggerPipeline(pipeline.name)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Builds - Enhanced */}
              <div className={`space-y-6 transition-all duration-1000 delay-600 ${animationStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <RecentBuilds />
              </div>
            </div>
          </div>
        </main>
      )}
      
      {/* Enhanced Background with Gradient Mesh */}
      <div className={`fixed inset-0 gradient-mesh transition-opacity duration-2000 ${showDashboard ? 'opacity-100' : 'opacity-0'}`} style={{ zIndex: -1 }} />
    </div>
  );
};

export default Dashboard;