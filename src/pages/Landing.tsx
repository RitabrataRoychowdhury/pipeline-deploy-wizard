import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
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
  const { login } = useAuth();
  const [selectedConnector, setSelectedConnector] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  usePageTitle("Enterprise CI/CD Platform - RustCI");

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
      navigate('/dashboard');
    }, 2000);
  };

  const handleDemoMode = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-800/10 to-transparent"></div>
      </div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/10 rounded-full mb-8 animate-float">
            <Rocket className="h-10 w-10 text-blue-400" />
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-6">
            Enterprise CI/CD
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
            The most powerful CI/CD platform trusted by Fortune 500 companies. 
            Deploy faster, scale infinitely, and ship with confidence.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Authentication Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Choose Your Git Provider</h2>
            <p className="text-slate-300">Connect with your preferred development platform to get started</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {authConnectors.map((connector, index) => {
              const Icon = connector.icon;
              const isSelected = selectedConnector === connector.id;
              
              return (
                <Card 
                  key={connector.id}
                  className={`relative cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl group bg-slate-800/50 backdrop-blur-sm border-slate-700 ${
                    isSelected ? 'ring-2 ring-blue-400 shadow-lg scale-105 bg-slate-800/70' : ''
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
              className="px-8 py-3 bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white backdrop-blur-sm"
            >
              <Play className="mr-2 h-4 w-4" />
              Try Demo Mode
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose RustCI?</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Built for modern development teams who demand speed, security, and scalability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index}
                  className="bg-slate-800/30 backdrop-blur-sm border-slate-700 hover:bg-slate-800/50 transition-all duration-300 hover:scale-105"
                >
                  <CardHeader>
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-lg mb-4">
                      <Icon className="h-6 w-6 text-blue-400" />
                    </div>
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Trust Section */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-full px-6 py-3 mb-8">
            <Lock className="h-4 w-4 text-green-400" />
            <span className="text-slate-300">SOC 2 Type II Certified</span>
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-slate-300">GDPR Compliant</span>
          </div>
          
          <p className="text-slate-400 text-sm">
            Trusted by developers at Microsoft, Google, Netflix, and 500+ other companies
          </p>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}