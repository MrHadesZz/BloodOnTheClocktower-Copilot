import { init } from "z3-solver";
import {
  queryInitialSetup,
  queryTimelineWorlds,
  queryObservedTimeline,
  type SetupQueryInput,
  type TimelineQueryInput,
  type ObservedQueryInput,
} from "./symbolicSetup";

import { analyzeStandardConflict, type ConflictAnalysis } from "./conflict";
import {
  analyzeFactHistory,
  type FactHistoryAnalysis,
  type FactHistoryOptions,
} from "./factHistory";
import {
  analyzeClaims,
  type ClaimAnalysis,
  type ClaimAnalysisOptions,
} from "./claimAnalysis";
import {
  analyzeClaimConditions,
  type ClaimConditionDiagnosis,
} from "./claimConditionAnalysis";
import { solveStandardWorkspace } from "./standardQuery";
import type { StandardWorkspace } from "./standardWorkspace";

export interface EngineRequest {
  requestId: string;
  kind:
    | "probe"
    | "setup_query"
    | "timeline_query"
    | "observed_query"
    | "conflict_query"
    | "fact_history"
    | "claim_analysis"
    | "claim_diagnosis";
  workspace?: StandardWorkspace;
  seats?: number[];
  options?: ClaimAnalysisOptions & FactHistoryOptions;
  input?: SetupQueryInput | TimelineQueryInput | ObservedQueryInput;
}

/** Bundled as one classic-worker script so Emscripten can spawn pthreads. */
export async function handle(
  request: EngineRequest,
  onProgress?: (
    analysis:
      | ConflictAnalysis
      | ClaimAnalysis
      | ClaimConditionDiagnosis
      | FactHistoryAnalysis,
  ) => void,
) {
  if (request.kind === "fact_history") {
    if (!request.workspace) throw new Error("缺少阶段核对输入。");
    return analyzeFactHistory(
      request.workspace,
      { setup: queryInitialSetup, observed: queryObservedTimeline },
      request.options,
      onProgress,
    );
  }
  if (request.kind === "claim_diagnosis") {
    if (!request.workspace || !request.seats) throw new Error("缺少细查输入。");
    return analyzeClaimConditions(
      request.workspace,
      request.seats,
      async (workspace, timeoutMs) =>
        (
          await solveStandardWorkspace(
            workspace,
            {
              setup: queryInitialSetup,
              observed: queryObservedTimeline,
            },
            timeoutMs,
          )
        ).answer,
      request.options,
      onProgress,
    );
  }
  if (request.kind === "claim_analysis") {
    if (!request.workspace) throw new Error("缺少声称分析输入。");
    return analyzeClaims(
      request.workspace,
      async (workspace, timeoutMs) =>
        (
          await solveStandardWorkspace(
            workspace,
            { setup: queryInitialSetup, observed: queryObservedTimeline },
            timeoutMs,
          )
        ).answer,
      request.options,
      onProgress,
    );
  }
  if (request.kind === "conflict_query") {
    if (!request.workspace) throw new Error("缺少冲突定位输入。");
    return analyzeStandardConflict(
      request.workspace,
      async (workspace, timeoutMs) =>
        (
          await solveStandardWorkspace(
            workspace,
            { setup: queryInitialSetup, observed: queryObservedTimeline },
            timeoutMs,
          )
        ).answer,
      request.options,
      onProgress,
    );
  }
  if (request.kind === "setup_query") {
    if (!request.input) throw new Error("缺少设置查询输入。");
    return queryInitialSetup(request.input);
  }
  if (request.kind === "observed_query") {
    if (!request.input || !("phases" in request.input))
      throw new Error("缺少封闭观察查询输入。");
    return queryObservedTimeline(request.input);
  }
  if (request.kind === "timeline_query") {
    if (!request.input || !("timeline" in request.input))
      throw new Error("缺少动态查询输入。");
    return queryTimelineWorlds(request.input);
  }
  const { Context, getVersionString } = await init({
    locateFile: (file: string) => `/z3/${file}`,
    mainScriptUrlOrBlob: "/z3/z3-built.js",
  });
  const { Solver, Int } = new Context("browser-probe");
  const value = Int.const("value");
  const solver = new Solver();
  solver.add(value.eq(7));
  return {
    status: await solver.check(),
    value: solver.model().eval(value).toString(),
    version: getVersionString(),
  };
}
