declare const __Z3_ENGINE_VERSION__: string;
import type {
  SetupQueryInput,
  SetupQueryResult,
  TimelineQueryInput,
  ObservedQueryInput,
} from "./symbolicSetup";

import type { ConflictAnalysis, ConflictOptions } from "./conflict";
import type { FactHistoryAnalysis, FactHistoryOptions } from "./factHistory";
import type { ClaimAnalysis, ClaimAnalysisOptions } from "./claimAnalysis";
import type { ClaimConditionDiagnosis } from "./claimConditionAnalysis";
import type { StandardWorkspace } from "./standardWorkspace";

export interface Z3ProbeResult {
  status: string;
  value: string;
  version: string;
}

type Request =
  | {
      kind: "fact_history";
      workspace: StandardWorkspace;
      options?: FactHistoryOptions;
    }
  | {
      kind: "conflict_query" | "claim_analysis";
      workspace: StandardWorkspace;
      options?: ClaimAnalysisOptions;
    }
  | {
      kind: "claim_diagnosis";
      workspace: StandardWorkspace;
      seats: number[];
      options?: ClaimAnalysisOptions;
    }
  | { kind: "probe" }
  | { kind: "setup_query"; input: SetupQueryInput }
  | { kind: "timeline_query"; input: TimelineQueryInput }
  | { kind: "observed_query"; input: ObservedQueryInput };
function requestZ3<T>(
  request: Request,
  timeoutMs: number,
  signal?: AbortSignal,
  onBudget?: (progress: T) => T,
  onProgress?: (progress: T) => void,
): Promise<T> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("已取消查询", "AbortError"));
      return;
    }
    if (!crossOriginIsolated) {
      reject(new Error("此浏览器或站点缺少运行 Z3 所需的跨源隔离。"));
      return;
    }
    const worker = new Worker(`/z3/worker-host.js?v=${__Z3_ENGINE_VERSION__}`);
    const requestId = crypto.randomUUID();
    let settled = false;
    let progress: T | undefined;
    const abort = () => finish(null, undefined, true);
    const finish = (value: T | null, error?: string, cancelled = false) => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener("abort", abort);
      clearTimeout(timer);
      worker.terminate();
      if (cancelled) reject(new DOMException("已取消查询", "AbortError"));
      else if (error) reject(new Error(error));
      else resolve(value as T);
    };
    const timer = setTimeout(
      () =>
        progress !== undefined && onBudget
          ? finish(onBudget(progress))
          : finish(null, "Z3 查询超时，结果未知。"),
      timeoutMs,
    );
    worker.onmessage = (
      event: MessageEvent<{
        requestId: string;
        result?: T;
        progress?: T;
        error?: string;
      }>,
    ) => {
      if (settled || event.data.requestId !== requestId) return;
      if (event.data.progress !== undefined) {
        progress = event.data.progress;
        onProgress?.(progress);
      } else finish(event.data.result ?? null, event.data.error);
    };
    worker.onerror = (event) =>
      finish(null, event.message || "Z3 Worker 加载失败。");
    signal?.addEventListener("abort", abort, { once: true });
    worker.postMessage({ ...request, requestId });
  });
}

export const probeZ3 = (timeoutMs = 30000) =>
  requestZ3<Z3ProbeResult>({ kind: "probe" }, timeoutMs);
export const queryZ3Setup = (input: SetupQueryInput) =>
  requestZ3<SetupQueryResult>(
    { kind: "setup_query", input },
    Math.max(5000, (input.timeoutMs ?? 2000) + 3000),
  );

export const queryZ3Timeline = (input: TimelineQueryInput) =>
  requestZ3<SetupQueryResult>(
    { kind: "timeline_query", input },
    Math.max(5000, (input.timeoutMs ?? 2000) + 3000),
  );

export const queryZ3Observed = (input: ObservedQueryInput) =>
  requestZ3<SetupQueryResult>(
    { kind: "observed_query", input },
    Math.max(5000, (input.timeoutMs ?? 2000) + 3000),
  );

export const queryZ3Conflict = (
  workspace: StandardWorkspace,
  options: ConflictOptions = {},
  signal?: AbortSignal,
) =>
  requestZ3<ConflictAnalysis>(
    { kind: "conflict_query", workspace, options },
    Math.min(Math.max(options.budgetMs ?? 15000, 0), 60000) + 5000,
    signal,
    (progress) => ({
      ...progress,
      status: "partial",
      reason: "定位达到时间预算，保留已确认的冲突；最小性未验证完成。",
    }),
  );

export const queryZ3FactHistory = (
  workspace: StandardWorkspace,
  options: FactHistoryOptions = {},
  signal?: AbortSignal,
  onProgress?: (progress: FactHistoryAnalysis) => void,
) =>
  requestZ3<FactHistoryAnalysis>(
    { kind: "fact_history", workspace, options },
    Math.min(Math.max(options.budgetMs ?? 30000, 0), 60000) + 5000,
    signal,
    (progress) => ({
      ...progress,
      complete: false,
      status: progress.boundary ? "partial" : "unknown",
      reason: "阶段定位达到时间预算，保留已确认的证据；最早边界尚未验证。",
    }),
    onProgress,
  );

export const queryZ3Claims = (
  workspace: StandardWorkspace,
  options: ClaimAnalysisOptions = {},
  signal?: AbortSignal,
  onProgress?: (progress: ClaimAnalysis) => void,
) =>
  requestZ3<ClaimAnalysis>(
    { kind: "claim_analysis", workspace, options },
    Math.min(Math.max(options.budgetMs ?? 30000, 0), 60000) + 5000,
    signal,
    (progress) => ({
      ...progress,
      complete: false,
      repairSearchComplete: false,
      reason: "分析达到时间预算，保留已验证的组合。",
    }),
    onProgress,
  );

export const queryZ3ClaimConditions = (
  workspace: StandardWorkspace,
  seats: number[],
  options: ClaimAnalysisOptions = {},
  signal?: AbortSignal,
  onProgress?: (progress: ClaimConditionDiagnosis) => void,
) =>
  requestZ3<ClaimConditionDiagnosis>(
    { kind: "claim_diagnosis", workspace, seats, options },
    Math.min(Math.max(options.budgetMs ?? 20000, 0), 60000) + 5000,
    signal,
    (progress) => ({
      ...progress,
      complete: false,
      searchComplete: false,
      reason: "细查达到时间预算，保留已验证的解释。",
    }),
    onProgress,
  );
