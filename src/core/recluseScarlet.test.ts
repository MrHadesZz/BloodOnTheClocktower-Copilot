import { describe, expect, it } from "vitest";
import { resolveDay, type DayActions, type DayEvent } from "./day";
import { resolveNight, type DynamicState } from "./night";
import { replayTimeline } from "./timeline";
import { replayObservedWitness } from "./observedTimeline";
import {
  queryObservedTimeline,
  queryTimelineWorlds,
  type ObservedQueryInput,
} from "./symbolicSetup";
import type { Role } from "./model";

const roles: Role[] = [
  "Monk",
  "Soldier",
  "Mayor",
  "Ravenkeeper",
  "Undertaker",
  "Virgin",
  "Slayer",
  "Recluse",
  "Butler",
  "Poisoner",
  "Scarlet Woman",
  "Imp",
];
const fresh = (): DynamicState => ({
  roles: [...roles],
  alive: roles.map(() => true),
});
const execution: DayEvent = {
  kind: "nomination",
  nominator: 1,
  nominee: 8,
  votes: [1, 2, 3, 4, 5, 6],
};
const deathDay = (extra: Partial<DayActions> = {}) =>
  resolveDay(fresh(), { events: [execution], butlerMasterSeat: 1, ...extra });
function born() {
  const result = deathDay({ scarletRecluseRegistrations: [8] });
  if (result.status !== "ok") throw new Error(result.reason);
  return result.trace.state;
}
function request(): ObservedQueryInput {
  return {
    playerCount: 12,
    facts: roles.map((role, index) => ({ seat: index + 1, role })),
    query: { seat: 11, role: "Scarlet Woman" },
    currentQuery: { seat: 11, role: "Imp" },
    nightOnePoisoner: { seat: 10, target: 10 },
    phases: [
      { kind: "night", cycle: 1, deaths: [] },
      {
        kind: "day",
        cycle: 1,
        events: [execution],
        deaths: [8],
        executedSeat: 8,
      },
    ],
    timeoutMs: 10000,
    maxWorlds: 100,
    maxHistories: 10000,
  };
}

describe("Recluse death registers separately to Scarlet Woman", () => {
  it("changes Scarlet Woman's character while keeping the original Imp and actual alignments", () => {
    const result = deathDay({ scarletRecluseRegistrations: [8] });
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.trace.roleChanges).toEqual([
      {
        seat: 11,
        from: "Scarlet Woman",
        to: "Imp",
        reason: "scarlet_woman",
        registeredRecluseSeat: 8,
      },
    ]);
    expect(result.trace.state.roles[7]).toBe("Recluse");
    expect(result.trace.state.roles.slice(10)).toEqual(["Imp", "Imp"]);
    expect(result.trace.state.alive.slice(10)).toEqual([true, true]);
    expect(result.trace.state.alignments?.slice(7)).toEqual([
      "good",
      "good",
      "evil",
      "evil",
      "evil",
    ]);
    expect(result.trace.state.winner).toBeUndefined();
    const native = deathDay();
    expect(native.status).toBe("ok");
    if (native.status === "ok") expect(native.trace.roleChanges).toEqual([]);
  });
  it.each([false, true])(
    "does not reuse Slayer registration for Scarlet Woman: %s",
    (scarlet) => {
      const result = deathDay({
        events: [
          { kind: "slayer", actor: 7, target: 8, recluseRegistersDemon: true },
        ],
        ...(scarlet ? { scarletRecluseRegistrations: [8] } : {}),
      });
      expect(result.status).toBe("ok");
      if (result.status === "ok") {
        expect(result.trace.deaths).toEqual([8]);
        expect(result.trace.state.roles[10]).toBe(
          scarlet ? "Imp" : "Scarlet Woman",
        );
      }
    },
  );
  it("rejects a Scarlet Woman death choice if Slayer's independent registration prevents death", () => {
    expect(
      deathDay({
        events: [
          { kind: "slayer", actor: 7, target: 8, recluseRegistersDemon: false },
        ],
        scarletRecluseRegistrations: [8],
      }).status,
    ).toBe("invalid");
  });
  it.each([8, 11])(
    "a poisoned participant cannot supply a real inheritance choice: %s",
    (poisonedSeat) => {
      expect(
        deathDay({
          scarletRecluseRegistrations: [8],
          poisonSourceSeat: 10,
          poisonedSeat,
        }).status,
      ).toBe("invalid");
      const native = deathDay({ poisonSourceSeat: 10, poisonedSeat });
      expect(native.status).toBe("ok");
      if (native.status === "ok")
        expect(native.trace.state.roles[10]).toBe("Scarlet Woman");
    },
  );
  it.each([4, 5])(
    "checks %s living players immediately before the death",
    (count) => {
      const state = fresh();
      const living = count === 5 ? [7, 8, 10, 11, 12] : [7, 8, 11, 12];
      state.alive = roles.map((_, index) => living.includes(index + 1));
      const result = resolveDay(state, {
        events: [
          { kind: "slayer", actor: 7, target: 8, recluseRegistersDemon: true },
        ],
        scarletRecluseRegistrations: [8],
      });
      expect(result.status).toBe(count === 5 ? "ok" : "invalid");
      if (result.status === "ok") {
        expect(result.trace.state.alive.filter(Boolean)).toHaveLength(4);
        expect(result.trace.state.roles[10]).toBe("Imp");
      }
    },
  );
  it("does not let a dead Scarlet Woman inherit", () => {
    const state = fresh();
    state.alive[10] = false;
    expect(
      resolveDay(state, {
        events: [execution],
        scarletRecluseRegistrations: [8],
        butlerMasterSeat: 1,
      }).status,
    ).toBe("invalid");
  });
  it.each(
    [[8, 8], [12], [0], new Array<number>(1)].map((choices) => ({ choices })),
  )(
    "rejects duplicate, irrelevant, out-of-range or sparse choices %#",
    ({ choices: scarletRecluseRegistrations }) => {
      expect(deathDay({ scarletRecluseRegistrations }).status).toBe("invalid");
    },
  );
  it("creates a second Imp during an already-started single-Demon night and requires its later action", () => {
    const action = {
      cycle: 2,
      poisonerTarget: 10,
      monkTarget: 2,
      impTarget: 8,
      scarletRecluseRegistration: 8,
      butlerMasterSeat: 1,
      previousDayExecutionDeathSeat: null,
    };
    const result = resolveNight(fresh(), action);
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.trace.deaths).toEqual([8]);
    expect(result.trace.state.roles.slice(10)).toEqual(["Imp", "Imp"]);
    expect(resolveNight(result.trace.state, { cycle: 3 }).status).toBe(
      "invalid",
    );
    expect(resolveNight(fresh(), { ...action, monkTarget: 8 }).status).toBe(
      "invalid",
    );
    expect(resolveNight(fresh(), { ...action, poisonerTarget: 8 }).status).toBe(
      "invalid",
    );
    expect(
      resolveNight(fresh(), { ...action, poisonerTarget: 11 }).status,
    ).toBe("invalid");
  });
});

describe("day victory with multiple living Demons", () => {
  it.each([11, 12])(
    "killing Imp %s keeps the other alive, killing both wins for good",
    (first) => {
      const events: DayEvent[] = [{ kind: "slayer", actor: 7, target: first }];
      const one = resolveDay(born(), { events, butlerMasterSeat: 1 });
      expect(one.status).toBe("ok");
      if (one.status === "ok") expect(one.trace.state.winner).toBeUndefined();
      const both = resolveDay(born(), {
        events: [
          ...events,
          {
            kind: "nomination",
            nominator: 1,
            nominee: 23 - first,
            votes: [1, 2, 3, 4, 5, 6],
          },
        ],
        butlerMasterSeat: 1,
      });
      expect(both.status).toBe("ok");
      if (both.status === "ok") expect(both.trace.state.winner).toBe("good");
    },
  );
  it("still checks living Demon characters when the surviving Demon is good", () => {
    const state = born();
    state.alignments![11] = "good";
    state.alive = roles.map((_, index) => [0, 10, 11].includes(index));
    const result = resolveDay(state, {
      events: [
        { kind: "nomination", nominator: 1, nominee: 11, votes: [1, 11] },
      ],
    });
    expect(result.status).toBe("ok");
    if (result.status === "ok") expect(result.trace.state.winner).toBe("evil");
  });
});

describe("observed and concrete inheritance evidence", () => {
  it("replays night creation and the next day's two Demon deaths as a good victory", async () => {
    const input = request();
    const phases: ObservedQueryInput["phases"] = [
      { kind: "night", cycle: 1, deaths: [] },
      { kind: "day", cycle: 1, events: [], deaths: [], executedSeat: null },
      { kind: "night", cycle: 2, deaths: [8] },
      {
        kind: "day",
        cycle: 2,
        events: [
          { kind: "slayer", actor: 7, target: 11 },
          {
            kind: "nomination",
            nominator: 1,
            nominee: 12,
            votes: [1, 2, 3, 4, 5, 6],
          },
        ],
        deaths: [11, 12],
        executedSeat: 12,
        winner: "good",
      },
    ];
    const result = await queryObservedTimeline({ ...input, phases });
    expect(result.classification).toBe("necessary");
    expect(result.yes?.registrations).toContainEqual({
      interaction: "scarlet_woman_n2_11",
      seat: 8,
      role: "Imp",
    });
    expect(result.yes?.currentAlive?.slice(10)).toEqual([false, false]);
    expect(replayObservedWitness(result.yes!, { phases }, input).valid).toBe(
      true,
    );
  }, 20000);
  it("retains both registration possibilities and verifies concrete multi-Demon evidence", async () => {
    const input = request();
    const result = await queryObservedTimeline(input);
    expect(result.classification).toBe("contingent");
    expect(result.yes?.currentRoles?.slice(10)).toEqual(["Imp", "Imp"]);
    expect(result.yes?.currentAlive?.slice(10)).toEqual([true, true]);
    expect(result.no?.currentRoles?.[10]).toBe("Scarlet Woman");
    for (const witness of [result.yes!, result.no!])
      expect(replayObservedWitness(witness, input, input).valid).toBe(true);
    const pinned = await queryObservedTimeline({
      ...input,
      phaseRoleFacts: [{ phaseIndex: 1, seat: 11, role: "Imp" }],
    });
    expect(pinned.classification).toBe("necessary");
  }, 20000);
  it("continues a possible multi-Demon history into a supported later night", async () => {
    const input = request();
    const result = await queryObservedTimeline({
      ...input,
      phases: [...input.phases, { kind: "night", cycle: 2, deaths: [] }],
      phaseRoleFacts: [{ phaseIndex: 1, seat: 11, role: "Imp" }],
    });
    expect(result.classification).toBe("necessary");
    expect(
      replayObservedWitness(
        result.yes!,
        {
          ...input,
          phases: [...input.phases, { kind: "night", cycle: 2, deaths: [] }],
          phaseRoleFacts: [{ phaseIndex: 1, seat: 11, role: "Imp" }],
        },
        input,
      ).valid,
    ).toBe(true);
  }, 20000);
  it("includes the independent registration in fully specified timeline queries", async () => {
    const input = request();
    const timeline = [
      {
        kind: "night" as const,
        actions: { cycle: 1, poisonerTarget: 10, butlerMasterSeat: 1 },
      },
      {
        kind: "day" as const,
        events: [execution],
        scarletRecluseRegistrations: [8],
      },
    ];
    const result = await queryTimelineWorlds({
      ...input,
      timeline,
      observations: [{ deaths: [] }, { deaths: [8], executedSeat: 8 }],
    });
    expect(result.classification).toBe("necessary");
    expect(result.yes?.registrations).toContainEqual({
      interaction: "scarlet_woman_d1_11",
      seat: 8,
      role: "Imp",
    });
    expect(result.yes?.currentAlive?.slice(10)).toEqual([true, true]);
    const replay = replayTimeline({
      initialPlayers: roles.map((actualRole, index) => ({
        seat: index + 1,
        actualRole,
        shownToken: actualRole,
      })),
      phases: timeline,
    });
    expect(replay.status).toBe("ok");
  }, 20000);
});
