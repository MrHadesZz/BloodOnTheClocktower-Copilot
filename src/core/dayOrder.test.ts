import { describe, expect, it } from "vitest";
import { resolveDay, type DayEvent } from "./day";
import type { Role } from "./model";
import type { DynamicState } from "./night";
import { replayTimeline } from "./timeline";
import {
  createStandardWorkspace,
  commitStandardDrafts,
  prepareStandardObservedQuery,
} from "./standardWorkspace";
import { closeStandardPhase } from "./standardHistory";
import type { EventPayload } from "./model";

const roles: Role[] = [
  "Slayer",
  "Chef",
  "Monk",
  "Undertaker",
  "Virgin",
  "Recluse",
  "Saint",
  "Spy",
  "Imp",
];
const before = (living?: number[]): DynamicState => ({
  roles: [...roles],
  alive: roles.map((_, i) => !living || living.includes(i + 1)),
});
const nomination = (nominee: number, votes = [1, 2, 3, 4]): DayEvent => ({
  kind: "nomination",
  nominator: 2,
  nominee,
  votes,
});
const shot: DayEvent = {
  kind: "slayer",
  actor: 1,
  target: 6,
  recluseRegistersDemon: true,
};
const run = (events: DayEvent[], state = before()) => {
  const result = resolveDay(state, { events });
  if (result.status !== "ok") throw new Error(result.reason);
  return result.trace;
};

describe("day order, vote moments and execution death", () => {
  it.each(["slayer", "nomination", "claim"] as const)(
    "does not silently reorder a %s between nomination and counting",
    (kind) => {
      let workspace = createStandardWorkspace(9);
      const time = { phase: "day", cycle: 1 } as const;
      workspace = closeStandardPhase(
        workspace,
        { phase: "night", cycle: 1 },
        true,
      );
      const interruption: EventPayload =
        kind === "slayer"
          ? { kind, actor: 1, target: 6 }
          : kind === "nomination"
            ? { kind, nominator: 1, nominee: 7 }
            : { kind, speaker: 2, claimKind: "role", role: "Chef" };
      for (const payload of [
        { kind: "nomination", nominator: 2, nominee: 3 },
        interruption,
        { kind: "vote", nominee: 3, voters: [1, 2, 3, 4] },
      ] as EventPayload[]) {
        workspace = commitStandardDrafts(
          workspace,
          "公开事件顺序",
          [
            {
              payload,
              occurredAt: time,
              label: "公开事件顺序",
              sourceSpan: [0, 6],
            },
          ],
          "public",
        );
      }
      workspace = closeStandardPhase(workspace, time, true);
      workspace = {
        ...workspace,
        query: { seat: 9, role: "Imp", stage: "initial" },
      };
      const result = prepareStandardObservedQuery(workspace);
      expect(result.status).toBe(kind === "claim" ? "ready" : "unsupported");
      if (result.status === "unsupported")
        expect(result.reason).toContain("暂不支持这类交错顺序");
    },
  );
  it("does not promote a failed four-vote ballot after nine living becomes eight", () => {
    const trace = run([nomination(3), shot]);
    expect(trace.executedSeat).toBeNull();
    expect(trace.deaths).toEqual([6]);
  });
  it("accepts those same four votes when the Slayer death precedes the ballot", () => {
    const trace = run([shot, nomination(3)]);
    expect(trace.executedSeat).toBe(3);
    expect(trace.deaths).toEqual([6, 3]);
  });
  it("keeps the Slayer good victory and does not execute the Saint on the block", () => {
    const trace = run([
      nomination(7, [1, 2, 3, 4, 5]),
      { kind: "slayer", actor: 1, target: 9 },
    ]);
    expect(trace.state.winner).toBe("good");
    expect(trace.executedSeat).toBeNull();
    expect(trace.deaths).toEqual([9]);
    expect(trace.state.alive[6]).toBe(true);
  });
  it("stops at two living after a Recluse shot instead of executing the remaining Imp", () => {
    const trace = run(
      [{ kind: "nomination", nominator: 1, nominee: 9, votes: [1, 6] }, shot],
      before([1, 6, 9]),
    );
    expect(trace.state.winner).toBe("evil");
    expect(trace.executedSeat).toBeNull();
    expect(trace.deaths).toEqual([6]);
    expect(trace.state.alive[8]).toBe(true);
  });
  it("does not give Undertaker information when the shot victim is later executed dead", () => {
    const replay = replayTimeline({
      initialPlayers: roles.map((actualRole, i) => ({
        seat: i + 1,
        actualRole,
        shownToken: actualRole,
      })),
      phases: [
        { kind: "night", actions: { cycle: 1 } },
        { kind: "day", events: [shot, nomination(6)] },
        { kind: "night", actions: { cycle: 2, impTarget: 6, monkTarget: 2 } },
      ],
    });
    expect(replay.status).toBe("ok");
    if (replay.status !== "ok") return;
    expect(replay.traces[1]).toMatchObject({ executedSeat: 6, deaths: [6] });
    expect(replay.traces[2]).toMatchObject({ undertakerInfo: null });
  });
  it("retains earlier tallies but lets Virgin immediately replace the pending execution", () => {
    const trace = run([
      nomination(7, [1, 2, 3, 4, 5]),
      { kind: "nomination", nominator: 3, nominee: 5, votes: [] },
    ]);
    expect(trace.executedSeat).toBe(3);
    expect(trace.deaths).toEqual([3]);
    expect(trace.state.alive[6]).toBe(true);
    expect(trace.state.spentVirginSeats).toEqual([5]);
  });
  it("rejects a recorded action after an immediate winner", () => {
    expect(
      resolveDay(before(), {
        events: [{ kind: "slayer", actor: 1, target: 9 }, nomination(3)],
      }).status,
    ).toBe("invalid");
  });
  it("keeps vote population and the exact event that caused each death", () => {
    const trace = run([nomination(3), shot]);
    expect(trace.nominationTallies).toEqual([
      { eventIndex: 0, nominee: 3, votes: 4, aliveAtVote: 9, threshold: 5 },
    ]);
    expect(trace.eventSteps).toEqual([
      { eventIndex: 0, deaths: [], executedSeat: null, aliveAfter: 9 },
      { eventIndex: 1, deaths: [6], executedSeat: null, aliveAfter: 8 },
    ]);
    expect(trace.executionDeathSeat).toBeNull();
  });
  it("does not execute either player when a later ballot ties an earlier failed tally", () => {
    const trace = run([
      nomination(3),
      shot,
      { kind: "nomination", nominator: 1, nominee: 2, votes: [1, 2, 3, 4] },
    ]);
    expect(trace.executedSeat).toBeNull();
    expect(trace.deaths).toEqual([6]);
  });
  it("preserves a dead vote already spent on the ballot that Virgin superseded", () => {
    const state = before();
    state.alive[7] = false;
    const trace = run(
      [
        nomination(7, [1, 2, 3, 8]),
        { kind: "nomination", nominator: 3, nominee: 5, votes: [] },
      ],
      state,
    );
    expect(trace.executedSeat).toBe(3);
    expect(trace.executionDeathSeat).toBe(3);
    expect(trace.executionCause).toBe("virgin");
    expect(trace.state.spentDeadVotes).toEqual([8]);
    expect(trace.deaths).toEqual([3]);
  });
  it("gives good victory priority when the final Imp shot leaves two alive", () => {
    const trace = run(
      [
        { kind: "nomination", nominator: 1, nominee: 7, votes: [1, 7] },
        { kind: "slayer", actor: 1, target: 9 },
      ],
      before([1, 7, 9]),
    );
    expect(trace.state.winner).toBe("good");
    expect(trace.state.alive.filter(Boolean)).toHaveLength(2);
    expect(trace.executedSeat).toBeNull();
  });
  it("still gives Undertaker the actual execution victim after another Slayer death", () => {
    const replay = replayTimeline({
      initialPlayers: roles.map((actualRole, i) => ({
        seat: i + 1,
        actualRole,
        shownToken: actualRole,
      })),
      phases: [
        { kind: "night", actions: { cycle: 1 } },
        { kind: "day", events: [shot, nomination(3)] },
        { kind: "night", actions: { cycle: 2, impTarget: 6 } },
      ],
    });
    expect(replay.status).toBe("ok");
    if (replay.status !== "ok") return;
    expect(replay.traces[1]).toMatchObject({
      executionDeathSeat: 3,
      executedSeat: 3,
      deaths: [6, 3],
    });
    expect(replay.traces[2]).toMatchObject({
      undertakerInfo: { speaker: 4, executedSeat: 3, seenRole: "Monk" },
    });
  });
});
