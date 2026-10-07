import { ROLE_ZH } from "../core/model";
import type { SetupQueryResult, SetupWitness } from "../core/symbolicSetup";
import type { NightActions, NightTrace } from "../core/night";
import { replayTimeline } from "../core/timeline";
import type { DayEvent, DayTrace } from "../core/day";

function dayActionLabels(events: DayEvent[], trace: DayTrace): string[] {
  return events.map((event, index) => {
    const step = trace.eventSteps[index];
    const prefix = `第${index + 1}条：`;
    if (event.kind === "slayer")
      return `${prefix}${event.actor}号宣称猎手，选择${event.target}号：${step.deaths.includes(event.target) ? `${event.target}号死亡` : "未产生死亡"}。`;
    if (step.executedSeat !== null)
      return `${prefix}${event.nominator}号提名${event.nominee}号，贞洁者立即处决${step.executedSeat}号，本日结束。`;
    const tally = trace.nominationTallies.find(
      (item) => item.eventIndex === index,
    )!;
    return `${prefix}${event.nominator}号提名${event.nominee}号：${tally.votes}票；计票时${tally.aliveAtVote}人存活，至少需${tally.threshold}票，${tally.votes >= tally.threshold ? "达到人数门槛" : "未达门槛"}。`;
  });
}

function dayExecutionLabel(trace: DayTrace): string {
  if (trace.endedAfterEventIndex !== null && trace.state.winner)
    return `第${trace.endedAfterEventIndex + 1}条行动后对局结束：${trace.state.winner === "good" ? "善良" : "邪恶"}获胜${trace.executionCause === "virgin" ? "，已发生贞洁者立即处决" : "，不再结算待处决"}。`;
  if (trace.executedSeat === null)
    return "本日没有处决；后续死亡不会改变较早计票时的人数门槛。";
  return `${trace.executionCause === "virgin" ? "贞洁者立即处决" : "本日投票处决"}${trace.executedSeat}号：${trace.executionDeathSeat === null ? "其已死亡，本次不产生处决死亡，送葬者不会因此获得信息" : "本次产生处决死亡"}。`;
}

function ravenkeeperInformationLabel(trace: NightTrace): string | undefined {
  const death = trace.ravenkeeperDeath;
  if (!death) return undefined;
  const moment = `${death.speaker}号守鸦人：第${death.impActionIndex + 1}次小恶魔行动后死亡`;
  if (death.gameOver) return `${moment}，对局当时已结束，本次不再获得信息。`;
  if (death.poisonedSeat === death.speaker)
    return `${moment}，死亡时中毒，本次能力无效；后续恢复健康不会补发有效信息。`;
  const info = trace.ravenkeeperInfo;
  return info
    ? `${moment}，当时选择${info.target}号，得知${ROLE_ZH[info.seenRole]}${info.seenRole !== death.roles[info.target - 1] ? "（本次注册）" : ""}；此后角色变化不会改写本次信息。`
    : undefined;
}

function nightActionLabel(actions: NightActions): string {
  const choices = actions.impActions
    ? actions.impActions
        .map(
          (action, index) =>
            `${index + 1}. ${action.actor}号小恶魔：${
              action.skipReason === "dead"
                ? "行动前已死亡，跳过"
                : action.skipReason === "game_over"
                  ? "对局已结束，跳过"
                  : `目标 ${action.target}号${
                      action.mayorRedirectTarget === undefined
                        ? ""
                        : `，镇长转移至 ${action.mayorRedirectTarget}号`
                    }${
                      action.impSuccessorSeat === undefined
                        ? ""
                        : `，接任 ${action.impSuccessorSeat}号`
                    }`
            }`,
        )
        .join("；")
    : `Imp目标 ${actions.impTarget ?? "无"}；镇长转移 ${actions.mayorRedirectTarget ?? "无"}；接任 ${actions.impSuccessorSeat ?? "无"}`;
  return `N${actions.cycle}：投毒目标 ${actions.poisonerTarget ?? "无"}；僧侣目标 ${actions.monkTarget ?? "无"}；${choices}；男仆主人 ${actions.butlerMasterSeat ?? "无"}`;
}

export const classificationText = (result: SetupQueryResult) =>
  result.classification === "necessary"
    ? "必然成立"
    : result.classification === "impossible"
      ? "不可能"
      : result.classification === "contingent"
        ? "可能，但非必然"
        : result.classification === "inconsistent"
          ? "前提互相冲突"
          : "结果未知";

export function StandardWitnessCard({
  witness,
  title,
}: {
  witness: SetupWitness;
  title: string;
}) {
  const replay = witness.timeline
    ? replayTimeline({
        initialPlayers: witness.roles.map((actualRole, index) => ({
          seat: index + 1,
          actualRole,
          shownToken: witness.shownTokens[index],
        })),
        phases: witness.timeline,
      })
    : undefined;
  return (
    <details className="standard-witness">
      <summary>{title}</summary>
      <p>初始真实角色分配</p>
      <div className="standard-witness-grid">
        {witness.roles.map((role, index) => (
          <div key={index}>
            <b>{index + 1}</b>
            <span>
              {ROLE_ZH[role]}
              {role === "Drunk"
                ? `（所见${ROLE_ZH[witness.shownTokens[index]]}）`
                : ""}
            </span>
          </div>
        ))}
      </div>
      {witness.currentRoles &&
        witness.currentRoles.some(
          (role, index) => role !== witness.roles[index],
        ) && (
          <p>
            到当前阶段的角色变化：
            {witness.currentRoles
              .flatMap((role, index) =>
                role !== witness.roles[index]
                  ? [
                      `${index + 1}号 ${ROLE_ZH[witness.roles[index]]} → ${ROLE_ZH[role]}${witness.currentAlignments?.[index] ? `（${witness.currentAlignments[index] === "good" ? "善良" : "邪恶"}）` : ""}`,
                    ]
                  : [],
              )
              .join("；")}
          </p>
        )}
      {witness.currentRoles &&
        witness.currentAlive &&
        witness.currentRoles.filter(
          (role, index) => role === "Imp" && witness.currentAlive![index],
        ).length > 1 && (
          <p>
            当前存活的小恶魔：
            {witness.currentRoles
              .flatMap((role, index) =>
                role === "Imp" && witness.currentAlive![index]
                  ? [`${index + 1}号`]
                  : [],
              )
              .join("、")}
            。
          </p>
        )}
      {witness.redHerringSeat && (
        <p>占卜师红鲱鱼：{witness.redHerringSeat}号</p>
      )}
      {witness.nightOnePoisoner && (
        <p>
          首夜投毒者：{witness.nightOnePoisoner.seat}号 →{" "}
          {witness.nightOnePoisoner.target}号
        </p>
      )}
      {witness.timeline && (
        <details>
          <summary>查看这组可能的隐藏行动</summary>
          <ol>
            {witness.timeline.map((phase, index) => {
              const trace =
                replay?.status === "ok" ? replay.traces[index] : undefined;
              const information =
                trace && "ravenkeeperDeath" in trace
                  ? ravenkeeperInformationLabel(trace)
                  : undefined;
              return (
                <li key={index}>
                  {phase.kind === "night"
                    ? nightActionLabel(phase.actions)
                    : `D${index / 2 + 0.5}：${phase.events.length}条已封闭行动`}
                  {information && (
                    <p className="standard-information-moment">{information}</p>
                  )}
                  {phase.kind === "day" && trace && "eventSteps" in trace && (
                    <>
                      {phase.events.length > 0 && (
                        <ul className="standard-day-steps">
                          {dayActionLabels(phase.events, trace).map(
                            (label, eventIndex) => (
                              <li key={eventIndex}>{label}</li>
                            ),
                          )}
                        </ul>
                      )}
                      <p className="standard-execution-moment">
                        {dayExecutionLabel(trace)}
                      </p>
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        </details>
      )}
      {witness.registrations.length > 0 && (
        <ul>
          {witness.registrations.map((choice, index) => (
            <li key={index}>
              {choice.interaction.startsWith("librarian_zero_")
                ? "图书管理员本次零外来者信息"
                : /^scarlet_woman_[nd]\d+_\d+$/.test(choice.interaction)
                  ? `${choice.interaction.split("_")[2].toUpperCase()} ${choice.interaction.split("_")[3]}号红唇女郎继任判定`
                  : choice.interaction.startsWith("imp_successor_n")
                    ? `N${choice.interaction.slice("imp_successor_n".length).split("_")[0]}${choice.interaction.includes("_", "imp_successor_n".length) ? ` ${choice.interaction.split("_").at(-1)}号` : ""}小恶魔自杀接任`
                    : choice.interaction}
              ：{choice.seat}号
              {choice.role
                ? `注册为${ROLE_ZH[choice.role]}`
                : `注册为${choice.evil ? "邪恶" : "善良"}`}
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}
