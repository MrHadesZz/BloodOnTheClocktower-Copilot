import { describe, expect, it } from "vitest";
import { createFixture, validateImport } from "./workspace";

function exported() {
  const data = createFixture();
  data.setupDraft = {
    ...data.setupDraft!,
    count: 7,
    facts: [{ seat: 1, role: "Librarian" }],
    reports: [
      {
        kind: "librarian_zero",
        speaker: 1,
        acceptedMessage: true,
        abilityActive: true,
      },
    ],
    poisonEnabled: true,
    poisonerSeat: 6,
    poisonTarget: 2,
    querySeat: 7,
  };
  return structuredClone(data);
}

describe("local workspace export and restore", () => {
  it("restores the standard setup draft along with the H0 event log", () => {
    const before = exported();
    const after = validateImport(JSON.parse(JSON.stringify(before)));
    expect(after.setupDraft).toEqual(before.setupDraft);
    expect(after.events).toHaveLength(before.events.length);
  });
  it("migrates an older H0 export with no standard setup draft", () => {
    const old = exported();
    delete old.setupDraft;
    const restored = validateImport(old);
    expect(restored.setupDraft?.count).toBe(8);
    expect(restored.setupDraft?.facts).toEqual([]);
  });
  it("rejects missing assumptions and invalid branch revisions", () => {
    const missing = exported();
    delete (missing.branches[1] as Partial<(typeof missing.branches)[number]>)
      .assumptions;
    expect(() => validateImport(missing)).toThrow("分支");
    const revision = exported();
    revision.branches[1].baseRevision = revision.events.length + 1;
    expect(() => validateImport(revision)).toThrow("分支");
  });
  it("rejects corrupt event payloads and broken event references", () => {
    const badSeat = exported();
    badSeat.events[0].payload = { kind: "death", seat: 99 };
    expect(() => validateImport(badSeat)).toThrow("事件载荷");
    const duplicateId = exported();
    duplicateId.events[1].id = duplicateId.events[0].id;
    expect(() => validateImport(duplicateId)).toThrow("事件");
    const missingNomination = exported();
    const vote = missingNomination.events.find(
      (event) => event.payload.kind === "vote",
    );
    if (vote?.payload.kind !== "vote") throw new Error("Fixture vote missing");
    vote.payload.nominationId = "missing";
    expect(() => validateImport(missingNomination)).toThrow("引用关系");
  });
  it("migrates an older setup draft without shown-token premises", () => {
    const old = exported();
    delete (old.setupDraft as Partial<NonNullable<typeof old.setupDraft>>)
      .tokenFacts;
    const restored = validateImport(old);
    expect(restored.setupDraft?.tokenFacts).toEqual([]);
  });
  it("rejects malformed imported seats and report payloads", () => {
    const badSeat = exported();
    badSeat.setupDraft!.querySeat = 99;
    expect(() => validateImport(badSeat)).toThrow("标准设置草稿");
    const badReport = exported();
    (badReport.setupDraft!.reports[0] as { speaker: number }).speaker = -1;
    expect(() => validateImport(badReport)).toThrow("首夜报告");
  });
});
