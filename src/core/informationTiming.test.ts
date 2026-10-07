import { describe, expect, it } from "vitest";
import { resolveNight, type DynamicState, type NightActions } from "./night";
import { resolveDay } from "./day";
import { initialAlignments } from "./alignment";
import type { Role } from "./model";
import {
  queryObservedTimeline,
  type ObservedQueryInput,
  type SetupWitness,
} from "./symbolicSetup";
import { replayObservedWitness } from "./observedTimeline";
import { describeConditionExplanation } from "./claimConditionAnalysis";

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
function born(): DynamicState {
  const result = resolveDay(
    {
      roles,
      alive: roles.map(() => true),
      alignments: initialAlignments(roles),
    },
    {
      events: [
        {
          kind: "nomination",
          nominator: 1,
          nominee: 8,
          votes: [1, 2, 3, 4, 5, 6],
        },
      ],
      scarletRecluseRegistrations: [8],
      butlerMasterSeat: 1,
    },
  );
  if (result.status !== "ok") throw new Error(result.reason);
  return result.trace.state;
}
function run(actions: Partial<NightActions>, state = born()) {
  return resolveNight(state, {
    cycle: 2,
    poisonerTarget: 10,
    monkTarget: 2,
    previousDayExecutionDeathSeat: 8,
    butlerMasterSeat: 1,
    ...actions,
  });
}
function trace(actions: Partial<NightActions>, state = born()) {
  const result = run(actions, state);
  expect(result.status, result.status === "ok" ? "" : result.reason).toBe("ok");
  if (result.status !== "ok") throw new Error(result.reason);
  return result.trace;
}

describe("Ravenkeeper information uses the state at death", () => {
  it("learns Poisoner before that player later becomes Imp", () => {
    const result = trace({
      ravenkeeperTarget: 10,
      impActions: [
        { actor: 11, target: 4 },
        { actor: 12, target: 12, impSuccessorSeat: 10 },
      ],
    });
    expect(result.ravenkeeperInfo).toEqual({
      speaker: 4,
      target: 10,
      seenRole: "Poisoner",
    });
    expect(result.state.roles[9]).toBe("Imp");
    expect(result.poisonedAtInformationStep).toBeNull();
  });
  it("learns Imp when inheritance happens before the Ravenkeeper dies", () => {
    const result = trace({
      ravenkeeperTarget: 10,
      impActions: [
        { actor: 12, target: 12, impSuccessorSeat: 10 },
        { actor: 11, target: 4 },
      ],
    });
    expect(result.ravenkeeperInfo).toEqual({
      speaker: 4,
      target: 10,
      seenRole: "Imp",
    });
  });
  it("does not retrigger a poisoned night-death ability when the Poisoner dies later", () => {
    const result = trace({
      poisonerTarget: 4,
      impActions: [
        { actor: 11, target: 4 },
        { actor: 12, target: 10 },
      ],
    });
    expect(result.ravenkeeperInfo).toBeNull();
    expect(result.poisonedAtInformationStep).toBeNull();
  });
  it("rejects real information recorded for a death that happened while poisoned", () => {
    expect(
      run({
        poisonerTarget: 4,
        ravenkeeperTarget: 1,
        impActions: [
          { actor: 11, target: 4 },
          { actor: 12, target: 10 },
        ],
      }).status,
    ).toBe("invalid");
  });
  it("allows the ability when the Poisoner dies before the Ravenkeeper", () => {
    const result = trace({
      poisonerTarget: 4,
      ravenkeeperTarget: 11,
      impActions: [
        { actor: 11, target: 10 },
        { actor: 12, target: 4 },
      ],
    });
    expect(result.ravenkeeperInfo).toEqual({
      speaker: 4,
      target: 11,
      seenRole: "Imp",
    });
  });
  it("checks target registration health at death before the poison source dies later", () => {
    expect(
      run({
        poisonerTarget: 8,
        ravenkeeperTarget: 8,
        ravenkeeperRegistrationRole: "Imp",
        impActions: [
          { actor: 11, target: 4 },
          { actor: 12, target: 10 },
        ],
      }).status,
    ).toBe("invalid");
    expect(
      trace({
        poisonerTarget: 8,
        ravenkeeperTarget: 8,
        ravenkeeperRegistrationRole: "Imp",
        impActions: [
          { actor: 11, target: 10 },
          { actor: 12, target: 4 },
        ],
      }).ravenkeeperInfo?.seenRole,
    ).toBe("Imp");
  });
  it("retains information gained before a later attack ends the game", () => {
    const state = born();
    state.alive = roles.map((_, index) => [3, 9, 10, 11].includes(index));
    const result = trace(
      {
        monkTarget: undefined,
        butlerMasterSeat: undefined,
        previousDayExecutionDeathSeat: null,
        ravenkeeperTarget: 10,
        impActions: [
          { actor: 11, target: 4 },
          { actor: 12, target: 11 },
        ],
      },
      state,
    );
    expect(result.state.winner).toBe("evil");
    expect(result.ravenkeeperInfo).toEqual({
      speaker: 4,
      target: 10,
      seenRole: "Poisoner",
    });
  });
  it("allows periodic Undertaker information after poison ends later in the same night", () => {
    const result = trace({
      poisonerTarget: 5,
      ravenkeeperTarget: 10,
      impActions: [
        { actor: 11, target: 4 },
        { actor: 12, target: 10 },
      ],
    });
    expect(result.ravenkeeperInfo?.seenRole).toBe("Poisoner");
    expect(result.undertakerInfo).toEqual({
      speaker: 5,
      executedSeat: 8,
      seenRole: "Recluse",
    });
    expect(result.poisonedAtInformationStep).toBeNull();
  });
  it("does not issue protection retroactively when an already-used poisoned Monk becomes healthy", () => {
    const result = trace({
      poisonerTarget: 1,
      monkTarget: 7,
      impActions: [
        { actor: 11, target: 10 },
        { actor: 12, target: 7 },
      ],
    });
    expect(result.deaths).toEqual([10, 7]);
    expect(result.protectedSeat).toBeNull();
    expect(result.poisonedAtInformationStep).toBeNull();
  });
});

function timingRequest(): ObservedQueryInput {
  return {
    playerCount: 12,
    facts: roles.map((role, i) => ({ seat: i + 1, role })),
    query: { seat: 12, role: "Imp" },
    nightOnePoisoner: { seat: 10, target: 10 },
    phases: [
      { kind: "night", cycle: 1, deaths: [] },
      {
        kind: "day",
        cycle: 1,
        events: [
          {
            kind: "nomination",
            nominator: 1,
            nominee: 8,
            votes: [1, 2, 3, 4, 5, 6],
          },
        ],
        deaths: [8],
        executedSeat: 8,
      },
      { kind: "night", cycle: 2, deaths: [4, 12] },
    ],
    phaseRoleFacts: [{ phaseIndex: 2, seat: 10, role: "Imp" }],
    laterReports: [
      {
        kind: "ravenkeeper",
        cycle: 2,
        speaker: 4,
        target: 10,
        seenRole: "Poisoner",
        acceptedMessage: true,
        abilityActive: true,
      },
    ],
    timeoutMs: 10000,
    maxWorlds: 50,
    maxHistories: 5000,
  };
}
describe("death-time evidence and recovery explanation", () => {
  it("replays information about Poisoner and a later current Imp in one complete history", async () => {
    const input = timingRequest();
    const answer = await queryObservedTimeline(input);
    expect(answer.classification).toBe("necessary");
    expect(answer.yes?.currentRoles?.[9]).toBe("Imp");
    expect(replayObservedWitness(answer.yes!, input, input).valid).toBe(true);
    const night = answer.yes!.timeline![2];
    if (night.kind !== "night" || !night.actions.impActions)
      throw new Error("missing queue");
    const damaged = {
      ...answer.yes!,
      timeline: answer.yes!.timeline!.map((phase, i) =>
        i === 2
          ? {
              kind: "night" as const,
              actions: {
                ...night.actions,
                impActions: [...night.actions.impActions!].reverse(),
              },
            }
          : phase,
      ),
    };
    expect(replayObservedWitness(damaged, input, input).valid).toBe(false);
  }, 20000);
  it("rejects a report about a role that never existed at the learning time", async () => {
    const input = timingRequest();
    const answer = await queryObservedTimeline({
      ...input,
      laterReports: [
        {
          kind: "ravenkeeper",
          cycle: 2,
          speaker: 4,
          target: 10,
          seenRole: "Spy",
          acceptedMessage: true,
          abilityActive: true,
        },
      ],
    });
    expect(answer.classification).toBe("inconsistent");
  }, 20000);
  it("describes poisoning at death even though the same witness ends the night healthy", () => {
    const witness: SetupWitness = {
      roles,
      shownTokens: roles,
      registrations: [],
      timeline: [
        {
          kind: "night",
          actions: { cycle: 1, poisonerTarget: 10, butlerMasterSeat: 1 },
        },
        {
          kind: "day",
          events: [
            {
              kind: "nomination",
              nominator: 1,
              nominee: 8,
              votes: [1, 2, 3, 4, 5, 6],
            },
          ],
          scarletRecluseRegistrations: [8],
        },
        {
          kind: "night",
          actions: {
            cycle: 2,
            poisonerTarget: 4,
            monkTarget: 2,
            butlerMasterSeat: 1,
            impActions: [
              { actor: 11, target: 4 },
              { actor: 12, target: 10 },
            ],
          },
        },
      ],
    };
    const condition = {
      id: "raven-active",
      sourceId: "raven-report",
      seat: 4,
      kind: "ability_active" as const,
      role: "Ravenkeeper" as const,
      occurredAt: { phase: "night" as const, cycle: 2 },
    };
    expect(
      describeConditionExplanation([condition], {
        relaxedIds: [condition.id],
        minimal: true,
        witness,
      })[0],
    ).toMatchObject({
      cause: "poisoned",
      deathActionIndex: 0,
      roleAtReport: "Ravenkeeper",
    });
  });
});
