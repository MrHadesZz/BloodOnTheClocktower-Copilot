import { describe, expect, it } from "vitest";
import {
  addStandardHypothesis,
  commitStandardEntry,
  createStandardBranch,
  createStandardWorkspace,
  publicTranscript,
  retractStandardEvent,
  toggleStandardHypothesis,
  validateStandardWorkspace,
} from "./standardWorkspace";
import {
  amendStandardClaim,
  closeStandardPhase,
  currentStandardClaims,
  missingStandardPhases,
  recordStandardRoleClaim,
  standardHistory,
  standardPhaseStatus,
  visibleAtBranch,
} from "./standardHistory";
import { prepareClaimAnalysis } from "./claimAnalysis";
import type { ClaimPayload } from "./model";

const n1 = { phase: "night", cycle: 1 } as const;
const d1 = { phase: "day", cycle: 1 } as const;
const n2 = { phase: "night", cycle: 2 } as const;
function fixture() {
  const w = commitStandardEntry(createStandardWorkspace(7), "1 共情者 0 @N1");
  const report = w.events.find(
    (e) =>
      e.payload.kind === "claim" && e.payload.claimKind === "ability_report",
  )!;
  const payload: ClaimPayload = {
    kind: "claim",
    claimKind: "ability_report",
    speaker: 1,
    role: "Empath",
    value: 1,
  };
  return { w, report, payload };
}

describe("statement history and provenance", () => {
  it("appends a correction, preserves the original and removes only its adopted report premises on the edited branch", () => {
    let { w, report, payload } = fixture();
    w = addStandardHypothesis(w, {
      kind: "report_accurate",
      eventId: report.id,
    });
    const id = w.hypotheses.at(-1)!.id;
    w = toggleStandardHypothesis(w, id);
    w = addStandardHypothesis(w, { kind: "actual_role", seat: 7, role: "Imp" });
    const other = w.hypotheses.at(-1)!.id;
    w = toggleStandardHypothesis(w, other);
    const originalBranch = w.activeBranchId;
    w = createStandardBranch(w, "纠正分支");
    const snapshot = JSON.stringify(w);
    const next = amendStandardClaim(
      w,
      report.id,
      payload,
      n1,
      "correction",
      d1,
    );
    expect(JSON.stringify(w)).toBe(snapshot);
    expect(next.events.find((e) => e.id === report.id)).toEqual(report);
    expect(next.events.at(-1)?.payload).toMatchObject({
      change: { kind: "correction", previousId: report.id, announcedAt: d1 },
    });
    expect(
      next.branches.find((b) => b.id === next.activeBranchId)?.assumptionIds,
    ).toEqual([other]);
    expect(
      next.branches.find((b) => b.id === originalBranch)?.assumptionIds,
    ).toEqual([id, other]);
    expect(
      standardHistory(next).find((r) => r.event.id === report.id)?.status,
    ).toBe("corrected");
    const old = { ...next, activeBranchId: originalBranch };
    expect(visibleAtBranch(old).some((e) => e.id === report.id)).toBe(true);
    expect(validateStandardWorkspace(JSON.parse(JSON.stringify(next)))).toEqual(
      next,
    );
  });
  it("keeps a changed report and its manually adopted premises, but auto-analysis uses the new statement", () => {
    let { w, report, payload } = fixture();
    w = addStandardHypothesis(w, {
      kind: "report_accurate",
      eventId: report.id,
    });
    w = toggleStandardHypothesis(w, w.hypotheses.at(-1)!.id);
    const next = amendStandardClaim(
      w,
      report.id,
      payload,
      n1,
      "changed_claim",
      n2,
    );
    expect(next.branches[0].assumptionIds).toEqual(w.branches[0].assumptionIds);
    expect(visibleAtBranch(next).some((e) => e.id === report.id)).toBe(true);
    expect(
      standardHistory(next).find((r) => r.event.id === report.id)?.status,
    ).toBe("superseded");
    const prepared = prepareClaimAnalysis(next);
    expect(prepared.groups[0].sourceIds).not.toContain(report.id);
    expect(prepared.groups[0].sourceIds).toContain(next.events.at(-1)!.id);
    const reverted = retractStandardEvent(next, next.events.at(-1)!.id);
    expect(
      currentStandardClaims(visibleAtBranch(reverted), reverted.events).some(
        (e) => e.id === report.id,
      ),
    ).toBe(true);
  });
  it("does not revive an earlier report when an intermediate changed statement is withdrawn", () => {
    const { w, report, payload } = fixture();
    let next = amendStandardClaim(
      w,
      report.id,
      payload,
      n1,
      "changed_claim",
      d1,
    );
    const intermediate = next.events.at(-1)!.id;
    next = amendStandardClaim(
      next,
      intermediate,
      { ...payload, value: 2 },
      n1,
      "changed_claim",
      n2,
    );
    const newest = next.events.at(-1)!.id;
    next = retractStandardEvent(next, intermediate);
    const reports = currentStandardClaims(
      visibleAtBranch(next),
      next.events,
    ).filter(
      (e) =>
        e.payload.kind === "claim" && e.payload.claimKind === "ability_report",
    );
    expect(reports.map((e) => e.id)).toEqual([newest]);
    expect(
      standardHistory(next).find((r) => r.event.id === report.id)?.status,
    ).toBe("superseded");
    expect(validateStandardWorkspace(next)).toEqual(next);
  });
  it("keeps starting and stage-specific roles separate and does not retract them as a role change", () => {
    let w = recordStandardRoleClaim(
      createStandardWorkspace(8),
      4,
      "Scarlet Woman",
      d1,
      "initial",
    );
    w = recordStandardRoleClaim(w, 4, "Imp", n2, "current");
    const p = prepareClaimAnalysis(w);
    expect(p.groups[0].role).toBe("Scarlet Woman");
    expect(p.groups[0].conditions.map((c) => c.kind)).toEqual([
      "actual_role",
      "role_at_phase",
    ]);
    expect(p.groups[0].conditions[1].occurredAt).toEqual(n2);
    expect(visibleAtBranch(w)).toHaveLength(2);
    expect(validateStandardWorkspace(w)).toEqual(w);
  });
  it("allows correcting a wrong report night but keeps the original night for a changed statement", () => {
    const { w, report, payload } = fixture();
    expect(() =>
      amendStandardClaim(w, report.id, payload, n2, "changed_claim"),
    ).toThrow("同一阶段");
    const next = amendStandardClaim(w, report.id, payload, n2, "correction");
    expect(next.events.at(-1)?.occurredAt).toEqual(n2);
    expect(report.occurredAt).toEqual(n1);
  });
  it("rejects stale, other-player, invisible or superseded modification targets", () => {
    const { w, report, payload } = fixture();
    expect(() =>
      amendStandardClaim(
        w,
        report.id,
        { ...payload, speaker: 2 },
        n1,
        "correction",
      ),
    ).toThrow("同一玩家");
    expect(() =>
      amendStandardClaim(
        { ...w, perspectiveSeat: 2 },
        report.id,
        payload,
        n1,
        "correction",
      ),
    ).toThrow("不可见");
    const next = amendStandardClaim(w, report.id, payload, n1, "changed_claim");
    expect(() =>
      amendStandardClaim(next, report.id, payload, n1, "changed_claim"),
    ).toThrow("改口");
    const old = {
      ...next,
      branches: next.branches.map((b) => ({
        ...b,
        baseRevision: w.events.length,
      })),
    };
    expect(() => closeStandardPhase(old, n1, true)).toThrow("最新记录");
    expect(() =>
      recordStandardRoleClaim(old, 1, "Chef", d1, "initial"),
    ).toThrow("最新记录");
  });
  it("keeps private changes out of public export and validates public-linked changes", () => {
    const { w, report, payload } = fixture();
    const next = amendStandardClaim(
      w,
      report.id,
      payload,
      n1,
      "changed_claim",
      n2,
    );
    expect(publicTranscript(next).events).toEqual([]);
    let pub = commitStandardEntry(
      createStandardWorkspace(7),
      "1 共情者 0 @N1",
      "public",
    );
    const target = pub.events.at(-1)!;
    pub = amendStandardClaim(pub, target.id, payload, n1, "correction", d1);
    expect(publicTranscript(pub).events.at(-1)?.payload).toMatchObject({
      change: { previousId: target.id },
    });
    const invalid = structuredClone(pub);
    invalid.events.at(-1)!.visibility = "private";
    Object.assign(invalid.events.at(-1)!, { ownerSeat: 1 });
    expect(() => validateStandardWorkspace(invalid)).toThrow("引用");
  });
  it("rejects malformed, future or duplicate successor references and invalid role scopes on import", () => {
    const { w, report, payload } = fixture();
    const next = amendStandardClaim(
      w,
      report.id,
      payload,
      n1,
      "changed_claim",
      d1,
    );
    for (const change of [
      { kind: "changed_claim", previousId: "future", announcedAt: d1 },
      { kind: "wrong", previousId: report.id, announcedAt: d1 },
      {
        kind: "changed_claim",
        previousId: report.id,
        announcedAt: { phase: "night", cycle: 0 },
      },
    ]) {
      const invalid = structuredClone(next);
      Object.assign(invalid.events.at(-1)!.payload, { change });
      expect(() => validateStandardWorkspace(invalid)).toThrow("引用");
    }
    const doubled = structuredClone(next);
    const copy = {
      ...doubled.events.at(-1)!,
      id: crypto.randomUUID(),
      revision: doubled.events.length + 1,
    };
    doubled.events.push(copy);
    expect(() => validateStandardWorkspace(doubled)).toThrow("引用");
    const scope = structuredClone(w);
    Object.assign(scope.events[0].payload, { identityStage: "wrong" });
    expect(() => validateStandardWorkspace(scope)).toThrow("引用");
    const reportScope = structuredClone(w);
    Object.assign(reportScope.events.at(-1)!.payload, {
      identityStage: "current",
    });
    expect(() => validateStandardWorkspace(reportScope)).toThrow("引用");
  });
});

describe("phase completeness and replay boundary", () => {
  it("requires explicit confirmation and never fills a missing phase implicitly", () => {
    let w = createStandardWorkspace(7);
    expect(() => closeStandardPhase(w, n1, false)).toThrow("确认");
    w = closeStandardPhase(w, n2, true);
    expect(missingStandardPhases(w, n2)).toEqual([n1, d1]);
    w = closeStandardPhase(w, n1, true);
    w = closeStandardPhase(w, d1, true);
    expect(missingStandardPhases(w, n2)).toEqual([]);
    expect(closeStandardPhase(w, d1, true)).toBe(w);
    expect(validateStandardWorkspace(w)).toEqual(w);
  });
  it("adding an observation reopens only its phase, preserving other closures and branch snapshots", () => {
    let w = closeStandardPhase(createStandardWorkspace(7), n1, true);
    w = closeStandardPhase(w, d1, true);
    w = closeStandardPhase(w, n2, true);
    const original = w.activeBranchId;
    w = createStandardBranch(w, "补录");
    const next = commitStandardEntry(w, "1 nom 2 @D1", "private");
    expect(standardPhaseStatus(next, d1).complete).toBe(false);
    expect(standardPhaseStatus(next, n1).complete).toBe(true);
    expect(standardPhaseStatus(next, n2).complete).toBe(true);
    expect(
      standardPhaseStatus({ ...next, activeBranchId: original }, d1).complete,
    ).toBe(true);
    expect(validateStandardWorkspace(next)).toEqual(next);
  });
  it("withdrawn deaths also reopen the stage; new reports and victory facts preserve action/death closure", () => {
    let w = commitStandardEntry(
      createStandardWorkspace(7),
      "3 dead @N2",
      "public",
    );
    const death = w.events[0].id;
    w = closeStandardPhase(w, n2, true);
    const removed = retractStandardEvent(w, death);
    expect(standardPhaseStatus(removed, n2).complete).toBe(false);
    expect(validateStandardWorkspace(removed)).toEqual(removed);
    let next = commitStandardEntry(w, "1 共情者 0 @N2");
    expect(standardPhaseStatus(next, n2).complete).toBe(true);
    next = commitStandardEntry(next, "win evil @N2", "public");
    expect(standardPhaseStatus(next, n2).complete).toBe(true);
  });
  it("does not reopen old phases while changing claims and preserves the selected phase on roundtrip", () => {
    let { w, report, payload } = fixture();
    w = closeStandardPhase(w, n1, true);
    w = { ...w, recordingTime: n2 };
    const changed = amendStandardClaim(
      w,
      report.id,
      payload,
      n1,
      "correction",
      n2,
    );
    expect(standardPhaseStatus(changed, n1).complete).toBe(true);
    const roundtrip = validateStandardWorkspace(
      JSON.parse(JSON.stringify(changed)),
    );
    expect(roundtrip.recordingTime).toEqual(n2);
    const invalid = { ...roundtrip, recordingTime: { phase: "day", cycle: 0 } };
    expect(() => validateStandardWorkspace(invalid)).toThrow("字段");
  });
});
