import { describe, expect, it } from "vitest";
import { hypothesisLabel } from "./hypothesisLabel";
import {
  commitStandardEntry,
  createStandardBranch,
  createStandardWorkspace,
  type StandardHypothesis,
} from "../core/standardWorkspace";

describe("report premise labels respect the source snapshot", () => {
  it("hides a later report from an old branch and reveals it only after explicit revision update", () => {
    let w = createStandardBranch(createStandardWorkspace(7), "旧分支");
    const old = w.activeBranchId;
    w = { ...w, activeBranchId: w.branches[0].id };
    w = commitStandardEntry(w, "1 empath 2 @N2", "public");
    const premise: StandardHypothesis = {
      id: "accuracy",
      kind: "report_accurate",
      eventId: w.events.at(-1)!.id,
      createdAt: w.events.at(-1)!.recordedAt,
    };
    w = { ...w, activeBranchId: old };
    expect(hypothesisLabel(premise, w)).toContain("来源不可见");
    expect(hypothesisLabel(premise, w)).not.toContain("2名邪恶");
    w = {
      ...w,
      branches: w.branches.map((b) =>
        b.id === old ? { ...b, baseRevision: w.events.length } : b,
      ),
    };
    expect(hypothesisLabel(premise, w)).toContain("2名邪恶");
  });
  it("never reveals another seat's private report label even at the latest revision", () => {
    const w = commitStandardEntry(
      createStandardWorkspace(7, 2),
      "2 empath 2 @N2",
    );
    const premise: StandardHypothesis = {
      id: "active",
      kind: "ability_active",
      eventId: w.events.at(-1)!.id,
      createdAt: w.events.at(-1)!.recordedAt,
    };
    expect(hypothesisLabel(premise, { ...w, perspectiveSeat: 1 })).toContain(
      "来源不可见",
    );
    expect(hypothesisLabel(premise, w)).toContain("2名邪恶");
  });
});
