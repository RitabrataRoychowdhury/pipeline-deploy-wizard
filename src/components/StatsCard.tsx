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
      className="group relative overflow-hidden backdrop-blur-sm bg-gradient-card border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
    >
      {/* Enhanced gradient accent */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${getGradient()} opacity-90 shadow-sm`} />
      
      {/* Professional glow effect */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 ${getGradient()}`} />
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_50%_50%,hsl(var(--foreground)),transparent_70%)]" />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-5 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.1em] leading-none">
              {title}
            </p>
            {trend && (
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm ${
                trend === "up" 
                  ? "bg-success/20 text-success border border-success/30 shadow-sm" 
                  : trend === "down" 
                  ? "bg-destructive/20 text-destructive border border-destructive/30 shadow-sm" 
                  : "bg-muted/20 text-muted-foreground border border-muted/30 shadow-sm"
              } transition-all duration-200 group-hover:scale-105`}>
                {trend === "up" ? "↗ TRENDING UP" : trend === "down" ? "↘ IMPROVING" : "→ STABLE"}
              </span>
            )}
          </div>
          
          <div className="space-y-3">
            <p className="text-4xl font-bold text-foreground group-hover:text-primary transition-all duration-300 tracking-tight leading-none">
              {value}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              {description}
            </p>
          </div>
        </div>
        
        <div className="flex-shrink-0 ml-6">
          <div className={`p-4 rounded-xl border backdrop-blur-sm ${
            color === 'primary' ? 'bg-primary/10 border-primary/20 text-primary' :
            color === 'success' ? 'bg-success/10 border-success/20 text-success' :
            color === 'warning' ? 'bg-warning/10 border-warning/20 text-warning' :
            color === 'info' ? 'bg-info/10 border-info/20 text-info' :
            'bg-muted/10 border-muted/20 text-muted-foreground'
          } group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    </EnhancedCard>
  );
};

export default StatsCard;