import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PipelineBuilder } from "@/components/PipelineBuilder";
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Visual Pipeline Builder</h1>
          <p className="text-muted-foreground">
            Create and configure your CI/CD pipeline with a visual interface
          </p>
        </div>

        <PipelineBuilder onSave={handleSave} />
      </div>
    </div>
  );
}