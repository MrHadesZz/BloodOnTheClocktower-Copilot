import { ROLE_ZH, timeLabel, type Role } from "./model";
import {
  analyzeClaimGroups,
  prepareClaimAnalysis,
  type ClaimAnalysis,
  type ClaimAnalysisOptions,
  type ClaimCondition,
} from "./claimAnalysis";
import type { ConflictOracle } from "./conflict";
import type { StandardWorkspace } from "./standardWorkspace";
import type { SetupWitness } from "./symbolicSetup";
import { replayTimeline } from "./timeline";

export interface ConditionExplanation {
  relaxedIds: string[];
  witness: SetupWitness;
  /** Restoring any relaxed condition is confirmed UNSAT, with the others fixed. */
  minimal: boolean;
}
export interface ClaimConditionDiagnosis {
  status: "conflict" | "compatible" | "fixed_conflict" | "unknown";
  revision: number;
  seats: number[];
  conditions: ClaimCondition[];
  coreIds: string[];
  coreMinimal: boolean;
  explanations: ConditionExplanation[];
  trials: Array<{
    conditionId: string;
    status: "compatible" | "conflict" | "unknown";
    witness?: SetupWitness;
    reason?: string;
  }>;
  searchComplete: boolean;
  complete: boolean;
  checks: number;
  rulesetHash?: string;
  reason?: string;
}

/** Split only the selected players' temporary assumptions; every saved premise stays fixed. */
export async function analyzeClaimConditions(
  workspace: StandardWorkspace,
  selectedSeats: number[],
  oracle: ConflictOracle,
  options: ClaimAnalysisOptions = {},
  onProgress?: (diagnosis: ClaimConditionDiagnosis) => void,
): Promise<ClaimConditionDiagnosis> {
  const prepared = prepareClaimAnalysis(workspace);
  const seats = [...new Set(selectedSeats)].sort((a, b) => a - b);
  if (
    !seats.length ||
    seats.some((s) => !prepared.groups.some((g) => g.seat === s))
  )
    throw new Error("选定玩家的声称在当前修订或私密视角下不可见，请重新分析。");
  const conditions = prepared.groups
    .filter((g) => seats.includes(g.seat))
    .flatMap((g) => g.conditions);
  const otherIds = prepared.groups
    .filter((g) => !seats.includes(g.seat))
    .flatMap((g) => g.assumptionIds);
  const ids = (keys: number[]) => keys.map((key) => conditions[key - 1].id);
  const translate = (analysis: ClaimAnalysis): ClaimConditionDiagnosis => ({
    status: analysis.status === "empty" ? "unknown" : analysis.status,
    revision: prepared.revision,
    seats: [...seats],
    conditions,
    coreIds: ids(analysis.coreSeats),
    coreMinimal: analysis.coreMinimal,
    explanations: analysis.repairs.map((repair) => ({
      relaxedIds: ids(repair.seats),
      witness: repair.witness,
      minimal: repair.minimal,
    })),
    trials: analysis.trials.map(({ seat, ...trial }) => ({
      ...trial,
      conditionId: conditions[seat - 1].id,
    })),
    searchComplete: analysis.repairSearchComplete,
    complete: analysis.complete,
    checks: analysis.checks,
    rulesetHash: analysis.rulesetHash,
    reason:
      analysis.status === "fixed_conflict"
        ? "选定玩家的全部临时条件放宽后仍有冲突。请返回一键分析，复核玩家组合和手动前提。"
        : analysis.reason
            ?.replaceAll("展示组合上限", "展示解释上限")
            .replaceAll("组合", "解释"),
  });
  const analysis = await analyzeClaimGroups(
    {
      revision: prepared.revision,
      groups: conditions.map((condition, index) => ({
        seat: index + 1,
        sourceIds: [condition.sourceId],
        assumptionIds: [condition.id],
        conditions: [condition],
      })),
      withSeats: (keys) => prepared.withConditions([...otherIds, ...ids(keys)]),
    },
    oracle,
    { budgetMs: 20000, maxChecks: 150, ...options },
    (progress) => onProgress?.(translate(progress)),
  );
  return translate(analysis);
}

export function claimConditionLabel(condition: ClaimCondition) {
  if (condition.kind === "actual_role")
    return `${condition.seat}号开局身份为${ROLE_ZH[condition.role]}`;
  const time = condition.occurredAt
    ? timeLabel(condition.occurredAt)
    : "时间未记录";
  if (condition.kind === "role_at_phase")
    return `${condition.seat}号${time}结束时角色为${ROLE_ZH[condition.role]}`;
  return `${condition.seat}号${time}${ROLE_ZH[condition.role]}报告${
    condition.kind === "report_accurate" ? "准确转述" : "能力有效"
  }`;
}

/** A removed assumption is not its negation. Only concrete replayed states support a cause. */
export function describeConditionExplanation(
  conditions: ClaimCondition[],
  explanation: ConditionExplanation,
) {
  const witness = explanation.witness;
  const replay = witness.timeline
    ? replayTimeline({
        initialPlayers: witness.roles.map((actualRole, index) => ({
          seat: index + 1,
          actualRole,
          shownToken: witness.shownTokens[index],
        })),
        phases: witness.timeline,
      })
    : undefined;
  return conditions
    .filter((condition) => explanation.relaxedIds.includes(condition.id))
    .map((condition) => {
      let roleAtReport: Role | undefined;
      let poisoned: boolean | undefined;
      let deathActionIndex: number | undefined;
      if (
        condition.kind !== "actual_role" &&
        condition.occurredAt?.phase === "night"
      ) {
        const cycle = condition.occurredAt.cycle;
        if (replay?.status === "ok") {
          const trace = replay.traces[2 * (cycle - 1)];
          if (trace && "poisonedAtInformationStep" in trace) {
            roleAtReport = trace.state.roles[condition.seat - 1];
            poisoned = trace.poisonedAtInformationStep === condition.seat;
            if (
              condition.role === "Ravenkeeper" &&
              trace.ravenkeeperDeath?.speaker === condition.seat
            ) {
              roleAtReport = trace.ravenkeeperDeath.roles[condition.seat - 1];
              poisoned = trace.ravenkeeperDeath.poisonedSeat === condition.seat;
              deathActionIndex = trace.ravenkeeperDeath.impActionIndex;
            }
          }
        } else if (!witness.timeline && cycle === 1) {
          roleAtReport = witness.roles[condition.seat - 1];
          poisoned = witness.nightOnePoisoner?.target === condition.seat;
        }
      }
      if (
        condition.kind === "role_at_phase" &&
        replay?.status === "ok" &&
        condition.occurredAt
      ) {
        const index =
          2 * (condition.occurredAt.cycle - 1) +
          (condition.occurredAt.phase === "day" ? 1 : 0);
        roleAtReport = replay.traces[index]?.state.roles[condition.seat - 1];
      }
      const cause =
        condition.kind !== "ability_active"
          ? undefined
          : roleAtReport === "Drunk"
            ? "drunk"
            : poisoned
              ? "poisoned"
              : roleAtReport && roleAtReport !== condition.role
                ? "different_role"
                : "unverified";
      return {
        condition,
        initialRole: witness.roles[condition.seat - 1],
        roleAtReport,
        deathActionIndex,
        shownRole:
          roleAtReport === "Drunk"
            ? witness.shownTokens[condition.seat - 1]
            : undefined,
        cause,
      };
    });
}
