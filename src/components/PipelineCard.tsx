import { EnhancedCard } from "@/components/ui/enhanced-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, CheckCircle, XCircle, GitBranch, Calendar, MoreHorizontal, Settings } from "lucide-react";

interface PipelineCardProps {
  name: string;
  description: string;
  status: "success" | "running" | "failed" | "idle";
  lastRun?: string;
  repository?: string;
  branch?: string;
  onTrigger: () => void;
  onConfigure?: () => void;
}

const PipelineCard = ({ 
  name, 
  description, 
  status, 
  lastRun, 
  repository = "RustCI", 
  branch = "main",
  onTrigger,
  onConfigure
}: PipelineCardProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "running":
        return <Clock className="h-4 w-4 text-running animate-spin-slow" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-gradient-success text-success-foreground border-0 shadow-success/20 shadow-sm">
            <CheckCircle className="h-3 w-3 mr-1" />
            Success
          </Badge>
        );
      case "running":
        return (
          <Badge className="bg-gradient-warning text-warning-foreground border-0 shadow-warning/20 shadow-sm">
            <Clock className="h-3 w-3 mr-1 animate-spin" />
            Running
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="border-0 shadow-sm">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-border/50">
            <Clock className="h-3 w-3 mr-1" />
            Idle
          </Badge>
        );
    }
  };

  const getCardVariant = () => {
    switch (status) {
      case "success":
        return "success";
      case "running":
        return "warning";
      case "failed":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <EnhancedCard 
      variant={getCardVariant() as any} 
      interactive
      className="group relative overflow-hidden bg-gradient-card border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
    >
      {/* Enhanced status indicator bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 shadow-sm ${
        status === "success" ? "bg-gradient-success" :
        status === "running" ? "bg-gradient-warning" :
        status === "failed" ? "bg-gradient-to-r from-destructive to-destructive/70" :
        "bg-gradient-to-r from-border to-muted"
      }`} />

      {/* Professional header section */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start space-x-4 flex-1">
          <div className={`p-4 rounded-xl border backdrop-blur-sm shadow-sm ${
            status === "success" ? "bg-success/10 border-success/20 text-success" :
            status === "running" ? "bg-warning/10 border-warning/20 text-warning" :
            status === "failed" ? "bg-destructive/10 border-destructive/20 text-destructive" :
            "bg-muted/10 border-muted/20 text-muted-foreground"
          } group-hover:scale-105 transition-transform duration-300`}>
            {getStatusIcon()}
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors duration-200 leading-tight">
                {name}
              </h3>
              {getStatusBadge()}
            </div>
            <p className="text-muted-foreground leading-relaxed text-base">{description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-primary/10">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Enhanced repository and timing info */}
      <div className="flex items-center justify-between text-sm mb-6 p-4 bg-muted/20 border border-border/30 rounded-lg">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <div className="p-1.5 bg-primary/10 border border-primary/20 rounded-md">
              <GitBranch className="h-3 w-3 text-primary" />
            </div>
            <span className="font-semibold text-foreground">{repository}</span>
            <span className="text-primary font-medium">/{branch}</span>
          </div>
          {lastRun && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span className="font-medium">Last run {lastRun}</span>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced actions section */}
      <div className="flex items-center justify-between pt-6 border-t border-border/50">
        <div className="flex items-center space-x-3">
          <Button
            size="sm"
            onClick={onTrigger}
            className={`h-10 px-6 font-semibold ${
              status === "running" 
                ? "bg-warning/20 text-warning hover:bg-warning/30 border border-warning/30" 
                : "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-primary/25"
            } transition-all duration-200`}
            disabled={status === "running"}
          >
            <Play className={`h-4 w-4 mr-2 ${status === "running" ? "animate-pulse" : ""}`} />
            {status === "running" ? "Running..." : "Trigger Build"}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onConfigure}
            className="h-10 px-4 hover:bg-muted/50 hover:border-primary/30 transition-all duration-200"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="px-3 py-1.5 bg-background/50 border-border/50 font-medium">
            Manual
          </Badge>
          <Badge variant="outline" className="px-3 py-1.5 bg-background/50 border-border/50 font-medium">
            Shell
          </Badge>
        </div>
      </div>
    </EnhancedCard>
  );
};

export default PipelineCard;