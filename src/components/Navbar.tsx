import { GitBranch, Settings, Plus, Activity, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2">
            <GitBranch className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              RustCI
            </h1>
          </Link>
          
          <div className="flex items-center space-x-1">
            <Button 
              asChild
              variant="ghost" 
              size="sm" 
              className={isActive("/") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}
            >
              <Link to="/">
                <Activity className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button 
              asChild
              variant="ghost" 
              size="sm" 
              className={isActive("/pipelines") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}
            >
              <Link to="/pipelines">
                <Database className="h-4 w-4 mr-2" />
                Pipelines
              </Link>
            </Button>
            <Button 
              asChild
              variant="ghost" 
              size="sm" 
              className={isActive("/repositories") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}
            >
              <Link to="/repositories">
                <GitBranch className="h-4 w-4 mr-2" />
                Repositories
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button size="sm" className="bg-gradient-primary hover:opacity-90 shadow-primary">
            <Plus className="h-4 w-4 mr-2" />
            New Pipeline
          </Button>
          <Button 
            asChild
            variant="ghost" 
            size="sm" 
            className={isActive("/settings") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}
          >
            <Link to="/settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;