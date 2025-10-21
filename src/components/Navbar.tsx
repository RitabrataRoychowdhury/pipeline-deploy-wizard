import { GitBranch, Settings, Plus, Activity, Database, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
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
              className={isActive("/dashboard") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}
            >
              <Link to="/dashboard">
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
          <ThemeToggle />
          <Button 
            asChild
            size="sm" 
            className="bg-gradient-primary hover:opacity-90 shadow-primary"
          >
            <Link to="/pipelines/builder">
              <Plus className="h-4 w-4 mr-2" />
              New Pipeline
            </Link>
          </Button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground capitalize">
                      via {user.provider}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              asChild
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-foreground"
            >
              <Link to="/">
                <User className="h-4 w-4 mr-2" />
                Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;