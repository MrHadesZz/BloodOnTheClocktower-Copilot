import { describe, expect, it } from "vitest";
import { resolveNight, type DynamicState } from "./night";
import { resolveDay } from "./day";
import { replayTimeline } from "./timeline";
import {
  queryObservedTimeline,
  queryTimelineWorlds,
  type ObservedQueryInput,
} from "./symbolicSetup";
import { replayObservedWitness } from "./observedTimeline";
import {
  validateStandardWorkspace,
  createStandardWorkspace,
  addStandardHypothesis,
  toggleStandardHypothesis,
  prepareStandardSetupQuery,
} from "./standardWorkspace";
import type { Role } from "./model";

const roles: Role[] = [
  "Monk",
  "Soldier",
  "Mayor",
  "Fortune Teller",
  "Undertaker",
  "Virgin",
  "Empath",
  "Recluse",
  "Butler",
  "Poisoner",
  "Scarlet Woman",
  "Imp",
];
const before = (): DynamicState => ({
  roles: [...roles],
  alive: roles.map((_, i) => i !== 10),
});
const transfer = (selfPoison = false) => {
  const result = resolveNight(before(), {
    cycle: 2,
    poisonerTarget: selfPoison ? 10 : 1,
    impTarget: 12,
    impSuccessorSeat: 8,
    monkTarget: 2,
    butlerMasterSeat: 1,
    previousDayExecutionDeathSeat: null,
  });
  if (result.status !== "ok") throw new Error(result.reason);
  return result.trace;
};

describe("persistent alignment and single-source self poison", () => {
  it("preserves good alignment through a Recluse transfer and the next day/night", () => {
    const night = transfer();
    expect(night.state.roles[7]).toBe("Imp");
    expect(night.state.alignments?.[7]).toBe("good");
    const day = resolveDay(night.state, {
      events: [],
      poisonedSeat: 1,
      poisonSourceSeat: 10,
      butlerMasterSeat: 1,
    });
    expect(day.status).toBe("ok");
    if (day.status !== "ok") return;
    const next = resolveNight(day.trace.state, {
      cycle: 3,
      poisonerTarget: 10,
      monkTarget: 2,
      impTarget: 6,
      butlerMasterSeat: 1,
      previousDayExecutionDeathSeat: null,
    });
    expect(next.status).toBe("ok");
    if (next.status === "ok") {
      expect(next.trace.state.alignments?.[7]).toBe("good");
      expect(next.trace.deaths).toEqual([6]);
    }
    expect(before().roles[7]).toBe("Recluse");
  });
  it("keeps a self-poisoned target poisoned until dusk and resets the next night", () => {
    const night = transfer(true);
    expect(night.poisonedAtInformationStep).toBe(10);
    const day = resolveDay(night.state, {
      events: [],
      poisonedSeat: 10,
      poisonSourceSeat: 10,
      butlerMasterSeat: 1,
    });
    expect(day.status).toBe("ok");
    if (day.status !== "ok") return;
    expect(day.trace.poisonAtDusk).toBeNull();
    const next = resolveNight(day.trace.state, {
      cycle: 3,
      poisonerTarget: 7,
      monkTarget: 2,
      impTarget: 10,
      butlerMasterSeat: 1,
      previousDayExecutionDeathSeat: null,
    });
    expect(next.status).toBe("ok");
    if (next.status === "ok") {
      expect(next.trace.deaths).toEqual([10]);
      expect(next.trace.poisonedAtInformationStep).toBeNull();
    }
  });
  it("ends self poison when the impaired Poisoner receives the Imp character", () => {
    const result = resolveNight(before(), {
      cycle: 2,
      poisonerTarget: 10,
      monkTarget: 2,
      impTarget: 12,
      impSuccessorSeat: 10,
      previousDayExecutionDeathSeat: null,
      butlerMasterSeat: 1,
    });
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.trace.state.roles[9]).toBe("Imp");
      expect(result.trace.state.alignments?.[9]).toBe("evil");
      expect(result.trace.poisonedAtInformationStep).toBeNull();
      expect(result.trace.poisonSourceSeat).toBeNull();
    }
  });
  it("does not change the victory rules when the living Demon is good", () => {
    const state = transfer().state;
    state.alive = state.roles.map((_, i) => [6, 7, 9].includes(i));
    const dying = resolveNight(state, {
      cycle: 3,
      poisonerTarget: 10,
      impTarget: 7,
      previousDayExecutionDeathSeat: null,
    });
    expect(dying.status).toBe("ok");
    if (dying.status === "ok") expect(dying.trace.state.winner).toBe("evil");
    const execution = resolveDay(state, {
      events: [{ kind: "nomination", nominator: 7, nominee: 8, votes: [7, 8] }],
    });
    expect(execution.status).toBe("ok");
    if (execution.status === "ok")
      expect(execution.trace.state.winner).toBe("good");
  });
  it.each([
    { alignments: ["good"] },
    { alignments: roles.map(() => "neither") },
    { alignments: new Array(12) },
  ])("rejects malformed alignment evidence %#", ({ alignments }) => {
    const state = { ...before(), alignments } as DynamicState;
    expect(resolveDay(state, { events: [], butlerMasterSeat: 1 }).status).toBe(
      "invalid",
    );
    expect(
      resolveNight(state, { cycle: 1, poisonerTarget: 10, butlerMasterSeat: 1 })
        .status,
    ).toBe("invalid");
  });
  it("round-trips an adopted self-poison premise without migrating old workspaces", () => {
    let workspace = addStandardHypothesis(createStandardWorkspace(12), {
      kind: "night_one_poison",
      poisonerSeat: 10,
      targetSeat: 10,
    });
    workspace = toggleStandardHypothesis(
      workspace,
      workspace.hypotheses.at(-1)!.id,
    );
    const restored = validateStandardWorkspace(
      JSON.parse(JSON.stringify(workspace)),
    );
    const prepared = prepareStandardSetupQuery(restored);
    expect(prepared.status).toBe("ready");
    if (prepared.status !== "ready") return;
    expect(prepared.input.nightOnePoisoner).toEqual({ seat: 10, target: 10 });
  });
});

export const goodImpRequest = (): ObservedQueryInput => {
  const bag = [...roles];
  bag[9] = "Spy";
  return {
    playerCount: 12,
    facts: bag.map((role, index) => ({ seat: index + 1, role })),
    query: { seat: 8, role: "Recluse" },
    currentQuery: { seat: 8, role: "Imp" },
    phases: [
      { kind: "night", cycle: 1, deaths: [] },
      {
        kind: "day",
        cycle: 1,
        events: [
          {
            kind: "nomination",
            nominator: 1,
            nominee: 11,
            votes: [1, 2, 3, 4, 5, 6],
          },
        ],
        deaths: [11],
        executedSeat: 11,
      },
      { kind: "night", cycle: 2, deaths: [12] },
      { kind: "day", cycle: 2, events: [], deaths: [], executedSeat: null },
      { kind: "night", cycle: 3, deaths: [6] },
    ],
    laterReports: [
      {
        kind: "empath",
        cycle: 3,
        speaker: 7,
        count: 0,
        abilityActive: true,
        acceptedMessage: true,
      },
      {
        kind: "fortune_teller",
        cycle: 3,
        speaker: 4,
        targets: [8, 2],
        yes: true,
        abilityActive: true,
        acceptedMessage: true,
      },
    ],
    phaseRoleFacts: [{ phaseIndex: 2, seat: 8, role: "Imp" }],
    timeoutMs: 10000,
    maxWorlds: 100,
    maxHistories: 10000,
  };
};

describe("independent role and alignment evidence in queries", () => {
  it("includes the persistent alignment in fully specified timeline evidence", async () => {
    const request = goodImpRequest();
    const result = await queryTimelineWorlds({
      ...request,
      timeline: [
        { kind: "night", actions: { cycle: 1, butlerMasterSeat: 1 } },
        {
          kind: "day",
          events: [
            {
              kind: "nomination",
              nominator: 1,
              nominee: 11,
              votes: [1, 2, 3, 4, 5, 6],
            },
          ],
        },
        {
          kind: "night",
          actions: {
            cycle: 2,
            monkTarget: 2,
            impTarget: 12,
            impSuccessorSeat: 8,
            butlerMasterSeat: 1,
          },
        },
      ],
      observations: [
        { deaths: [] },
        { deaths: [11], executedSeat: 11 },
        { deaths: [12] },
      ],
    });
    expect(result.classification).toBe("necessary");
    expect(result.yes?.currentRoles?.[7]).toBe("Imp");
    expect(result.yes?.currentAlignments?.[7]).toBe("good");
    expect(result.yes?.timeline).toHaveLength(3);
    expect(result.yes?.registrations).toContainEqual({
      interaction: "imp_successor_n2",
      seat: 8,
      role: "Poisoner",
    });
  }, 20000);
  it("replays good-Demon information and rejects changed alignment or missing transfer registration", async () => {
    const request = goodImpRequest();
    const result = await queryObservedTimeline(request);
    expect(result.classification).toBe("necessary");
    const witness = result.yes!;
    expect(witness.currentAlignments?.[7]).toBe("good");
    expect(replayObservedWitness(witness, request, request).valid).toBe(true);
    const forged = [...witness.currentAlignments!];
    forged[7] = "evil";
    expect(
      replayObservedWitness(
        { ...witness, currentAlignments: forged },
        request,
        request,
      ).valid,
    ).toBe(false);
    expect(
      replayObservedWitness(
        { ...witness, currentAlignments: undefined },
        request,
        request,
      ).valid,
    ).toBe(false);
    expect(
      replayObservedWitness(
        {
          ...witness,
          registrations: witness.registrations.filter(
            (r) => !r.interaction.startsWith("imp_successor_n"),
          ),
        },
        request,
        request,
      ).valid,
    ).toBe(false);
    const replay = replayTimeline({
      initialPlayers: witness.roles.map((actualRole, index) => ({
        seat: index + 1,
        actualRole,
        shownToken: witness.shownTokens[index],
      })),
      phases: witness.timeline!,
    });
    expect(replay.status).toBe("ok");
    if (replay.status === "ok")
      expect(replay.state.alignments?.[7]).toBe("good");
  }, 20000);
});
