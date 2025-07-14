import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Play, GitCommit, Calendar } from "lucide-react";

interface Build {
  id: string;
  pipeline: string;
  status: "success" | "running" | "failed";
  commit: string;
  branch: string;
  startTime: string;
  duration?: string;
}

const mockBuilds: Build[] = [
  {
    id: "build-1",
    pipeline: "RustCI Deploy",
    status: "success",
    commit: "abc123f",
    branch: "main",
    startTime: "2 minutes ago",
    duration: "1m 23s"
  },
  {
    id: "build-2", 
    pipeline: "Test Pipeline",
    status: "running",
    commit: "def456a",
    branch: "feature/new-ui",
    startTime: "5 minutes ago"
  },
  {
    id: "build-3",
    pipeline: "Production Deploy",
    status: "failed",
    commit: "ghi789b",
    branch: "main",
    startTime: "1 hour ago",
    duration: "45s"
  }
];

const RecentBuilds = () => {
  const getStatusIcon = (status: Build["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "running":
        return <Clock className="h-4 w-4 text-running animate-spin-slow" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: Build["status"]) => {
    switch (status) {
      case "success":
        return <Badge variant="secondary" className="bg-success/10 text-success border-success/20">Success</Badge>;
      case "running":
        return <Badge variant="secondary" className="bg-running/10 text-running border-running/20">Running</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
    }
  };

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Builds</span>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockBuilds.map((build) => (
            <div key={build.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
              <div className="flex items-center space-x-3">
                {getStatusIcon(build.status)}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-foreground">{build.pipeline}</span>
                    {getStatusBadge(build.status)}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <GitCommit className="h-3 w-3" />
                      <span>{build.commit}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Play className="h-3 w-3" />
                      <span>{build.branch}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{build.startTime}</span>
                    </div>
                    {build.duration && (
                      <span>• {build.duration}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                View Logs
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentBuilds;