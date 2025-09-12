import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PipelineItem } from "@/services/pipelines";

export default function PipelineSimpleCard({ item, onTrigger }: { item: PipelineItem; onTrigger?: (item: PipelineItem) => void }) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="truncate" title={item.name}>{item.name}</span>
          <span className="text-xs text-muted-foreground capitalize">{item.status}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {item.description && (
          <div className="text-muted-foreground line-clamp-2">{item.description}</div>
        )}
        <div className="flex items-center justify-between text-muted-foreground">
          <div className="truncate">
            <span className="font-medium text-foreground">{item.repository || "Repo"}</span>
            <span>/{item.branch || "main"}</span>
          </div>
          <div>{item.lastRun || "—"}</div>
        </div>
        <div className="pt-2">
          <Button size="sm" variant="outline" onClick={() => onTrigger?.(item)}>Trigger</Button>
        </div>
      </CardContent>
    </Card>
  );
}

