import { type GameTime, type Role } from "./model";
import {
  visibleStandardEvents,
  type StandardHypothesis,
  type StandardWorkspace,
} from "./standardWorkspace";
import { currentStandardClaims } from "./standardHistory";
import type { ConflictOptions, ConflictOracle } from "./conflict";
import type { SetupWitness } from "./symbolicSetup";

export interface ClaimCondition {
  id: string;
  seat: number;
  kind: "actual_role" | "role_at_phase" | "report_accurate" | "ability_active";
  role: Role;
  sourceId: string;
  occurredAt?: GameTime;
}
export interface ClaimGroup {
  seat: number;
  role?: Role;
  sourceIds: string[];
  assumptionIds: string[];
  conditions: ClaimCondition[];
}
export interface ClaimRepair {
  seats: number[];
  witness: SetupWitness;
  /** Every single-player restoration was UNSAT, relative to all fixed conditions. */
  minimal: boolean;
}
export interface ClaimAnalysisOptions extends ConflictOptions {
  maxRepairs?: number;
}
export interface ClaimAnalysis {
  status: "empty" | "compatible" | "conflict" | "fixed_conflict" | "unknown";
  revision: number;
  groups: ClaimGroup[];
  coreSeats: number[];
  coreMinimal: boolean;
  complete: boolean;
  checks: number;
  reason?: string;
  rulesetHash?: string;
  witness?: SetupWitness;
  trials: Array<{
    seat: number;
    status: "compatible" | "conflict" | "unknown";
    witness?: SetupWitness;
    reason?: string;
  }>;
  repairs: ClaimRepair[];
  repairSearchComplete: boolean;
}

/** Claims are temporary test conditions. Never adopt them in the saved workspace. */
export function prepareClaimAnalysis(workspace: StandardWorkspace) {
  const branch = workspace.branches.find(
    (b) => b.id === workspace.activeBranchId,
  );
  if (!branch) throw new Error("活动分支不存在。");
  const events = visibleStandardEvents(
    workspace,
    workspace.perspectiveSeat,
    branch.baseRevision,
  );
  const groups: ClaimGroup[] = [];
  const hypotheses = [...workspace.hypotheses];
  const namespace = crypto.randomUUID();
  for (let seat = 1; seat <= workspace.playerCount; seat++) {
    const claims = currentStandardClaims(events, workspace.events).filter(
      (e) => e.payload.kind === "claim" && e.payload.speaker === seat,
    );
    const latest = claims
      .filter(
        (e) =>
          e.payload.kind === "claim" &&
          e.payload.claimKind === "role" &&
          e.payload.identityStage !== "current",
      )
      .at(-1);
    const currentRoles = claims
      .filter(
        (e) =>
          e.payload.kind === "claim" &&
          e.payload.claimKind === "role" &&
          e.payload.identityStage === "current",
      )
      .filter(
        (e, index, all) =>
          !all
            .slice(index + 1)
            .some(
              (later) =>
                later.occurredAt?.cycle === e.occurredAt?.cycle &&
                later.occurredAt?.phase === e.occurredAt?.phase,
            ),
      );
    const reports = claims.filter(
      (e) =>
        e.payload.kind === "claim" && e.payload.claimKind === "ability_report",
    );
    if (!latest && !currentRoles.length && !reports.length) continue;
    const group: ClaimGroup = {
      seat,
      sourceIds: [],
      assumptionIds: [],
      conditions: [],
    };
    const add = (
      draft:
        | Omit<
            Extract<StandardHypothesis, { kind: "actual_role" }>,
            "id" | "createdAt"
          >
        | Omit<
            Extract<StandardHypothesis, { kind: "role_at_phase" }>,
            "id" | "createdAt"
          >
        | Omit<
            Extract<StandardHypothesis, { eventId: string }>,
            "id" | "createdAt"
          >,
      source: (typeof events)[number],
    ) => {
      const id = `claim-analysis-${namespace}-${hypotheses.length}`;
      hypotheses.push({ ...draft, id, createdAt: branch.createdAt });
      group.assumptionIds.push(id);
      if (source.payload.kind === "claim")
        group.conditions.push({
          id,
          seat,
          kind: draft.kind,
          role: source.payload.role,
          sourceId: source.id,
          occurredAt: source.occurredAt,
        });
    };
    if (latest?.payload.kind === "claim") {
      group.role = latest.payload.role;
      group.sourceIds.push(latest.id);
      add({ kind: "actual_role", seat, role: latest.payload.role }, latest);
    }
    for (const claim of currentRoles) {
      if (claim.payload.kind !== "claim" || !claim.occurredAt) continue;
      group.sourceIds.push(claim.id);
      add(
        {
          kind: "role_at_phase",
          seat,
          role: claim.payload.role,
          occurredAt: claim.occurredAt,
        },
        claim,
      );
    }
    for (const report of reports) {
      group.sourceIds.push(report.id);
      add({ kind: "report_accurate", eventId: report.id }, report);
      add({ kind: "ability_active", eventId: report.id }, report);
    }
    groups.push(group);
  }
  const fixedIds = [...branch.assumptionIds];
  const withConditions = (ids: string[]): StandardWorkspace => ({
    ...workspace,
    // Query the initial assignment while exact phase-role conditions and report nights retain their own time.
    query: { ...workspace.query, stage: "initial" },
    hypotheses,
    branches: workspace.branches.map((b) =>
      b.id === branch.id
        ? {
            ...b,
            assumptionIds: [...fixedIds, ...ids],
          }
        : b,
    ),
  });
  const withSeats = (seats: number[]) =>
    withConditions(
      groups
        .filter((g) => seats.includes(g.seat))
        .flatMap((g) => g.assumptionIds),
    );
  return { groups, revision: branch.baseRevision, withSeats, withConditions };
}

// Fixed facts never change. Each search state contains the players whose temporary conditions remain.
export async function analyzeClaims(
  workspace: StandardWorkspace,
  oracle: ConflictOracle,
  options: ClaimAnalysisOptions = {},
  onProgress?: (result: ClaimAnalysis) => void,
): Promise<ClaimAnalysis> {
  return analyzeClaimGroups(
    prepareClaimAnalysis(workspace),
    oracle,
    options,
    onProgress,
  );
}

/** Shared verified subset search; group keys need not represent real player seats. */
export async function analyzeClaimGroups(
  prepared: Pick<
    ReturnType<typeof prepareClaimAnalysis>,
    "groups" | "revision" | "withSeats"
  >,
  oracle: ConflictOracle,
  options: ClaimAnalysisOptions = {},
  onProgress?: (result: ClaimAnalysis) => void,
): Promise<ClaimAnalysis> {
  const all = prepared.groups.map((g) => g.seat);
  const result: ClaimAnalysis = {
    status: "unknown",
    revision: prepared.revision,
    groups: prepared.groups,
    coreSeats: [],
    coreMinimal: false,
    complete: false,
    checks: 0,
    trials: [],
    repairs: [],
    repairSearchComplete: false,
  };
  if (!all.length)
    return {
      ...result,
      status: "empty",
      complete: true,
      repairSearchComplete: true,
    };
  const started = performance.now();
  const budget = Math.max(0, Math.min(options.budgetMs ?? 30000, 60000));
  const maxChecks = Math.max(0, Math.min(options.maxChecks ?? 120, 200));
  const maxRepairs = Math.max(1, Math.min(options.maxRepairs ?? 6, 20));
  type Check =
    | { kind: "sat"; witness: SetupWitness }
    | { kind: "unsat" }
    | { kind: "unknown"; reason: string }
    | { kind: "budget"; reason: string };
  const cache = new Map<string, Check>();
  const key = (seats: number[]) => seats.join(",");
  const retained = (relaxed: number[]) =>
    all.filter((s) => !relaxed.includes(s));
  // Cached proofs cost no new solver checks; only elapsed time stops queue processing.
  const exhausted = () => budget <= performance.now() - started;
  const check = async (seats: number[]): Promise<Check> => {
    const sorted = [...seats].sort((a, b) => a - b);
    const cached = cache.get(key(sorted));
    if (cached) return cached;
    const remaining = budget - (performance.now() - started);
    if (remaining <= 0 || result.checks >= maxChecks)
      return { kind: "budget", reason: "已达到分析时间或检查次数上限。" };
    result.checks++;
    let answer: Check;
    try {
      const solved = await oracle(
        prepared.withSeats(sorted),
        Math.max(
          1,
          Math.floor(Math.min(remaining, options.checkTimeoutMs ?? 2000)),
        ),
      );
      if (result.rulesetHash && result.rulesetHash !== solved.rulesetHash) {
        answer = {
          kind: "unknown",
          reason: "规则版本发生变化，不能合并结果。",
        };
      } else {
        result.rulesetHash = solved.rulesetHash;
        if (
          solved.status === "unsat" &&
          solved.classification === "inconsistent"
        )
          answer = { kind: "unsat" };
        else if (solved.yes ?? solved.no)
          answer = { kind: "sat", witness: (solved.yes ?? solved.no)! };
        else
          answer = {
            kind: "unknown",
            reason:
              solved.unknownReason === "time_budget"
                ? "单次检查达到时间预算。"
                : "规则交互或候选搜索未完成，结果未知。",
          };
      }
    } catch (error) {
      answer = {
        kind: "unknown",
        reason: error instanceof Error ? error.message : "分析未完成。",
      };
    }
    cache.set(key(sorted), answer);
    return answer;
  };
  const snapshot = (): ClaimAnalysis => ({
    ...result,
    coreSeats: [...result.coreSeats],
    trials: result.trials.map((t) => ({ ...t })),
    repairs: result.repairs.map((r) => ({ ...r, seats: [...r.seats] })),
  });
  const publish = () => onProgress?.(snapshot());
  const stop = (reason: string) => {
    result.reason = reason;
    return snapshot();
  };
  const subset = (left: number[], right: number[]) =>
    left.every((s) => right.includes(s));
  const baseline = await check(all);
  if (baseline.kind === "sat")
    return {
      ...result,
      status: "compatible",
      witness: baseline.witness,
      complete: true,
      repairSearchComplete: true,
    };
  if (baseline.kind !== "unsat") return stop(baseline.reason);
  const background = await check([]);
  if (background.kind === "unsat")
    return {
      ...result,
      status: "fixed_conflict",
      complete: true,
      repairSearchComplete: true,
      reason: "不采信任何玩家声称仍有冲突，请核对对局事件与手动采纳的前提。",
    };
  if (background.kind !== "sat") return stop(background.reason);
  result.status = "conflict";
  result.coreSeats = [...all];
  publish();

  const recordRepair = (repair: ClaimRepair) => {
    if (
      result.repairs.some(
        (r) =>
          subset(r.seats, repair.seats) && key(r.seats) !== key(repair.seats),
      )
    )
      return;
    result.repairs = result.repairs.filter(
      (r) => !subset(repair.seats, r.seats),
    );
    result.repairs.push(repair);
    result.repairs.sort(
      (a, b) =>
        a.seats.length - b.seats.length ||
        key(a.seats).localeCompare(key(b.seats), "en"),
    );
  };
  for (const seat of all) {
    const answer = await check(retained([seat]));
    if (answer.kind === "budget") return stop(answer.reason);
    result.trials.push({
      seat,
      status:
        answer.kind === "sat"
          ? "compatible"
          : answer.kind === "unsat"
            ? "conflict"
            : "unknown",
      ...(answer.kind === "sat" ? { witness: answer.witness } : {}),
      ...(answer.kind === "unknown" ? { reason: answer.reason } : {}),
    });
    // Restoring the only relaxed player is the verified UNSAT baseline.
    if (answer.kind === "sat" && result.repairs.length < maxRepairs)
      recordRepair({ seats: [seat], witness: answer.witness, minimal: true });
    publish();
  }

  // A conflict core proves that every compatible repair must relax at least one of its players.
  const shrink = async (input: number[]) => {
    let core = [...input];
    let index = 0;
    let unknownReason: string | undefined;
    while (index < core.length) {
      const reduced = core.filter((s) => s !== core[index]);
      const answer = await check(reduced);
      if (answer.kind === "budget")
        return { core, minimal: false, budgetReason: answer.reason };
      if (answer.kind === "unsat") {
        core = reduced;
        index = 0;
        unknownReason = undefined;
      } else {
        if (answer.kind === "unknown") unknownReason = answer.reason;
        index++;
      }
    }
    return { core, minimal: !unknownReason, unknownReason };
  };
  const firstCore = await shrink(all);
  result.coreSeats = firstCore.core;
  result.coreMinimal = firstCore.minimal;
  publish();
  if (firstCore.budgetReason) return stop(firstCore.budgetReason);
  const cores = [firstCore.core];
  const frontier: number[][] = [[]];
  const queued = new Set([""]);
  let searchUnknown: string | undefined;
  const enqueue = (seats: number[]) => {
    const sorted = [...new Set(seats)].sort((a, b) => a - b);
    if (!queued.has(key(sorted))) {
      queued.add(key(sorted));
      frontier.push(sorted);
    }
  };
  while (frontier.length) {
    if (exhausted())
      return stop("已达到分析时间或检查次数上限，保留已验证的组合。");
    frontier.sort(
      (a, b) => a.length - b.length || key(a).localeCompare(key(b), "en"),
    );
    const relaxed = frontier.shift()!;
    if (result.repairs.some((r) => subset(r.seats, relaxed))) continue;
    const uncovered = cores.find(
      (core) => !core.some((s) => relaxed.includes(s)),
    );
    if (uncovered) {
      for (const seat of uncovered) enqueue([...relaxed, seat]);
      continue;
    }
    if (result.repairs.length >= maxRepairs)
      return stop("已达到展示组合上限，其他组合尚未搜索完。");
    const answer = await check(retained(relaxed));
    if (answer.kind === "budget") return stop(answer.reason);
    if (answer.kind === "unknown") {
      searchUnknown = answer.reason;
      // UNKNOWN is not a conflict proof. Explore supersets without labeling this candidate invalid.
      for (const seat of retained(relaxed)) enqueue([...relaxed, seat]);
      continue;
    }
    if (answer.kind === "unsat") {
      const learned = await shrink(retained(relaxed));
      cores.push(learned.core);
      if (learned.budgetReason) return stop(learned.budgetReason);
      for (const seat of learned.core) enqueue([...relaxed, seat]);
      continue;
    }
    let repair: ClaimRepair = {
      seats: [...relaxed],
      witness: answer.witness,
      minimal: false,
    };
    recordRepair(repair);
    // Preserve the compatibility witness before testing minimality, including on worker deadline.
    publish();
    let index = 0;
    let minimalityUnknown: string | undefined;
    while (index < repair.seats.length) {
      const smaller = repair.seats.filter((s) => s !== repair.seats[index]);
      const restored = await check(retained(smaller));
      if (restored.kind === "budget") return stop(restored.reason);
      if (restored.kind === "sat") {
        repair = { seats: smaller, witness: restored.witness, minimal: false };
        recordRepair(repair);
        index = 0;
        minimalityUnknown = undefined;
        publish();
      } else {
        if (restored.kind === "unknown") minimalityUnknown = restored.reason;
        index++;
      }
    }
    repair = { ...repair, minimal: !minimalityUnknown };
    recordRepair(repair);
    if (minimalityUnknown) searchUnknown = minimalityUnknown;
    publish();
  }
  result.repairSearchComplete = !searchUnknown;
  result.complete =
    result.coreMinimal &&
    result.repairSearchComplete &&
    result.trials.every((t) => t.status !== "unknown") &&
    result.repairs.every((r) => r.minimal);
  result.reason =
    searchUnknown ??
    firstCore.unknownReason ??
    (result.complete ? undefined : "部分检查未完成，保留已验证的组合。");
  return snapshot();
}

export function describeClaimRepair(groups: ClaimGroup[], repair: ClaimRepair) {
  return repair.seats.map((seat) => {
    const group = groups.find((g) => g.seat === seat)!;
    const role = repair.witness.roles[seat - 1];
    const poisonNights = [
      ...(repair.witness.nightOnePoisoner?.target === seat ? [1] : []),
      ...(repair.witness.timeline ?? []).flatMap((phase) =>
        phase.kind === "night" && phase.actions.poisonerTarget === seat
          ? [phase.actions.cycle]
          : [],
      ),
    ];
    return {
      seat,
      claimedRole: group.role,
      role,
      shownRole:
        role === "Drunk" ? repair.witness.shownTokens[seat - 1] : undefined,
      reportIds: group.conditions
        .filter((c) => c.kind === "report_accurate")
        .map((c) => c.sourceId),
      poisonNights: [...new Set(poisonNights)],
    };
  });
}
