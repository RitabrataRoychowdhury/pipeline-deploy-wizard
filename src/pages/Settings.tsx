import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  Database, 
  Server, 
  Key,
  Save,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Settings = () => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [settings, setSettings] = useState({
    // General Settings
    instanceName: "RustCI",
    baseUrl: "http://localhost:8000",
    timezone: "UTC",
    
    // Security Settings
    apiKey: "rustci_api_key_123456789",
    sessionTimeout: "24",
    requireAuthentication: false,
    
    // Notification Settings
    emailNotifications: true,
    slackNotifications: false,
    webhookNotifications: true,
    notificationEmail: "admin@rustci.dev",
    slackWebhook: "",
    
    // Runner Settings
    maxConcurrentBuilds: "5",
    buildTimeout: "3600",
    cleanupPolicy: "7",
    dockerImage: "ubuntu:latest",
    
    // Database Settings
    dbHost: "localhost",
    dbPort: "27017",
    dbName: "rustci",
    backupInterval: "daily"
  });

  const { toast } = useToast();

  const handleSave = (section: string) => {
    toast({
      title: "Settings Saved",
      description: `${section} settings have been updated successfully.`,
    });
  };

  const handleInputChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">Configure your RustCI instance</p>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="runners" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Runners
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Database
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Configuration</CardTitle>
                <CardDescription>
                  Basic settings for your RustCI instance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="instance-name">Instance Name</Label>
                    <Input
                      id="instance-name"
                      value={settings.instanceName}
                      onChange={(e) => handleInputChange("instanceName", e.target.value)}
                      placeholder="Enter instance name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="base-url">Base URL</Label>
                    <Input
                      id="base-url"
                      value={settings.baseUrl}
                      onChange={(e) => handleInputChange("baseUrl", e.target.value)}
                      placeholder="http://localhost:8000"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={settings.timezone} onValueChange={(value) => handleInputChange("timezone", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-end">
                  <Button onClick={() => handleSave("General")}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Configuration</CardTitle>
                <CardDescription>
                  Manage authentication and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable authentication for all API endpoints
                      </p>
                    </div>
                    <Switch
                      checked={settings.requireAuthentication}
                      onCheckedChange={(checked) => handleInputChange("requireAuthentication", checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="api-key">API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        id="api-key"
                        type={showApiKey ? "text" : "password"}
                        value={settings.apiKey}
                        onChange={(e) => handleInputChange("apiKey", e.target.value)}
                        className="font-mono"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline">
                        <Key className="h-4 w-4 mr-2" />
                        Regenerate
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleInputChange("sessionTimeout", e.target.value)}
                      min="1"
                      max="168"
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-end">
                  <Button onClick={() => handleSave("Security")}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how you receive pipeline notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email alerts for pipeline events
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleInputChange("emailNotifications", checked)}
                    />
                  </div>
                  
                  {settings.emailNotifications && (
                    <div className="space-y-2 ml-4">
                      <Label htmlFor="notification-email">Notification Email</Label>
                      <Input
                        id="notification-email"
                        type="email"
                        value={settings.notificationEmail}
                        onChange={(e) => handleInputChange("notificationEmail", e.target.value)}
                        placeholder="admin@example.com"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Slack Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send notifications to Slack workspace
                      </p>
                    </div>
                    <Switch
                      checked={settings.slackNotifications}
                      onCheckedChange={(checked) => handleInputChange("slackNotifications", checked)}
                    />
                  </div>
                  
                  {settings.slackNotifications && (
                    <div className="space-y-2 ml-4">
                      <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
                      <Input
                        id="slack-webhook"
                        value={settings.slackWebhook}
                        onChange={(e) => handleInputChange("slackWebhook", e.target.value)}
                        placeholder="https://hooks.slack.com/services/..."
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Webhook Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send HTTP webhooks for pipeline events
                      </p>
                    </div>
                    <Switch
                      checked={settings.webhookNotifications}
                      onCheckedChange={(checked) => handleInputChange("webhookNotifications", checked)}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-end">
                  <Button onClick={() => handleSave("Notifications")}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Runners Settings */}
          <TabsContent value="runners">
            <Card>
              <CardHeader>
                <CardTitle>Runner Configuration</CardTitle>
                <CardDescription>
                  Configure build runners and execution environment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="max-builds">Max Concurrent Builds</Label>
                    <Input
                      id="max-builds"
                      type="number"
                      value={settings.maxConcurrentBuilds}
                      onChange={(e) => handleInputChange("maxConcurrentBuilds", e.target.value)}
                      min="1"
                      max="20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="build-timeout">Build Timeout (seconds)</Label>
                    <Input
                      id="build-timeout"
                      type="number"
                      value={settings.buildTimeout}
                      onChange={(e) => handleInputChange("buildTimeout", e.target.value)}
                      min="60"
                      max="10800"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cleanup-policy">Cleanup Policy (days)</Label>
                    <Input
                      id="cleanup-policy"
                      type="number"
                      value={settings.cleanupPolicy}
                      onChange={(e) => handleInputChange("cleanupPolicy", e.target.value)}
                      min="1"
                      max="90"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="docker-image">Default Docker Image</Label>
                    <Input
                      id="docker-image"
                      value={settings.dockerImage}
                      onChange={(e) => handleInputChange("dockerImage", e.target.value)}
                      placeholder="ubuntu:latest"
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-end">
                  <Button onClick={() => handleSave("Runners")}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Settings */}
          <TabsContent value="database">
            <Card>
              <CardHeader>
                <CardTitle>Database Configuration</CardTitle>
                <CardDescription>
                  Manage database connection and backup settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="db-host">Database Host</Label>
                    <Input
                      id="db-host"
                      value={settings.dbHost}
                      onChange={(e) => handleInputChange("dbHost", e.target.value)}
                      placeholder="localhost"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="db-port">Database Port</Label>
                    <Input
                      id="db-port"
                      value={settings.dbPort}
                      onChange={(e) => handleInputChange("dbPort", e.target.value)}
                      placeholder="27017"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="db-name">Database Name</Label>
                    <Input
                      id="db-name"
                      value={settings.dbName}
                      onChange={(e) => handleInputChange("dbName", e.target.value)}
                      placeholder="rustci"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="backup-interval">Backup Interval</Label>
                    <Select value={settings.backupInterval} onValueChange={(value) => handleInputChange("backupInterval", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline">
                    Test Connection
                  </Button>
                  <Button variant="outline">
                    Create Backup
                  </Button>
                </div>
                
                <Separator />
                
                <div className="flex justify-end">
                  <Button onClick={() => handleSave("Database")}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Settings;