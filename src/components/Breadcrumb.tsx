import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const routeLabels: Record<string, string> = {
  '/': 'Home',
  '/dashboard': 'Dashboard',
  '/pipelines': 'Pipelines',
  '/pipelines/builder': 'Pipeline Builder',
  '/repositories': 'Repositories',
  '/settings': 'Settings'
};

const routeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  '/': Home,
  '/dashboard': Home
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  const location = useLocation();
  
  // Generate breadcrumb items from current path if not provided
  const breadcrumbItems = items || generateBreadcrumbItems(location.pathname);

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}>
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        const Icon = item.icon;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            )}
            
            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                {Icon && <Icon className="h-4 w-4" />}
                {item.label}
              </Link>
            ) : (
              <span className={cn(
                "flex items-center gap-1",
                isLast ? "text-foreground font-medium" : "text-muted-foreground"
              )}>
                {Icon && <Icon className="h-4 w-4" />}
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

function generateBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];

  // Always start with home/dashboard
  items.push({
    label: 'Dashboard',
    href: '/dashboard',
    icon: routeIcons['/dashboard']
  });

  // Build path segments
  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    
    const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const icon = routeIcons[currentPath];
    
    // Don't add dashboard again if we're already there
    if (currentPath === '/dashboard' && items.length > 0) {
      continue;
    }
    
    items.push({
      label,
      href: currentPath,
      icon
    });
  }

  return items;
}