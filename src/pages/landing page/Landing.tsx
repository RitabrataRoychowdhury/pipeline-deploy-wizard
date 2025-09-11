import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  ArrowRight, 
  CheckCircle, 
  Zap, 
  Shield, 
  GitBranch, 
  Cloud, 
  BarChart3, 
  Rocket,
  Play,
  Star,
  Users,
  TrendingUp,
  Monitor,
  Globe,
  Image as ImageIcon
} from "lucide-react";

// Enhanced Header Component - Always Transparent
const Header = () => {
  return (
    <header className="fixed top-0 w-full z-50">
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              ValKoreCI
            </span>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            {[
              { name: "Features", href: "#features" },
              { name: "Pricing", href: "/pricing" },
              { name: "Docs", href: "/docs" },
              { name: "About", href: "/about" }
            ].map((item) => (
              <a 
                key={item.name}
                href={item.href} 
                className="text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                {item.name}
              </a>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            <Button 
              className="bg-white/90 hover:bg-white text-slate-900 px-4 py-2 text-sm font-medium"
              onClick={() => window.open('/signup', '_blank')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

// Enhanced Hero Section
const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Professional gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-900 to-slate-800" />
      
      {/* Subtle mesh overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-slate-500/5" />
      
      {/* Refined background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/5 w-72 h-72 md:w-96 md:h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/5 w-64 h-64 md:w-80 md:h-80 bg-purple-500/8 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center text-white">
        <Badge className="mb-6 bg-white/10 text-white border-white/20 px-4 py-2 text-xs backdrop-blur-sm">
          <Star className="w-3 h-3 mr-2" />
          Trusted by 10,000+ developers
        </Badge>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400">
            Deploy Code
          </span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400">
            With Confidence
          </span>
        </h1>
        
        <p className="text-base sm:text-lg md:text-lg mb-8 text-slate-200 max-w-3xl mx-auto leading-relaxed">
          Enterprise-grade CI/CD platform that automates your development lifecycle. 
          Build, test, and deploy applications faster than ever before.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button 
            size="lg" 
            className="bg-white text-slate-900 hover:bg-slate-50 px-6 py-3 text-base group shadow-xl w-full sm:w-auto"
            onClick={() => window.open('/dashboard', '_blank')}
          >
            Get Started
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="lg"
            className="text-white px-6 py-3 text-base w-full sm:w-auto"
            onClick={() => {
              const demoSection = document.getElementById('demo');
              demoSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Play className="mr-2 w-4 h-4" />
            See Demo
          </Button>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { number: "99.99%", label: "Uptime", subtext: "Enterprise SLA" },
            { number: "< 15s", label: "Deploy Time", subtext: "Lightning fast" },
            { number: "1M+", label: "Builds", subtext: "Per month" },
            { number: "50+", label: "Integrations", subtext: "Cloud native" }
          ].map((stat, index) => (
            <div key={index} className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-lg sm:text-xl font-bold text-white mb-1">{stat.number}</div>
              <div className="text-slate-300 text-xs font-medium mb-1">{stat.label}</div>
              <div className="text-slate-400 text-xs">{stat.subtext}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Video/Demo Section
const DemoSection = () => {
  const handleDemoClick = () => {
    // Replace with your actual demo video URL
    window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
  };

  return (
    <section id="demo" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-slate-100 text-slate-700 border-slate-200 px-4 py-2 text-xs">
            See It In Action
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-slate-900 to-zinc-600">
              Watch how easy it is to deploy
            </span>
          </h2>
          <p className="text-base text-slate-600 max-w-2xl mx-auto">
            See our platform in action with a quick walkthrough of key features
          </p>
        </div>
        
        {/* Video placeholder - replace with actual video */}
        <div className="max-w-4xl mx-auto">
          <div 
            className="relative bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl aspect-video flex items-center justify-center group cursor-pointer hover:shadow-xl transition-all duration-300"
            onClick={handleDemoClick}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <Play className="w-6 h-6 text-slate-700 ml-1" />
              </div>
              <p className="text-slate-600 font-medium">Click to watch demo</p>
              <p className="text-slate-500 text-sm">3 min overview</p>
            </div>
            {/* Replace this div with: <video /> or <iframe /> */}
          </div>
        </div>
      </div>
    </section>
  );
};

// Bento Card Component with Proper Image Display
const BentoCard = ({ feature, className }: { feature: any; className?: string }) => {
  const { icon: Icon, title, description, benefit, stats, background } = feature;
  
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-xl bg-white border border-slate-200 shadow-sm transition-all duration-500 hover:shadow-lg hover:shadow-slate-200/50",
      className
    )}>
      {/* Background component - this is where the dashboard UI goes */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        {background}
      </div>
      
      {/* Content overlay */}
      <div className="relative z-10 p-6 h-full flex flex-col justify-end bg-gradient-to-t from-white via-white/95 to-transparent">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 group-hover:from-blue-100 group-hover:to-purple-100 transition-all duration-500 shadow-sm">
            <Icon className="w-5 h-5 text-slate-700 group-hover:text-slate-900 transition-colors duration-500" />
          </div>
          
          {stats && (
            <div className="text-right bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1">
              <div className="text-lg font-bold text-slate-900">{stats.value}</div>
              <div className="text-xs text-slate-500">{stats.label}</div>
            </div>
          )}
        </div>
        
        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-slate-800 transition-colors duration-300">
          {title}
        </h3>
        
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          {description}
        </p>
        
        <div className="flex items-center text-xs font-medium text-blue-600">
          <CheckCircle className="w-3 h-3 mr-2 flex-shrink-0" />
          <span>{benefit}</span>
        </div>
      </div>
    </div>
  );
};

// Mock Dashboard Components (Replace with your actual dashboard components)
const DeploymentPipeline = ({ className }: { className?: string }) => (
  <div className={cn("p-6 h-full flex flex-col", className)}>
    <div className="flex items-center justify-between mb-6">
      <h4 className="text-lg font-semibold text-slate-700">Deployment Pipeline</h4>
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
      </div>
    </div>
    
    <div className="space-y-4 flex-grow">
      <div className="flex items-center space-x-4 bg-green-50 p-3 rounded-lg">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <div>
          <p className="font-medium text-green-800">Build Successful</p>
          <p className="text-xs text-green-600">2 minutes ago</p>
        </div>
      </div>
      <div className="flex items-center space-x-4 bg-blue-50 p-3 rounded-lg">
        <div className="w-5 h-5 bg-blue-600 rounded-full animate-pulse"></div>
        <div>
          <p className="font-medium text-blue-800">Deploying to Production</p>
          <p className="text-xs text-blue-600">In progress...</p>
        </div>
      </div>
      <div className="flex items-center space-x-4 bg-slate-50 p-3 rounded-lg">
        <div className="w-5 h-5 bg-slate-400 rounded-full"></div>
        <div>
          <p className="font-medium text-slate-600">Tests Pending</p>
          <p className="text-xs text-slate-500">Waiting for deployment</p>
        </div>
      </div>
    </div>
  </div>
);

const AnalyticsDashboard = ({ className }: { className?: string }) => (
  <div className={cn("p-6 h-full", className)}>
    <div className="mb-4">
      <h4 className="text-lg font-semibold text-slate-700 mb-2">Build Analytics</h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">847</p>
          <p className="text-xs text-blue-600">Successful Builds</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-2xl font-bold text-green-600">12s</p>
          <p className="text-xs text-green-600">Avg Build Time</p>
        </div>
      </div>
    </div>
    
    {/* Mock Chart */}
    <div className="bg-slate-50 rounded-lg p-4 h-24 flex items-end space-x-2">
      {[60, 80, 40, 90, 70, 85, 95].map((height, i) => (
        <div
          key={i}
          className="bg-blue-400 rounded-t flex-1"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  </div>
);

const SecurityMonitoring = ({ className }: { className?: string }) => (
  <div className={cn("p-6 h-full", className)}>
    <div className="flex items-center justify-between mb-4">
      <h4 className="text-lg font-semibold text-slate-700">Security Status</h4>
      <Shield className="w-6 h-6 text-green-600" />
    </div>
    
    <div className="space-y-3">
      <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
        <span className="text-sm font-medium text-green-800">Vulnerabilities Scanned</span>
        <span className="text-green-600 font-bold">✓</span>
      </div>
      <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
        <span className="text-sm font-medium text-green-800">Dependencies Updated</span>
        <span className="text-green-600 font-bold">✓</span>
      </div>
      <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
        <span className="text-sm font-medium text-green-800">Security Policies</span>
        <span className="text-green-600 font-bold">✓</span>
      </div>
    </div>
  </div>
);

const CloudDeployment = ({ className }: { className?: string }) => (
  <div className={cn("p-6 h-full", className)}>
    <h4 className="text-lg font-semibold text-slate-700 mb-4">Multi-Cloud Status</h4>
    
    <div className="space-y-4">
      <div className="flex items-center space-x-4 bg-blue-50 p-3 rounded-lg">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
          AWS
        </div>
        <div className="flex-grow">
          <p className="font-medium text-blue-800">Production</p>
          <p className="text-xs text-blue-600">us-east-1 • Running</p>
        </div>
        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
      </div>
      
      <div className="flex items-center space-x-4 bg-purple-50 p-3 rounded-lg">
        <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">
          GCP
        </div>
        <div className="flex-grow">
          <p className="font-medium text-purple-800">Staging</p>
          <p className="text-xs text-purple-600">us-central1 • Running</p>
        </div>
        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
      </div>
    </div>
  </div>
);

const IntegrationHub = ({ className }: { className?: string }) => (
  <div className={cn("p-6 h-full", className)}>
    <h4 className="text-lg font-semibold text-slate-700 mb-4">Connected Tools</h4>
    
    <div className="grid grid-cols-3 gap-3">
      {['GitHub', 'Docker', 'Slack', 'Jira', 'AWS', 'Monitor'].map((tool, i) => (
        <div key={tool} className="bg-slate-100 p-3 rounded-lg text-center">
          <div className="w-8 h-8 bg-slate-300 rounded-full mx-auto mb-2"></div>
          <p className="text-xs font-medium text-slate-600">{tool}</p>
        </div>
      ))}
    </div>
    
    <div className="mt-4 text-center">
      <p className="text-sm text-slate-500">+44 more integrations</p>
    </div>
  </div>
);

const ResourceScaling = ({ className }: { className?: string }) => (
  <div className={cn("p-6 h-full", className)}>
    <h4 className="text-lg font-semibold text-slate-700 mb-4">Auto-Scaling</h4>
    
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-slate-600">CPU Usage</span>
        <span className="text-sm font-medium text-slate-900">67%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '67%' }}></div>
      </div>
    </div>
    
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-slate-600">Memory</span>
        <span className="text-sm font-medium text-slate-900">43%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div className="bg-green-600 h-2 rounded-full" style={{ width: '43%' }}></div>
      </div>
    </div>
    
    <div className="bg-blue-50 p-3 rounded-lg">
      <p className="text-sm font-medium text-blue-800">Active Instances: 3</p>
      <p className="text-xs text-blue-600">Auto-scaled 2 hours ago</p>
    </div>
  </div>
);

// Bento Grid Component with Fixed TypeScript
const BentoGrid = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={cn(
      "grid w-full auto-rows-[22rem] grid-cols-3 gap-6",
      className,
    )}>
      {children}
    </div>
  );
};

// Proper Bento Grid Features Section with Dashboard UIs
const Features = () => {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast Deployments",
      description: "Deploy applications in seconds with optimized pipeline architecture and intelligent caching systems.",
      benefit: "Deploy 90% faster than traditional solutions",
      stats: { value: "< 15s", label: "avg deploy" },
      className: "col-span-3 lg:col-span-2",
      background: <DeploymentPipeline className="absolute inset-0" />
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive insights into deployment patterns and performance metrics with real-time monitoring.",
      benefit: "Reduce debugging time by 75%",
      className: "col-span-3 lg:col-span-1",
      background: <AnalyticsDashboard className="absolute inset-0" />
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade security with SOC 2 compliance, end-to-end encryption, and advanced threat detection.",
      benefit: "Zero security incidents to date",
      className: "col-span-3 lg:col-span-1",
      background: <SecurityMonitoring className="absolute inset-0" />
    },
    {
      icon: Cloud,
      title: "Multi-Cloud Native",
      description: "Deploy to AWS, Google Cloud, Azure with pre-configured templates and automated scaling capabilities.",
      benefit: "Support for 50+ cloud services",
      stats: { value: "50+", label: "integrations" },
      className: "col-span-3 lg:col-span-2",
      background: <CloudDeployment className="absolute inset-0" />
    },
    {
      icon: GitBranch,
      title: "Universal Integration",
      description: "Connect seamlessly with GitHub, GitLab, Bitbucket, and 100+ development tools in your existing workflow.",
      benefit: "Setup completed in under 5 minutes",
      className: "col-span-3 lg:col-span-2",
      background: <IntegrationHub className="absolute inset-0" />
    },
    {
      icon: TrendingUp,
      title: "Smart Auto-Scaling",
      description: "Automatically scale build agents based on demand and optimize infrastructure costs effectively.",
      benefit: "Save up to 60% on infrastructure costs",
      className: "col-span-3 lg:col-span-1",
      background: <ResourceScaling className="absolute inset-0" />
    }
  ];

  return (
    <section id="features" className="py-16 md:py-24 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-slate-100 text-slate-700 border-slate-200 px-4 py-2 text-xs">
            Platform Features
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-slate-900 to-zinc-600">
              Everything you need to
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-slate-900 to-zinc-600">
              ship with confidence
            </span>
          </h2>
          <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            From code commit to production deployment, our platform provides enterprise-grade tools 
            and developer-friendly workflows that scale with your team.
          </p>
        </div>
        
        {/* Proper Bento Grid */}
        <BentoGrid>
          {features.map((feature, idx) => (
            <BentoCard key={idx} feature={feature} className={feature.className} />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
};

// Enhanced Social Proof Section
const SocialProof = () => {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <p className="text-slate-600 font-medium mb-8 text-sm">Trusted by industry leaders worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-40">
            {["Stripe", "Vercel", "GitHub", "Shopify", "Notion", "Discord"].map((company, index) => (
              <div key={index} className="text-lg font-bold text-slate-600 hover:opacity-80 transition-opacity">
                {company}
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { metric: "10,000+", label: "Active Developers", icon: Users, growth: "+127% YoY" },
            { metric: "1M+", label: "Builds Per Month", icon: BarChart3, growth: "500M+ total" },
            { metric: "99.99%", label: "Uptime SLA", icon: CheckCircle, growth: "Enterprise grade" }
          ].map((stat, index) => (
            <div key={index} className="text-center bg-slate-50 rounded-xl p-6 border border-slate-100">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-6 h-6 text-slate-700" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-2">{stat.metric}</div>
              <div className="text-slate-600 font-medium mb-1 text-sm">{stat.label}</div>
              <div className="text-xs text-slate-500">{stat.growth}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Enhanced CTA Section
const CallToAction = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Refined background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-blue-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 md:w-96 md:h-96 bg-purple-500/8 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center text-white">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400">
            Ready to accelerate your
          </span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400">
            development workflow?
          </span>
        </h2>
        
        <p className="text-base md:text-lg text-slate-200 mb-8 max-w-2xl mx-auto leading-relaxed">
          Join thousands of development teams already shipping faster and more reliably. 
          Get started today with our comprehensive CI/CD platform.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg"
            className="bg-white text-slate-900 hover:bg-slate-50 px-6 py-3 text-base font-semibold group shadow-xl w-full sm:w-auto"
            onClick={() => window.open('/signup', '_blank')}
          >
            Get Started Free
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <div className="text-slate-300 text-center">
            <div className="text-sm font-medium">No credit card required</div>
            <div className="text-xs text-slate-400">Start building in minutes</div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Enhanced Footer
const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Rocket className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">ValKoreCI</span>
            </div>
            <p className="text-slate-400 mb-6 max-w-md leading-relaxed text-sm">
              The most powerful CI/CD platform for modern development teams. 
              Build, test, and deploy applications with enterprise-grade reliability.
            </p>
            <div className="flex space-x-4">
              {[
                { name: "Twitter", href: "https://twitter.com/valkore" },
                { name: "GitHub", href: "https://github.com/valkore" },
                { name: "LinkedIn", href: "https://linkedin.com/company/valkore" },
                { name: "Discord", href: "https://discord.gg/valkore" }
              ].map((social) => (
                <a 
                  key={social.name}
                  href={social.href} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>
          
          {[
            {
              title: "Product",
              links: [
                { name: "Features", href: "#features" },
                { name: "Pricing", href: "/pricing" },
                { name: "Security", href: "/security" },
                { name: "Enterprise", href: "/enterprise" },
                { name: "Integrations", href: "/integrations" }
              ]
            },
            {
              title: "Resources",
              links: [
                { name: "Documentation", href: "/docs" },
                { name: "API Reference", href: "/api" },
                { name: "Guides", href: "/guides" },
                { name: "Blog", href: "/blog" },
                { name: "Status", href: "/status" }
              ]
            }
          ].map((section, index) => (
            <div key={index}>
              <h4 className="font-semibold text-white mb-4 text-sm">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href} 
                      className="hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">&copy; 2025 ValKoreCI. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a href="/privacy" className="text-slate-400 hover:text-white transition-colors text-xs">Privacy Policy</a>
            <a href="/terms" className="text-slate-400 hover:text-white transition-colors text-xs">Terms of Service</a>
            <a href="/cookies" className="text-slate-400 hover:text-white transition-colors text-xs">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main Enhanced Landing Page Component
export default function Landing() {
  return (
    <div className="font-sans antialiased bg-white">
      <Header />
      <Hero />
      <DemoSection />
      <Features />
      <SocialProof />
      <CallToAction />
      <Footer />
    </div>
  );
}
