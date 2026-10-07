import type { Role } from "./model";
import { ROLE_TEAM } from "./setup";
import {
  initialAlignments,
  copyAlignments,
  isActuallyEvil,
  type Alignment,
} from "./alignment";
import {
  resolveDay,
  type DayActions,
  type DayEvent,
  type DayTrace,
} from "./day";
import {
  resolveNight,
  resolveImpAction,
  ravenkeeperDeathAtStep,
  type DynamicState,
  type NightActions,
  type NightTrace,
  type ImpAction,
  type ImpConditions,
  type RavenkeeperDeath,
} from "./night";
import type {
  RegistrationChoice,
  RoleFact,
  SetupQueryInput,
  SetupWitness,
} from "./symbolicSetup";
import { replayFirstNight } from "./replayFirstNight";
import {
  replayTimeline,
  scarletRegistrationChoices,
  impSuccessorRegistrationChoices,
  type TimelinePhase,
} from "./timeline";

/** Each listed phase is complete. A missing phase is never interpreted as empty. */
export type ObservedPhase =
  | {
      kind: "night";
      cycle: number;
      deaths: number[];
      winner?: "good" | "evil" | null;
    }
  | {
      kind: "day";
      cycle: number;
      events: DayEvent[];
      deaths: number[];
      executedSeat: number | null;
      winner?: "good" | "evil" | null;
    };

export type ObservedReport =
  | {
      kind: "undertaker";
      cycle: number;
      speaker: number;
      seenRole: Role;
      acceptedMessage: boolean;
      abilityActive: boolean;
    }
  | {
      kind: "ravenkeeper";
      cycle: number;
      speaker: number;
      target: number;
      seenRole: Role;
      acceptedMessage: boolean;
      abilityActive: boolean;
    }
  | {
      kind: "empath";
      cycle: number;
      speaker: number;
      count: number;
      acceptedMessage: boolean;
      abilityActive: boolean;
    }
  | {
      kind: "fortune_teller";
      cycle: number;
      speaker: number;
      targets: [number, number];
      yes: boolean;
      acceptedMessage: boolean;
      abilityActive: boolean;
    };

export interface ObservedTimelineInput {
  phases: ObservedPhase[];
  laterReports?: ObservedReport[];
  /** True role at the end of this exact complete phase, never an initial setup fact. */
  phaseRoleFacts?: Array<RoleFact & { phaseIndex: number }>;
  /** Limits concrete action histories inspected for each initial setup. */
  maxHistories?: number;
}

export type ObservedMatch =
  | {
      status: "valid";
      timeline: TimelinePhase[];
      registrations: RegistrationChoice[];
      finalRoles: Role[];
      finalAlignments: Alignment[];
      finalAlive: boolean[];
      inspected: number;
    }
  | { status: "invalid"; inspected: number }
  | {
      status: "unknown";
      reason: "time_budget" | "candidate_limit" | "unsupported_replay";
      inspected: number;
    };

const seats = (count: number) => Array.from({ length: count }, (_, i) => i + 1);
const livingRoleSeat = (state: DynamicState, role: Role) =>
  state.roles.findIndex((item, index) => item === role && state.alive[index]) +
  1;
const sameSet = (left: number[], right: number[]) => {
  const sortedRight = [...right].sort((a, b) => a - b);
  return (
    left.length === sortedRight.length &&
    [...left]
      .sort((a, b) => a - b)
      .every((seat, index) => seat === sortedRight[index])
  );
};

function* dayVariants(
  events: DayEvent[],
  state: DynamicState,
  poisonedSeat: number | null,
  deaths: number[],
): Generator<Pick<DayActions, "events" | "scarletRecluseRegistrations">> {
  function* expand(
    index: number,
    prefix: DayEvent[],
    spentVirgin: Set<number>,
  ): Generator<DayEvent[]> {
    if (index === events.length) {
      yield prefix;
      return;
    }
    const event = events[index];
    if (event.kind === "slayer") {
      const needsChoice =
        state.roles[event.actor - 1] === "Slayer" &&
        state.alive[event.actor - 1] &&
        state.alive[event.target - 1] &&
        state.roles[event.target - 1] === "Recluse" &&
        poisonedSeat !== event.target &&
        poisonedSeat !== event.actor &&
        !(state.spentSlayerSeats ?? []).includes(event.actor);
      for (const choice of needsChoice ? [false, true] : [undefined]) {
        yield* expand(
          index + 1,
          [
            ...prefix,
            {
              ...event,
              ...(choice === undefined
                ? {}
                : { recluseRegistersDemon: choice }),
            },
          ],
          spentVirgin,
        );
      }
    } else {
      const virgin =
        state.roles[event.nominee - 1] === "Virgin" &&
        state.alive[event.nominee - 1] &&
        !spentVirgin.has(event.nominee);
      const nextSpent = new Set(spentVirgin);
      if (virgin) nextSpent.add(event.nominee);
      const needsChoice =
        virgin &&
        poisonedSeat !== event.nominee &&
        poisonedSeat !== event.nominator &&
        state.roles[event.nominator - 1] === "Spy";
      for (const choice of needsChoice ? [false, true] : [undefined]) {
        yield* expand(
          index + 1,
          [
            ...prefix,
            {
              ...event,
              ...(choice === undefined
                ? {}
                : { spyRegistersTownsfolk: choice }),
            },
          ],
          nextSpent,
        );
      }
    }
  }
  const recluse =
    state.roles.findIndex(
      (role, index) =>
        role === "Recluse" && state.alive[index] && deaths.includes(index + 1),
    ) + 1;
  for (const candidate of expand(
    0,
    [],
    new Set(state.spentVirginSeats ?? []),
  )) {
    yield { events: candidate };
    if (recluse && livingRoleSeat(state, "Scarlet Woman"))
      yield { events: candidate, scarletRecluseRegistrations: [recluse] };
  }
}

function* nightVariants(
  state: DynamicState,
  cycle: number,
  deaths: number[],
  firstNightPoison: { seat: number; target: number } | undefined,
  reports: ObservedReport[],
  canContinue: () => boolean,
): Generator<NightActions> {
  const all = seats(state.roles.length);
  const poisoner = livingRoleSeat(state, "Poisoner");
  const monk = livingRoleSeat(state, "Monk");
  const butler = livingRoleSeat(state, "Butler");
  const imp = livingRoleSeat(state, "Imp");
  const ravenReport = reports.find(
    (report) =>
      report.kind === "ravenkeeper" &&
      report.cycle === cycle &&
      report.abilityActive &&
      report.acceptedMessage,
  );
  const undertakerReport = reports.find(
    (report) =>
      report.kind === "undertaker" &&
      report.cycle === cycle &&
      report.abilityActive &&
      report.acceptedMessage,
  );
  const poisons = poisoner
    ? cycle === 1 && firstNightPoison
      ? [firstNightPoison.target]
      : all
    : [undefined];
  const monks =
    cycle > 1 && monk ? all.filter((seat) => seat !== monk) : [undefined];
  const startingImps = all.filter(
    (seat) => state.roles[seat - 1] === "Imp" && state.alive[seat - 1],
  );
  // Every queued Imp can cause at most one death; inherited Imps do not act.
  if (cycle > 1 && deaths.length > startingImps.length) return;
  if (cycle > 1 && startingImps.length > 1) {
    function* expand(
      current: DynamicState,
      conditions: ImpConditions,
      remaining: number[],
      prefix: ImpAction[],
      died: number[],
      ravenDeath: RavenkeeperDeath | null,
    ): Generator<{
      state: DynamicState;
      actions: ImpAction[];
      poisoned: number | null;
      ravenDeath: RavenkeeperDeath | null;
    }> {
      if (!canContinue()) return;
      if (!remaining.length) {
        if (sameSet(died, deaths))
          yield {
            state: current,
            actions: prefix,
            poisoned: conditions.poisonedSeat,
            ravenDeath,
          };
        return;
      }
      for (const actor of remaining) {
        const rest = remaining.filter((seat) => seat !== actor);
        const skipReason = current.winner
          ? "game_over"
          : !current.alive[actor - 1]
            ? "dead"
            : undefined;
        if (skipReason) {
          const action: ImpAction = { actor, skipReason };
          yield* expand(
            current,
            conditions,
            rest,
            [...prefix, action],
            died,
            ravenDeath,
          );
          continue;
        }
        for (const target of all) {
          const redirects =
            current.roles[target - 1] === "Mayor" && current.alive[target - 1]
              ? [undefined, ...all.filter((seat) => seat !== target)]
              : [undefined];
          const successors =
            target === actor
              ? [
                  undefined,
                  ...all.filter(
                    (seat) =>
                      current.alive[seat - 1] &&
                      (ROLE_TEAM[current.roles[seat - 1]] === "minion" ||
                        (current.roles[seat - 1] === "Recluse" &&
                          conditions.poisonedSeat !== seat)),
                  ),
                ]
              : [undefined];
          for (const mayorRedirectTarget of redirects)
            for (const impSuccessorSeat of successors)
              for (const scarletRecluseRegistration of livingRoleSeat(
                current,
                "Scarlet Woman",
              )
                ? [
                    undefined,
                    ...deaths.filter(
                      (seat) => current.roles[seat - 1] === "Recluse",
                    ),
                  ]
                : [undefined]) {
                if (!canContinue()) return;
                const action: ImpAction = {
                  actor,
                  target,
                  ...(mayorRedirectTarget === undefined
                    ? {}
                    : { mayorRedirectTarget }),
                  ...(impSuccessorSeat === undefined
                    ? {}
                    : { impSuccessorSeat }),
                  ...(scarletRecluseRegistration === undefined
                    ? {}
                    : { scarletRecluseRegistration }),
                };
                const resolved = resolveImpAction(current, action, conditions);
                if (
                  resolved.status !== "ok" ||
                  resolved.deaths.some((seat) => !deaths.includes(seat))
                )
                  continue;
                yield* expand(
                  resolved.state,
                  resolved.conditions,
                  rest,
                  [...prefix, action],
                  [...died, ...resolved.deaths],
                  ravenkeeperDeathAtStep(
                    resolved.state,
                    resolved.deaths,
                    resolved.conditions,
                    actor,
                    prefix.length,
                  ) ?? ravenDeath,
                );
              }
        }
      }
    }
    for (const poisonerTarget of poisons)
      for (const monkTarget of monks)
        for (const candidate of expand(
          state,
          {
            poisonedSeat: poisonerTarget ?? null,
            protectedSeat: monk && monk !== poisonerTarget ? monkTarget! : null,
            poisonerSeat: poisoner || null,
            monkSeat: monk || null,
          },
          startingImps,
          [],
          [],
          null,
        )) {
          const needsRaven =
            candidate.ravenDeath &&
            candidate.ravenDeath.poisonedSeat !==
              candidate.ravenDeath.speaker &&
            !candidate.ravenDeath.gameOver;
          const ravenkeeperTarget = needsRaven
            ? ravenReport?.kind === "ravenkeeper"
              ? ravenReport.target
              : all[0]
            : undefined;
          const liveButler = livingRoleSeat(candidate.state, "Butler");
          const butlerMasterSeat =
            liveButler && !candidate.state.winner
              ? all.find((seat) => seat !== liveButler)
              : undefined;
          for (const ravenkeeperRegistrationRole of ravenReport?.kind ===
            "ravenkeeper" && needsRaven
            ? [undefined, ravenReport.seenRole]
            : [undefined])
            for (const undertakerRegistrationRole of undertakerReport?.kind ===
              "undertaker" &&
            livingRoleSeat(candidate.state, "Undertaker") &&
            candidate.poisoned !== undertakerReport.speaker &&
            !candidate.state.winner
              ? [undefined, undertakerReport.seenRole]
              : [undefined])
              yield {
                cycle,
                impActions: candidate.actions,
                ...(poisonerTarget === undefined ? {} : { poisonerTarget }),
                ...(monkTarget === undefined ? {} : { monkTarget }),
                ...(butlerMasterSeat === undefined ? {} : { butlerMasterSeat }),
                ...(ravenkeeperTarget === undefined
                  ? {}
                  : { ravenkeeperTarget }),
                ...(ravenkeeperRegistrationRole === undefined
                  ? {}
                  : { ravenkeeperRegistrationRole }),
                ...(undertakerRegistrationRole === undefined
                  ? {}
                  : { undertakerRegistrationRole }),
              };
        }
    return;
  }
  const imps =
    cycle > 1
      ? deaths.length === 1
        ? [
            ...new Set([
              deaths[0],
              ...all.filter(
                (seat) =>
                  state.alive[seat - 1] && state.roles[seat - 1] === "Mayor",
              ),
            ]),
          ]
        : all
      : [undefined];
  // The master's choice changes vote warnings, not the counted vote or state.
  const masters = butler
    ? [undefined, all.find((seat) => seat !== butler)!]
    : [undefined];
  for (const poisonerTarget of poisons)
    for (const monkTarget of monks)
      for (const impTarget of imps)
        for (const butlerMasterSeat of masters) {
          const redirects =
            cycle > 1 &&
            impTarget &&
            state.alive[impTarget - 1] &&
            state.roles[impTarget - 1] === "Mayor"
              ? [
                  undefined,
                  ...all.filter(
                    (seat) =>
                      seat !== impTarget &&
                      (deaths.length !== 1 || seat === deaths[0]),
                  ),
                ]
              : [undefined];
          const successors =
            cycle > 1 && impTarget === imp
              ? [
                  undefined,
                  ...all.filter(
                    (seat) =>
                      state.alive[seat - 1] &&
                      (["Poisoner", "Spy", "Scarlet Woman", "Baron"].includes(
                        state.roles[seat - 1],
                      ) ||
                        (state.roles[seat - 1] === "Recluse" &&
                          poisonerTarget !== seat)),
                  ),
                ]
              : [undefined];
          for (const mayorRedirectTarget of redirects)
            for (const impSuccessorSeat of successors) {
              const ravenSeat = mayorRedirectTarget ?? impTarget;
              const ravenTargets =
                cycle > 1 &&
                ravenSeat &&
                state.roles[ravenSeat - 1] === "Ravenkeeper"
                  ? ravenReport?.kind === "ravenkeeper"
                    ? [undefined, ravenReport.target]
                    : [undefined, all[0]]
                  : [undefined];
              for (const ravenkeeperTarget of ravenTargets)
                for (const ravenkeeperRegistrationRole of ravenReport?.kind ===
                  "ravenkeeper" && ravenkeeperTarget
                  ? [undefined, ravenReport.seenRole]
                  : [undefined])
                  for (const undertakerRegistrationRole of undertakerReport?.kind ===
                  "undertaker"
                    ? [undefined, undertakerReport.seenRole]
                    : [undefined])
                    for (const scarletRecluseRegistration of cycle > 1 &&
                    livingRoleSeat(state, "Scarlet Woman")
                      ? [
                          undefined,
                          ...deaths.filter(
                            (seat) => state.roles[seat - 1] === "Recluse",
                          ),
                        ]
                      : [undefined])
                      yield {
                        cycle,
                        ...(scarletRecluseRegistration
                          ? { scarletRecluseRegistration }
                          : {}),
                        ...(poisonerTarget ? { poisonerTarget } : {}),
                        ...(monkTarget ? { monkTarget } : {}),
                        ...(impTarget ? { impTarget } : {}),
                        ...(butlerMasterSeat ? { butlerMasterSeat } : {}),
                        ...(mayorRedirectTarget ? { mayorRedirectTarget } : {}),
                        ...(impSuccessorSeat ? { impSuccessorSeat } : {}),
                        ...(ravenkeeperTarget ? { ravenkeeperTarget } : {}),
                        ...(ravenkeeperRegistrationRole
                          ? { ravenkeeperRegistrationRole }
                          : {}),
                        ...(undertakerRegistrationRole
                          ? { undertakerRegistrationRole }
                          : {}),
                      };
            }
        }
}

function nightReportChoices(
  report: ObservedReport,
  trace: NightTrace,
  redHerringSeat: number | undefined,
  reportIndex: number,
): RegistrationChoice[] | null {
  if (!report.abilityActive) return [];
  if (report.kind === "ravenkeeper") {
    const death =
      trace.ravenkeeperDeath?.speaker === report.speaker
        ? trace.ravenkeeperDeath
        : null;
    const roles = death?.roles ?? trace.state.roles;
    const poison = death ? death.poisonedSeat : trace.poisonedAtInformationStep;
    if (
      roles[report.speaker - 1] !== "Ravenkeeper" ||
      poison === report.speaker
    )
      return null;
    if (!report.acceptedMessage) return [];
    const information = trace.ravenkeeperInfo;
    return information?.speaker === report.speaker &&
      information.target === report.target &&
      information.seenRole === report.seenRole
      ? []
      : null;
  }
  const role: Role =
    report.kind === "undertaker"
      ? "Undertaker"
      : report.kind === "fortune_teller"
        ? "Fortune Teller"
        : "Empath";
  const state = trace.state;
  if (state.winner && report.acceptedMessage) return null;
  if (
    state.roles[report.speaker - 1] !== role ||
    trace.poisonedAtInformationStep === report.speaker
  )
    return null;
  if (!state.alive[report.speaker - 1]) return null;
  if (!report.acceptedMessage) return [];
  if (report.kind === "undertaker")
    return trace.undertakerInfo?.speaker === report.speaker &&
      trace.undertakerInfo.seenRole === report.seenRole
      ? []
      : null;
  if (report.kind === "fortune_teller") {
    if (!redHerringSeat) return null;
    const alreadyYes = report.targets.some(
      (seat) => state.roles[seat - 1] === "Imp" || seat === redHerringSeat,
    );
    if (!report.yes) return alreadyYes ? null : [];
    if (alreadyYes) return [];
    const recluse = report.targets.find(
      (seat) =>
        state.roles[seat - 1] === "Recluse" &&
        trace.poisonedAtInformationStep !== seat,
    );
    return recluse
      ? [
          {
            interaction: `ft_n${report.cycle}_${reportIndex}`,
            seat: recluse,
            role: "Imp",
          },
        ]
      : null;
  }
  const n = state.roles.length;
  const neighbors: number[] = [];
  for (const direction of [-1, 1]) {
    for (let step = 1; step < n; step++) {
      const seat = ((report.speaker - 1 + direction * step + n * n) % n) + 1;
      if (state.alive[seat - 1]) {
        neighbors.push(seat);
        break;
      }
    }
  }
  if (neighbors.length !== 2) return null;
  const possibilities = neighbors.map((seat) => {
    const actual = state.roles[seat - 1];
    if (
      trace.poisonedAtInformationStep !== seat &&
      (actual === "Spy" || actual === "Recluse")
    )
      return [
        ...new Set([
          Number(isActuallyEvil(state, seat)),
          actual === "Spy" ? 0 : 1,
        ]),
      ].sort();
    return [Number(isActuallyEvil(state, seat))];
  });
  for (const left of possibilities[0])
    for (const right of possibilities[1]) {
      if (left + right !== report.count) continue;
      return neighbors.flatMap((seat, index) =>
        possibilities[index].length > 1
          ? [
              {
                interaction: `empath_n${report.cycle}_${reportIndex}_${index}`,
                seat,
                evil: Boolean(index === 0 ? left : right),
              },
            ]
          : [],
      );
    }
  return null;
}

/** Check the supplied choices, rather than regenerating a preferred registration. */
function replayNightInformation(
  report: ObservedReport,
  trace: NightTrace,
  redHerringSeat: number | undefined,
  reportIndex: number,
  registrations: RegistrationChoice[],
): boolean {
  if (nightReportChoices(report, trace, redHerringSeat, reportIndex) === null)
    return false;
  if (
    !report.abilityActive ||
    !report.acceptedMessage ||
    report.kind === "ravenkeeper" ||
    report.kind === "undertaker"
  )
    return true;
  const { state } = trace;
  let valid = true;
  const choice = (seat: number, interaction: string) => {
    const matches = registrations.filter(
      (r) => r.seat === seat && r.interaction === interaction,
    );
    if (matches.length > 1) valid = false;
    return matches[0];
  };
  if (report.kind === "fortune_teller") {
    const targetMatches = report.targets.map((seat) => {
      const registered = choice(seat, `ft_n${report.cycle}_${reportIndex}`);
      const actual = state.roles[seat - 1];
      const allowed =
        registered?.role &&
        (registered.role === actual ||
          (actual === "Recluse"
            ? ["minion", "demon"].includes(ROLE_TEAM[registered.role])
            : ["townsfolk", "outsider"].includes(ROLE_TEAM[registered.role])));
      if (
        registered &&
        ((actual !== "Recluse" && actual !== "Spy") ||
          trace.poisonedAtInformationStep === seat ||
          !allowed)
      )
        valid = false;
      return (registered?.role ?? actual) === "Imp" || seat === redHerringSeat;
    });
    return valid && targetMatches.some(Boolean) === report.yes;
  }
  const n = state.roles.length;
  const neighbors = [-1, 1].map((direction) => {
    for (let step = 1; step < n; step++) {
      const seat = ((report.speaker - 1 + direction * step + n * n) % n) + 1;
      if (state.alive[seat - 1]) return seat;
    }
    return 0;
  });
  if (neighbors.includes(0)) return false;
  const count = neighbors.reduce((total, seat, side) => {
    const registered = choice(
      seat,
      `empath_n${report.cycle}_${reportIndex}_${side}`,
    );
    const actual = state.roles[seat - 1];
    const native = isActuallyEvil(state, seat);
    if (
      registered &&
      (trace.poisonedAtInformationStep === seat ||
        (actual !== "Spy" && actual !== "Recluse") ||
        typeof registered.evil !== "boolean" ||
        (registered.evil !== native &&
          registered.evil !== (actual === "Recluse")))
    )
      valid = false;
    return total + Number(registered?.evil ?? native);
  }, 0);
  return valid && count === report.count;
}

/** Existential search over hidden actions. Exhaustion is required for exclusion. */
export function matchObservedTimeline(
  witness: SetupWitness,
  input: ObservedTimelineInput,
  setupInput: SetupQueryInput,
  deadline: number,
  acceptFinalState?: (state: DynamicState) => boolean,
  finalRoleConstraint?: RoleFact & { expected: boolean },
): ObservedMatch {
  const n = witness.roles.length;
  const limit = input.maxHistories ?? 10000;
  if (!Number.isInteger(limit) || limit < 1)
    throw new RangeError("隐藏行动搜索上限无效。");
  if (!input.phases.length || input.phases[0]?.kind !== "night")
    throw new RangeError("观察时间线必须从首夜开始。");
  for (const [index, phase] of input.phases.entries()) {
    const expected = index % 2 === 0 ? "night" : "day";
    if (
      phase.kind !== expected ||
      phase.cycle !== Math.floor(index / 2) + 1 ||
      !Array.isArray(phase.deaths) ||
      phase.deaths.some(
        (seat) => !Number.isInteger(seat) || seat < 1 || seat > n,
      ) ||
      new Set(phase.deaths).size !== phase.deaths.length ||
      (phase.kind === "day" &&
        (!Array.isArray(phase.events) ||
          (phase.executedSeat !== null &&
            (!Number.isInteger(phase.executedSeat) ||
              phase.executedSeat < 1 ||
              phase.executedSeat > n))))
    )
      throw new RangeError("观察时间线顺序、死亡或处决记录无效。");
  }
  const acceptedReports = new Set<string>();
  for (const report of input.laterReports ?? []) {
    if (
      !Number.isInteger(report.cycle) ||
      report.cycle < 2 ||
      report.cycle > Math.ceil(input.phases.length / 2) ||
      !Number.isInteger(report.speaker) ||
      report.speaker < 1 ||
      report.speaker > n
    )
      throw new RangeError("跨夜报告包含无效阶段或座位。");
    if (!report.acceptedMessage || !report.abilityActive) continue;
    const key = `${report.cycle}:${report.kind}:${report.speaker}`;
    if (acceptedReports.has(key))
      throw new RangeError("同一夜角色能力只可采纳一次实际展示的信息。");
    acceptedReports.add(key);
  }
  let inspected = 0;
  let unknown: ObservedMatch | null = null;
  const checkBudget = () => {
    if (Date.now() >= deadline) {
      unknown = { status: "unknown", reason: "time_budget", inspected };
      return false;
    }
    if (inspected >= limit) {
      unknown = { status: "unknown", reason: "candidate_limit", inspected };
      return false;
    }
    return true;
  };
  const search = (
    index: number,
    state: DynamicState,
    lastNight: NightTrace | null,
    lastDay: DayTrace | null,
    timeline: TimelinePhase[],
    registrations: RegistrationChoice[],
  ): {
    timeline: TimelinePhase[];
    registrations: RegistrationChoice[];
    finalRoles: Role[];
    finalAlignments: Alignment[];
    finalAlive: boolean[];
  } | null => {
    // In this TB slice every character change is to Imp. Being dead does not
    // change a player's character, so an existing Imp cannot become non-Imp.
    if (
      finalRoleConstraint &&
      state.roles[finalRoleConstraint.seat - 1] === "Imp" &&
      (finalRoleConstraint.role === "Imp") !== finalRoleConstraint.expected
    )
      return null;
    if (index === input.phases.length)
      return acceptFinalState && !acceptFinalState(state)
        ? null
        : {
            timeline,
            registrations,
            finalRoles: [...state.roles],
            finalAlignments: copyAlignments(state),
            finalAlive: [...state.alive],
          };
    const observation = input.phases[index];
    const matchesRoleFacts = (next: DynamicState) =>
      (input.phaseRoleFacts ?? [])
        .filter((fact) => fact.phaseIndex === index)
        .every((fact) => next.roles[fact.seat - 1] === fact.role);
    if (state.winner) return null;
    if (observation.kind === "night") {
      for (const variant of nightVariants(
        state,
        observation.cycle,
        observation.deaths,
        setupInput.nightOnePoisoner,
        input.laterReports ?? [],
        checkBudget,
      )) {
        if (
          observation.cycle === 1 &&
          variant.poisonerTarget !== undefined &&
          (setupInput.reports ?? []).some(
            (report) =>
              report.abilityActive && report.speaker === variant.poisonerTarget,
          )
        )
          continue;
        if (!checkBudget()) return null;
        inspected++;
        if (observation.cycle === 1 && variant.poisonerTarget !== undefined) {
          const inferred = {
            seat: livingRoleSeat(state, "Poisoner"),
            target: variant.poisonerTarget,
          };
          const replay = replayFirstNight(
            { ...setupInput, nightOnePoisoner: inferred },
            { ...witness, nightOnePoisoner: inferred },
          );
          if (!replay.valid) {
            // Another registration model for the same roles might still work.
            unknown = {
              status: "unknown",
              reason: "unsupported_replay",
              inspected,
            };
            continue;
          }
        }
        const previousDayExecutionDeathSeat =
          lastDay?.executionDeathSeat ?? null;
        const result = resolveNight(state, {
          ...variant,
          ...(observation.cycle > 1 ? { previousDayExecutionDeathSeat } : {}),
        });
        if (result.status === "unsupported") {
          unknown = {
            status: "unknown",
            reason: "unsupported_replay",
            inspected,
          };
          continue;
        }
        if (
          result.status !== "ok" ||
          !sameSet(result.trace.deaths, observation.deaths) ||
          (observation.winner !== undefined &&
            (result.trace.state.winner ?? null) !== observation.winner)
        )
          continue;
        if (!matchesRoleFacts(result.trace.state)) continue;
        const reportChoices = (input.laterReports ?? []).map((report, index) =>
          report.cycle === observation.cycle
            ? nightReportChoices(
                report,
                result.trace,
                witness.redHerringSeat,
                index,
              )
            : [],
        );
        if (reportChoices.some((choices) => choices === null)) continue;
        const found = search(
          index + 1,
          result.trace.state,
          result.trace,
          lastDay,
          [...timeline, { kind: "night", actions: variant }],
          [
            ...registrations,
            ...scarletRegistrationChoices(result.trace, index),
            ...impSuccessorRegistrationChoices(result.trace, index),
            ...reportChoices.flatMap((choices) => choices ?? []),
          ],
        );
        if (found) return found;
      }
    } else {
      if (!lastNight) return null;
      for (const variant of dayVariants(
        observation.events,
        state,
        lastNight.poisonedAtInformationStep,
        observation.deaths,
      )) {
        if (!checkBudget()) return null;
        inspected++;
        const result = resolveDay(state, {
          ...variant,
          poisonedSeat: lastNight.poisonedAtInformationStep,
          poisonSourceSeat: lastNight.poisonSourceSeat,
          butlerMasterSeat: lastNight.butlerMasterSeat,
        });
        if (result.status === "unsupported") {
          unknown = {
            status: "unknown",
            reason: "unsupported_replay",
            inspected,
          };
          continue;
        }
        if (
          result.status !== "ok" ||
          !sameSet(result.trace.deaths, observation.deaths) ||
          result.trace.executedSeat !== observation.executedSeat ||
          (observation.winner !== undefined &&
            (result.trace.state.winner ?? null) !== observation.winner)
        )
          continue;
        if (!matchesRoleFacts(result.trace.state)) continue;
        const found = search(
          index + 1,
          result.trace.state,
          lastNight,
          result.trace,
          [...timeline, { kind: "day", ...variant }],
          [
            ...registrations,
            ...scarletRegistrationChoices(result.trace, index),
          ],
        );
        if (found) return found;
      }
    }
    return null;
  };
  const timeline = search(
    0,
    {
      roles: [...witness.roles],
      alignments: initialAlignments(witness.roles),
      alive: witness.roles.map(() => true),
      spentVirginSeats: [],
      spentSlayerSeats: [],
      spentDeadVotes: [],
    },
    null,
    null,
    [],
    [],
  );
  if (timeline)
    return {
      status: "valid",
      timeline: timeline.timeline,
      registrations: timeline.registrations,
      finalRoles: timeline.finalRoles,
      finalAlignments: timeline.finalAlignments,
      finalAlive: timeline.finalAlive,
      inspected,
    };
  return unknown ?? { status: "invalid", inspected };
}

/** Recheck one returned world and its exact action/registration witness. */
export function replayObservedWitness(
  witness: SetupWitness,
  input: ObservedTimelineInput,
  setupInput: SetupQueryInput,
  currentQuery?: RoleFact,
  expectedCurrent?: boolean,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!witness.timeline || witness.timeline.length !== input.phases.length)
    return { valid: false, errors: ["见证缺少完整行动时间线。"] };
  const first = witness.timeline[0];
  const inferred =
    first.kind === "night" && first.actions.poisonerTarget !== undefined
      ? {
          seat: witness.roles.indexOf("Poisoner") + 1,
          target: first.actions.poisonerTarget,
        }
      : undefined;
  const firstNight = replayFirstNight(
    { ...setupInput, ...(inferred ? { nightOnePoisoner: inferred } : {}) },
    { ...witness, ...(inferred ? { nightOnePoisoner: inferred } : {}) },
  );
  errors.push(...firstNight.errors);
  const replay = replayTimeline({
    initialPlayers: witness.roles.map((actualRole, index) => ({
      seat: index + 1,
      actualRole,
      shownToken: witness.shownTokens[index],
    })),
    phases: witness.timeline,
  });
  if (replay.status !== "ok")
    return { valid: false, errors: [...errors, replay.reason] };
  if (
    witness.currentRoles &&
    (witness.currentRoles.length !== replay.state.roles.length ||
      Array.from(witness.currentRoles).some(
        (role, index) => replay.state.roles[index] !== role,
      ))
  )
    errors.push("见证的当前角色与行动重放结果不符。");
  const alignments = copyAlignments(replay.state);
  if (
    witness.currentAlive &&
    (witness.currentAlive.length !== replay.state.alive.length ||
      Array.from(witness.currentAlive).some(
        (alive, index) => alive !== replay.state.alive[index],
      ))
  )
    errors.push("见证的当前存活表与行动重放结果不符。");
  if (
    witness.currentAlignments &&
    (witness.currentAlignments.length !== alignments.length ||
      Array.from(witness.currentAlignments).some(
        (alignment, index) => alignment !== alignments[index],
      ))
  )
    errors.push("见证的实际阵营与行动重放结果不符。");
  if (
    !witness.currentAlignments &&
    alignments.some(
      (alignment, index) =>
        alignment !== initialAlignments(replay.state.roles)[index],
    )
  )
    errors.push("见证缺少角色与实际阵营不同的阵营证据。");
  if (
    currentQuery &&
    expectedCurrent !== undefined &&
    (replay.state.roles[currentQuery.seat - 1] === currentQuery.role) !==
      expectedCurrent
  )
    errors.push("见证的当前角色不满足查询分支。");
  const expectedScarletChoices = replay.traces.flatMap((trace, index) =>
    scarletRegistrationChoices(trace, index),
  );
  const expectedImpChoices = replay.traces.flatMap((trace, index) =>
    impSuccessorRegistrationChoices(trace, index),
  );
  if (
    witness.registrations.filter((r) =>
      r.interaction.startsWith("imp_successor_n"),
    ).length !== expectedImpChoices.length
  )
    errors.push("隐士自杀接任的注册记录数量与实际判定不符。");
  if (
    witness.registrations.filter((r) =>
      r.interaction.startsWith("scarlet_woman_"),
    ).length !== expectedScarletChoices.length
  )
    errors.push("红唇女郎继任的注册记录数量与实际判定不符。");
  for (const [index, observation] of input.phases.entries()) {
    const trace = replay.traces[index];
    for (const expected of scarletRegistrationChoices(trace, index)) {
      const records = witness.registrations.filter(
        (r) => r.interaction === expected.interaction,
      );
      if (
        records.length !== 1 ||
        records[0].seat !== expected.seat ||
        records[0].role !== "Imp"
      )
        errors.push("红唇女郎继任的见证需要唯一有效的本次隐士恶魔注册。");
    }
    for (const expected of impSuccessorRegistrationChoices(trace, index)) {
      const recorded = witness.registrations.filter(
        (registration) =>
          observation.kind === "night" &&
          registration.interaction === expected.interaction,
      );
      if (
        observation.kind !== "night" ||
        recorded.length !== 1 ||
        recorded[0].seat !== expected.seat ||
        !recorded[0].role ||
        ROLE_TEAM[recorded[0].role] !== "minion"
      )
        errors.push("隐士接任小恶魔的见证需要唯一有效的本次爪牙注册。");
    }
    for (const fact of (input.phaseRoleFacts ?? []).filter(
      (fact) => fact.phaseIndex === index,
    )) {
      if (trace.state.roles[fact.seat - 1] !== fact.role)
        errors.push(
          `第${index + 1}阶段结束时${fact.seat}号角色与已采纳条件不符。`,
        );
    }
    if (!sameSet(trace.deaths, observation.deaths))
      errors.push(`第${index + 1}阶段死亡集合不符。`);
    if (
      observation.kind === "day" &&
      (!("executedSeat" in trace) ||
        trace.executedSeat !== observation.executedSeat)
    )
      errors.push(`第${index + 1}阶段处决结果不符。`);
    if (
      observation.winner !== undefined &&
      (trace.state.winner ?? null) !== observation.winner
    )
      errors.push(`第${index + 1}阶段胜负结果不符。`);
    if (observation.kind !== "night" || !("poisonedAtInformationStep" in trace))
      continue;
    for (const [reportIndex, report] of (input.laterReports ?? []).entries()) {
      if (report.cycle !== observation.cycle) continue;
      if (
        !replayNightInformation(
          report,
          trace,
          witness.redHerringSeat,
          reportIndex,
          witness.registrations,
        )
      ) {
        errors.push(`N${report.cycle}报告无法重放。`);
      }
    }
  }
  return { valid: errors.length === 0, errors };
}
