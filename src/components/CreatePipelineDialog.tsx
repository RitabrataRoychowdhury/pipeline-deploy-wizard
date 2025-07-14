import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, GitBranch, Terminal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreatePipelineDialogProps {
  onPipelineCreate: (pipeline: any) => void;
}

const CreatePipelineDialog = ({ onPipelineCreate }: CreatePipelineDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [repository, setRepository] = useState("");
  const [command, setCommand] = useState("echo 'Hello CI/CD'");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const yamlContent = `name: "${name}"
description: "${description}"
triggers:
  - trigger_type: manual
    config: {}
stages:
  - name: "Deploy"
    steps:
      - name: "clone-repo"
        step_type: repository
        config:
          repository_url: "${repository || 'https://github.com/RitabrataRoychowdhury/RustCI.git'}"
          branch: "main"
      - name: "build-${name.toLowerCase().replace(/\s+/g, '-')}"
        step_type: shell
        config:
          command: "${command}"
environment: {}
timeout: 3600
retry_count: 0`;

      const response = await fetch('http://localhost:8000/api/ci/pipelines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          yaml_content: yamlContent
        }),
      });

      if (response.ok) {
        const newPipeline = {
          name,
          description,
          repository,
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
        setCommand("echo 'Hello CI/CD'");
        setOpen(false);
      } else {
        throw new Error('Failed to create pipeline');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create pipeline. Make sure your Rust CI server is running on localhost:8000.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
          <div className="space-y-2">
            <Label htmlFor="name">Pipeline Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Pipeline"
              required
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Builds and deploys my application"
              required
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="repository">Repository URL</Label>
            <Input
              id="repository"
              value={repository}
              onChange={(e) => setRepository(e.target.value)}
              placeholder="https://github.com/username/repo.git"
              className="bg-background border-border"
            />
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
              disabled={loading}
              className="bg-gradient-primary hover:opacity-90"
            >
              {loading ? "Creating..." : "Create Pipeline"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePipelineDialog;