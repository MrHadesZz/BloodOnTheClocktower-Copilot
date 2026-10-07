import { describe, expect, it } from "vitest";
import {
  addStandardHypothesis,
  createStandardWorkspace,
  commitStandardEntry,
  prepareStandardObservedQuery,
  toggleStandardHypothesis,
} from "./standardWorkspace";
import { closeStandardPhase, recordStandardRoleClaim } from "./standardHistory";
import { analyzeClaims, prepareClaimAnalysis } from "./claimAnalysis";
import {
  analyzeClaimConditions,
  claimConditionLabel,
  describeConditionExplanation,
} from "./claimConditionAnalysis";
import { solveStandardWorkspace } from "./standardQuery";
import { queryInitialSetup, queryObservedTimeline } from "./symbolicSetup";
import { replayObservedWitness } from "./observedTimeline";
import type { Role } from "./model";
import type { ConflictOracle } from "./conflict";

const n1 = { phase: "night", cycle: 1 } as const;
const d1 = { phase: "day", cycle: 1 } as const;
const n2 = { phase: "night", cycle: 2 } as const;
const roles: Role[] = [
  "Fortune Teller",
  "Chef",
  "Investigator",
  "Scarlet Woman",
  "Monk",
  "Undertaker",
  "Imp",
  "Butler",
];
function fixture() {
  let w = createStandardWorkspace(8);
  for (const [i, role] of roles.entries()) {
    w = addStandardHypothesis(w, { kind: "actual_role", seat: i + 1, role });
    w = toggleStandardHypothesis(w, w.hypotheses.at(-1)!.id);
  }
  w = recordStandardRoleClaim(w, 4, "Scarlet Woman", d1, "initial");
  w = closeStandardPhase(w, n1, true);
  w = closeStandardPhase(w, d1, true);
  w = commitStandardEntry(w, "7 dead @N2", "public");
  return closeStandardPhase(w, n2, true);
}
const real: ConflictOracle = async (w, timeoutMs) =>
  (
    await solveStandardWorkspace(
      w,
      { setup: queryInitialSetup, observed: queryObservedTimeline },
      timeoutMs,
    )
  ).answer;

describe("current role statement at an exact phase", () => {
  it("keeps Scarlet Woman as the initial role and Imp as the N2 role with an independently replayed succession", async () => {
    let w = fixture();
    w = recordStandardRoleClaim(w, 4, "Scarlet Woman", n1, "current");
    w = recordStandardRoleClaim(w, 4, "Imp", n2, "current");
    const before = JSON.stringify(w);
    const result = await analyzeClaims(w, real);
    expect(result.status).toBe("compatible");
    expect(result.witness?.roles[3]).toBe("Scarlet Woman");
    expect(result.witness?.currentRoles?.[3]).toBe("Imp");
    const p = prepareClaimAnalysis(w);
    const q = prepareStandardObservedQuery(p.withSeats([4]));
    if (q.status !== "ready") throw new Error(q.reason);
    expect(q.input.phaseRoleFacts).toEqual([
      { seat: 4, role: "Scarlet Woman", phaseIndex: 0 },
      { seat: 4, role: "Imp", phaseIndex: 2 },
    ]);
    expect(replayObservedWitness(result.witness!, q.input, q.input)).toEqual({
      valid: true,
      errors: [],
    });
    const incorrect = {
      ...q.input,
      phaseRoleFacts: [
        { seat: 4, role: "Scarlet Woman" as const, phaseIndex: 2 },
      ],
    };
    expect(
      replayObservedWitness(result.witness!, incorrect, incorrect).valid,
    ).toBe(false);
    expect(JSON.stringify(w)).toBe(before);
  }, 30000);
  it("finds a wrong N2 claim without weakening the correct starting identity", async () => {
    const w = recordStandardRoleClaim(
      fixture(),
      4,
      "Scarlet Woman",
      n2,
      "current",
    );
    const result = await analyzeClaims(w, real);
    expect(result.status).toBe("conflict");
    const detail = await analyzeClaimConditions(w, [4], real);
    expect(detail.explanations).toHaveLength(1);
    const e = detail.explanations[0];
    const removed = detail.conditions.filter((c) =>
      e.relaxedIds.includes(c.id),
    );
    expect(removed.map((c) => c.kind)).toEqual(["role_at_phase"]);
    expect(claimConditionLabel(removed[0])).toBe("4号N2结束时角色为红唇女郎");
    expect(e.witness.roles[3]).toBe("Scarlet Woman");
    expect(
      describeConditionExplanation(detail.conditions, e)[0].roleAtReport,
    ).toBe("Imp");
    expect(e.minimal).toBe(true);
  }, 30000);
  it("does not treat an unclosed future role statement as an initial setup premise", async () => {
    const w = recordStandardRoleClaim(
      createStandardWorkspace(8),
      4,
      "Imp",
      n2,
      "current",
    );
    const p = prepareClaimAnalysis(w);
    expect(p.groups[0].role).toBeUndefined();
    expect(p.groups[0].conditions.map((c) => c.kind)).toEqual([
      "role_at_phase",
    ]);
    const result = await analyzeClaims(w, real);
    expect(result.status).toBe("unknown");
    expect(result.repairs).toEqual([]);
    expect(result.reason).toMatch(/阶段|事实/);
  });
  it("rejects facts outside the available phase range instead of skipping a constraint", async () => {
    const p = prepareClaimAnalysis(fixture());
    const q = prepareStandardObservedQuery(p.withSeats([4]));
    if (q.status !== "ready") throw new Error(q.reason);
    await expect(
      queryObservedTimeline({
        ...q.input,
        phaseRoleFacts: [{ seat: 4, role: "Imp", phaseIndex: 99 }],
      }),
    ).rejects.toThrow("阶段");
  });
});
