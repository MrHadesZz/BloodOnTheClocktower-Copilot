import { describe, expect, it, vi } from "vitest";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  analyzeRecord,
  prepareRecordAnalysis,
  type RecordAnalysis,
} from "./recordAnalysis";
import {
  closeStandardPhase,
  correctStandardAction,
  nominationVoteSources,
} from "./standardHistory";
import {
  addStandardHypothesis,
  commitStandardEntry,
  createStandardBranch,
  createStandardWorkspace,
  prepareStandardObservedQuery,
  publicTranscript,
  retractStandardEvent,
  toggleStandardHypothesis,
  validateStandardWorkspace,
  type StandardWorkspace,
} from "./standardWorkspace";
import {
  queryInitialSetup,
  queryObservedTimeline,
  type SetupQueryResult,
  type RoleFact,
  type ObservedQueryInput,
} from "./symbolicSetup";
import { replayObservedWitness } from "./observedTimeline";
import type { StandardSolvers } from "./standardQuery";
import type { Role } from "./model";

const n1 = { phase: "night", cycle: 1 } as const;
const d1 = { phase: "day", cycle: 1 } as const;
const n2 = { phase: "night", cycle: 2 } as const;
type Kind = "death" | "execution" | "nomination" | "slayer" | "vote";
function fixture(kind: Kind = "death", scope: "public" | "private" = "public") {
  const roles: Role[] =
    kind === "vote"
      ? [
          "Slayer",
          "Chef",
          "Monk",
          "Undertaker",
          "Virgin",
          "Recluse",
          "Saint",
          "Spy",
          "Imp",
        ]
      : [
          "Slayer",
          "Chef",
          "Monk",
          "Fortune Teller",
          "Soldier",
          "Poisoner",
          "Imp",
        ];
  let w = createStandardWorkspace(roles.length);
  for (const [i, role] of roles.entries()) {
    w = addStandardHypothesis(w, { kind: "actual_role", seat: i + 1, role });
    w = toggleStandardHypothesis(w, w.hypotheses.at(-1)!.id);
  }
  w = closeStandardPhase(w, n1, true);
  const texts =
    kind === "slayer"
      ? ["2 slay 7 @D1", "7 dead @D1", "win good @D1"]
      : kind === "vote"
        ? [
            "2 nom 3 @D1",
            "vote 3 = 1,2,3,4,5 @D1",
            "1 slay 6 @D1",
            "6 dead @D1",
          ]
        : [
            "2 nom 3 @D1",
            "vote 3 = 1,2,3,4 @D1",
            `exec ${kind === "execution" || kind === "nomination" ? 4 : 3} @D1`,
            `${kind === "nomination" ? 4 : 3} dead @D1`,
          ];
  for (const text of texts) w = commitStandardEntry(w, text, scope);
  w = closeStandardPhase(w, d1, true);
  if (kind === "death" || kind === "execution") {
    w = commitStandardEntry(w, `${kind === "death" ? 3 : 4} dead @N2`, scope);
    w = closeStandardPhase(w, n2, true);
  }
  const source =
    kind === "death"
      ? w.events.find(
          (e) => e.payload.kind === kind && e.occurredAt?.phase === "night",
        )!
      : w.events.find((e) => e.payload.kind === kind)!;
  return { workspace: w, source };
}
const real: StandardSolvers = {
  setup: queryInitialSetup,
  observed: queryObservedTimeline,
};
const unsat: SetupQueryResult = {
  status: "unsat",
  classification: "inconsistent",
  scope: "bounded_timeline",
  rulesetHash: "test-v1",
};
const unknown: SetupQueryResult = {
  ...unsat,
  status: "unknown",
  classification: "unknown",
  unknownReason: "candidate_limit",
};
const compatible: SetupQueryResult = {
  ...unknown,
  no: {
    roles: [
      "Slayer",
      "Chef",
      "Monk",
      "Fortune Teller",
      "Soldier",
      "Poisoner",
      "Imp",
    ],
    shownTokens: [
      "Slayer",
      "Chef",
      "Monk",
      "Fortune Teller",
      "Soldier",
      "Poisoner",
      "Imp",
    ],
    registrations: [],
  },
};
function observed(w: StandardWorkspace) {
  const input = prepareStandardObservedQuery(w);
  if (input.status !== "ready") throw new Error(input.reason);
  return { ...input.input, timeoutMs: 10000 };
}

describe("single-record hypothetical substitutions", () => {
  it.each(["death", "execution", "nomination", "slayer", "vote"] as const)(
    "finds real %s alternatives, independently replays them and preserves the workspace",
    async (kind) => {
      const f = fixture(kind);
      const before = JSON.stringify(f.workspace);
      const transcript = publicTranscript(f.workspace);
      const result = await analyzeRecord(f.workspace, f.source.id, real, {
        maxResults: 12,
        budgetMs: 20000,
        checkTimeoutMs: 10000,
      });
      expect(result.baselineConflict).toBe(true);
      expect(result.status).toBe("confirmed");
      expect(result.complete).toBe(true);
      expect(result.testedCandidates).toBe(result.totalCandidates);
      expect(result.alternatives.length).toBeGreaterThan(0);
      const prepared = prepareRecordAnalysis(f.workspace, f.source.id);
      const batch = [];
      for (const alternative of result.alternatives) {
        const trial = prepared.withCandidate(alternative);
        expect(validateStandardWorkspace(trial)).toBe(trial);
        const request = observed(trial);
        expect(request.phases).toHaveLength(
          observed(f.workspace).phases.length,
        );
        expect(
          replayObservedWitness(alternative.witness, request, request).valid,
        ).toBe(true);
        batch.push({
          id: `single-${kind}-${alternative.id}`,
          request,
          witness: alternative.witness,
        });
        if (kind === "nomination") {
          const nomination = trial.events.find(
            (e) => e.correctsEventId === f.source.id,
          )!;
          expect(
            nominationVoteSources(trial, nomination.id)[0].payload.voters,
          ).toEqual([1, 2, 3, 4]);
          expect(result.relatedSourceIds).toEqual(
            nominationVoteSources(f.workspace, f.source.id).map((e) => e.id),
          );
        }
      }
      const oracle = spawnSync(
        process.env.PYTHON ??
          (process.platform === "win32" ? "python" : "python3"),
        [
          fileURLToPath(
            new URL("../../reference/v1_oracle.py", import.meta.url),
          ),
          "--check-witnesses",
        ],
        { input: JSON.stringify(batch), encoding: "utf8" },
      );
      expect(oracle.status, oracle.stderr).toBe(0);
      expect(
        JSON.parse(oracle.stdout).every(
          (answer: { errors: string[] }) => answer.errors.length === 0,
        ),
      ).toBe(true);
      expect(JSON.stringify(f.workspace)).toBe(before);
      expect(publicTranscript(f.workspace)).toEqual(transcript);
    },
    30000,
  );
  it("reads an old revision without importing future corrections or unused report hypotheses", async () => {
    const f = fixture("nomination");
    const parent = f.workspace.branches[0];
    let w = createStandardBranch(f.workspace, "后续纠正");
    w = correctStandardAction(
      w,
      f.source.id,
      { kind: "nomination", nominator: 2, nominee: 4 },
      nominationVoteSources(w, f.source.id).map((e) => e.id),
    );
    w = closeStandardPhase(w, d1, true);
    w = commitStandardEntry(w, "2 chef 0 @N1");
    w = addStandardHypothesis(w, {
      kind: "report_accurate",
      eventId: w.events.at(-1)!.id,
    });
    const old = { ...w, activeBranchId: parent.id };
    const result = await analyzeRecord(old, f.source.id, real, {
      maxResults: 12,
    });
    expect(result.baselineConflict).toBe(true);
    expect(result.revision).toBe(parent.baseRevision);
    expect(result.alternatives.some((a) => a.id === "nominee-4")).toBe(true);
    expect(old.branches[0]).toEqual(parent);
    expect(w.events.length).toBeGreaterThan(result.revision);
  }, 20000);
  it("retains the original replay position of a repeatedly corrected source and its ballot", async () => {
    const f = fixture("nomination");
    const w = closeStandardPhase(
      correctStandardAction(
        f.workspace,
        f.source.id,
        { kind: "nomination", nominator: 2, nominee: 6 },
        nominationVoteSources(f.workspace, f.source.id).map((e) => e.id),
      ),
      d1,
      true,
    );
    const source = w.events.find((e) => e.correctsEventId === f.source.id)!;
    const result = await analyzeRecord(w, source.id, real, { maxResults: 12 });
    const choice = result.alternatives.find((a) => a.id === "nominee-4")!;
    expect(choice).toBeDefined();
    const trial = prepareRecordAnalysis(w, source.id).withCandidate(choice);
    const day = observed(trial).phases[1];
    if (day.kind !== "day") throw new Error("Expected day");
    expect(day.events[0]).toMatchObject({
      kind: "nomination",
      nominee: 4,
      votes: [1, 2, 3, 4],
    });
    expect(w.events.find((e) => e.id === f.source.id)).toEqual(f.source);
  }, 20000);
  it("does not offer replacements when the original background already has a witness", async () => {
    const f = fixture();
    const solver = vi.fn(async () => compatible);
    const result = await analyzeRecord(f.workspace, f.source.id, {
      ...real,
      observed: solver,
    });
    expect(result).toMatchObject({
      status: "compatible",
      baselineConflict: false,
      checks: 1,
      alternatives: [],
      complete: true,
    });
    expect(solver).toHaveBeenCalledOnce();
  });
  it("does not infer a conflict or candidates from an unknown baseline", async () => {
    const f = fixture();
    const result = await analyzeRecord(f.workspace, f.source.id, {
      ...real,
      observed: async () => unknown,
    });
    expect(result).toMatchObject({
      status: "unknown",
      baselineConflict: false,
      checks: 1,
      alternatives: [],
      complete: false,
    });
  });
  it("retains one-sided witnesses but keeps unresolved alternatives unknown", async () => {
    const f = fixture();
    let count = 0;
    const result = await analyzeRecord(f.workspace, f.source.id, {
      ...real,
      observed: async () =>
        ++count === 1
          ? unsat
          : count === 2
            ? compatible
            : count === 3
              ? unknown
              : unsat,
    });
    expect(result).toMatchObject({
      status: "partial",
      baselineConflict: true,
      unknownCandidates: 1,
      complete: false,
    });
    expect(result.alternatives).toHaveLength(1);
    expect(result.alternatives[0].witness).toEqual(compatible.no);
  });
  it("distinguishes a fully checked single-field scope from general innocence", async () => {
    const f = fixture();
    const result = await analyzeRecord(f.workspace, f.source.id, {
      ...real,
      observed: async () => unsat,
    });
    expect(result).toMatchObject({
      status: "no_single_edit",
      complete: true,
      baselineConflict: true,
    });
    expect(result.reason).toContain("这不证明原记录正确");
    expect(result.testedCandidates).toBe(6);
  });
  it("does not fabricate empty phases by deleting a death", async () => {
    const f = fixture();
    const inputs: ObservedQueryInput[] = [];
    await analyzeRecord(f.workspace, f.source.id, {
      ...real,
      observed: async (input) => {
        inputs.push(input);
        return unsat;
      },
    });
    expect(inputs).toHaveLength(7);
    expect(
      inputs.every(
        (input) =>
          input.phases.length === 3 && input.phases[2].deaths.length === 1,
      ),
    ).toBe(true);
    expect(inputs.slice(1).map((input) => input.phases[2].deaths[0])).toEqual([
      1, 2, 4, 5, 6, 7,
    ]);
    expect(
      inputs.every(
        (input) =>
          JSON.stringify(input.phases.slice(0, 2)) ===
          JSON.stringify(inputs[0].phases.slice(0, 2)),
      ),
    ).toBe(true);
  });
  it("retains confirmed progress at the check or result limit", async () => {
    const f = fixture();
    const progress: RecordAnalysis[] = [];
    let count = 0;
    const result = await analyzeRecord(
      f.workspace,
      f.source.id,
      { ...real, observed: async () => (++count === 1 ? unsat : compatible) },
      { maxChecks: 2 },
      (value) => progress.push(value),
    );
    expect(result).toMatchObject({
      status: "partial",
      checks: 2,
      testedCandidates: 1,
      baselineConflict: true,
      complete: false,
    });
    expect(result.alternatives).toHaveLength(1);
    expect(progress[0].baselineConflict).toBe(true);
    expect(progress[0].alternatives).toHaveLength(0);
    expect(progress.at(-1)!.alternatives).toHaveLength(1);
    count = 0;
    const capped = await analyzeRecord(
      f.workspace,
      f.source.id,
      { ...real, observed: async () => (++count === 1 ? unsat : compatible) },
      { maxResults: 1 },
    );
    expect(capped.status).toBe("partial");
    expect(capped.reason).toContain("展示候选上限");
    expect(capped.testedCandidates).toBe(1);
  });
  it.each([0, -1])(
    "does not call a solver at a zero budget: %s",
    async (budgetMs) => {
      const f = fixture();
      const solver = vi.fn(async () => unsat);
      const result = await analyzeRecord(
        f.workspace,
        f.source.id,
        { ...real, observed: solver },
        { budgetMs },
      );
      expect(result).toMatchObject({
        status: "unknown",
        baselineConflict: false,
        checks: 0,
        alternatives: [],
      });
      expect(solver).not.toHaveBeenCalled();
    },
  );
  it("does not combine ruleset changes with prior candidate evidence", async () => {
    const f = fixture();
    let count = 0;
    const result = await analyzeRecord(f.workspace, f.source.id, {
      ...real,
      observed: async () =>
        ++count === 1
          ? unsat
          : count === 2
            ? compatible
            : { ...compatible, rulesetHash: "test-v2" },
    });
    expect(result).toMatchObject({
      status: "partial",
      rulesetHash: "test-v1",
      complete: false,
      testedCandidates: 1,
    });
    expect(result.alternatives).toHaveLength(1);
    expect(result.reason).toContain("规则版本");
  });
  it("marks failed solver calls unknown while retaining the confirmed original conflict", async () => {
    const f = fixture();
    let count = 0;
    const result = await analyzeRecord(f.workspace, f.source.id, {
      ...real,
      observed: async () => {
        if (++count === 1) return unsat;
        throw new Error("injected failure");
      },
    });
    expect(result).toMatchObject({
      status: "partial",
      baselineConflict: true,
      unknownCandidates: 6,
      alternatives: [],
      complete: false,
    });
    expect(result.reason).toBe("injected failure");
  });
  it("keeps the adopted-premise switch local to this diagnosis", async () => {
    const f = fixture();
    const before = JSON.stringify(f.workspace);
    const facts: RoleFact[][] = [];
    const result = await analyzeRecord(
      f.workspace,
      f.source.id,
      {
        ...real,
        observed: async (input) => {
          facts.push(input.facts);
          return unsat;
        },
      },
      { includeAssumptions: false },
    );
    expect(result.assumptionIds).toEqual([]);
    expect(facts.every((items) => items.length === 0)).toBe(true);
    expect(JSON.stringify(f.workspace)).toBe(before);
  });
  it("preserves private sources and public export through real hypothetical analysis", async () => {
    const f = fixture("death", "private");
    const before = publicTranscript(f.workspace);
    const result = await analyzeRecord(f.workspace, f.source.id, real, {
      maxResults: 1,
    });
    expect(result.baselineConflict).toBe(true);
    expect(result.alternatives).toHaveLength(1);
    expect(publicTranscript(f.workspace)).toEqual(before);
    expect(() =>
      prepareRecordAnalysis(
        { ...f.workspace, perspectiveSeat: 2 },
        f.source.id,
      ),
    ).toThrow("不可见");
  }, 20000);
  it("refuses missing, retired, nonphysical and future sources", () => {
    const f = fixture();
    expect(() => prepareRecordAnalysis(f.workspace, "missing")).toThrow(
      "不可见",
    );
    expect(() =>
      prepareRecordAnalysis(
        retractStandardEvent(f.workspace, f.source.id),
        f.source.id,
      ),
    ).toThrow("不可见");
    expect(() =>
      prepareRecordAnalysis(f.workspace, f.workspace.events[0].id),
    ).toThrow("不可见");
    const old = createStandardBranch(f.workspace, "旧记录");
    const future = commitStandardEntry(old, "2 dead @N3", "public");
    expect(() =>
      prepareRecordAnalysis(
        { ...future, activeBranchId: old.branches[0].id },
        future.events.at(-1)!.id,
      ),
    ).toThrow("尚未进入当前修订");
    const report = commitStandardEntry(future, "2 chef 0 @N1");
    const withHypothesis = addStandardHypothesis(report, {
      kind: "report_accurate",
      eventId: report.events.at(-1)!.id,
    });
    const stalePremise = {
      ...withHypothesis,
      activeBranchId: old.branches[0].id,
      branches: withHypothesis.branches.map((branch) =>
        branch.id === old.branches[0].id
          ? {
              ...branch,
              assumptionIds: [
                ...branch.assumptionIds,
                withHypothesis.hypotheses.at(-1)!.id,
              ],
            }
          : branch,
      ),
    };
    expect(() => prepareRecordAnalysis(stalePremise, f.source.id)).toThrow(
      "采纳前提的来源超出这份修订",
    );
  });
  it("does not bypass incomplete or unsupported day records", async () => {
    let w = createStandardWorkspace(7);
    for (const text of ["2 nom 3 @D1", "1 slay 5 @D1", "vote 3 = 1,2,3,4 @D1"])
      w = commitStandardEntry(w, text, "public");
    const source = w.events.find((e) => e.payload.kind === "nomination")!;
    const solver = vi.fn(async () => unsat);
    const incomplete = await analyzeRecord(w, source.id, {
      ...real,
      observed: solver,
    });
    expect(incomplete).toMatchObject({
      status: "not_ready",
      baselineConflict: false,
      checks: 0,
    });
    w = closeStandardPhase(w, d1, true);
    const interleaved = await analyzeRecord(w, source.id, {
      ...real,
      observed: solver,
    });
    expect(interleaved).toMatchObject({ status: "not_ready", checks: 0 });
    expect(interleaved.reason).toContain("交错顺序");
    expect(solver).not.toHaveBeenCalled();
  });
});
