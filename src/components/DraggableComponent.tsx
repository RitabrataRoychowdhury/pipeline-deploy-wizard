import React, { useState } from 'react';
import { Move, Plus } from 'lucide-react';
import { ComponentDefinition } from '@/lib/pipeline-utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DraggableComponentProps {
  component: ComponentDefinition;
  onDragStart?: (component: ComponentDefinition) => void;
  onDragEnd?: () => void;
}

export const DraggableComponent: React.FC<DraggableComponentProps> = ({
  component,
  onDragStart,
  onDragEnd
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);

    // Set drag data
    event.dataTransfer.setData('application/reactflow', component.type);
    event.dataTransfer.setData('application/json', JSON.stringify(component));
    event.dataTransfer.effectAllowed = 'copy';

    // Create drag image
    const dragImage = createDragImage(component);
    event.dataTransfer.setDragImage(dragImage, offsetX, offsetY);

    onDragStart?.(component);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd?.();
  };

  const createDragImage = (component: ComponentDefinition): HTMLElement => {
    const dragElement = document.createElement('div');
    dragElement.className = `
      bg-background border-2 border-primary rounded-xl p-3 shadow-xl
      flex items-center gap-3 min-w-[200px] opacity-90
    `;
    dragElement.style.position = 'absolute';
    dragElement.style.top = '-1000px';
    dragElement.style.left = '-1000px';
    dragElement.style.pointerEvents = 'none';
    dragElement.style.zIndex = '9999';

    dragElement.innerHTML = `
      <div class="${component.color} p-2 rounded-lg">
        <svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-10-5z"/>
        </svg>
      </div>
      <div class="flex-1">
        <div class="font-medium text-sm text-foreground">${component.name}</div>
        <div class="text-xs text-muted-foreground">${component.type}</div>
      </div>
    `;

    document.body.appendChild(dragElement);
    
    // Clean up after a short delay
    setTimeout(() => {
      if (document.body.contains(dragElement)) {
        document.body.removeChild(dragElement);
      }
    }, 100);

    return dragElement;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`
              group relative bg-card hover:bg-accent/50 border border-border/50 rounded-lg p-3 
              cursor-grab active:cursor-grabbing transition-all duration-200 
              hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5
              ${isDragging ? 'opacity-50 scale-95' : 'hover:scale-[1.02]'}
            `}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {/* Component Icon and Info */}
            <div className="flex items-center gap-3">
              <div className={`
                p-2 ${component.color} rounded-lg shadow-sm
                transition-transform duration-200 group-hover:scale-110
              `}>
                <component.icon className="h-4 w-4 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground truncate">
                  {component.name}
                </div>
                <div className="text-xs text-muted-foreground/80 line-clamp-2 leading-tight">
                  {component.description}
                </div>
              </div>
            </div>

            {/* Tags */}
            {component.tags && component.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {component.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0.5">
                    {tag}
                  </Badge>
                ))}
                {component.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    +{component.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Drag Indicator */}
            <div className={`
              absolute top-2 right-2 transition-all duration-200
              ${isDragging ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-60 scale-75'}
            `}>
              <Move className="h-3 w-3 text-muted-foreground" />
            </div>

            {/* Add Indicator */}
            <div className={`
              absolute -top-1 -right-1 transition-all duration-200
              ${isDragging ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-75'}
            `}>
              <div className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                <Plus className="h-3 w-3" />
              </div>
            </div>

            {/* Hover Glow Effect */}
            <div className={`
              absolute inset-0 rounded-lg transition-all duration-200 pointer-events-none
              ${isDragging ? 'bg-primary/10 border border-primary/30' : 'group-hover:bg-primary/5'}
            `} />
          </div>
        </TooltipTrigger>
        
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-2">
            <div className="font-medium">{component.name}</div>
            <div className="text-sm text-muted-foreground">{component.description}</div>
            {component.tags && (
              <div className="flex flex-wrap gap-1">
                {component.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <div className="text-xs text-muted-foreground border-t pt-2">
              Drag to canvas to add this component
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DraggableComponent;