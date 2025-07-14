import { GitBranch, Settings, Plus, Activity, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <GitBranch className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              RustCI
            </h1>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="text-foreground hover:text-primary">
              <Activity className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Database className="h-4 w-4 mr-2" />
              Pipelines
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <GitBranch className="h-4 w-4 mr-2" />
              Repositories
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button size="sm" className="bg-gradient-primary hover:opacity-90 shadow-primary">
            <Plus className="h-4 w-4 mr-2" />
            New Pipeline
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;