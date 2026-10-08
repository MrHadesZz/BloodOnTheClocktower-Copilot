import { useState } from "react";
import { eventLabel, timeLabel } from "../core/model";
import {
  correctStandardAction,
  nominationVoteSources,
  type CorrectableActionPayload,
} from "../core/standardHistory";
import type {
  StandardEvent,
  StandardWorkspace,
} from "../core/standardWorkspace";

export function ActionCorrectionForm({
  workspace,
  event,
  onChange,
  onClose,
}: {
  workspace: StandardWorkspace;
  event: StandardEvent & { payload: CorrectableActionPayload };
  onChange: (workspace: StandardWorkspace) => void;
  onClose: () => void;
}) {
  const [snapshot] = useState(workspace);
  const nomination = event.payload.kind === "nomination";
  const initialFirst =
    event.payload.kind === "nomination"
      ? event.payload.nominator
      : event.payload.actor;
  const initialSecond =
    event.payload.kind === "nomination"
      ? event.payload.nominee
      : event.payload.target;
  const [first, setFirst] = useState(initialFirst);
  const [second, setSecond] = useState(initialSecond);
  const [reviewed, setReviewed] = useState(false);
  const [error, setError] = useState("");
  const stale = snapshot !== workspace;
  const behind =
    workspace.branches.find((b) => b.id === workspace.activeBranchId)!
      .baseRevision < workspace.events.length;
  const ballots = nomination ? nominationVoteSources(snapshot, event.id) : [];
  const changed = first !== initialFirst || second !== initialSecond;
  const needsReview = changed && ballots.length > 0;
  const noun = nomination ? "提名" : "猎手行动";
  const firstLabel = nomination ? "实际提名人" : "实际猎手行动玩家";
  const secondLabel = nomination ? "实际被提名人" : "实际猎手目标";
  const seats = Array.from({ length: workspace.playerCount }, (_, i) => i + 1);
  return (
    <form
      className="gr-phase-confirm gr-action-correction"
      aria-label={`纠正${noun}记录`}
      onSubmit={(submit) => {
        submit.preventDefault();
        if (stale) {
          setError("记录已变化，请重新打开纠正。");
          return;
        }
        if (needsReview && !reviewed) {
          setError("请先核对并确认关联投票。");
          return;
        }
        try {
          const payload: CorrectableActionPayload = nomination
            ? { kind: "nomination", nominator: first, nominee: second }
            : { kind: "slayer", actor: first, target: second };
          onChange(
            correctStandardAction(
              workspace,
              event.id,
              payload,
              ballots.map((vote) => vote.id),
            ),
          );
          onClose();
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : "纠正未保存。");
        }
      }}
    >
      <p>
        纠正{timeLabel(event.occurredAt)}的{eventLabel(event)}。
        原文和发生位置保留，本日需要重新确认完整。
      </p>
      <blockquote>{event.rawText}</blockquote>
      <div className="gr-action-fields">
        <label>
          {firstLabel}
          <select
            aria-label={firstLabel}
            value={first}
            disabled={stale || behind}
            onChange={(change) => {
              setFirst(Number(change.target.value));
              setReviewed(false);
            }}
          >
            {seats.map((seat) => (
              <option key={seat} value={seat}>
                {seat}号
              </option>
            ))}
          </select>
        </label>
        <label>
          {secondLabel}
          <select
            aria-label={secondLabel}
            value={second}
            disabled={stale || behind}
            onChange={(change) => {
              setSecond(Number(change.target.value));
              setReviewed(false);
            }}
          >
            {seats.map((seat) => (
              <option key={seat} value={seat}>
                {seat}号
              </option>
            ))}
          </select>
        </label>
      </div>
      {nomination &&
        (ballots.length ? (
          <fieldset disabled={stale || behind}>
            <legend>需要一同核对的关联投票</legend>
            {ballots.map((vote) => (
              <p key={vote.id}>
                {vote.visibility === "private" ? "私密" : "公开"} ·{" "}
                {eventLabel(vote)}；举手玩家：
                {vote.payload.voters.map((seat) => `${seat}号`).join("、") ||
                  "无人（零票）"}
                。 保存后保留举手名单并关联到{second}
                号的提名，原投票仍可回看。
              </p>
            ))}
            <label className="gr-action-review">
              <input
                type="checkbox"
                checked={reviewed}
                onChange={(change) => setReviewed(change.target.checked)}
              />
              <span>我已核对以上关联投票，同意保留举手名单并重新关联</span>
            </label>
          </fieldset>
        ) : (
          <p>当前没有关联投票，请核对是否需要补录。</p>
        ))}
      <p>
        死亡与处决记录需分别核对。
        {!nomination && "录入猎手行动并不代表该玩家的真实角色已经确认。"}
      </p>
      {stale && <p role="status">记录或前提已变化，请重新打开纠正。</p>}
      {error && (
        <p className="gr-error" role="alert">
          {error}
        </p>
      )}
      <div className="gr-action-buttons">
        <button
          type="submit"
          disabled={stale || behind || (needsReview && !reviewed)}
        >
          保存{noun}纠正
        </button>
        <button type="button" onClick={onClose}>
          取消纠正
        </button>
      </div>
    </form>
  );
}
