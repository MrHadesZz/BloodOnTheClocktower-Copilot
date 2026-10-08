import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
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
  visibleStandardEvents,
  type StandardWorkspace,
} from "./standardWorkspace";
import {
  closeStandardPhase,
  correctStandardAction,
  correctStandardFact,
  correctStandardVote,
  nominationVoteSources,
  standardHistory,
  standardPhaseStatus,
  type CorrectableActionPayload,
} from "./standardHistory";
import { queryObservedTimeline } from "./symbolicSetup";
import { replayObservedWitness } from "./observedTimeline";
import type { Role } from "./model";

const n1 = { phase: "night", cycle: 1 } as const;
const d1 = { phase: "day", cycle: 1 } as const;
const roles: Role[] = [
  "Slayer",
  "Chef",
  "Monk",
  "Fortune Teller",
  "Soldier",
  "Poisoner",
  "Imp",
];
function fixture(
  kind: "nomination" | "slayer" = "nomination",
  scope: "public" | "private" = "public",
  privateVote = false,
) {
  let w = createStandardWorkspace(7);
  for (const [i, role] of roles.entries()) {
    w = addStandardHypothesis(w, { kind: "actual_role", seat: i + 1, role });
    w = toggleStandardHypothesis(w, w.hypotheses.at(-1)!.id);
  }
  w = closeStandardPhase(w, n1, true);
  if (kind === "nomination") {
    w = commitStandardEntry(w, "2 nom 3 @D1", scope);
    w = commitStandardEntry(
      w,
      "vote 3 = 1,2,3,4 @D1",
      privateVote ? "private" : scope,
    );
    w = commitStandardEntry(w, "1 slay 5 @D1", scope);
    w = commitStandardEntry(w, "5 nom 6 @D1", scope);
    w = commitStandardEntry(w, "exec 4 @D1", scope);
    w = commitStandardEntry(w, "4 dead @D1", scope);
  } else {
    w = commitStandardEntry(w, "2 slay 7 @D1", scope);
    w = commitStandardEntry(w, "7 dead @D1", scope);
    w = commitStandardEntry(w, "win good @D1", scope);
  }
  const source = w.events.find((e) => e.payload.kind === kind)!;
  w = closeStandardPhase(w, d1, true);
  const parentId = w.activeBranchId;
  w = createStandardBranch(w, "行动纠正分支");
  return { workspace: w, source, parentId };
}
const correctedPayload = (
  kind: "nomination" | "slayer",
): CorrectableActionPayload =>
  kind === "nomination"
    ? { kind, nominator: 2, nominee: 4 }
    : { kind, actor: 1, target: 7 };
function correct(f: ReturnType<typeof fixture>) {
  const kind = f.source.payload.kind;
  if (kind !== "nomination" && kind !== "slayer")
    throw new Error("Unexpected fixture");
  return correctStandardAction(
    f.workspace,
    f.source.id,
    correctedPayload(kind),
    nominationVoteSources(f.workspace, f.source.id).map((e) => e.id),
  );
}
function prepared(w: StandardWorkspace) {
  const result = prepareStandardObservedQuery(w);
  if (result.status !== "ready") throw new Error(result.reason);
  return {
    ...result.input,
    timeoutMs: 10000,
    maxWorlds: 20,
    maxHistories: 1000,
  };
}

describe("audited nomination and Slayer corrections", () => {
  it.each(["nomination", "slayer"] as const)(
    "repairs a real %s conflict, independently replays it and keeps the old branch",
    async (kind) => {
      const f = fixture(kind);
      const before = JSON.stringify(f.workspace);
      expect(
        (await queryObservedTimeline(prepared(f.workspace))).classification,
      ).toBe("inconsistent");
      let w = correct(f);
      expect(w.schemaVersion).toBe(5);
      expect(publicTranscript(w).schemaVersion).toBe(4);
      expect(JSON.stringify(f.workspace)).toBe(before);
      expect(standardPhaseStatus(w, d1).complete).toBe(false);
      expect(standardPhaseStatus(w, n1).complete).toBe(true);
      expect(prepareStandardObservedQuery(w).status).toBe("unsupported");
      w = closeStandardPhase(w, d1, true);
      const request = prepared(w);
      const result = await queryObservedTimeline(request);
      const witness = result.yes ?? result.no;
      expect(witness).toBeDefined();
      expect(replayObservedWitness(witness!, request, request).valid).toBe(
        true,
      );
      const oracle = spawnSync(
        process.env.PYTHON ??
          (process.platform === "win32" ? "python" : "python3"),
        [
          fileURLToPath(
            new URL("../../reference/v1_oracle.py", import.meta.url),
          ),
          "--check-witnesses",
        ],
        {
          input: JSON.stringify([
            { id: `action-correction-${kind}`, request, witness },
          ]),
          encoding: "utf8",
        },
      );
      expect(oracle.status, oracle.stderr).toBe(0);
      expect(JSON.parse(oracle.stdout)[0].errors).toEqual([]);
      const old = { ...w, activeBranchId: f.parentId };
      expect(old.branches[0]).toEqual(f.workspace.branches[0]);
      expect((await queryObservedTimeline(prepared(old))).classification).toBe(
        "inconsistent",
      );
      expect(() =>
        correctStandardAction(old, f.source.id, correctedPayload(kind)),
      ).toThrow("更新到最新记录");
    },
    20000,
  );
  it("requires an exact review of linked ballots and does not mutate a refused correction", () => {
    const f = fixture();
    const before = JSON.stringify(f.workspace);
    const vote = nominationVoteSources(f.workspace, f.source.id)[0];
    for (const ids of [[], ["missing"], [vote.id, vote.id]])
      expect(() =>
        correctStandardAction(
          f.workspace,
          f.source.id,
          correctedPayload("nomination"),
          ids,
        ),
      ).toThrow("全部关联投票");
    expect(JSON.stringify(f.workspace)).toBe(before);
    expect(standardPhaseStatus(f.workspace, d1).complete).toBe(true);
  });
  it("supports repeated nomination and ballot corrections while preserving both original positions", () => {
    const f = fixture();
    const originalVote = nominationVoteSources(f.workspace, f.source.id)[0];
    let w = correctStandardVote(f.workspace, originalVote.id, [1, 2, 4]);
    let vote = nominationVoteSources(w, f.source.id)[0];
    w = correctStandardAction(w, f.source.id, correctedPayload("nomination"), [
      vote.id,
    ]);
    const nomination = w.events.find((e) => e.correctsEventId === f.source.id)!;
    const replacement = nominationVoteSources(w, nomination.id)[0];
    expect(replacement.correctsEventId).toBe(vote.id);
    expect(replacement.payload.voters).toEqual([1, 2, 4]);
    expect(w.events.find((e) => e.id === originalVote.id)).toEqual(
      originalVote,
    );
    w = correctStandardAction(
      w,
      nomination.id,
      { kind: "nomination", nominator: 3, nominee: 4 },
      [replacement.id],
    );
    const latest = w.events.find((e) => e.correctsEventId === nomination.id)!;
    vote = nominationVoteSources(w, latest.id)[0];
    expect(vote.payload.nominee).toBe(4);
    expect(vote.payload.voters).toEqual([1, 2, 4]);
    expect(
      standardHistory(w).find((r) => r.event.id === f.source.id)?.status,
    ).toBe("corrected");
    expect(
      standardHistory(w).find((r) => r.event.id === replacement.id)?.status,
    ).toBe("corrected");
    w = closeStandardPhase(w, d1, true);
    const day = prepared(w).phases[1];
    if (day.kind !== "day") throw new Error("Expected D1");
    expect(day.events).toEqual([
      { kind: "nomination", nominator: 3, nominee: 4, votes: [1, 2, 4] },
      { kind: "slayer", actor: 1, target: 5 },
      { kind: "nomination", nominator: 5, nominee: 6, votes: [] },
    ]);
    expect(validateStandardWorkspace(JSON.parse(JSON.stringify(w)))).toEqual(w);
  });
  it.each(["nomination", "slayer"] as const)(
    "leaves an unchanged %s and its closures untouched",
    (kind) => {
      const f = fixture(kind);
      const payload = f.source.payload as CorrectableActionPayload;
      expect(correctStandardAction(f.workspace, f.source.id, payload)).toBe(
        f.workspace,
      );
      expect(standardPhaseStatus(f.workspace, d1).complete).toBe(true);
    },
  );
  it("corrects a nomination without inventing a ballot", () => {
    let w = commitStandardEntry(
      createStandardWorkspace(7),
      "2 nom 3 @D1",
      "public",
    );
    const id = w.events.at(-1)!.id;
    w = correctStandardAction(w, id, {
      kind: "nomination",
      nominator: 4,
      nominee: 5,
    });
    expect(
      visibleStandardEvents(w, 1).filter((e) => e.payload.kind === "vote"),
    ).toHaveLength(0);
    expect(validateStandardWorkspace(w)).toBe(w);
  });
  it("keeps a recorded zero-vote ballot and still requires review of its association", () => {
    let w = commitStandardEntry(
      createStandardWorkspace(7),
      "2 nom 3 @D1",
      "public",
    );
    const id = w.events.at(-1)!.id;
    w = commitStandardEntry(w, "vote 3 = none @D1", "public");
    const vote = nominationVoteSources(w, id)[0];
    expect(() =>
      correctStandardAction(w, id, correctedPayload("nomination")),
    ).toThrow("全部关联投票");
    w = correctStandardAction(w, id, correctedPayload("nomination"), [vote.id]);
    const replacement = w.events.find((e) => e.correctsEventId === vote.id)!;
    expect(replacement.payload).toMatchObject({
      kind: "vote",
      nominee: 4,
      voters: [],
    });
  });
  it("keeps unsupported interleaving after a nomination correction", () => {
    let w = createStandardWorkspace(7);
    for (const text of ["2 nom 3 @D1", "1 slay 5 @D1", "vote 3 = 1,2,3,4 @D1"])
      w = commitStandardEntry(w, text, "public");
    const nomination = w.events.find((e) => e.payload.kind === "nomination")!;
    w = correctStandardAction(
      w,
      nomination.id,
      correctedPayload("nomination"),
      nominationVoteSources(w, nomination.id).map((e) => e.id),
    );
    w = closeStandardPhase(w, d1, true);
    expect(prepareStandardObservedQuery(w)).toMatchObject({
      status: "unsupported",
      reason: expect.stringContaining("交错顺序"),
    });
  });
  it("preserves private ballot visibility under a public nomination correction", () => {
    const f = fixture("nomination", "public", true);
    const vote = nominationVoteSources(f.workspace, f.source.id)[0];
    const w = correct(f);
    const replacement = w.events.find((e) => e.correctsEventId === vote.id)!;
    expect(replacement).toMatchObject({ visibility: "private", ownerSeat: 1 });
    const transcript = publicTranscript(w);
    expect(transcript.schemaVersion).toBe(4);
    expect(
      transcript.events.some(
        (e) => e.id === vote.id || e.correctsEventId === vote.id,
      ),
    ).toBe(false);
    expect(
      transcript.events.some((e) => e.correctsEventId === f.source.id),
    ).toBe(true);
    expect(transcript.events.every((e) => e.visibility === "public")).toBe(
      true,
    );
  });
  it.each(["nomination", "slayer"] as const)(
    "keeps public export unchanged for a private %s correction",
    (kind) => {
      const f = fixture(kind, "private");
      const before = publicTranscript(f.workspace);
      const w = closeStandardPhase(correct(f), d1, true);
      expect(w.schemaVersion).toBe(5);
      expect(publicTranscript(w)).toEqual(before);
      expect(() =>
        correctStandardAction(
          { ...f.workspace, perspectiveSeat: 2 },
          f.source.id,
          correctedPayload(kind),
        ),
      ).toThrow("不可见");
    },
  );
  it("refuses to alter a nomination with an inaccessible private ballot", () => {
    const f = fixture("nomination", "public", true);
    expect(() =>
      correctStandardAction(
        { ...f.workspace, perspectiveSeat: 2 },
        f.source.id,
        correctedPayload("nomination"),
      ),
    ).toThrow("关联记录在当前视角下不可见");
  });
  it("preserves version 5 through subsequent death and vote corrections", () => {
    const f = fixture();
    let w = correct(f);
    const nomination = w.events.find((e) => e.correctsEventId === f.source.id)!;
    const vote = nominationVoteSources(w, nomination.id)[0];
    w = correctStandardVote(w, vote.id, [1, 2, 3]);
    const death = visibleStandardEvents(w, 1).find(
      (e) => e.payload.kind === "death",
    )!;
    w = correctStandardFact(w, death.id, { kind: "death", seat: 3 });
    expect(w.schemaVersion).toBe(5);
    expect(publicTranscript(w).schemaVersion).toBe(4);
    expect(validateStandardWorkspace(w)).toBe(w);
  });
  it.each([0, 8, 1.5, Number.NaN])(
    "rejects invalid seats in both action fields: %s",
    (seat) => {
      for (const kind of ["nomination", "slayer"] as const) {
        const f = fixture(kind);
        const payloads: CorrectableActionPayload[] =
          kind === "nomination"
            ? [
                { kind, nominator: seat, nominee: 4 },
                { kind, nominator: 2, nominee: seat },
              ]
            : [
                { kind, actor: seat, target: 7 },
                { kind, actor: 1, target: seat },
              ];
        for (const payload of payloads)
          expect(() =>
            correctStandardAction(f.workspace, f.source.id, payload),
          ).toThrow("座位无效");
      }
    },
  );
  it("rejects missing, retired and different-kind sources", () => {
    const f = fixture();
    expect(() =>
      correctStandardAction(
        f.workspace,
        "missing",
        correctedPayload("nomination"),
      ),
    ).toThrow("不可见");
    expect(() =>
      correctStandardAction(
        retractStandardEvent(f.workspace, f.source.id),
        f.source.id,
        correctedPayload("nomination"),
      ),
    ).toThrow("不可见");
    expect(() =>
      correctStandardAction(
        f.workspace,
        f.source.id,
        correctedPayload("slayer"),
      ),
    ).toThrow("保持原记录类型");
  });
  it.each([
    "old-format-2",
    "old-format-3",
    "old-format-4",
    "self",
    "phase",
    "visibility",
    "kind",
    "changed-voters",
    "unrelated-nomination",
    "live-ballot",
  ] as const)("rejects malformed action/ballot corrections: %s", (damage) => {
    const f = fixture();
    const w = structuredClone(correct(f));
    const action = w.events.find((e) => e.correctsEventId === f.source.id)!;
    const originalVote = nominationVoteSources(f.workspace, f.source.id)[0];
    const ballot = w.events.find((e) => e.correctsEventId === originalVote.id)!;
    if (damage.startsWith("old-format"))
      w.schemaVersion = Number(damage.at(-1)) as 2 | 3 | 4;
    if (damage === "self") action.correctsEventId = action.id;
    if (damage === "phase") action.occurredAt = { phase: "day", cycle: 2 };
    if (damage === "visibility")
      Object.assign(action, { visibility: "private", ownerSeat: 1 });
    if (damage === "kind")
      action.correctsEventId = f.workspace.events.find(
        (e) => e.payload.kind === "slayer",
      )!.id;
    if (ballot.payload.kind !== "vote") throw new Error("Expected vote");
    if (damage === "changed-voters") ballot.payload.voters = [1, 2, 3];
    if (damage === "unrelated-nomination") {
      ballot.payload.nominationId = w.events.find(
        (e) => e.payload.kind === "nomination" && e.payload.nominee === 6,
      )!.id;
      ballot.payload.nominee = 6;
    }
    if (damage === "live-ballot") {
      const retraction = w.events.find(
        (e) =>
          e.payload.kind === "retraction" &&
          e.payload.targetId === originalVote.id,
      )!;
      retraction.payload = {
        kind: "retraction",
        targetId: w.events.find(
          (e) =>
            e.payload.kind === "phase_closed" &&
            e.occurredAt?.phase === "night",
        )!.id,
        reason: "tampered",
      };
    }
    expect(() => validateStandardWorkspace(w)).toThrow(/纠正|事件载荷或引用/);
  });
});
