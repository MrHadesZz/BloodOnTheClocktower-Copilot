import {
  activeEvents,
  ROLES,
  type EventDraft,
  type EventEnvelope,
  type EventPayload,
  type GameTime,
  type Role,
} from "./model";
import { parseEntry } from "./parser";
import { baseSetup, ROLE_TEAM } from "./setup";
import type {
  FirstNightReport,
  ObservedQueryInput,
  SetupQueryInput,
} from "./symbolicSetup";
import type { ObservedPhase, ObservedReport } from "./observedTimeline";
import type { DayEvent } from "./day";

export type StandardEvent = Omit<EventEnvelope, "visibility"> & {
  correctsEventId?: string;
} & (
    | { visibility: "public"; ownerSeat?: never }
    | { visibility: "private"; ownerSeat: number }
  );

export type StandardEventDraft = EventDraft & { correctsEventId?: string };

export type StandardHypothesis =
  | {
      id: string;
      kind: "actual_role";
      seat: number;
      role: Role;
      createdAt: string;
    }
  | {
      id: string;
      kind: "role_at_phase";
      seat: number;
      role: Role;
      occurredAt: GameTime;
      createdAt: string;
    }
  | {
      id: string;
      kind: "seen_token";
      seat: number;
      shownRole: Role;
      createdAt: string;
    }
  | {
      id: string;
      kind: "report_accurate" | "ability_active";
      eventId: string;
      createdAt: string;
    }
  | {
      id: string;
      kind: "night_one_poison";
      poisonerSeat: number;
      targetSeat: number;
      createdAt: string;
    };

export type HypothesisDraft = StandardHypothesis extends infer H
  ? H extends { id: string; createdAt: string }
    ? Omit<H, "id" | "createdAt">
    : never
  : never;

export interface StandardBranch {
  id: string;
  name: string;
  parentId?: string;
  baseRevision: number;
  assumptionIds: string[];
  createdAt: string;
}

export interface StandardWorkspace {
  schemaVersion: 2 | 3 | 4 | 5;
  profile: "standard";
  gameId: string;
  title: string;
  playerCount: number;
  perspectiveSeat: number;
  selectedSeat: number;
  recordingTime?: GameTime;
  query: { seat: number; role: Role; stage?: "initial" | "current" };
  events: StandardEvent[];
  hypotheses: StandardHypothesis[];
  branches: StandardBranch[];
  activeBranchId: string;
}

export interface PublicTranscript {
  schemaVersion: 1 | 2 | 3 | 4;
  kind: "clocktower-public-transcript";
  gameId: string;
  title: string;
  playerCount: number;
  events: StandardEvent[];
}

const uid = () => globalThis.crypto.randomUUID();
const validSeat = (seat: unknown, count: number) =>
  Number.isInteger(seat) && Number(seat) >= 1 && Number(seat) <= count;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const isRole = (role: unknown): role is Role =>
  typeof role === "string" && (ROLES as readonly string[]).includes(role);
const nonempty = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;
const validDate = (value: unknown) =>
  typeof value === "string" && !Number.isNaN(Date.parse(value));
const validTime = (value: unknown): value is GameTime =>
  isRecord(value) &&
  (value.phase === "day" || value.phase === "night") &&
  Number.isInteger(value.cycle) &&
  Number(value.cycle) >= 1 &&
  Number(value.cycle) <= 99;

export function createStandardWorkspace(
  playerCount: number,
  perspectiveSeat = 1,
): StandardWorkspace {
  baseSetup(playerCount);
  if (!validSeat(perspectiveSeat, playerCount))
    throw new RangeError("私密视角座位无效。");
  const branchId = uid();
  return {
    schemaVersion: 2,
    profile: "standard",
    gameId: uid(),
    title: `${playerCount}人 Trouble Brewing 对局`,
    playerCount,
    perspectiveSeat,
    selectedSeat: perspectiveSeat,
    query: { seat: perspectiveSeat, role: "Imp", stage: "initial" },
    events: [],
    hypotheses: [],
    branches: [
      {
        id: branchId,
        name: "基础记录",
        baseRevision: 0,
        assumptionIds: [],
        createdAt: new Date().toISOString(),
      },
    ],
    activeBranchId: branchId,
  };
}

export function visibleStandardEvents(
  workspace: StandardWorkspace,
  viewerSeat: number,
  revision = Infinity,
): StandardEvent[] {
  if (!validSeat(viewerSeat, workspace.playerCount))
    throw new RangeError("私密视角座位无效。");
  return activeEvents(workspace.events, revision).filter(
    (event) => event.visibility === "public" || event.ownerSeat === viewerSeat,
  );
}

export function commitStandardEntry(
  workspace: StandardWorkspace,
  rawText: string,
  visibility: "public" | "private" = "private",
): StandardWorkspace {
  const drafts = parseEntry(rawText, {
    playerCount: workspace.playerCount,
    profile: "standard",
  });
  return commitStandardDrafts(workspace, rawText, drafts, visibility);
}

export function requireLatestStandardRevision(workspace: StandardWorkspace) {
  const branch = workspace.branches.find(
    (item) => item.id === workspace.activeBranchId,
  );
  if (!branch) throw new Error("活动分支不存在。");
  if (branch.baseRevision !== workspace.events.length)
    throw new Error("当前分支尚未包含最新记录，请先更新到最新记录再修改历史。");
}

export function commitStandardDrafts(
  workspace: StandardWorkspace,
  rawText: string,
  drafts: StandardEventDraft[],
  visibility: "public" | "private" = "private",
): StandardWorkspace {
  requireLatestStandardRevision(workspace);
  if (!drafts.length) throw new Error("没有可提交的事件。");
  const physicalTimes = drafts
    .filter((d) => changesPhaseCompleteness(d.payload))
    .flatMap((d) => (d.occurredAt ? [d.occurredAt] : []));
  workspace = reopenStandardPhases(workspace, physicalTimes);
  const current = activeEvents(workspace.events);
  const entryId = uid();
  const now = new Date().toISOString();
  const events: StandardEvent[] = drafts.map((draft, index) => {
    const payload: EventPayload = { ...draft.payload };
    if (payload.kind === "vote") {
      const nominations = current.filter(
        (event) =>
          event.payload.kind === "nomination" &&
          (payload.nominationId === undefined ||
            event.id === payload.nominationId) &&
          event.payload.nominee === payload.nominee &&
          event.occurredAt?.phase === draft.occurredAt?.phase &&
          event.occurredAt?.cycle === draft.occurredAt?.cycle,
      );
      if (nominations.length !== 1)
        throw new Error("投票必须关联同一天唯一一条已记录的提名。");
      if (visibility === "public" && nominations[0].visibility !== "public")
        throw new Error("公开投票不能引用私密提名。");
      payload.nominationId = nominations[0].id;
    }
    return {
      id: uid(),
      rawEntryId: entryId,
      revision: workspace.events.length + index + 1,
      recordedAt: now,
      occurredAt: draft.occurredAt,
      rawText,
      sourceSpan: draft.sourceSpan,
      payload,
      ...(draft.correctsEventId !== undefined
        ? { correctsEventId: draft.correctsEventId }
        : {}),
      ...(visibility === "public"
        ? { visibility: "public" as const }
        : {
            visibility: "private" as const,
            ownerSeat: workspace.perspectiveSeat,
          }),
    };
  });
  const revision = workspace.events.length + events.length;
  const next: StandardWorkspace = {
    ...workspace,
    schemaVersion:
      workspace.schemaVersion === 5 ||
      drafts.some(
        (draft) =>
          draft.correctsEventId !== undefined &&
          (draft.payload.kind === "nomination" ||
            draft.payload.kind === "slayer"),
      )
        ? 5
        : workspace.schemaVersion === 4 ||
            drafts.some(
              (draft) =>
                draft.correctsEventId !== undefined &&
                draft.payload.kind !== "vote",
            )
          ? 4
          : drafts.some((draft) => draft.correctsEventId !== undefined)
            ? 3
            : workspace.schemaVersion,
    events: [...workspace.events, ...events],
    branches: workspace.branches.map((branch) =>
      branch.id === workspace.activeBranchId
        ? { ...branch, baseRevision: revision }
        : branch,
    ),
  };
  if (drafts.some((draft) => draft.correctsEventId !== undefined))
    validateStandardWorkspace(next);
  return next;
}

export function retractStandardEvent(
  workspace: StandardWorkspace,
  targetId: string,
  reason = "纠正误录",
): StandardWorkspace {
  requireLatestStandardRevision(workspace);
  const target = activeEvents(workspace.events).find(
    (event) => event.id === targetId,
  );
  if (!target) throw new Error("原事件已不存在或已撤回。");
  if (
    target.visibility === "private" &&
    target.ownerSeat !== workspace.perspectiveSeat
  )
    throw new Error("不能撤回其他玩家的私密记录。");
  const entry: StandardEvent = {
    id: uid(),
    rawEntryId: uid(),
    revision: workspace.events.length + 1,
    recordedAt: new Date().toISOString(),
    occurredAt: target.occurredAt,
    rawText: reason,
    sourceSpan: [0, reason.length],
    payload: { kind: "retraction", targetId, reason },
    ...(target.visibility === "public"
      ? { visibility: "public" as const }
      : { visibility: "private" as const, ownerSeat: target.ownerSeat }),
  };
  const next = {
    ...workspace,
    events: [...workspace.events, entry],
    branches: workspace.branches.map((branch) =>
      branch.id === workspace.activeBranchId
        ? { ...branch, baseRevision: entry.revision }
        : branch,
    ),
  };
  return changesPhaseCompleteness(target.payload) && target.occurredAt
    ? reopenStandardPhases(next, [target.occurredAt])
    : next;
}

export function changesPhaseCompleteness(payload: EventPayload) {
  return ["nomination", "vote", "execution", "death", "slayer"].includes(
    payload.kind,
  );
}

/** A changed observation invalidates its old completeness promise, never invents empty phases. */
function reopenStandardPhases(workspace: StandardWorkspace, times: GameTime[]) {
  const closures = visibleStandardEvents(
    workspace,
    workspace.perspectiveSeat,
  ).filter(
    (e) =>
      e.payload.kind === "phase_closed" &&
      times.some(
        (time) =>
          e.occurredAt?.cycle === time.cycle &&
          e.occurredAt?.phase === time.phase,
      ),
  );
  return closures.reduce(
    (next, e) =>
      retractStandardEvent(
        next,
        e.id,
        "本阶段行动或死亡记录已变动，请重新确认完整。",
      ),
    workspace,
  );
}

export function addStandardHypothesis(
  workspace: StandardWorkspace,
  draft: HypothesisDraft,
): StandardWorkspace {
  const hypothesis = {
    ...draft,
    id: uid(),
    createdAt: new Date().toISOString(),
  } as StandardHypothesis;
  const next = {
    ...workspace,
    hypotheses: [...workspace.hypotheses, hypothesis],
  };
  validateStandardWorkspace(next);
  return next;
}

export function toggleStandardHypothesis(
  workspace: StandardWorkspace,
  id: string,
): StandardWorkspace {
  if (!workspace.hypotheses.some((hypothesis) => hypothesis.id === id))
    throw new Error("假设不存在。");
  return {
    ...workspace,
    branches: workspace.branches.map((branch) =>
      branch.id === workspace.activeBranchId
        ? {
            ...branch,
            assumptionIds: branch.assumptionIds.includes(id)
              ? branch.assumptionIds.filter((item) => item !== id)
              : [...branch.assumptionIds, id],
          }
        : branch,
    ),
  };
}

export function createStandardBranch(
  workspace: StandardWorkspace,
  name: string,
): StandardWorkspace {
  const parent = workspace.branches.find(
    (branch) => branch.id === workspace.activeBranchId,
  );
  if (!parent) throw new Error("活动分支不存在。");
  const branch: StandardBranch = {
    id: uid(),
    name: name.trim() || `分支 ${workspace.branches.length + 1}`,
    parentId: parent.id,
    baseRevision: parent.baseRevision,
    assumptionIds: [...parent.assumptionIds],
    createdAt: new Date().toISOString(),
  };
  return {
    ...workspace,
    branches: [...workspace.branches, branch],
    activeBranchId: branch.id,
  };
}

/** A public export contains only explicitly public source events, never hypotheses. */
export function publicTranscript(
  workspace: StandardWorkspace,
): PublicTranscript {
  const publicIds = new Set(
    workspace.events
      .filter((event) => event.visibility === "public")
      .map((event) => event.id),
  );
  const events = workspace.events
    .filter(
      (event) =>
        event.visibility === "public" &&
        (event.payload.kind !== "retraction" ||
          publicIds.has(event.payload.targetId)),
    )
    .map((event) => ({ ...event, rawEntryId: `public-${event.id}` }));
  return {
    schemaVersion: events.some(
      (event) =>
        event.correctsEventId !== undefined &&
        (event.payload.kind === "nomination" ||
          event.payload.kind === "slayer"),
    )
      ? 4
      : events.some(
            (event) =>
              event.correctsEventId !== undefined &&
              event.payload.kind !== "vote",
          )
        ? 3
        : events.some((event) => event.correctsEventId !== undefined)
          ? 2
          : 1,
    kind: "clocktower-public-transcript",
    gameId: workspace.gameId,
    title: workspace.title,
    playerCount: workspace.playerCount,
    events,
  };
}

export type PreparedStandardQuery =
  | {
      status: "ready";
      input: SetupQueryInput;
      sourceIds: string[];
      revision: number;
    }
  | { status: "unsupported"; reason: string; revision: number };

export function prepareStandardSetupQuery(
  workspace: StandardWorkspace,
  allowPhysicalEvents = false,
  allowLaterReports = false,
): PreparedStandardQuery {
  const branch = workspace.branches.find(
    (item) => item.id === workspace.activeBranchId,
  );
  if (!branch) throw new Error("活动分支不存在。");
  if (workspace.query.stage === "current" && !allowPhysicalEvents)
    return {
      status: "unsupported",
      reason: "当前角色查询需要至少一个已封闭的日夜阶段。",
      revision: branch.baseRevision,
    };
  const current = visibleStandardEvents(
    workspace,
    workspace.perspectiveSeat,
    branch.baseRevision,
  );
  const byId = new Map(current.map((event) => [event.id, event]));
  if (
    !allowPhysicalEvents &&
    current.some((event) =>
      [
        "nomination",
        "vote",
        "execution",
        "death",
        "slayer",
        "winner",
        "phase_closed",
      ].includes(event.payload.kind),
    )
  )
    return {
      status: "unsupported",
      reason: "白天或跨夜事实尚未接入7–15人通用符号查询。",
      revision: branch.baseRevision,
    };
  const selected = workspace.hypotheses.filter((hypothesis) =>
    branch.assumptionIds.includes(hypothesis.id),
  );
  const facts: SetupQueryInput["facts"] = [];
  const tokenFacts: NonNullable<SetupQueryInput["tokenFacts"]> = [];
  const sourceIds: string[] = [];
  let nightOnePoisoner: SetupQueryInput["nightOnePoisoner"];
  const reports = new Map<
    string,
    { event: StandardEvent; acceptedMessage: boolean; abilityActive: boolean }
  >();
  for (const premise of selected) {
    if (premise.kind === "actual_role") {
      facts.push({ seat: premise.seat, role: premise.role });
      continue;
    }
    if (premise.kind === "role_at_phase") {
      if (!allowPhysicalEvents)
        return {
          status: "unsupported",
          reason: "当前角色声称需要先确认其所在阶段及此前阶段的记录完整。",
          revision: branch.baseRevision,
        };
      continue;
    }
    if (premise.kind === "seen_token") {
      tokenFacts.push({ seat: premise.seat, shownRole: premise.shownRole });
      continue;
    }
    if (premise.kind === "night_one_poison") {
      if (nightOnePoisoner)
        return {
          status: "unsupported",
          reason: "同一首夜存在多个已采纳投毒行动。",
          revision: branch.baseRevision,
        };
      nightOnePoisoner = {
        seat: premise.poisonerSeat,
        target: premise.targetSeat,
      };
      continue;
    }
    const event = byId.get(premise.eventId);
    if (!event)
      return {
        status: "unsupported",
        reason: "已采纳报告在当前修订或私密视角下不可见。",
        revision: branch.baseRevision,
      };
    if (
      event.payload.kind !== "claim" ||
      event.payload.claimKind !== "ability_report" ||
      event.occurredAt?.phase !== "night"
    )
      return {
        status: "unsupported",
        reason: "能力报告需要明确的夜晚时间。",
        revision: branch.baseRevision,
      };
    if (event.occurredAt.cycle !== 1) {
      if (!allowLaterReports)
        return {
          status: "unsupported",
          reason: "跨夜能力报告需要封闭观察查询。",
          revision: branch.baseRevision,
        };
      sourceIds.push(event.id);
      continue;
    }
    const item = reports.get(event.id) ?? {
      event,
      acceptedMessage: false,
      abilityActive: false,
    };
    if (premise.kind === "report_accurate") item.acceptedMessage = true;
    else item.abilityActive = true;
    reports.set(event.id, item);
    sourceIds.push(event.id);
  }
  const mapped: FirstNightReport[] = [];
  for (const { event, acceptedMessage, abilityActive } of reports.values()) {
    const payload = event.payload;
    if (payload.kind !== "claim" || payload.claimKind !== "ability_report")
      continue;
    const base = {
      speaker: payload.speaker,
      acceptedMessage,
      abilityActive,
    };
    if (payload.role === "Librarian" && payload.value === 0) {
      mapped.push({ kind: "librarian_zero", ...base });
    } else if (
      (payload.role === "Washerwoman" ||
        payload.role === "Librarian" ||
        payload.role === "Investigator") &&
      payload.targets?.length === 2 &&
      isRole(payload.value)
    ) {
      mapped.push({
        kind: "pair_role",
        ability: payload.role,
        targets: [payload.targets[0], payload.targets[1]],
        seenRole: payload.value,
        ...base,
      });
    } else if (
      (payload.role === "Chef" || payload.role === "Empath") &&
      typeof payload.value === "number"
    ) {
      mapped.push({
        kind: payload.role.toLowerCase() as "chef" | "empath",
        count: payload.value,
        ...base,
      });
    } else if (
      payload.role === "Fortune Teller" &&
      payload.targets?.length === 2 &&
      typeof payload.value === "boolean"
    ) {
      mapped.push({
        kind: "fortune_teller",
        targets: [payload.targets[0], payload.targets[1]],
        yes: payload.value,
        ...base,
      });
    } else
      return {
        status: "unsupported",
        reason: "此角色报告尚未接入标准设置求解。",
        revision: branch.baseRevision,
      };
  }
  return {
    status: "ready",
    input: {
      playerCount: workspace.playerCount,
      facts,
      tokenFacts,
      query: workspace.query,
      reports: mapped,
      ...(nightOnePoisoner ? { nightOnePoisoner } : {}),
      timeoutMs: 5000,
    },
    sourceIds: [...new Set(sourceIds)],
    revision: branch.baseRevision,
  };
}

export type PreparedObservedQuery =
  | {
      status: "ready";
      input: ObservedQueryInput;
      sourceIds: string[];
      revision: number;
    }
  | { status: "unsupported"; reason: string; revision: number };

/** Compile only explicitly closed public/visible phases into hard observations. */
export function prepareStandardObservedQuery(
  workspace: StandardWorkspace,
): PreparedObservedQuery {
  const base = prepareStandardSetupQuery(workspace, true, true);
  if (base.status !== "ready") return base;
  const branch = workspace.branches.find(
    (item) => item.id === workspace.activeBranchId,
  )!;
  const current = visibleStandardEvents(
    workspace,
    workspace.perspectiveSeat,
    branch.baseRevision,
  );
  const physical = current.filter((event) =>
    [
      "nomination",
      "vote",
      "execution",
      "death",
      "slayer",
      "winner",
      "phase_closed",
    ].includes(event.payload.kind),
  );
  const historical = new Map(
    workspace.events
      .filter((event) => event.revision <= branch.baseRevision)
      .map((event) => [event.id, event]),
  );
  const originalRevision = (event: StandardEvent): number => {
    let original = event;
    while (original.correctsEventId !== undefined) {
      const previous = historical.get(original.correctsEventId);
      if (!previous || previous.revision >= original.revision)
        throw new Error("纠正记录的原记录或顺序无效。");
      original = previous;
    }
    return original.revision;
  };
  physical.sort(
    (left, right) => originalRevision(left) - originalRevision(right),
  );
  const fail = (reason: string): PreparedObservedQuery => ({
    status: "unsupported",
    reason,
    revision: branch.baseRevision,
  });
  if (!physical.length) return fail("当前修订没有可供跨阶段搜索的公开事实。");
  if (physical.some((event) => !event.occurredAt))
    return fail("跨阶段事实需要明确时间。");
  const last = physical.reduce(
    (max, event) =>
      Math.max(
        max,
        event.occurredAt!.cycle * 2 +
          (event.occurredAt!.phase === "day" ? 1 : 0),
      ),
    0,
  );
  const finalCycle = Math.floor(last / 2);
  const finalPhase = last % 2 === 1 ? "day" : "night";
  const phases: ObservedPhase[] = [];
  for (let cycle = 1; cycle <= finalCycle; cycle++) {
    const night = physical.filter(
      (event) =>
        event.occurredAt?.phase === "night" && event.occurredAt.cycle === cycle,
    );
    if (
      night.some(
        (event) =>
          event.payload.kind !== "death" &&
          event.payload.kind !== "winner" &&
          event.payload.kind !== "phase_closed",
      )
    )
      return fail(`N${cycle}包含尚未接入的行动。`);
    const nightCloses = night.filter(
      (event) => event.payload.kind === "phase_closed",
    );
    if (nightCloses.length > 1 || (cycle > 1 && nightCloses.length !== 1))
      return fail(
        `N${cycle}死亡记录尚未确认完整。请在“记录”中确认本阶段记录完整（或用 close deaths @N${cycle}）。`,
      );
    const nightWinners = night.flatMap((event) =>
      event.payload.kind === "winner" ? [event.payload.team] : [],
    );
    if (nightWinners.length > 1) return fail(`N${cycle}存在重复胜负记录。`);
    const nightDeaths = night.flatMap((event) =>
      event.payload.kind === "death" ? [event.payload.seat] : [],
    );
    if (cycle === 1 && nightDeaths.length) return fail("首夜不能有死亡记录。");
    if (new Set(nightDeaths).size !== nightDeaths.length)
      return fail(`N${cycle}存在重复死亡记录。`);
    phases.push({
      kind: "night",
      cycle,
      deaths: nightDeaths,
      ...(nightWinners[0] ? { winner: nightWinners[0] } : {}),
    });
    if (cycle === finalCycle && finalPhase === "night") break;

    const day = physical.filter(
      (event) =>
        event.occurredAt?.phase === "day" && event.occurredAt.cycle === cycle,
    );
    const dayCloses = day.filter(
      (event) => event.payload.kind === "phase_closed",
    );
    if (
      dayCloses.length !== 2 ||
      !dayCloses.some(
        (event) =>
          event.payload.kind === "phase_closed" &&
          event.payload.channel === "actions",
      ) ||
      !dayCloses.some(
        (event) =>
          event.payload.kind === "phase_closed" &&
          event.payload.channel === "deaths",
      )
    )
      return fail(
        `D${cycle}行动与死亡记录尚未确认完整。请在“记录”中确认本阶段记录完整（或用 close actions @D${cycle} 和 close deaths @D${cycle}）。`,
      );
    const votes = day.filter((event) => event.payload.kind === "vote");
    const nominations = day.filter(
      (event) => event.payload.kind === "nomination",
    );
    const nominationIds = new Set(nominations.map((event) => event.id));
    if (
      nominations.some(
        (nomination) =>
          votes.filter(
            (vote) =>
              vote.payload.kind === "vote" &&
              vote.payload.nominationId === nomination.id,
          ).length > 1,
      ) ||
      votes.some(
        (vote) =>
          vote.payload.kind === "vote" &&
          !nominationIds.has(vote.payload.nominationId ?? ""),
      )
    )
      return fail(`D${cycle}投票与提名的引用不完整或重复。`);
    const events: DayEvent[] = [];
    for (const event of day) {
      const payload = event.payload;
      if (payload.kind === "nomination") {
        const vote = votes.find(
          (item) =>
            item.payload.kind === "vote" &&
            item.payload.nominationId === event.id,
        );
        if (
          vote &&
          day
            .slice(day.indexOf(event) + 1, day.indexOf(vote))
            .some((item) =>
              ["slayer", "nomination", "execution", "death", "winner"].includes(
                item.payload.kind,
              ),
            )
        )
          return fail(
            `D${cycle}提名与计票之间存在其他公开行动，暂不支持这类交错顺序；请核对并保留实际发生顺序。`,
          );
        events.push({
          kind: "nomination",
          nominator: payload.nominator,
          nominee: payload.nominee,
          votes: vote?.payload.kind === "vote" ? vote.payload.voters : [],
        });
      } else if (payload.kind === "slayer") {
        events.push({
          kind: "slayer",
          actor: payload.actor,
          target: payload.target,
        });
      }
    }
    const deaths = day.flatMap((event) =>
      event.payload.kind === "death" ? [event.payload.seat] : [],
    );
    const dayWinners = day.flatMap((event) =>
      event.payload.kind === "winner" ? [event.payload.team] : [],
    );
    const executions = day.flatMap((event) =>
      event.payload.kind === "execution" ? [event.payload.seat] : [],
    );
    if (
      new Set(deaths).size !== deaths.length ||
      executions.length > 1 ||
      dayWinners.length > 1
    )
      return fail(`D${cycle}存在重复死亡或处决记录。`);
    phases.push({
      kind: "day",
      cycle,
      events,
      deaths,
      executedSeat: executions[0] ?? null,
      ...(dayWinners[0] ? { winner: dayWinners[0] } : {}),
    });
  }
  const reportEvents = new Map<
    string,
    {
      event: StandardEvent;
      acceptedMessage: boolean;
      abilityActive: boolean;
    }
  >();
  for (const premise of workspace.hypotheses.filter(
    (item) =>
      branch.assumptionIds.includes(item.id) &&
      (item.kind === "report_accurate" || item.kind === "ability_active"),
  )) {
    if (premise.kind !== "report_accurate" && premise.kind !== "ability_active")
      continue;
    const event = current.find((item) => item.id === premise.eventId);
    if (
      !event ||
      event.occurredAt?.phase !== "night" ||
      event.occurredAt.cycle === 1
    )
      continue;
    const report = reportEvents.get(event.id) ?? {
      event,
      acceptedMessage: false,
      abilityActive: false,
    };
    if (premise.kind === "report_accurate") report.acceptedMessage = true;
    else report.abilityActive = true;
    reportEvents.set(event.id, report);
  }
  const laterReports: ObservedReport[] = [];
  for (const {
    event,
    acceptedMessage,
    abilityActive,
  } of reportEvents.values()) {
    const payload = event.payload;
    if (payload.kind !== "claim" || payload.claimKind !== "ability_report")
      continue;
    const cycle = event.occurredAt!.cycle;
    if (cycle > finalCycle) return fail(`N${cycle}报告所在夜晚尚未封闭。`);
    const common = {
      cycle,
      speaker: payload.speaker,
      acceptedMessage,
      abilityActive,
    };
    if (payload.role === "Undertaker" && isRole(payload.value)) {
      laterReports.push({
        kind: "undertaker",
        seenRole: payload.value,
        ...common,
      });
    } else if (
      payload.role === "Ravenkeeper" &&
      payload.targets?.length === 1 &&
      isRole(payload.value)
    ) {
      laterReports.push({
        kind: "ravenkeeper",
        target: payload.targets[0],
        seenRole: payload.value,
        ...common,
      });
    } else if (payload.role === "Empath" && typeof payload.value === "number") {
      laterReports.push({ kind: "empath", count: payload.value, ...common });
    } else if (
      payload.role === "Fortune Teller" &&
      payload.targets?.length === 2 &&
      typeof payload.value === "boolean"
    ) {
      laterReports.push({
        kind: "fortune_teller",
        targets: [payload.targets[0], payload.targets[1]],
        yes: payload.value,
        ...common,
      });
    } else return fail("此跨夜角色报告尚未接入动态查询。");
  }
  const phaseRoleFacts: NonNullable<ObservedQueryInput["phaseRoleFacts"]> = [];
  for (const premise of workspace.hypotheses.filter((h) =>
    branch.assumptionIds.includes(h.id),
  )) {
    if (premise.kind !== "role_at_phase") continue;
    const index =
      2 * (premise.occurredAt.cycle - 1) +
      (premise.occurredAt.phase === "day" ? 1 : 0);
    if (index >= phases.length)
      return fail(
        `${premise.occurredAt.phase === "night" ? "N" : "D"}${premise.occurredAt.cycle}当前角色声称所在阶段尚未确认完整。`,
      );
    phaseRoleFacts.push({
      seat: premise.seat,
      role: premise.role,
      phaseIndex: index,
    });
  }
  const acceptedReports = new Set<string>();
  for (const report of laterReports) {
    if (!report.acceptedMessage || !report.abilityActive) continue;
    const key = `${report.cycle}:${report.kind}:${report.speaker}`;
    if (acceptedReports.has(key))
      return fail(`N${report.cycle}同一角色能力只能采纳一次实际展示的信息。`);
    acceptedReports.add(key);
  }
  return {
    status: "ready",
    input: {
      ...base.input,
      phases,
      laterReports,
      phaseRoleFacts,
      ...(workspace.query.stage === "current"
        ? {
            currentQuery: {
              seat: workspace.query.seat,
              role: workspace.query.role,
            },
          }
        : {}),
      timeoutMs: 7000,
      maxWorlds: 500,
      maxHistories: 5000,
    },
    sourceIds: [
      ...new Set([...base.sourceIds, ...physical.map((event) => event.id)]),
    ],
    revision: branch.baseRevision,
  };
}

/** Validate before local restore, import, or use as a solver premise. */
export function validateStandardWorkspace(value: unknown): StandardWorkspace {
  if (
    !isRecord(value) ||
    (value.schemaVersion !== 2 &&
      value.schemaVersion !== 3 &&
      value.schemaVersion !== 4 &&
      value.schemaVersion !== 5) ||
    value.profile !== "standard"
  )
    throw new Error("不是标准对局工作区导出数据。");
  const count = value.playerCount;
  if (
    !Number.isInteger(count) ||
    Number(count) < 7 ||
    Number(count) > 15 ||
    !nonempty(value.gameId) ||
    !nonempty(value.title) ||
    !validSeat(value.perspectiveSeat, Number(count)) ||
    !validSeat(value.selectedSeat, Number(count)) ||
    (value.recordingTime !== undefined && !validTime(value.recordingTime)) ||
    !isRecord(value.query) ||
    !validSeat(value.query.seat, Number(count)) ||
    !isRole(value.query.role) ||
    (value.query.stage !== undefined &&
      value.query.stage !== "initial" &&
      value.query.stage !== "current") ||
    !Array.isArray(value.events) ||
    !Array.isArray(value.hypotheses) ||
    !Array.isArray(value.branches) ||
    !nonempty(value.activeBranchId)
  )
    throw new Error("标准对局的人数、视角或查询字段无效。");
  const eventsById = new Map<string, Record<string, unknown>>();
  const retracted = new Set<string>();
  for (const [index, raw] of value.events.entries()) {
    if (
      !isRecord(raw) ||
      !nonempty(raw.id) ||
      eventsById.has(raw.id) ||
      raw.revision !== index + 1 ||
      !nonempty(raw.rawEntryId) ||
      !nonempty(raw.rawText) ||
      !validDate(raw.recordedAt) ||
      !Array.isArray(raw.sourceSpan) ||
      raw.sourceSpan.length !== 2 ||
      !Number.isInteger(raw.sourceSpan[0]) ||
      !Number.isInteger(raw.sourceSpan[1]) ||
      raw.sourceSpan[0] < 0 ||
      raw.sourceSpan[1] < raw.sourceSpan[0] ||
      raw.sourceSpan[1] > raw.rawText.length ||
      (raw.occurredAt !== undefined && !validTime(raw.occurredAt)) ||
      !isRecord(raw.payload) ||
      (raw.visibility !== "public" && raw.visibility !== "private") ||
      (raw.visibility === "private" &&
        (!validSeat(raw.ownerSeat, Number(count)) ||
          raw.ownerSeat !== value.perspectiveSeat)) ||
      (raw.visibility === "public" && raw.ownerSeat !== undefined)
    )
      throw new Error(`第${index + 1}条标准对局事件无效。`);
    const payload = raw.payload;
    const atPhase = (phase: GameTime["phase"]) =>
      validTime(raw.occurredAt) && raw.occurredAt.phase === phase;
    const pair = (target: unknown) =>
      Array.isArray(target) &&
      target.length === 2 &&
      target.every((seat) => validSeat(seat, Number(count))) &&
      target[0] !== target[1];
    let valid = false;
    switch (payload.kind) {
      case "claim":
        valid =
          validSeat(payload.speaker, Number(count)) && isRole(payload.role);
        if (payload.claimKind === "role") {
          valid &&=
            payload.targets === undefined &&
            payload.value === undefined &&
            (payload.identityStage === undefined ||
              payload.identityStage === "initial" ||
              (payload.identityStage === "current" &&
                validTime(raw.occurredAt)));
        } else if (payload.claimKind === "ability_report") {
          valid &&= atPhase("night") && payload.identityStage === undefined;
          if (
            payload.role === "Washerwoman" ||
            payload.role === "Librarian" ||
            payload.role === "Investigator"
          ) {
            valid &&=
              (payload.role === "Librarian" &&
                payload.value === 0 &&
                payload.targets === undefined) ||
              (pair(payload.targets) &&
                isRole(payload.value) &&
                ROLE_TEAM[payload.value] ===
                  (payload.role === "Washerwoman"
                    ? "townsfolk"
                    : payload.role === "Librarian"
                      ? "outsider"
                      : "minion"));
          } else if (payload.role === "Chef" || payload.role === "Empath") {
            valid &&=
              Number.isInteger(payload.value) &&
              Number(payload.value) >= 0 &&
              Number(payload.value) <=
                (payload.role === "Empath" ? 2 : Number(count)) &&
              payload.targets === undefined;
          } else if (payload.role === "Fortune Teller") {
            valid &&=
              pair(payload.targets) && typeof payload.value === "boolean";
          } else if (payload.role === "Undertaker") {
            valid &&= isRole(payload.value) && payload.targets === undefined;
          } else if (payload.role === "Ravenkeeper") {
            valid &&=
              isRole(payload.value) &&
              Array.isArray(payload.targets) &&
              payload.targets.length === 1 &&
              validSeat(payload.targets[0], Number(count));
          } else valid = false;
        } else valid = false;
        if (payload.change !== undefined) {
          const change = payload.change;
          const previous =
            isRecord(change) && nonempty(change.previousId)
              ? eventsById.get(change.previousId)
              : undefined;
          valid &&=
            isRecord(change) &&
            (change.kind === "correction" || change.kind === "changed_claim") &&
            validTime(change.announcedAt) &&
            previous !== undefined &&
            isRecord(previous.payload) &&
            previous.payload.kind === "claim" &&
            previous.payload.claimKind === payload.claimKind &&
            previous.payload.speaker === payload.speaker &&
            (previous.payload.identityStage ?? "initial") ===
              (payload.identityStage ?? "initial") &&
            previous.visibility === raw.visibility &&
            previous.ownerSeat === raw.ownerSeat &&
            ![...eventsById.values()].some(
              (e) =>
                isRecord(e.payload) &&
                e.payload.kind === "claim" &&
                isRecord(e.payload.change) &&
                e.payload.change.previousId === change.previousId &&
                !retracted.has(e.id as string),
            ) &&
            (change.kind === "correction"
              ? retracted.has(change.previousId as string)
              : !retracted.has(change.previousId as string));
          if (
            valid &&
            isRecord(change) &&
            change.kind === "changed_claim" &&
            (payload.claimKind === "ability_report" ||
              payload.identityStage === "current")
          ) {
            valid &&=
              validTime(previous!.occurredAt) &&
              validTime(raw.occurredAt) &&
              previous!.occurredAt.phase === raw.occurredAt.phase &&
              previous!.occurredAt.cycle === raw.occurredAt.cycle;
          }
        }
        break;
      case "nomination":
        valid =
          atPhase("day") &&
          validSeat(payload.nominator, Number(count)) &&
          validSeat(payload.nominee, Number(count));
        break;
      case "vote": {
        const nomination = nonempty(payload.nominationId)
          ? eventsById.get(payload.nominationId)
          : undefined;
        valid =
          atPhase("day") &&
          validSeat(payload.nominee, Number(count)) &&
          Array.isArray(payload.voters) &&
          payload.voters.every((seat: unknown) =>
            validSeat(seat, Number(count)),
          ) &&
          new Set(payload.voters).size === payload.voters.length &&
          nomination !== undefined &&
          !retracted.has(payload.nominationId as string) &&
          isRecord(nomination.payload) &&
          nomination.payload.kind === "nomination" &&
          nomination.payload.nominee === payload.nominee &&
          validTime(nomination.occurredAt) &&
          validTime(raw.occurredAt) &&
          nomination.occurredAt.phase === "day" &&
          nomination.occurredAt.cycle === raw.occurredAt.cycle &&
          (raw.visibility !== "public" || nomination.visibility === "public");
        break;
      }
      case "execution":
        valid = atPhase("day") && validSeat(payload.seat, Number(count));
        break;
      case "death":
        valid =
          validTime(raw.occurredAt) && validSeat(payload.seat, Number(count));
        break;
      case "winner":
        valid =
          validTime(raw.occurredAt) &&
          (payload.team === "good" || payload.team === "evil");
        break;
      case "slayer":
        valid =
          atPhase("day") &&
          validSeat(payload.actor, Number(count)) &&
          validSeat(payload.target, Number(count));
        break;
      case "phase_closed":
        valid =
          validTime(raw.occurredAt) &&
          (payload.channel === "deaths" ||
            (atPhase("day") && payload.channel === "actions"));
        break;
      case "retraction": {
        const target = nonempty(payload.targetId)
          ? eventsById.get(payload.targetId)
          : undefined;
        valid =
          target !== undefined &&
          isRecord(target.payload) &&
          target.payload.kind !== "retraction" &&
          !retracted.has(payload.targetId as string) &&
          nonempty(payload.reason) &&
          raw.visibility === target.visibility &&
          raw.ownerSeat === target.ownerSeat;
        if (valid) retracted.add(payload.targetId as string);
        break;
      }
    }
    if (!valid) throw new Error(`第${index + 1}条标准对局事件载荷或引用无效。`);
    if (raw.correctsEventId !== undefined) {
      const previous = nonempty(raw.correctsEventId)
        ? eventsById.get(raw.correctsEventId)
        : undefined;
      const ballot = payload.kind === "vote";
      const fact = payload.kind === "death" || payload.kind === "execution";
      const action = payload.kind === "nomination" || payload.kind === "slayer";
      const nomination =
        ballot && nonempty(payload.nominationId)
          ? eventsById.get(payload.nominationId)
          : undefined;
      const previousBallot =
        previous && isRecord(previous.payload) ? previous.payload : undefined;
      const correctedVoters = payload.voters;
      // Only the direct audited replacement of the original nomination can
      // rebind a ballot. Relinking preserves its voters; edits use vote correction.
      const reboundBallot =
        value.schemaVersion === 5 &&
        ballot &&
        previousBallot?.kind === "vote" &&
        nomination?.correctsEventId === previousBallot.nominationId &&
        Array.isArray(previousBallot.voters) &&
        Array.isArray(correctedVoters) &&
        previousBallot.voters.length === correctedVoters.length &&
        previousBallot.voters.every((seat: unknown) =>
          correctedVoters.includes(seat),
        );
      if (
        !(ballot
          ? value.schemaVersion >= 3
          : fact
            ? value.schemaVersion >= 4
            : action && value.schemaVersion === 5) ||
        !previous ||
        !isRecord(previous.payload) ||
        previous.payload.kind !== payload.kind ||
        !retracted.has(raw.correctsEventId as string) ||
        (ballot &&
          ((!reboundBallot &&
            (previous.payload.nominee !== payload.nominee ||
              previous.payload.nominationId !== payload.nominationId)) ||
            retracted.has(payload.nominationId as string))) ||
        (payload.kind === "nomination" &&
          [...eventsById.values()].some(
            (event) =>
              !retracted.has(event.id as string) &&
              isRecord(event.payload) &&
              event.payload.kind === "vote" &&
              event.payload.nominationId === raw.correctsEventId,
          )) ||
        !validTime(previous.occurredAt) ||
        !validTime(raw.occurredAt) ||
        previous.occurredAt.phase !== raw.occurredAt.phase ||
        previous.occurredAt.cycle !== raw.occurredAt.cycle ||
        previous.visibility !== raw.visibility ||
        previous.ownerSeat !== raw.ownerSeat ||
        [...eventsById.values()].some(
          (event) =>
            event.correctsEventId === raw.correctsEventId &&
            !retracted.has(event.id as string),
        )
      )
        throw new Error(
          `第${index + 1}条${ballot ? "投票" : "事实"}纠正的原记录、阶段或引用无效。`,
        );
    }
    eventsById.set(raw.id, raw);
  }
  const hypothesisIds = new Set<string>();
  for (const [index, raw] of value.hypotheses.entries()) {
    if (
      !isRecord(raw) ||
      !nonempty(raw.id) ||
      hypothesisIds.has(raw.id) ||
      !validDate(raw.createdAt)
    )
      throw new Error(`第${index + 1}条假设无效。`);
    if (raw.kind === "actual_role") {
      if (!validSeat(raw.seat, Number(count)) || !isRole(raw.role))
        throw new Error("真实角色假设无效。");
    } else if (raw.kind === "role_at_phase") {
      if (
        !validSeat(raw.seat, Number(count)) ||
        !isRole(raw.role) ||
        !validTime(raw.occurredAt)
      )
        throw new Error("阶段角色假设无效。");
    } else if (raw.kind === "seen_token") {
      if (!validSeat(raw.seat, Number(count)) || !isRole(raw.shownRole))
        throw new Error("所见角色token假设无效。");
    } else if (raw.kind === "night_one_poison") {
      if (
        !validSeat(raw.poisonerSeat, Number(count)) ||
        !validSeat(raw.targetSeat, Number(count))
      )
        throw new Error("首夜投毒假设无效。");
    } else if (
      raw.kind === "report_accurate" ||
      raw.kind === "ability_active"
    ) {
      const event = nonempty(raw.eventId)
        ? eventsById.get(raw.eventId)
        : undefined;
      if (
        !event ||
        !isRecord(event.payload) ||
        event.payload.kind !== "claim" ||
        event.payload.claimKind !== "ability_report"
      )
        throw new Error("报告假设引用了不存在的能力报告。");
    } else throw new Error("未知假设类型。");
    hypothesisIds.add(raw.id);
  }
  const branchIds = new Set<string>();
  for (const [index, raw] of value.branches.entries()) {
    if (
      !isRecord(raw) ||
      !nonempty(raw.id) ||
      branchIds.has(raw.id) ||
      !nonempty(raw.name) ||
      !validDate(raw.createdAt) ||
      !Number.isInteger(raw.baseRevision) ||
      Number(raw.baseRevision) < 0 ||
      Number(raw.baseRevision) > value.events.length ||
      !Array.isArray(raw.assumptionIds) ||
      !raw.assumptionIds.every(
        (id: unknown) => typeof id === "string" && hypothesisIds.has(id),
      ) ||
      new Set(raw.assumptionIds).size !== raw.assumptionIds.length ||
      (raw.parentId !== undefined && !branchIds.has(raw.parentId as string))
    )
      throw new Error(`第${index + 1}个标准对局分支无效。`);
    branchIds.add(raw.id);
  }
  if (!branchIds.has(value.activeBranchId))
    throw new Error("活动分支引用无效。");
  return value as unknown as StandardWorkspace;
}

const DB_NAME = "clocktower-reasoning-copilot";
const STORE = "workspace";
const STORAGE_KEY = "standard-current";
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE))
        request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadStandardWorkspace(): Promise<StandardWorkspace | null> {
  const database = await openDatabase();
  try {
    const value = await new Promise<unknown>((resolve, reject) => {
      const request = database
        .transaction(STORE, "readonly")
        .objectStore(STORE)
        .get(STORAGE_KEY);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
    return value === null ? null : validateStandardWorkspace(value);
  } finally {
    database.close();
  }
}

export async function saveStandardWorkspace(
  workspace: StandardWorkspace,
): Promise<void> {
  validateStandardWorkspace(workspace);
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE, "readwrite");
      transaction.objectStore(STORE).put(workspace, STORAGE_KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}
