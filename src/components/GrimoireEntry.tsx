import { useState } from "react";
import {
  eventLabel,
  ROLE_ZH,
  ROLES,
  timeLabel,
  type GameTime,
  type Role,
} from "../core/model";
import { ROLE_TEAM } from "../core/setup";
import { parseEntry } from "../core/parser";
import {
  commitStandardDrafts,
  visibleStandardEvents,
  type StandardWorkspace,
} from "../core/standardWorkspace";

import {
  activeRevision,
  amendStandardClaim,
  closeStandardPhase,
  currentStandardClaims,
  visibleAtBranch,
} from "../core/standardHistory";

// Limit the recording UI without changing imported event timestamps.
export const MAX_GRIMOIRE_DAY = 10;

const abilities = [
  "Washerwoman",
  "Librarian",
  "Investigator",
  "Chef",
  "Empath",
  "Fortune Teller",
  "Undertaker",
  "Ravenkeeper",
] as const;
type Ability = (typeof abilities)[number];
const actions = {
  nomination: "提名",
  vote: "投票",
  execution: "处决",
  death: "死亡",
  slayer: "猎手行动",
  winner: "胜负",
  close: "本阶段记录完整",
};
type Action = keyof typeof actions;
const seats = (count: number) => Array.from({ length: count }, (_, i) => i + 1);

export function GrimoireEntry({
  workspace,
  onChange,
  seat,
  time,
  mode,
  onSaved,
  editing,
}: {
  workspace: StandardWorkspace;
  onChange: (next: StandardWorkspace) => void;
  seat: number;
  time: GameTime;
  mode: "report" | "action";
  onSaved: () => void;
  editing?: { eventId: string; kind: "correction" | "changed_claim" };
}) {
  const source = editing
    ? visibleAtBranch(workspace).find((e) => e.id === editing.eventId)
    : undefined;
  const original =
    source?.payload.kind === "claim" &&
    source.payload.claimKind === "ability_report"
      ? source.payload
      : undefined;
  const latest =
    original ??
    currentStandardClaims(visibleAtBranch(workspace), workspace.events)
      .filter((e) => e.payload.kind === "claim" && e.payload.speaker === seat)
      .at(-1)?.payload;
  const initialRole =
    latest?.kind === "claim" && abilities.some((a) => a === latest.role)
      ? (latest.role as Ability)
      : "Empath";
  const [ability, setAbility] = useState<Ability>(initialRole);
  const [cycle, setCycle] = useState(
    Math.min(
      MAX_GRIMOIRE_DAY,
      Math.max(1, source?.occurredAt?.cycle ?? time.cycle),
    ),
  );
  const [phase, setPhase] = useState(time.phase);
  const [actor, setActor] = useState(seat);
  const [target, setTarget] = useState(
    original?.targets?.[0] ?? (seat === 1 ? 2 : 1),
  );
  const [second, setSecond] = useState(original?.targets?.[1] ?? 3);
  const [value, setValue] = useState(
    typeof original?.value === "number" ? original.value : 0,
  );
  const [seen, setSeen] = useState<Role>(
    typeof original?.value === "string" ? original.value : "Washerwoman",
  );
  const [yes, setYes] = useState(
    typeof original?.value === "boolean" ? original.value : true,
  );
  const [zero, setZero] = useState(
    original?.role === "Librarian" && original.value === 0,
  );
  const [action, setAction] = useState<Action>(
    time.phase === "night" ? "death" : "nomination",
  );
  const [voters, setVoters] = useState<number[]>([]);
  const [team, setTeam] = useState("good");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const pair = ["Washerwoman", "Librarian", "Investigator"].includes(ability);
  const roleChoices = pair
    ? ROLES.filter(
        (r) =>
          ROLE_TEAM[r] ===
          (ability === "Washerwoman"
            ? "townsfolk"
            : ability === "Librarian"
              ? "outsider"
              : "minion"),
      )
    : ROLES;
  const shownRole = roleChoices.includes(seen) ? seen : roleChoices[0];
  const reportTime: GameTime = { cycle, phase: "night" };
  const entryTime: GameTime = mode === "report" ? reportTime : { cycle, phase };
  const timeCode = `@${entryTime.phase === "night" ? "N" : "D"}${cycle}`;
  const reportValue =
    ability === "Librarian" && zero
      ? "0"
      : pair
        ? `${target}/${second} ${ROLE_ZH[shownRole]}`
        : ability === "Chef" || ability === "Empath"
          ? String(value)
          : ability === "Fortune Teller"
            ? `${target}/${second} ${yes ? "yes" : "no"}`
            : ability === "Ravenkeeper"
              ? `${target} ${ROLE_ZH[shownRole]}`
              : ROLE_ZH[shownRole];
  const commands: Record<Action, string> = {
    nomination: `${actor} nom ${target}`,
    vote: `vote ${target} = ${voters.join(",") || "none"}`,
    execution: `exec ${target}`,
    death: `${target} dead`,
    slayer: `${actor} slay ${target}`,
    winner: `win ${team}`,
    close: "close deaths",
  };
  const lines =
    mode === "report"
      ? [`${seat} ${ROLE_ZH[ability]} ${reportValue} ${timeCode}`]
      : action === "close"
        ? [
            ...(phase === "day" ? [`close actions ${timeCode}`] : []),
            `close deaths ${timeCode}`,
          ]
        : [`${commands[action]} ${timeCode}`];
  const choice = (
    label: string,
    current: number,
    change: (n: number) => void,
  ) => (
    <label>
      {label}
      <select
        aria-label={label}
        value={current}
        onChange={(e) => change(Number(e.target.value))}
      >
        {seats(workspace.playerCount).map((n) => (
          <option key={n} value={n}>
            {n}号
          </option>
        ))}
      </select>
    </label>
  );
  const save = () => {
    try {
      if (activeRevision(workspace) < workspace.events.length)
        throw new Error("当前分支尚未包含最新记录，请先更新到最新记录。");
      if (
        mode === "report" &&
        ["Washerwoman", "Librarian", "Investigator", "Chef"].includes(
          ability,
        ) &&
        cycle !== 1
      )
        throw new Error("该首夜能力目前只支持第1夜报告。");
      if (
        mode === "report" &&
        ["Undertaker", "Ravenkeeper"].includes(ability) &&
        cycle === 1
      )
        throw new Error("该报告需要第2夜或之后的夜晚。");
      if (mode === "action" && action === "close" && !confirmed)
        throw new Error("请先确认本阶段记录完整。");
      let next = workspace;
      if (mode === "action" && action === "close")
        next = closeStandardPhase(workspace, entryTime, confirmed);
      for (const line of mode === "action" && action === "close" ? [] : lines) {
        const drafts = parseEntry(line, {
          playerCount: workspace.playerCount,
          profile: "standard",
        });
        if (mode === "report" && editing) {
          const report = drafts.find(
            (d) =>
              d.payload.kind === "claim" &&
              d.payload.claimKind === "ability_report",
          );
          if (!report || report.payload.kind !== "claim" || !report.occurredAt)
            throw new Error("无法解析待修改的报告。");
          next = amendStandardClaim(
            next,
            editing.eventId,
            report.payload,
            report.occurredAt,
            editing.kind,
            time,
          );
          continue;
        }
        const existing = visibleStandardEvents(next, next.perspectiveSeat);
        const filtered = drafts
          .filter(
            (d) =>
              mode !== "report" ||
              (d.payload.kind === "claim" &&
                d.payload.claimKind === "ability_report"),
          )
          .filter(
            (d) =>
              d.payload.kind !== "phase_closed" ||
              !existing.some(
                (e) =>
                  e.payload.kind === "phase_closed" &&
                  d.payload.kind === "phase_closed" &&
                  e.payload.channel === d.payload.channel &&
                  e.occurredAt?.cycle === cycle &&
                  e.occurredAt?.phase === entryTime.phase,
              ),
          );
        if (filtered.length) {
          const label =
            filtered.map((d) => eventLabel(d)).join("；") +
            ` · ${timeLabel(entryTime)}`;
          next = commitStandardDrafts(
            next,
            label,
            filtered.map((d) => ({ ...d, sourceSpan: [0, label.length] })),
            "private",
          );
        }
      }
      onChange(
        mode === "report"
          ? { ...next, query: { seat, role: ability, stage: "initial" } }
          : next,
      );
      onSaved();
    } catch (cause) {
      setError((cause as Error).message);
    }
  };
  return (
    <form
      className="gr-form"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <p>
        {mode === "report"
          ? `${seat}号报告将保存在魔典中。录入后可点“一键分析”检查冲突，或在条件推理中手动采纳。`
          : "按发生顺序记录。处决与死亡分别记录，所有内容默认私密。"}
      </p>
      {editing && source && (
        <div className="gr-notice">
          <p>
            {editing.kind === "correction" ? "录入纠正" : "玩家改口"}：
            {eventLabel(source)} · {timeLabel(source.occurredAt)}
          </p>
          <p>
            {editing.kind === "correction"
              ? "保留误录原文，并取消当前分支对原报告的采纳；新报告需要重新采纳。"
              : "保留原声明与改口后的声明；一键分析采用改口后的报告，手动采纳的旧报告仍保留，请复核。"}
          </p>
          {editing.kind === "changed_claim" && (
            <p>改口仍对应原报告的夜晚；本次变化记录在{timeLabel(time)}。</p>
          )}
        </div>
      )}
      <div className="gr-form-row">
        <label>
          第几天
          <select
            aria-label="记录天数"
            disabled={editing?.kind === "changed_claim"}
            value={cycle}
            onChange={(e) => {
              setCycle(Number(e.target.value));
              setConfirmed(false);
            }}
          >
            {seats(MAX_GRIMOIRE_DAY).map((n) => (
              <option key={n} value={n}>
                第{n}天
              </option>
            ))}
          </select>
        </label>
        {mode === "action" ? (
          <label>
            阶段
            <select
              aria-label="记录阶段"
              value={phase}
              onChange={(e) => {
                const p = e.target.value as GameTime["phase"];
                setPhase(p);
                setAction(p === "night" ? "death" : "nomination");
                setConfirmed(false);
              }}
            >
              <option value="day">白天</option>
              <option value="night">夜晚</option>
            </select>
          </label>
        ) : (
          <p>夜晚收到的信息</p>
        )}
      </div>
      {mode === "report" ? (
        <>
          <label>
            报告能力
            <select
              aria-label="报告能力"
              value={ability}
              onChange={(e) => {
                setAbility(e.target.value as Ability);
                setValue(0);
                setZero(false);
                setError("");
              }}
            >
              {abilities.map((a) => (
                <option key={a} value={a}>
                  {ROLE_ZH[a]}
                </option>
              ))}
            </select>
          </label>
          {ability === "Librarian" && (
            <label className="gr-check">
              <input
                type="checkbox"
                checked={zero}
                onChange={(e) => setZero(e.target.checked)}
              />
              零外来者
            </label>
          )}
          {((pair && !zero) ||
            ability === "Fortune Teller" ||
            ability === "Ravenkeeper") &&
            choice("第一个目标", target, setTarget)}
          {((pair && !zero) || ability === "Fortune Teller") &&
            choice("第二个目标", second, setSecond)}
          {((pair && !zero) ||
            ability === "Undertaker" ||
            ability === "Ravenkeeper") && (
            <label>
              收到的角色
              <select
                aria-label="收到的角色"
                value={shownRole}
                onChange={(e) => setSeen(e.target.value as Role)}
              >
                {roleChoices.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_ZH[r]}
                  </option>
                ))}
              </select>
            </label>
          )}
          {(ability === "Chef" || ability === "Empath") && (
            <label>
              收到的数字
              <select
                aria-label="收到的数字"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
              >
                {Array.from(
                  {
                    length:
                      ability === "Empath" ? 3 : workspace.playerCount + 1,
                  },
                  (_, n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ),
                )}
              </select>
            </label>
          )}
          {ability === "Fortune Teller" && (
            <label>
              占卜结果
              <select
                aria-label="占卜结果"
                value={String(yes)}
                onChange={(e) => setYes(e.target.value === "true")}
              >
                <option value="true">是</option>
                <option value="false">否</option>
              </select>
            </label>
          )}
        </>
      ) : (
        <>
          <label>
            事件类型
            <select
              aria-label="事件类型"
              value={action}
              onChange={(e) => {
                setAction(e.target.value as Action);
                setConfirmed(false);
                setError("");
              }}
            >
              {(Object.keys(actions) as Action[])
                .filter(
                  (a) =>
                    phase === "day" || ["death", "winner", "close"].includes(a),
                )
                .map((a) => (
                  <option key={a} value={a}>
                    {actions[a]}
                  </option>
                ))}
            </select>
          </label>
          {(action === "nomination" || action === "slayer") &&
            choice("行动者", actor, setActor)}
          {!["winner", "close"].includes(action) &&
            choice("目标座位", target, setTarget)}
          {action === "vote" && (
            <fieldset>
              <legend>举手玩家（未选即零票）</legend>
              <div className="gr-voters">
                {seats(workspace.playerCount).map((n) => (
                  <label className="gr-check" key={n}>
                    <input
                      type="checkbox"
                      checked={voters.includes(n)}
                      onChange={(e) =>
                        setVoters(
                          e.target.checked
                            ? [...voters, n].sort((a, b) => a - b)
                            : voters.filter((v) => v !== n),
                        )
                      }
                    />
                    {n}号
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          {action === "winner" && (
            <label>
              获胜阵营
              <select value={team} onChange={(e) => setTeam(e.target.value)}>
                <option value="good">善良</option>
                <option value="evil">邪恶</option>
              </select>
            </label>
          )}
          {action === "close" && (
            <>
              <p>
                确认后，推理会把未记录的
                {phase === "day" ? "提名、投票、猎手行动与死亡" : "死亡"}
                视为没有发生。尚未收集齐信息时请勿确认。
              </p>
              <label className="gr-check">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
                我确认{timeLabel(entryTime)}记录完整
              </label>
            </>
          )}
        </>
      )}
      {error && (
        <p className="gr-error" role="alert">
          {error}
        </p>
      )}
      <button
        className="gr-primary"
        type="submit"
        disabled={mode === "action" && action === "close" && !confirmed}
      >
        保存{mode === "report" ? "报告" : "事件"}
      </button>
    </form>
  );
}
