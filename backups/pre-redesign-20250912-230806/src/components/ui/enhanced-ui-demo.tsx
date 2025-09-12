import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { ComponentPalette } from "@/components/ui/component-palette";
import { PipelineToolbar } from "@/components/ui/pipeline-toolbar";
import { InteractiveStateProvider } from "@/components/ui/interactive-states";
import { componentCategories } from "@/lib/component-definitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Play, 
  Save, 
  Download, 
  Upload, 
  Settings, 
  Trash2,
  RefreshCw,
  Zap
} from "lucide-react";

export const EnhancedUIDemo = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleDragStart = (event: React.DragEvent, componentType: string) => {
    event.dataTransfer.setData('application/reactflow', componentType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <InteractiveStateProvider>
      <div className="min-h-screen bg-background p-6 space-y-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Enhanced UI Components Demo</h1>
            <p className="text-muted-foreground">
              Showcasing improved button variants, component palette, and responsive toolbar
            </p>
          </div>

          {/* Enhanced Button Variants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Enhanced Button Variants
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Badge variant="outline">Default Variants</Badge>
                  <div className="space-y-2">
                    <Button variant="default" size="sm">Default</Button>
                    <Button variant="outline" size="sm">Outline</Button>
                    <Button variant="ghost" size="sm">Ghost</Button>
                    <Button variant="secondary" size="sm">Secondary</Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Badge variant="outline">New Variants</Badge>
                  <div className="space-y-2">
                    <Button variant="gradient" size="sm">Gradient</Button>
                    <Button variant="success" size="sm">Success</Button>
                    <Button variant="warning" size="sm">Warning</Button>
                    <Button variant="info" size="sm">Info</Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Badge variant="outline">Sizes</Badge>
                  <div className="space-y-2">
                    <Button variant="outline" size="xs">Extra Small</Button>
                    <Button variant="outline" size="sm">Small</Button>
                    <Button variant="outline" size="default">Default</Button>
                    <Button variant="outline" size="lg">Large</Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Badge variant="outline">Interactive States</Badge>
                  <div className="space-y-2">
                    <LoadingButton 
                      loading={isLoading} 
                      onClick={handleLoadingDemo}
                      icon={Play}
                      loadingText="Processing..."
                      variant="gradient"
                      size="sm"
                    >
                      Loading Demo
                    </LoadingButton>
                    <Button variant="floating" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" disabled>
                      Disabled
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Toolbar Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Responsive Pipeline Toolbar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-muted/20 rounded-lg p-4 min-h-[200px]">
                <PipelineToolbar
                  position="floating"
                  showGrid={showGrid}
                  onToggleGrid={() => setShowGrid(!showGrid)}
                  snapToGrid={snapToGrid}
                  onToggleSnapToGrid={() => setSnapToGrid(!snapToGrid)}
                  isDarkMode={isDarkMode}
                  onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
                  showPalette={isPaletteOpen}
                  onTogglePalette={() => setIsPaletteOpen(!isPaletteOpen)}
                  nodeCount={5}
                  edgeCount={4}
                  onSave={() => console.log('Save clicked')}
                  onExport={() => console.log('Export clicked')}
                  onImport={() => console.log('Import clicked')}
                  onClearAll={() => console.log('Clear all clicked')}
                  onResetView={() => console.log('Reset view clicked')}
                />
                
                <div className="mt-16 text-center text-muted-foreground">
                  <p>Toolbar demo area - try the different controls above</p>
                  <div className="mt-2 space-x-2">
                    <Badge variant={showGrid ? "default" : "outline"}>
                      Grid: {showGrid ? "On" : "Off"}
                    </Badge>
                    <Badge variant={snapToGrid ? "default" : "outline"}>
                      Snap: {snapToGrid ? "On" : "Off"}
                    </Badge>
                    <Badge variant={isDarkMode ? "default" : "outline"}>
                      Theme: {isDarkMode ? "Dark" : "Light"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Component Palette Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Component Palette with Search & Filtering</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <ComponentPalette
                    categories={componentCategories}
                    isOpen={isPaletteOpen}
                    onToggle={() => setIsPaletteOpen(!isPaletteOpen)}
                    onClose={() => setIsPaletteOpen(false)}
                    onDragStart={handleDragStart}
                    className="relative"
                  />
                </div>
                
                <div className="flex-1 bg-muted/20 rounded-lg p-4 min-h-[400px] border-2 border-dashed border-border">
                  <div className="text-center text-muted-foreground">
                    <p className="mb-2">Drop Zone</p>
                    <p className="text-sm">Drag components from the palette to this area</p>
                    <Separator className="my-4" />
                    <div className="space-y-2 text-xs">
                      <p>Features demonstrated:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Search functionality with real-time filtering</li>
                        <li>Collapsible categories with component counts</li>
                        <li>Drag and drop with visual feedback</li>
                        <li>Component tags and descriptions</li>
                        <li>Responsive design</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interactive States Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Interactive States & Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Badge variant="outline">Hover Effects</Badge>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full hover:scale-105 transition-transform"
                    >
                      Hover to Scale
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white"
                    >
                      Hover Gradient
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Badge variant="outline">Active States</Badge>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full active:scale-95 transition-transform"
                    >
                      Click to Shrink
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="w-full active:bg-primary active:text-primary-foreground"
                    >
                      Click to Highlight
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Badge variant="outline">Focus States</Badge>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full focus:ring-4 focus:ring-primary/20"
                    >
                      Focus Ring
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full focus:bg-accent focus:scale-105"
                    >
                      Focus Scale
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </InteractiveStateProvider>
  );
};

export default EnhancedUIDemo;