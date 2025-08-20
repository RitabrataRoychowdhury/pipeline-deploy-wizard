import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import Navbar from "@/components/Navbar";
import PipelineCard from "@/components/PipelineCard";
import StatsCard from "@/components/StatsCard";
import RecentBuilds from "@/components/RecentBuilds";
import { EarthDashboard } from "@/components/3d/EarthDashboard";
import { Activity, GitBranch, CheckCircle, Clock, Plus } from "lucide-react";
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
      title: "Opening Dashboard 🚀",
      description: "Transitioning from Earth view to dashboard",
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
      setTimeout(step, i * 800);
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
            <div className="text-center text-white/80 backdrop-blur-sm bg-black/20 p-8 rounded-lg">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Dashboard Earth
              </h1>
              <p className="text-lg mb-2">Click the Earth or scroll down to open dashboard</p>
              <p className="text-sm opacity-70">Move your mouse to see vibration effects</p>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      {showDashboard && (
        <main ref={dashboardRef} className="container mx-auto px-6 py-20 space-y-8 relative z-20">
          {/* Stats Overview - First to animate */}
          <div className={`transition-all duration-1000 ${animationStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">Dashboard Overview</h1>
              <p className="text-muted-foreground">Real-time insights into your CI/CD pipelines</p>
            </div>
            
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
          </div>

          {/* Pipelines Section - Second to animate */}
          <div className={`transition-all duration-1000 delay-300 ${animationStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">Pipelines</h2>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => navigate("/pipelines")}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      View All Pipelines
                    </Button>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  {pipelines.map((pipeline, index) => (
                    <div 
                      key={index}
                      className={`transition-all duration-700 ${animationStep >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                      style={{ transitionDelay: `${index * 200}ms` }}
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

              {/* Recent Builds - Third to animate */}
              <div className={`space-y-6 transition-all duration-1000 delay-600 ${animationStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <RecentBuilds />
              </div>
            </div>
          </div>
        </main>
      )}
      
      {/* Background with transition effect */}
      <div className={`fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 transition-opacity duration-2000 ${showDashboard ? 'opacity-100' : 'opacity-0'}`} style={{ zIndex: -1 }} />
    </div>
  );
};

export default Dashboard;