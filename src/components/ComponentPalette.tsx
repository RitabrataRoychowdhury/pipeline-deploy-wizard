import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, X, Package, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DraggableComponent } from './DraggableComponent';
import { componentCategories, searchComponents } from '@/lib/component-definitions';
import { ComponentDefinition } from '@/lib/pipeline-utils';

interface ComponentPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onDragStart?: (component: ComponentDefinition) => void;
  onDragEnd?: () => void;
  className?: string;
}

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({
  isOpen,
  onClose,
  onDragStart,
  onDragEnd,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    new Set(['source-control', 'build-compile'])
  );
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    componentCategories.forEach(category => {
      category.components.forEach(component => {
        component.tags?.forEach(tag => tags.add(tag));
      });
    });
    return Array.from(tags).sort();
  }, []);

  // Filter components based on search and tags
  const filteredCategories = useMemo(() => {
    if (!searchQuery && selectedTags.size === 0) {
      return componentCategories;
    }

    let filteredComponents: ComponentDefinition[] = [];

    if (searchQuery) {
      filteredComponents = searchComponents(searchQuery);
    } else {
      filteredComponents = componentCategories.flatMap(cat => cat.components);
    }

    // Filter by selected tags
    if (selectedTags.size > 0) {
      filteredComponents = filteredComponents.filter(component =>
        component.tags?.some(tag => selectedTags.has(tag))
      );
    }

    // Group filtered components back into categories
    return componentCategories.map(category => ({
      ...category,
      components: filteredComponents.filter(comp => comp.category === category.id)
    })).filter(category => category.components.length > 0);
  }, [searchQuery, selectedTags]);

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

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tag)) {
        newSet.delete(tag);
      } else {
        newSet.add(tag);
      }
      return newSet;
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags(new Set());
  };

  const totalComponents = filteredCategories.reduce(
    (sum, category) => sum + category.components.length, 
    0
  );

  if (!isOpen) return null;

  return (
    <div className={`
      w-80 bg-background/95 backdrop-blur-sm border-r border-border/50 
      flex flex-col overflow-hidden transition-all duration-300 ${className}
    `}>
      {/* Header */}
      <div className="p-4 border-b border-border/50 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Components</h2>
            <Badge variant="secondary" className="text-xs">
              {totalComponents}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
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
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4"
          />
        </div>

        {/* Tag Filters */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Tags</span>
            </div>
            {(selectedTags.size > 0 || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-6 text-xs"
              >
                Clear
              </Button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
            {allTags.slice(0, 12).map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.has(tag) ? "default" : "outline"}
                className="text-xs cursor-pointer hover:bg-primary/10"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        {(selectedTags.size > 0 || searchQuery) && (
          <div className="text-xs text-muted-foreground">
            {searchQuery && `Search: "${searchQuery}"`}
            {searchQuery && selectedTags.size > 0 && ' • '}
            {selectedTags.size > 0 && `${selectedTags.size} tag${selectedTags.size > 1 ? 's' : ''} selected`}
          </div>
        )}
      </div>

      {/* Component Categories */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <div className="text-sm">No components found</div>
              <div className="text-xs">Try adjusting your search or filters</div>
            </div>
          ) : (
            filteredCategories.map((category) => (
              <Collapsible
                key={category.id}
                open={openCategories.has(category.id)}
                onOpenChange={() => toggleCategory(category.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-2 h-auto font-medium text-sm hover:bg-accent/50"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 ${category.color} rounded-md`}>
                        <category.icon className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span>{category.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {category.components.length}
                      </Badge>
                    </div>
                    {openCategories.has(category.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="space-y-2 mt-2">
                  {category.components.map((component) => (
                    <DraggableComponent
                      key={component.type}
                      component={component}
                      onDragStart={onDragStart}
                      onDragEnd={onDragEnd}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <div className="text-xs text-muted-foreground text-center">
          Drag components to the canvas to build your pipeline
        </div>
      </div>
    </div>
  );
};

export default ComponentPalette;