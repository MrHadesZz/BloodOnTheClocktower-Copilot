import type { Role } from "./model";
import { ROLE_TEAM } from "./setup";
import { copyAlignments, validAlignments, type Alignment } from "./alignment";

export interface DynamicState {
  roles: Role[];
  alive: boolean[];
  /** Actual alignment persists through character changes; separate from registration. */
  alignments?: Alignment[];
  winner?: "good" | "evil";
  spentVirginSeats?: number[];
  spentSlayerSeats?: number[];
  spentDeadVotes?: number[];
}
export interface NightActions {
  cycle: number;
  /** Complete order of the Imps alive at dusk. New Imps wait until next night. */
  impActions?: ImpAction[];
  /** Recluse registering as Imp on death, only for Scarlet Woman's own interaction. */
  scarletRecluseRegistration?: number;
  poisonerTarget?: number;
  monkTarget?: number;
  impTarget?: number;
  /** Butler chooses a non-self master after the Demon action if still alive. */
  butlerMasterSeat?: number;
  /** Required when a healthy Ravenkeeper dies this night. */
  ravenkeeperTarget?: number;
  /** Optional Spy/Recluse character registration for Ravenkeeper information. */
  ravenkeeperRegistrationRole?: Role;
  /** The player who died by execution on the preceding day, or null for none. */
  previousDayExecutionDeathSeat?: number | null;
  /** Optional Spy/Recluse registration for the Undertaker display. */
  undertakerRegistrationRole?: Role;
  /** If Mayor is attacked, omit to let Mayor die; otherwise choose another player. */
  mayorRedirectTarget?: number;
  /** Storyteller's choice when Imp kills itself and Scarlet Woman does not take priority. */
  impSuccessorSeat?: number;
}
export interface ImpAction {
  actor: number;
  target?: number;
  /** A queued Imp that died earlier, or whose turn follows the end of the game. */
  skipReason?: "dead" | "game_over";
  mayorRedirectTarget?: number;
  impSuccessorSeat?: number;
  scarletRecluseRegistration?: number;
}
export interface ImpConditions {
  poisonedSeat: number | null;
  protectedSeat: number | null;
  poisonerSeat: number | null;
  monkSeat: number | null;
}
export interface RavenkeeperDeath {
  speaker: number;
  impActionIndex: number;
  sourceImpSeat: number;
  poisonedSeat: number | null;
  poisonSourceSeat: number | null;
  roles: Role[];
  gameOver: boolean;
}
export interface NightTrace {
  state: DynamicState;
  deaths: number[];
  poisonedAtInformationStep: number | null;
  protectedSeat: number | null;
  poisonSourceSeat: number | null;
  butlerMasterSeat: number | null;
  ravenkeeperInfo: { speaker: number; target: number; seenRole: Role } | null;
  /** Fixed when the night-death ability triggers, before later Imp actions. */
  ravenkeeperDeath: RavenkeeperDeath | null;
  undertakerInfo: {
    speaker: number;
    executedSeat: number;
    seenRole: Role;
  } | null;
  impSteps: Array<{
    actor: number;
    target: number | null;
    deathSeat: number | null;
    skipReason?: "dead" | "game_over";
  }>;
  roleChanges: Array<{
    seat: number;
    from: Role;
    to: Role;
    reason: string;
    registeredRecluseSeat?: number;
    sourceImpSeat?: number;
  }>;
}
export type NightResult =
  | { status: "ok"; trace: NightTrace }
  | { status: "invalid" | "unsupported"; reason: string };

const isSeat = (n: number, size: number) =>
  Number.isInteger(n) && n >= 1 && n <= size;
const livingRoleSeat = (state: DynamicState, role: Role) =>
  state.roles.findIndex(
    (value, index) => value === role && state.alive[index],
  ) + 1;
const aliveCount = (state: DynamicState) => state.alive.filter(Boolean).length;

export function ravenkeeperDeathAtStep(
  state: DynamicState,
  deaths: number[],
  conditions: ImpConditions,
  sourceImpSeat: number,
  impActionIndex: number,
): RavenkeeperDeath | null {
  const speaker = deaths.find(
    (seat) => state.roles[seat - 1] === "Ravenkeeper",
  );
  return speaker === undefined
    ? null
    : {
        speaker,
        impActionIndex,
        sourceImpSeat,
        poisonedSeat: conditions.poisonedSeat,
        poisonSourceSeat:
          conditions.poisonedSeat === null ? null : conditions.poisonerSeat,
        roles: [...state.roles],
        gameOver: Boolean(state.winner),
      };
}

function resolveRavenkeeperInformation(
  death: RavenkeeperDeath,
  actions: NightActions,
):
  | { status: "ok"; info: NightTrace["ravenkeeperInfo"] }
  | { status: "invalid"; reason: string } {
  if (death.gameOver || death.poisonedSeat === death.speaker)
    return { status: "ok", info: null };
  const target = actions.ravenkeeperTarget;
  if (target === undefined || !isSeat(target, death.roles.length))
    return { status: "invalid", reason: "健康守鸦人夜死时必须选择一位玩家。" };
  const seenRole = death.roles[target - 1];
  const registration = actions.ravenkeeperRegistrationRole;
  if (registration !== undefined) {
    const allowed =
      death.poisonedSeat !== target &&
      (seenRole === "Spy"
        ? ROLE_TEAM[registration] === "townsfolk" ||
          ROLE_TEAM[registration] === "outsider"
        : seenRole === "Recluse"
          ? ROLE_TEAM[registration] === "minion" ||
            ROLE_TEAM[registration] === "demon"
          : false);
    if (!allowed)
      return {
        status: "invalid",
        reason: "守鸦人目标在本次死亡时点不允许此角色注册。",
      };
  }
  return {
    status: "ok",
    info: {
      speaker: death.speaker,
      target,
      seenRole: registration ?? seenRole,
    },
  };
}

/** One attack, with source effects and victory resolved before the next Imp. */
export function resolveImpAction(
  before: DynamicState,
  action: ImpAction,
  conditions: ImpConditions,
):
  | {
      status: "ok";
      state: DynamicState;
      conditions: ImpConditions;
      deaths: number[];
      roleChanges: NightTrace["roleChanges"];
      step: NightTrace["impSteps"][number];
    }
  | { status: "invalid"; reason: string } {
  const state: DynamicState = {
    ...before,
    roles: [...before.roles],
    alive: [...before.alive],
    alignments: copyAlignments(before),
  };
  const current = { ...conditions };
  const invalid = (reason: string) => ({ status: "invalid" as const, reason });
  const actor = action.actor;
  if (!isSeat(actor, state.roles.length) || state.roles[actor - 1] !== "Imp")
    return invalid("行动者必须是本夜排队的小恶魔。");
  const skipReason = state.winner
    ? "game_over"
    : !state.alive[actor - 1]
      ? "dead"
      : undefined;
  if (skipReason) {
    if (
      action.skipReason !== skipReason ||
      Object.keys(action).some((key) => key !== "actor" && key !== "skipReason")
    )
      return invalid("跳过的小恶魔必须注明正确原因，不能记录目标或继任选择。");
    return {
      status: "ok",
      state,
      conditions: current,
      deaths: [],
      roleChanges: [],
      step: { actor, target: null, deathSeat: null, skipReason },
    };
  }
  if (action.skipReason !== undefined)
    return invalid("存活小恶魔在对局继续时必须行动，不能跳过。");
  const target = action.target;
  if (target === undefined || !isSeat(target, state.roles.length))
    return invalid("每个行动的小恶魔必须选择一个有效目标。");
  for (const choice of [
    action.impSuccessorSeat,
    action.scarletRecluseRegistration,
  ])
    if (choice !== undefined && !isSeat(choice, state.roles.length))
      return invalid("小恶魔继任或隐士死亡注册座位无效。");
  const active = (seat: number) => seat !== current.poisonedSeat;
  const guarded = (seat: number) =>
    seat === current.protectedSeat ||
    (state.roles[seat - 1] === "Soldier" && active(seat));
  let victim = target;
  if (action.mayorRedirectTarget !== undefined) {
    if (
      !state.alive[target - 1] ||
      state.roles[target - 1] !== "Mayor" ||
      !active(target) ||
      guarded(target) ||
      !active(actor)
    )
      return invalid("镇长仅在会被本次恶魔攻击杀死时才能转移死亡。");
    if (
      !isSeat(action.mayorRedirectTarget, state.roles.length) ||
      action.mayorRedirectTarget === target
    )
      return invalid("镇长转移必须指向另一位有效玩家。");
    victim = action.mayorRedirectTarget;
  }
  const deaths: number[] = [];
  const roleChanges: NightTrace["roleChanges"] = [];
  let usedScarletRegistration = false;
  let usedSuccessor = false;
  if (active(actor) && state.alive[victim - 1] && !guarded(victim)) {
    const count = aliveCount(state);
    state.alive[victim - 1] = false;
    deaths.push(victim);
    const scarlet = livingRoleSeat(state, "Scarlet Woman");
    if (
      state.roles[victim - 1] === "Recluse" &&
      active(victim) &&
      scarlet &&
      active(scarlet) &&
      count >= 5 &&
      action.scarletRecluseRegistration === victim
    ) {
      state.roles[scarlet - 1] = "Imp";
      usedScarletRegistration = true;
      roleChanges.push({
        seat: scarlet,
        from: "Scarlet Woman",
        to: "Imp",
        reason: "scarlet_woman",
        registeredRecluseSeat: victim,
        sourceImpSeat: actor,
      });
    }
    if (state.roles[victim - 1] === "Imp") {
      let successor = scarlet && active(scarlet) && count >= 5 ? scarlet : 0;
      if (
        successor &&
        action.impSuccessorSeat !== undefined &&
        action.impSuccessorSeat !== successor
      )
        return invalid("红唇女郎满足接任条件时必须优先成为Imp。");
      if (!successor && target === actor && victim === actor) {
        const candidates = state.roles.flatMap((role, index) =>
          state.alive[index] &&
          (ROLE_TEAM[role] === "minion" ||
            (role === "Recluse" && active(index + 1)))
            ? [index + 1]
            : [],
        );
        if (candidates.length) {
          if (
            action.impSuccessorSeat === undefined ||
            !candidates.includes(action.impSuccessorSeat)
          )
            return invalid("Imp自杀后必须指定一个存活爪牙接任。");
          successor = action.impSuccessorSeat;
        } else if (action.impSuccessorSeat !== undefined)
          return invalid("没有可接任的存活爪牙或健康隐士。");
      }
      if (successor) {
        usedSuccessor = true;
        const from = state.roles[successor - 1];
        state.roles[successor - 1] = "Imp";
        roleChanges.push({
          seat: successor,
          from,
          to: "Imp",
          sourceImpSeat: actor,
          reason:
            successor === scarlet && count >= 5 && active(scarlet)
              ? "scarlet_woman"
              : "imp_self_kill",
        });
      }
    }
  }
  if (action.impSuccessorSeat !== undefined && !usedSuccessor)
    return invalid("本次攻击没有合法的继任，不能指定接任者。");
  if (
    action.scarletRecluseRegistration !== undefined &&
    !usedScarletRegistration
  )
    return invalid(
      "红唇女郎的隐士注册只能用于健康隐士实际死亡且满足继任条件的本次判定。",
    );
  if (!livingRoleSeat(state, "Imp")) state.winner = "good";
  else if (aliveCount(state) <= 2) state.winner = "evil";
  if (
    current.poisonerSeat &&
    (!state.alive[current.poisonerSeat - 1] ||
      state.roles[current.poisonerSeat - 1] !== "Poisoner")
  )
    current.poisonedSeat = null;
  if (
    current.monkSeat &&
    (!state.alive[current.monkSeat - 1] ||
      state.roles[current.monkSeat - 1] !== "Monk" ||
      !active(current.monkSeat))
  )
    current.protectedSeat = null;
  return {
    status: "ok",
    state,
    conditions: current,
    deaths,
    roleChanges,
    step: { actor, target, deathSeat: deaths[0] ?? null },
  };
}

/** Deterministic replay of a fully specified Trouble Brewing night slice. */
export function resolveNight(
  before: DynamicState,
  actions: NightActions,
): NightResult {
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
  ) {
    return { status: "invalid", reason: "人数、存活表或终局状态无效。" };
  }
  if (!Number.isInteger(actions.cycle) || actions.cycle < 1) {
    return { status: "invalid", reason: "夜晚编号无效。" };
  }
  if (
    actions.scarletRecluseRegistration !== undefined &&
    !isSeat(actions.scarletRecluseRegistration, n)
  )
    return { status: "invalid", reason: "红唇女郎的隐士死亡注册座位无效。" };
  let state: DynamicState = {
    roles: [...before.roles],
    alive: [...before.alive],
    alignments: copyAlignments(before),
    spentVirginSeats: [...(before.spentVirginSeats ?? [])],
    spentSlayerSeats: [...(before.spentSlayerSeats ?? [])],
    spentDeadVotes: [...(before.spentDeadVotes ?? [])],
  };
  const validTarget = (target: number | undefined) =>
    target !== undefined && isSeat(target, n);
  const poisoner = livingRoleSeat(state, "Poisoner");
  const monk = livingRoleSeat(state, "Monk");
  const imp = livingRoleSeat(state, "Imp");
  if (!imp) return { status: "invalid", reason: "夜晚开始时没有存活的Imp。" };
  if (poisoner && !validTarget(actions.poisonerTarget))
    return {
      status: "invalid",
      reason: "存活的投毒者每夜必须选择一个有效目标。",
    };
  if (!poisoner && actions.poisonerTarget !== undefined)
    return { status: "invalid", reason: "没有存活的投毒者却记录了投毒行动。" };
  // In this single-source TB model a self-target latches poison for tonight
  // and tomorrow day. Dusk, source death, or source character change ends it.
  // Do not repeatedly toggle the effect because the source is its own target.
  let poisoned = actions.poisonerTarget ?? null;
  const active = (seat: number) => seat !== poisoned;
  const butlerChoice = (): number | NightResult => {
    const butler = livingRoleSeat(state, "Butler");
    if (!butler) {
      if (actions.butlerMasterSeat !== undefined)
        return { status: "invalid", reason: "没有存活男仆却记录了主人选择。" };
      return 0;
    }
    if (
      !validTarget(actions.butlerMasterSeat) ||
      actions.butlerMasterSeat === butler
    )
      return {
        status: "invalid",
        reason: "存活男仆每夜必须选择另一位玩家为主人。",
      };
    return actions.butlerMasterSeat!;
  };
  if (actions.cycle === 1) {
    if (actions.scarletRecluseRegistration !== undefined)
      return {
        status: "invalid",
        reason: "首夜没有隐士死亡后的红唇女郎判定。",
      };
    if (
      actions.previousDayExecutionDeathSeat !== undefined ||
      actions.undertakerRegistrationRole !== undefined
    )
      return { status: "invalid", reason: "首夜没有前一日处决信息。" };
    const butlerMaster = butlerChoice();
    if (typeof butlerMaster !== "number") return butlerMaster;
    if (
      actions.monkTarget !== undefined ||
      actions.impTarget !== undefined ||
      actions.impActions !== undefined ||
      actions.impSuccessorSeat !== undefined ||
      actions.mayorRedirectTarget !== undefined ||
      actions.ravenkeeperTarget !== undefined ||
      actions.ravenkeeperRegistrationRole !== undefined
    )
      return { status: "invalid", reason: "首夜僧侣和Imp均不行动。" };
    return {
      status: "ok",
      trace: {
        state,
        deaths: [],
        poisonedAtInformationStep: poisoned,
        protectedSeat: null,
        poisonSourceSeat: poisoner || null,
        butlerMasterSeat: butlerMaster || null,
        ravenkeeperInfo: null,
        ravenkeeperDeath: null,
        undertakerInfo: null,
        roleChanges: [],
        impSteps: [],
      },
    };
  }
  if (monk && !validTarget(actions.monkTarget))
    return { status: "invalid", reason: "存活的僧侣必须选择一个有效目标。" };
  if (!monk && actions.monkTarget !== undefined)
    return { status: "invalid", reason: "没有存活的僧侣却记录了保护行动。" };
  if (monk === actions.monkTarget)
    return { status: "invalid", reason: "僧侣不能保护自己。" };
  const startingImps = state.roles.flatMap((role, index) =>
    role === "Imp" && state.alive[index] ? [index + 1] : [],
  );
  const legacyChoices = [
    actions.impTarget,
    actions.mayorRedirectTarget,
    actions.impSuccessorSeat,
    actions.scarletRecluseRegistration,
  ];
  let queue: ImpAction[];
  if (actions.impActions !== undefined) {
    if (
      legacyChoices.some((value) => value !== undefined) ||
      !Array.isArray(actions.impActions) ||
      actions.impActions.length !== startingImps.length ||
      Array.from(actions.impActions).some(
        (action) => !action || !startingImps.includes(action.actor),
      ) ||
      new Set(actions.impActions.map((action) => action.actor)).size !==
        startingImps.length
    )
      return {
        status: "invalid",
        reason: "小恶魔行动顺序必须完整且唯一，不能混用单恶魔行动字段。",
      };
    queue = actions.impActions;
  } else {
    if (startingImps.length !== 1)
      return {
        status: "invalid",
        reason: "多个小恶魔必须分别提供完整行动顺序和目标。",
      };
    queue = [
      {
        actor: imp,
        target: actions.impTarget,
        mayorRedirectTarget: actions.mayorRedirectTarget,
        impSuccessorSeat: actions.impSuccessorSeat,
        scarletRecluseRegistration: actions.scarletRecluseRegistration,
      },
    ];
  }
  let conditions: ImpConditions = {
    poisonedSeat: poisoned,
    protectedSeat: monk && active(monk) ? actions.monkTarget! : null,
    poisonerSeat: poisoner || null,
    monkSeat: monk || null,
  };
  const deaths: number[] = [];
  const roleChanges: NightTrace["roleChanges"] = [];
  const impSteps: NightTrace["impSteps"] = [];
  let ravenkeeperInfo: NightTrace["ravenkeeperInfo"] = null;
  let ravenkeeperDeath: NightTrace["ravenkeeperDeath"] = null;
  for (const [actionIndex, action] of queue.entries()) {
    const result = resolveImpAction(state, action, conditions);
    if (result.status !== "ok") return result;
    state = result.state;
    conditions = result.conditions;
    deaths.push(...result.deaths);
    roleChanges.push(...result.roleChanges);
    impSteps.push(result.step);
    const death = ravenkeeperDeathAtStep(
      state,
      result.deaths,
      conditions,
      action.actor,
      actionIndex,
    );
    if (death) {
      ravenkeeperDeath = death;
      const information = resolveRavenkeeperInformation(death, actions);
      if (information.status !== "ok") return information;
      ravenkeeperInfo = information.info;
    }
  }
  poisoned = conditions.poisonedSeat;
  if (
    !ravenkeeperInfo &&
    (actions.ravenkeeperTarget !== undefined ||
      actions.ravenkeeperRegistrationRole !== undefined)
  )
    return {
      status: "invalid",
      reason: "守鸦人死亡时能力未有效触发，后续恢复不能补发有效信息。",
    };
  const undertaker = livingRoleSeat(state, "Undertaker");
  let undertakerInfo: NightTrace["undertakerInfo"] = null;
  if (undertaker && active(undertaker) && !state.winner) {
    if (actions.previousDayExecutionDeathSeat === undefined)
      return {
        status: "unsupported",
        reason: "健康送葬者需要完整的前一日处决死亡记录。",
      };
    const executed = actions.previousDayExecutionDeathSeat;
    if (executed !== null) {
      if (!isSeat(executed, n) || state.alive[executed - 1])
        return {
          status: "invalid",
          reason: "送葬者的处决死亡目标无效或仍存活。",
        };
      const actual = state.roles[executed - 1];
      const registered = actions.undertakerRegistrationRole;
      if (registered !== undefined) {
        const allowed =
          active(executed) &&
          (actual === "Spy"
            ? ROLE_TEAM[registered] === "townsfolk" ||
              ROLE_TEAM[registered] === "outsider"
            : actual === "Recluse"
              ? ROLE_TEAM[registered] === "minion" ||
                ROLE_TEAM[registered] === "demon"
              : false);
        if (!allowed)
          return {
            status: "invalid",
            reason: "送葬者目标不允许此角色注册选择。",
          };
      }
      undertakerInfo = {
        speaker: undertaker,
        executedSeat: executed,
        seenRole: registered ?? actual,
      };
    } else if (actions.undertakerRegistrationRole !== undefined)
      return {
        status: "invalid",
        reason: "无人因处决死亡时没有角色注册判定。",
      };
  } else if (actions.undertakerRegistrationRole !== undefined)
    return { status: "invalid", reason: "送葬者能力无效时没有角色注册判定。" };
  const butlerMaster = state.winner ? 0 : butlerChoice();
  if (typeof butlerMaster !== "number") return butlerMaster;
  const poisonedAtInformationStep = poisoned;
  return {
    status: "ok",
    trace: {
      state,
      deaths,
      poisonedAtInformationStep,
      protectedSeat: conditions.protectedSeat,
      poisonSourceSeat: poisonedAtInformationStep === null ? null : poisoner,
      butlerMasterSeat: butlerMaster || null,
      ravenkeeperInfo,
      ravenkeeperDeath,
      undertakerInfo,
      roleChanges,
      impSteps,
    },
  };
}
