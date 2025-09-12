import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center bg-muted rounded-lg p-1">
        <div className="w-8 h-8 rounded-md bg-background/50" />
        <div className="w-8 h-8 rounded-md bg-background/50" />
        <div className="w-8 h-8 rounded-md bg-background/50" />
      </div>
    );
  }

  const themes = [
    { name: "light", icon: Sun, label: "Light" },
    { name: "dark", icon: Moon, label: "Dark" },
    { name: "system", icon: Monitor, label: "System" },
  ];

  return (
    <div className="flex items-center bg-muted rounded-lg p-1 transition-all duration-300">
      {themes.map(({ name, icon: Icon, label }) => (
        <Button
          key={name}
          variant="ghost"
          size="sm"
          onClick={() => setTheme(name)}
          className={cn(
            "h-8 w-8 p-0 rounded-md transition-all duration-200 hover:bg-background/80",
            theme === name && "bg-background shadow-sm text-foreground"
          )}
          title={label}
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}