import { describe, expect, it } from "vitest";
import {
  resolveNight,
  type DynamicState,
  type ImpAction,
  type NightActions,
} from "./night";
import { initialAlignments } from "./alignment";
import { resolveDay } from "./day";
import { replayTimeline } from "./timeline";
import {
  queryObservedTimeline,
  queryTimelineWorlds,
  type ObservedQueryInput,
} from "./symbolicSetup";
import { replayObservedWitness } from "./observedTimeline";
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
const execution = {
  kind: "nomination" as const,
  nominator: 1,
  nominee: 8,
  votes: [1, 2, 3, 4, 5, 6],
};
function born(): DynamicState {
  const result = resolveDay(
    {
      roles,
      alive: roles.map(() => true),
      alignments: initialAlignments(roles),
    },
    {
      events: [execution],
      scarletRecluseRegistrations: [8],
      butlerMasterSeat: 1,
    },
  );
  if (result.status !== "ok") throw new Error(result.reason);
  return result.trace.state;
}
function run(
  impActions: ImpAction[],
  options: Partial<NightActions> = {},
  state = born(),
) {
  return resolveNight(state, {
    cycle: 2,
    poisonerTarget: 10,
    monkTarget: 2,
    butlerMasterSeat: 1,
    previousDayExecutionDeathSeat: 8,
    impActions,
    ...options,
  });
}
function trace(
  impActions: ImpAction[],
  options: Partial<NightActions> = {},
  state = born(),
) {
  const result = run(impActions, options, state);
  expect(result.status, result.status === "ok" ? "" : result.reason).toBe("ok");
  if (result.status !== "ok") throw new Error(result.reason);
  return result.trace;
}
function request(): ObservedQueryInput {
  return {
    playerCount: 12,
    facts: roles.map((role, index) => ({ seat: index + 1, role })),
    nightOnePoisoner: { seat: 10, target: 10 },
    query: { seat: 10, role: "Poisoner" },
    currentQuery: { seat: 10, role: "Imp" },
    phases: [
      { kind: "night", cycle: 1, deaths: [] },
      {
        kind: "day",
        cycle: 1,
        events: [execution],
        deaths: [8],
        executedSeat: 8,
      },
      { kind: "night", cycle: 2, deaths: [11, 12] },
    ],
    timeoutMs: 10000,
    maxWorlds: 50,
    maxHistories: 50000,
  };
}

describe("ordered multi-Imp nights", () => {
  it.each([
    [11, 12],
    [12, 11],
  ])("resolves two independent kills in order %j", (first, second) => {
    const result = trace([
      { actor: first, target: 6 },
      { actor: second, target: 7 },
    ]);
    expect(result.deaths).toEqual([6, 7]);
    expect(result.state.winner).toBeUndefined();
    expect(result.impSteps.map((step) => step.actor)).toEqual([first, second]);
  });
  it("does not kill a repeated target twice", () => {
    expect(
      trace([
        { actor: 11, target: 6 },
        { actor: 12, target: 6 },
      ]).deaths,
    ).toEqual([6]);
  });
  it("cancels the turn of an Imp killed by the previous Imp", () => {
    const result = trace([
      { actor: 11, target: 12 },
      { actor: 12, skipReason: "dead" },
    ]);
    expect(result.deaths).toEqual([12]);
    expect(result.impSteps[1]).toEqual({
      actor: 12,
      target: null,
      deathSeat: null,
      skipReason: "dead",
    });
    expect(result.state.winner).toBeUndefined();
    expect(
      run([
        { actor: 11, target: 12 },
        { actor: 12, target: 6 },
      ]).status,
    ).toBe("invalid");
  });
  it("cures a poisoned later Imp as soon as the Poisoner dies", () => {
    const result = trace(
      [
        { actor: 11, target: 10 },
        { actor: 12, target: 7 },
      ],
      { poisonerTarget: 12 },
    );
    expect(result.deaths).toEqual([10, 7]);
    expect(result.poisonedAtInformationStep).toBeNull();
    expect(
      trace(
        [
          { actor: 12, target: 7 },
          { actor: 11, target: 10 },
        ],
        { poisonerTarget: 12 },
      ).deaths,
    ).toEqual([10]);
  });
  it("cures the later Imp immediately when the Poisoner becomes a new Imp", () => {
    const result = trace(
      [
        { actor: 11, target: 11, impSuccessorSeat: 10 },
        { actor: 12, target: 7 },
      ],
      { poisonerTarget: 12 },
    );
    expect(result.deaths).toEqual([11, 7]);
    expect(result.state.roles[9]).toBe("Imp");
    expect(result.poisonSourceSeat).toBeNull();
  });
  it("ends the Monk's protection immediately when its source dies", () => {
    const result = trace(
      [
        { actor: 11, target: 1 },
        { actor: 12, target: 7 },
      ],
      { monkTarget: 7 },
    );
    expect(result.deaths).toEqual([1, 7]);
    expect(result.protectedSeat).toBeNull();
    expect(
      trace(
        [
          { actor: 12, target: 7 },
          { actor: 11, target: 1 },
        ],
        { monkTarget: 7 },
      ).deaths,
    ).toEqual([1]);
  });
  it("restores the Soldier's safety before the next attack when the Poisoner dies", () => {
    expect(
      trace(
        [
          { actor: 11, target: 10 },
          { actor: 12, target: 2 },
        ],
        { poisonerTarget: 2, monkTarget: 3 },
      ).deaths,
    ).toEqual([10]);
    expect(
      trace(
        [
          { actor: 12, target: 2 },
          { actor: 11, target: 10 },
        ],
        { poisonerTarget: 2, monkTarget: 3 },
      ).deaths,
    ).toEqual([2, 10]);
  });
  it("applies one Monk protection to both attacks", () => {
    expect(
      trace(
        [
          { actor: 11, target: 7 },
          { actor: 12, target: 7 },
        ],
        { monkTarget: 7 },
      ).deaths,
    ).toEqual([]);
  });
  it("resolves each Mayor redirection against the current state", () => {
    const result = trace([
      { actor: 11, target: 3, mayorRedirectTarget: 12 },
      { actor: 12, skipReason: "dead" },
    ]);
    expect(result.deaths).toEqual([12]);
    expect(
      run(
        [
          { actor: 11, target: 3, mayorRedirectTarget: 6 },
          { actor: 12, target: 3, mayorRedirectTarget: 7 },
        ],
        { monkTarget: 3 },
      ).status,
    ).toBe("invalid");
    expect(
      run([
        { actor: 11, target: 3, mayorRedirectTarget: 11, impSuccessorSeat: 10 },
        { actor: 12, target: 6 },
      ]).status,
    ).toBe("invalid");
  });
  it("consumes a successor once while allowing the second Imp to die without ending the game", () => {
    const result = trace([
      { actor: 11, target: 11, impSuccessorSeat: 10 },
      { actor: 12, target: 12 },
    ]);
    expect(result.deaths).toEqual([11, 12]);
    expect(result.state.roles[9]).toBe("Imp");
    expect(result.state.alive[9]).toBe(true);
    expect(result.state.winner).toBeUndefined();
    expect(result.impSteps).toHaveLength(2);
    expect(
      run([
        { actor: 11, target: 11, impSuccessorSeat: 10 },
        { actor: 12, target: 12, impSuccessorSeat: 10 },
      ]).status,
    ).toBe("invalid");
  });
  it("allows a later Imp to kill a newly inherited Imp before next night's turn", () => {
    const result = trace([
      { actor: 11, target: 11, impSuccessorSeat: 10 },
      { actor: 12, target: 10 },
    ]);
    expect(result.deaths).toEqual([11, 10]);
    expect(result.state.winner).toBeUndefined();
  });
  it("gives good victory only when the last living Imp dies", () => {
    const state = born();
    state.alive = roles.map((_, index) => [0, 1, 2, 10, 11].includes(index));
    const result = trace(
      [
        { actor: 11, target: 11 },
        { actor: 12, target: 12 },
      ],
      {
        poisonerTarget: undefined,
        butlerMasterSeat: undefined,
        previousDayExecutionDeathSeat: null,
      },
      state,
    );
    expect(result.deaths).toEqual([11, 12]);
    expect(result.state.winner).toBe("good");
  });
  it("stops subsequent turns once two players remain", () => {
    const state = born();
    state.alive = roles.map((_, index) => [0, 10, 11].includes(index));
    const options = {
      poisonerTarget: undefined,
      butlerMasterSeat: undefined,
      previousDayExecutionDeathSeat: null,
    };
    const result = trace(
      [
        { actor: 11, target: 1 },
        { actor: 12, skipReason: "game_over" },
      ],
      options,
      state,
    );
    expect(result.deaths).toEqual([1]);
    expect(result.state.winner).toBe("evil");
    expect(
      run(
        [
          { actor: 11, target: 1 },
          { actor: 12, target: 11 },
        ],
        options,
        state,
      ).status,
    ).toBe("invalid");
  });
  it("requires every starting Imp exactly once, with no new or dead actors", () => {
    for (const actions of [
      [],
      [{ actor: 11, target: 6 }],
      [
        { actor: 11, target: 6 },
        { actor: 11, target: 7 },
      ],
      [
        { actor: 10, target: 6 },
        { actor: 12, target: 7 },
      ],
      [
        { actor: 8, skipReason: "dead" as const },
        { actor: 12, target: 7 },
      ],
      [
        { actor: 11, target: 16 },
        { actor: 12, target: 7 },
      ],
      [
        { actor: 11, skipReason: "dead" as const },
        { actor: 12, target: 7 },
      ],
      new Array<ImpAction>(2),
    ])
      expect(run(actions).status).toBe("invalid");
    expect(
      run(
        [
          { actor: 11, target: 6 },
          { actor: 12, target: 7 },
        ],
        { impTarget: 6 },
      ).status,
    ).toBe("invalid");
    expect(
      resolveNight(born(), {
        cycle: 2,
        poisonerTarget: 10,
        monkTarget: 2,
        impTarget: 6,
      }).status,
    ).toBe("invalid");
    expect(
      run(
        [
          { actor: 11, target: 6 },
          { actor: 12, target: 7 },
        ],
        { cycle: 1 },
      ).status,
    ).toBe("invalid");
  });
  it("preserves a surviving good Demon's alignment and victory relevance", () => {
    const state = born();
    state.alignments![10] = "good";
    const result = trace(
      [
        { actor: 11, target: 12 },
        { actor: 12, skipReason: "dead" },
      ],
      {},
      state,
    );
    expect(result.state.alignments![10]).toBe("good");
    expect(result.state.winner).toBeUndefined();
  });
});

describe("multi-Imp history and evidence", () => {
  it("replays explicit multiple night targets and a later Slayer and execution victory", async () => {
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
      {
        kind: "night" as const,
        actions: {
          cycle: 2,
          poisonerTarget: 10,
          monkTarget: 2,
          butlerMasterSeat: 1,
          impActions: [
            { actor: 11, target: 6 },
            { actor: 12, target: 10 },
          ],
        },
      },
      {
        kind: "day" as const,
        events: [
          { kind: "slayer" as const, actor: 7, target: 11 },
          {
            kind: "nomination" as const,
            nominator: 1,
            nominee: 12,
            votes: [1, 2, 3, 4, 5],
          },
        ],
      },
    ];
    const replay = replayTimeline({
      initialPlayers: roles.map((actualRole, i) => ({
        seat: i + 1,
        actualRole,
        shownToken: actualRole,
      })),
      phases: timeline,
    });
    expect(replay.status).toBe("ok");
    if (replay.status === "ok") expect(replay.state.winner).toBe("good");
    const answer = await queryTimelineWorlds({
      playerCount: input.playerCount,
      facts: input.facts,
      nightOnePoisoner: input.nightOnePoisoner,
      query: { seat: 11, role: "Scarlet Woman" },
      timeoutMs: input.timeoutMs,
      timeline,
      observations: [
        { deaths: [] },
        { deaths: [8], executedSeat: 8 },
        { deaths: [6, 10] },
        { deaths: [11, 12], executedSeat: 12, winner: "good" },
      ],
    });
    expect(answer.classification).toBe("necessary");
    expect(answer.yes?.timeline?.[2]).toEqual(timeline[2]);
    expect(answer.yes?.currentAlive?.slice(10)).toEqual([false, false]);
  }, 20000);
  it("infers a possible successor through a complete two-Imp night and rejects damaged action witnesses", async () => {
    const input = request();
    const answer = await queryObservedTimeline(input);
    expect(answer.classification).toBe("contingent");
    const witness = answer.yes!;
    expect(witness.timeline?.[2].kind).toBe("night");
    const phase = witness.timeline![2];
    if (phase.kind !== "night" || !phase.actions.impActions)
      throw new Error("Missing multiple Imp actions");
    expect(phase.actions.impActions.map((a) => a.actor).sort()).toEqual([
      11, 12,
    ]);
    expect(replayObservedWitness(witness, input, input).valid).toBe(true);
    for (const witness of [answer.yes!, answer.no!])
      expect(replayObservedWitness(witness, input, input).valid).toBe(true);
    for (const actions of [
      phase.actions.impActions.slice(0, 1),
      [phase.actions.impActions[0], phase.actions.impActions[0]],
      [
        { ...phase.actions.impActions[0], actor: 10 },
        phase.actions.impActions[1],
      ],
      [
        { ...phase.actions.impActions[0], target: 6 },
        phase.actions.impActions[1],
      ],
    ]) {
      const timeline = witness.timeline!.map((p, index) =>
        index === 2
          ? {
              kind: "night" as const,
              actions: { ...phase.actions, impActions: actions },
            }
          : p,
      );
      expect(
        replayObservedWitness({ ...witness, timeline }, input, input).valid,
      ).toBe(false);
    }
    expect(
      replayObservedWitness(
        {
          ...witness,
          registrations: [
            ...witness.registrations,
            { interaction: "imp_successor_n2_11", seat: 8, role: "Poisoner" },
          ],
        },
        input,
        input,
      ).valid,
    ).toBe(false);
  }, 20000);
  it("keeps a candidate-limit result unknown while searching supported multiple-Demon actions", async () => {
    const input = request();
    const answer = await queryObservedTimeline({ ...input, maxHistories: 1 });
    expect(answer.classification).toBe("unknown");
    expect(answer.unknownReason).toBe("candidate_limit");
  }, 20000);
  it("finishes the ordinary two-death current-role query within the workspace's existing history cap", async () => {
    const input = request();
    const answer = await queryObservedTimeline({
      ...input,
      currentQuery: { seat: 11, role: "Imp" },
      phases: [
        ...input.phases.slice(0, 2),
        { kind: "night", cycle: 2, deaths: [6, 7] },
      ],
      maxHistories: 5000,
    });
    expect(answer.classification).toBe("necessary");
    expect(
      replayObservedWitness(
        answer.yes!,
        {
          ...input,
          phases: [
            ...input.phases.slice(0, 2),
            { kind: "night", cycle: 2, deaths: [6, 7] },
          ],
        },
        input,
      ).valid,
    ).toBe(true);
  }, 20000);
});
