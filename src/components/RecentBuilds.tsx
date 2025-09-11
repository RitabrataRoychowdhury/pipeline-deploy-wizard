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
    <Card className="bg-gradient-card border-border/50 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-info to-info/60 rounded-full" />
            <span className="text-xl font-bold">Recent Builds</span>
          </div>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10 transition-all duration-200">
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockBuilds.map((build) => (
            <div key={build.id} className="group p-4 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/20 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="mt-1">
                    {getStatusIcon(build.status)}
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="font-semibold text-foreground text-base">{build.pipeline}</span>
                      {getStatusBadge(build.status)}
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <GitCommit className="h-3 w-3" />
                          <span className="font-mono text-xs bg-muted/50 px-2 py-1 rounded">{build.commit}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Play className="h-3 w-3" />
                          <span className="font-medium">{build.branch}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{build.startTime}</span>
                        </div>
                        {build.duration && (
                          <span className="font-medium text-primary">Duration: {build.duration}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-200"
                >
                  View Logs
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentBuilds;