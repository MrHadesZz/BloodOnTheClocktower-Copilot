import { type EventPayload } from "./model";
import {
  closeStandardPhase,
  correctStandardAction,
  correctStandardFact,
  correctStandardVote,
  nominationVoteSources,
} from "./standardHistory";
import {
  prepareStandardObservedQuery,
  visibleStandardEvents,
  type StandardEvent,
  type StandardWorkspace,
} from "./standardWorkspace";
import type { StandardSolvers } from "./standardQuery";
import type { ConflictOptions } from "./conflict";
import type { SetupWitness } from "./symbolicSetup";

export type RecordPayload = Extract<
  EventPayload,
  { kind: "death" | "execution" | "nomination" | "slayer" | "vote" }
>;
export interface RecordCandidate {
  id: string;
  label: string;
  payload: RecordPayload;
}
export interface RecordAnalysisOptions extends ConflictOptions {
  includeAssumptions?: boolean;
  maxResults?: number;
}
export interface RecordAnalysis {
  status:
    | "confirmed"
    | "partial"
    | "compatible"
    | "no_single_edit"
    | "unknown"
    | "not_ready";
  sourceId: string;
  revision: number;
  assumptionIds: string[];
  relatedSourceIds: string[];
  baselineConflict: boolean;
  checks: number;
  testedCandidates: number;
  totalCandidates: number;
  unknownCandidates: number;
  complete: boolean;
  alternatives: Array<RecordCandidate & { witness: SetupWitness }>;
  rulesetHash?: string;
  reason?: string;
}
export function isAnalyzableRecord(
  event: StandardEvent,
): event is StandardEvent & { payload: RecordPayload } {
  return ["death", "execution", "nomination", "slayer", "vote"].includes(
    event.payload.kind,
  );
}

/** Work on one pinned revision, never delete observations or mutate saved history. */
export function prepareRecordAnalysis(
  workspace: StandardWorkspace,
  sourceId: string,
  includeAssumptions = true,
) {
  const branch = workspace.branches.find(
    (b) => b.id === workspace.activeBranchId,
  );
  if (!branch) throw new Error("活动分支不存在。");
  const source = visibleStandardEvents(
    workspace,
    workspace.perspectiveSeat,
    branch.baseRevision,
  ).find((event) => event.id === sourceId);
  if (!source || !source.occurredAt || !isAnalyzableRecord(source))
    throw new Error(
      "待试查的记录已撤回、尚未进入当前修订或在当前视角下不可见。",
    );
  const events = workspace.events.filter(
    (event) => event.revision <= branch.baseRevision,
  );
  const eventIds = new Set(events.map((event) => event.id));
  const hypotheses = workspace.hypotheses.filter(
    (hypothesis) =>
      !("eventId" in hypothesis) || eventIds.has(hypothesis.eventId),
  );
  const assumptionIds = includeAssumptions ? [...branch.assumptionIds] : [];
  if (
    assumptionIds.some(
      (id) => !hypotheses.some((hypothesis) => hypothesis.id === id),
    )
  )
    throw new Error("当前采纳前提的来源超出这份修订，请先核对前提。");
  const snapshot: StandardWorkspace = {
    ...workspace,
    query: { ...workspace.query, stage: "initial" },
    events,
    hypotheses,
    branches: [{ ...branch, parentId: undefined, assumptionIds }],
  };
  const relatedSourceIds =
    source.payload.kind === "nomination"
      ? nominationVoteSources(snapshot, source.id).map((vote) => vote.id)
      : [];
  const candidates: RecordCandidate[] = [];
  const seats = Array.from({ length: workspace.playerCount }, (_, i) => i + 1);
  const payload = source.payload;
  const addSeatChoices = (
    field: string,
    from: number,
    label: string,
    make: (seat: number) => RecordPayload,
  ) => {
    for (const seat of seats)
      if (seat !== from)
        candidates.push({
          id: `${field}-${seat}`,
          label: `${label}：${from}号 → ${seat}号`,
          payload: make(seat),
        });
  };
  if (payload.kind === "death" || payload.kind === "execution")
    addSeatChoices(
      "seat",
      payload.seat,
      payload.kind === "death" ? "死亡玩家" : "处决玩家",
      (seat) => ({ ...payload, seat }),
    );
  else if (payload.kind === "nomination") {
    addSeatChoices("nominee", payload.nominee, "被提名人", (nominee) => ({
      ...payload,
      nominee,
    }));
    addSeatChoices("nominator", payload.nominator, "提名人", (nominator) => ({
      ...payload,
      nominator,
    }));
  } else if (payload.kind === "slayer") {
    addSeatChoices("actor", payload.actor, "行动玩家", (actor) => ({
      ...payload,
      actor,
    }));
    addSeatChoices("target", payload.target, "猎手目标", (target) => ({
      ...payload,
      target,
    }));
  } else {
    for (const seat of seats) {
      const removing = payload.voters.includes(seat);
      const voters = removing
        ? payload.voters.filter((voter) => voter !== seat)
        : [...payload.voters, seat];
      candidates.push({
        id: `voter-${seat}`,
        label: `举手名单：${removing ? "移除" : "补入"}${seat}号（${payload.voters.length}票 → ${voters.length}票）`,
        payload: { ...payload, voters },
      });
    }
  }
  return {
    snapshot,
    source,
    candidates,
    relatedSourceIds,
    withCandidate(candidate: RecordCandidate): StandardWorkspace {
      const choice = candidates.find((item) => item.id === candidate.id);
      if (!choice) throw new Error("试查候选不属于当前来源。");
      const replacement = choice.payload;
      const trial =
        replacement.kind === "vote"
          ? correctStandardVote(snapshot, source.id, replacement.voters)
          : replacement.kind === "death" || replacement.kind === "execution"
            ? correctStandardFact(snapshot, source.id, replacement)
            : correctStandardAction(
                snapshot,
                source.id,
                replacement,
                relatedSourceIds,
              );
      return closeStandardPhase(trial, source.occurredAt!, true);
    },
  };
}
const limit = (value: number | undefined, fallback: number, max: number) =>
  Number.isFinite(value) ? Math.max(0, Math.min(value!, max)) : fallback;

/** Enumerate single-field substitutions only. A candidate is an explicit hypothesis, not a repair. */
export async function analyzeRecord(
  workspace: StandardWorkspace,
  sourceId: string,
  solvers: StandardSolvers,
  options: RecordAnalysisOptions = {},
  onProgress?: (analysis: RecordAnalysis) => void,
): Promise<RecordAnalysis> {
  const prepared = prepareRecordAnalysis(
    workspace,
    sourceId,
    options.includeAssumptions !== false,
  );
  const started = performance.now();
  const budget = limit(options.budgetMs, 20000, 60000);
  const maxChecks = Math.floor(limit(options.maxChecks, 40, 200));
  const maxResults = Math.floor(limit(options.maxResults, 4, 12));
  let checks = 0,
    testedCandidates = 0,
    unknownCandidates = 0;
  let baselineConflict = false;
  let rulesetHash: string | undefined;
  const alternatives: RecordAnalysis["alternatives"] = [];
  const finish = (
    status: RecordAnalysis["status"],
    reason?: string,
  ): RecordAnalysis => ({
    status,
    sourceId,
    revision: prepared.snapshot.events.length,
    assumptionIds: [...prepared.snapshot.branches[0].assumptionIds],
    relatedSourceIds: [...prepared.relatedSourceIds],
    baselineConflict,
    checks,
    testedCandidates,
    totalCandidates: prepared.candidates.length,
    unknownCandidates,
    complete: ["confirmed", "compatible", "no_single_edit"].includes(status),
    alternatives: [...alternatives],
    rulesetHash,
    reason,
  });
  const check = async (trial: StandardWorkspace) => {
    const input = prepareStandardObservedQuery(trial);
    if (input.status !== "ready")
      return { kind: "not_ready", reason: input.reason } as const;
    const remaining = budget - (performance.now() - started);
    if (remaining <= 0 || checks >= maxChecks)
      return {
        kind: "budget",
        reason: "试查达到时间或检查次数预算，未检查部分仍未知。",
      } as const;
    checks++;
    try {
      const answer = await solvers.observed({
        ...input.input,
        timeoutMs: Math.max(
          1,
          Math.floor(
            Math.min(remaining, limit(options.checkTimeoutMs, 3000, 60000)),
          ),
        ),
      });
      if (rulesetHash && rulesetHash !== answer.rulesetHash)
        return {
          kind: "changed_rules",
          reason: "规则版本发生变化，保留此前证据，不能合并新结果。",
        } as const;
      rulesetHash = answer.rulesetHash;
      if (answer.status === "unsat" && answer.classification === "inconsistent")
        return { kind: "conflict" } as const;
      const witness = answer.yes ?? answer.no;
      if (witness) return { kind: "compatible", witness } as const;
      return {
        kind: "unknown",
        reason:
          answer.unknownReason === "unsupported_replay"
            ? "存在尚未支持的规则交互。"
            : answer.unknownReason === "candidate_limit"
              ? "候选或隐藏行动搜索达到上限。"
              : "本次检查未完成，尚未找到兼容见证。",
      } as const;
    } catch (error) {
      return {
        kind: "unknown",
        reason: error instanceof Error ? error.message : "本次检查未完成。",
      } as const;
    }
  };
  const baseline = await check(prepared.snapshot);
  if (baseline.kind === "not_ready")
    return finish("not_ready", baseline.reason);
  if (baseline.kind === "compatible")
    return finish(
      "compatible",
      "原完整背景已有兼容见证，无需据此猜测录入错误。",
    );
  if (baseline.kind !== "conflict") return finish("unknown", baseline.reason);
  baselineConflict = true;
  onProgress?.(
    finish("partial", "原背景已确认冲突，正在试查这条记录的单处替代。"),
  );
  let unresolved: string | undefined;
  for (const candidate of prepared.candidates) {
    if (alternatives.length >= maxResults)
      return finish("partial", "已达到展示候选上限，其他单处替代尚未检查。");
    let answer: Awaited<ReturnType<typeof check>>;
    try {
      answer = await check(prepared.withCandidate(candidate));
    } catch (error) {
      answer = {
        kind: "unknown",
        reason: error instanceof Error ? error.message : "候选记录无法准备。",
      };
    }
    if (answer.kind === "budget" || answer.kind === "changed_rules")
      return finish("partial", answer.reason);
    testedCandidates++;
    if (answer.kind === "compatible")
      alternatives.push({ ...candidate, witness: answer.witness });
    else if (answer.kind !== "conflict") {
      unknownCandidates++;
      unresolved ??= answer.reason;
    }
    onProgress?.(finish("partial", "已确认的候选实时显示，未完成部分仍未知。"));
  }
  if (unknownCandidates) return finish("partial", unresolved);
  return alternatives.length
    ? finish(
        "confirmed",
        "这条记录的单处替代已检查完；候选只是在所列条件下可成立，不证明原记录错误。",
      )
    : finish(
        "no_single_edit",
        "这些单处替代均未消除完整背景冲突；这不证明原记录正确，可能涉及多处记录或手动前提。",
      );
}
