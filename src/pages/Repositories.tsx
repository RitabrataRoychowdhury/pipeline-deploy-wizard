import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { GitBranch, Github, Plus, Search, Settings, Trash2, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Repository {
  id: string;
  name: string;
  url: string;
  provider: "github" | "gitlab" | "bitbucket";
  defaultBranch: string;
  lastSync: string;
  status: "connected" | "error" | "syncing";
  pipelineCount: number;
  description?: string;
}

const Repositories = () => {
  const [repositories, setRepositories] = useState<Repository[]>([
    {
      id: "1",
      name: "RustCI",
      url: "https://github.com/RitabrataRoychowdhury/RustCI.git",
      provider: "github",
      defaultBranch: "main",
      lastSync: "2 minutes ago",
      status: "connected",
      pipelineCount: 3,
      description: "CI/CD tool built with Rust"
    },
    {
      id: "2",
      name: "web-dashboard",
      url: "https://github.com/example/web-dashboard.git",
      provider: "github",
      defaultBranch: "main",
      lastSync: "1 hour ago",
      status: "connected",
      pipelineCount: 1,
      description: "Frontend dashboard application"
    },
    {
      id: "3",
      name: "api-service",
      url: "https://gitlab.com/example/api-service.git",
      provider: "gitlab",
      defaultBranch: "develop",
      lastSync: "3 hours ago",
      status: "error",
      pipelineCount: 0,
      description: "Backend API service"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newRepo, setNewRepo] = useState({
    name: "",
    url: "",
    provider: "github" as const,
    defaultBranch: "main"
  });

  const { toast } = useToast();

  const handleAddRepository = () => {
    if (!newRepo.name || !newRepo.url) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const repository: Repository = {
      id: Date.now().toString(),
      name: newRepo.name,
      url: newRepo.url,
      provider: newRepo.provider,
      defaultBranch: newRepo.defaultBranch,
      lastSync: "Never",
      status: "syncing",
      pipelineCount: 0,
      description: ""
    };

    setRepositories(prev => [...prev, repository]);
    setNewRepo({ name: "", url: "", provider: "github", defaultBranch: "main" });
    setIsAddDialogOpen(false);

    // Simulate connection process
    setTimeout(() => {
      setRepositories(prev => prev.map(repo => 
        repo.id === repository.id 
          ? { ...repo, status: "connected" as const, lastSync: "just now" }
          : repo
      ));
      
      toast({
        title: "Repository Connected",
        description: `${newRepo.name} has been successfully connected.`,
      });
    }, 2000);
  };

  const handleSyncRepository = (repoId: string) => {
    setRepositories(prev => prev.map(repo => 
      repo.id === repoId 
        ? { ...repo, status: "syncing" as const }
        : repo
    ));

    setTimeout(() => {
      setRepositories(prev => prev.map(repo => 
        repo.id === repoId 
          ? { ...repo, status: "connected" as const, lastSync: "just now" }
          : repo
      ));
      
      toast({
        title: "Repository Synced",
        description: "Repository has been successfully synced.",
      });
    }, 1500);
  };

  const handleDeleteRepository = (repoId: string) => {
    const repo = repositories.find(r => r.id === repoId);
    setRepositories(prev => prev.filter(repo => repo.id !== repoId));
    
    toast({
      title: "Repository Removed",
      description: `${repo?.name} has been removed from your repositories.`,
    });
  };

  const filteredRepositories = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      connected: { label: "Connected", variant: "default" as const, className: "bg-green-500 hover:bg-green-600" },
      syncing: { label: "Syncing", variant: "secondary" as const, className: "bg-blue-500 hover:bg-blue-600" },
      error: { label: "Error", variant: "destructive" as const, className: "" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.error;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "github":
        return <Github className="h-4 w-4" />;
      case "gitlab":
        return <GitBranch className="h-4 w-4" />;
      case "bitbucket":
        return <GitBranch className="h-4 w-4" />;
      default:
        return <GitBranch className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Repositories</h1>
            <p className="text-muted-foreground mt-1">Connect and manage your source code repositories</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90 shadow-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Repository
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Repository</DialogTitle>
                <DialogDescription>
                  Connect a new repository to create pipelines
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="repo-name">Repository Name</Label>
                  <Input
                    id="repo-name"
                    placeholder="my-awesome-project"
                    value={newRepo.name}
                    onChange={(e) => setNewRepo(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="repo-url">Repository URL</Label>
                  <Input
                    id="repo-url"
                    placeholder="https://github.com/username/repository.git"
                    value={newRepo.url}
                    onChange={(e) => setNewRepo(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="provider">Provider</Label>
                  <Select value={newRepo.provider} onValueChange={(value) => setNewRepo(prev => ({ ...prev, provider: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="github">GitHub</SelectItem>
                      <SelectItem value="gitlab">GitLab</SelectItem>
                      <SelectItem value="bitbucket">Bitbucket</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="default-branch">Default Branch</Label>
                  <Input
                    id="default-branch"
                    placeholder="main"
                    value={newRepo.defaultBranch}
                    onChange={(e) => setNewRepo(prev => ({ ...prev, defaultBranch: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddRepository}>
                  Connect Repository
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Repository Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRepositories.map((repo) => (
            <Card key={repo.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getProviderIcon(repo.provider)}
                    <CardTitle className="text-lg">{repo.name}</CardTitle>
                  </div>
                  {getStatusBadge(repo.status)}
                </div>
                <CardDescription>{repo.description || "No description provided"}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Default Branch:</span>
                  <Badge variant="outline">{repo.defaultBranch}</Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pipelines:</span>
                  <span className="font-medium">{repo.pipelineCount}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Sync:</span>
                  <span className="font-medium">{repo.lastSync}</span>
                </div>

                <div className="pt-2">
                  <a 
                    href={repo.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View Repository
                  </a>
                </div>
              </CardContent>
              
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSyncRepository(repo.id)}
                  disabled={repo.status === "syncing"}
                  className="flex-1"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${repo.status === "syncing" ? "animate-spin" : ""}`} />
                  Sync
                </Button>
                
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" />
                  Config
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteRepository(repo.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredRepositories.length === 0 && (
          <div className="text-center py-12">
            <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No repositories found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? "Try adjusting your search criteria."
                : "Connect your first repository to get started with CI/CD pipelines."
              }
            </p>
            {!searchQuery && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Repository
                  </Button>
                </DialogTrigger>
              </Dialog>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Repositories;