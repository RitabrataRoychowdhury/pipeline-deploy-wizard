import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { useToast } from "@/hooks/use-toast";
import { PipelineBuilderNew } from "./PipelineBuilderNew";
import Navbar from "@/components/Navbar";

export default function PipelineBuilderPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (yaml: string) => {
    setIsSaving(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      const yamlBlob = new Blob([yaml], { type: "text/yaml" });
      formData.append("pipeline", yamlBlob, "pipeline.yaml");

      // Send POST request to upload pipeline
      const response = await fetch("http://localhost:8000/api/ci/pipelines/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to create pipeline`);
      }

      const result = await response.json();
      console.log("Pipeline created:", result);

      toast({
        title: "Pipeline created",
        description: "Your pipeline has been created successfully.",
      });

      navigate("/pipelines");
    } catch (error) {
      console.error("Error creating pipeline:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create pipeline. Please try again.";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error; // Re-throw for the button to handle
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navbar />
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <LoadingButton
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
            icon={ArrowLeft}
          >
            Back
          </LoadingButton>
          <div>
            <h1 className="text-2xl font-bold">Visual Pipeline Builder</h1>
            <p className="text-sm text-muted-foreground">
              Create and configure your CI/CD pipeline with a visual interface
            </p>
          </div>
        </div>
      </div>

      {/* Pipeline Builder */}
      <div className="flex-1 overflow-hidden">
        <PipelineBuilderNew onSave={handleSave} />
      </div>
    </div>
  );
}