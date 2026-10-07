import { describe, expect, it } from "vitest";
import { queryTimelineWorlds, type TimelineQueryInput } from "./symbolicSetup";

const scenario = (
  poisonerTarget: number,
  deaths: number[],
): TimelineQueryInput => ({
  playerCount: 7,
  facts: [
    { seat: 1, role: "Imp" },
    { seat: 2, role: "Poisoner" },
    { seat: 3, role: "Investigator" },
    { seat: 4, role: "Chef" },
    { seat: 5, role: "Empath" },
    { seat: 6, role: "Slayer" },
  ],
  query: { seat: 7, role: "Soldier" },
  nightOnePoisoner: { seat: 2, target: 6 },
  timeline: [
    { kind: "night", actions: { cycle: 1, poisonerTarget: 6 } },
    { kind: "day", events: [] },
    {
      kind: "night",
      actions: { cycle: 2, poisonerTarget, impTarget: 7 },
    },
  ],
  observations: [{ deaths: [] }, { deaths: [] }, { deaths }],
  timeoutMs: 10000,
});

describe("bounded symbolic timeline with concrete replay", () => {
  it("excludes a healthy Soldier from a closed night death", async () => {
    const result = await queryTimelineWorlds(scenario(6, [7]));
    expect(result.scope).toBe("bounded_timeline");
    expect(result.classification).toBe("impossible");
    expect(result.no?.roles[6]).not.toBe("Soldier");
  });

  it("retains a Soldier death when the Soldier is poisoned", async () => {
    const result = await queryTimelineWorlds(scenario(7, [7]));
    expect(result.classification).toBe("contingent");
    expect(result.yes?.roles[6]).toBe("Soldier");
  });

  it("requires a Soldier when an active Imp attack causes no death", async () => {
    const result = await queryTimelineWorlds(scenario(6, []));
    expect(result.classification).toBe("necessary");
    expect(result.yes?.roles[6]).toBe("Soldier");
  });

  it("returns unknown rather than excluding worlds after the search cap", async () => {
    const result = await queryTimelineWorlds({
      ...scenario(6, [7]),
      maxWorlds: 1,
    });
    expect(result.classification).toBe("unknown");
    expect(result.unknownReason).toBe("candidate_limit");
    expect(result.inspectedCandidates).toBe(1);
  });

  it("rejects mismatched first-night poisoning premises", async () => {
    await expect(
      queryTimelineWorlds({
        ...scenario(6, [7]),
        timeline: [{ kind: "night", actions: { cycle: 1, poisonerTarget: 7 } }],
        observations: [{ deaths: [] }],
      }),
    ).rejects.toThrow("首夜行动与投毒前提");
  });
});
