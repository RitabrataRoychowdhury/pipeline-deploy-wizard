import React, { useState, useCallback } from "react";
import { 
  Grid3X3, 
  Move, 
  Sun, 
  Moon, 
  Maximize2, 
  Minimize2, 
  Trash2, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut,
  Save,
  Undo,
  Redo,
  Settings,
  Eye,
  EyeOff,
  Package,
  Play,
  Pause,
  Download,
  Upload,
  Copy,
  Scissors,
  MousePointer,
  Hand
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface ToolbarAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "gradient" | "success" | "warning" | "info" | "floating";
  shortcut?: string;
  badge?: string | number;
}

export interface ToolbarSection {
  id: string;
  label: string;
  actions: ToolbarAction[];
  priority?: number; // Higher priority sections show first on mobile
}

interface PipelineToolbarProps {
  sections?: ToolbarSection[];
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  showGrid?: boolean;
  onToggleGrid?: () => void;
  snapToGrid?: boolean;
  onToggleSnapToGrid?: () => void;
  showPalette?: boolean;
  onTogglePalette?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onClearAll?: () => void;
  onResetView?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  className?: string;
  position?: "top" | "bottom" | "floating";
  compact?: boolean;
  nodeCount?: number;
  edgeCount?: number;
}

const defaultSections: ToolbarSection[] = [
  {
    id: "view",
    label: "View Controls",
    priority: 1,
    actions: []
  },
  {
    id: "canvas",
    label: "Canvas Actions", 
    priority: 2,
    actions: []
  },
  {
    id: "file",
    label: "File Operations",
    priority: 3,
    actions: []
  }
];

export const PipelineToolbar = ({
  sections = defaultSections,
  isFullscreen = false,
  onToggleFullscreen,
  isDarkMode = false,
  onToggleDarkMode,
  showGrid = true,
  onToggleGrid,
  snapToGrid = false,
  onToggleSnapToGrid,
  showPalette = true,
  onTogglePalette,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onClearAll,
  onResetView,
  onSave,
  onExport,
  onImport,
  className,
  position = "floating",
  compact = false,
  nodeCount = 0,
  edgeCount = 0
}: PipelineToolbarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Build default actions based on props
  const buildDefaultSections = useCallback((): ToolbarSection[] => {
    const viewActions: ToolbarAction[] = [
      {
        id: "palette",
        label: showPalette ? "Hide Palette" : "Show Palette",
        icon: Package,
        onClick: onTogglePalette || (() => {}),
        active: showPalette,
        shortcut: "P"
      },
      {
        id: "grid",
        label: showGrid ? "Hide Grid" : "Show Grid",
        icon: Grid3X3,
        onClick: onToggleGrid || (() => {}),
        active: showGrid,
        shortcut: "G"
      },
      {
        id: "snap",
        label: snapToGrid ? "Disable Snap" : "Enable Snap",
        icon: Move,
        onClick: onToggleSnapToGrid || (() => {}),
        active: snapToGrid,
        shortcut: "S"
      },
      {
        id: "theme",
        label: isDarkMode ? "Light Mode" : "Dark Mode",
        icon: isDarkMode ? Sun : Moon,
        onClick: onToggleDarkMode || (() => {}),
        shortcut: "T"
      },
      {
        id: "fullscreen",
        label: isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen",
        icon: isFullscreen ? Minimize2 : Maximize2,
        onClick: onToggleFullscreen || (() => {}),
        shortcut: "F"
      }
    ];

    const canvasActions: ToolbarAction[] = [
      {
        id: "undo",
        label: "Undo",
        icon: Undo,
        onClick: onUndo || (() => {}),
        disabled: !canUndo,
        shortcut: "Ctrl+Z"
      },
      {
        id: "redo", 
        label: "Redo",
        icon: Redo,
        onClick: onRedo || (() => {}),
        disabled: !canRedo,
        shortcut: "Ctrl+Y"
      },
      {
        id: "clear",
        label: "Clear All",
        icon: Trash2,
        onClick: onClearAll || (() => {}),
        variant: "destructive" as const,
        disabled: nodeCount === 0,
        shortcut: "Ctrl+Del"
      },
      {
        id: "reset",
        label: "Reset View",
        icon: RotateCcw,
        onClick: onResetView || (() => {}),
        shortcut: "R"
      }
    ];

    const fileActions: ToolbarAction[] = [
      {
        id: "import",
        label: "Import",
        icon: Upload,
        onClick: onImport || (() => {}),
        shortcut: "Ctrl+O"
      },
      {
        id: "export",
        label: "Export",
        icon: Download,
        onClick: onExport || (() => {}),
        disabled: nodeCount === 0,
        shortcut: "Ctrl+E"
      },
      {
        id: "save",
        label: "Save Pipeline",
        icon: Save,
        onClick: onSave || (() => {}),
        variant: "gradient" as const,
        disabled: nodeCount === 0,
        shortcut: "Ctrl+S"
      }
    ];

    return [
      { id: "view", label: "View Controls", priority: 1, actions: viewActions },
      { id: "canvas", label: "Canvas Actions", priority: 2, actions: canvasActions },
      { id: "file", label: "File Operations", priority: 3, actions: fileActions }
    ];
  }, [
    showPalette, showGrid, snapToGrid, isDarkMode, isFullscreen,
    canUndo, canRedo, nodeCount, edgeCount,
    onTogglePalette, onToggleGrid, onToggleSnapToGrid, onToggleDarkMode, onToggleFullscreen,
    onUndo, onRedo, onClearAll, onResetView, onSave, onExport, onImport
  ]);

  const finalSections = sections.length === defaultSections.length && 
    sections.every(s => s.actions.length === 0) ? buildDefaultSections() : sections;

  const renderAction = (action: ToolbarAction) => (
    <TooltipProvider key={action.id}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={action.variant || (action.active ? "default" : "ghost")}
            size={compact ? "xs" : "sm"}
            onClick={action.onClick}
            disabled={action.disabled}
            className={cn(
              "relative",
              action.active && !action.variant && "bg-primary text-primary-foreground"
            )}
          >
            <action.icon className={cn("h-4 w-4", !compact && action.badge && "mr-1")} />
            {!compact && action.badge && (
              <Badge variant="secondary" className="ml-1 text-xs px-1 py-0 h-4">
                {action.badge}
              </Badge>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <div className="font-medium">{action.label}</div>
            {action.shortcut && (
              <div className="text-xs text-muted-foreground mt-1">
                {action.shortcut}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const renderSection = (section: ToolbarSection, showLabel: boolean = false) => (
    <div key={section.id} className="flex items-center gap-1">
      {showLabel && !compact && (
        <span className="text-xs text-muted-foreground mr-2 font-medium">
          {section.label}
        </span>
      )}
      {section.actions.map(renderAction)}
    </div>
  );

  const sortedSections = [...finalSections].sort((a, b) => (b.priority || 0) - (a.priority || 0));

  const baseClasses = cn(
    "flex items-center gap-2 bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg rounded-xl p-2",
    "transition-all duration-300",
    className
  );

  const positionClasses = {
    top: "sticky top-4 left-4 z-20 w-fit",
    bottom: "sticky bottom-4 left-1/2 transform -translate-x-1/2 z-20 w-fit",
    floating: "absolute top-4 left-4 z-20 w-fit"
  };

  if (compact || isCollapsed) {
    return (
      <div className={cn(baseClasses, positionClasses[position])}>
        {/* Essential actions only */}
        <Button
          variant={showPalette ? "default" : "ghost"}
          size="xs"
          onClick={onTogglePalette}
          title="Toggle Palette"
        >
          <Package className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-4" />
        
        <Button
          variant="ghost"
          size="xs"
          onClick={onSave}
          disabled={nodeCount === 0}
          title="Save Pipeline"
        >
          <Save className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="xs"
          onClick={() => setIsCollapsed(false)}
          title="Expand Toolbar"
        >
          <Settings className="h-4 w-4" />
        </Button>
        
        {/* Stats badge */}
        {(nodeCount > 0 || edgeCount > 0) && (
          <>
            <Separator orientation="vertical" className="h-4" />
            <Badge variant="outline" className="text-xs">
              {nodeCount}N {edgeCount}E
            </Badge>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={cn(baseClasses, positionClasses[position])}>
      {sortedSections.map((section, index) => (
        <React.Fragment key={section.id}>
          {renderSection(section)}
          {index < sortedSections.length - 1 && (
            <Separator orientation="vertical" className="h-4" />
          )}
        </React.Fragment>
      ))}
      
      {/* Stats and collapse button */}
      <Separator orientation="vertical" className="h-4" />
      
      {(nodeCount > 0 || edgeCount > 0) && (
        <Badge variant="outline" className="text-xs">
          {nodeCount} nodes, {edgeCount} edges
        </Badge>
      )}
      
      <Button
        variant="ghost"
        size="xs"
        onClick={() => setIsCollapsed(true)}
        title="Collapse Toolbar"
      >
        <Minimize2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PipelineToolbar;