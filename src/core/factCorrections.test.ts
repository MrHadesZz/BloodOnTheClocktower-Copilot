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
} from "./standardWorkspace";
import {
  closeStandardPhase,
  correctStandardFact,
  correctStandardVote,
  standardHistory,
  standardPhaseStatus,
} from "./standardHistory";
import { queryObservedTimeline } from "./symbolicSetup";
import { replayObservedWitness } from "./observedTimeline";
import type { Role } from "./model";

const n1 = { phase: "night", cycle: 1 } as const;
const d1 = { phase: "day", cycle: 1 } as const;
const n2 = { phase: "night", cycle: 2 } as const;
function fixture(
  kind: "death" | "execution" = "death",
  visibility: "private" | "public" = "public",
) {
  let workspace = createStandardWorkspace(7);
  const roles: Role[] = [
    "Chef",
    "Empath",
    "Monk",
    "Fortune Teller",
    "Soldier",
    "Poisoner",
    "Imp",
  ];
  for (const [i, role] of roles.entries()) {
    workspace = addStandardHypothesis(workspace, {
      kind: "actual_role",
      seat: i + 1,
      role,
    });
    workspace = toggleStandardHypothesis(
      workspace,
      workspace.hypotheses.at(-1)!.id,
    );
  }
  workspace = closeStandardPhase(workspace, n1, true);
  for (const text of [
    "1 nom 3 @D1",
    "vote 3 = 1,2,3,4 @D1",
    kind === "execution" ? "exec 4 @D1" : "exec 3 @D1",
    "3 dead @D1",
  ])
    workspace = commitStandardEntry(
      workspace,
      text,
      text.startsWith("exec") ? visibility : "public",
    );
  workspace = closeStandardPhase(workspace, d1, true);
  workspace = commitStandardEntry(
    workspace,
    kind === "death" ? "3 dead @N2" : "4 dead @N2",
    visibility,
  );
  const eventId =
    kind === "death"
      ? workspace.events.at(-1)!.id
      : workspace.events.find((e) => e.payload.kind === "execution")!.id;
  workspace = closeStandardPhase(workspace, n2, true);
  const parentId = workspace.activeBranchId;
  workspace = createStandardBranch(workspace, "纠正分支");
  return {
    workspace,
    eventId,
    parentId,
    kind,
    time: kind === "death" ? n2 : d1,
    seat: kind === "death" ? 4 : 3,
  };
}
function prepared(workspace: ReturnType<typeof createStandardWorkspace>) {
  const result = prepareStandardObservedQuery(workspace);
  if (result.status !== "ready") throw new Error(result.reason);
  return {
    ...result.input,
    timeoutMs: 10000,
    maxWorlds: 20,
    maxHistories: 1000,
  };
}

describe("audited corrections of deaths and executions", () => {
  it.each(["death", "execution"] as const)(
    "corrects a real %s conflict and independently replays the repaired witness",
    async (kind) => {
      const f = fixture(kind);
      const before = JSON.stringify(f.workspace);
      const original = await queryObservedTimeline(prepared(f.workspace));
      expect(original.classification).toBe("inconsistent");
      let corrected = correctStandardFact(f.workspace, f.eventId, {
        kind,
        seat: f.seat,
      });
      expect(JSON.stringify(f.workspace)).toBe(before);
      expect(corrected.schemaVersion).toBe(4);
      expect(prepareStandardObservedQuery(corrected).status).toBe(
        "unsupported",
      );
      expect(standardPhaseStatus(corrected, f.time).complete).toBe(false);
      expect(standardPhaseStatus(corrected, n1).complete).toBe(true);
      expect(
        standardPhaseStatus(corrected, kind === "death" ? d1 : n2).complete,
      ).toBe(true);
      corrected = closeStandardPhase(corrected, f.time, true);
      const request = prepared(corrected);
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
            { id: `corrected-${kind}`, request, witness },
          ]),
          encoding: "utf8",
        },
      );
      expect(oracle.status, oracle.stderr).toBe(0);
      expect(JSON.parse(oracle.stdout)[0].errors).toEqual([]);
      const old = { ...corrected, activeBranchId: f.parentId };
      expect(old.branches.find((b) => b.id === f.parentId)!.baseRevision).toBe(
        f.workspace.events.length,
      );
      expect((await queryObservedTimeline(prepared(old))).classification).toBe(
        "inconsistent",
      );
      expect(
        old.branches.find((b) => b.id === f.parentId)!.assumptionIds,
      ).toEqual(f.workspace.branches[0].assumptionIds);
    },
    20000,
  );
  it("keeps the original source, supports repeated corrections and preserves the original slot", () => {
    const f = fixture();
    const source = f.workspace.events.find((e) => e.id === f.eventId)!;
    let corrected = correctStandardFact(f.workspace, f.eventId, {
      kind: "death",
      seat: 4,
    });
    const first = corrected.events.at(-1)!;
    expect(first.correctsEventId).toBe(source.id);
    expect(first.visibility).toBe(source.visibility);
    expect(first.occurredAt).toEqual(source.occurredAt);
    corrected = correctStandardFact(corrected, first.id, {
      kind: "death",
      seat: 5,
    });
    expect(corrected.events.at(-1)!.correctsEventId).toBe(first.id);
    expect(corrected.events.find((e) => e.id === source.id)).toEqual(source);
    expect(
      standardHistory(corrected).find((row) => row.event.id === source.id)
        ?.status,
    ).toBe("corrected");
    expect(
      standardHistory(corrected).find((row) => row.event.id === first.id)
        ?.status,
    ).toBe("corrected");
    const restored = validateStandardWorkspace(
      JSON.parse(JSON.stringify(corrected)),
    );
    expect(restored).toEqual(corrected);
    const active = visibleStandardEvents(restored, 1);
    expect(active.some((e) => e.id === source.id || e.id === first.id)).toBe(
      false,
    );
    const closed = closeStandardPhase(restored, n2, true);
    expect(prepared(closed).phases[2].deaths).toEqual([5]);
  });
  it("preserves empty edits and does not append history or reopen a phase", () => {
    const f = fixture();
    expect(
      correctStandardFact(f.workspace, f.eventId, { kind: "death", seat: 3 }),
    ).toBe(f.workspace);
    expect(standardPhaseStatus(f.workspace, n2).complete).toBe(true);
  });
  it("does not alter a separate execution when correcting a daytime death", () => {
    const f = fixture("execution");
    const source = f.workspace.events.find(
      (e) => e.payload.kind === "death" && e.occurredAt?.phase === "day",
    )!;
    const corrected = closeStandardPhase(
      correctStandardFact(f.workspace, source.id, { kind: "death", seat: 2 }),
      d1,
      true,
    );
    const phase = prepared(corrected).phases[1];
    if (phase.kind !== "day") throw new Error("Expected D1");
    expect(phase.executedSeat).toBe(4);
    expect(phase.deaths).toEqual([2]);
  });
  it("leaves the public transcript byte-for-byte unchanged after a private correction and reclose", () => {
    const f = fixture("death", "private");
    const before = publicTranscript(f.workspace);
    const corrected = closeStandardPhase(
      correctStandardFact(f.workspace, f.eventId, { kind: "death", seat: 4 }),
      n2,
      true,
    );
    expect(corrected.schemaVersion).toBe(4);
    expect(publicTranscript(corrected)).toEqual(before);
    expect(publicTranscript(corrected).schemaVersion).toBe(1);
  });
  it("exports public fact corrections with the new transcript format and retains originals", () => {
    const f = fixture();
    const corrected = correctStandardFact(f.workspace, f.eventId, {
      kind: "death",
      seat: 4,
    });
    const transcript = publicTranscript(corrected);
    expect(transcript.schemaVersion).toBe(3);
    expect(transcript.events.some((e) => e.id === f.eventId)).toBe(true);
    expect(transcript.events.some((e) => e.correctsEventId === f.eventId)).toBe(
      true,
    );
    expect(JSON.stringify(transcript)).not.toContain('"actual_role"');
  });
  it("never downgrades format 4 when subsequently correcting a vote", () => {
    const f = fixture();
    const corrected = correctStandardFact(f.workspace, f.eventId, {
      kind: "death",
      seat: 4,
    });
    const ballot = visibleStandardEvents(corrected, 1).find(
      (e) => e.payload.kind === "vote",
    )!;
    const mixed = correctStandardVote(corrected, ballot.id, [1, 2, 3, 4, 5]);
    expect(mixed.schemaVersion).toBe(4);
    expect(validateStandardWorkspace(mixed)).toBe(mixed);
    expect(publicTranscript(mixed).schemaVersion).toBe(3);
  });
  it.each([0, 8, 1.5, Number.NaN])(
    "rejects an invalid corrected seat: %s",
    (seat) => {
      const f = fixture();
      const before = JSON.stringify(f.workspace);
      expect(() =>
        correctStandardFact(f.workspace, f.eventId, { kind: "death", seat }),
      ).toThrow("座位无效");
      expect(JSON.stringify(f.workspace)).toBe(before);
    },
  );
  it("rejects changed event types, missing sources, retired sources and old-branch writes", () => {
    const f = fixture();
    expect(() =>
      correctStandardFact(f.workspace, f.eventId, {
        kind: "execution",
        seat: 4,
      }),
    ).toThrow("保持原记录类型");
    expect(() =>
      correctStandardFact(f.workspace, "missing", { kind: "death", seat: 4 }),
    ).toThrow("不可见");
    const retired = retractStandardEvent(f.workspace, f.eventId);
    expect(() =>
      correctStandardFact(retired, f.eventId, { kind: "death", seat: 4 }),
    ).toThrow("不可见");
    const corrected = correctStandardFact(f.workspace, f.eventId, {
      kind: "death",
      seat: 4,
    });
    expect(() =>
      correctStandardFact(
        { ...corrected, activeBranchId: f.parentId },
        f.eventId,
        { kind: "death", seat: 5 },
      ),
    ).toThrow("更新到最新记录");
  });
  it("does not make another seat's private source editable", () => {
    const f = fixture("death", "private");
    expect(() =>
      correctStandardFact({ ...f.workspace, perspectiveSeat: 2 }, f.eventId, {
        kind: "death",
        seat: 4,
      }),
    ).toThrow("不可见");
  });
  it.each([
    "missing",
    "self",
    "different-kind",
    "phase",
    "visibility",
    "version-2",
    "version-3",
    "not-retired",
  ] as const)("rejects a damaged fact correction: %s", (damage) => {
    const f = fixture();
    const corrected = structuredClone(
      correctStandardFact(f.workspace, f.eventId, { kind: "death", seat: 4 }),
    );
    const replacement = corrected.events.at(-1)!;
    if (damage === "missing") replacement.correctsEventId = "unknown";
    if (damage === "self") replacement.correctsEventId = replacement.id;
    if (damage === "different-kind")
      replacement.correctsEventId = corrected.events.find(
        (e) => e.payload.kind === "execution",
      )!.id;
    if (damage === "phase")
      replacement.occurredAt = { phase: "night", cycle: 3 };
    if (damage === "visibility")
      Object.assign(replacement, { visibility: "private", ownerSeat: 1 });
    if (damage === "version-2") corrected.schemaVersion = 2;
    if (damage === "version-3") corrected.schemaVersion = 3;
    if (damage === "not-retired")
      corrected.events.find(
        (e) =>
          e.payload.kind === "retraction" && e.payload.targetId === f.eventId,
      )!.payload = {
        kind: "retraction",
        targetId: corrected.events.find(
          (e) => e.payload.kind === "phase_closed" && e.occurredAt?.cycle === 1,
        )!.id,
        reason: "tampered",
      };
    expect(() => validateStandardWorkspace(corrected)).toThrow(
      /事实纠正|事件载荷或引用/,
    );
  });
});
