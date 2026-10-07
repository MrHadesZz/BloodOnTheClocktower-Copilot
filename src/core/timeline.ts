import { resolveDay, type DayEvent, type DayTrace } from "./day";
import {
  resolveNight,
  type DynamicState,
  type NightActions,
  type NightTrace,
} from "./night";
import { validateInitialSetup, type InitialPlayer } from "./setup";
import { initialAlignments } from "./alignment";

export type TimelinePhase =
  | {
      kind: "night";
      actions: Omit<NightActions, "previousDayExecutionDeathSeat">;
    }
  | { kind: "day"; events: DayEvent[]; scarletRecluseRegistrations?: number[] };
export interface TimelineInput {
  initialPlayers: InitialPlayer[];
  /** Complete phases in N1, D1, N2, D2 order. Omission means no observed events in that complete phase. */
  phases: TimelinePhase[];
}
export type TimelineResult =
  | { status: "ok"; state: DynamicState; traces: Array<NightTrace | DayTrace> }
  | { status: "invalid" | "unsupported"; phaseIndex: number; reason: string };

/** Evidence for each independently chosen Recluse registration to Scarlet Woman. */
export function scarletRegistrationChoices(
  trace: NightTrace | DayTrace,
  phaseIndex: number,
) {
  return trace.roleChanges.flatMap((change) =>
    change.registeredRecluseSeat === undefined
      ? []
      : [
          {
            interaction: `scarlet_woman_${phaseIndex % 2 === 0 ? "n" : "d"}${Math.floor(phaseIndex / 2) + 1}_${change.seat}`,
            seat: change.registeredRecluseSeat,
            role: "Imp" as const,
          },
        ],
  );
}

/** Multiple attacks in a night need the transferring Imp in the receipt key. */
export function impSuccessorRegistrationChoices(
  trace: NightTrace | DayTrace,
  phaseIndex: number,
) {
  if (!("impSteps" in trace)) return [];
  return trace.roleChanges.flatMap((change) =>
    change.from !== "Recluse"
      ? []
      : [
          {
            interaction: `imp_successor_n${Math.floor(phaseIndex / 2) + 1}${
              "impSteps" in trace && trace.impSteps.length > 1
                ? `_${change.sourceImpSeat}`
                : ""
            }`,
            seat: change.seat,
            role: "Poisoner" as const,
          },
        ],
  );
}

/** Concrete oracle for a fully specified world history; it does not infer hidden actions. */
export function replayTimeline(input: TimelineInput): TimelineResult {
  const validation = validateInitialSetup(input.initialPlayers);
  if (!validation.valid)
    return {
      status: "invalid",
      phaseIndex: 0,
      reason: validation.errors.join("；"),
    };
  const initial = [...input.initialPlayers].sort((a, b) => a.seat - b.seat);
  let state: DynamicState = {
    roles: initial.map((player) => player.actualRole),
    alignments: initialAlignments(initial.map((player) => player.actualRole)),
    alive: initial.map(() => true),
    spentVirginSeats: [],
    spentSlayerSeats: [],
    spentDeadVotes: [],
  };
  const traces: Array<NightTrace | DayTrace> = [];
  let lastNight: NightTrace | null = null;
  let lastDay: DayTrace | null = null;
  for (const [index, phase] of input.phases.entries()) {
    const expected = index % 2 === 0 ? "night" : "day";
    if (state.winner)
      return {
        status: "invalid",
        phaseIndex: index,
        reason: "终局后不能继续记录阶段。",
      };
    if (phase.kind !== expected)
      return {
        status: "invalid",
        phaseIndex: index,
        reason: `第${index + 1}阶段应为${expected}。`,
      };
    if (phase.kind === "night") {
      const cycle = Math.floor(index / 2) + 1;
      if (phase.actions.cycle !== cycle)
        return {
          status: "invalid",
          phaseIndex: index,
          reason: "夜晚编号与时间线顺序不符。",
        };
      const previousDayExecutionDeathSeat = lastDay?.executionDeathSeat ?? null;
      const result = resolveNight(state, {
        ...phase.actions,
        ...(cycle > 1 ? { previousDayExecutionDeathSeat } : {}),
      });
      if (result.status !== "ok")
        return {
          status: result.status,
          phaseIndex: index,
          reason: result.reason,
        };
      lastNight = result.trace;
      state = result.trace.state;
      traces.push(result.trace);
    } else {
      if (!lastNight)
        return {
          status: "invalid",
          phaseIndex: index,
          reason: "缺少前一夜状态。",
        };
      const result = resolveDay(state, {
        events: phase.events,
        scarletRecluseRegistrations: phase.scarletRecluseRegistrations,
        poisonedSeat: lastNight.poisonedAtInformationStep,
        poisonSourceSeat: lastNight.poisonSourceSeat,
        butlerMasterSeat: lastNight.butlerMasterSeat,
      });
      if (result.status !== "ok")
        return {
          status: result.status,
          phaseIndex: index,
          reason: result.reason,
        };
      lastDay = result.trace;
      state = result.trace.state;
      traces.push(result.trace);
    }
  }
  return { status: "ok", state, traces };
}
