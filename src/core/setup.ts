import { ROLES, type Role } from "./model";

export type Team = "townsfolk" | "outsider" | "minion" | "demon";

export const TOWNSFOLK: readonly Role[] = [
  "Washerwoman",
  "Librarian",
  "Investigator",
  "Chef",
  "Empath",
  "Fortune Teller",
  "Undertaker",
  "Monk",
  "Ravenkeeper",
  "Virgin",
  "Slayer",
  "Soldier",
  "Mayor",
];
export const OUTSIDERS: readonly Role[] = [
  "Butler",
  "Drunk",
  "Recluse",
  "Saint",
];
export const MINIONS: readonly Role[] = [
  "Poisoner",
  "Spy",
  "Scarlet Woman",
  "Baron",
];
export const DEMONS: readonly Role[] = ["Imp"];

export const RULES_SOURCE =
  "https://wiki.bloodontheclocktower.com/Trouble_Brewing";
export const SETUP_SOURCE = "https://wiki.bloodontheclocktower.com/Setup";

export const ROLE_TEAM: Record<Role, Team> = Object.fromEntries([
  ...TOWNSFOLK.map((role) => [role, "townsfolk"]),
  ...OUTSIDERS.map((role) => [role, "outsider"]),
  ...MINIONS.map((role) => [role, "minion"]),
  ...DEMONS.map((role) => [role, "demon"]),
]) as Record<Role, Team>;

export interface SetupCounts {
  townsfolk: number;
  outsider: number;
  minion: number;
  demon: number;
}

/** Standard (non-Teensyville) 7–15 player distribution before setup modifiers. */
export function baseSetup(playerCount: number): SetupCounts {
  if (!Number.isInteger(playerCount) || playerCount < 7 || playerCount > 15) {
    throw new RangeError("V1标准设置仅支持7–15名非旅行者玩家。");
  }
  const tier = Math.floor((playerCount - 7) / 3);
  return {
    townsfolk: 5 + 2 * tier,
    outsider: (playerCount - 7) % 3,
    minion: 1 + tier,
    demon: 1,
  };
}

export interface InitialPlayer {
  seat: number;
  actualRole: Role;
  /** The token seen at setup; relevant when actualRole is Drunk. */
  shownToken?: Role;
}

export interface SetupValidation {
  valid: boolean;
  expected: SetupCounts | null;
  actual: SetupCounts;
  baronInPlay: boolean;
  errors: string[];
}

export function validateInitialSetup(
  players: InitialPlayer[],
): SetupValidation {
  const count = players.length;
  const errors: string[] = [];
  let expected: SetupCounts | null = null;
  try {
    expected = baseSetup(count);
  } catch (error) {
    errors.push((error as Error).message);
  }
  const baronInPlay = players.some((p) => p.actualRole === "Baron");
  if (expected && baronInPlay) {
    expected = {
      ...expected,
      townsfolk: expected.townsfolk - 2,
      outsider: expected.outsider + 2,
    };
  }
  const actual: SetupCounts = {
    townsfolk: 0,
    outsider: 0,
    minion: 0,
    demon: 1,
  };
  let demonCount = 0;
  const seenSeats = new Set<number>();
  const seenRoles = new Set<Role>();
  const roleSet = new Set<string>(ROLES);
  for (const player of players) {
    if (
      !Number.isInteger(player.seat) ||
      player.seat < 1 ||
      player.seat > count ||
      seenSeats.has(player.seat)
    ) {
      errors.push(`座位 ${player.seat} 无效或重复。`);
    }
    seenSeats.add(player.seat);
    if (!roleSet.has(player.actualRole)) {
      errors.push(`${player.seat}号角色不在Trouble Brewing目录中。`);
      continue;
    }
    if (seenRoles.has(player.actualRole))
      errors.push(`初始角色 ${player.actualRole} 重复。`);
    seenRoles.add(player.actualRole);
    const team = ROLE_TEAM[player.actualRole];
    if (team === "demon") demonCount++;
    else actual[team]++;
    if (player.actualRole === "Drunk") {
      if (!player.shownToken || ROLE_TEAM[player.shownToken] !== "townsfolk") {
        errors.push("酒鬼必须看到一个镇民角色token。");
      }
    } else if (player.shownToken && player.shownToken !== player.actualRole) {
      errors.push(
        `${player.seat}号所见token与真实角色不一致；此设置差异只为酒鬼建模。`,
      );
    }
  }
  actual.demon = demonCount;
  if (expected) {
    for (const team of ["townsfolk", "outsider", "minion", "demon"] as const) {
      if (actual[team] !== expected[team])
        errors.push(
          `${team} 数量应为 ${expected[team]}，实际为 ${actual[team]}。`,
        );
    }
  }
  const drunk = players.find((p) => p.actualRole === "Drunk");
  if (drunk?.shownToken && seenRoles.has(drunk.shownToken)) {
    errors.push("酒鬼看到的镇民token不得同时作为另一位玩家的初始真实角色。");
  }
  return { valid: errors.length === 0, expected, actual, baronInPlay, errors };
}

const factorial = (n: number): bigint => {
  let result = 1n;
  for (let i = 2; i <= n; i++) result *= BigInt(i);
  return result;
};
const choose = (n: number, k: number): bigint => {
  if (k < 0 || k > n) return 0n;
  let result = 1n;
  for (let i = 1; i <= k; i++)
    result = (result * BigInt(n - i + 1)) / BigInt(i);
  return result;
};

/** Exact setup-only true-role assignment count; does not count shown tokens or histories. */
export function initialAssignmentCount(playerCount: number): bigint {
  const base = baseSetup(playerCount);
  const noBaron =
    choose(13, base.townsfolk) *
    choose(4, base.outsider) *
    choose(3, base.minion);
  const baron =
    choose(13, base.townsfolk - 2) *
    choose(4, base.outsider + 2) *
    choose(3, base.minion - 1);
  return factorial(playerCount) * (noBaron + baron);
}
