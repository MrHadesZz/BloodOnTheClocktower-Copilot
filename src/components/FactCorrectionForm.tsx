import { useState } from "react";
import { eventLabel, timeLabel } from "../core/model";
import {
  correctStandardFact,
  type CorrectableFactPayload,
} from "../core/standardHistory";
import type {
  StandardEvent,
  StandardWorkspace,
} from "../core/standardWorkspace";

export function FactCorrectionForm({
  workspace,
  event,
  onChange,
  onClose,
}: {
  workspace: StandardWorkspace;
  event: StandardEvent & { payload: CorrectableFactPayload };
  onChange: (workspace: StandardWorkspace) => void;
  onClose: () => void;
}) {
  const [snapshot] = useState(workspace);
  const [seat, setSeat] = useState(event.payload.seat);
  const [error, setError] = useState("");
  const stale = snapshot !== workspace;
  const behind =
    workspace.branches.find((b) => b.id === workspace.activeBranchId)!
      .baseRevision < workspace.events.length;
  const noun = event.payload.kind === "death" ? "死亡" : "处决";
  return (
    <form
      className="gr-phase-confirm"
      aria-label={`纠正${noun}记录`}
      onSubmit={(submit) => {
        submit.preventDefault();
        if (stale) {
          setError("记录已变化，请重新打开纠正。");
          return;
        }
        try {
          onChange(
            correctStandardFact(workspace, event.id, {
              kind: event.payload.kind,
              seat,
            }),
          );
          onClose();
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : "纠正未保存。");
        }
      }}
    >
      <p>
        纠正{timeLabel(event.occurredAt)}的{eventLabel(event)}
        。原文和发生位置保留，本阶段需要重新确认完整。
      </p>
      <blockquote>{event.rawText}</blockquote>
      <label>
        实际{noun}玩家
        <select
          aria-label={`实际${noun}玩家`}
          value={seat}
          disabled={stale || behind}
          onChange={(change) => setSeat(Number(change.target.value))}
        >
          {Array.from({ length: workspace.playerCount }, (_, i) => i + 1).map(
            (s) => (
              <option key={s} value={s}>
                {s}号
              </option>
            ),
          )}
        </select>
      </label>
      <p>处决记录和死亡记录分别保存，请核对两者是否都需要纠正。</p>
      {stale && <p role="status">记录或前提已变化，请重新打开纠正。</p>}
      {error && (
        <p className="gr-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" disabled={stale || behind}>
        保存{noun}纠正
      </button>
      <button type="button" onClick={onClose}>
        取消纠正
      </button>
    </form>
  );
}
