import { describe, expect, it } from "vitest";
import { resolveDay, type DayActions } from "./day";
import type { Role } from "./model";
import type { DynamicState } from "./night";

const roles: Role[] = [
  "Virgin",
  "Slayer",
  "Poisoner",
  "Imp",
  "Chef",
  "Mayor",
  "Butler",
  "Recluse",
];
const state = (
  replacements: Partial<Record<number, Role>> = {},
  dead: number[] = [],
): DynamicState => ({
  roles: roles.map((r, i) => replacements[i + 1] ?? r),
  alive: roles.map((_, i) => !dead.includes(i + 1)),
});
const run = (before: DynamicState, actions: DayActions) => {
  const result = resolveDay(before, {
    butlerMasterSeat: before.alive[6] ? 5 : null,
    ...actions,
  });
  if (result.status !== "ok") throw new Error(result.reason);
  return result.trace;
};
const nomination = (
  nominator: number,
  nominee: number,
  votes: number[] = [],
) => ({ kind: "nomination" as const, nominator, nominee, votes });

describe("explicit day replay", () => {
  it("spends Virgin on the first valid nomination and immediately executes a Townsfolk", () => {
    const first = run(state(), { events: [nomination(5, 1)] });
    expect(first.executedSeat).toBe(5);
    expect(first.deaths).toEqual([5]);
    expect(first.state.spentVirginSeats).toEqual([1]);
    expect(run(first.state, { events: [nomination(2, 1)] }).deaths).toEqual([]);
    const spent = run(state(), {
      events: [nomination(3, 1), nomination(5, 2)],
    });
    expect(spent.state.spentVirginSeats).toEqual([1]);
    expect(spent.deaths).toEqual([]);
  });
  it("lets Spy register as Townsfolk only for this Virgin interaction", () => {
    const spy = state({ 3: "Spy" });
    expect(
      resolveDay(spy, { events: [nomination(3, 1)], butlerMasterSeat: 5 })
        .status,
    ).toBe("unsupported");
    const hit = run(spy, {
      events: [{ ...nomination(3, 1), spyRegistersTownsfolk: true }],
    });
    expect(hit.executedSeat).toBe(3);
    const miss = run(spy, {
      events: [{ ...nomination(3, 1), spyRegistersTownsfolk: false }],
    });
    expect(miss.deaths).toEqual([]);
  });
  it("does not allow poisoned Spy or Recluse to register specially", () => {
    const poisonedSpy = state({ 3: "Spy", 5: "Poisoner" });
    expect(
      run(poisonedSpy, {
        poisonedSeat: 3,
        poisonSourceSeat: 5,
        events: [nomination(3, 1)],
      }).deaths,
    ).toEqual([]);
    expect(
      resolveDay(poisonedSpy, {
        butlerMasterSeat: 5,
        poisonedSeat: 3,
        poisonSourceSeat: 5,
        events: [{ ...nomination(3, 1), spyRegistersTownsfolk: true }],
      }).status,
    ).toBe("invalid");
    expect(
      run(state(), {
        poisonedSeat: 8,
        poisonSourceSeat: 3,
        events: [{ kind: "slayer", actor: 2, target: 8 }],
      }).deaths,
    ).toEqual([]);
    expect(
      resolveDay(state(), {
        butlerMasterSeat: 5,
        poisonedSeat: 8,
        poisonSourceSeat: 3,
        events: [
          { kind: "slayer", actor: 2, target: 8, recluseRegistersDemon: true },
        ],
      }).status,
    ).toBe("invalid");
  });

  it("spends poisoned Slayer and leaves Demon alive", () => {
    const result = run(state(), {
      poisonedSeat: 2,
      poisonSourceSeat: 3,
      events: [{ kind: "slayer", actor: 2, target: 4 }],
    });
    expect(result.state.spentSlayerSeats).toEqual([2]);
    expect(result.deaths).toEqual([]);
    expect(
      resolveDay(result.state, {
        butlerMasterSeat: 5,
        events: [{ kind: "slayer", actor: 2, target: 4 }],
      }).status,
    ).toBe("invalid");
  });
  it("lets healthy Slayer kill Recluse by explicit registration, or Demon with Scarlet Woman succession", () => {
    const recluse = run(state(), {
      events: [
        { kind: "slayer", actor: 2, target: 8, recluseRegistersDemon: true },
      ],
    });
    expect(recluse.deaths).toEqual([8]);
    expect(recluse.state.winner).toBeUndefined();
    expect(
      resolveDay(state(), {
        butlerMasterSeat: 5,
        events: [{ kind: "slayer", actor: 2, target: 8 }],
      }).status,
    ).toBe("unsupported");
    const sw = run(state({ 3: "Scarlet Woman" }), {
      events: [{ kind: "slayer", actor: 2, target: 4 }],
    });
    expect(sw.roleChanges[0]).toMatchObject({ seat: 3, to: "Imp" });
    expect(sw.state.winner).toBeUndefined();
    const good = run(state(), {
      events: [{ kind: "slayer", actor: 2, target: 4 }],
    });
    expect(good.state.winner).toBe("good");
  });
  it("uses majority and tie rules, and tracks a dead player's single vote", () => {
    const before = state({}, [8]);
    const result = run(before, {
      events: [nomination(2, 3, [1, 2, 5, 8]), nomination(3, 2, [1, 3, 4, 6])],
    });
    expect(result.executedSeat).toBeNull();
    expect(result.state.spentDeadVotes).toEqual([8]);
    expect(
      resolveDay(before, {
        butlerMasterSeat: 5,
        events: [nomination(2, 3, [8]), nomination(3, 2, [8])],
      }).status,
    ).toBe("invalid");
    const execute = run(before, { events: [nomination(2, 3, [1, 2, 5, 8])] });
    expect(execute.executedSeat).toBe(3);
  });
  it("makes healthy Saint execution evil win, while poisoning blocks it", () => {
    const saint = state({ 5: "Saint" });
    expect(
      run(saint, { events: [nomination(2, 5, [1, 2, 3, 4])] }).state.winner,
    ).toBe("evil");
    expect(
      run(saint, {
        poisonedSeat: 5,
        poisonSourceSeat: 3,
        events: [nomination(2, 5, [1, 2, 3, 4])],
      }).state.winner,
    ).toBeUndefined();
  });
  it("gives Mayor the three-living no-execution victory only while healthy", () => {
    const before = state({}, [1, 2, 3, 7, 8]);
    expect(run(before, { events: [] }).state.winner).toBe("good");
    const poisoned = state({ 3: "Poisoner" }, [1, 2, 5, 7, 8]);
    expect(
      run(poisoned, { poisonedSeat: 6, poisonSourceSeat: 3, events: [] }).state
        .winner,
    ).toBeUndefined();
  });
  it("distinguishes executing a dead player from a death, and awards evil at two alive", () => {
    const three = state({}, [1, 2, 3, 5, 8]);
    const deadExecution = run(three, { events: [nomination(4, 2, [4, 6])] });
    expect(deadExecution.executedSeat).toBe(2);
    expect(deadExecution.deaths).toEqual([]);
    expect(deadExecution.state.winner).toBeUndefined();
    const evil = run(three, { events: [nomination(4, 6, [4, 7])] });
    expect(evil.executedSeat).toBe(6);
    expect(evil.state.winner).toBe("evil");
  });
  it("spends a poisoned Virgin on her first nomination without an execution", () => {
    const first = run(state(), {
      poisonedSeat: 1,
      poisonSourceSeat: 3,
      events: [nomination(5, 1)],
    });
    expect(first.state.spentVirginSeats).toEqual([1]);
    expect(first.deaths).toEqual([]);
    const later = run(first.state, { events: [nomination(2, 1)] });
    expect(later.deaths).toEqual([]);
  });
  it("counts an illegal Butler vote but records an explicit warning", () => {
    const result = run(state(), {
      events: [
        { ...nomination(2, 3, [1, 2, 6, 7]), butlerMasterRaisedAtTally: false },
      ],
    });
    expect(result.nominationTallies[0].votes).toBe(4);
    expect(result.butlerVoteWarnings).toHaveLength(1);
    const allowed = run(state(), {
      events: [
        {
          ...nomination(2, 3, [1, 2, 5, 7]),
          butlerMasterRaisedAtTally: false,
          butlerMasterAlreadyCounted: true,
        },
      ],
    });
    expect(allowed.butlerVoteWarnings).toHaveLength(0);
  });
});
