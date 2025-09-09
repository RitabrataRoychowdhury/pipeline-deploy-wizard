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
      className="group relative overflow-hidden"
    >
      {/* Gradient accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${getGradient()}`} />
      
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            {trend && (
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                trend === "up" 
                  ? "bg-success/10 text-success" 
                  : trend === "down" 
                  ? "bg-destructive/10 text-destructive" 
                  : "bg-muted text-muted-foreground"
              }`}>
                {trend === "up" ? "↗ UP" : trend === "down" ? "↘ DOWN" : "→ STABLE"}
              </span>
            )}
          </div>
          
          <div className="space-y-2">
            <p className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
              {value}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        
        <div className={`p-4 rounded-xl ${getColorClasses()} group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </EnhancedCard>
  );
};

export default StatsCard;