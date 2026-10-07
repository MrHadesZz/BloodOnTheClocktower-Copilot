import { activeEvents, AssumptionId, EventEnvelope, Role } from "./model";
import { resolveNight, type DynamicState, type NightActions } from "./night";

export const RULESET_HASH = "tb-h0-eight-player-fixture-v2";
export type Assignment = Record<number, Role>;
export interface Witness {
  roles: Assignment;
  poisonN1: number;
  redHerring: number;
  poisonN2?: number | null;
  monkGuardN2?: number | null;
  impTargetN2?: number;
  impSuccessorN2?: number | null;
  poisonedAtInfoN2?: number | null;
}
export interface SolverResult {
  status: "sat" | "unsat" | "unsupported";
  semantics: "exact";
  scope: string;
  revision: number;
  rulesetHash: string;
  assumptions: AssumptionId[];
  sourceIds: string[];
  count: {
    kind: "exact" | "not_computed";
    value?: string;
    projection: "initial_actual_roles";
  };
  possibleImpSeats: number[];
  witnesses: Witness[];
  unsupported: string[];
  conflict: AssumptionId[];
}
export type Query =
  | { kind: "actual_role"; seat: number; role: Role }
  | { kind: "n1_poisoned"; seat: number };
export type Classification =
  "necessary" | "impossible" | "contingent" | "inconsistent" | "unsupported";
export interface QueryResult {
  classification: Classification;
  yes?: Witness;
  no?: Witness;
}

const bag: Role[] = ["Monk", "Butler", "Poisoner", "Imp"];
const unknownSeats = [4, 5, 7, 8];
const base: Assignment = {
  1: "Investigator",
  2: "Chef",
  3: "Fortune Teller",
  6: "Undertaker",
};
const seats = [1, 2, 3, 4, 5, 6, 7, 8];
const key = (roles: Assignment) => seats.map((s) => roles[s]).join("|");
const seatOf = (roles: Assignment, role: Role) =>
  seats.find((s) => roles[s] === role)!;

function* permutations(items: Role[]): Generator<Role[]> {
  if (items.length === 0) {
    yield [];
    return;
  }
  for (let i = 0; i < items.length; i++) {
    for (const tail of permutations(items.filter((_, j) => j !== i)))
      yield [items[i], ...tail];
  }
}
function* assignments(): Generator<Assignment> {
  for (const roles of permutations(bag)) {
    const result: Assignment = { ...base };
    unknownSeats.forEach((seat, index) => {
      result[seat] = roles[index];
    });
    yield result;
  }
}
function chefNumber(roles: Assignment) {
  const evil = new Set([seatOf(roles, "Poisoner"), seatOf(roles, "Imp")]);
  return seats.filter((s) => evil.has(s) && evil.has(s === 8 ? 1 : s + 1))
    .length;
}
function samePair(value: number[] | undefined, a: number, b: number) {
  return value?.length === 2 && value.includes(a) && value.includes(b);
}
function hasReport(
  events: EventEnvelope[],
  kind:
    | "inv_report"
    | "chef_report"
    | "ft_report"
    | "ut_report_n2"
    | "ft_report_n2",
) {
  return events.some((event) => {
    const p = event.payload;
    if (
      p.kind !== "claim" ||
      p.claimKind !== "ability_report" ||
      event.occurredAt?.phase !== "night"
    )
      return false;
    const n = event.occurredAt.cycle;
    if (kind === "inv_report")
      return (
        n === 1 &&
        p.speaker === 1 &&
        p.role === "Investigator" &&
        samePair(p.targets, 4, 5) &&
        p.value === "Poisoner"
      );
    if (kind === "chef_report")
      return n === 1 && p.speaker === 2 && p.role === "Chef" && p.value === 0;
    if (kind === "ft_report")
      return (
        n === 1 &&
        p.speaker === 3 &&
        p.role === "Fortune Teller" &&
        samePair(p.targets, 7, 8) &&
        p.value === false
      );
    if (kind === "ut_report_n2")
      return (
        n === 2 &&
        p.speaker === 6 &&
        p.role === "Undertaker" &&
        p.value === "Monk"
      );
    return (
      n === 2 &&
      p.speaker === 3 &&
      p.role === "Fortune Teller" &&
      samePair(p.targets, 4, 7) &&
      p.value === true
    );
  });
}
const reportIds: (
  "inv_report" | "chef_report" | "ft_report" | "ut_report_n2" | "ft_report_n2"
)[] = [
  "inv_report",
  "chef_report",
  "ft_report",
  "ut_report_n2",
  "ft_report_n2",
];

function eventState(events: EventEnvelope[]) {
  const at = (event: EventEnvelope, phase: "day" | "night", cycle: number) =>
    event.occurredAt?.phase === phase && event.occurredAt.cycle === cycle;
  const executions = events.filter(
    (event) => event.payload.kind === "execution" && at(event, "day", 1),
  );
  const dayDeaths = events.filter(
    (event) => event.payload.kind === "death" && at(event, "day", 1),
  );
  const nightDeaths = events.filter(
    (event) => event.payload.kind === "death" && at(event, "night", 2),
  );
  const closedN2 = events.some(
    (event) => event.payload.kind === "phase_closed" && at(event, "night", 2),
  );
  const otherDeaths = events.some(
    (event) =>
      event.payload.kind === "death" &&
      !at(event, "day", 1) &&
      !at(event, "night", 2),
  );
  const otherExec = events.some(
    (event) => event.payload.kind === "execution" && !at(event, "day", 1),
  );
  const executedDeathSeat =
    executions.length === 1 &&
    dayDeaths.length === 1 &&
    executions[0].payload.kind === "execution" &&
    dayDeaths[0].payload.kind === "death" &&
    executions[0].payload.seat === dayDeaths[0].payload.seat
      ? executions[0].payload.seat
      : null;
  return {
    closedN2,
    otherDeaths,
    otherExec,
    executedDeathSeat,
    nightDeathSeats: nightDeaths.flatMap((event) =>
      event.payload.kind === "death" ? [event.payload.seat] : [],
    ),
    n2Ready:
      (closedN2 || nightDeaths.length === 1) &&
      executedDeathSeat !== null &&
      nightDeaths.length <= 1 &&
      !otherDeaths &&
      !otherExec,
  };
}

function n2Witness(
  roles: Assignment,
  redHerring: number,
  accepted: Set<AssumptionId>,
  executedDeathSeat: number,
  nightDeathSeats: number[],
): Pick<
  Witness,
  | "poisonN2"
  | "monkGuardN2"
  | "impTargetN2"
  | "impSuccessorN2"
  | "poisonedAtInfoN2"
> | null {
  const poisoner = seatOf(roles, "Poisoner");
  const monk = seatOf(roles, "Monk");
  const demon = seatOf(roles, "Imp");
  const butler = seatOf(roles, "Butler");
  const before: DynamicState = {
    roles: seats.map((seat) => roles[seat]),
    alive: seats.map((seat) => seat !== executedDeathSeat),
  };
  // The observed D1 execution removed one player. N2 can only proceed if an
  // Imp remains alive; resolveNight checks poison, protection and death order.
  if (demon === executedDeathSeat) return null;
  const poisons: (number | null)[] =
    poisoner === executedDeathSeat
      ? [null]
      : seats.filter((seat) => seat !== poisoner);
  const guards: (number | null)[] =
    monk === executedDeathSeat ? [null] : seats.filter((seat) => seat !== monk);
  const demonTargets = nightDeathSeats.length ? nightDeathSeats : seats;
  for (const poison of poisons) {
    for (const guard of guards) {
      for (const demonTarget of demonTargets) {
        const actions: NightActions = {
          cycle: 2,
          impTarget: demonTarget,
          previousDayExecutionDeathSeat: executedDeathSeat,
          ...(demonTarget === demon && poisoner !== executedDeathSeat
            ? { impSuccessorSeat: poisoner }
            : {}),
          ...(poison !== null ? { poisonerTarget: poison } : {}),
          ...(guard !== null ? { monkTarget: guard } : {}),
          ...(butler !== executedDeathSeat ? { butlerMasterSeat: 1 } : {}),
        };
        const result = resolveNight(before, actions);
        if (
          result.status !== "ok" ||
          result.trace.deaths.length !== nightDeathSeats.length ||
          result.trace.deaths.some(
            (seat, index) => seat !== nightDeathSeats[index],
          )
        )
          continue;
        const poisoned = result.trace.poisonedAtInformationStep;
        if (
          accepted.has("ut_report_n2") &&
          (result.trace.state.winner !== undefined ||
            !result.trace.state.alive[5] ||
            (poisoned !== 6 &&
              result.trace.undertakerInfo?.seenRole !== "Monk"))
        )
          continue;
        // A dead former Imp still registers as a Demon; a newly changed Imp
        // also counts when Fortune Teller acts later in the same night.
        const fortuneTellerYes = [4, 7].some(
          (seat) =>
            result.trace.state.roles[seat - 1] === "Imp" || redHerring === seat,
        );
        if (
          accepted.has("ft_report_n2") &&
          (result.trace.state.winner !== undefined ||
            !result.trace.state.alive[2] ||
            (poisoned !== 3 && !fortuneTellerYes))
        )
          continue;
        return {
          poisonN2: poison,
          monkGuardN2: guard,
          impTargetN2: demonTarget,
          impSuccessorN2:
            result.trace.roleChanges.find((change) => change.to === "Imp")
              ?.seat ?? null,
          poisonedAtInfoN2: poisoned,
        };
      }
    }
  }
  return null;
}

function solveInternal(
  events: EventEnvelope[],
  assumptions: AssumptionId[],
  revision: number,
): SolverResult {
  const current = activeEvents(events, revision);
  const accepted = new Set(assumptions);
  const state = eventState(current);
  const scope = state.n2Ready
    ? "H0固定角色袋八人案例；D1处决死亡与N2已观察死亡经夜间重放约束"
    : "H0固定角色袋八人案例";
  const unsupported: string[] = [];
  for (const id of reportIds)
    if (accepted.has(id) && !hasReport(current, id))
      unsupported.push(`缺少与“${id}”对应的原始报告`);
  if (state.otherDeaths || state.otherExec)
    unsupported.push("当前固定案例未编码其他处决或死亡");
  if ((state.closedN2 || state.nightDeathSeats.length > 0) && !state.n2Ready)
    unsupported.push("本H0动态切片要求D1恰有一人因处决死亡、N2最多一人死亡");
  if (
    (accepted.has("ut_report_n2") || accepted.has("ft_report_n2")) &&
    !state.n2Ready
  )
    unsupported.push(
      "N2报告推理要求D1处决死亡，以及已记录N2死亡或关闭的死亡通道",
    );
  if (unsupported.length)
    return {
      status: "unsupported",
      semantics: "exact",
      scope,
      revision,
      rulesetHash: RULESET_HASH,
      assumptions,
      sourceIds: [],
      count: { kind: "not_computed", projection: "initial_actual_roles" },
      possibleImpSeats: [],
      witnesses: [],
      unsupported,
      conflict: [],
    };
  const witnesses: Witness[] = [];
  for (const roles of assignments()) {
    if (accepted.has("butler8") && roles[8] !== "Butler") continue;
    const poisoner = seatOf(roles, "Poisoner"),
      demon = seatOf(roles, "Imp");
    for (const poison of seats) {
      if (poison === poisoner) continue; // self-poison requires separate semantics
      if (accepted.has("inv_active") && poison === 1) continue;
      if (accepted.has("chef_active") && poison === 2) continue;
      if (accepted.has("ft_active") && poison === 3) continue;
      if (
        accepted.has("inv_report") &&
        poison !== 1 &&
        poisoner !== 4 &&
        poisoner !== 5
      )
        continue;
      if (
        accepted.has("chef_report") &&
        poison !== 2 &&
        chefNumber(roles) !== 0
      )
        continue;
      for (const redHerring of seats) {
        if (redHerring === poisoner || redHerring === demon) continue;
        const ftTrue =
          demon === 7 || demon === 8 || redHerring === 7 || redHerring === 8;
        if (accepted.has("ft_report") && poison !== 3 && ftTrue) continue;
        const n2 = state.n2Ready
          ? n2Witness(
              roles,
              redHerring,
              accepted,
              state.executedDeathSeat!,
              state.nightDeathSeats,
            )
          : {};
        if (n2 === null) continue;
        witnesses.push({ roles, poisonN1: poison, redHerring, ...n2 });
      }
    }
  }
  const unique = new Map(witnesses.map((w) => [key(w.roles), w.roles]));
  const possibleImpSeats = [
    ...new Set([...unique.values()].map((r) => seatOf(r, "Imp"))),
  ].sort((a, b) => a - b);
  const sourceIds = current
    .filter(
      (e) =>
        e.payload.kind === "death" ||
        e.payload.kind === "execution" ||
        e.payload.kind === "phase_closed" ||
        reportIds.some((id) => accepted.has(id) && hasReport([e], id)),
    )
    .map((e) => e.id);
  return {
    status: witnesses.length ? "sat" : "unsat",
    semantics: "exact",
    scope,
    revision,
    rulesetHash: RULESET_HASH,
    assumptions,
    sourceIds,
    count: {
      kind: "exact",
      value: String(unique.size),
      projection: "initial_actual_roles",
    },
    possibleImpSeats,
    witnesses,
    unsupported: [],
    conflict: [],
  };
}

export function solve(
  events: EventEnvelope[],
  assumptions: AssumptionId[],
  revision = events.length,
): SolverResult {
  const result = solveInternal(events, assumptions, revision);
  if (result.status !== "unsat") return result;
  let core = [...assumptions];
  for (const id of [...core]) {
    const reduced = core.filter((x) => x !== id);
    if (solveInternal(events, reduced, revision).status === "unsat")
      core = reduced;
  }
  return { ...result, conflict: core };
}
export function classify(result: SolverResult, query: Query): QueryResult {
  if (result.status === "unsupported") return { classification: "unsupported" };
  if (result.status === "unsat") return { classification: "inconsistent" };
  const predicate = (w: Witness) =>
    query.kind === "actual_role"
      ? w.roles[query.seat] === query.role
      : w.poisonN1 === query.seat;
  const yes = result.witnesses.find(predicate);
  const no = result.witnesses.find((w) => !predicate(w));
  return {
    classification: !yes ? "impossible" : !no ? "necessary" : "contingent",
    yes,
    no,
  };
}
export function projectedWitnesses(result: SolverResult, limit = 2): Witness[] {
  const seen = new Set<string>();
  return result.witnesses
    .filter((w) => {
      const k = key(w.roles);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, limit);
}
export function availableAssumptions(
  events: EventEnvelope[],
  revision: number,
): Set<AssumptionId> {
  const current = activeEvents(events, revision);
  const available = new Set<AssumptionId>([
    "inv_active",
    "chef_active",
    "ft_active",
    "butler8",
  ]);
  for (const id of reportIds) if (hasReport(current, id)) available.add(id);
  return available;
}
export const FIXTURE_ROLES: Role[] = [
  "Investigator",
  "Chef",
  "Fortune Teller",
  "Poisoner",
  "Monk",
  "Undertaker",
  "Imp",
  "Butler",
];
