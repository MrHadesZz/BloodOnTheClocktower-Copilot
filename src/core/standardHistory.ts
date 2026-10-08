import {
  eventLabel,
  timeLabel,
  type ClaimPayload,
  type GameTime,
  type Role,
  type EventPayload,
} from "./model";
import {
  commitStandardDrafts,
  retractStandardEvent,
  validateStandardWorkspace,
  visibleStandardEvents,
  requireLatestStandardRevision,
  type StandardEvent,
  type StandardWorkspace,
} from "./standardWorkspace";

export const phaseIndex = (time: GameTime) =>
  2 * (time.cycle - 1) + (time.phase === "day" ? 1 : 0);
export const samePhase = (a?: GameTime, b?: GameTime) =>
  !!a && !!b && phaseIndex(a) === phaseIndex(b);
export const timeAtIndex = (index: number): GameTime => ({
  cycle: Math.floor(index / 2) + 1,
  phase: index % 2 ? "day" : "night",
});
export const activeRevision = (w: StandardWorkspace) =>
  w.branches.find((b) => b.id === w.activeBranchId)!.baseRevision;
export const visibleAtBranch = (w: StandardWorkspace) =>
  visibleStandardEvents(w, w.perspectiveSeat, activeRevision(w));

/** Superseded statements stay in history and can remain manually adopted, but are not auto-adopted. */
export function currentStandardClaims(
  events: StandardEvent[],
  history = events,
) {
  const byId = new Map(history.map((e) => [e.id, e]));
  const superseded = new Set<string>();
  for (const event of events) {
    let payload = event.payload;
    while (
      payload.kind === "claim" &&
      payload.change &&
      !superseded.has(payload.change.previousId)
    ) {
      const previousId = payload.change.previousId;
      superseded.add(previousId);
      const previous = byId.get(previousId);
      if (!previous) break;
      payload = previous.payload;
    }
  }
  return events.filter(
    (e, index) =>
      e.payload.kind === "claim" &&
      !superseded.has(e.id) &&
      (e.payload.claimKind !== "role" ||
        !events
          .slice(index + 1)
          .some(
            (later) =>
              later.payload.kind === "claim" &&
              later.payload.claimKind === "role" &&
              e.payload.kind === "claim" &&
              later.payload.speaker === e.payload.speaker &&
              (later.payload.identityStage ?? "initial") ===
                (e.payload.identityStage ?? "initial") &&
              (e.payload.identityStage !== "current" ||
                samePhase(e.occurredAt, later.occurredAt)),
          )),
  );
}

function requireLatestRevision(w: StandardWorkspace) {
  requireLatestStandardRevision(w);
}

export type CorrectableFactPayload = Extract<
  EventPayload,
  { kind: "death" | "execution" }
>;

/** Preserve the source, phase, visibility and original replay position of a corrected fact. */
export function correctStandardFact(
  workspace: StandardWorkspace,
  eventId: string,
  payload: CorrectableFactPayload,
): StandardWorkspace {
  requireLatestRevision(workspace);
  const source = visibleAtBranch(workspace).find(
    (event) => event.id === eventId,
  );
  if (
    !source ||
    !source.occurredAt ||
    (source.payload.kind !== "death" && source.payload.kind !== "execution")
  )
    throw new Error("待纠正的死亡或处决记录已撤回或在当前视角下不可见。");
  if (payload.kind !== source.payload.kind)
    throw new Error("纠正必须保持原记录类型；处决与死亡请分别核对。");
  if (
    !Number.isInteger(payload.seat) ||
    payload.seat < 1 ||
    payload.seat > workspace.playerCount
  )
    throw new Error("纠正的玩家座位无效。");
  if (payload.seat === source.payload.seat) return workspace;
  const next = retractStandardEvent(
    workspace,
    source.id,
    "事实纠正：保留原记录和发生位置，请重新核对本阶段完整性。",
  );
  const label = `${payload.kind === "death" ? "死亡" : "处决"}纠正：${eventLabel({ payload })} · ${timeLabel(source.occurredAt)}`;
  return commitStandardDrafts(
    next,
    label,
    [
      {
        payload: { ...payload },
        occurredAt: source.occurredAt,
        correctsEventId: source.id,
        label,
        sourceSpan: [0, label.length],
      },
    ],
    source.visibility,
  );
}

/** Append an audited replacement without moving the original ballot in replay order. */
export function correctStandardVote(
  workspace: StandardWorkspace,
  voteId: string,
  voters: number[],
): StandardWorkspace {
  requireLatestRevision(workspace);
  const visible = visibleAtBranch(workspace);
  const vote = visible.find((event) => event.id === voteId);
  if (!vote || vote.payload.kind !== "vote" || !vote.occurredAt)
    throw new Error("待纠正的投票已撤回或在当前视角下不可见。");
  const ballot = vote.payload;
  if (
    !visible.some(
      (event) =>
        event.id === ballot.nominationId && event.payload.kind === "nomination",
    )
  )
    throw new Error("这次投票关联的提名已撤回，请先核对提名记录。");
  if (
    new Set(voters).size !== voters.length ||
    voters.some(
      (seat) =>
        !Number.isInteger(seat) || seat < 1 || seat > workspace.playerCount,
    )
  )
    throw new Error("举手玩家包含重复或无效座位。");
  if (
    voters.length === ballot.voters.length &&
    voters.every((seat) => ballot.voters.includes(seat))
  )
    return workspace;
  const next = retractStandardEvent(
    workspace,
    vote.id,
    "投票纠正：保留原投票位置和原文，请重新核对本日记录完整性。",
  );
  const payload = { ...ballot, voters: [...voters] };
  const label = `投票纠正：${eventLabel({ payload })} · ${timeLabel(vote.occurredAt)}`;
  return commitStandardDrafts(
    next,
    label,
    [
      {
        payload,
        occurredAt: vote.occurredAt,
        correctsEventId: vote.id,
        label,
        sourceSpan: [0, label.length],
      },
    ],
    vote.visibility,
  );
}

/** Append a linked correction or changed statement. Corrections retire only the mistaken source. */
export function amendStandardClaim(
  workspace: StandardWorkspace,
  previousId: string,
  payload: ClaimPayload,
  occurredAt: GameTime,
  kind: "correction" | "changed_claim",
  announcedAt = occurredAt,
) {
  requireLatestRevision(workspace);
  const previous = currentStandardClaims(
    visibleAtBranch(workspace),
    workspace.events,
  ).find((e) => e.id === previousId);
  if (!previous || previous.payload.kind !== "claim")
    throw new Error("待修改的声称已经撤回、改口或在当前视角下不可见。");
  if (
    previous.payload.speaker !== payload.speaker ||
    previous.payload.claimKind !== payload.claimKind ||
    (previous.payload.identityStage ?? "initial") !==
      (payload.identityStage ?? "initial")
  )
    throw new Error("修改必须对应同一玩家、声称类型和身份时点。");
  if (
    kind === "changed_claim" &&
    (payload.claimKind === "ability_report" ||
      payload.identityStage === "current") &&
    !samePhase(previous.occurredAt, occurredAt)
  )
    throw new Error(
      "改口必须对应原报告或角色声称的同一阶段；其他阶段请新增记录。",
    );
  let next = workspace;
  if (kind === "correction") {
    next = retractStandardEvent(
      next,
      previousId,
      "录入纠正：原记录不准确，保留原文供回看。",
    );
    const replacedHypotheses = new Set(
      next.hypotheses.flatMap((h) =>
        "eventId" in h && h.eventId === previousId ? [h.id] : [],
      ),
    );
    next = {
      ...next,
      branches: next.branches.map((b) =>
        b.id === next.activeBranchId
          ? {
              ...b,
              assumptionIds: b.assumptionIds.filter(
                (id) => !replacedHypotheses.has(id),
              ),
            }
          : b,
      ),
    };
  }
  const updated: ClaimPayload = {
    ...payload,
    change: { kind, previousId, announcedAt },
  };
  const label = `${kind === "correction" ? "录入纠正" : "玩家改口"}：${eventLabel({ payload: updated })} · ${timeLabel(occurredAt)}`;
  next = commitStandardDrafts(
    next,
    label,
    [{ payload: updated, occurredAt, label, sourceSpan: [0, label.length] }],
    previous.visibility,
  );
  validateStandardWorkspace(next);
  return next;
}

export function recordStandardRoleClaim(
  w: StandardWorkspace,
  seat: number,
  role: Role,
  occurredAt: GameTime,
  identityStage: "initial" | "current",
  changeKind: "correction" | "changed_claim" = "correction",
) {
  requireLatestRevision(w);
  const previous = currentStandardClaims(visibleAtBranch(w), w.events)
    .filter(
      (e) =>
        e.payload.kind === "claim" &&
        e.payload.claimKind === "role" &&
        e.payload.speaker === seat &&
        (e.payload.identityStage ?? "initial") === identityStage &&
        (identityStage === "initial" || samePhase(e.occurredAt, occurredAt)),
    )
    .at(-1);
  const payload: ClaimPayload = {
    kind: "claim",
    claimKind: "role",
    speaker: seat,
    role,
    identityStage,
  };
  if (previous)
    return amendStandardClaim(w, previous.id, payload, occurredAt, changeKind);
  const label = `${eventLabel({ payload })} · ${timeLabel(occurredAt)}`;
  const next = commitStandardDrafts(
    w,
    label,
    [{ payload, occurredAt, label, sourceSpan: [0, label.length] }],
    "private",
  );
  validateStandardWorkspace(next);
  return next;
}

export function standardPhaseStatus(w: StandardWorkspace, time: GameTime) {
  const records = visibleAtBranch(w).filter((e) =>
    samePhase(e.occurredAt, time),
  );
  const required = time.phase === "day" ? ["actions", "deaths"] : ["deaths"];
  const missing = required.filter(
    (channel) =>
      !records.some(
        (e) =>
          e.payload.kind === "phase_closed" && e.payload.channel === channel,
      ),
  );
  return { records, complete: !missing.length, missing };
}

export function closeStandardPhase(
  w: StandardWorkspace,
  time: GameTime,
  confirmed: boolean,
) {
  requireLatestRevision(w);
  if (!confirmed) throw new Error("请先确认本阶段行动与死亡记录已收齐。");
  const status = standardPhaseStatus(w, time);
  if (status.complete) return w;
  const label = `${timeLabel(time)}本阶段记录完整`;
  const next = commitStandardDrafts(
    w,
    label,
    status.missing.map((channel) => ({
      payload: {
        kind: "phase_closed" as const,
        channel: channel as "actions" | "deaths",
      },
      occurredAt: time,
      label,
      sourceSpan: [0, label.length] as [number, number],
    })),
    "private",
  );
  validateStandardWorkspace(next);
  return next;
}

export interface HistoryRow {
  event: StandardEvent;
  status: "active" | "superseded" | "corrected" | "retracted";
  successor?: StandardEvent;
}

/** Includes retired originals under the same revision/privacy boundary as analysis. */
export function standardHistory(w: StandardWorkspace): HistoryRow[] {
  const raw = w.events.filter(
    (e) =>
      e.revision <= activeRevision(w) &&
      (e.visibility === "public" || e.ownerSeat === w.perspectiveSeat),
  );
  const visible = visibleAtBranch(w);
  const activeIds = new Set(visible.map((e) => e.id));
  const currentClaimIds = new Set(
    currentStandardClaims(visible, raw).map((e) => e.id),
  );
  return raw
    .filter((e) => e.payload.kind !== "retraction")
    .map((event) => {
      const successor =
        visible.find(
          (e) =>
            e.payload.kind === "claim" &&
            e.payload.change?.previousId === event.id,
        ) ?? raw.find((candidate) => candidate.correctsEventId === event.id);
      return {
        event,
        successor,
        status:
          (successor?.payload.kind === "claim" &&
            successor.payload.change?.kind === "correction") ||
          successor?.correctsEventId === event.id
            ? "corrected"
            : !activeIds.has(event.id)
              ? "retracted"
              : successor ||
                  (event.payload.kind === "claim" &&
                    !currentClaimIds.has(event.id))
                ? "superseded"
                : "active",
      };
    });
}

export function missingStandardPhases(w: StandardWorkspace, through: GameTime) {
  return Array.from({ length: phaseIndex(through) + 1 }, (_, i) =>
    timeAtIndex(i),
  ).filter((time) => !standardPhaseStatus(w, time).complete);
}
