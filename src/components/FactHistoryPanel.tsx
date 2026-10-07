import { useEffect, useRef, useState } from "react";
import { eventLabel, timeLabel } from "../core/model";
import {
  visibleStandardEvents,
  type StandardWorkspace,
} from "../core/standardWorkspace";
import { queryZ3FactHistory } from "../core/z3Client";
import type { FactHistoryAnalysis } from "../core/factHistory";
import { StandardWitnessCard } from "./StandardQueryResult";
import { hypothesisLabel } from "./hypothesisLabel";

export function FactHistoryPanel({
  workspace,
}: {
  workspace: StandardWorkspace;
}) {
  const [completed, setCompleted] = useState<{
    workspace: StandardWorkspace;
    value: FactHistoryAnalysis;
  }>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [includeAssumptions, setIncludeAssumptions] = useState(true);
  const controller = useRef<AbortController | undefined>(undefined);
  const current =
    completed?.workspace === workspace ? completed.value : undefined;
  const branch = workspace.branches.find(
    (b) => b.id === workspace.activeBranchId,
  )!;
  const visible = visibleStandardEvents(
    workspace,
    workspace.perspectiveSeat,
    branch.baseRevision,
  );
  const byId = new Map(visible.map((event) => [event.id, event]));
  useEffect(() => {
    setBusy(false);
    setMessage("");
    return () => {
      controller.current?.abort();
      controller.current = undefined;
    };
  }, [workspace]);
  const run = async () => {
    controller.current?.abort();
    const operation = new AbortController();
    controller.current = operation;
    setBusy(true);
    setCompleted(undefined);
    setMessage("");
    try {
      const value = await queryZ3FactHistory(
        workspace,
        { includeAssumptions },
        operation.signal,
        (value) => {
          if (controller.current === operation)
            setCompleted({ workspace, value });
        },
      );
      if (controller.current === operation) setCompleted({ workspace, value });
    } catch (error) {
      if (controller.current === operation)
        setMessage(
          error instanceof Error && error.name === "AbortError"
            ? "已取消阶段定位，已确认的证据保留。"
            : `阶段定位未完成：${error instanceof Error ? error.message : "结果未知"}`,
        );
    } finally {
      if (controller.current === operation) {
        setBusy(false);
        controller.current = undefined;
      }
    }
  };
  return (
    <section
      className="gr-fact-history gr-conflict"
      aria-label="固定事实阶段核对"
    >
      <h3>沿日夜记录定位冲突</h3>
      <p>
        逐段核对完整记录，回看冲突边界和此前的兼容见证。每段保留全部行动、死亡与完整性确认。
      </p>
      <label className="gr-check">
        <input
          type="checkbox"
          checked={includeAssumptions}
          disabled={busy}
          onChange={(event) => {
            setIncludeAssumptions(event.target.checked);
            setCompleted(undefined);
            setMessage("");
          }}
        />
        保留当前分支的手动前提（后续信息在对应阶段才参与检查）
      </label>
      <div className="gr-conflict-actions">
        <button
          className="gr-primary"
          disabled={busy}
          onClick={() => void run()}
        >
          {busy ? "正在核对阶段…" : "核对固定事实"}
        </button>
        {busy && (
          <button onClick={() => controller.current?.abort()}>
            取消阶段定位
          </button>
        )}
      </div>
      {busy && <p role="status">最多约35秒；已确认阶段会实时显示。</p>}
      {message && <p role="status">{message}</p>}
      {current && (
        <div aria-label="阶段核对结果" aria-live="polite">
          <h4>
            {current.status === "located"
              ? `最早确认冲突的阶段：${timeLabel(current.boundary)}`
              : current.status === "partial" && current.boundary
                ? `已确认截至${timeLabel(current.boundary)}的记录冲突，最早边界尚未验证`
                : current.status === "compatible"
                  ? "固定背景已有兼容解释"
                  : current.status === "not_ready"
                    ? "请先补齐或核对阶段记录"
                    : "阶段定位未完成"}
          </h4>
          <p>{current.reason}</p>
          <p>
            分支：{branch.name} · 修订 {current.revision} · 已检查{" "}
            {current.checks} 次
          </p>
          {current.assumptionIds.length ? (
            <details>
              <summary>
                本次保留的手动前提 · {current.assumptionIds.length} 项
              </summary>
              <ul>
                {current.assumptionIds.map((id) => {
                  const hypothesis = workspace.hypotheses.find(
                    (h) => h.id === id,
                  );
                  return (
                    <li key={id}>
                      {hypothesis
                        ? hypothesisLabel(hypothesis, workspace)
                        : "来源已失效"}
                    </li>
                  );
                })}
              </ul>
            </details>
          ) : (
            <p>本次只核对固定事件，未采纳角色声称、能力报告或手动前提。</p>
          )}
          {current.steps.length > 0 && (
            <ol className="gr-fact-steps">
              {current.steps.map((step) => (
                <li key={timeLabel(step.time)}>
                  <strong>{timeLabel(step.time)}</strong>：
                  {step.status === "compatible"
                    ? "截至本阶段有兼容见证"
                    : step.status === "conflict"
                      ? "截至本阶段已确认冲突"
                      : "结果未知"}
                  {step.reason && <p>{step.reason}</p>}
                </li>
              ))}
            </ol>
          )}
          {current.boundary && (
            <div className="gr-fact-sources">
              <h4>{timeLabel(current.boundary)}参与检查的原记录</h4>
              <p>
                这里列出该阶段来源；需结合此前记录与保留前提核对，不能据此认定某条记录错误或某位玩家撒谎。
              </p>
              {current.sourceIds.map((id) => {
                const source = byId.get(id);
                if (!source) return null;
                const original = source.correctsEventId
                  ? workspace.events.find(
                      (e) =>
                        e.id === source.correctsEventId &&
                        e.revision <= branch.baseRevision &&
                        (e.visibility === "public" ||
                          e.ownerSeat === workspace.perspectiveSeat),
                    )
                  : undefined;
                return (
                  <details key={id}>
                    <summary>
                      回看{eventLabel(source)} · {timeLabel(source.occurredAt)}
                    </summary>
                    <p>
                      {source.visibility === "private" ? "私密" : "公开"} · 修订{" "}
                      {source.revision}
                    </p>
                    <blockquote>{source.rawText}</blockquote>
                    {original && (
                      <p>纠正前原文：{original.rawText}；保留原投票位置。</p>
                    )}
                  </details>
                );
              })}
              {!current.sourceIds.length && (
                <p>本阶段没有单独记录的来源，请核对保留前提和此前完整历史。</p>
              )}
            </div>
          )}
          {current.previous && (
            <StandardWitnessCard
              witness={current.previous.witness}
              title={`查看截至${timeLabel(current.previous.time)}的兼容见证`}
            />
          )}
          {current.witness && (
            <StandardWitnessCard
              witness={current.witness}
              title="查看固定背景的兼容见证"
            />
          )}
          {current.status === "compatible" &&
            !current.assumptionIds.length &&
            branch.assumptionIds.length > 0 && (
              <p>
                固定事件可以成立；原分析的冲突仍可能涉及已采纳的手动前提，请继续定位前提冲突。
              </p>
            )}
        </div>
      )}
    </section>
  );
}
