import React, { useState, useMemo } from "react";
import { Search, X, ChevronDown, ChevronRight, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface ComponentDefinition {
  type: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tags?: string[];
}

export interface ComponentCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  components: ComponentDefinition[];
}

interface ComponentPaletteProps {
  categories: ComponentCategory[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onDragStart?: (event: React.DragEvent, componentType: string) => void;
  className?: string;
  searchPlaceholder?: string;
  title?: string;
}

interface DraggableComponentProps {
  component: ComponentDefinition;
  categoryColor: string;
  onDragStart?: (event: React.DragEvent, componentType: string) => void;
}

const DraggableComponent = ({ component, categoryColor, onDragStart }: DraggableComponentProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (event: React.DragEvent) => {
    setIsDragging(true);
    onDragStart?.(event, component.type);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={cn(
        "group relative bg-card hover:bg-accent/50 border border-border/50 rounded-lg p-3 cursor-grab active:cursor-grabbing",
        "transition-all duration-200 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5",
        isDragging && "opacity-50 scale-95"
      )}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      draggable
      title={`Drag to add ${component.name}`}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-1.5 rounded-md group-hover:scale-110 transition-transform duration-200",
          categoryColor
        )}>
          <component.icon className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm text-foreground truncate">{component.name}</div>
          <div className="text-xs text-muted-foreground/80 line-clamp-2">{component.description}</div>
          {component.tags && component.tags.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {component.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs px-1 py-0 h-4">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Drag indicator */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Move className="h-3 w-3 text-muted-foreground" />
      </div>
    </div>
  );
};

interface CategorySectionProps {
  category: ComponentCategory;
  isOpen: boolean;
  onToggle: () => void;
  filteredComponents: ComponentDefinition[];
  onDragStart?: (event: React.DragEvent, componentType: string) => void;
}

const CategorySection = ({ category, isOpen, onToggle, filteredComponents, onDragStart }: CategorySectionProps) => {
  return (
    <div className="space-y-2">
      <Button
        variant="ghost"
        onClick={onToggle}
        className="w-full justify-between p-2 h-auto font-medium text-sm hover:bg-accent/50"
      >
        <span className="flex items-center gap-2">
          <category.icon className="h-4 w-4" />
          {category.name}
          <Badge variant="outline" className="text-xs">
            {filteredComponents.length}
          </Badge>
        </span>
        {isOpen ? 
          <ChevronDown className="h-4 w-4" /> : 
          <ChevronRight className="h-4 w-4" />
        }
      </Button>
      
      {isOpen && (
        <div className="pl-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
          {filteredComponents.map((component) => (
            <DraggableComponent
              key={component.type}
              component={component}
              categoryColor={category.color}
              onDragStart={onDragStart}
            />
          ))}
          {filteredComponents.length === 0 && (
            <div className="text-xs text-muted-foreground p-2 text-center">
              No components match your search
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const ComponentPalette = ({
  categories,
  isOpen,
  onToggle,
  onClose,
  onDragStart,
  className,
  searchPlaceholder = "Search components...",
  title = "Components"
}: ComponentPaletteProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    new Set(categories.slice(0, 1).map(cat => cat.id)) // Open first category by default
  );

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return categories.map(category => ({
        ...category,
        filteredComponents: category.components
      }));
    }

    const query = searchQuery.toLowerCase();
    return categories.map(category => ({
      ...category,
      filteredComponents: category.components.filter(component =>
        component.name.toLowerCase().includes(query) ||
        component.description.toLowerCase().includes(query) ||
        component.type.toLowerCase().includes(query) ||
        component.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    })).filter(category => category.filteredComponents.length > 0);
  }, [categories, searchQuery]);

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const totalComponents = filteredCategories.reduce(
    (sum, category) => sum + category.filteredComponents.length, 
    0
  );

  if (!isOpen) {
    return (
      <Button
        variant="floating"
        size="icon"
        onClick={onToggle}
        className={cn("fixed top-4 left-4 z-20", className)}
        title="Open component palette"
      >
        {categories[0] && React.createElement(categories[0].icon, { className: "h-4 w-4" })}
      </Button>
    );
  }

  return (
    <div className={cn(
      "w-80 bg-background/95 backdrop-blur-sm border-r border-border/50 flex flex-col overflow-hidden",
      "transition-all duration-300 shadow-lg",
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-card/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            {categories[0]?.icon && React.createElement(categories[0].icon, { className: "h-5 w-5 text-primary" })}
            {title}
            <Badge variant="outline" className="text-xs">
              {totalComponents}
            </Badge>
          </h2>
          <Button
            variant="ghost"
            size="xs"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setSearchQuery("")}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">
          Drag components to the canvas
        </p>
      </div>

      {/* Categories */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredCategories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              isOpen={openCategories.has(category.id)}
              onToggle={() => toggleCategory(category.id)}
              filteredComponents={category.filteredComponents}
              onDragStart={onDragStart}
            />
          ))}
          
          {filteredCategories.length === 0 && (
            <div className="text-center py-8">
              <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No components found</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Try adjusting your search terms
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border/50 bg-card/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{filteredCategories.length} categories</span>
          <span>{totalComponents} components</span>
        </div>
      </div>
    </div>
  );
};

export default ComponentPalette;