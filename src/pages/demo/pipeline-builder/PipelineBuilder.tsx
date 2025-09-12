import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { PipelineBuilderNew } from "@/pages/pipeline-builder/PipelineBuilderNew";
import DemoNavbar from "@/components/DemoNavbar";

export default function DemoPipelineBuilderPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  usePageTitle();

  const { guardedNavigate } = useNavigationGuard({
    hasUnsavedChanges,
    message: 'You have unsaved changes in your pipeline. Are you sure you want to leave?',
    onNavigateAway: () => {
      toast({ title: "Navigation", description: "Navigated away from demo builder" });
    }
  });

  const handleSave = async (_yaml: string) => {
    setIsSaving(true);
    // No network calls in demo. Just simulate a save and redirect.
    setTimeout(() => {
      toast({ title: "Saved (Demo)", description: "Pipeline YAML stored locally for demo." });
      setIsSaving(false);
      setHasUnsavedChanges(false);
      navigate("/demo/pipelines");
    }, 800);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <DemoNavbar />

      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <LoadingButton
            variant="ghost"
            onClick={() => guardedNavigate(-1)}
            className="gap-2"
            icon={ArrowLeft}
          >
            Back
          </LoadingButton>
          <div>
            <h1 className="text-2xl font-bold">Visual Pipeline Builder (Demo)</h1>
            <p className="text-sm text-muted-foreground">No backend — saves locally and returns to demo pipelines</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <PipelineBuilderNew 
          onSave={handleSave}
          onUnsavedChanges={setHasUnsavedChanges}
        />
      </div>
    </div>
  );
}
