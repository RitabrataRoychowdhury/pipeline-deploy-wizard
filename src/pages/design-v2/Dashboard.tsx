import { useState, useMemo } from "react";
import { usePipelinesQuery } from "@/services/pipelines";
import PipelineList from "@/components/PipelineList";
import PipelineSimpleCard from "@/components/PipelineSimpleCard";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  RefreshCw, 
  Filter, 
  Plus,
  LayoutList,
  LayoutGrid,
  CheckCircle,
  Clock,
  XCircle,
  Pause
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Skeleton components
function PipelineListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border border-zinc-200/60 dark:border-zinc-800/60 rounded-r-lg bg-white dark:bg-zinc-900 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-6">
              <div className="flex items-center gap-3 mb-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="size-3" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
            <div className="flex items-center gap-6 flex-shrink-0">
              <div className="hidden md:flex items-center gap-6">
                <div className="text-right">
                  <Skeleton className="h-3 w-16 mb-1 ml-auto" />
                  <Skeleton className="h-3 w-12 ml-auto" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-3 w-10 mb-1 ml-auto" />
                  <Skeleton className="h-3 w-14 ml-auto" />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-7 w-7" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PipelineCardsSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border border-zinc-200/60 dark:border-zinc-800/60 rounded-lg bg-white dark:bg-zinc-900 p-4">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DesignV2Dashboard() {
  const { data, isLoading, error, refetch, isFetching } = usePipelinesQuery("demo");
  const [view, setView] = useState<"list" | "cards">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter and search pipelines
  const filteredData = useMemo(() => {
    if (!data) return [];
    
    let filtered = [...data];
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    
    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.repository?.toLowerCase().includes(query) ||
        p.branch?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [data, statusFilter, searchQuery]);

  // Pipeline status counts
  const statusCounts = useMemo(() => {
    if (!data) return { all: 0, success: 0, running: 0, failed: 0, idle: 0 };
    
    const counts = { all: data.length, success: 0, running: 0, failed: 0, idle: 0 };
    data.forEach(p => {
      if (p.status in counts) {
        counts[p.status as keyof typeof counts]++;
      }
    });
    return counts;
  }, [data]);

  const statusOptions = [
    { value: "all", label: "All", count: statusCounts.all, icon: null },
    { value: "success", label: "Success", count: statusCounts.success, icon: CheckCircle, color: "text-emerald-600" },
    { value: "running", label: "Running", count: statusCounts.running, icon: Clock, color: "text-amber-600" },
    { value: "failed", label: "Failed", count: statusCounts.failed, icon: XCircle, color: "text-red-600" },
    { value: "idle", label: "Idle", count: statusCounts.idle, icon: Pause, color: "text-zinc-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Pipelines Overview
            </h1>
            {!isLoading && data && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {filteredData.length} of {data.length} pipeline{data.length !== 1 ? 's' : ''}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            )}
          </div>
          
          {/* Quick Stats */}
          {!isLoading && statusCounts.running > 0 && (
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                {statusCounts.running} running
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9"
          >
            <RefreshCw className={`size-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? "Refreshing..." : "Refresh"}
          </Button>
          
          <Button size="sm" className="h-9">
            <Plus className="size-4 mr-2" />
            New Pipeline
          </Button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 flex-1 max-w-2xl">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-zinc-400" />
            <Input
              placeholder="Search pipelines, repositories, branches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <Filter className="size-4" />
                Status
                {statusFilter !== "all" && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {statusOptions.find(opt => opt.value === statusFilter)?.count}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {Icon && <Icon className={`size-4 ${option.color}`} />}
                      <span>{option.label}</span>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {option.count}
                    </Badge>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* View Toggle */}
        <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as any)}>
          <ToggleGroupItem value="list" aria-label="List view" className="h-9 w-9 p-0">
            <LayoutList className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="cards" aria-label="Card view" className="h-9 w-9 p-0">
            <LayoutGrid className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Content */}
      {isLoading && (
        <div>
          {view === "list" ? <PipelineListSkeleton /> : <PipelineCardsSkeleton />}
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <XCircle className="size-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Failed to load pipelines
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">
            There was an error loading your pipelines. Please try again.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="size-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}

      {!isLoading && !error && filteredData.length === 0 && data && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="size-16 mx-auto mb-4 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            {searchQuery || statusFilter !== "all" ? (
              <Search className="size-8 text-zinc-400" />
            ) : (
              <LayoutList className="size-8 text-zinc-400" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            {searchQuery || statusFilter !== "all" ? "No matching pipelines" : "No pipelines configured"}
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">
            {searchQuery || statusFilter !== "all" 
              ? "Try adjusting your search or filter criteria."
              : "Create your first CI/CD pipeline to get started."
            }
          </p>
          {(searchQuery || statusFilter !== "all") && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {!isLoading && !error && filteredData.length > 0 && (
        <>
          {view === "list" && (
            <PipelineList 
              items={filteredData} 
              onTrigger={() => { /* demo */ }} 
              onViewDetails={() => { /* demo */ }}
            />
          )}
          {view === "cards" && (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {filteredData.map((p) => (
                <PipelineSimpleCard 
                  key={`${p.name}-${p.branch}`} 
                  item={p} 
                  onTrigger={() => { /* demo */ }} 
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
