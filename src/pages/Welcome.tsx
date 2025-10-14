import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOpeningSound } from "@/hooks/useOpeningSound";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import welcomeBg from "@/assets/welcome-bg.png";
import { 
  GitBranch, 
  Rocket, 
  Zap, 
  Building, 
  Play, 
  ArrowRight,
  Github,
  GitMerge,
  Globe,
  Boxes
} from "lucide-react";

const connectors = [
  {
    id: 'github',
    name: 'GitHub',
    icon: Github,
    description: 'Connect to GitHub repositories',
    color: 'bg-gray-900 hover:bg-gray-800',
    popular: true
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    icon: GitMerge,
    description: 'Connect to GitLab projects',
    color: 'bg-orange-600 hover:bg-orange-700'
  },
  {
    id: 'bitbucket',
    name: 'Bitbucket',
    icon: GitBranch,
    description: 'Connect to Bitbucket repositories',
    color: 'bg-blue-600 hover:bg-blue-700'
  },
  {
    id: 'other',
    name: 'Other Git',
    icon: Globe,
    description: 'Connect to other Git providers',
    color: 'bg-purple-600 hover:bg-purple-700'
  }
];

export default function Welcome() {
  const navigate = useNavigate();
  const { playOpeningSound } = useOpeningSound();
  const [selectedConnector, setSelectedConnector] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Set page title
  usePageTitle();

  useEffect(() => {
    // Play entrance animation and sound
    setIsAnimating(true);
    // Delay sound to avoid autoplay restrictions
    const timer = setTimeout(() => {
      playOpeningSound();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [playOpeningSound]);

  const handleConnectorSelect = (connectorId: string) => {
    setSelectedConnector(connectorId);
  };

  const handleContinue = () => {
    if (selectedConnector) {
      // For now, redirect to dummy OAuth - later will be real OAuth
      // window.location.href = "http://0.0.0.0:8000/api/sessions/oauth/google";
      
      // For now, go directly to dashboard
      navigate('/dashboard');
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm scale-105"
        style={{ backgroundImage: `url(${welcomeBg})` }}
      />
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      
      {/* Theme Toggle - Fixed position */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className={`text-center mb-16 transition-all duration-1000 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-8 animate-float">
            <Rocket className="h-10 w-10 text-primary" />
          </div>
          
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-6">
            Welcome to CI/CD Pipeline Builder
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Create powerful CI/CD pipelines with our visual builder. Connect your repositories and start automating your deployments today.
          </p>

          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Lightning Fast</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-blue-500" />
              <span>Enterprise Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Boxes className="h-4 w-4 text-green-500" />
              <span>Jenkins Compatible</span>
            </div>
          </div>
        </div>

        <div className={`max-w-4xl mx-auto transition-all duration-1000 delay-300 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold mb-4">Choose Your Git Provider</h2>
            <p className="text-muted-foreground">Select where your code repositories are hosted</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {connectors.map((connector, index) => {
              const Icon = connector.icon;
              const isSelected = selectedConnector === connector.id;
              
              return (
                <Card 
                  key={connector.id}
                  className={`relative cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group ${
                    isSelected ? 'ring-2 ring-primary shadow-lg scale-105' : ''
                  }`}
                  onClick={() => handleConnectorSelect(connector.id)}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  {connector.popular && (
                    <Badge className="absolute -top-2 -right-2 z-10 bg-primary text-primary-foreground">
                      Popular
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${connector.color} text-white mb-4 mx-auto transition-transform group-hover:scale-110`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-lg">{connector.name}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground">{connector.description}</p>
                  </CardContent>
                  
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/5 rounded-lg" />
                  )}
                </Card>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="px-8 py-3"
            >
              Skip for Now
            </Button>
            
            <Button
              onClick={handleContinue}
              disabled={!selectedConnector}
              className="px-8 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
            >
              Continue with {selectedConnector ? connectors.find(c => c.id === selectedConnector)?.name : 'Selection'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="text-center mt-8">
            <Button
              variant="ghost"
              onClick={() => {
                // Future OAuth implementation
                console.log('OAuth redirect to:', "http://0.0.0.0:8000/api/sessions/oauth/google");
                // For now, just show a toast
                alert('OAuth integration coming soon! For now, proceeding without authentication.');
                navigate('/dashboard');
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              <Play className="mr-2 h-4 w-4" />
              Demo Mode (No Authentication)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}