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
}

const PipelineCard = ({ 
  name, 
  description, 
  status, 
  lastRun, 
  repository = "RustCI", 
  branch = "main",
  onTrigger 
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
      className="group relative overflow-hidden"
    >
      {/* Status indicator bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        status === "success" ? "bg-gradient-success" :
        status === "running" ? "bg-gradient-warning" :
        status === "failed" ? "bg-gradient-to-r from-destructive to-destructive/70" :
        "bg-border"
      }`} />

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-xl ${
            status === "success" ? "bg-success/10 text-success" :
            status === "running" ? "bg-warning/10 text-warning" :
            status === "failed" ? "bg-destructive/10 text-destructive" :
            "bg-muted text-muted-foreground"
          }`}>
            {getStatusIcon()}
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {getStatusBadge()}
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Repository and timing info */}
      <div className="flex items-center justify-between text-sm mb-6">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <div className="p-1 bg-muted rounded">
              <GitBranch className="h-3 w-3" />
            </div>
            <span className="font-medium">{repository}</span>
            <span className="text-primary">/{branch}</span>
          </div>
          {lastRun && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Last run {lastRun}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <div className="flex items-center space-x-3">
          <Button
            size="sm"
            onClick={onTrigger}
            className={`${
              status === "running" 
                ? "bg-warning/20 text-warning hover:bg-warning/30" 
                : "bg-gradient-primary hover:opacity-90 shadow-primary/30 shadow-sm"
            } transition-all duration-200`}
            disabled={status === "running"}
          >
            <Play className={`h-3 w-3 mr-2 ${status === "running" ? "animate-pulse" : ""}`} />
            {status === "running" ? "Running..." : "Trigger Build"}
          </Button>
          
          <Button variant="outline" size="sm" className="hover:bg-muted/50">
            <Settings className="h-3 w-3 mr-2" />
            Configure
          </Button>
        </div>
        
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="px-2 py-1">
            Manual
          </Badge>
          <Badge variant="outline" className="px-2 py-1">
            Shell
          </Badge>
        </div>
      </div>
    </EnhancedCard>
  );
};

export default PipelineCard;