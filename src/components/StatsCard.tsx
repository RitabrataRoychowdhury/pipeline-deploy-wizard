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
    <div className="group relative overflow-hidden rounded-3xl backdrop-blur-xl bg-background/40 border border-border/40 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 p-6">
      {/* Liquid glass shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/60 via-background/30 to-background/60 backdrop-blur-2xl" />
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 ${getGradient()}`} />
      
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${getGradient()} opacity-80`} />
      
      <div className="flex items-start justify-between relative z-10 gap-6">
        <div className="space-y-4 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            {trend && (
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm whitespace-nowrap ${
                trend === "up" 
                  ? "bg-success/20 text-success border border-success/30" 
                  : trend === "down" 
                  ? "bg-destructive/20 text-destructive border border-destructive/30" 
                  : "bg-muted/20 text-muted-foreground border border-muted/30"
              } transition-all duration-200 group-hover:scale-105`}>
                {trend === "up" ? "↗ UP" : trend === "down" ? "↘ DOWN" : "→"}
              </span>
            )}
          </div>
          
          <div className="space-y-2">
            <p className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 tracking-tight">
              {value}
            </p>
            <p className="text-xs text-muted-foreground leading-snug font-medium">
              {description}
            </p>
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <div className={`p-3 rounded-2xl border backdrop-blur-sm ${
            color === 'primary' ? 'bg-primary/10 border-primary/20 text-primary' :
            color === 'success' ? 'bg-success/10 border-success/20 text-success' :
            color === 'warning' ? 'bg-warning/10 border-warning/20 text-warning' :
            color === 'info' ? 'bg-info/10 border-info/20 text-info' :
            'bg-muted/10 border-muted/20 text-muted-foreground'
          } group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;