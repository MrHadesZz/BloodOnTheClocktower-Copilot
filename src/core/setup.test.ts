import { describe, expect, it } from "vitest";
import { ROLES, type Role } from "./model";
import {
  baseSetup,
  initialAssignmentCount,
  MINIONS,
  OUTSIDERS,
  ROLE_TEAM,
  TOWNSFOLK,
  validateInitialSetup,
  type InitialPlayer,
} from "./setup";

function fixture(count: number, baron: boolean): InitialPlayer[] {
  const base = baseSetup(count);
  const t = base.townsfolk - (baron ? 2 : 0);
  const o = base.outsider + (baron ? 2 : 0);
  const roles: Role[] = [
    ...TOWNSFOLK.slice(0, t),
    ...OUTSIDERS.slice(0, o),
    ...(baron
      ? [
          "Baron" as Role,
          ...MINIONS.filter((r) => r !== "Baron").slice(0, base.minion - 1),
        ]
      : MINIONS.filter((r) => r !== "Baron").slice(0, base.minion)),
    "Imp",
  ];
  return roles.map((actualRole, i) => ({
    seat: i + 1,
    actualRole,
    ...(actualRole === "Drunk" ? { shownToken: TOWNSFOLK[t] } : {}),
  }));
}

describe("Trouble Brewing setup catalog", () => {
  it("contains 13 Townsfolk, 4 Outsiders, 4 Minions and 1 Demon exactly once", () => {
    expect([TOWNSFOLK.length, OUTSIDERS.length, MINIONS.length]).toEqual([
      13, 4, 4,
    ]);
    expect(ROLES).toHaveLength(22);
    expect(new Set(ROLES).size).toBe(22);
    expect(ROLES.every((role) => Boolean(ROLE_TEAM[role]))).toBe(true);
  });
  it("accepts standard 7–15 player setups with and without Baron", () => {
    for (let n = 7; n <= 15; n++) {
      expect(validateInitialSetup(fixture(n, false))).toMatchObject({
        valid: true,
        baronInPlay: false,
      });
      expect(validateInitialSetup(fixture(n, true))).toMatchObject({
        valid: true,
        baronInPlay: true,
      });
    }
  });
  it("keeps Drunk's actual role separate from the shown Townsfolk token", () => {
    const players = fixture(8, true);
    const drunk = players.find((p) => p.actualRole === "Drunk")!;
    drunk.shownToken = players[0].actualRole;
    expect(validateInitialSetup(players).errors.join(" ")).toContain(
      "不得同时",
    );
    drunk.shownToken = "Imp";
    expect(validateInitialSetup(players).errors.join(" ")).toContain(
      "必须看到一个镇民",
    );
  });
  it("rejects duplicate roles and incorrect Baron outsider counts", () => {
    const players = fixture(8, true);
    players[0].actualRole = players[1].actualRole;
    const result = validateInitialSetup(players);
    expect(result.valid).toBe(false);
    expect(result.errors.join(" ")).toContain("重复");
  });
  it("matches the design package's BigInt setup assignment counts", () => {
    expect(initialAssignmentCount(10).toString()).toBe("102745843200");
    expect(initialAssignmentCount(12).toString()).toBe("16644826598400");
    expect(initialAssignmentCount(15).toString()).toBe("12341830685184000");
  });
  it("does not silently apply standard setup to Teensyville", () => {
    expect(() => baseSetup(6)).toThrow("7–15");
    expect(() => baseSetup(16)).toThrow("7–15");
  });
});
