import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  createStandardWorkspace,
  createStandardBranch,
  commitStandardEntry,
  commitStandardDrafts,
  retractStandardEvent,
  visibleStandardEvents,
  addStandardHypothesis,
  toggleStandardHypothesis,
  prepareStandardObservedQuery,
  publicTranscript,
  validateStandardWorkspace,
  type StandardWorkspace,
} from "./standardWorkspace";
import {
  closeStandardPhase,
  correctStandardVote,
  standardHistory,
  standardPhaseStatus,
} from "./standardHistory";
import { queryObservedTimeline, type SetupWitness } from "./symbolicSetup";
import { replayObservedWitness } from "./observedTimeline";
import type { Role, EventPayload } from "./model";
import { replayTimeline } from "./timeline";

const d1 = { phase: "day", cycle: 1 } as const;
const n1 = { phase: "night", cycle: 1 } as const;
const roles: Role[] = [
  "Slayer",
  "Chef",
  "Monk",
  "Undertaker",
  "Virgin",
  "Recluse",
  "Saint",
  "Spy",
  "Imp",
];
function voteFixture(
  visibility: "public" | "private" = "public",
  interleaved = false,
) {
  let workspace = createStandardWorkspace(9);
  for (const [index, role] of roles.entries()) {
    workspace = addStandardHypothesis(workspace, {
      kind: "actual_role",
      seat: index + 1,
      role,
    });
    workspace = toggleStandardHypothesis(
      workspace,
      workspace.hypotheses.at(-1)!.id,
    );
  }
  workspace = closeStandardPhase(workspace, n1, true);
  const commit = (
    payload: EventPayload,
    scope: "public" | "private" = "public",
  ) => {
    const label = scope === "private" ? "私密投票原文仅本地可见" : "公开记录";
    workspace = commitStandardDrafts(
      workspace,
      label,
      [{ payload, occurredAt: d1, label, sourceSpan: [0, label.length] }],
      scope,
    );
  };
  commit({ kind: "nomination", nominator: 2, nominee: 3 });
  if (interleaved) commit({ kind: "slayer", actor: 1, target: 6 });
  commit({ kind: "vote", nominee: 3, voters: [1, 2, 3, 4, 5] }, visibility);
  const voteId = workspace.events.at(-1)!.id;
  if (!interleaved) commit({ kind: "slayer", actor: 1, target: 6 });
  commit({ kind: "death", seat: 6 });
  workspace = closeStandardPhase(workspace, d1, true);
  workspace = {
    ...workspace,
    query: { seat: 9, role: "Imp", stage: "initial" },
    recordingTime: d1,
  };
  return { workspace, voteId };
}
function prepared(workspace: StandardWorkspace) {
  const result = prepareStandardObservedQuery(workspace);
  if (result.status !== "ready") throw new Error(result.reason);
  return {
    ...result.input,
    timeoutMs: 10000,
    maxWorlds: 20,
    maxHistories: 1000,
  };
}
function checkIndependent(workspace: StandardWorkspace, witness: SetupWitness) {
  const request = prepared(workspace);
  expect(replayObservedWitness(witness, request, request).valid).toBe(true);
  const python =
    process.env.PYTHON ?? (process.platform === "win32" ? "python" : "python3");
  const checked = spawnSync(
    python,
    [
      fileURLToPath(new URL("../../reference/v1_oracle.py", import.meta.url)),
      "--check-witnesses",
    ],
    {
      input: JSON.stringify([
        { id: "corrected-vote-in-original-position", request, witness },
      ]),
      encoding: "utf8",
    },
  );
  expect(checked.status, checked.stderr).toBe(0);
  expect(JSON.parse(checked.stdout)[0].errors).toEqual([]);
}

function staleFixture() {
  let workspace = commitStandardEntry(
    createStandardWorkspace(9),
    "2 chef 0 @N1",
  );
  const originalId = workspace.activeBranchId;
  const reportId = workspace.events.find(
    (e) =>
      e.payload.kind === "claim" && e.payload.claimKind === "ability_report",
  )!.id;
  workspace = createStandardBranch(workspace, "后续记录");
  workspace = commitStandardEntry(workspace, "3 monk @D1");
  return { workspace: { ...workspace, activeBranchId: originalId }, reportId };
}

describe("revision-aware history editing", () => {
  it("does not silently advance an old branch while appending records", () => {
    const { workspace } = staleFixture();
    const unchanged = JSON.stringify(workspace);
    expect(() => commitStandardEntry(workspace, "4 soldier @D1")).toThrow(
      "更新到最新记录",
    );
    expect(JSON.stringify(workspace)).toBe(unchanged);
  });
  it("does not silently include unseen records while withdrawing an old branch's report", () => {
    const { workspace, reportId } = staleFixture();
    expect(
      visibleStandardEvents(
        workspace,
        1,
        workspace.branches[0].baseRevision,
      ).some((e) => e.payload.kind === "claim" && e.payload.role === "Monk"),
    ).toBe(false);
    expect(() => retractStandardEvent(workspace, reportId)).toThrow(
      "更新到最新记录",
    );
  });
});

describe("vote corrections preserve actual order and history", () => {
  it("preserves the original, reopens only the edited day and uses the ballot's original position", () => {
    const { workspace, voteId } = voteFixture();
    const unchanged = JSON.stringify(workspace);
    let corrected = correctStandardVote(workspace, voteId, [1, 2, 3, 4]);
    expect(JSON.stringify(workspace)).toBe(unchanged);
    expect(corrected.events.slice(0, workspace.events.length)).toEqual(
      workspace.events,
    );
    expect(corrected.schemaVersion).toBe(3);
    expect(corrected.events.at(-1)).toMatchObject({
      correctsEventId: voteId,
      payload: { kind: "vote", nominee: 3, voters: [1, 2, 3, 4] },
    });
    expect(standardPhaseStatus(corrected, n1).complete).toBe(true);
    expect(standardPhaseStatus(corrected, d1).complete).toBe(false);
    expect(prepareStandardObservedQuery(corrected)).toMatchObject({
      status: "unsupported",
    });
    const replacementId = corrected.events.at(-1)!.id;
    expect(
      standardHistory(corrected).find((row) => row.event.id === voteId),
    ).toMatchObject({ status: "corrected", successor: { id: replacementId } });
    corrected = closeStandardPhase(corrected, d1, true);
    expect(prepared(corrected).phases[1]).toMatchObject({
      events: [
        { kind: "nomination", votes: [1, 2, 3, 4] },
        { kind: "slayer", actor: 1, target: 6 },
      ],
    });
    expect(
      validateStandardWorkspace(JSON.parse(JSON.stringify(corrected))),
    ).toEqual(corrected);
  });
  it("changes the contradictory five-vote history into a compatible four-vote history, with independent evidence", async () => {
    const { workspace, voteId } = voteFixture();
    expect(
      (await queryObservedTimeline(prepared(workspace))).classification,
    ).toBe("inconsistent");
    const corrected = closeStandardPhase(
      correctStandardVote(workspace, voteId, [1, 2, 3, 4]),
      d1,
      true,
    );
    const answer = await queryObservedTimeline(prepared(corrected));
    expect(answer.classification).toBe("necessary");
    checkIndependent(corrected, answer.yes!);
  }, 20000);
  it("keeps an older branch on its original five votes while the correction branch uses four", async () => {
    const { workspace, voteId } = voteFixture();
    const originalId = workspace.activeBranchId;
    let corrected = createStandardBranch(workspace, "投票纠正分支");
    corrected = closeStandardPhase(
      correctStandardVote(corrected, voteId, [1, 2, 3, 4]),
      d1,
      true,
    );
    const older = { ...corrected, activeBranchId: originalId };
    expect(prepared(older).phases[1]).toMatchObject({
      events: [{ votes: [1, 2, 3, 4, 5] }, { kind: "slayer" }],
    });
    expect(prepared(corrected).phases[1]).toMatchObject({
      events: [{ votes: [1, 2, 3, 4] }, { kind: "slayer" }],
    });
    expect((await queryObservedTimeline(prepared(older))).classification).toBe(
      "inconsistent",
    );
    expect(
      (await queryObservedTimeline(prepared(corrected))).classification,
    ).toBe("necessary");
    expect(() => correctStandardVote(older, voteId, [])).toThrow(
      "更新到最新记录",
    );
  }, 20000);
  it("retains the first position through multiple corrections and permits an explicit zero-vote correction", () => {
    const { workspace, voteId } = voteFixture();
    let corrected = correctStandardVote(workspace, voteId, [1, 2, 3, 4]);
    const middleId = corrected.events.at(-1)!.id;
    corrected = correctStandardVote(corrected, middleId, [1, 2, 3]);
    const secondId = corrected.events.at(-1)!.id;
    corrected = correctStandardVote(corrected, secondId, []);
    corrected = closeStandardPhase(corrected, d1, true);
    expect(prepared(corrected).phases[1]).toMatchObject({
      events: [{ votes: [] }, { kind: "slayer" }],
    });
    expect(
      standardHistory(corrected)
        .filter((row) => [voteId, middleId, secondId].includes(row.event.id))
        .every((row) => row.status === "corrected"),
    ).toBe(true);
    expect(validateStandardWorkspace(corrected)).toEqual(corrected);
  });
  it("does not revive the original if the replacement is later withdrawn", () => {
    const { workspace, voteId } = voteFixture();
    let corrected = correctStandardVote(workspace, voteId, [1, 2, 3, 4]);
    corrected = retractStandardEvent(corrected, corrected.events.at(-1)!.id);
    const visible = visibleStandardEvents(corrected, 1);
    expect(visible.some((event) => event.payload.kind === "vote")).toBe(false);
    expect(validateStandardWorkspace(corrected)).toEqual(corrected);
  });
  it("keeps legacy data unchanged when the selected voters do not change", () => {
    const { workspace, voteId } = voteFixture();
    expect(correctStandardVote(workspace, voteId, [5, 4, 3, 2, 1])).toBe(
      workspace,
    );
    expect(
      validateStandardWorkspace(JSON.parse(JSON.stringify(workspace)))
        .schemaVersion,
    ).toBe(2);
  });
  it("does not use correction to move an originally interleaved vote before the Slayer", () => {
    const { workspace, voteId } = voteFixture("public", true);
    const corrected = closeStandardPhase(
      correctStandardVote(workspace, voteId, [1, 2, 3, 4]),
      d1,
      true,
    );
    const result = prepareStandardObservedQuery(corrected);
    expect(result.status).toBe("unsupported");
    if (result.status === "unsupported")
      expect(result.reason).toContain("交错顺序");
  });
  it("keeps a living vote before death separate from that player's later single dead vote", async () => {
    let { workspace, voteId } = voteFixture();
    workspace = commitStandardEntry(workspace, "3 nom 7 @D1", "public");
    workspace = commitStandardEntry(workspace, "vote 7 = 1,2,6 @D1", "public");
    workspace = correctStandardVote(workspace, voteId, [1, 2, 3, 6]);
    workspace = closeStandardPhase(workspace, d1, true);
    const answer = await queryObservedTimeline(prepared(workspace));
    expect(answer.classification).toBe("necessary");
    const witness = answer.yes!;
    checkIndependent(workspace, witness);
    const replay = replayTimeline({
      initialPlayers: witness.roles.map((actualRole, index) => ({
        seat: index + 1,
        actualRole,
        shownToken: witness.shownTokens[index],
      })),
      phases: witness.timeline!,
    });
    expect(replay.status).toBe("ok");
    if (replay.status === "ok")
      expect(replay.state.spentDeadVotes).toEqual([6]);
  }, 20000);
  it("rejects duplicate voters, unseen votes and withdrawn nominations without changing the input", () => {
    const { workspace, voteId } = voteFixture();
    const unchanged = JSON.stringify(workspace);
    expect(() => correctStandardVote(workspace, voteId, [1, 1])).toThrow(
      "重复",
    );
    expect(() => correctStandardVote(workspace, voteId, [10])).toThrow("无效");
    expect(() => correctStandardVote(workspace, "missing-vote", [])).toThrow(
      "不可见",
    );
    const vote = workspace.events.find((event) => event.id === voteId)!;
    if (vote.payload.kind !== "vote") throw new Error("Missing vote");
    const removed = retractStandardEvent(workspace, vote.payload.nominationId!);
    expect(() => correctStandardVote(removed, voteId, [])).toThrow(
      "提名已撤回",
    );
    expect(JSON.stringify(workspace)).toBe(unchanged);
  });
  it("does not leak a private correction or change the public transcript's format", () => {
    const { workspace, voteId } = voteFixture("private");
    const before = publicTranscript(workspace);
    const corrected = correctStandardVote(workspace, voteId, [1, 2, 3, 4]);
    expect(corrected.schemaVersion).toBe(3);
    expect(publicTranscript(corrected)).toEqual(before);
    expect(JSON.stringify(publicTranscript(corrected))).not.toContain(
      "私密投票原文",
    );
    expect(JSON.stringify(publicTranscript(corrected))).not.toContain(voteId);
  });
  it("exports the public correction with its public original and retraction", () => {
    const { workspace, voteId } = voteFixture();
    const corrected = correctStandardVote(workspace, voteId, [1, 2, 3, 4]);
    const transcript = publicTranscript(corrected);
    expect(transcript.schemaVersion).toBe(2);
    expect(transcript.events.some((event) => event.id === voteId)).toBe(true);
    expect(transcript.events.at(-1)).toMatchObject({ correctsEventId: voteId });
    expect(
      transcript.events.some(
        (event) =>
          event.payload.kind === "retraction" &&
          event.payload.targetId === voteId,
      ),
    ).toBe(true);
  });
  it.each([
    "missing",
    "self",
    "other-kind",
    "phase",
    "visibility",
    "legacy-format",
  ] as const)("rejects a damaged correction reference: %s", (damage) => {
    const { workspace, voteId } = voteFixture();
    const corrected = structuredClone(
      correctStandardVote(workspace, voteId, [1, 2, 3, 4]),
    );
    const replacement = corrected.events.at(-1)!;
    if (damage === "missing") replacement.correctsEventId = "missing-id";
    if (damage === "self") replacement.correctsEventId = replacement.id;
    if (damage === "other-kind")
      replacement.correctsEventId = corrected.events.find(
        (event) => event.payload.kind === "slayer",
      )!.id;
    if (damage === "phase") replacement.occurredAt = { phase: "day", cycle: 2 };
    if (damage === "visibility")
      Object.assign(replacement, { visibility: "private", ownerSeat: 1 });
    if (damage === "legacy-format") corrected.schemaVersion = 2;
    expect(() => validateStandardWorkspace(corrected)).toThrow(
      /投票纠正|事件载荷或引用/,
    );
  });
});
