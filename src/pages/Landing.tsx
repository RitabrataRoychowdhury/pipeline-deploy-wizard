import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ResponsiveBackgroundImage } from "@/components/ui/background-image";
import { getBackgroundImage, preloadBackgroundImages } from "@/lib/background-images";
import { 
  GitBranch, 
  Rocket, 
  Zap, 
  Building, 
  Shield,
  ArrowRight,
  Github,
  GitMerge,
  Globe,
  Boxes,
  CheckCircle,
  Users,
  TrendingUp,
  Server,
  Lock,
  Star,
  Play
} from "lucide-react";

const authConnectors = [
  {
    id: 'github',
    name: 'GitHub',
    icon: Github,
    description: 'Connect with GitHub',
    color: 'bg-gray-900 hover:bg-gray-800 text-white',
    borderColor: 'border-gray-700',
    popular: true,
    users: '100M+'
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    icon: GitMerge,
    description: 'Connect with GitLab',
    color: 'bg-orange-600 hover:bg-orange-700 text-white',
    borderColor: 'border-orange-500',
    users: '30M+'
  },
  {
    id: 'bitbucket',
    name: 'Bitbucket',
    icon: GitBranch,
    description: 'Connect with Bitbucket',
    color: 'bg-blue-600 hover:bg-blue-700 text-white',
    borderColor: 'border-blue-500',
    users: '10M+'
  },
  {
    id: 'azure',
    name: 'Azure DevOps',
    icon: Building,
    description: 'Connect with Azure DevOps',
    color: 'bg-blue-700 hover:bg-blue-800 text-white',
    borderColor: 'border-blue-600',
    users: '5M+'
  }
];

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Deploy in seconds with our optimized pipeline engine"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 compliant with end-to-end encryption"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Built for teams with advanced permission controls"
  },
  {
    icon: TrendingUp,
    title: "Advanced Analytics",
    description: "Deep insights into your deployment performance"
  },
  {
    icon: Server,
    title: "Multi-Cloud Support",
    description: "Deploy to AWS, GCP, Azure, and more"
  },
  {
    icon: Boxes,
    title: "Jenkins Compatible",
    description: "Seamless migration from existing Jenkins setups"
  }
];

const stats = [
  { label: "Deployments per day", value: "10M+" },
  { label: "Enterprise customers", value: "500+" },
  { label: "Uptime guarantee", value: "99.9%" },
  { label: "Global regions", value: "15+" }
];

export default function Landing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [selectedConnector, setSelectedConnector] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  usePageTitle("Enterprise CI/CD Platform - RustCI");

  // Preload background images for better performance
  useEffect(() => {
    preloadBackgroundImages();
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleConnectorSelect = (connectorId: string) => {
    setSelectedConnector(connectorId);
  };

  const handleLogin = async (connectorId: string) => {
    setIsLoading(true);
    
    // Simulate authentication process
    setTimeout(() => {
      // Mock user data based on connector
      const mockUserData = {
        github: { name: 'John Doe', email: 'john@github.com', avatar: 'https://github.com/identicons/jasonlong.png' },
        gitlab: { name: 'Jane Smith', email: 'jane@gitlab.com', avatar: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=identicon' },
        bitbucket: { name: 'Bob Wilson', email: 'bob@bitbucket.org', avatar: 'https://www.gravatar.com/avatar/11111111111111111111111111111111?d=identicon' },
        azure: { name: 'Alice Johnson', email: 'alice@azure.com', avatar: 'https://www.gravatar.com/avatar/22222222222222222222222222222222?d=identicon' }
      };

      const userData = mockUserData[connectorId as keyof typeof mockUserData] || mockUserData.github;
      
      // Login with mock data
      login(connectorId, userData);
      
      setIsLoading(false);
      
      // Navigate to the intended destination or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }, 2000);
  };

  const handleDemoMode = () => {
    navigate('/dashboard');
  };

  const bgImages = getBackgroundImage('landing');
  const images = typeof bgImages === 'string' 
    ? { mobile: bgImages, tablet: bgImages, desktop: bgImages }
    : { mobile: bgImages.desktop || '', tablet: bgImages.desktop || '', desktop: bgImages.desktop || '' };
  
  return (
    <ResponsiveBackgroundImage
      images={images}
      alt="Professional CI/CD platform background with geometric patterns"
      className="min-h-screen"
      overlayClassName="bg-gradient-to-br from-slate-900/85 via-blue-900/70 to-slate-900/85"
      priority={true}
    >
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Additional floating elements for depth */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-cyan-400/5 to-blue-400/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/10 rounded-full mb-8 animate-float">
            <Rocket className="h-10 w-10 text-blue-400" />
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-6 drop-shadow-lg">
            Enterprise CI/CD
            <span className="block bg-gradient-to-r from-blue-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-sm">
              Made Simple
            </span>
          </h1>
          
          <p className="text-xl text-slate-200 max-w-3xl mx-auto mb-8 drop-shadow-md">
            The most powerful CI/CD platform trusted by Fortune 500 companies. 
            Deploy faster, scale infinitely, and ship with confidence.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-white mb-2 drop-shadow-md">{stat.value}</div>
                <div className="text-sm text-slate-300 drop-shadow-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Authentication Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">Choose Your Git Provider</h2>
            <p className="text-slate-200 drop-shadow-md">Connect with your preferred development platform to get started</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {authConnectors.map((connector, index) => {
              const Icon = connector.icon;
              const isSelected = selectedConnector === connector.id;
              
              return (
                <Card 
                  key={connector.id}
                  className={`relative cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl group bg-slate-800/60 backdrop-blur-md border-slate-600/50 shadow-lg ${
                    isSelected ? 'ring-2 ring-blue-400 shadow-xl scale-105 bg-slate-800/80' : ''
                  }`}
                  onClick={() => handleConnectorSelect(connector.id)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {connector.popular && (
                    <Badge className="absolute -top-2 -right-2 z-10 bg-blue-500 text-white border-blue-400">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${connector.color} mb-4 mx-auto transition-transform group-hover:scale-110 shadow-lg`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-lg text-white">{connector.name}</CardTitle>
                    <p className="text-sm text-slate-400">{connector.users} users</p>
                  </CardHeader>
                  
                  <CardContent className="text-center">
                    <p className="text-sm text-slate-300 mb-4">{connector.description}</p>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLogin(connector.id);
                      }}
                      disabled={isLoading}
                      className={`w-full ${connector.color} border ${connector.borderColor} hover:shadow-lg transition-all`}
                    >
                      {isLoading && selectedConnector === connector.id ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Connecting...
                        </div>
                      ) : (
                        <>
                          Connect
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                  
                  {isSelected && (
                    <div className="absolute inset-0 bg-blue-500/5 rounded-lg" />
                  )}
                </Card>
              );
            })}
          </div>

          <div className="text-center">
            <Button
              variant="outline"
              onClick={handleDemoMode}
              className="px-8 py-3 bg-slate-800/60 border-slate-500 text-slate-200 hover:bg-slate-700/70 hover:text-white backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Play className="mr-2 h-4 w-4" />
              Try Demo Mode
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">Why Choose RustCI?</h2>
            <p className="text-slate-200 max-w-2xl mx-auto drop-shadow-md">
              Built for modern development teams who demand speed, security, and scalability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index}
                  className="bg-slate-800/40 backdrop-blur-md border-slate-600/50 hover:bg-slate-800/60 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <CardHeader>
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-lg mb-4">
                      <Icon className="h-6 w-6 text-blue-400" />
                    </div>
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-200">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Trust Section */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-slate-800/50 backdrop-blur-md border border-slate-600/50 rounded-full px-6 py-3 mb-8 shadow-lg">
            <Lock className="h-4 w-4 text-green-400" />
            <span className="text-slate-200">SOC 2 Type II Certified</span>
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-slate-200">GDPR Compliant</span>
          </div>
          
          <p className="text-slate-300 text-sm drop-shadow-sm">
            Trusted by developers at Microsoft, Google, Netflix, and 500+ other companies
          </p>
        </div>
      </div>

      {/* Custom CSS for enhanced animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(1deg); }
          66% { transform: translateY(-12px) rotate(-1deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        /* Enhanced pulse animation for background elements */
        @keyframes enhanced-pulse {
          0%, 100% { 
            opacity: 0.4;
            transform: scale(1);
          }
          50% { 
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
        
        /* Subtle parallax effect */
        @media (prefers-reduced-motion: no-preference) {
          .animate-pulse {
            animation: enhanced-pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
        }
      `}</style>
    </ResponsiveBackgroundImage>
  );
}