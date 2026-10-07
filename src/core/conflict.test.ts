import { describe, expect, it } from "vitest";
import {
  analyzeStandardConflict,
  createConflictTrial,
  type ConflictOracle,
} from "./conflict";
import {
  addStandardHypothesis,
  commitStandardEntry,
  createStandardWorkspace,
  publicTranscript,
  toggleStandardHypothesis,
  validateStandardWorkspace,
  type StandardWorkspace,
} from "./standardWorkspace";
import {
  queryInitialSetup,
  queryObservedTimeline,
  type SetupQueryResult,
  type SetupWitness,
} from "./symbolicSetup";
import { solveStandardWorkspace } from "./standardQuery";
import { replayFirstNight } from "./replayFirstNight";
import { validateInitialSetup } from "./setup";
import type { Role } from "./model";

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
  rulesetHash: "test-v1",
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
  for (const [seat, role] of [
    [1, "Chef"],
    [1, "Empath"],
    [2, "Monk"],
  ] as const) {
    w = addStandardHypothesis(w, { kind: "actual_role", seat, role });
    w = toggleStandardHypothesis(w, w.hypotheses.at(-1)!.id);
  }
  return w;
}
const ids = (w: StandardWorkspace) =>
  w.branches.find((b) => b.id === w.activeBranchId)!.assumptionIds;
const fake =
  (w: StandardWorkspace): ConflictOracle =>
  async (current) =>
    ids(w)
      .slice(0, 2)
      .every((id) => ids(current).includes(id))
      ? unsat
      : sat;

// Independent, finite role-bag oracle: no compiler or Z3 calls.
function hasAssignment(w: StandardWorkspace, selected: string[]) {
  const facts = w.hypotheses.filter((h) => selected.includes(h.id));
  const search = (prefix: Role[], remaining: Role[]): boolean => {
    if (!remaining.length) return true;
    const seat = prefix.length + 1;
    return remaining.some(
      (role) =>
        facts.every(
          (h) => h.kind !== "actual_role" || h.seat !== seat || h.role === role,
        ) &&
        search(
          [...prefix, role],
          remaining.filter((r) => r !== role),
        ),
    );
  };
  return search([], roles);
}

describe("conflict localization evidence", () => {
  it("matches an independent finite oracle and validates each real Z3 deletion witness", async () => {
    const w = fixture();
    const snapshot = JSON.stringify(w);
    const result = await analyzeStandardConflict(
      w,
      async (current, timeoutMs) =>
        (
          await solveStandardWorkspace(
            current,
            { setup: queryInitialSetup, observed: queryObservedTimeline },
            timeoutMs,
          )
        ).answer,
    );
    expect(result.status).toBe("minimal");
    expect(result.assumptionIds).toEqual(ids(w).slice(0, 2));
    expect(hasAssignment(w, result.assumptionIds)).toBe(false);
    expect(result.deletionWitnesses).toHaveLength(2);
    for (const proof of result.deletionWitnesses) {
      const remaining = result.assumptionIds.filter(
        (id) => id !== proof.assumptionId,
      );
      expect(hasAssignment(w, remaining)).toBe(true);
      const facts = w.hypotheses.flatMap((h) =>
        remaining.includes(h.id) && h.kind === "actual_role"
          ? [{ seat: h.seat, role: h.role }]
          : [],
      );
      expect(
        validateInitialSetup(
          proof.witness.roles.map((actualRole, i) => ({
            seat: i + 1,
            actualRole,
            shownToken: proof.witness.shownTokens[i],
          })),
        ).valid,
      ).toBe(true);
      expect(
        replayFirstNight(
          { playerCount: 7, facts, query: w.query },
          proof.witness,
        ).valid,
      ).toBe(true);
    }
    expect(JSON.stringify(w)).toBe(snapshot);
  });

  it("publishes only confirmed cores as stable progress snapshots", async () => {
    const w = fixture();
    const snapshots: import("./conflict").ConflictAnalysis[] = [];
    await analyzeStandardConflict(w, fake(w), {}, (progress) =>
      snapshots.push(progress),
    );
    expect(snapshots.length).toBeGreaterThan(1);
    for (const progress of snapshots) {
      expect(progress.status).toBe("partial");
      expect(hasAssignment(w, progress.assumptionIds)).toBe(false);
    }
    expect(snapshots[0].deletionWitnesses).toEqual([]);
    expect(snapshots[0].assumptionIds).toEqual(ids(w));
  });

  it("never labels a budget-limited core minimal", async () => {
    const w = fixture();
    const result = await analyzeStandardConflict(w, fake(w), { maxChecks: 1 });
    expect(result.status).toBe("partial");
    expect(result.assumptionIds).toEqual(ids(w));
    expect(result.deletionWitnesses).toEqual([]);
    expect(result.checks).toBe(1);
  });

  it("does not claim conflict before baseline confirmation or after a satisfiable baseline", async () => {
    const w = fixture();
    expect((await analyzeStandardConflict(w, async () => unknown)).status).toBe(
      "unconfirmed",
    );
    expect(
      (await analyzeStandardConflict(w, fake(w), { budgetMs: 0 })).status,
    ).toBe("unconfirmed");
    expect((await analyzeStandardConflict(w, async () => sat)).status).toBe(
      "not_conflicting",
    );
  });

  it("keeps UNKNOWN deletion checks and exceptions out of minimality proofs", async () => {
    const w = fixture();
    for (const failure of [
      async () => unknown,
      async (): Promise<SetupQueryResult> => {
        throw new Error("未支持的规则");
      },
    ]) {
      const result = await analyzeStandardConflict(w, async (current) =>
        ids(current).length === 3 ? unsat : failure(),
      );
      expect(result.status).toBe("partial");
      expect(result.assumptionIds).toEqual(ids(w));
      expect(result.deletionWitnesses).toEqual([]);
    }
  });

  it("a verified one-sided witness establishes consistency even when the proposition is unknown", async () => {
    const result = await analyzeStandardConflict(fixture(), async () => ({
      ...unknown,
      yes: witness,
    }));
    expect(result.status).toBe("not_conflicting");
  });

  it("rechecks deletion proofs after shrinking, so unknowns cannot be inherited from a different core", async () => {
    const w = fixture();
    const [a, b, c] = ids(w);
    const calls: string[][] = [];
    const result = await analyzeStandardConflict(w, async (current) => {
      const selected = ids(current);
      calls.push([...selected]);
      if (selected.includes(a) && selected.includes(b)) return unsat;
      if (selected.includes(c)) return sat;
      return unknown;
    });
    expect(result.assumptionIds).toEqual([a, b]);
    expect(result.status).toBe("partial");
    expect(result.deletionWitnesses).toEqual([]);
    expect(calls).toContainEqual([a]);
    expect(calls).toContainEqual([b]);
  });

  it("never changes fixed physical records or rewrites source/revision context", async () => {
    let w = fixture();
    w = commitStandardEntry(w, "close actions @D1");
    w = commitStandardEntry(w, "close deaths @D1");
    const result = await analyzeStandardConflict(w, async (current) => {
      expect(current.events).toBe(w.events);
      expect(current.perspectiveSeat).toBe(w.perspectiveSeat);
      expect(current.branches[0].baseRevision).toBe(w.branches[0].baseRevision);
      return unsat;
    });
    expect(result.status).toBe("fixed_conflict");
    expect(result.assumptionIds).toEqual([]);
  });

  it("rejects mixed rule versions as incomplete evidence", async () => {
    const result = await analyzeStandardConflict(fixture(), async (w) =>
      ids(w).length === 3 ? unsat : { ...sat, rulesetHash: "changed" },
    );
    expect(result.status).toBe("partial");
    expect(result.reason).toContain("规则版本");
  });

  it("does not expose or use private reports from another perspective", async () => {
    let w = createStandardWorkspace(7, 1);
    w = commitStandardEntry(w, "1 emp 2 @N1");
    w = addStandardHypothesis(w, {
      kind: "report_accurate",
      eventId: w.events[1].id,
    });
    w = toggleStandardHypothesis(w, w.hypotheses[0].id);
    w = { ...w, perspectiveSeat: 2 };
    let called = false;
    const oracle = async () => {
      called = true;
      return unsat;
    };
    const result = await analyzeStandardConflict(
      w,
      async (current) =>
        (
          await solveStandardWorkspace(current, {
            setup: oracle,
            observed: oracle,
          })
        ).answer,
    );
    expect(result.status).toBe("unconfirmed");
    expect(result.reason).toContain("不可见");
    expect(JSON.stringify(result)).not.toContain("1 emp 2");
    expect(called).toBe(false);
  });
});

describe("correction branches", () => {
  it("forks without mutating the parent, preserves records, and survives private export/import", () => {
    const w = fixture();
    const snapshot = JSON.stringify(w);
    const next = createConflictTrial(w, ids(w)[0], "试取消厨师");
    expect(JSON.stringify(w)).toBe(snapshot);
    expect(next.branches[0]).toEqual(w.branches[0]);
    expect(next.events).toBe(w.events);
    expect(next.query).toEqual(w.query);
    expect(next.branches[1].parentId).toBe(w.activeBranchId);
    expect(next.branches[1].assumptionIds).toEqual(ids(w).slice(1));
    expect(validateStandardWorkspace(JSON.parse(JSON.stringify(next)))).toEqual(
      next,
    );
    expect(JSON.stringify(publicTranscript(next))).not.toContain("试取消厨师");
  });
  it("refuses to cancel an inactive or stale premise", () => {
    const w = fixture();
    expect(() => createConflictTrial(w, "missing", "试取消")).toThrow(
      "已不在当前分支",
    );
  });
});
