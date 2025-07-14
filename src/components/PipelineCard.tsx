import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, CheckCircle, XCircle, GitBranch, Calendar } from "lucide-react";

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
        return <Badge variant="secondary" className="bg-success/10 text-success border-success/20">Success</Badge>;
      case "running":
        return <Badge variant="secondary" className="bg-running/10 text-running border-running/20">Running</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary" className="text-muted-foreground">Idle</Badge>;
    }
  };

  return (
    <Card className="p-6 bg-gradient-card border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-primary/10 hover:shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="font-semibold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <GitBranch className="h-3 w-3" />
            <span>{repository}/{branch}</span>
          </div>
          {lastRun && (
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{lastRun}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={onTrigger}
            className="bg-primary hover:bg-primary/90"
            disabled={status === "running"}
          >
            <Play className="h-3 w-3 mr-1" />
            {status === "running" ? "Running..." : "Trigger"}
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Manual trigger • Shell steps
        </div>
      </div>
    </Card>
  );
};

export default PipelineCard;