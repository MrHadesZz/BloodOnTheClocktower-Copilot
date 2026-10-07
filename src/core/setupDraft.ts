import { ROLES, type Role } from "./model";
import { ROLE_TEAM } from "./setup";
import type { FirstNightReport, RoleFact } from "./symbolicSetup";

export interface SetupDraft {
  count: number;
  facts: RoleFact[];
  tokenFacts: Array<{ seat: number; shownRole: Role }>;
  reports: FirstNightReport[];
  factSeat: number;
  factRole: Role;
  poisonEnabled: boolean;
  poisonerSeat: number;
  poisonTarget: number;
  querySeat: number;
  queryRole: Role;
}
export const defaultSetupDraft = (): SetupDraft => ({
  count: 8,
  facts: [],
  tokenFacts: [],
  reports: [],
  factSeat: 1,
  factRole: "Baron",
  poisonEnabled: false,
  poisonerSeat: 1,
  poisonTarget: 2,
  querySeat: 1,
  queryRole: "Imp",
});

/** Check imported local query state before it can be rendered or sent to Z3. */
export function validateSetupDraft(value: unknown): SetupDraft {
  if (!value || typeof value !== "object")
    throw new Error("标准设置草稿格式无效。");
  const draft = value as SetupDraft;
  const seat = (n: unknown) =>
    Number.isInteger(n) && Number(n) >= 1 && Number(n) <= draft.count;
  const role = (r: unknown) =>
    typeof r === "string" && (ROLES as readonly string[]).includes(r);
  if (
    !Number.isInteger(draft.count) ||
    draft.count < 7 ||
    draft.count > 15 ||
    !seat(draft.factSeat) ||
    !seat(draft.poisonerSeat) ||
    !seat(draft.poisonTarget) ||
    !seat(draft.querySeat) ||
    !role(draft.factRole) ||
    !role(draft.queryRole) ||
    typeof draft.poisonEnabled !== "boolean" ||
    !Array.isArray(draft.facts) ||
    draft.facts.length > 50 ||
    !draft.facts.every((fact) => fact && seat(fact.seat) && role(fact.role)) ||
    !Array.isArray(draft.tokenFacts ?? []) ||
    (draft.tokenFacts ?? []).length > 50 ||
    !(draft.tokenFacts ?? []).every(
      (token) => token && seat(token.seat) && role(token.shownRole),
    ) ||
    !Array.isArray(draft.reports) ||
    draft.reports.length > 50
  )
    throw new Error("标准设置草稿包含无效人数、座位、角色或条目。");
  for (const report of draft.reports) {
    if (
      !report ||
      !seat(report.speaker) ||
      typeof report.acceptedMessage !== "boolean" ||
      typeof report.abilityActive !== "boolean"
    )
      throw new Error("首夜报告的来源或前提无效。");
    if (report.kind === "librarian_zero") continue;
    if (report.kind === "chef" || report.kind === "empath") {
      if (
        !Number.isInteger(report.count) ||
        report.count < 0 ||
        report.count > (report.kind === "empath" ? 2 : draft.count)
      )
        throw new Error("首夜数字报告无效。");
      continue;
    }
    if (
      (report.kind === "pair_role" || report.kind === "fortune_teller") &&
      Array.isArray(report.targets) &&
      report.targets.length === 2 &&
      report.targets.every(seat) &&
      report.targets[0] !== report.targets[1]
    ) {
      if (report.kind === "fortune_teller" && typeof report.yes === "boolean")
        continue;
      if (
        report.kind === "pair_role" &&
        ["Washerwoman", "Librarian", "Investigator"].includes(report.ability) &&
        role(report.seenRole) &&
        ROLE_TEAM[report.seenRole] ===
          (report.ability === "Washerwoman"
            ? "townsfolk"
            : report.ability === "Librarian"
              ? "outsider"
              : "minion")
      )
        continue;
    }
    throw new Error("首夜报告格式无效。");
  }
  return { ...draft, tokenFacts: draft.tokenFacts ?? [] };
}
