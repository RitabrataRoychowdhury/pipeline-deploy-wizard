import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, GitBranch, Terminal, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { validateForm, createPipelineSchema } from "@/lib/form-validation";
import { useErrorHandler } from "@/components/ErrorBoundary";

interface CreatePipelineDialogProps {
  onPipelineCreate: (pipeline: any) => void;
}

const CreatePipelineDialog = ({ onPipelineCreate }: CreatePipelineDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [repository, setRepository] = useState("");
  const [branch, setBranch] = useState("main");
  const [trigger, setTrigger] = useState<"manual" | "push" | "pull_request" | "schedule">("manual");
  const [command, setCommand] = useState("echo 'Hello CI/CD'");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { toast } = useToast();
  const { handleError } = useErrorHandler();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setValidationErrors({});

    try {
      // Validate form data
      const formData = {
        name,
        description,
        repository: repository || 'https://github.com/RitabrataRoychowdhury/RustCI.git',
        branch,
        trigger,
      };

      const validation = validateForm(createPipelineSchema, formData);
      
      if (!validation.success) {
        setValidationErrors(validation.errors || {});
        toast({
          title: "Validation Error",
          description: "Please fix the errors below and try again.",
          variant: "destructive",
        });
        return;
      }

      const yamlContent = `name: "${name}"
description: "${description}"
triggers:
  - trigger_type: ${trigger}
    config: {}
stages:
  - name: "Deploy"
    steps:
      - name: "clone-repo"
        step_type: repository
        config:
          repository_url: "${repository || 'https://github.com/RitabrataRoychowdhury/RustCI.git'}"
          branch: "${branch}"
      - name: "build-${name.toLowerCase().replace(/\s+/g, '-')}"
        step_type: shell
        config:
          command: "${command}"
environment: {}
timeout: 3600
retry_count: 0`;

      // Create FormData for file upload
      const formDataUpload = new FormData();
      const yamlBlob = new Blob([yamlContent], { type: "text/yaml" });
      formDataUpload.append("pipeline", yamlBlob, "pipeline.yaml");

      const response = await fetch('http://localhost:8000/api/ci/pipelines/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (response.ok) {
        const newPipeline = {
          name,
          description,
          repository: repository || 'https://github.com/RitabrataRoychowdhury/RustCI.git',
          branch,
          trigger,
          status: 'idle' as const,
          lastRun: undefined
        };
        
        onPipelineCreate(newPipeline);
        
        toast({
          title: "Pipeline Created",
          description: `${name} has been successfully created.`,
        });

        // Reset form
        setName("");
        setDescription("");
        setRepository("");
        setBranch("main");
        setTrigger("manual");
        setCommand("echo 'Hello CI/CD'");
        setValidationErrors({});
        setOpen(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create pipeline');
      }
    } catch (error) {
      handleError(error as Error, { component: 'CreatePipelineDialog', action: 'submit' });
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create pipeline. Make sure your Rust CI server is running on localhost:8000.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary hover:opacity-90 shadow-primary">
          <Plus className="h-4 w-4 mr-2" />
          New Pipeline
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <GitBranch className="h-5 w-5 text-primary" />
            <span>Create New Pipeline</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.keys(validationErrors).length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please fix the following errors:
                <ul className="mt-2 list-disc list-inside">
                  {Object.entries(validationErrors).map(([field, error]) => (
                    <li key={field} className="text-sm">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Pipeline Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Pipeline"
              required
              className={`bg-background border-border ${validationErrors.name ? 'border-destructive' : ''}`}
              aria-describedby={validationErrors.name ? 'name-error' : undefined}
            />
            {validationErrors.name && (
              <p id="name-error" className="text-sm text-destructive">{validationErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Builds and deploys my application"
              className={`bg-background border-border ${validationErrors.description ? 'border-destructive' : ''}`}
              aria-describedby={validationErrors.description ? 'description-error' : undefined}
            />
            {validationErrors.description && (
              <p id="description-error" className="text-sm text-destructive">{validationErrors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="repository">Repository URL</Label>
            <Input
              id="repository"
              value={repository}
              onChange={(e) => setRepository(e.target.value)}
              placeholder="https://github.com/username/repo.git"
              className={`bg-background border-border ${validationErrors.repository ? 'border-destructive' : ''}`}
              aria-describedby={validationErrors.repository ? 'repository-error' : undefined}
            />
            {validationErrors.repository && (
              <p id="repository-error" className="text-sm text-destructive">{validationErrors.repository}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branch">Branch *</Label>
              <Input
                id="branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
                required
                className={`bg-background border-border ${validationErrors.branch ? 'border-destructive' : ''}`}
                aria-describedby={validationErrors.branch ? 'branch-error' : undefined}
              />
              {validationErrors.branch && (
                <p id="branch-error" className="text-sm text-destructive">{validationErrors.branch}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="trigger">Trigger</Label>
              <Select value={trigger} onValueChange={(value: any) => setTrigger(value)}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="push">On Push</SelectItem>
                  <SelectItem value="pull_request">On Pull Request</SelectItem>
                  <SelectItem value="schedule">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="command" className="flex items-center space-x-2">
              <Terminal className="h-4 w-4" />
              <span>Shell Command</span>
            </Label>
            <Textarea
              id="command"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Enter the command to execute..."
              rows={3}
              className="bg-background border-border font-mono text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="border-border"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gradient-primary hover:opacity-90"
            >
              {isSubmitting ? "Creating..." : "Create Pipeline"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePipelineDialog;