import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedCard, EnhancedCardHeader, EnhancedCardTitle, EnhancedCardContent } from "@/components/ui/enhanced-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Bell, 
  Slack, 
  MessageSquare, 
  Mail, 
  Webhook, 
  Plus, 
  Trash2, 
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WebhookConfig {
  id: string;
  name: string;
  type: "slack" | "teams" | "discord" | "email" | "webhook";
  url: string;
  enabled: boolean;
  events: string[];
}

const NotificationHub = () => {
  const { toast } = useToast();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
    {
      id: "1",
      name: "DevOps Slack",
      type: "slack",
      url: "https://hooks.slack.com/services/...",
      enabled: true,
      events: ["pipeline_success", "pipeline_failed"]
    },
    {
      id: "2", 
      name: "Team Notifications",
      type: "teams",
      url: "https://outlook.office.com/webhook/...",
      enabled: false,
      events: ["pipeline_failed"]
    }
  ]);

  const [newWebhook, setNewWebhook] = useState({
    name: "",
    type: "slack" as WebhookConfig["type"],
    url: "",
    events: [] as string[]
  });

  const [showAddForm, setShowAddForm] = useState(false);

  const getTypeIcon = (type: WebhookConfig["type"]) => {
    switch (type) {
      case "slack":
        return <Slack className="h-4 w-4" />;
      case "teams":
        return <MessageSquare className="h-4 w-4" />;
      case "discord":
        return <MessageSquare className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      default:
        return <Webhook className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: WebhookConfig["type"]) => {
    switch (type) {
      case "slack":
        return "bg-[#4A154B] text-white";
      case "teams":
        return "bg-[#6264A7] text-white";
      case "discord":
        return "bg-[#5865F2] text-white";
      case "email":
        return "bg-info text-info-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const eventOptions = [
    { id: "pipeline_success", label: "Pipeline Success", icon: CheckCircle, color: "text-success" },
    { id: "pipeline_failed", label: "Pipeline Failed", icon: XCircle, color: "text-destructive" },
    { id: "pipeline_started", label: "Pipeline Started", icon: Clock, color: "text-warning" },
    { id: "deployment_complete", label: "Deployment Complete", icon: CheckCircle, color: "text-info" }
  ];

  const handleAddWebhook = () => {
    if (!newWebhook.name || !newWebhook.url) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const webhook: WebhookConfig = {
      id: Date.now().toString(),
      ...newWebhook,
      enabled: true
    };

    setWebhooks(prev => [...prev, webhook]);
    setNewWebhook({ name: "", type: "slack", url: "", events: [] });
    setShowAddForm(false);

    toast({
      title: "Webhook Added",
      description: `${newWebhook.name} has been configured successfully`
    });
  };

  const handleToggleWebhook = (id: string) => {
    setWebhooks(prev => prev.map(w => 
      w.id === id ? { ...w, enabled: !w.enabled } : w
    ));
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(prev => prev.filter(w => w.id !== id));
    toast({
      title: "Webhook Removed",
      description: "The webhook configuration has been deleted"
    });
  };

  const handleTestWebhook = (webhook: WebhookConfig) => {
    // Note: This would require backend functionality to actually send notifications
    toast({
      title: "Test Notification Sent",
      description: `Test message sent to ${webhook.name}`,
    });
  };

  return (
    <div className="space-y-6">
      <EnhancedCard variant="elevated">
        <EnhancedCardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <EnhancedCardTitle>Notification Hub</EnhancedCardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure webhooks to receive pipeline notifications
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-primary hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Webhook
            </Button>
          </div>
        </EnhancedCardHeader>

        <EnhancedCardContent>
          {/* Add Webhook Form */}
          {showAddForm && (
            <EnhancedCard variant="glass" className="mb-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhook-name">Webhook Name</Label>
                    <Input
                      id="webhook-name"
                      placeholder="e.g., DevOps Slack"
                      value={newWebhook.name}
                      onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="webhook-type">Type</Label>
                    <select
                      id="webhook-type"
                      className="w-full px-3 py-2 bg-background border border-input rounded-md"
                      value={newWebhook.type}
                      onChange={(e) => setNewWebhook(prev => ({ ...prev, type: e.target.value as WebhookConfig["type"] }))}
                    >
                      <option value="slack">Slack</option>
                      <option value="teams">Microsoft Teams</option>
                      <option value="discord">Discord</option>
                      <option value="email">Email</option>
                      <option value="webhook">Custom Webhook</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://hooks.slack.com/services/..."
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Trigger Events</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {eventOptions.map((event) => {
                      const Icon = event.icon;
                      return (
                        <label
                          key={event.id}
                          className="flex items-center space-x-2 p-2 rounded-lg border border-border/50 hover:border-primary/30 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={newWebhook.events.includes(event.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewWebhook(prev => ({ 
                                  ...prev, 
                                  events: [...prev.events, event.id] 
                                }));
                              } else {
                                setNewWebhook(prev => ({ 
                                  ...prev, 
                                  events: prev.events.filter(e => e !== event.id) 
                                }));
                              }
                            }}
                            className="rounded"
                          />
                          <Icon className={`h-4 w-4 ${event.color}`} />
                          <span className="text-sm">{event.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddWebhook} className="bg-gradient-primary hover:opacity-90">
                    Add Webhook
                  </Button>
                </div>
              </div>
            </EnhancedCard>
          )}

          {/* Webhook List */}
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <EnhancedCard key={webhook.id} variant="default" className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${getTypeColor(webhook.type)}`}>
                      {getTypeIcon(webhook.type)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{webhook.name}</h4>
                        <Badge 
                          variant={webhook.enabled ? "secondary" : "outline"}
                          className={webhook.enabled ? "bg-success/10 text-success" : ""}
                        >
                          {webhook.enabled ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {webhook.url.substring(0, 50)}...
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        {webhook.events.map((event) => {
                          const eventConfig = eventOptions.find(e => e.id === event);
                          if (!eventConfig) return null;
                          const Icon = eventConfig.icon;
                          return (
                            <Badge key={event} variant="outline" className="text-xs">
                              <Icon className={`h-3 w-3 mr-1 ${eventConfig.color}`} />
                              {eventConfig.label}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={webhook.enabled}
                      onCheckedChange={() => handleToggleWebhook(webhook.id)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestWebhook(webhook)}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteWebhook(webhook.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </EnhancedCard>
            ))}

            {webhooks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No notification webhooks configured yet.</p>
                <p className="text-sm">Click "Add Webhook" to get started.</p>
              </div>
            )}
          </div>

          {/* Info Card */}
          <EnhancedCard variant="info" className="mt-6 p-4 bg-info/5 border-info/20">
            <div className="flex items-start space-x-3">
              <Settings className="h-5 w-5 text-info mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-info mb-1">Backend Integration Required</p>
                <p className="text-muted-foreground">
                  To enable actual webhook notifications when pipeline events occur, you'll need to connect your project to Supabase for backend functionality.
                </p>
              </div>
            </div>
          </EnhancedCard>
        </EnhancedCardContent>
      </EnhancedCard>
    </div>
  );
};

export default NotificationHub;