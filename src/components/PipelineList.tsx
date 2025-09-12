import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Play, 
  GitBranch, 
  Clock, 
  MoreVertical,
  GitCommit,
  User,
  Timer,
  ExternalLink,
  Eye,
  History,
  Activity
} from "lucide-react";
import type { PipelineItem } from "@/services/pipelines";

const statusConfig = {
  success: { 
    color: "text-emerald-600 dark:text-emerald-400", 
    bg: "bg-emerald-50 dark:bg-emerald-950/30", 
    border: "border-emerald-200 dark:border-emerald-800/50",
    dot: "bg-emerald-500",
    leftBorder: "border-l-emerald-500 dark:border-l-emerald-400"
  },
  running: { 
    color: "text-amber-600 dark:text-amber-400", 
    bg: "bg-amber-50 dark:bg-amber-950/30", 
    border: "border-amber-200 dark:border-amber-800/50",
    dot: "bg-amber-500 animate-pulse",
    leftBorder: "border-l-amber-500 dark:border-l-amber-400"
  },
  failed: { 
    color: "text-red-600 dark:text-red-400", 
    bg: "bg-red-50 dark:bg-red-950/30", 
    border: "border-red-200 dark:border-red-800/50",
    dot: "bg-red-500",
    leftBorder: "border-l-red-500 dark:border-l-red-400"
  },
  idle: { 
    color: "text-zinc-500 dark:text-zinc-400", 
    bg: "bg-zinc-50 dark:bg-zinc-900/30", 
    border: "border-zinc-200 dark:border-zinc-700/50",
    dot: "bg-zinc-400",
    leftBorder: "border-l-zinc-400 dark:border-l-zinc-500"
  },
};

export default function PipelineList({
  items,
  onTrigger,
  onViewDetails,
}: {
  items: PipelineItem[];
  onTrigger?: (item: PipelineItem) => void;
  onViewDetails?: (item: PipelineItem) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((pipeline) => {
        const itemId = `${pipeline.name}-${pipeline.branch}`;
        const config = statusConfig[pipeline.status] || statusConfig.idle;
        
        return (
          <div 
            key={itemId}
            className={`group border border-zinc-200/60 dark:border-zinc-800/60 border-l-4 border-l-zinc-200/60 dark:border-l-zinc-800/60 hover:${config.leftBorder.replace('border-l-', 'border-l-')} rounded-r-lg bg-white dark:bg-zinc-900 hover:shadow-md hover:border-zinc-300/80 dark:hover:border-zinc-700/80 transition-all duration-200 overflow-hidden`}
          >
            {/* Main Content - Split Layout */}
            <div className="flex items-center justify-between p-4">
              {/* Left Side - Pipeline Info */}
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {pipeline.name}
                  </h3>
                  <div className={`px-2 py-0.5 rounded text-xs font-medium border ${config.bg} ${config.color} ${config.border}`}>
                    {pipeline.status}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                  <GitBranch className="size-3" />
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {pipeline.repository || "repo"}
                  </span>
                  <span className="text-zinc-400">/</span>
                  <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                    {pipeline.branch || "main"}
                  </span>
                </div>

                {pipeline.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                    {pipeline.description}
                  </p>
                )}
              </div>

              {/* Right Side - Stacked Metrics & Actions */}
              <div className="flex items-center gap-6 flex-shrink-0">
                {/* Metrics - 2 Vertical Stacks */}
                <div className="hidden md:flex items-center gap-6">
                  {/* Stack 1: Commit & User */}
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1.5 mb-1">
                      <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">a3b4c5d</span>
                      <GitCommit className="size-3 text-zinc-400" />
                    </div>
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-xs text-zinc-700 dark:text-zinc-300 truncate max-w-20">john.doe</span>
                      <User className="size-3 text-zinc-400" />
                    </div>
                  </div>

                  {/* Stack 2: Duration & Last Run */}
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1.5 mb-1">
                      <span className="font-medium text-xs text-zinc-900 dark:text-zinc-100">2m 34s</span>
                      <Timer className="size-3 text-zinc-400" />
                    </div>
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-xs text-zinc-700 dark:text-zinc-300">{pipeline.lastRun || "Never"}</span>
                      <Clock className="size-3 text-zinc-400" />
                    </div>
                  </div>
                </div>

                {/* Actions - Vertical Stack */}
                <div className="flex flex-col gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails?.(pipeline)}
                    className="h-7 w-7 p-0 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    <ExternalLink className="size-3" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                        <MoreVertical className="size-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                      <DropdownMenuItem 
                        onClick={() => onTrigger?.(pipeline)}
                        disabled={pipeline.status === 'running'}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-900"
                      >
                        <Play className="size-4 mr-2" />
                        {pipeline.status === 'running' ? 'Running...' : 'Run Pipeline'}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                        <Eye className="size-4 mr-2" />
                        View Logs
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                        <History className="size-4 mr-2" />
                        Run History
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Mobile Metrics - Show when desktop metrics are hidden */}
            <div className="md:hidden px-4 pb-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <GitCommit className="size-3 text-zinc-400" />
                  <span className="font-mono text-zinc-600 dark:text-zinc-400">a3b4c5d</span>
                </div>
                <div className="flex items-center gap-1">
                  <Timer className="size-3 text-zinc-400" />
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">2m 34s</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="size-3 text-zinc-400" />
                  <span className="text-zinc-700 dark:text-zinc-300">john.doe</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="size-3 text-zinc-400" />
                  <span className="text-zinc-700 dark:text-zinc-300">{pipeline.lastRun || "Never"}</span>
                </div>
              </div>
            </div>

            {/* Pipeline Steps - Shadcn Accordion */}
            <Accordion type="single" collapsible className="border-t border-zinc-100 dark:border-zinc-800">
              <AccordionItem value="steps" className="border-none">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                  <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    <Activity className="size-4" />
                    <span>Steps</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      (4 • 3 passed)
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3">
                  <div className="space-y-2">
                    {[
                      { name: 'Source', status: 'success', duration: '8s' },
                      { name: 'Build', status: 'success', duration: '1m 20s' },
                      { name: 'Test', status: 'success', duration: '45s' },
                      { name: 'Deploy', status: pipeline.status === 'running' ? 'running' : 'success', duration: '24s' }
                    ].map((step, index) => {
                      const stepConfig = statusConfig[step.status as keyof typeof statusConfig] || statusConfig.idle;
                      return (
                        <div key={step.name} className="flex items-center justify-between py-2 px-3 bg-zinc-50/80 dark:bg-zinc-900/40 rounded">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 w-4">{index + 1}</span>
                            <div className={`size-1.5 rounded-full ${stepConfig.dot}`} />
                            <span className="text-sm text-zinc-900 dark:text-zinc-100">{step.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{step.duration}</span>
                            <div className={`px-1.5 py-0.5 rounded text-xs font-medium ${stepConfig.bg} ${stepConfig.color}`}>
                              {step.status}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        );
      })}
      
      {items.length === 0 && (
        <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
          <div className="size-10 mx-auto mb-3 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <GitBranch className="size-5" />
          </div>
          <h3 className="font-medium text-sm mb-1">No pipelines configured</h3>
          <p className="text-xs">Create your first CI/CD pipeline to get started</p>
        </div>
      )}
    </div>
  );
}
