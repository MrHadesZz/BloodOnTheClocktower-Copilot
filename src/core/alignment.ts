import type { Role } from "./model";
import { ROLE_TEAM } from "./setup";

export type Alignment = "good" | "evil";
type AlignedRoles = { roles: Role[]; alignments?: Alignment[] };

/** Defaults apply only when an initial/legacy state has no alignment array. */
export function initialAlignments(roles: Role[]): Alignment[] {
  return roles.map((role) =>
    ROLE_TEAM[role] === "minion" || ROLE_TEAM[role] === "demon"
      ? "evil"
      : "good",
  );
}

export function validAlignments(state: AlignedRoles): boolean {
  return (
    state.alignments === undefined ||
    (Array.isArray(state.alignments) &&
      state.alignments.length === state.roles.length &&
      Array.from(state.alignments).every(
        (alignment) => alignment === "good" || alignment === "evil",
      ))
  );
}

/** Always copy so changing a character cannot reset or mutate their alignment. */
export function copyAlignments(state: AlignedRoles): Alignment[] {
  return state.alignments
    ? [...state.alignments]
    : initialAlignments(state.roles);
}

export function isActuallyEvil(state: AlignedRoles, seat: number): boolean {
  const explicit = state.alignments?.[seat - 1];
  return explicit !== undefined
    ? explicit === "evil"
    : ROLE_TEAM[state.roles[seat - 1]] === "minion" ||
        ROLE_TEAM[state.roles[seat - 1]] === "demon";
}
