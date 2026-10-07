import { describe, expect, it } from "vitest";
import {
  analyzeClaimConditions,
  claimConditionLabel,
  describeConditionExplanation,
  type ClaimConditionDiagnosis,
  type ConditionExplanation,
} from "./claimConditionAnalysis";
import { prepareClaimAnalysis } from "./claimAnalysis";
import {
  addStandardHypothesis,
  commitStandardEntry,
  createStandardWorkspace,
  prepareStandardSetupQuery,
  prepareStandardObservedQuery,
  toggleStandardHypothesis,
  type HypothesisDraft,
  type StandardWorkspace,
} from "./standardWorkspace";
import { solveStandardWorkspace } from "./standardQuery";
import {
  queryInitialSetup,
  queryObservedTimeline,
  type SetupQueryResult,
  type SetupWitness,
} from "./symbolicSetup";
import { replayFirstNight } from "./replayFirstNight";
import { replayObservedWitness } from "./observedTimeline";
import type { ConflictOracle } from "./conflict";
import type { Role } from "./model";

function adopt(w: StandardWorkspace, premise: HypothesisDraft) {
  const next = addStandardHypothesis(w, premise);
  return toggleStandardHypothesis(next, next.hypotheses.at(-1)!.id);
}
function fixedRoles(roles: Role[]) {
  let w = createStandardWorkspace(roles.length);
  for (const [index, role] of roles.entries())
    w = adopt(w, { kind: "actual_role", seat: index + 1, role });
  return w;
}
const real: ConflictOracle = async (w, timeoutMs) =>
  (
    await solveStandardWorkspace(
      w,
      {
        setup: queryInitialSetup,
        observed: queryObservedTimeline,
      },
      timeoutMs,
    )
  ).answer;

const empathRoles: Role[] = [
  "Empath",
  "Imp",
  "Washerwoman",
  "Chef",
  "Monk",
  "Poisoner",
  "Soldier",
];
const wrongReport = () =>
  commitStandardEntry(fixedRoles(empathRoles), "1 共情者 0 @N1");
const keys = (d: ClaimConditionDiagnosis, e: ConditionExplanation) =>
  d.conditions
    .filter((c) => e.relaxedIds.includes(c.id))
    .map((c) => `${c.sourceId}:${c.kind}`)
    .sort();
function replayWorkspace(
  w: StandardWorkspace,
  d: ClaimConditionDiagnosis,
  e: ConditionExplanation,
) {
  const p = prepareClaimAnalysis(w);
  const removed = keys(d, e);
  const ids = p.groups
    .flatMap((g) => g.conditions)
    .filter((c) => !removed.includes(`${c.sourceId}:${c.kind}`))
    .map((c) => c.id);
  return p.withConditions(ids);
}

describe("per-condition verified explanations", () => {
  it("distinguishes message accuracy from ability effectiveness while preserving the real identity", async () => {
    const w = wrongReport();
    const before = JSON.stringify(w);
    const d = await analyzeClaimConditions(w, [1], real);
    expect(d.status).toBe("conflict");
    expect(d.complete).toBe(true);
    expect(d.explanations).toHaveLength(2);
    expect(
      d.explanations
        .map((e) => d.conditions.find((c) => c.id === e.relaxedIds[0])!.kind)
        .sort(),
    ).toEqual(["ability_active", "report_accurate"]);
    for (const e of d.explanations) {
      expect(e.minimal).toBe(true);
      expect(e.witness.roles[0]).toBe("Empath");
      const q = prepareStandardSetupQuery(replayWorkspace(w, d, e));
      if (q.status !== "ready") throw new Error(q.reason);
      expect(replayFirstNight(q.input, e.witness).valid).toBe(true);
    }
    const active = d.explanations.find(
      (e) =>
        d.conditions.find((c) => c.id === e.relaxedIds[0])?.kind ===
        "ability_active",
    )!;
    expect(describeConditionExplanation(d.conditions, active)[0].cause).toBe(
      "unverified",
    );
    expect(JSON.stringify(w)).toBe(before);
  }, 30000);

  it("explains a fixed first-night poison action without blaming accurate transcription", async () => {
    const w = adopt(wrongReport(), {
      kind: "night_one_poison",
      poisonerSeat: 6,
      targetSeat: 1,
    });
    const d = await analyzeClaimConditions(w, [1], real);
    expect(d.explanations).toHaveLength(1);
    const e = d.explanations[0];
    expect(e.relaxedIds).toEqual([
      d.conditions.find((c) => c.kind === "ability_active")!.id,
    ]);
    expect(e.minimal).toBe(true);
    expect(describeConditionExplanation(d.conditions, e)[0]).toMatchObject({
      cause: "poisoned",
      roleAtReport: "Empath",
    });
    const q = prepareStandardSetupQuery(replayWorkspace(w, d, e));
    if (q.status !== "ready") throw new Error(q.reason);
    expect(replayFirstNight(q.input, e.witness).valid).toBe(true);
  }, 30000);

  it("explains a Drunk's shown token and keeps accuracy rather than treating it as lying", async () => {
    const roles: Role[] = [
      "Drunk",
      "Chef",
      "Monk",
      "Investigator",
      "Soldier",
      "Fortune Teller",
      "Spy",
      "Imp",
    ];
    let w = adopt(fixedRoles(roles), {
      kind: "seen_token",
      seat: 1,
      shownRole: "Empath",
    });
    w = commitStandardEntry(w, "1 共情者 0 @N1");
    const d = await analyzeClaimConditions(w, [1], real);
    expect(d.explanations).toHaveLength(1);
    const e = d.explanations[0];
    expect(
      d.conditions
        .filter((c) => e.relaxedIds.includes(c.id))
        .map((c) => c.kind)
        .sort(),
    ).toEqual(["ability_active", "actual_role"]);
    expect(e.minimal).toBe(true);
    expect(
      describeConditionExplanation(d.conditions, e).find(
        (item) => item.cause === "drunk",
      ),
    ).toMatchObject({ roleAtReport: "Drunk", shownRole: "Empath" });
    const q = prepareStandardSetupQuery(replayWorkspace(w, d, e));
    if (q.status !== "ready") throw new Error(q.reason);
    expect(replayFirstNight(q.input, e.witness).valid).toBe(true);
  }, 30000);

  it("points to N2 alone, retains N1 and replays each bounded-history explanation", async () => {
    const roles: Role[] = [
      "Imp",
      "Spy",
      "Empath",
      "Chef",
      "Investigator",
      "Monk",
      "Fortune Teller",
      "Butler",
    ];
    let w = fixedRoles(roles);
    for (const line of [
      "3 共情者 0 @N1",
      "close deaths @N1",
      "close actions @D1",
      "close deaths @D1",
      "4 dead @N2",
      "close deaths @N2",
      "3 共情者 2 @N2",
    ])
      w = commitStandardEntry(w, line, "public");
    const d = await analyzeClaimConditions(w, [3], real, {
      checkTimeoutMs: 4000,
      budgetMs: 30000,
    });
    expect(d.explanations).toHaveLength(2);
    expect(d.searchComplete).toBe(true);
    for (const e of d.explanations) {
      expect(e.minimal).toBe(true);
      const removed = d.conditions.filter((c) => e.relaxedIds.includes(c.id));
      expect(removed).toHaveLength(1);
      expect(removed[0].occurredAt).toEqual({ phase: "night", cycle: 2 });
      expect(claimConditionLabel(removed[0])).toContain("3号N2共情者报告");
      const q = prepareStandardObservedQuery(replayWorkspace(w, d, e));
      if (q.status !== "ready") throw new Error(q.reason);
      expect(replayObservedWitness(e.witness, q.input, q.input)).toEqual({
        valid: true,
        errors: [],
      });
    }
  }, 45000);

  it("honors manual accuracy or active premises that cannot be relaxed by diagnosis", async () => {
    for (const kind of ["report_accurate", "ability_active"] as const) {
      let w = wrongReport();
      const report = w.events.find(
        (e) =>
          e.payload.kind === "claim" &&
          e.payload.claimKind === "ability_report",
      )!;
      w = adopt(w, { kind, eventId: report.id });
      const fixed = [...w.branches[0].assumptionIds];
      const d = await analyzeClaimConditions(w, [1], async (trial, timeout) => {
        for (const id of fixed)
          expect(trial.branches[0].assumptionIds).toContain(id);
        return real(trial, timeout);
      });
      expect(d.explanations).toHaveLength(1);
      const removed = d.conditions.filter((c) =>
        d.explanations[0].relaxedIds.includes(c.id),
      );
      expect(removed).toHaveLength(1);
      expect(removed[0].kind).not.toBe(kind);
    }
  }, 30000);
});

const proof: SetupWitness = {
  roles: empathRoles,
  shownTokens: empathRoles,
  registrations: [],
};
const unsat: SetupQueryResult = {
  rulesetHash: "independent",
  scope: "first_night_slice",
  status: "unsat",
  classification: "inconsistent",
};
const sat: SetupQueryResult = {
  ...unsat,
  status: "sat",
  classification: "contingent",
  yes: proof,
};
const unknown: SetupQueryResult = {
  ...unsat,
  status: "unknown",
  classification: "unknown",
  unknownReason: "time_budget",
};

describe("diagnosis boundaries and independent subset reference", () => {
  it("matches an independent exhaustive 64-subset reference for coupled identities and reports", async () => {
    let w = createStandardWorkspace(7);
    w = commitStandardEntry(w, "1 共情者 0 @N1");
    w = commitStandardEntry(w, "2 共情者 0 @N1");
    const constraints = [
      "1:actual_role",
      "1:report_accurate",
      "1:ability_active",
      "2:actual_role",
      "2:report_accurate",
      "2:ability_active",
    ];
    const compatible = (retained: string[]) =>
      !(
        retained.some(
          (c) => c === "1:actual_role" || c === "1:ability_active",
        ) &&
        retained.some((c) => c === "2:actual_role" || c === "2:ability_active")
      );
    const oracle: ConflictOracle = async (trial) => {
      const selected = trial.branches[0].assumptionIds;
      const retained = trial.hypotheses
        .filter((h) => selected.includes(h.id))
        .map((h) => {
          const speaker =
            h.kind === "actual_role"
              ? h.seat
              : "eventId" in h
                ? trial.events.find((e) => e.id === h.eventId)?.payload
                : undefined;
          return `${typeof speaker === "number" ? speaker : speaker?.kind === "claim" ? speaker.speaker : ""}:${h.kind}`;
        });
      return compatible(retained) ? sat : unsat;
    };
    const expected = Array.from({ length: 64 }, (_, mask) =>
      constraints.filter((_, i) => mask & (1 << i)),
    )
      .filter(
        (removed) =>
          compatible(constraints.filter((c) => !removed.includes(c))) &&
          removed.every(
            (r) =>
              !compatible(
                constraints.filter((c) => c === r || !removed.includes(c)),
              ),
          ),
      )
      .map((removed) => removed.sort().join(","))
      .sort();
    const d = await analyzeClaimConditions(w, [1, 2], oracle);
    const actual = d.explanations
      .map((e) =>
        d.conditions
          .filter((c) => e.relaxedIds.includes(c.id))
          .map((c) => `${c.seat}:${c.kind}`)
          .sort()
          .join(","),
      )
      .sort();
    expect(actual).toEqual(expected);
    expect(d.complete).toBe(true);
    expect(d.explanations.every((e) => e.minimal)).toBe(true);
  });

  it("retains other players, active revision, privacy and saved assumptions without leaking sources", async () => {
    let w = wrongReport();
    w = commitStandardEntry(w, "3 Washerwoman @D1", "public");
    const revision = w.branches[0].baseRevision;
    w = commitStandardEntry({ ...w, perspectiveSeat: 2 }, "4 厨师 2 @N1");
    w = commitStandardEntry(
      { ...w, perspectiveSeat: 1 },
      "5 共情者 1 @N1",
      "public",
    );
    w = {
      ...w,
      branches: w.branches.map((b) => ({ ...b, baseRevision: revision + 2 })),
    };
    const before = JSON.stringify(w);
    const d = await analyzeClaimConditions(w, [1], async (trial, timeout) => {
      expect(trial.branches[0].baseRevision).toBe(revision + 2);
      const hs = trial.hypotheses.filter((h) =>
        trial.branches[0].assumptionIds.includes(h.id),
      );
      expect(
        hs.some(
          (h) =>
            h.kind === "actual_role" &&
            h.seat === 3 &&
            h.id.startsWith("claim-analysis-"),
        ),
      ).toBe(true);
      expect(
        hs.some(
          (h) =>
            h.kind === "actual_role" &&
            (h.seat === 4 || h.seat === 5) &&
            h.id.startsWith("claim-analysis-"),
        ),
      ).toBe(false);
      return real(trial, timeout);
    });
    expect(d.conditions.every((c) => c.seat === 1)).toBe(true);
    expect(d.explanations).toHaveLength(2);
    expect(JSON.stringify(w)).toBe(before);
    await expect(analyzeClaimConditions(w, [4], real)).rejects.toThrow(
      "不可见",
    );
    await expect(analyzeClaimConditions(w, [], real)).rejects.toThrow("不可见");
  }, 30000);

  it("does not present explanations when the selected combination leaves another conflict", async () => {
    const d = await analyzeClaimConditions(
      wrongReport(),
      [1],
      async () => unsat,
    );
    expect(d.status).toBe("fixed_conflict");
    expect(d.explanations).toEqual([]);
    expect(d.reason).toContain("选定玩家的全部临时条件放宽后仍有冲突");
  });

  it("never turns unknown restoration or an unverified poison target into a confirmed cause", async () => {
    const w = wrongReport();
    const d = await analyzeClaimConditions(w, [1], async (trial) => {
      const ids = trial.branches[0].assumptionIds;
      const count = trial.hypotheses.filter(
        (h) => h.id.startsWith("claim-analysis-") && ids.includes(h.id),
      ).length;
      return count === 3 ? unsat : count === 2 ? unknown : sat;
    });
    expect(d.explanations.length).toBeGreaterThan(0);
    expect(d.explanations.every((e) => !e.minimal)).toBe(true);
    expect(d.complete).toBe(false);
    const active = d.conditions.find((c) => c.kind === "ability_active")!;
    const unverified = describeConditionExplanation(
      [{ ...active, occurredAt: { phase: "night", cycle: 2 } }],
      {
        relaxedIds: [active.id],
        witness: {
          ...proof,
          timeline: [
            { kind: "night", actions: { cycle: 1 } },
            { kind: "day", events: [] },
            {
              kind: "night",
              actions: { cycle: 2, poisonerTarget: 1, impTarget: 6 },
            },
          ],
        },
        minimal: false,
      },
    );
    expect(unverified[0].cause).toBe("unverified");
  });

  it("marks an explanation cap or baseline deadline incomplete and keeps progress immutable", async () => {
    const snapshots: ClaimConditionDiagnosis[] = [];
    const d = await analyzeClaimConditions(
      wrongReport(),
      [1],
      real,
      { maxRepairs: 1 },
      (p) => snapshots.push(p),
    );
    expect(d.explanations).toHaveLength(1);
    expect(d.searchComplete).toBe(false);
    expect(d.reason).toContain("解释上限");
    expect(snapshots[0].explanations).toEqual([]);
    const timed = await analyzeClaimConditions(wrongReport(), [1], real, {
      maxChecks: 1,
    });
    expect(timed.explanations).toEqual([]);
    expect(timed.complete).toBe(false);
    const mixed = await analyzeClaimConditions(
      wrongReport(),
      [1],
      async (trial, timeout) => {
        const answer = await real(trial, timeout);
        return { ...answer, rulesetHash: crypto.randomUUID() };
      },
    );
    expect(mixed.status).toBe("unknown");
    expect(mixed.explanations).toEqual([]);
    expect(mixed.reason).toContain("规则版本");
  }, 30000);
});
