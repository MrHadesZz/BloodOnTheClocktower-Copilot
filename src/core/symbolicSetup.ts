import { init } from "z3-solver";
import { ROLES, type Role } from "./model";
import { baseSetup, ROLE_TEAM, TOWNSFOLK, type Team } from "./setup";
import { replayFirstNight } from "./replayFirstNight";
import { copyAlignments, type Alignment } from "./alignment";
import {
  replayTimeline,
  scarletRegistrationChoices,
  impSuccessorRegistrationChoices,
  type TimelinePhase,
} from "./timeline";
import {
  matchObservedTimeline,
  replayObservedWitness,
  type ObservedTimelineInput,
} from "./observedTimeline";

export const STANDARD_RULESET_HASH = "tb-standard-setup-first-night-v4";
export const TIMELINE_RULESET_HASH = "tb-standard-bounded-timeline-v7";
export const OBSERVED_TIMELINE_RULESET_HASH =
  "tb-standard-observed-timeline-v8";

const roleIndex = new Map<Role, number>(
  ROLES.map((role, index) => [role, index]),
);
let runtime: ReturnType<typeof init> | null = null;
const z3 = () =>
  (runtime ??=
    typeof location !== "undefined" && /^https?:$/.test(location.protocol)
      ? init({
          locateFile: (file: string) => `/z3/${file}`,
          mainScriptUrlOrBlob: "/z3/z3-built.js",
        })
      : init());

export interface RoleFact {
  seat: number;
  role: Role;
}
interface ReportPremises {
  speaker: number;
  acceptedMessage: boolean;
  abilityActive: boolean;
}
export type FirstNightReport =
  | (ReportPremises & { kind: "librarian_zero" })
  | (ReportPremises & {
      kind: "pair_role";
      ability: "Washerwoman" | "Librarian" | "Investigator";
      targets: [number, number];
      seenRole: Role;
    })
  | (ReportPremises & { kind: "chef"; count: number })
  | (ReportPremises & { kind: "empath"; count: number })
  | (ReportPremises & {
      kind: "fortune_teller";
      targets: [number, number];
      yes: boolean;
    });
export interface SetupQueryInput {
  playerCount: number;
  facts: RoleFact[];
  /** A player's observed setup token. It may differ from truth only for Drunk. */
  tokenFacts?: Array<{ seat: number; shownRole: Role }>;
  query: RoleFact;
  /** Explicit first-night Poisoner action premise, including self-targeting. */
  nightOnePoisoner?: { seat: number; target: number };
  /** Explicitly accepted first-night reports; an inactive ability never constrains its message. */
  reports?: FirstNightReport[];
  timeoutMs?: number;
}
export interface RegistrationChoice {
  interaction: string;
  seat: number;
  evil?: boolean;
  role?: Role;
}
export interface SetupWitness {
  roles: Role[];
  shownTokens: Role[];
  redHerringSeat?: number;
  nightOnePoisoner?: { seat: number; target: number };
  registrations: RegistrationChoice[];
  /** Concrete hidden actions that make an observed timeline possible. */
  timeline?: TimelinePhase[];
  currentRoles?: Role[];
  currentAlive?: boolean[];
  /** Actual alignment at the final closed phase, independent of current character. */
  currentAlignments?: Alignment[];
}
export interface TimelineObservation {
  /** An exact death set for the corresponding complete phase. */
  deaths?: number[];
  /** The executed player, or null when nobody was executed that day. */
  executedSeat?: number | null;
  winner?: "good" | "evil" | null;
}
export interface TimelineQueryInput extends SetupQueryInput {
  /** Fully specified action history; hidden choices must be supplied explicitly. */
  timeline: TimelinePhase[];
  observations: TimelineObservation[];
  /** Hard cap on candidate setup assignments inspected before returning unknown. */
  maxWorlds?: number;
}
export interface ObservedQueryInput
  extends SetupQueryInput, ObservedTimelineInput {
  maxWorlds?: number;
  /** Query the role at the end of the last closed phase. */
  currentQuery?: RoleFact;
}
export interface SetupQueryResult {
  rulesetHash: string;
  scope: "initial_setup_only" | "first_night_slice" | "bounded_timeline";
  status: "sat" | "unsat" | "unknown";
  classification:
    "necessary" | "impossible" | "contingent" | "inconsistent" | "unknown";
  yes?: SetupWitness;
  no?: SetupWitness;
  inspectedCandidates?: number;
  unknownReason?:
    "time_budget" | "candidate_limit" | "unsupported_replay" | "solver_unknown";
}

/** Exact role-setup projection for the listed premises; later events remain outside this model. */
export async function queryInitialSetup(
  input: SetupQueryInput,
): Promise<SetupQueryResult> {
  return queryModel(input);
}

/** Sound bounded search over complete action histories; timeout/cap yields unknown. */
export async function queryTimelineWorlds(
  input: TimelineQueryInput,
): Promise<SetupQueryResult> {
  return queryModel(input, input);
}

/** Infer unrecorded actions only inside explicitly closed observation phases. */
export async function queryObservedTimeline(
  input: ObservedQueryInput,
): Promise<SetupQueryResult> {
  return queryModel(input, undefined, input);
}

async function queryModel(
  input: SetupQueryInput,
  timelineInput?: TimelineQueryInput,
  observedInput?: ObservedQueryInput,
): Promise<SetupQueryResult> {
  const base = baseSetup(input.playerCount);
  const n = input.playerCount;
  const reports = input.reports ?? [];
  const scope =
    timelineInput || observedInput
      ? "bounded_timeline"
      : reports.length
        ? "first_night_slice"
        : "initial_setup_only";
  const rulesetHash = timelineInput
    ? TIMELINE_RULESET_HASH
    : observedInput
      ? OBSERVED_TIMELINE_RULESET_HASH
      : STANDARD_RULESET_HASH;
  if (timelineInput) {
    if (
      !Array.isArray(timelineInput.timeline) ||
      !timelineInput.timeline.length ||
      !timelineInput.timeline[0] ||
      timelineInput.timeline[0].kind !== "night" ||
      !timelineInput.timeline[0].actions ||
      timelineInput.timeline[0].actions.cycle !== 1 ||
      !Array.isArray(timelineInput.observations) ||
      timelineInput.observations.length !== timelineInput.timeline.length
    )
      throw new RangeError("动态查询需要从首夜开始的完整行动和逐阶段观察。");
    if (
      timelineInput.timeline[0].actions.poisonerTarget !==
      input.nightOnePoisoner?.target
    )
      throw new RangeError("首夜行动与投毒前提不一致。");
    if (
      timelineInput.maxWorlds !== undefined &&
      (!Number.isInteger(timelineInput.maxWorlds) ||
        timelineInput.maxWorlds < 1)
    )
      throw new RangeError("候选世界上限无效。");
  }
  if (
    observedInput &&
    observedInput.maxWorlds !== undefined &&
    (!Number.isInteger(observedInput.maxWorlds) || observedInput.maxWorlds < 1)
  )
    throw new RangeError("候选世界上限无效。");
  const checkSeat = (seat: number) => {
    if (!Number.isInteger(seat) || seat < 1 || seat > n)
      throw new RangeError("设置查询包含无效座位。");
  };
  if (timelineInput) {
    for (const [index, phase] of timelineInput.timeline.entries()) {
      const expected = index % 2 === 0 ? "night" : "day";
      if (
        !phase ||
        phase.kind !== expected ||
        (phase.kind === "night" &&
          (!phase.actions ||
            phase.actions.cycle !== Math.floor(index / 2) + 1)) ||
        (phase.kind === "day" && !Array.isArray(phase.events))
      )
        throw new RangeError("动态行动时间线顺序或阶段内容无效。");
      const observation = timelineInput.observations[index];
      if (!observation || typeof observation !== "object")
        throw new RangeError("动态阶段观察无效。");
      if (observation.deaths !== undefined) {
        if (
          !Array.isArray(observation.deaths) ||
          !observation.deaths.every(
            (seat) => Number.isInteger(seat) && seat >= 1 && seat <= n,
          ) ||
          new Set(observation.deaths).size !== observation.deaths.length
        )
          throw new RangeError("动态死亡观察无效。");
      }
      if (
        observation.executedSeat !== undefined &&
        (phase.kind !== "day" ||
          (observation.executedSeat !== null &&
            (!Number.isInteger(observation.executedSeat) ||
              observation.executedSeat < 1 ||
              observation.executedSeat > n)))
      )
        throw new RangeError("动态处决观察无效。");
      if (
        observation.winner !== undefined &&
        observation.winner !== null &&
        observation.winner !== "good" &&
        observation.winner !== "evil"
      )
        throw new RangeError("动态胜负观察无效。");
    }
  }
  const checkFact = ({ seat, role }: RoleFact) => {
    checkSeat(seat);
    if (!roleIndex.has(role)) throw new RangeError("设置查询包含无效角色。");
  };
  input.facts.forEach(checkFact);
  for (const token of input.tokenFacts ?? []) {
    checkSeat(token.seat);
    if (!roleIndex.has(token.shownRole))
      throw new RangeError("设置查询包含无效所见角色token。");
  }
  checkFact(input.query);
  if (observedInput?.currentQuery) checkFact(observedInput.currentQuery);
  for (const fact of observedInput?.phaseRoleFacts ?? []) {
    checkFact(fact);
    if (
      !Number.isInteger(fact.phaseIndex) ||
      fact.phaseIndex < 0 ||
      fact.phaseIndex >= observedInput!.phases.length
    )
      throw new RangeError("当前角色条件所在阶段不在封闭时间线中。");
  }
  if (input.nightOnePoisoner) {
    checkSeat(input.nightOnePoisoner.seat);
    checkSeat(input.nightOnePoisoner.target);
  }
  const seenActiveReports = new Set<string>();
  for (const report of reports) {
    checkSeat(report.speaker);
    if (report.kind === "pair_role" || report.kind === "fortune_teller") {
      report.targets.forEach(checkSeat);
      if (report.targets[0] === report.targets[1])
        throw new RangeError("一次信息的两个目标必须不同。");
    }
    if (report.kind === "pair_role") {
      const requiredTeam: Team =
        report.ability === "Washerwoman"
          ? "townsfolk"
          : report.ability === "Librarian"
            ? "outsider"
            : "minion";
      if (ROLE_TEAM[report.seenRole] !== requiredTeam)
        throw new RangeError("展示角色与这项首夜能力的类别不符。");
    }
    if (
      (report.kind === "chef" || report.kind === "empath") &&
      (!Number.isInteger(report.count) ||
        report.count < 0 ||
        report.count > (report.kind === "empath" ? 2 : n))
    ) {
      throw new RangeError("首夜数字信息超出合法范围。");
    }
    if (report.acceptedMessage && report.abilityActive) {
      const key = `${report.kind === "pair_role" ? report.ability : report.kind === "librarian_zero" ? "Librarian" : report.kind}:${report.speaker}`;
      if (seenActiveReports.has(key))
        throw new RangeError("同一首夜能力只可采纳一次实际展示的信息。");
      seenActiveReports.add(key);
    }
  }

  const { Context } = await z3();
  const deadline =
    Date.now() + Math.max(100, Math.min(input.timeoutMs ?? 2000, 10000));
  const { Solver, Int, Bool, Or, And, Not, Distinct, Sum, If } = new Context(
    "tb-setup",
  );
  const solver = new Solver();
  solver.set(
    "timeout",
    Math.max(100, Math.min(input.timeoutMs ?? 2000, 10000)),
  );
  const roles = Array.from({ length: n }, (_, i) => Int.const(`seat_${i + 1}`));
  const shownTokens = Array.from({ length: n }, (_, i) =>
    Int.const(`shown_${i + 1}`),
  );
  for (const role of roles) solver.add(role.ge(0), role.lt(ROLES.length));
  for (const token of shownTokens)
    solver.add(token.ge(0), token.lt(ROLES.length));
  solver.add(Distinct(...roles));
  const isRole = (seat: number, role: Role) =>
    roles[seat - 1].eq(roleIndex.get(role)!);
  const hasTeam = (role: (typeof roles)[number], team: Team) =>
    Or(
      ...ROLES.flatMap((id, index) =>
        ROLE_TEAM[id] === team ? [role.eq(index)] : [],
      ),
    );
  const countTeam = (team: Team) => {
    const terms = roles.map((role) => If(hasTeam(role, team), 1, 0));
    return Sum(terms[0], ...terms.slice(1));
  };
  const baron = Or(...roles.map((role) => role.eq(roleIndex.get("Baron")!)));
  solver.add(
    countTeam("townsfolk").eq(Sum(Int.val(base.townsfolk), If(baron, -2, 0))),
  );
  solver.add(
    countTeam("outsider").eq(Sum(Int.val(base.outsider), If(baron, 2, 0))),
  );
  solver.add(countTeam("minion").eq(base.minion));
  solver.add(countTeam("demon").eq(1));
  // Every player except Drunk sees their actual character. Drunk sees one
  // Townsfolk token that was not put into play as anyone's actual character.
  for (const [index, token] of shownTokens.entries()) {
    const drunkToken = Or(
      ...TOWNSFOLK.map((townsfolk) => {
        const id = roleIndex.get(townsfolk)!;
        return And(
          token.eq(id),
          Not(Or(...roles.map((actual) => actual.eq(id)))),
        );
      }),
    );
    solver.add(
      Or(
        And(roles[index].eq(roleIndex.get("Drunk")!), drunkToken),
        And(
          Not(roles[index].eq(roleIndex.get("Drunk")!)),
          token.eq(roles[index]),
        ),
      ),
    );
  }
  for (const token of input.tokenFacts ?? [])
    solver.add(shownTokens[token.seat - 1].eq(roleIndex.get(token.shownRole)!));
  for (const fact of input.facts) solver.add(isRole(fact.seat, fact.role));
  if (observedInput) {
    const poisonerInSetup = Or(
      ...roles.map((role) => role.eq(roleIndex.get("Poisoner")!)),
    );
    for (const phase of observedInput.phases) {
      if (phase.kind !== "night" || phase.cycle === 1) continue;
      for (const deadSeat of phase.deaths) {
        // In Trouble Brewing a real Soldier can die to the Imp only if
        // Poisoner has disabled the Soldier ability. The replay still checks
        // whether that Poisoner is alive and acts at the right time.
        solver.add(Or(Not(isRole(deadSeat, "Soldier")), poisonerInSetup));
      }
    }
  }
  if (input.nightOnePoisoner)
    solver.add(isRole(input.nightOnePoisoner.seat, "Poisoner"));
  const isPoisoned = (seat: number) => input.nightOnePoisoner?.target === seat;

  // Registration is scoped to an interaction. For Chef, each adjacent pair is
  // a separate check; the same Recluse may register differently in both pairs.
  const evilChoices: {
    interaction: string;
    seat: number;
    term: ReturnType<typeof Bool.const>;
  }[] = [];
  const registeredEvil = (seat: number, interaction: string) => {
    const actual = roles[seat - 1];
    const optional = And(
      Bool.val(!isPoisoned(seat)),
      Or(isRole(seat, "Spy"), isRole(seat, "Recluse")),
    );
    const evil = Or(hasTeam(actual, "minion"), hasTeam(actual, "demon"));
    const term = Bool.const(`evil_${interaction}_${seat}`);
    evilChoices.push({ interaction, seat, term });
    return If(optional, term, evil);
  };
  const redHerring = Int.const("red_herring_zero_based");
  const needsRedHerring =
    reports.some(
      (r) =>
        r.kind === "fortune_teller" && r.acceptedMessage && r.abilityActive,
    ) ||
    (observedInput?.laterReports ?? []).some(
      (r) =>
        r.kind === "fortune_teller" && r.acceptedMessage && r.abilityActive,
    );
  if (needsRedHerring) {
    solver.add(redHerring.ge(0), redHerring.lt(n));
    solver.add(
      Or(
        ...roles.map((role, index) =>
          And(
            redHerring.eq(index),
            Or(hasTeam(role, "townsfolk"), hasTeam(role, "outsider")),
          ),
        ),
      ),
    );
  }
  for (const [index, report] of reports.entries()) {
    const ability: Role =
      report.kind === "pair_role"
        ? report.ability
        : report.kind === "librarian_zero"
          ? "Librarian"
          : report.kind === "chef"
            ? "Chef"
            : report.kind === "empath"
              ? "Empath"
              : "Fortune Teller";
    if (report.abilityActive) {
      solver.add(isRole(report.speaker, ability));
      if (
        input.nightOnePoisoner &&
        report.speaker === input.nightOnePoisoner.target
      )
        solver.add(Bool.val(false));
    }
    if (!report.abilityActive || !report.acceptedMessage) continue;
    if (report.kind === "librarian_zero") {
      // Zero is about this information interaction, not the actual setup bag.
      // A healthy Recluse may register as a Minion/Demon to the Librarian.
      solver.add(
        ...roles.map((actual, position) =>
          Or(
            Not(hasTeam(actual, "outsider")),
            And(
              Bool.val(!isPoisoned(position + 1)),
              isRole(position + 1, "Recluse"),
            ),
          ),
        ),
      );
    } else if (report.kind === "pair_role") {
      const special: Role =
        report.ability === "Investigator" ? "Recluse" : "Spy";
      solver.add(
        Or(
          ...report.targets.map((seat) =>
            Or(
              isRole(seat, report.seenRole),
              And(Bool.val(!isPoisoned(seat)), isRole(seat, special)),
            ),
          ),
        ),
      );
    } else if (report.kind === "chef") {
      const terms = Array.from({ length: n }, (_, position) => {
        const left = position + 1,
          right = ((position + 1) % n) + 1;
        return If(
          And(
            registeredEvil(left, `chef_${index}_${position}_left`),
            registeredEvil(right, `chef_${index}_${position}_right`),
          ),
          1,
          0,
        );
      });
      solver.add(Sum(terms[0], ...terms.slice(1)).eq(report.count));
    } else if (report.kind === "empath") {
      const left = report.speaker === 1 ? n : report.speaker - 1;
      const right = report.speaker === n ? 1 : report.speaker + 1;
      solver.add(
        Sum(
          If(registeredEvil(left, `empath_${index}_left`), 1, 0),
          If(registeredEvil(right, `empath_${index}_right`), 1, 0),
        ).eq(report.count),
      );
    } else {
      const detects = report.targets.map((seat) =>
        Or(
          isRole(seat, "Imp"),
          redHerring.eq(seat - 1),
          And(
            isRole(seat, "Recluse"),
            Bool.val(!isPoisoned(seat)),
            Bool.const(`ft_recluse_${index}_${seat}`),
          ),
        ),
      );
      const yes = Or(...detects);
      solver.add(report.yes ? yes : Not(yes));
    }
  }

  const witness = (): SetupWitness => {
    const model = solver.model();
    const assignment = roles.map(
      (term) => ROLES[Number(model.eval(term).toString())],
    );
    const shown = shownTokens.map(
      (term) => ROLES[Number(model.eval(term).toString())],
    );
    const rh = needsRedHerring
      ? Number(model.eval(redHerring).toString()) + 1
      : undefined;
    const registrations: RegistrationChoice[] = evilChoices.flatMap(
      ({ interaction, seat, term }) =>
        !isPoisoned(seat) &&
        (assignment[seat - 1] === "Spy" || assignment[seat - 1] === "Recluse")
          ? [
              {
                interaction,
                seat,
                evil: model.eval(term).toString() === "true",
              },
            ]
          : [],
    );
    for (const [index, report] of reports.entries()) {
      if (!report.abilityActive || !report.acceptedMessage) continue;
      if (report.kind === "librarian_zero") {
        for (const [position, actual] of assignment.entries()) {
          if (actual === "Recluse" && !isPoisoned(position + 1))
            registrations.push({
              interaction: `librarian_zero_${index}`,
              seat: position + 1,
              role: "Poisoner",
            });
        }
      } else if (report.kind === "pair_role") {
        const alreadyTrue = report.targets.some(
          (seat) => assignment[seat - 1] === report.seenRole,
        );
        if (!alreadyTrue) {
          const special = report.ability === "Investigator" ? "Recluse" : "Spy";
          const seat = report.targets.find(
            (target) =>
              !isPoisoned(target) && assignment[target - 1] === special,
          );
          if (seat)
            registrations.push({
              interaction: `pair_${index}`,
              seat,
              role: report.seenRole,
            });
        }
      } else if (report.kind === "fortune_teller") {
        for (const seat of report.targets) {
          if (assignment[seat - 1] === "Recluse" && !isPoisoned(seat)) {
            const alreadyYes = report.targets.some(
              (target) => assignment[target - 1] === "Imp" || target === rh,
            );
            registrations.push({
              interaction: `ft_${index}`,
              seat,
              ...(report.yes && !alreadyYes ? { role: "Imp" as Role } : {}),
            });
          }
        }
      }
    }
    return {
      roles: assignment,
      shownTokens: shown,
      ...(rh ? { redHerringSeat: rh } : {}),
      ...(input.nightOnePoisoner
        ? { nightOnePoisoner: input.nightOnePoisoner }
        : {}),
      registrations,
    };
  };

  if (timelineInput || observedInput) {
    const maxWorlds = (timelineInput ?? observedInput)?.maxWorlds ?? 1000;
    let inspected = 0;
    const sameSet = (a: number[], b: number[]) => {
      const expected = [...b].sort((x, y) => x - y);
      return (
        a.length === expected.length &&
        [...a]
          .sort((x, y) => x - y)
          .every((seat, index) => seat === expected[index])
      );
    };
    const matches = (candidate: SetupWitness) => {
      if (!timelineInput) return { status: "unknown" as const };
      const replay = replayTimeline({
        initialPlayers: candidate.roles.map((actualRole, index) => ({
          seat: index + 1,
          actualRole,
          shownToken: candidate.shownTokens[index],
        })),
        phases: timelineInput.timeline,
      });
      if (replay.status === "unsupported")
        return { status: "unknown" as const };
      if (replay.status !== "ok") return { status: "invalid" as const };
      for (const [index, observation] of timelineInput.observations.entries()) {
        const trace = replay.traces[index];
        if (
          observation.deaths !== undefined &&
          !sameSet(trace.deaths, observation.deaths)
        )
          return { status: "invalid" as const };
        if (
          observation.executedSeat !== undefined &&
          (timelineInput.timeline[index].kind !== "day" ||
            !("executedSeat" in trace) ||
            trace.executedSeat !== observation.executedSeat)
        )
          return { status: "invalid" as const };
        if (
          observation.winner !== undefined &&
          (trace.state.winner ?? null) !== observation.winner
        )
          return { status: "invalid" as const };
      }
      return { status: "valid" as const, replay };
    };
    const find = async (
      proposition: ReturnType<typeof isRole>,
      expectedCurrent?: boolean,
    ) => {
      while (inspected < maxWorlds && Date.now() < deadline) {
        const status = await solver.check(proposition);
        if (status === "unsat") return { status } as const;
        if (status !== "sat")
          return { status: "unknown", reason: "solver_unknown" } as const;
        const candidate = witness();
        inspected++;
        const firstNight = replayFirstNight(input, candidate);
        if (!firstNight.valid)
          throw new Error(`求解见证重放失败：${firstNight.errors.join("；")}`);
        const observedVerdict = observedInput
          ? matchObservedTimeline(
              candidate,
              observedInput,
              input,
              deadline,
              expectedCurrent === undefined || !observedInput.currentQuery
                ? undefined
                : (state) =>
                    (state.roles[observedInput.currentQuery!.seat - 1] ===
                      observedInput.currentQuery!.role) ===
                    expectedCurrent,
              expectedCurrent === undefined || !observedInput.currentQuery
                ? undefined
                : { ...observedInput.currentQuery, expected: expectedCurrent },
            )
          : null;
        const timelineVerdict = observedVerdict ? null : matches(candidate);
        const verdict = observedVerdict
          ? observedVerdict.status === "valid"
            ? "valid"
            : observedVerdict.status === "invalid"
              ? "invalid"
              : "unknown"
          : timelineVerdict?.status;
        if (verdict === "valid") {
          const answer: SetupWitness =
            observedVerdict?.status === "valid"
              ? {
                  ...candidate,
                  timeline: observedVerdict.timeline,
                  currentRoles: observedVerdict.finalRoles,
                  currentAlive: observedVerdict.finalAlive,
                  currentAlignments: observedVerdict.finalAlignments,
                  registrations: [
                    ...candidate.registrations,
                    ...observedVerdict.registrations,
                  ],
                  ...(observedVerdict.timeline[0]?.kind === "night" &&
                  observedVerdict.timeline[0].actions.poisonerTarget !==
                    undefined
                    ? {
                        nightOnePoisoner: {
                          seat: candidate.roles.indexOf("Poisoner") + 1,
                          target:
                            observedVerdict.timeline[0].actions.poisonerTarget,
                        },
                      }
                    : {}),
                }
              : timelineVerdict?.status === "valid" && timelineInput
                ? {
                    ...candidate,
                    timeline: timelineInput.timeline,
                    currentRoles: timelineVerdict.replay.state.roles,
                    currentAlive: [...timelineVerdict.replay.state.alive],
                    currentAlignments: copyAlignments(
                      timelineVerdict.replay.state,
                    ),
                    registrations: [
                      ...candidate.registrations,
                      ...timelineVerdict.replay.traces.flatMap(
                        (trace, phaseIndex) => [
                          ...scarletRegistrationChoices(trace, phaseIndex),
                          ...impSuccessorRegistrationChoices(trace, phaseIndex),
                        ],
                      ),
                    ],
                  }
                : candidate;
          if (observedInput) {
            const replay = replayObservedWitness(
              answer,
              observedInput,
              input,
              observedInput.currentQuery,
              expectedCurrent,
            );
            if (!replay.valid)
              throw new Error(`动态见证重放失败：${replay.errors.join("；")}`);
          }
          return { status: "sat", witness: answer } as const;
        }
        if (verdict === "unknown")
          return {
            status: "unknown",
            reason:
              observedVerdict?.status === "unknown"
                ? observedVerdict.reason
                : "unsupported_replay",
          } as const;
        solver.add(
          Not(
            And(
              ...roles.map((term, index) =>
                term.eq(roleIndex.get(candidate.roles[index])!),
              ),
              ...(needsRedHerring && candidate.redHerringSeat
                ? [redHerring.eq(candidate.redHerringSeat - 1)]
                : []),
            ),
          ),
        );
      }
      return {
        status: "unknown",
        reason: inspected >= maxWorlds ? "candidate_limit" : "time_budget",
      } as const;
    };
    const queryFact = observedInput?.currentQuery ?? input.query;
    const phi = isRole(queryFact.seat, queryFact.role);
    // No death means no Imp succession, so current and setup roles are equal.
    const current = Boolean(
      observedInput?.currentQuery &&
      observedInput.phases.some((phase) => phase.deaths.length > 0),
    );
    solver.push();
    const yesResult = await find(
      current ? Bool.val(true) : phi,
      current ? true : undefined,
    );
    solver.pop();
    solver.push();
    const noResult = await find(
      current ? Bool.val(true) : (Not(phi) as ReturnType<typeof isRole>),
      current ? false : undefined,
    );
    solver.pop();
    const yes = "witness" in yesResult ? yesResult.witness : undefined;
    const no = "witness" in noResult ? noResult.witness : undefined;
    // A one-sided UNSAT is decisive only after the opposite side has a valid
    // witness; otherwise the whole branch may still be inconsistent.
    const classification =
      yesResult.status === "unsat" && noResult.status === "unsat"
        ? "inconsistent"
        : yesResult.status === "unsat" && noResult.status === "sat"
          ? "impossible"
          : noResult.status === "unsat" && yesResult.status === "sat"
            ? "necessary"
            : yesResult.status === "sat" && noResult.status === "sat"
              ? "contingent"
              : "unknown";
    return {
      rulesetHash,
      scope,
      status:
        classification === "inconsistent"
          ? "unsat"
          : classification === "unknown" && !yes && !no
            ? "unknown"
            : "sat",
      classification,
      yes,
      no,
      inspectedCandidates: inspected,
      ...(classification === "unknown"
        ? {
            unknownReason:
              ("reason" in yesResult ? yesResult.reason : undefined) ??
              ("reason" in noResult ? noResult.reason : undefined),
          }
        : {}),
    };
  }

  const baseStatus = await solver.check();
  if (baseStatus === "unsat")
    return {
      rulesetHash,
      scope,
      status: "unsat",
      classification: "inconsistent",
    };
  if (baseStatus !== "sat")
    return {
      rulesetHash,
      scope,
      status: "unknown",
      classification: "unknown",
    };
  const phi = isRole(input.query.seat, input.query.role);
  const yesStatus = await solver.check(phi);
  const yes = yesStatus === "sat" ? witness() : undefined;
  const noStatus = await solver.check(Not(phi));
  const no = noStatus === "sat" ? witness() : undefined;
  for (const candidate of [yes, no]) {
    if (candidate) {
      const replay = replayFirstNight(input, candidate);
      if (!replay.valid)
        throw new Error(`求解见证重放失败：${replay.errors.join("；")}`);
    }
  }
  const classification =
    yesStatus === "unsat"
      ? "impossible"
      : noStatus === "unsat"
        ? "necessary"
        : yesStatus === "sat" && noStatus === "sat"
          ? "contingent"
          : "unknown";
  return {
    rulesetHash,
    scope,
    status: "sat",
    classification,
    yes,
    no,
  };
}
