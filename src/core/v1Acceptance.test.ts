import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { resolveNight, type DynamicState, type NightActions } from "./night";
import { resolveDay, type DayActions } from "./day";
import {
  queryInitialSetup,
  queryObservedTimeline,
  type SetupQueryInput,
  type SetupWitness,
  type ObservedQueryInput,
} from "./symbolicSetup";
import { replayFirstNight } from "./replayFirstNight";
import { replayObservedWitness } from "./observedTimeline";
import type { Role } from "./model";

const python =
  process.env.PYTHON ?? (process.platform === "win32" ? "python" : "python3");
const oraclePath = fileURLToPath(
  new URL("../../reference/v1_oracle.py", import.meta.url),
);
interface Fixture {
  mode: "first_night" | "night" | "day" | "observed";
  id: string;
  request: SetupQueryInput & {
    before: DynamicState;
    actions: NightActions & DayActions;
  };
  status?: string;
  classification?: string;
  expected?: Record<string, unknown>;
}
const { cases } = JSON.parse(
  execFileSync(python, [oraclePath], {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  }),
) as { cases: Fixture[] };
const evidence: Array<{
  id: string;
  request: SetupQueryInput;
  witness: SetupWitness;
  invalid?: boolean;
}> = [];

describe("V1 independent Python differential acceptance", () => {
  it.each(cases.filter((c) => c.mode === "first_night"))(
    "information: $id",
    async ({ id, request, classification }) => {
      const result = await queryInitialSetup(request);
      expect(result.classification).toBe(classification);
      for (const witness of [result.yes, result.no]) {
        if (!witness) continue;
        expect(replayFirstNight(request, witness)).toEqual({
          valid: true,
          errors: [],
        });
        evidence.push({ id, request, witness });
      }
    },
    20_000,
  );
  it.each(cases.filter((c) => c.mode === "night"))(
    "night: $id",
    ({ request, status, expected }) => {
      const result = resolveNight(request.before, request.actions);
      expect(result.status).toBe(status);
      if (result.status === "ok") expect(result.trace).toMatchObject(expected!);
    },
  );
  it.each(cases.filter((c) => c.mode === "day"))(
    "day: $id",
    ({ request, status, expected }) => {
      const result = resolveDay(request.before, request.actions);
      expect(result.status).toBe(status);
      if (result.status === "ok") expect(result.trace).toMatchObject(expected!);
    },
  );
  it("rejects a zero-Outsider witness with its registration removed or poisoned", async () => {
    const request = cases.find(
      (c) => c.id === "librarian-zero-Recluse-poison-None",
    )!.request;
    const answer = await queryInitialSetup(request);
    const witness = answer.yes!;
    expect(
      witness.registrations.some((r) => r.interaction === "librarian_zero_0"),
    ).toBe(true);
    expect(
      replayFirstNight(request, { ...witness, registrations: [] }).valid,
    ).toBe(false);
    const poisoned = { ...request, nightOnePoisoner: { seat: 10, target: 8 } };
    expect(
      replayFirstNight(poisoned, {
        ...witness,
        nightOnePoisoner: poisoned.nightOnePoisoner,
      }).valid,
    ).toBe(false);
  });
  it.each(cases.filter((c) => c.mode === "observed"))(
    "history: $id",
    async ({ id, request, classification }) => {
      const input = request as unknown as ObservedQueryInput;
      const result = await queryObservedTimeline(input);
      expect(result.classification).toBe(classification);
      for (const witness of [result.yes, result.no])
        if (witness) {
          expect(replayObservedWitness(witness, input, input)).toEqual({
            valid: true,
            errors: [],
          });
          evidence.push({ id, request, witness });
        }
    },
    20_000,
  );
  it("independently rejects damaged Scarlet Woman registration and living-Demon evidence", async () => {
    const request = cases.find(
      (c) => c.id === "recluse-scarlet-observed-poison-10",
    )!.request as unknown as ObservedQueryInput;
    const result = await queryObservedTimeline(request);
    expect(result.classification).toBe("contingent");
    const witness = result.yes!;
    const receipt = {
      interaction: "scarlet_woman_d1_11",
      seat: 8,
      role: "Imp" as Role,
    };
    expect(witness.registrations).toContainEqual(receipt);
    const corrupted: SetupWitness[] = [
      {
        ...witness,
        registrations: witness.registrations.filter(
          (r) => r.interaction !== receipt.interaction,
        ),
      },
      { ...witness, registrations: [...witness.registrations, receipt] },
      {
        ...witness,
        registrations: [...witness.registrations, { ...receipt, seat: 7 }],
      },
      {
        ...witness,
        registrations: witness.registrations.map((r) =>
          r.interaction === receipt.interaction
            ? { ...r, role: "Poisoner" as Role }
            : r,
        ),
      },
      {
        ...witness,
        registrations: witness.registrations.map((r) =>
          r.interaction === receipt.interaction
            ? { ...r, interaction: "scarlet_woman_n2_11" }
            : r,
        ),
      },
      {
        ...witness,
        currentAlive: witness.currentAlive!.map((alive, index) =>
          index === 11 ? false : alive,
        ),
      },
      { ...witness, currentAlive: new Array<boolean>(12) },
      {
        ...witness,
        timeline: witness.timeline!.map((phase) =>
          phase.kind === "day"
            ? { ...phase, scarletRecluseRegistrations: undefined }
            : phase,
        ),
      },
      { ...result.no!, registrations: [...result.no!.registrations, receipt] },
    ];
    for (const [index, damaged] of corrupted.entries()) {
      expect(replayObservedWitness(damaged, request, request).valid).toBe(
        false,
      );
      evidence.push({
        id: `scarlet-registration-corrupted-${index}`,
        request,
        witness: damaged,
        invalid: true,
      });
    }
  }, 20000);
  it("retains a registered Recluse as a good current Imp with independent evidence", async () => {
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
      "Spy",
      "Scarlet Woman",
      "Imp",
    ];
    const request = {
      playerCount: 12,
      facts: roles.map((role, index) => ({ seat: index + 1, role })),
      query: { seat: 8, role: "Recluse" as Role },
      currentQuery: { seat: 8, role: "Imp" as Role },
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
      ],
      timeoutMs: 10000,
      maxWorlds: 100,
      maxHistories: 10000,
    } satisfies Parameters<typeof queryObservedTimeline>[0];
    const result = await queryObservedTimeline(request);
    expect(result.classification).toBe("contingent");
    expect(result.yes?.currentAlignments?.[7]).toBe("good");
    for (const witness of [result.yes, result.no])
      if (witness) evidence.push({ id: "good-Imp", request, witness });
    for (const witness of [
      {
        ...result.yes!,
        currentAlignments: result.yes!.currentAlignments!.map(
          (alignment, index) => (index === 7 ? ("evil" as const) : alignment),
        ),
      },
      { ...result.yes!, currentAlignments: undefined },
      { ...result.yes!, currentAlignments: new Array(12) },
      { ...result.yes!, currentRoles: new Array(12) },
      {
        ...result.yes!,
        registrations: [
          ...result.yes!.registrations,
          {
            interaction: "imp_successor_n2",
            seat: 8,
            role: "Poisoner" as Role,
          },
        ],
      },
      {
        ...result.yes!,
        registrations: result.yes!.registrations.filter(
          (r) => r.interaction !== "imp_successor_n2",
        ),
      },
    ]) {
      expect(replayObservedWitness(witness, request, request).valid).toBe(
        false,
      );
      evidence.push({
        id: "good-Imp-corrupted",
        request,
        witness,
        invalid: true,
      });
    }
  }, 20_000);
  it("checks concrete later registrations and rejects missing, duplicated or forged choices", async () => {
    const fixture = cases.find(
      (c) => c.id === "good-demon-empath-1-ft-True-phase-fact-False",
    )!;
    const request = fixture.request as unknown as ObservedQueryInput;
    const result = await queryObservedTimeline(request);
    expect(result.classification).toBe("impossible");
    const witness: SetupWitness = {
      ...result.no!,
      redHerringSeat: 1,
      registrations: [
        ...result.no!.registrations.filter((r) => r.interaction !== "ft_n3_1"),
        { interaction: "ft_n3_1", seat: 8, role: "Imp" },
      ],
    };
    expect(replayObservedWitness(witness, request, request).valid).toBe(true);
    evidence.push({ id: "later-registration-concrete", request, witness });
    const corrupted: SetupWitness[] = [
      {
        ...witness,
        registrations: witness.registrations.filter(
          (r) => r.interaction !== "ft_n3_1",
        ),
      },
      {
        ...witness,
        registrations: witness.registrations.filter(
          (r) => r.interaction !== "empath_n3_0_1",
        ),
      },
      {
        ...witness,
        registrations: [
          ...witness.registrations,
          { interaction: "ft_n3_1", seat: 8, role: "Imp" },
        ],
      },
      {
        ...witness,
        registrations: [
          ...witness.registrations,
          { interaction: "ft_n3_1", seat: 2, role: "Imp" },
        ],
      },
      {
        ...witness,
        registrations: witness.registrations.map((r) =>
          r.interaction === "empath_n3_0_1" ? { ...r, evil: false } : r,
        ),
      },
    ];
    for (const [index, damaged] of corrupted.entries()) {
      expect(replayObservedWitness(damaged, request, request).valid).toBe(
        false,
      );
      evidence.push({
        id: `later-registration-corrupted-${index}`,
        request,
        witness: damaged,
        invalid: true,
      });
    }
  }, 20_000);
  it("accepts different legal registrations for the same later Empath count", async () => {
    const roles: Role[] = [
      "Washerwoman",
      "Librarian",
      "Investigator",
      "Recluse",
      "Empath",
      "Spy",
      "Undertaker",
      "Chef",
      "Fortune Teller",
      "Poisoner",
      "Imp",
    ];
    const request: ObservedQueryInput = {
      playerCount: 11,
      facts: roles.map((role, index) => ({ seat: index + 1, role })),
      query: { seat: 11, role: "Imp" },
      nightOnePoisoner: { seat: 10, target: 10 },
      phases: [
        { kind: "night", cycle: 1, deaths: [] },
        { kind: "day", cycle: 1, events: [], deaths: [], executedSeat: null },
        { kind: "night", cycle: 2, deaths: [1] },
      ],
      laterReports: [
        {
          kind: "empath",
          cycle: 2,
          speaker: 5,
          count: 1,
          acceptedMessage: true,
          abilityActive: true,
        },
      ],
      timeoutMs: 10000,
      maxWorlds: 100,
      maxHistories: 10000,
    };
    const result = await queryObservedTimeline(request);
    expect(result.classification).toBe("necessary");
    for (const [left, right] of [
      [false, true],
      [true, false],
    ]) {
      const witness: SetupWitness = {
        ...result.yes!,
        timeline: result.yes!.timeline!.map((phase) =>
          phase.kind === "night"
            ? { ...phase, actions: { ...phase.actions, poisonerTarget: 10 } }
            : phase,
        ),
        registrations: [
          ...result.yes!.registrations.filter(
            (r) => !r.interaction.startsWith("empath_n2_0"),
          ),
          { interaction: "empath_n2_0_0", seat: 4, evil: left },
          { interaction: "empath_n2_0_1", seat: 6, evil: right },
        ],
      };
      expect(replayObservedWitness(witness, request, request).valid).toBe(true);
      evidence.push({
        id: `later-empath-alternative-${left}`,
        request,
        witness,
      });
    }
  }, 20_000);
  it("independently audits ordered multi-Imp histories and rejects fabricated actions", async () => {
    const request = cases.find(
      (c) => c.id === "multi-observed-competing-transfers",
    )!.request as unknown as ObservedQueryInput;
    const answer = await queryObservedTimeline(request);
    expect(answer.classification).toBe("contingent");
    for (const [label, witness] of [
      ["yes", answer.yes!],
      ["no", answer.no!],
    ] as const)
      evidence.push({ id: `multi-imp-audit-${label}`, request, witness });
    const witness = answer.yes!;
    const phase = witness.timeline![2];
    if (phase.kind !== "night" || !phase.actions.impActions)
      throw new Error("Missing multi-Imp order");
    const queues = [
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
      [
        {
          ...phase.actions.impActions[0],
          target: undefined,
          skipReason: "dead" as const,
        },
        phase.actions.impActions[1],
      ],
    ];
    for (const [i, queue] of queues.entries()) {
      const damaged = {
        ...witness,
        timeline: witness.timeline!.map((p, index) =>
          index === 2
            ? {
                kind: "night" as const,
                actions: { ...phase.actions, impActions: queue },
              }
            : p,
        ),
      };
      expect(replayObservedWitness(damaged, request, request).valid).toBe(
        false,
      );
      evidence.push({
        id: `multi-imp-corrupted-queue-${i}`,
        request,
        witness: damaged,
        invalid: true,
      });
    }
    const receipt = {
      interaction: "imp_successor_n2_11",
      seat: 8,
      role: "Poisoner" as Role,
    };
    const damaged = {
      ...witness,
      registrations: [...witness.registrations, receipt],
    };
    expect(replayObservedWitness(damaged, request, request).valid).toBe(false);
    evidence.push({
      id: "multi-imp-fabricated-registration",
      request,
      witness: damaged,
      invalid: true,
    });
  }, 20000);
  it("independently checks the death-time message, concrete target and action order", async () => {
    for (const id of [
      "raven-current-Imp-read-Poisoner",
      "raven-current-Imp-read-Imp",
      "raven-Spy-registers-Chef-before-becoming-Imp",
    ]) {
      const request = cases.find((c) => c.id === id)!
        .request as unknown as ObservedQueryInput;
      const answer = await queryObservedTimeline(request);
      expect(answer.classification).toBe("necessary");
      const witness = answer.yes!;
      const phase = witness.timeline![2];
      if (phase.kind !== "night" || !phase.actions.impActions)
        throw new Error("Missing death-time actions");
      evidence.push({ id: `${id}-exact`, request, witness });
      const damagedActions = [
        {
          ...phase.actions,
          impActions: [...phase.actions.impActions].reverse(),
        },
        { ...phase.actions, ravenkeeperTarget: 11 },
        { ...phase.actions, ravenkeeperTarget: undefined },
      ];
      for (const [i, actions] of damagedActions.entries()) {
        const damaged = {
          ...witness,
          timeline: witness.timeline!.map((p, index) =>
            index === 2 ? { kind: "night" as const, actions } : p,
          ),
        };
        expect(replayObservedWitness(damaged, request, request).valid).toBe(
          false,
        );
        evidence.push({
          id: `${id}-damaged-${i}`,
          request,
          witness: damaged,
          invalid: true,
        });
      }
    }
  }, 20000);
  it("independently rejects reversed public events and changed execution consequences", async () => {
    for (const id of [
      "day-failed-vote-before-shot",
      "day-corpse-execution-no-information",
      "day-slayer-wins-before-pending-saint",
    ]) {
      const request = cases.find((c) => c.id === id)!
        .request as unknown as ObservedQueryInput;
      const answer = await queryObservedTimeline(request);
      expect(answer.classification).toBe("necessary");
      const witness = answer.yes!;
      const phase = witness.timeline![1];
      if (phase.kind !== "day") throw new Error("Missing day actions");
      const damaged = {
        ...witness,
        timeline: witness.timeline!.map((p, index) =>
          index === 1 ? { ...phase, events: [...phase.events].reverse() } : p,
        ),
      };
      expect(replayObservedWitness(damaged, request, request).valid).toBe(
        false,
      );
      evidence.push({ id: `${id}-ordered`, request, witness });
      evidence.push({
        id: `${id}-reversed`,
        request,
        witness: damaged,
        invalid: true,
      });
    }
  }, 20000);
  afterAll(() => {
    const checked = spawnSync(python, [oraclePath, "--check-witnesses"], {
      input: JSON.stringify(evidence),
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
    });
    expect(checked.error).toBeUndefined();
    expect(checked.status, checked.stderr).toBe(0);
    const verdicts = JSON.parse(checked.stdout) as Array<{
      id: string;
      errors: string[];
    }>;
    expect(verdicts).toHaveLength(evidence.length);
    for (const [index, verdict] of verdicts.entries())
      expect(verdict.errors.length > 0, verdict.id).toBe(
        Boolean(evidence[index].invalid),
      );
  });
});
