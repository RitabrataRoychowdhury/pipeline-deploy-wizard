import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PipelineBuilderNew } from "./PipelineBuilderNew";
import Navbar from "@/components/Navbar";

export default function PipelineBuilderPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSave = async (yaml: string) => {
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
        throw new Error("Failed to create pipeline");
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
      toast({
        title: "Error",
        description: "Failed to create pipeline. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navbar />
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
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