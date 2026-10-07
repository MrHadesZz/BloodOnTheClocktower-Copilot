import {
  createStandardBranch,
  type StandardWorkspace,
} from "./standardWorkspace";
import type { SetupQueryResult, SetupWitness } from "./symbolicSetup";

export interface ConflictOptions {
  maxChecks?: number;
  budgetMs?: number;
  checkTimeoutMs?: number;
}
export interface ConflictAnalysis {
  status:
    | "minimal"
    | "partial"
    | "fixed_conflict"
    | "not_conflicting"
    | "unconfirmed";
  /** Minimal only relative to the fixed records and rules, never minimum cardinality. */
  assumptionIds: string[];
  checks: number;
  reason?: string;
  rulesetHash?: string;
  /** Each witness satisfies the final core with exactly this assumption removed. */
  deletionWitnesses: Array<{ assumptionId: string; witness: SetupWitness }>;
}
export type ConflictOracle = (
  workspace: StandardWorkspace,
  timeoutMs: number,
) => Promise<SetupQueryResult>;

function withAssumptions(
  workspace: StandardWorkspace,
  assumptionIds: string[],
): StandardWorkspace {
  return {
    ...workspace,
    branches: workspace.branches.map((b) =>
      b.id === workspace.activeBranchId ? { ...b, assumptionIds } : b,
    ),
  };
}

/** Deletion search with exact-set rechecks after every shrink. UNKNOWN is never evidence. */
export async function analyzeStandardConflict(
  workspace: StandardWorkspace,
  oracle: ConflictOracle,
  options: ConflictOptions = {},
  onProgress?: (analysis: ConflictAnalysis) => void,
): Promise<ConflictAnalysis> {
  const branch = workspace.branches.find(
    (b) => b.id === workspace.activeBranchId,
  );
  if (!branch) throw new Error("活动分支不存在。");
  const started = performance.now();
  const budget = Math.max(0, Math.min(options.budgetMs ?? 15000, 60000));
  const maxChecks = Math.max(0, Math.min(options.maxChecks ?? 40, 200));
  let checks = 0;
  let core = [...new Set(branch.assumptionIds)];
  let rulesetHash: string | undefined;
  let proof: ConflictAnalysis["deletionWitnesses"] = [];
  const finish = (
    status: ConflictAnalysis["status"],
    reason?: string,
  ): ConflictAnalysis => ({
    status,
    assumptionIds: [...core],
    checks,
    reason,
    rulesetHash,
    deletionWitnesses: [...proof],
  });
  const check = async (ids: string[]) => {
    const remaining = budget - (performance.now() - started);
    if (checks >= maxChecks || remaining <= 0)
      return {
        kind: "budget",
        reason:
          checks >= maxChecks ? "已达到检查次数上限" : "已达到定位时间预算",
      } as const;
    checks++;
    try {
      const answer = await oracle(
        withAssumptions(workspace, ids),
        Math.max(
          1,
          Math.floor(Math.min(remaining, options.checkTimeoutMs ?? 1500)),
        ),
      );
      if (rulesetHash && rulesetHash !== answer.rulesetHash)
        return {
          kind: "unknown",
          reason: "规则版本发生变化，不能合并验证结果",
        } as const;
      rulesetHash = answer.rulesetHash;
      if (answer.status === "unsat" && answer.classification === "inconsistent")
        return { kind: "unsat" } as const;
      const witness = answer.yes ?? answer.no;
      // Even an UNKNOWN proposition can have a valid one-sided consistency witness.
      if (witness) return { kind: "sat", witness } as const;
      return {
        kind: "unknown",
        reason:
          answer.unknownReason === "time_budget"
            ? "单次检查达到时间预算"
            : answer.unknownReason === "candidate_limit"
              ? "隐藏行动或候选搜索达到上限"
              : answer.unknownReason === "unsupported_replay"
                ? "存在尚未支持的规则交互"
                : "部分检查结果未知或未找到可重放见证",
      } as const;
    } catch (error) {
      return {
        kind: "unknown",
        reason: error instanceof Error ? error.message : "检查未完成",
      } as const;
    }
  };
  const baseline = await check(core);
  if (baseline.kind === "sat") return finish("not_conflicting");
  if (baseline.kind !== "unsat") return finish("unconfirmed", baseline.reason);
  onProgress?.(finish("partial", "定位仍在进行，最小性尚未验证。"));
  let index = 0;
  let unknownReason: string | undefined;
  while (index < core.length) {
    const id = core[index];
    const reduced = core.filter((item) => item !== id);
    const answer = await check(reduced);
    if (answer.kind === "budget") return finish("partial", answer.reason);
    if (answer.kind === "unsat") {
      core = reduced;
      // Earlier deletion witnesses refer to a different core. Recheck them all.
      index = 0;
      proof = [];
      unknownReason = undefined;
    } else {
      if (answer.kind === "sat")
        proof.push({ assumptionId: id, witness: answer.witness });
      else unknownReason = answer.reason;
      index++;
    }
    onProgress?.(finish("partial", "定位仍在进行，最小性尚未验证。"));
  }
  if (!core.length)
    return finish(
      "fixed_conflict",
      "不采纳任何假设仍然冲突，请核对固定事实记录。",
    );
  return finish(unknownReason ? "partial" : "minimal", unknownReason);
}

/** Fork from the exact parent revision; never retract observations or mutate the parent. */
export function createConflictTrial(
  workspace: StandardWorkspace,
  assumptionId: string,
  name: string,
): StandardWorkspace {
  const parent = workspace.branches.find(
    (b) => b.id === workspace.activeBranchId,
  );
  if (!parent?.assumptionIds.includes(assumptionId))
    throw new Error("待取消的前提已不在当前分支，请重新定位。");
  const next = createStandardBranch(workspace, name);
  return {
    ...next,
    branches: next.branches.map((b) =>
      b.id === next.activeBranchId
        ? {
            ...b,
            assumptionIds: b.assumptionIds.filter((id) => id !== assumptionId),
          }
        : b,
    ),
  };
}
