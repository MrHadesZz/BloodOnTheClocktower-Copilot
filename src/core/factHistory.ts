import type { GameTime } from "./model";
import {
  prepareStandardObservedQuery,
  prepareStandardSetupQuery,
  visibleStandardEvents,
  type StandardWorkspace,
} from "./standardWorkspace";
import type { ConflictOptions } from "./conflict";
import type { StandardSolvers } from "./standardQuery";
import type { SetupQueryResult, SetupWitness } from "./symbolicSetup";

export interface FactHistoryOptions extends ConflictOptions {
  /** Default: retain adopted premises, activating later reports at their own phase. */
  includeAssumptions?: boolean;
}
export interface FactHistoryStep {
  time: GameTime;
  status: "compatible" | "conflict" | "unknown";
  sourceIds: string[];
  reason?: string;
}
export interface FactHistoryAnalysis {
  status: "located" | "partial" | "compatible" | "unknown" | "not_ready";
  revision: number;
  assumptionIds: string[];
  checks: number;
  complete: boolean;
  rulesetHash?: string;
  steps: FactHistoryStep[];
  /** A confirmed conflicting prefix; only `located` certifies the earliest boundary. */
  boundary?: GameTime;
  sourceIds: string[];
  previous?: { time: GameTime; witness: SetupWitness };
  witness?: SetupWitness;
  reason?: string;
}

const order = (time: GameTime) =>
  (time.cycle - 1) * 2 + (time.phase === "day" ? 1 : 0);
const limit = (value: number | undefined, fallback: number, max: number) =>
  Number.isFinite(value) ? Math.max(0, Math.min(value!, max)) : fallback;

/** Check whole, closed history prefixes. Never delete facts within a phase or mutate branches. */
export async function analyzeFactHistory(
  workspace: StandardWorkspace,
  solvers: StandardSolvers,
  options: FactHistoryOptions = {},
  onProgress?: (analysis: FactHistoryAnalysis) => void,
): Promise<FactHistoryAnalysis> {
  const branch = workspace.branches.find(
    (b) => b.id === workspace.activeBranchId,
  );
  if (!branch) throw new Error("活动分支不存在。");
  const assumptionIds =
    options.includeAssumptions === false ? [] : [...branch.assumptionIds];
  const snapshot: StandardWorkspace = {
    ...workspace,
    query: { ...workspace.query, stage: "initial" },
    branches: workspace.branches.map((b) =>
      b.id === branch.id ? { ...b, assumptionIds } : b,
    ),
  };
  const visible = visibleStandardEvents(
    snapshot,
    snapshot.perspectiveSeat,
    branch.baseRevision,
  );
  const started = performance.now();
  const budget = limit(options.budgetMs, 30000, 60000);
  const maxChecks = Math.floor(limit(options.maxChecks, 40, 200));
  const steps = new Map<number, FactHistoryStep>();
  let checks = 0;
  let rulesetHash: string | undefined;
  let boundary: GameTime | undefined;
  let previous: FactHistoryAnalysis["previous"];
  let witness: SetupWitness | undefined;
  let sources: string[] = [];
  const finish = (
    status: FactHistoryAnalysis["status"],
    reason?: string,
  ): FactHistoryAnalysis => ({
    status,
    revision: branch.baseRevision,
    assumptionIds: [...assumptionIds],
    checks,
    complete: status === "located" || status === "compatible",
    rulesetHash,
    boundary: boundary && { ...boundary },
    sourceIds: [...sources],
    previous,
    witness,
    reason,
    steps: [...steps.values()]
      .sort((a, b) => order(a.time) - order(b.time))
      .map((step) => ({
        ...step,
        time: { ...step.time },
        sourceIds: [...step.sourceIds],
      })),
  });
  const check = async (
    solve: (timeout: number) => Promise<SetupQueryResult>,
  ) => {
    const remaining = budget - (performance.now() - started);
    if (remaining <= 0 || checks >= maxChecks)
      return {
        kind: "unknown",
        reason: "阶段定位达到时间或检查次数预算。",
      } as const;
    checks++;
    try {
      const answer = await solve(
        Math.max(
          1,
          Math.floor(
            Math.min(remaining, limit(options.checkTimeoutMs, 5000, 60000)),
          ),
        ),
      );
      if (rulesetHash && rulesetHash !== answer.rulesetHash)
        return {
          kind: "unknown",
          reason: "规则版本发生变化，不能合并阶段证据。",
          changedRules: true,
        } as const;
      rulesetHash = answer.rulesetHash;
      if (answer.status === "unsat" && answer.classification === "inconsistent")
        return { kind: "conflict" } as const;
      const proof = answer.yes ?? answer.no;
      if (proof) return { kind: "compatible", witness: proof } as const;
      return {
        kind: "unknown",
        reason:
          answer.unknownReason === "unsupported_replay"
            ? "存在尚未支持的规则交互。"
            : answer.unknownReason === "candidate_limit"
              ? "候选或隐藏行动搜索达到上限。"
              : "本次检查未完成，尚未找到可重放见证。",
      } as const;
    } catch (error) {
      return {
        kind: "unknown",
        reason: error instanceof Error ? error.message : "本次阶段检查未完成。",
      } as const;
    }
  };
  const physical = visible.some((e) => e.payload.kind !== "claim");
  if (!physical) {
    const prepared = prepareStandardSetupQuery(snapshot);
    if (prepared.status !== "ready")
      return finish("not_ready", prepared.reason);
    const answer = await check((timeoutMs) =>
      solvers.setup({ ...prepared.input, timeoutMs }),
    );
    if (answer.kind === "compatible") {
      witness = answer.witness;
      return finish(
        "compatible",
        "当前没有日夜事件；设置与本次保留前提已有兼容见证。",
      );
    }
    if (answer.kind === "conflict")
      return finish(
        "partial",
        "尚无日夜事件，冲突来自设置或手动前提，请使用前提冲突定位。",
      );
    return finish("unknown", answer.reason);
  }
  const prepared = prepareStandardObservedQuery(snapshot);
  if (prepared.status !== "ready") return finish("not_ready", prepared.reason);
  const input = prepared.input;
  const sourcesAt = (time: GameTime) =>
    visible
      .filter(
        (e) =>
          prepared.sourceIds.includes(e.id) &&
          e.occurredAt &&
          order(e.occurredAt) === order(time),
      )
      .map((e) => e.id);
  const inspect = async (length: number) => {
    const last = input.phases[length - 1];
    const time: GameTime = { phase: last.kind, cycle: last.cycle };
    const answer = await check((timeoutMs) =>
      solvers.observed({
        ...input,
        phases: input.phases.slice(0, length),
        laterReports: input.laterReports?.filter((r) => r.cycle <= time.cycle),
        phaseRoleFacts: input.phaseRoleFacts?.filter(
          (f) => f.phaseIndex < length,
        ),
        timeoutMs,
      }),
    );
    const step: FactHistoryStep = {
      time,
      status: answer.kind,
      sourceIds: sourcesAt(time),
      ...(answer.kind === "unknown" ? { reason: answer.reason } : {}),
    };
    // A changed ruleset must not replace evidence verified under the original version.
    if (!(answer.kind === "unknown" && "changedRules" in answer))
      steps.set(length - 1, step);
    if (answer.kind === "conflict") {
      boundary = time;
      sources = step.sourceIds;
    }
    return { time, answer };
  };
  // Avoid inspecting every prefix when the full history already has a legal witness.
  const full = await inspect(input.phases.length);
  if (full.answer.kind === "compatible") {
    witness = full.answer.witness;
    return finish(
      "compatible",
      "完整记录已有一种兼容解释；这不证明所有记录或声称真实。",
    );
  }
  onProgress?.(
    finish(boundary ? "partial" : "unknown", "正在检查更早的完整阶段。"),
  );
  let unresolved: string | undefined;
  for (let length = 1; length <= input.phases.length; length++) {
    if (
      length < input.phases.length &&
      (budget - (performance.now() - started) <= 0 || checks >= maxChecks)
    )
      return finish(
        boundary ? "partial" : "unknown",
        "阶段定位达到预算，保留已确认的证据；最早边界尚未验证。",
      );
    const current =
      length === input.phases.length ? full : await inspect(length);
    const answer = current.answer;
    if (answer.kind === "conflict")
      return finish(
        unresolved ? "partial" : "located",
        unresolved
          ? `截至${current.time.phase === "day" ? "D" : "N"}${current.time.cycle}的记录已确认冲突，但更早阶段仍有未知：${unresolved}`
          : "此前每个完整阶段均有兼容见证；加入本阶段后首次确认冲突。请结合此前记录核对本阶段来源，这不是来源级最小冲突集。",
      );
    if (answer.kind === "compatible")
      previous = { time: current.time, witness: answer.witness };
    else {
      if ("changedRules" in answer)
        return finish(boundary ? "partial" : "unknown", answer.reason);
      unresolved ??= answer.reason;
    }
    onProgress?.(
      finish(boundary ? "partial" : "unknown", "正在检查更早的完整阶段。"),
    );
  }
  return finish("unknown", unresolved ?? "完整历史的检查未完成。");
}
