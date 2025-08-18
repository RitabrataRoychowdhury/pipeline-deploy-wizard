import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PipelineCard from "@/components/PipelineCard";
import StatsCard from "@/components/StatsCard";
import RecentBuilds from "@/components/RecentBuilds";
import { Activity, GitBranch, CheckCircle, Clock, Plus, Rocket, Shield, Zap, Users, ArrowRight, Star, Github, Twitter, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const registrationRef = useRef<HTMLDivElement>(null);
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
    // Trigger animations on mount
    setIsVisible(true);

    // Features animation on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => observer.observe(card));

    if (featuresRef.current) observer.observe(featuresRef.current);
    if (registrationRef.current) observer.observe(registrationRef.current);

    return () => observer.disconnect();
  }, []);

  const handleEmailRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Animate registration form
    const form = document.querySelector('.registration-form');
    form?.classList.add('animate-pulse');
    
    setTimeout(() => {
      setIsRegistered(true);
      form?.classList.remove('animate-pulse');
      
      toast({
        title: "Registration Successful! 🎉",
        description: "You'll be notified when RustCI and Valkyrie Protocol launch!",
      });
    }, 600);
  };

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

  const stats = {
    totalPipelines: pipelines.length,
    successfulBuilds: pipelines.filter(p => p.status === "success").length,
    runningBuilds: pipelines.filter(p => p.status === "running").length,
    uptime: "99.9%"
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="floating-element">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
              🚀 Coming Soon: Next-Gen CI/CD Platform
            </Badge>
          </div>
          
          <h1 className={`hero-title text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent mb-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            RustCI & Valkyrie
          </h1>
          
          <p className={`hero-subtitle text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Revolutionary CI/CD platform built with <span className="text-primary font-semibold">Rust</span> performance and 
            <span className="text-secondary font-semibold"> Valkyrie Protocol</span> security
          </p>
          
          <div className={`hero-cta flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-800 delay-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            <Button size="lg" className="bg-primary hover:bg-primary/90 px-8 py-3 text-lg hover:scale-105 transition-transform">
              Get Early Access
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg hover:scale-105 transition-transform">
              <Github className="mr-2 h-5 w-5" />
              View on GitHub
            </Button>
          </div>
        </div>
        
        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-secondary/20 rounded-full animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-accent/30 rounded-full animate-bounce" style={{animationDelay: '2s', animationDuration: '3.5s'}}></div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Our Platform?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built from the ground up with performance, security, and developer experience in mind
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="feature-card opacity-0 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center">
                <Rocket className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Built with Rust for unmatched performance. 10x faster build times compared to traditional CI/CD platforms.
                </p>
              </CardContent>
            </Card>
            
            <Card className="feature-card opacity-0 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 text-secondary mx-auto mb-4" />
                <CardTitle>Valkyrie Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Advanced security protocols with end-to-end encryption and zero-trust architecture for your code.
                </p>
              </CardContent>
            </Card>
            
            <Card className="feature-card opacity-0 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center">
                <Zap className="h-12 w-12 text-accent mx-auto mb-4" />
                <CardTitle>Smart Automation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  AI-powered pipeline optimization and intelligent resource allocation for maximum efficiency.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section ref={registrationRef} className="py-20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold mb-4">Be Among the First</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join our exclusive early access list and get notified when RustCI and Valkyrie Protocol launch
            </p>
            
            {!isRegistered ? (
              <form onSubmit={handleEmailRegistration} className="registration-form flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90">
                  Join Waitlist
                </Button>
              </form>
            ) : (
              <div className={`success-message transition-all duration-800 ${isRegistered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 max-w-md mx-auto">
                  <CheckCircle className="h-8 w-8 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">You're on the list! 🎉</h3>
                  <p className="text-muted-foreground">
                    We'll notify you as soon as RustCI and Valkyrie Protocol are ready to revolutionize your development workflow.
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex justify-center gap-4 mt-8 text-muted-foreground">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                1,247 developers waiting
              </span>
              <span className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Early access perks
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <main className="container mx-auto px-6 py-20 space-y-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Live Dashboard Preview</h2>
          <p className="text-muted-foreground">Experience the power of our current CI/CD platform</p>
        </div>
        
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
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate("/pipelines")}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  View Pipelines
                </Button>
              </div>
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
