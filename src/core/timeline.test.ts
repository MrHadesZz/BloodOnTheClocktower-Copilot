import { describe, expect, it } from "vitest";
import { replayTimeline, type TimelineInput } from "./timeline";
import type { Role } from "./model";
import type { NightTrace } from "./night";

const roles: Role[] = [
  "Investigator",
  "Chef",
  "Fortune Teller",
  "Poisoner",
  "Monk",
  "Undertaker",
  "Imp",
  "Butler",
];
const initialPlayers = (assignment: Role[] = roles) =>
  assignment.map((actualRole, index) => ({ seat: index + 1, actualRole }));

describe("complete explicit history replay", () => {
  it("carries Poisoner death, Butler master, execution and Undertaker information across phases", () => {
    const input: TimelineInput = {
      initialPlayers: initialPlayers(),
      phases: [
        {
          kind: "night",
          actions: { cycle: 1, poisonerTarget: 3, butlerMasterSeat: 2 },
        },
        {
          kind: "day",
          events: [
            {
              kind: "nomination",
              nominator: 1,
              nominee: 4,
              votes: [1, 2, 3, 5],
            },
          ],
        },
        {
          kind: "night",
          actions: {
            cycle: 2,
            monkTarget: 1,
            impTarget: 2,
            butlerMasterSeat: 1,
          },
        },
      ],
    };
    const result = replayTimeline(input);
    expect(result.status).toBe("ok");
    if (result.status !== "ok") throw new Error(result.reason);
    expect(result.state.alive[3]).toBe(false);
    expect(result.state.alive[1]).toBe(false);
    expect((result.traces[2] as NightTrace).undertakerInfo).toEqual({
      speaker: 6,
      executedSeat: 4,
      seenRole: "Poisoner",
    });
    expect(
      (result.traces[2] as NightTrace).poisonedAtInformationStep,
    ).toBeNull();
  });
  it("preserves a poisoned Slayer's spent ability into the next day", () => {
    const withSlayer: Role[] = [...roles];
    withSlayer[1] = "Slayer";
    const result = replayTimeline({
      initialPlayers: initialPlayers(withSlayer),
      phases: [
        {
          kind: "night",
          actions: { cycle: 1, poisonerTarget: 2, butlerMasterSeat: 1 },
        },
        { kind: "day", events: [{ kind: "slayer", actor: 2, target: 7 }] },
        {
          kind: "night",
          actions: {
            cycle: 2,
            poisonerTarget: 1,
            monkTarget: 7,
            impTarget: 3,
            butlerMasterSeat: 1,
          },
        },
        { kind: "day", events: [] },
      ],
    });
    expect(result.status).toBe("ok");
    if (result.status !== "ok") throw new Error(result.reason);
    expect(result.state.spentSlayerSeats).toEqual([2]);
    expect(result.state.alive[6]).toBe(true);
  });
  it("rejects skipped phases and night actions missing for a complete trace", () => {
    const base: TimelineInput = {
      initialPlayers: initialPlayers(),
      phases: [
        {
          kind: "night",
          actions: { cycle: 1, poisonerTarget: 3, butlerMasterSeat: 2 },
        },
        { kind: "day", events: [] },
      ],
    };
    expect(replayTimeline({ ...base, phases: [base.phases[1]] }).status).toBe(
      "invalid",
    );
    expect(
      replayTimeline({
        ...base,
        phases: [{ kind: "night", actions: { cycle: 1, butlerMasterSeat: 2 } }],
      }).status,
    ).toBe("invalid");
  });
});
