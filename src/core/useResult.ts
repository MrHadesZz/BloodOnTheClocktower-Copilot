import { useEffect, useState } from "react";
import type { Branch, WorkspaceData } from "./model";
import type { Analysis } from "./analysis";
import type { Query } from "./solver";

interface Settled {
  events: WorkspaceData["events"];
  branch: Branch;
  query: Query;
  analysis?: Analysis;
  error?: string;
}

export function useResult(data: WorkspaceData, query: Query) {
  const branch =
    data.branches.find((item) => item.id === data.activeBranchId) ??
    data.branches[0];
  const [settled, setSettled] = useState<Settled | null>(null);

  useEffect(() => {
    const worker = new Worker(new URL("./solver.worker.ts", import.meta.url), {
      type: "module",
    });
    const requestId = crypto.randomUUID();
    worker.onmessage = (
      event: MessageEvent<{
        requestId: string;
        analysis?: Analysis;
        error?: string;
      }>,
    ) => {
      if (event.data.requestId !== requestId) return;
      setSettled({
        events: data.events,
        branch,
        query,
        analysis: event.data.analysis,
        error: event.data.error,
      });
      worker.terminate();
    };
    worker.onerror = (event) => {
      setSettled({
        events: data.events,
        branch,
        query,
        error: event.message || "推理 Worker 加载失败",
      });
      worker.terminate();
    };
    worker.postMessage({
      requestId,
      events: data.events,
      assumptions: branch.assumptions,
      revision: branch.baseRevision,
      query,
    });
    return () => worker.terminate();
  }, [data.events, branch, query]);

  const current =
    settled?.events === data.events &&
    settled.branch === branch &&
    settled.query === query
      ? settled
      : null;
  return {
    branch,
    result: current?.analysis?.result ?? null,
    essential: current?.analysis?.essential ?? [],
    pending: current === null,
    error: current?.error ?? null,
  };
}
