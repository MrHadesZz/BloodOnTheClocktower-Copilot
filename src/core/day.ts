import type { Role } from "./model";
import { ROLE_TEAM } from "./setup";
import type { DynamicState } from "./night";
import { copyAlignments, validAlignments } from "./alignment";

export type DayEvent =
  | {
      kind: "slayer";
      actor: number;
      target: number;
      /** Required when a healthy Slayer targets a living Recluse. */
      recluseRegistersDemon?: boolean;
    }
  | {
      kind: "nomination";
      nominator: number;
      nominee: number;
      /** Votes actually counted. An illegal Butler vote is still counted. */
      votes: number[];
      /** Required when a healthy Virgin is first nominated by a Spy. */
      spyRegistersTownsfolk?: boolean;
      /** Observation only; Butler errors never remove a counted vote. */
      butlerMasterRaisedAtTally?: boolean;
      /** The master may already have been counted even if their hand is now down. */
      butlerMasterAlreadyCounted?: boolean;
    };
export interface DayActions {
  events: DayEvent[];
  /** Dead Recluses registering as an Imp specifically to Scarlet Woman. Omitted means native registration. */
  scarletRecluseRegistrations?: number[];
  /** Poison from the preceding night lasts through this day, while its source has ability. */
  poisonedSeat?: number | null;
  poisonSourceSeat?: number | null;
  /** A living Butler chooses this master during the preceding night. */
  butlerMasterSeat?: number | null;
}
export interface DayTrace {
  state: DynamicState;
  deaths: number[];
  executedSeat: number | null;
  /** A death caused by execution, excluding an earlier Slayer death of the same seat. */
  executionDeathSeat: number | null;
  executionCause: "vote" | "virgin" | null;
  endedAfterEventIndex: number | null;
  eventSteps: Array<{
    eventIndex: number;
    deaths: number[];
    executedSeat: number | null;
    aliveAfter: number;
    winner?: "good" | "evil";
  }>;
  nominationTallies: Array<{
    eventIndex: number;
    nominee: number;
    votes: number;
    aliveAtVote: number;
    threshold: number;
  }>;
  roleChanges: Array<{
    seat: number;
    from: Role;
    to: "Imp";
    reason: "scarlet_woman";
    registeredRecluseSeat?: number;
  }>;
  butlerVoteWarnings: string[];
  poisonAtDusk: number | null;
}
export type DayResult =
  | { status: "ok"; trace: DayTrace }
  | { status: "invalid" | "unsupported"; reason: string };

const validSeat = (seat: number, n: number) =>
  Number.isInteger(seat) && seat >= 1 && seat <= n;

/** Replay a complete, ordered Trouble Brewing day with explicit Storyteller choices. */
export function resolveDay(
  before: DynamicState,
  actions: DayActions,
): DayResult {
  const n = before.roles.length;
  if (
    n < 7 ||
    n > 15 ||
    before.alive.length !== n ||
    !validAlignments(before) ||
    before.winner ||
    before.alive.filter(Boolean).length < 3 ||
    before.roles.filter((role, index) => role === "Imp" && before.alive[index])
      .length < 1
  )
    return { status: "invalid", reason: "人数、存活表或终局状态无效。" };
  if (!Array.isArray(actions.events))
    return { status: "invalid", reason: "需要按顺序记录完整白天事件。" };
  const registeredDeaths = actions.scarletRecluseRegistrations ?? [];
  if (
    !Array.isArray(registeredDeaths) ||
    new Set(registeredDeaths).size !== registeredDeaths.length ||
    Array.from(registeredDeaths).some((seat) => !validSeat(seat, n))
  )
    return {
      status: "invalid",
      reason: "红唇女郎的隐士死亡注册包含无效或重复座位。",
    };
  const usedRegistrations = new Set<number>();
  const state: DynamicState = {
    roles: [...before.roles],
    alive: [...before.alive],
    alignments: copyAlignments(before),
    spentVirginSeats: [...(before.spentVirginSeats ?? [])],
    spentSlayerSeats: [...(before.spentSlayerSeats ?? [])],
    spentDeadVotes: [...(before.spentDeadVotes ?? [])],
  };
  const source = actions.poisonSourceSeat ?? null;
  const poison = actions.poisonedSeat ?? null;
  if ((source === null) !== (poison === null))
    return { status: "invalid", reason: "中毒目标与来源必须一起记录。" };
  if (
    source !== null &&
    (!validSeat(source, n) ||
      !validSeat(poison!, n) ||
      !state.alive[source - 1] ||
      state.roles[source - 1] !== "Poisoner")
  )
    return { status: "invalid", reason: "白天中毒来源不是存活的投毒者。" };
  const butler =
    state.roles.findIndex((role, i) => role === "Butler" && state.alive[i]) + 1;
  const master = actions.butlerMasterSeat ?? null;
  if (butler && (master === null || !validSeat(master, n) || master === butler))
    return { status: "invalid", reason: "存活的男仆必须有非自身主人。" };
  if (!butler && master !== null)
    return { status: "invalid", reason: "没有存活的男仆却记录了主人。" };
  const aliveCount = () => state.alive.filter(Boolean).length;
  const active = (seat: number) =>
    !(
      source !== null &&
      state.alive[source - 1] &&
      state.roles[source - 1] === "Poisoner" &&
      seat === poison
    );
  const deaths: number[] = [];
  const nominationTallies: DayTrace["nominationTallies"] = [];
  const roleChanges: DayTrace["roleChanges"] = [];
  const butlerVoteWarnings: string[] = [];
  const nominators = new Set<number>();
  const nominees = new Set<number>();
  const fail = (reason: string): DayResult => ({ status: "invalid", reason });
  const demonDeath = (seat: number, preDeathAlive: number) => {
    const actualDemon = state.roles[seat - 1] === "Imp";
    const scarlet =
      state.roles.findIndex(
        (role, i) =>
          role === "Scarlet Woman" && state.alive[i] && active(i + 1),
      ) + 1;
    const registeredRecluse =
      state.roles[seat - 1] === "Recluse" &&
      active(seat) &&
      scarlet &&
      preDeathAlive >= 5 &&
      registeredDeaths.includes(seat);
    if (!actualDemon && !registeredRecluse) return;
    if (registeredRecluse) usedRegistrations.add(seat);
    if (scarlet && preDeathAlive >= 5) {
      state.roles[scarlet - 1] = "Imp";
      roleChanges.push({
        seat: scarlet,
        from: "Scarlet Woman",
        to: "Imp",
        reason: "scarlet_woman",
        ...(registeredRecluse ? { registeredRecluseSeat: seat } : {}),
      });
    } else if (
      !state.roles.some((role, index) => role === "Imp" && state.alive[index])
    )
      state.winner = "good";
  };
  let immediateExecution: number | null = null;
  let executionDeathSeat: number | null = null;
  let executionCause: DayTrace["executionCause"] = null;
  let endedAfterEventIndex: number | null = null;
  const eventSteps: DayTrace["eventSteps"] = [];
  for (const [eventIndex, event] of actions.events.entries()) {
    if (state.winner || immediateExecution !== null)
      return fail("终局或处女能力立即处决后不可再记录白天行动。");
    const deathOffset = deaths.length;
    const finishEvent = () => {
      eventSteps.push({
        eventIndex,
        deaths: deaths.slice(deathOffset),
        executedSeat: immediateExecution,
        aliveAfter: aliveCount(),
        ...(state.winner ? { winner: state.winner } : {}),
      });
      if (state.winner || immediateExecution !== null)
        endedAfterEventIndex = eventIndex;
    };
    if (event.kind === "slayer") {
      if (!validSeat(event.actor, n) || !validSeat(event.target, n))
        return fail("杀手行动包含无效座位。");
      const actual =
        state.roles[event.actor - 1] === "Slayer" &&
        state.alive[event.actor - 1];
      if (!actual) {
        if (event.recluseRegistersDemon !== undefined)
          return fail("非存活杀手的公开宣称不能携带真实注册选择。");
        finishEvent();
        continue;
      }
      if (state.spentSlayerSeats!.includes(event.actor))
        return fail("同一杀手不能再次发动已用过的能力。");
      state.spentSlayerSeats!.push(event.actor);
      if (!active(event.actor) || !state.alive[event.target - 1]) {
        finishEvent();
        continue;
      }
      const targetRole = state.roles[event.target - 1];
      const recluseCanRegister =
        targetRole === "Recluse" && active(event.target);
      if (recluseCanRegister && event.recluseRegistersDemon === undefined)
        return {
          status: "unsupported",
          reason: "杀手指定隐士时必须记录其在此互动是否注册为恶魔。",
        };
      if (!recluseCanRegister && event.recluseRegistersDemon !== undefined)
        return fail("隐士注册选择只能用于真实隐士目标。");
      if (
        targetRole === "Imp" ||
        (recluseCanRegister && event.recluseRegistersDemon)
      ) {
        const count = aliveCount();
        state.alive[event.target - 1] = false;
        deaths.push(event.target);
        demonDeath(event.target, count);
        if (!state.winner && aliveCount() <= 2) state.winner = "evil";
      }
      finishEvent();
      continue;
    }
    if (
      !validSeat(event.nominator, n) ||
      !validSeat(event.nominee, n) ||
      !state.alive[event.nominator - 1] ||
      nominators.has(event.nominator) ||
      nominees.has(event.nominee)
    )
      return fail("提名者或被提名者无效，或同日重复提名。");
    if (!Array.isArray(event.votes)) return fail("提名必须记录完整投票集合。");
    nominators.add(event.nominator);
    nominees.add(event.nominee);
    const firstVirgin =
      state.roles[event.nominee - 1] === "Virgin" &&
      state.alive[event.nominee - 1] &&
      !state.spentVirginSeats!.includes(event.nominee);
    if (firstVirgin) {
      state.spentVirginSeats!.push(event.nominee);
      if (active(event.nominee)) {
        const nominatorRole = state.roles[event.nominator - 1];
        const spyCanRegister =
          nominatorRole === "Spy" && active(event.nominator);
        if (spyCanRegister && event.spyRegistersTownsfolk === undefined)
          return {
            status: "unsupported",
            reason: "间谍首次提名健康处女时必须记录此互动的注册选择。",
          };
        if (!spyCanRegister && event.spyRegistersTownsfolk !== undefined)
          return fail("间谍注册选择只能用于真实间谍提名者。");
        const triggers = spyCanRegister
          ? event.spyRegistersTownsfolk
          : ROLE_TEAM[nominatorRole] === "townsfolk";
        if (triggers) {
          if (event.votes.length)
            return fail("处女能力立即处决时不会再举行投票。");
          const count = aliveCount();
          state.alive[event.nominator - 1] = false;
          deaths.push(event.nominator);
          immediateExecution = event.nominator;
          executionDeathSeat = event.nominator;
          executionCause = "virgin";
          demonDeath(event.nominator, count);
          if (
            state.roles[event.nominator - 1] === "Saint" &&
            active(event.nominator)
          )
            state.winner = "evil";
          if (!state.winner && aliveCount() <= 2) state.winner = "evil";
          finishEvent();
          continue;
        }
      } else if (event.spyRegistersTownsfolk !== undefined)
        return fail("中毒的处女没有可用的间谍注册判定。");
    } else if (event.spyRegistersTownsfolk !== undefined)
      return fail("此提名没有可用的处女注册判定。");
    const voteSet = new Set(event.votes);
    if (
      voteSet.size !== event.votes.length ||
      event.votes.some((seat) => !validSeat(seat, n))
    )
      return fail("投票包含重复或无效座位。");
    for (const voter of event.votes) {
      if (!state.alive[voter - 1]) {
        if (state.spentDeadVotes!.includes(voter))
          return fail("已用过遗言票的死者不能再投票。");
        state.spentDeadVotes!.push(voter);
      }
    }
    if (
      butler &&
      event.votes.includes(butler) &&
      active(butler) &&
      event.butlerMasterRaisedAtTally === false &&
      event.butlerMasterAlreadyCounted !== true
    )
      butlerVoteWarnings.push(
        `${butler}号男仆的主人在其计票时未举手；按官方规则该票仍计入。`,
      );
    nominationTallies.push({
      eventIndex,
      nominee: event.nominee,
      votes: event.votes.length,
      aliveAtVote: aliveCount(),
      threshold: Math.ceil(aliveCount() / 2),
    });
    finishEvent();
  }
  let executedSeat = immediateExecution;
  if (!state.winner && executedSeat === null && nominationTallies.length) {
    const high = Math.max(...nominationTallies.map((item) => item.votes));
    const leaders = nominationTallies.filter((item) => item.votes === high);
    if (leaders.length === 1 && high >= leaders[0].threshold) {
      executedSeat = leaders[0].nominee;
      executionCause = "vote";
      if (state.alive[executedSeat - 1]) {
        const count = aliveCount();
        state.alive[executedSeat - 1] = false;
        deaths.push(executedSeat);
        executionDeathSeat = executedSeat;
        const role = state.roles[executedSeat - 1];
        if (role === "Saint" && active(executedSeat)) state.winner = "evil";
        else demonDeath(executedSeat, count);
        if (!state.winner && aliveCount() <= 2) state.winner = "evil";
      }
    }
  }
  if (!state.winner && executedSeat === null && aliveCount() === 3) {
    const mayor = state.roles.findIndex(
      (role, i) => role === "Mayor" && state.alive[i] && active(i + 1),
    );
    if (mayor >= 0) state.winner = "good";
  }
  if (registeredDeaths.some((seat) => !usedRegistrations.has(seat)))
    return fail(
      "红唇女郎的隐士注册只能用于健康隐士实际死亡且满足继任条件的本次判定。",
    );
  return {
    status: "ok",
    trace: {
      state,
      deaths,
      executedSeat,
      executionDeathSeat,
      executionCause,
      endedAfterEventIndex,
      eventSteps,
      nominationTallies,
      roleChanges,
      butlerVoteWarnings,
      poisonAtDusk: null,
    },
  };
}
