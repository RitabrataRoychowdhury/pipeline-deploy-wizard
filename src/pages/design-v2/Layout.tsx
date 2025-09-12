import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { LayoutGrid, History, Settings, GitBranch } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

function NavItem({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  const location = useLocation();
  const active = location.pathname === to || location.pathname.startsWith(to);
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild data-active={active} className={cn(active && "bg-sidebar-accent text-sidebar-accent-foreground")}> 
        <NavLink to={to} className="flex items-center gap-2" title={label}>
          <Icon className="size-4" />
          <span className="group-data-[collapsible=icon]:hidden">{label}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export default function DesignV2Layout() {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex w-full">
        <Sidebar variant="floating" collapsible="icon" className="[&_[data-sidebar=menu]]:gap-0">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-3 py-2 text-sm">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary/15 text-primary font-bold">R</div>
              <span className="font-semibold group-data-[collapsible=icon]:hidden">Rust CI</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu className="px-2 py-1">
              <NavItem to="/design-v2/dashboard" icon={LayoutGrid} label="Dashboard" />
              <NavItem to="/design-v2/pipelines" icon={GitBranch} label="Pipelines" />
              <NavItem to="/design-v2/history" icon={History} label="History" />
              <NavItem to="/design-v2/settings" icon={Settings} label="Settings" />
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter />
        </Sidebar>
        <SidebarInset>
          <TooltipProvider>
            <header className="sticky top-0 z-10 border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/50">
              <div className="flex h-12 items-center gap-2 px-3">
                <SidebarTrigger />
                <div className="font-semibold">Design v2</div>
                <div className="ml-auto"><ThemeToggle /></div>
              </div>
            </header>
            <div className="p-4">
              <Outlet />
            </div>
          </TooltipProvider>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
