import { describe, expect, it } from "vitest";
import { resolveNight, type DynamicState, type NightActions } from "./night";
import type { Role } from "./model";

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
const state = (current: Role[] = roles, dead: number[] = []): DynamicState => ({
  roles: [...current],
  alive: current.map((_, i) => !dead.includes(i + 1)),
});
const run = (before: DynamicState, actions: NightActions) => {
  const result = resolveNight(before, {
    ...actions,
    ...(actions.cycle > 1 &&
    before.roles.includes("Undertaker") &&
    actions.previousDayExecutionDeathSeat === undefined
      ? { previousDayExecutionDeathSeat: null }
      : {}),
    ...(before.roles.includes("Butler") &&
    before.alive[before.roles.indexOf("Butler")] &&
    actions.butlerMasterSeat === undefined
      ? { butlerMasterSeat: 1 }
      : {}),
  });
  if (result.status !== "ok") throw new Error(result.reason);
  return result.trace;
};

describe("explicit night replay", () => {
  it("runs Poisoner on N1 without a Monk or Imp attack", () => {
    const trace = run(state(), { cycle: 1, poisonerTarget: 3 });
    expect(trace.deaths).toEqual([]);
    expect(trace.poisonedAtInformationStep).toBe(3);
    expect(
      resolveNight(state(), { cycle: 1, poisonerTarget: 3, impTarget: 2 })
        .status,
    ).toBe("invalid");
  });
  it("ends old poison at dusk and allows correct N2 Undertaker information after Poisoner dies", () => {
    const trace = run(
      state(
        [
          "Investigator",
          "Chef",
          "Fortune Teller",
          "Monk",
          "Poisoner",
          "Undertaker",
          "Imp",
          "Butler",
        ],
        [5],
      ),
      { cycle: 2, impTarget: 2, monkTarget: 1 },
    );
    expect(trace.deaths).toEqual([2]);
    expect(trace.poisonedAtInformationStep).toBeNull();
  });
  it("clears poison immediately when its living source dies or becomes Imp", () => {
    const killed = run(state(), {
      cycle: 2,
      poisonerTarget: 6,
      monkTarget: 1,
      impTarget: 4,
    });
    expect(killed.deaths).toEqual([4]);
    expect(killed.poisonedAtInformationStep).toBeNull();
    const passed = run(state(), {
      cycle: 2,
      poisonerTarget: 3,
      monkTarget: 1,
      impTarget: 7,
      impSuccessorSeat: 4,
    });
    expect(passed.deaths).toEqual([7]);
    expect(passed.state.roles[3]).toBe("Imp");
    expect(passed.poisonedAtInformationStep).toBeNull();
  });
  it("delivers Undertaker information when the Poisoner dies before its information step", () => {
    const trace = run(state(roles, [5]), {
      cycle: 2,
      poisonerTarget: 6,
      impTarget: 4,
      previousDayExecutionDeathSeat: 5,
    });
    expect(trace.deaths).toEqual([4]);
    expect(trace.poisonedAtInformationStep).toBeNull();
    expect(trace.undertakerInfo).toEqual({
      speaker: 6,
      executedSeat: 5,
      seenRole: "Monk",
    });
  });
  it("blocks attacks on a Monk target or healthy Soldier, including Imp self-kill", () => {
    expect(
      run(state(), { cycle: 2, poisonerTarget: 3, monkTarget: 2, impTarget: 2 })
        .deaths,
    ).toEqual([]);
    expect(
      run(state(), { cycle: 2, poisonerTarget: 3, monkTarget: 7, impTarget: 7 })
        .deaths,
    ).toEqual([]);
    const soldierRoles: Role[] = [...roles];
    soldierRoles[1] = "Soldier";
    expect(
      run(state(soldierRoles), {
        cycle: 2,
        poisonerTarget: 3,
        monkTarget: 1,
        impTarget: 2,
      }).deaths,
    ).toEqual([]);
    expect(
      run(state(soldierRoles), {
        cycle: 2,
        poisonerTarget: 2,
        monkTarget: 1,
        impTarget: 2,
      }).deaths,
    ).toEqual([2]);
  });
  it("allows Mayor redirection, including to protected or dead players", () => {
    const mayorRoles: Role[] = [...roles];
    mayorRoles[1] = "Mayor";
    expect(
      run(state(mayorRoles), {
        cycle: 2,
        poisonerTarget: 3,
        monkTarget: 1,
        impTarget: 2,
        mayorRedirectTarget: 6,
      }).deaths,
    ).toEqual([6]);
    expect(
      run(state(mayorRoles), {
        cycle: 2,
        poisonerTarget: 3,
        monkTarget: 1,
        impTarget: 2,
        mayorRedirectTarget: 1,
      }).deaths,
    ).toEqual([]);
    expect(
      run(state(mayorRoles, [6]), {
        cycle: 2,
        poisonerTarget: 3,
        monkTarget: 1,
        impTarget: 2,
        mayorRedirectTarget: 6,
      }).deaths,
    ).toEqual([]);
    expect(
      resolveNight(state(mayorRoles), {
        cycle: 2,
        poisonerTarget: 3,
        monkTarget: 1,
        impTarget: 2,
        mayorRedirectTarget: 2,
      }).status,
    ).toBe("invalid");
  });
  it("gives healthy Scarlet Woman mandatory priority at the pre-death five-player threshold", () => {
    const swRoles: Role[] = [...roles];
    swRoles[3] = "Scarlet Woman";
    const trace = run(state(swRoles), {
      cycle: 2,
      monkTarget: 1,
      impTarget: 7,
    });
    expect(trace.deaths).toEqual([7]);
    expect(trace.state.roles[3]).toBe("Imp");
    expect(trace.roleChanges[0].reason).toBe("scarlet_woman");
    const below = run(state(swRoles, [2, 3, 6, 8]), {
      cycle: 2,
      monkTarget: 1,
      impTarget: 7,
      impSuccessorSeat: 4,
    });
    expect(below.roleChanges[0].reason).toBe("imp_self_kill");
  });
  it("does not invent a death for a dead target or a poisoned Demon", () => {
    expect(
      run(state(roles, [2]), {
        cycle: 2,
        poisonerTarget: 3,
        monkTarget: 1,
        impTarget: 2,
      }).deaths,
    ).toEqual([]);
    expect(
      run(state(), { cycle: 2, poisonerTarget: 7, monkTarget: 1, impTarget: 2 })
        .deaths,
    ).toEqual([]);
  });
  it("passes the living Butler's nightly master choice to the next day", () => {
    const first = run(state(), {
      cycle: 1,
      poisonerTarget: 3,
      butlerMasterSeat: 7,
    });
    expect(first.butlerMasterSeat).toBe(7);
    expect(
      resolveNight(state(), {
        cycle: 1,
        poisonerTarget: 3,
        butlerMasterSeat: 8,
      }).status,
    ).toBe("invalid");
    const killedResult = resolveNight(state(), {
      cycle: 2,
      poisonerTarget: 3,
      monkTarget: 1,
      impTarget: 8,
      previousDayExecutionDeathSeat: null,
    });
    expect(killedResult.status).toBe("ok");
    if (killedResult.status !== "ok") throw new Error(killedResult.reason);
    expect(killedResult.trace.deaths).toEqual([8]);
    expect(killedResult.trace.butlerMasterSeat).toBeNull();
  });
  it("wakes a healthy Ravenkeeper on night death and applies character registration per interaction", () => {
    const rkRoles: Role[] = [
      "Ravenkeeper",
      "Chef",
      "Fortune Teller",
      "Spy",
      "Monk",
      "Undertaker",
      "Imp",
      "Butler",
    ];
    const spyInfo = run(state(rkRoles), {
      cycle: 2,
      monkTarget: 2,
      impTarget: 1,
      butlerMasterSeat: 2,
      ravenkeeperTarget: 4,
      ravenkeeperRegistrationRole: "Mayor",
    });
    expect(spyInfo.ravenkeeperInfo).toEqual({
      speaker: 1,
      target: 4,
      seenRole: "Mayor",
    });
    const poisonedSpyRoles: Role[] = [...rkRoles];
    poisonedSpyRoles[1] = "Poisoner";
    expect(
      resolveNight(state(poisonedSpyRoles), {
        cycle: 2,
        poisonerTarget: 4,
        monkTarget: 2,
        impTarget: 1,
        butlerMasterSeat: 2,
        ravenkeeperTarget: 4,
        ravenkeeperRegistrationRole: "Mayor",
      }).status,
    ).toBe("invalid");
    const recluseRoles: Role[] = [...rkRoles];
    recluseRoles[7] = "Recluse";
    const recluseInfo = run(state(recluseRoles), {
      cycle: 2,
      monkTarget: 2,
      impTarget: 1,
      ravenkeeperTarget: 8,
      ravenkeeperRegistrationRole: "Imp",
    });
    expect(recluseInfo.ravenkeeperInfo?.seenRole).toBe("Imp");
    const poisonedRoles: Role[] = [...rkRoles];
    poisonedRoles[3] = "Poisoner";
    expect(
      resolveNight(state(poisonedRoles), {
        cycle: 2,
        poisonerTarget: 1,
        monkTarget: 2,
        impTarget: 1,
        butlerMasterSeat: 2,
        ravenkeeperTarget: 4,
      }).status,
    ).toBe("invalid");
  });
  it("shows the actual executed character to Undertaker unless registration changes it", () => {
    const priorDeath = state(roles, [5]);
    const info = run(priorDeath, {
      cycle: 2,
      poisonerTarget: 3,
      impTarget: 2,
      butlerMasterSeat: 1,
      previousDayExecutionDeathSeat: 5,
    });
    expect(info.undertakerInfo).toEqual({
      speaker: 6,
      executedSeat: 5,
      seenRole: "Monk",
    });
    const spyRoles: Role[] = [...roles];
    spyRoles[3] = "Spy";
    const spy = run(state(spyRoles, [4]), {
      cycle: 2,
      monkTarget: 1,
      impTarget: 2,
      butlerMasterSeat: 1,
      previousDayExecutionDeathSeat: 4,
      undertakerRegistrationRole: "Butler",
    });
    expect(spy.undertakerInfo?.seenRole).toBe("Butler");
    const poisonedSpyRoles: Role[] = [...spyRoles];
    poisonedSpyRoles[0] = "Poisoner";
    expect(
      resolveNight(state(poisonedSpyRoles, [4]), {
        cycle: 2,
        poisonerTarget: 4,
        monkTarget: 1,
        impTarget: 2,
        butlerMasterSeat: 1,
        previousDayExecutionDeathSeat: 4,
        undertakerRegistrationRole: "Butler",
      }).status,
    ).toBe("invalid");
    const poisoned = run(priorDeath, {
      cycle: 2,
      poisonerTarget: 6,
      impTarget: 2,
      butlerMasterSeat: 1,
      previousDayExecutionDeathSeat: 5,
    });
    expect(poisoned.undertakerInfo).toBeNull();
    expect(
      resolveNight(priorDeath, {
        cycle: 2,
        poisonerTarget: 3,
        impTarget: 2,
        butlerMasterSeat: 1,
      }).status,
    ).toBe("unsupported");
  });
  it("keeps self-poison through the information step without poisoning another player", () => {
    const result = run(state(), {
      cycle: 2,
      poisonerTarget: 4,
      monkTarget: 1,
      impTarget: 2,
    });
    expect(result.poisonedAtInformationStep).toBe(4);
    expect(result.poisonSourceSeat).toBe(4);
    expect(result.deaths).toEqual([2]);
  });
});
