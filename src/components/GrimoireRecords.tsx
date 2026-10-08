import { useEffect, useState } from "react";
import { Undo2 } from "lucide-react";
import { eventLabel, timeLabel, type GameTime } from "../core/model";
import {
  activeRevision,
  closeStandardPhase,
  correctStandardVote,
  missingStandardPhases,
  phaseIndex,
  standardHistory,
  standardPhaseStatus,
  timeAtIndex,
} from "../core/standardHistory";
import {
  retractStandardEvent,
  type StandardEvent,
  type StandardWorkspace,
} from "../core/standardWorkspace";
import { MAX_GRIMOIRE_DAY } from "./GrimoireEntry";
import { FactHistoryPanel } from "./FactHistoryPanel";
import { FactCorrectionForm } from "./FactCorrectionForm";

export function GrimoireRecords({
  workspace,
  time,
  onChange,
  onAdd,
  onTime,
  onAmend,
  focusEventId,
  onReviewSource,
}: {
  workspace: StandardWorkspace;
  time: GameTime;
  onChange: (next: StandardWorkspace) => void;
  onAdd: (time: GameTime) => void;
  onTime: (time: GameTime) => void;
  onAmend: (event: StandardEvent, kind: "correction" | "changed_claim") => void;
  focusEventId?: string;
  onReviewSource?: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState<string>();
  const [confirmed, setConfirmed] = useState(false);
  const [confirmationWorkspace, setConfirmationWorkspace] =
    useState<StandardWorkspace>();
  const [error, setError] = useState("");
  const [editingFact, setEditingFact] = useState<string>();
  useEffect(() => {
    if (!focusEventId) return;
    const source = document.getElementById(`gr-history-${focusEventId}`);
    source?.focus({ preventScroll: true });
    source?.scrollIntoView({ block: "center" });
  }, [focusEventId]);
  const [editingVote, setEditingVote] = useState<{
    eventId: string;
    workspace: StandardWorkspace;
    voters: number[];
  }>();
  const revision = activeRevision(workspace);
  const rows = standardHistory(workspace).filter(
    (r) => r.event.payload.kind !== "phase_closed" || r.status === "active",
  );
  const indexes = new Set([
    ...Array.from({ length: phaseIndex(time) + 1 }, (_, i) => i),
    ...rows.flatMap((r) =>
      r.event.occurredAt ? [phaseIndex(r.event.occurredAt)] : [],
    ),
  ]);
  const missing = missingStandardPhases(workspace, time);
  const behind = revision < workspace.events.length;
  const mutate = (fn: () => StandardWorkspace) => {
    try {
      onChange(fn());
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "记录修改失败。");
    }
  };
  const rowView = (row: (typeof rows)[number]) => {
    const { event, status } = row;
    const payload = event.payload;
    const change = payload.kind === "claim" ? payload.change : undefined;
    const correction = event.correctsEventId !== undefined;
    const ballotCorrection = correction && payload.kind === "vote";
    const previousId = change?.previousId ?? event.correctsEventId;
    const previous = previousId
      ? workspace.events.find(
          (e) =>
            e.id === previousId &&
            (e.visibility === "public" ||
              e.ownerSeat === workspace.perspectiveSeat),
        )
      : undefined;
    return (
      <article
        className={`gr-history-row gr-history-${status}`}
        key={event.id}
        id={`gr-history-${event.id}`}
        tabIndex={-1}
      >
        <div>
          <small>
            {event.visibility === "private" ? "私密" : "公开"} · 修订
            {event.revision}
            {status !== "active" &&
              ` · ${status === "superseded" ? "改口前/历史声称" : status === "corrected" ? "已纠正的原记录" : "已撤销"}`}
            {change &&
              ` · ${change.kind === "correction" ? "录入纠正" : "玩家改口"}`}
            {correction &&
              (ballotCorrection
                ? " · 投票纠正（原投票位置）"
                : " · 事实纠正（原发生位置）")}
            {payload.kind === "claim" &&
              payload.claimKind === "role" &&
              ` · ${payload.identityStage === "current" ? "本阶段结束时角色" : "开局身份声称"}`}
          </small>
          <p>{eventLabel(event)}</p>
          {previous && (
            <p className="gr-history-link">
              {event.correctsEventId
                ? ballotCorrection
                  ? "原投票"
                  : "原记录"
                : change!.kind === "correction"
                  ? "原记录"
                  : "改口前"}
              ：{eventLabel(previous)} · {timeLabel(previous.occurredAt)} →
              本条记录；
              {event.correctsEventId
                ? ballotCorrection
                  ? `按原投票发生位置重放；${event.occurredAt && standardPhaseStatus(workspace, event.occurredAt).complete ? "本日已重新确认完整。" : "请重新确认本日记录完整。"}`
                  : `按原发生位置重放；${event.occurredAt && standardPhaseStatus(workspace, event.occurredAt).complete ? "本阶段已重新确认完整。" : "请重新确认本阶段记录完整。"}`
                : `${timeLabel(change!.announcedAt)}记录本次变化。`}
            </p>
          )}
          {event.correctsEventId && previous?.payload.kind === "vote" && (
            <details className="gr-history-link">
              <summary>回看原投票</summary>
              <p>{previous.rawText}</p>
              <p>
                原记录举手玩家：
                {previous.payload.voters
                  .map((voter) => `${voter}号`)
                  .join("、") || "无人（零票）"}
                。
              </p>
            </details>
          )}
          {correction && !ballotCorrection && previous && (
            <details className="gr-history-link">
              <summary>回看纠正前原记录</summary>
              <p>
                {eventLabel(previous)} · {timeLabel(previous.occurredAt)} · 修订
                {previous.revision}
              </p>
              <blockquote>{previous.rawText}</blockquote>
            </details>
          )}
          <div className="gr-history-actions">
            {status === "active" &&
              (payload.kind === "death" || payload.kind === "execution") && (
                <button
                  disabled={behind}
                  aria-label={`纠正${eventLabel(event)}`}
                  onClick={() => {
                    setEditingFact(event.id);
                    setEditingVote(undefined);
                    setError("");
                  }}
                >
                  纠正{payload.kind === "death" ? "死亡" : "处决"}
                </button>
              )}
            {status === "active" && payload.kind === "vote" && (
              <button
                disabled={behind}
                aria-label={`纠正${eventLabel(event)}`}
                onClick={() => {
                  setEditingFact(undefined);
                  setEditingVote({
                    eventId: event.id,
                    workspace,
                    voters: [...payload.voters],
                  });
                  setError("");
                }}
              >
                纠正投票
              </button>
            )}
            {status === "active" && payload.kind === "claim" && (
              <>
                <button
                  disabled={behind}
                  onClick={() => onAmend(event, "correction")}
                  aria-label={`纠正${eventLabel(event)}`}
                >
                  录入纠正
                </button>
                <button
                  disabled={behind}
                  onClick={() => onAmend(event, "changed_claim")}
                  aria-label={`记录改口${eventLabel(event)}`}
                >
                  玩家改口
                </button>
              </>
            )}
          </div>
          {editingFact === event.id &&
            status === "active" &&
            (payload.kind === "death" || payload.kind === "execution") && (
              <FactCorrectionForm
                workspace={workspace}
                event={{ ...event, payload }}
                onChange={onChange}
                onClose={() => setEditingFact(undefined)}
              />
            )}
          {editingVote?.eventId === event.id &&
            status === "active" &&
            payload.kind === "vote" && (
              <form
                className="gr-phase-confirm"
                aria-label="纠正投票"
                onSubmit={(submit) => {
                  submit.preventDefault();
                  if (editingVote.workspace !== workspace) {
                    setError("记录已变化，请重新打开投票纠正。");
                    return;
                  }
                  try {
                    onChange(
                      correctStandardVote(
                        workspace,
                        event.id,
                        editingVote.voters,
                      ),
                    );
                    setEditingVote(undefined);
                    setError("");
                  } catch (cause) {
                    setError(
                      cause instanceof Error ? cause.message : "投票纠正失败。",
                    );
                  }
                }}
              >
                <p>
                  纠正{timeLabel(event.occurredAt)}对{payload.nominee}
                  号的投票。原文会保留，按原投票位置重放，本日需要重新确认完整。
                </p>
                <fieldset
                  disabled={behind || editingVote.workspace !== workspace}
                >
                  <legend>实际举手玩家（未选即零票）</legend>
                  <div className="gr-voters">
                    {Array.from(
                      { length: workspace.playerCount },
                      (_, index) => index + 1,
                    ).map((seat) => (
                      <label className="gr-check" key={seat}>
                        <input
                          type="checkbox"
                          checked={editingVote.voters.includes(seat)}
                          onChange={(checkbox) =>
                            setEditingVote({
                              ...editingVote,
                              voters: checkbox.target.checked
                                ? [...editingVote.voters, seat]
                                : editingVote.voters.filter(
                                    (voter) => voter !== seat,
                                  ),
                            })
                          }
                        />
                        {seat}号
                      </label>
                    ))}
                  </div>
                </fieldset>
                {editingVote.workspace !== workspace && (
                  <p>记录已变化，请取消后重新打开。</p>
                )}
                <button
                  className="gr-primary"
                  type="submit"
                  disabled={behind || editingVote.workspace !== workspace}
                >
                  保存投票纠正
                </button>
                <button type="button" onClick={() => setEditingVote(undefined)}>
                  取消纠正
                </button>
              </form>
            )}
        </div>
        {status === "active" && (
          <button
            disabled={behind}
            aria-label={`撤销${eventLabel(event)}`}
            onClick={() =>
              mutate(() => retractStandardEvent(workspace, event.id))
            }
          >
            <Undo2 size={17} />
          </button>
        )}
      </article>
    );
  };
  return (
    <div className="gr-records gr-history">
      <p>
        按发生阶段排列；报告上的 N1、N2
        指收到信息的夜晚。录入纠正会撤回误录，玩家改口保留前后两次声明，分析采用最新声明。
      </p>
      <p>
        正在记录：<strong>{timeLabel(time)}</strong>
        。阶段完整只确认行动与死亡；未报身份和信息仍保持未知。
      </p>
      {behind && (
        <div className="gr-notice">
          <p>当前分支采用修订{revision}，尚未包含最新记录。</p>
          <button
            onClick={() =>
              onChange({
                ...workspace,
                branches: workspace.branches.map((b) =>
                  b.id === workspace.activeBranchId
                    ? { ...b, baseRevision: workspace.events.length }
                    : b,
                ),
              })
            }
          >
            更新到最新记录
          </button>
        </div>
      )}
      <button
        className="gr-primary"
        disabled={behind}
        onClick={() => onAdd(time)}
      >
        记录行动或阶段结束
      </button>
      {missing.length > 0 && (
        <p className="gr-notice">
          截至{timeLabel(time)}，尚未确认完整：
          {missing.map(timeLabel).join("、")}
          。按阶段补齐并确认后，再进行跨夜分析。
        </p>
      )}
      {error && (
        <p className="gr-error" role="alert">
          {error}
        </p>
      )}
      <details className="gr-fact-entry">
        <summary>核对固定事实与阶段冲突</summary>
        <FactHistoryPanel
          workspace={workspace}
          onReviewSource={onReviewSource}
        />
      </details>
      {[...indexes]
        .sort((a, b) => a - b)
        .map((index) => {
          const phase = timeAtIndex(index);
          const key = timeLabel(phase);
          const phaseRows = rows.filter(
            (r) =>
              r.event.occurredAt && phaseIndex(r.event.occurredAt) === index,
          );
          const status = standardPhaseStatus(workspace, phase);
          const next = timeAtIndex(index + 1);
          return (
            <section
              className="gr-history-phase"
              aria-label={`${key}记录`}
              key={key}
            >
              <header>
                <h3>
                  {key} ·{" "}
                  {phase.phase === "night"
                    ? `第${phase.cycle}夜`
                    : `第${phase.cycle}天`}
                </h3>
                <span>
                  {status.complete ? "本阶段已确认完整" : "本阶段尚未确认完整"}
                </span>
              </header>
              {phaseRows.map(rowView)}
              {phaseRows.length === 0 && (
                <p className="gr-history-empty">
                  尚无记录；未确认完整时，空白不表示没有发生。
                </p>
              )}
              <div className="gr-history-actions">
                <button
                  disabled={behind || phase.cycle > MAX_GRIMOIRE_DAY}
                  onClick={() => onAdd(phase)}
                >
                  补录{key}事件
                </button>
                {!status.complete && (
                  <button
                    disabled={behind}
                    onClick={() => {
                      setConfirming(key);
                      setConfirmed(false);
                      setError("");
                    }}
                  >
                    本阶段记录完整
                  </button>
                )}
                {status.complete && next.cycle <= MAX_GRIMOIRE_DAY && (
                  <button onClick={() => onTime(next)}>
                    前往{timeLabel(next)}
                  </button>
                )}
              </div>
              {confirming === key && !status.complete && (
                <div className="gr-phase-confirm">
                  <p>
                    确认后，推理会把
                    {phase.phase === "night"
                      ? "未记录的死亡"
                      : "未记录的提名、投票、猎手行动、处决与死亡"}
                    视为未发生。隐藏夜间行动仍由推理搜索。
                  </p>
                  <label className="gr-check">
                    <input
                      type="checkbox"
                      checked={confirmed && confirmationWorkspace === workspace}
                      onChange={(e) => {
                        setConfirmed(e.target.checked);
                        setConfirmationWorkspace(workspace);
                      }}
                    />
                    我确认{key}
                    {phase.phase === "night" ? "死亡记录" : "行动与死亡记录"}
                    已收齐
                  </label>
                  <button
                    className="gr-primary"
                    disabled={
                      !confirmed ||
                      confirmationWorkspace !== workspace ||
                      behind
                    }
                    onClick={() => {
                      try {
                        onChange(
                          closeStandardPhase(
                            workspace,
                            phase,
                            confirmed && confirmationWorkspace === workspace,
                          ),
                        );
                        setConfirming(undefined);
                        setConfirmed(false);
                        setError("");
                      } catch (cause) {
                        setError(
                          cause instanceof Error
                            ? cause.message
                            : "阶段确认失败。",
                        );
                      }
                    }}
                  >
                    确认{key}记录完整
                  </button>
                  <button
                    onClick={() => {
                      setConfirming(undefined);
                      setConfirmed(false);
                    }}
                  >
                    暂不确认
                  </button>
                </div>
              )}
            </section>
          );
        })}
      {rows.some((r) => !r.event.occurredAt) && (
        <section aria-label="时间未记记录">
          <h3>时间未记</h3>
          {rows.filter((r) => !r.event.occurredAt).map(rowView)}
        </section>
      )}
    </div>
  );
}
