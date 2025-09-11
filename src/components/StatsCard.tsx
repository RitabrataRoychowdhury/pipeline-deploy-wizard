import { EnhancedCard } from "@/components/ui/enhanced-card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  color?: "success" | "warning" | "info" | "primary";
}

const StatsCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  color = "primary" 
}: StatsCardProps) => {
  const getColorClasses = () => {
    switch (color) {
      case "success":
        return "text-success bg-success/10 border-success/20";
      case "warning":
        return "text-warning bg-warning/10 border-warning/20";
      case "info":
        return "text-info bg-info/10 border-info/20";
      default:
        return "text-primary bg-primary/10 border-primary/20";
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-success";
      case "down":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getGradient = () => {
    switch (color) {
      case "success":
        return "bg-gradient-success";
      case "warning":
        return "bg-gradient-warning";
      case "info":
        return "bg-gradient-info";
      default:
        return "bg-gradient-primary";
    }
  };

  return (
    <EnhancedCard
      variant={color as any}
      interactive
      className="group relative overflow-hidden backdrop-blur-sm bg-card/80 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Gradient accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${getGradient()} opacity-80`} />
      
      {/* Subtle glow effect */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${getGradient()}`} />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-4 flex-1">
          <div className="flex items-center space-x-3">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
              {title}
            </p>
            {trend && (
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                trend === "up" 
                  ? "bg-success/15 text-success border border-success/20" 
                  : trend === "down" 
                  ? "bg-destructive/15 text-destructive border border-destructive/20" 
                  : "bg-muted/15 text-muted-foreground border border-muted/20"
              } transition-all duration-200`}>
                {trend === "up" ? "↗ UP" : trend === "down" ? "↘ DOWN" : "→ STABLE"}
              </span>
            )}
          </div>
          
          <div className="space-y-3">
            <p className="text-4xl font-bold text-foreground group-hover:text-primary transition-all duration-300 tracking-tight">
              {value}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              {description}
            </p>
          </div>
        </div>
        
        <div className="flex-shrink-0 ml-4">
          <div className={`p-3 rounded-xl ${
            color === 'primary' ? 'bg-primary/10' :
            color === 'success' ? 'bg-success/10' :
            color === 'warning' ? 'bg-warning/10' :
            color === 'info' ? 'bg-info/10' :
            'bg-muted/10'
          } group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`h-6 w-6 ${getTrendColor()}`} />
          </div>
        </div>
      </div>
    </EnhancedCard>
  );
};

export default StatsCard;