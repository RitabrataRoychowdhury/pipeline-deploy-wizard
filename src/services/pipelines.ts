import http from "@/api/http";
import { ENDPOINTS } from "@/api/endpoints";
import { useQuery } from "@tanstack/react-query";
import demoPipelines from "@/data/demo/pipelines.json";

export type PipelineStatus = "success" | "running" | "failed" | "idle";

export interface PipelineItem {
  name: string;
  description: string;
  status: PipelineStatus;
  lastRun?: string;
  repository?: string;
  branch?: string;
  totalRuns?: number | string;
  successRate?: string;
}

export type PipelinesSource = "demo" | "api";

async function fetchPipelines(source: PipelinesSource = "demo"): Promise<PipelineItem[]> {
  if (source === "demo") {
    // Local JSON import; mimics API structure
    return demoPipelines as PipelineItem[];
    // Alternatively: return (await http.get("/pipelines/demo")).data
  }
  const res = await http.get(ENDPOINTS.pipelines.list);
  return res.data as PipelineItem[];
}

export function usePipelinesQuery(source: PipelinesSource = "demo") {
  return useQuery({
    queryKey: ["pipelines", source],
    queryFn: () => fetchPipelines(source),
    staleTime: 60_000,
  });
}
