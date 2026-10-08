import { describe, expect, it, vi } from "vitest";
import { analyzeFactHistory, type FactHistoryAnalysis } from "./factHistory";
import {
  addStandardHypothesis,
  commitStandardEntry,
  createStandardBranch,
  createStandardWorkspace,
  prepareStandardObservedQuery,
  toggleStandardHypothesis,
} from "./standardWorkspace";
import { closeStandardPhase, correctStandardVote } from "./standardHistory";
import {
  queryInitialSetup,
  queryObservedTimeline,
  type ObservedQueryInput,
  type SetupQueryResult,
  type SetupWitness,
} from "./symbolicSetup";
import { replayTimeline } from "./timeline";
import type { Role } from "./model";
import type { StandardSolvers } from "./standardQuery";

const roles: Role[] = [
  "Chef",
  "Empath",
  "Monk",
  "Fortune Teller",
  "Soldier",
  "Poisoner",
  "Imp",
];
const witness: SetupWitness = { roles, shownTokens: roles, registrations: [] };
const unsat: SetupQueryResult = {
  status: "unsat",
  classification: "inconsistent",
  scope: "bounded_timeline",
  rulesetHash: "test-v1",
};
const sat: SetupQueryResult = {
  ...unsat,
  status: "sat",
  classification: "contingent",
  yes: witness,
};
const unknown: SetupQueryResult = {
  ...unsat,
  status: "unknown",
  classification: "unknown",
  unknownReason: "candidate_limit",
};
function fixture(fixedRoles = false, longer = false) {
  let w = createStandardWorkspace(7);
  if (fixedRoles)
    for (const [i, role] of roles.entries()) {
      w = addStandardHypothesis(w, { kind: "actual_role", seat: i + 1, role });
      w = toggleStandardHypothesis(w, w.hypotheses.at(-1)!.id);
    }
  w = closeStandardPhase(w, { phase: "night", cycle: 1 }, true);
  for (const text of [
    "1 nom 3 @D1",
    "vote 3 = 1,2,3,4 @D1",
    "exec 3 @D1",
    "3 dead @D1",
  ])
    w = commitStandardEntry(w, text, "public");
  w = closeStandardPhase(w, { phase: "day", cycle: 1 }, true);
  w = commitStandardEntry(w, "3 dead @N2", "public");
  w = closeStandardPhase(w, { phase: "night", cycle: 2 }, true);
  if (longer) w = closeStandardPhase(w, { phase: "day", cycle: 2 }, true);
  return w;
}
// Independent finite invariant: a previously dead player cannot die a second time.
const finite: StandardSolvers = {
  setup: async () => sat,
  observed: async (input) => {
    const dead = new Set<number>();
    for (const phase of input.phases)
      for (const seat of phase.deaths) {
        if (dead.has(seat)) return unsat;
        dead.add(seat);
      }
    return sat;
  },
};
const real: StandardSolvers = {
  setup: queryInitialSetup,
  observed: queryObservedTimeline,
};

describe("closed history prefix diagnosis", () => {
  it("agrees with an independent invariant, retains every complete phase and leaves the workspace untouched", async () => {
    const w = fixture(false, true);
    const before = JSON.stringify(w);
    const calls: ObservedQueryInput[] = [];
    const progress: FactHistoryAnalysis[] = [];
    const result = await analyzeFactHistory(
      w,
      {
        ...finite,
        observed: async (input) => {
          calls.push(input);
          return finite.observed(input);
        },
      },
      {},
      (value) => progress.push(value),
    );
    expect(result.status).toBe("located");
    expect(result.boundary).toEqual({ phase: "night", cycle: 2 });
    expect(result.previous?.time).toEqual({ phase: "day", cycle: 1 });
    const prepared = prepareStandardObservedQuery(w);
    if (prepared.status !== "ready") throw new Error(prepared.reason);
    for (const input of calls)
      expect(input.phases).toEqual(
        prepared.input.phases.slice(0, input.phases.length),
      );
    expect(result.sourceIds).toEqual(
      w.events
        .filter(
          (e) => e.occurredAt?.phase === "night" && e.occurredAt.cycle === 2,
        )
        .map((e) => e.id),
    );
    expect(JSON.stringify(w)).toBe(before);
    expect(progress[0].boundary).toEqual({ phase: "day", cycle: 2 });
    expect(progress[0].steps).toHaveLength(1);
    expect(result.steps.length).toBeGreaterThan(progress[0].steps.length);
  });
  it("certifies the boundary with real Z3 and replays the previous witness", async () => {
    const w = fixture(true);
    const result = await analyzeFactHistory(w, real, {
      budgetMs: 15000,
      maxChecks: 3,
    });
    expect(result.status).toBe("located");
    expect(result.checks).toBe(3);
    expect(result.boundary).toEqual({ phase: "night", cycle: 2 });
    const proof = result.previous!.witness;
    expect(proof.timeline).toHaveLength(2);
    const replay = replayTimeline({
      initialPlayers: proof.roles.map((actualRole, i) => ({
        seat: i + 1,
        actualRole,
        shownToken: proof.shownTokens[i],
      })),
      phases: proof.timeline!,
    });
    expect(replay.status).toBe("ok");
    if (replay.status === "ok") expect(replay.state.alive[2]).toBe(false);
  }, 20000);
  it("never imports future reports or phase-role premises into an earlier prefix", async () => {
    let w = commitStandardEntry(fixture(), "1 empath 0 @N2");
    const eventId = w.events.at(-1)!.id;
    for (const kind of ["report_accurate", "ability_active"] as const) {
      w = addStandardHypothesis(w, { kind, eventId });
      w = toggleStandardHypothesis(w, w.hypotheses.at(-1)!.id);
    }
    w = addStandardHypothesis(w, {
      kind: "role_at_phase",
      seat: 4,
      role: "Imp",
      occurredAt: { phase: "night", cycle: 2 },
    });
    w = toggleStandardHypothesis(w, w.hypotheses.at(-1)!.id);
    const calls: ObservedQueryInput[] = [];
    await analyzeFactHistory(w, {
      ...finite,
      observed: async (input) => {
        calls.push(input);
        return finite.observed(input);
      },
    });
    expect(calls[0].laterReports).toHaveLength(1);
    expect(calls[0].phaseRoleFacts).toHaveLength(1);
    for (const input of calls.slice(1)) {
      expect(input.laterReports).toEqual([]);
      expect(input.phaseRoleFacts).toEqual([]);
    }
  });
  it("distinguishes manual premise conflicts from compatible fixed events using real Z3", async () => {
    let w = closeStandardPhase(
      createStandardWorkspace(7),
      { phase: "night", cycle: 1 },
      true,
    );
    for (const role of ["Chef", "Empath"] as const) {
      w = addStandardHypothesis(w, { kind: "actual_role", seat: 1, role });
      w = toggleStandardHypothesis(w, w.hypotheses.at(-1)!.id);
    }
    const before = JSON.stringify(w);
    const retained = await analyzeFactHistory(w, real);
    expect(retained.status).toBe("located");
    expect(retained.assumptionIds).toHaveLength(2);
    const factsOnly = await analyzeFactHistory(w, real, {
      includeAssumptions: false,
    });
    expect(factsOnly.status).toBe("compatible");
    expect(factsOnly.assumptionIds).toEqual([]);
    expect(factsOnly.witness).toBeDefined();
    expect(JSON.stringify(w)).toBe(before);
  }, 15000);
  it("does not call a later conflict the earliest if an earlier prefix is unknown", async () => {
    const result = await analyzeFactHistory(fixture(), {
      ...finite,
      observed: async (input) =>
        input.phases.length === 1 ? unknown : finite.observed(input),
    });
    expect(result.status).toBe("partial");
    expect(result.complete).toBe(false);
    expect(result.boundary).toEqual({ phase: "night", cycle: 2 });
    expect(result.reason).toContain("更早阶段仍有未知");
    expect(result.previous?.time).toEqual({ phase: "day", cycle: 1 });
  });
  it("accepts an independently verified one-sided witness despite an unknown proposition", async () => {
    const result = await analyzeFactHistory(fixture(), {
      ...finite,
      observed: async (input) =>
        input.phases.length === 1
          ? { ...unknown, no: witness }
          : finite.observed(input),
    });
    expect(result.status).toBe("located");
  });
  it("retains a confirmed full conflict when budget expires without fabricating a boundary proof", async () => {
    const result = await analyzeFactHistory(fixture(), finite, {
      maxChecks: 1,
    });
    expect(result.status).toBe("partial");
    expect(result.complete).toBe(false);
    expect(result.steps).toHaveLength(1);
    expect(result.previous).toBeUndefined();
    expect(result.boundary).toEqual({ phase: "night", cycle: 2 });
    const noChecks = await analyzeFactHistory(fixture(), finite, {
      budgetMs: 0,
    });
    expect(noChecks.status).toBe("unknown");
    expect(noChecks.checks).toBe(0);
    expect(noChecks.boundary).toBeUndefined();
  });
  it("does not combine changed rules or failed checks into an earliest-boundary certificate", async () => {
    let count = 0;
    const changed = await analyzeFactHistory(fixture(), {
      ...finite,
      observed: async () =>
        ++count === 1 ? unsat : { ...sat, rulesetHash: "test-v2" },
    });
    expect(changed.status).toBe("partial");
    expect(changed.steps).toHaveLength(1);
    expect(changed.previous).toBeUndefined();
    expect(changed.rulesetHash).toBe("test-v1");
    const failed = await analyzeFactHistory(fixture(), {
      ...finite,
      observed: async (input) => {
        if (input.phases.length === 1) throw new Error("worker failed");
        return finite.observed(input);
      },
    });
    expect(failed.status).toBe("partial");
    expect(failed.reason).toContain("worker failed");
  });
  it("preserves unknown for supported-but-unfinished histories, and rejects incomplete phases before solving", async () => {
    const result = await analyzeFactHistory(fixture(), {
      ...finite,
      observed: async () => unknown,
    });
    expect(result.status).toBe("unknown");
    expect(result.boundary).toBeUndefined();
    const solver = vi.fn(finite.observed);
    const reopened = commitStandardEntry(fixture(), "4 dead @D1");
    const incomplete = await analyzeFactHistory(reopened, {
      ...finite,
      observed: solver,
    });
    expect(incomplete.status).toBe("not_ready");
    expect(incomplete.reason).toContain("D1");
    expect(solver).not.toHaveBeenCalled();
  });
  it("uses only the bound revision and current private perspective", async () => {
    let w = commitStandardEntry(
      createStandardWorkspace(7, 2),
      "close deaths @N1",
      "public",
    );
    w = createStandardBranch(w, "旧修订");
    const oldId = w.activeBranchId;
    w = { ...w, activeBranchId: w.branches[0].id, perspectiveSeat: 2 };
    w = commitStandardEntry(w, "2 dead @N2");
    w = closeStandardPhase(w, { phase: "day", cycle: 1 }, true);
    w = closeStandardPhase(w, { phase: "night", cycle: 2 }, true);
    w = { ...w, activeBranchId: oldId, perspectiveSeat: 1 };
    const observed = vi.fn(async (_input: ObservedQueryInput) => sat);
    const result = await analyzeFactHistory(w, { ...finite, observed });
    expect(result.revision).toBe(1);
    expect(result.steps.map((step) => step.time)).toEqual([
      { phase: "night", cycle: 1 },
    ]);
    expect(observed.mock.calls[0][0].phases).toHaveLength(1);
    expect(result.sourceIds).toEqual([]);
  });
  it("keeps corrected ballots at their original place and cites only the active replacement", async () => {
    let w = fixture();
    const vote = w.events.find((e) => e.payload.kind === "vote")!;
    w = correctStandardVote(w, vote.id, [1, 2, 3, 4, 5]);
    const replacementId = w.events.at(-1)!.id;
    w = closeStandardPhase(w, { phase: "day", cycle: 1 }, true);
    const calls: ObservedQueryInput[] = [];
    const result = await analyzeFactHistory(w, {
      ...finite,
      observed: async (input) => {
        calls.push(input);
        return input.phases.length >= 2 ? unsat : sat;
      },
    });
    expect(result.boundary).toEqual({ phase: "day", cycle: 1 });
    expect(result.sourceIds).toContain(replacementId);
    expect(result.sourceIds).not.toContain(vote.id);
    const phase = calls[0].phases[1];
    if (phase.kind !== "day" || phase.events[0].kind !== "nomination")
      throw new Error("Expected nomination");
    expect(phase.events[0].votes).toEqual([1, 2, 3, 4, 5]);
  });
  it("handles setup-only input without inventing a conflicting history stage", async () => {
    const compatible = await analyzeFactHistory(
      createStandardWorkspace(7),
      finite,
    );
    expect(compatible.status).toBe("compatible");
    expect(compatible.steps).toEqual([]);
    const conflict = await analyzeFactHistory(createStandardWorkspace(7), {
      ...finite,
      setup: async () => unsat,
    });
    expect(conflict.status).toBe("partial");
    expect(conflict.boundary).toBeUndefined();
    expect(conflict.reason).toContain("手动前提");
  });
});
