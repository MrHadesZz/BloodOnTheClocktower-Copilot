import { describe, expect, it } from "vitest";
import {
  analyzeClaims,
  prepareClaimAnalysis,
  describeClaimRepair,
  type ClaimAnalysis,
} from "./claimAnalysis";
import {
  addStandardHypothesis,
  commitStandardEntry,
  createStandardWorkspace,
  retractStandardEvent,
  toggleStandardHypothesis,
  validateStandardWorkspace,
  prepareStandardSetupQuery,
  type StandardWorkspace,
} from "./standardWorkspace";
import {
  queryInitialSetup,
  queryObservedTimeline,
  type SetupQueryResult,
  type SetupWitness,
} from "./symbolicSetup";
import { replayFirstNight } from "./replayFirstNight";
import { solveStandardWorkspace } from "./standardQuery";
import type { Role } from "./model";
import type { ConflictOracle } from "./conflict";

const roles: Role[] = [
  "Washerwoman",
  "Chef",
  "Empath",
  "Fortune Teller",
  "Monk",
  "Poisoner",
  "Imp",
];
const witness: SetupWitness = { roles, shownTokens: roles, registrations: [] };
const unsat: SetupQueryResult = {
  rulesetHash: "test",
  scope: "initial_setup_only",
  status: "unsat",
  classification: "inconsistent",
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
  unknownReason: "time_budget",
};
function fixture() {
  let w = createStandardWorkspace(7);
  w = commitStandardEntry(w, "1 共情者 0 @N1");
  w = commitStandardEntry(w, "2 共情者 0 @N1");
  return commitStandardEntry(w, "3 厨师 0 @N1");
}
function seats(w: StandardWorkspace) {
  const ids = w.branches.find((b) => b.id === w.activeBranchId)!.assumptionIds;
  return w.hypotheses.flatMap((h) =>
    h.kind === "actual_role" &&
    h.id.startsWith("claim-analysis-") &&
    ids.includes(h.id)
      ? [h.seat]
      : [],
  );
}
const fake: ConflictOracle = async (w) =>
  seats(w).includes(1) && seats(w).includes(2) ? unsat : sat;
const real: ConflictOracle = async (w, timeoutMs) =>
  (
    await solveStandardWorkspace(
      w,
      { setup: queryInitialSetup, observed: queryObservedTimeline },
      timeoutMs,
    )
  ).answer;

describe("one-click claim analysis", () => {
  it("temporarily groups identity and both report conditions without saving or changing the branch", () => {
    const w = fixture();
    w.query.stage = "current";
    const snapshot = JSON.stringify(w);
    const p = prepareClaimAnalysis(w);
    expect(p.groups.map((g) => [g.seat, g.assumptionIds.length])).toEqual([
      [1, 3],
      [2, 3],
      [3, 3],
    ]);
    const trial = p.withSeats([1, 3]);
    expect(validateStandardWorkspace(trial)).toEqual(trial);
    expect(trial.query.stage).toBe("initial");
    expect(seats(trial)).toEqual([1, 3]);
    expect(trial.branches[0].baseRevision).toBe(w.branches[0].baseRevision);
    expect(JSON.stringify(w)).toBe(snapshot);
  });
  it("honors revision, private visibility, retractions and the latest identity claim", () => {
    let w = fixture();
    const first = w.events.find(
      (e) =>
        e.payload.kind === "claim" &&
        e.payload.speaker === 1 &&
        e.payload.claimKind === "role",
    )!;
    w = retractStandardEvent(w, first.id);
    w = commitStandardEntry(w, "1 Monk @D1");
    const revision = w.branches[0].baseRevision;
    w = commitStandardEntry({ ...w, perspectiveSeat: 2 }, "4 共情者 1 @N1");
    w = commitStandardEntry(
      { ...w, perspectiveSeat: 1 },
      "5 Mayor @D1",
      "public",
    );
    w = {
      ...w,
      branches: w.branches.map((b) => ({ ...b, baseRevision: revision + 2 })),
    };
    const p = prepareClaimAnalysis(w);
    expect(p.groups.map((g) => g.seat)).toEqual([1, 2, 3]);
    expect(p.groups[0].role).toBe("Monk");
    expect(p.groups[0].sourceIds).not.toContain(first.id);
  });
  it("finds the player conflict group and checks full-input relaxation separately", async () => {
    const w = fixture();
    const snapshot = JSON.stringify(w);
    const result = await analyzeClaims(w, fake);
    expect(result.status).toBe("conflict");
    expect(result.coreSeats).toEqual([1, 2]);
    expect(result.coreMinimal).toBe(true);
    expect(result.complete).toBe(true);
    expect(result.trials.map((t) => [t.seat, t.status])).toEqual([
      [1, "compatible"],
      [2, "compatible"],
      [3, "conflict"],
    ]);
    expect(JSON.stringify(w)).toBe(snapshot);
  });
  it("uses real replay-validated Z3 witnesses for conflicting claims and compatible reports", async () => {
    let w = createStandardWorkspace(7);
    w = commitStandardEntry(w, "1 共情者 0 @N1");
    w = commitStandardEntry(w, "2 共情者 0 @N1");
    const result = await analyzeClaims(w, real, {
      budgetMs: 20000,
      checkTimeoutMs: 3000,
    });
    expect(result.status).toBe("conflict");
    expect(result.coreMinimal).toBe(true);
    expect(result.coreSeats).toEqual([1, 2]);
    for (const t of result.trials) {
      expect(t.status).toBe("compatible");
      expect(t.witness).toBeDefined();
      expect(t.witness!.roles[(t.seat === 1 ? 2 : 1) - 1]).toBe("Empath");
      expect(t.witness!.roles[t.seat - 1]).not.toBe("Empath");
    }
    const compatible = await analyzeClaims(
      commitStandardEntry(createStandardWorkspace(7), "3 共情者 0 @N1"),
      real,
    );
    expect(compatible.status).toBe("compatible");
    expect(compatible.witness?.roles[2]).toBe("Empath");
    expect(compatible.trials).toEqual([]);
  }, 30000);
  it("retains manually adopted facts even when their player's claims are relaxed", async () => {
    let w = fixture();
    w = addStandardHypothesis(w, {
      kind: "actual_role",
      seat: 1,
      role: "Chef",
    });
    const id = w.hypotheses.at(-1)!.id;
    w = toggleStandardHypothesis(w, id);
    const trial = prepareClaimAnalysis(w).withSeats([2]);
    expect(trial.branches[0].assumptionIds).toContain(id);
    expect(seats(trial)).toEqual([2]);
    const result = await analyzeClaims(w, async (current) =>
      current.branches[0].assumptionIds.includes(id) ? unsat : sat,
    );
    expect(result.status).toBe("fixed_conflict");
    expect(result.coreSeats).toEqual([]);
    expect(result.trials).toEqual([]);
  });
  it("never reports players as a conflict group when baseline or background consistency is unknown", async () => {
    const w = fixture();
    expect((await analyzeClaims(w, async () => unknown)).status).toBe(
      "unknown",
    );
    const result = await analyzeClaims(w, async (current) =>
      seats(current).length ? unsat : unknown,
    );
    expect(result.status).toBe("unknown");
    expect(result.coreSeats).toEqual([]);
    expect(result.trials).toEqual([]);
  });
  it("preserves only confirmed evidence when the checking budget ends", async () => {
    const w = fixture();
    const none = await analyzeClaims(w, fake, { maxChecks: 0 });
    expect(none.status).toBe("unknown");
    expect(none.coreSeats).toEqual([]);
    const partial = await analyzeClaims(w, fake, { maxChecks: 3 });
    expect(partial.status).toBe("conflict");
    expect(partial.coreMinimal).toBe(false);
    expect(partial.complete).toBe(false);
    expect(partial.trials.map((t) => [t.seat, t.status])).toEqual([
      [1, "compatible"],
    ]);
  });
  it("does not combine witnesses from different rule versions or convert unknown trials to innocence", async () => {
    let checks = 0;
    const mixed = await analyzeClaims(fixture(), async () =>
      ++checks === 1 ? unsat : { ...sat, rulesetHash: "different" },
    );
    expect(mixed.status).toBe("unknown");
    expect(mixed.coreSeats).toEqual([]);
    const incomplete = await analyzeClaims(fixture(), async (current) =>
      seats(current).includes(1) && !seats(current).includes(2)
        ? unknown
        : fake(current, 1000),
    );
    expect(incomplete.status).toBe("conflict");
    expect(incomplete.trials.find((t) => t.seat === 2)?.status).toBe("unknown");
    expect(incomplete.coreMinimal).toBe(false);
    expect(incomplete.complete).toBe(false);
  });
  it("returns unknown with the phase-closure reason for a later-night report without events", async () => {
    const w = commitStandardEntry(createStandardWorkspace(7), "3 共情者 0 @N2");
    const result = await analyzeClaims(w, real);
    expect(result.status).toBe("unknown");
    expect(result.reason).toContain("跨夜");
    expect(result.coreSeats).toEqual([]);
  });
  it("handles an empty record without starting a solver", async () => {
    let calls = 0;
    const result = await analyzeClaims(createStandardWorkspace(7), async () => {
      calls++;
      return sat;
    });
    expect(result.status).toBe("empty");
    expect(calls).toBe(0);
  });
});

describe("verified multi-player repair combinations", () => {
  function fourClaims() {
    let w = createStandardWorkspace(7);
    for (const line of [
      "1 共情者 0 @N1",
      "2 共情者 0 @N1",
      "3 厨师 0 @N1",
      "4 厨师 0 @N1",
    ])
      w = commitStandardEntry(w, line);
    return w;
  }
  const independentPairs: ConflictOracle = async (current) => {
    const selected = seats(current);
    return (selected.includes(1) && selected.includes(2)) ||
      (selected.includes(3) && selected.includes(4))
      ? unsat
      : sat;
  };
  const signature = (selected: number[]) => selected.join(",");

  it("matches exhaustive subset enumeration for independent and overlapping conflicts", async () => {
    const w = fourClaims();
    for (const conflicts of [
      [
        [1, 2],
        [3, 4],
      ],
      [
        [1, 2],
        [2, 3],
        [3, 4],
      ],
      [
        [1, 2],
        [1, 3],
        [1, 4],
      ],
    ]) {
      const oracle: ConflictOracle = async (current) =>
        conflicts.some((c) => c.every((s) => seats(current).includes(s)))
          ? unsat
          : sat;
      const compatible = (relaxed: number[]) =>
        conflicts.every((c) => c.some((s) => relaxed.includes(s)));
      const expected = Array.from({ length: 16 }, (_, mask) =>
        [1, 2, 3, 4].filter((s) => mask & (1 << (s - 1))),
      ).filter(
        (r) =>
          compatible(r) &&
          r.every((s) => !compatible(r.filter((other) => other !== s))),
      );
      const result = await analyzeClaims(w, oracle);
      expect(result.repairs.map((r) => signature(r.seats)).sort()).toEqual(
        expected.map(signature).sort(),
      );
      expect(result.repairs.every((r) => r.minimal)).toBe(true);
      expect(result.repairSearchComplete).toBe(true);
      expect(result.complete).toBe(true);
    }
  });

  it("finds all four two-player explanations with real replay-validated Z3 witnesses", async () => {
    const w = fourClaims();
    const snapshot = JSON.stringify(w);
    const result = await analyzeClaims(w, real, {
      budgetMs: 25000,
      checkTimeoutMs: 3000,
    });
    expect(result.trials.every((t) => t.status === "conflict")).toBe(true);
    expect(result.repairs.map((r) => r.seats)).toEqual([
      [1, 3],
      [1, 4],
      [2, 3],
      [2, 4],
    ]);
    const prepared = prepareClaimAnalysis(w);
    for (const repair of result.repairs) {
      expect(repair.minimal).toBe(true);
      const remaining = [1, 2, 3, 4].filter((s) => !repair.seats.includes(s));
      const query = prepareStandardSetupQuery(prepared.withSeats(remaining));
      expect(query.status).toBe("ready");
      if (query.status !== "ready") throw new Error("fixture not prepared");
      const replay = replayFirstNight(query.input, repair.witness);
      expect(replay.valid).toBe(true);
      for (const fact of query.input.facts)
        expect(repair.witness.roles[fact.seat - 1]).toBe(fact.role);
    }
    expect(result.repairSearchComplete).toBe(true);
    expect(JSON.stringify(w)).toBe(snapshot);
  }, 30000);

  it("keeps a compatible combination if restoration checks are unknown without claiming minimality", async () => {
    const result = await analyzeClaims(fourClaims(), async (current) => {
      const selected = seats(current);
      if (selected.length === 3) return unknown;
      return independentPairs(current, 1000);
    });
    expect(result.repairs.length).toBeGreaterThan(0);
    expect(
      result.repairs.every((r) => r.seats.length === 2 && !r.minimal),
    ).toBe(true);
    expect(result.repairSearchComplete).toBe(false);
    expect(result.complete).toBe(false);
  });

  it("marks limits as incomplete and never presents a superset as a new minimal repair", async () => {
    const result = await analyzeClaims(fourClaims(), independentPairs, {
      maxRepairs: 2,
    });
    expect(result.repairs).toHaveLength(2);
    expect(result.repairs.every((r) => r.minimal && r.seats.length === 2)).toBe(
      true,
    );
    expect(result.repairSearchComplete).toBe(false);
    expect(result.complete).toBe(false);
    expect(result.reason).toContain("组合上限");
  });

  it("retains every fixed assumption and never includes invisible or newer seats in repairs", async () => {
    let w = fourClaims();
    w = addStandardHypothesis(w, { kind: "actual_role", seat: 7, role: "Imp" });
    const fixed = w.hypotheses.at(-1)!.id;
    w = toggleStandardHypothesis(w, fixed);
    const revision = w.branches[0].baseRevision;
    w = commitStandardEntry({ ...w, perspectiveSeat: 2 }, "5 共情者 0 @N1");
    w = commitStandardEntry(
      { ...w, perspectiveSeat: 1 },
      "6 厨师 0 @N1",
      "public",
    );
    w = {
      ...w,
      branches: w.branches.map((b) => ({ ...b, baseRevision: revision + 2 })),
    };
    const snapshot = JSON.stringify(w);
    const result = await analyzeClaims(w, async (current) => {
      expect(current.branches[0].assumptionIds).toContain(fixed);
      expect(seats(current).every((s) => s <= 4)).toBe(true);
      return independentPairs(current, 1000);
    });
    expect(result.repairs).toHaveLength(4);
    expect(result.repairs.every((r) => r.seats.every((s) => s <= 4))).toBe(
      true,
    );
    expect(JSON.stringify(w)).toBe(snapshot);
  });

  it("publishes immutable verified witnesses before a budget expires during minimality checks", async () => {
    const w = fourClaims();
    let firstPairCheckCount: number | undefined;
    await analyzeClaims(w, independentPairs, {}, (progress) => {
      if (progress.repairs.length) firstPairCheckCount ??= progress.checks;
    });
    expect(firstPairCheckCount).toBeDefined();
    const snapshots: ClaimAnalysis[] = [];
    const result = await analyzeClaims(
      w,
      independentPairs,
      { maxChecks: firstPairCheckCount! },
      (progress) => snapshots.push(progress),
    );
    expect(result.repairs.length).toBeGreaterThan(0);
    expect(result.repairSearchComplete).toBe(false);
    const beforeWitness = snapshots.find((s) => s.repairs.length === 0)!;
    expect(beforeWitness.repairs).toEqual([]);
    const withWitness = snapshots.find((s) => s.repairs.length > 0)!;
    expect(withWitness.repairs[0].witness).toBeDefined();
    expect(withWitness.repairs[0].minimal).toBe(false);
  });

  it("derives identity, token, report and poison details solely from a compatible witness", () => {
    const w = fourClaims();
    const groups = prepareClaimAnalysis(w).groups;
    const explanation = describeClaimRepair(groups, {
      seats: [1],
      minimal: true,
      witness: {
        ...witness,
        roles: ["Drunk", ...roles.slice(1)],
        shownTokens: ["Empath", ...roles.slice(1)],
        nightOnePoisoner: { seat: 6, target: 1 },
      },
    })[0];
    expect(explanation.claimedRole).toBe("Empath");
    expect(explanation.role).toBe("Drunk");
    expect(explanation.shownRole).toBe("Empath");
    expect(explanation.reportIds).toEqual([groups[0].sourceIds[1]]);
    expect(explanation.poisonNights).toEqual([1]);
  });
});
