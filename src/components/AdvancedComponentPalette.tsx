import React, { useState, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  X, 
  ChevronDown, 
  ChevronRight, 
  Filter,
  Grid3X3,
  List,
  Package,
  Layers,
  Move,
  Star,
  Clock
} from 'lucide-react';
import { componentDefinitions } from '@/lib/component-definitions';
import { ComponentDefinition, ComponentCategory } from '@/lib/pipeline-utils';

interface AdvancedComponentPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface DraggableComponentProps {
  component: ComponentDefinition;
  viewMode: 'grid' | 'list';
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({ component, viewMode }) => {
  const [isDragging, setIsDragging] = useState(false);

  const onDragStart = (event: React.DragEvent, componentType: string) => {
    event.dataTransfer.setData('application/reactflow', componentType);
    event.dataTransfer.setData('application/json', JSON.stringify(component));
    event.dataTransfer.effectAllowed = 'copy';
    setIsDragging(true);
  };

  const onDragEnd = () => {
    setIsDragging(false);
  };

  if (viewMode === 'list') {
    return (
      <div
        className={`group relative bg-card hover:bg-accent/50 border border-border/50 rounded-lg p-3 cursor-grab active:cursor-grabbing
          transition-all duration-200 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5
          ${isDragging ? 'opacity-50 scale-95' : ''}`}
        onDragStart={(event) => onDragStart(event, component.type)}
        onDragEnd={onDragEnd}
        draggable
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 ${component.color} rounded-md group-hover:scale-110 transition-transform duration-200`}>
            <component.icon className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm text-foreground truncate">{component.name}</div>
            <div className="text-xs text-muted-foreground/80 line-clamp-2 mt-1">{component.description}</div>
            {component.tags && component.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {component.tags.slice(0, 2).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                    {tag}
                  </Badge>
                ))}
                {component.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    +{component.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Drag indicator */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Move className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative bg-card hover:bg-accent/50 border border-border/50 rounded-lg p-3 cursor-grab active:cursor-grabbing
        transition-all duration-200 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5 aspect-square
        ${isDragging ? 'opacity-50 scale-95' : ''}`}
      onDragStart={(event) => onDragStart(event, component.type)}
      onDragEnd={onDragEnd}
      draggable
      title={component.description}
    >
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className={`p-2 ${component.color} rounded-md group-hover:scale-110 transition-transform duration-200 mb-2`}>
          <component.icon className="h-5 w-5 text-white" />
        </div>
        <div className="font-medium text-xs text-foreground truncate w-full">{component.name}</div>
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
  components: ComponentDefinition[];
  isOpen: boolean;
  onToggle: () => void;
  viewMode: 'grid' | 'list';
  searchTerm: string;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  components,
  isOpen,
  onToggle,
  viewMode,
  searchTerm
}) => {
  const filteredComponents = useMemo(() => {
    if (!searchTerm) return components;
    
    return components.filter(component =>
      component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [components, searchTerm]);

  if (filteredComponents.length === 0) return null;

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
          <Badge variant="secondary" className="text-xs">
            {filteredComponents.length}
          </Badge>
        </span>
        {isOpen ? 
          <ChevronDown className="h-4 w-4" /> : 
          <ChevronRight className="h-4 w-4" />
        }
      </Button>
      
      {isOpen && (
        <div className={`pl-2 ${
          viewMode === 'grid' 
            ? 'grid grid-cols-2 gap-2' 
            : 'space-y-1'
        }`}>
          {filteredComponents.map((component) => (
            <DraggableComponent 
              key={component.type} 
              component={component} 
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const AdvancedComponentPalette: React.FC<AdvancedComponentPaletteProps> = ({
  isOpen,
  onClose,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(['Source Control']));
  const [recentComponents, setRecentComponents] = useState<string[]>([]);
  const [favoriteComponents, setFavoriteComponents] = useState<Set<string>>(new Set());

  // Group components by category
  const categorizedComponents = useMemo(() => {
    const categories = new Map<string, ComponentDefinition[]>();
    
    componentDefinitions.forEach(component => {
      if (!categories.has(component.category)) {
        categories.set(component.category, []);
      }
      categories.get(component.category)!.push(component);
    });
    
    return categories;
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const categoryMap = new Map<string, ComponentCategory>();
    
    componentDefinitions.forEach(component => {
      if (!categoryMap.has(component.category)) {
        // Find the first component's icon for the category
        const firstComponent = componentDefinitions.find(c => c.category === component.category);
        categoryMap.set(component.category, {
          id: component.category.toLowerCase().replace(/\s+/g, '-'),
          name: component.category,
          icon: firstComponent?.icon || Package,
          color: firstComponent?.color || 'bg-gray-500',
          components: []
        });
      }
    });
    
    return Array.from(categoryMap.values());
  }, []);

  // Filter components based on search and category
  const filteredCategories = useMemo(() => {
    if (selectedCategory === 'all') {
      return categories;
    }
    return categories.filter(cat => cat.id === selectedCategory);
  }, [categories, selectedCategory]);

  // Get recent and favorite components
  const specialSections = useMemo(() => {
    const recent = componentDefinitions.filter(c => recentComponents.includes(c.type));
    const favorites = componentDefinitions.filter(c => favoriteComponents.has(c.type));
    
    return { recent, favorites };
  }, [recentComponents, favoriteComponents]);

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

  const clearSearch = () => {
    setSearchTerm('');
  };

  const toggleFavorite = (componentType: string) => {
    setFavoriteComponents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(componentType)) {
        newSet.delete(componentType);
      } else {
        newSet.add(componentType);
      }
      return newSet;
    });
  };

  if (!isOpen) return null;

  return (
    <div className={`w-80 bg-background/95 backdrop-blur-sm border-r border-border/50 flex flex-col overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Components
          </h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="h-8 w-8 p-0"
              title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9 h-9"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 mt-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-1">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className="h-6 text-xs"
            >
              All
            </Button>
            {categories.slice(0, 3).map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="h-6 text-xs"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Favorites Section */}
          {specialSections.favorites.length > 0 && (
            <>
              <CategorySection
                category={{
                  id: 'favorites',
                  name: 'Favorites',
                  icon: Star,
                  color: 'bg-yellow-500',
                  components: specialSections.favorites
                }}
                components={specialSections.favorites}
                isOpen={openCategories.has('favorites')}
                onToggle={() => toggleCategory('favorites')}
                viewMode={viewMode}
                searchTerm={searchTerm}
              />
              <Separator />
            </>
          )}

          {/* Recent Section */}
          {specialSections.recent.length > 0 && (
            <>
              <CategorySection
                category={{
                  id: 'recent',
                  name: 'Recently Used',
                  icon: Clock,
                  color: 'bg-blue-500',
                  components: specialSections.recent
                }}
                components={specialSections.recent}
                isOpen={openCategories.has('recent')}
                onToggle={() => toggleCategory('recent')}
                viewMode={viewMode}
                searchTerm={searchTerm}
              />
              <Separator />
            </>
          )}

          {/* Category Sections */}
          {filteredCategories.map(category => {
            const categoryComponents = categorizedComponents.get(category.name) || [];
            return (
              <CategorySection
                key={category.id}
                category={category}
                components={categoryComponents}
                isOpen={openCategories.has(category.id)}
                onToggle={() => toggleCategory(category.id)}
                viewMode={viewMode}
                searchTerm={searchTerm}
              />
            );
          })}

          {/* No Results */}
          {searchTerm && filteredCategories.every(cat => {
            const components = categorizedComponents.get(cat.name) || [];
            return components.filter(c => 
              c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
              c.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            ).length === 0;
          }) && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No components found</p>
              <p className="text-xs mt-1">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border/50 bg-muted/20">
        <p className="text-xs text-muted-foreground text-center">
          Drag components to the canvas to add them
        </p>
      </div>
    </div>
  );
};

export default AdvancedComponentPalette;