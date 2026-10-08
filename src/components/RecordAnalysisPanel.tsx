import { useCallback, useEffect, useRef, useState } from "react";
import { eventLabel, timeLabel } from "../core/model";
import type {
  StandardEvent,
  StandardWorkspace,
} from "../core/standardWorkspace";
import type { RecordAnalysis } from "../core/recordAnalysis";
import { queryZ3RecordAnalysis } from "../core/z3Client";
import { StandardWitnessCard } from "./StandardQueryResult";

export function RecordAnalysisPanel({
  workspace,
  source,
  includeAssumptions,
  onReviewSource,
}: {
  workspace: StandardWorkspace;
  source: StandardEvent;
  includeAssumptions: boolean;
  onReviewSource?: (id: string) => void;
}) {
  const [completed, setCompleted] = useState<{
    workspace: StandardWorkspace;
    value: RecordAnalysis;
  }>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const controller = useRef<AbortController | undefined>(undefined);
  const current =
    completed?.workspace === workspace ? completed.value : undefined;
  const run = useCallback(async () => {
    controller.current?.abort();
    const operation = new AbortController();
    controller.current = operation;
    setBusy(true);
    setCompleted(undefined);
    setMessage("");
    try {
      const value = await queryZ3RecordAnalysis(
        workspace,
        source.id,
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
            ? "已取消试查，已验证的候选保留；未检查部分仍未知。"
            : `试查未完成：${error instanceof Error ? error.message : "结果未知"}`,
        );
    } finally {
      if (controller.current === operation) {
        setBusy(false);
        controller.current = undefined;
      }
    }
  }, [workspace, source.id, includeAssumptions]);
  useEffect(() => {
    void run();
    return () => {
      controller.current?.abort();
      controller.current = undefined;
    };
  }, [run]);
  return (
    <section
      className="gr-record-analysis"
      aria-label={`单处误录试查：${eventLabel(source)}`}
    >
      <h4>试查这条记录的一处误录</h4>
      <p>
        {timeLabel(source.occurredAt)} · {eventLabel(source)}
        。每次只替换一个玩家字段，或增删一名举手玩家，保留其余完整历史。
      </p>
      <p>候选供回看原文后核对，不代表原记录错误；本次试查不修改对局。</p>
      {source.payload.kind === "nomination" && (
        <p>
          试查提名时，关联投票保留举手名单并随新提名重新关联。实际纠正仍需在记录中明确确认。
        </p>
      )}
      <div className="gr-conflict-actions">
        <button disabled={busy} onClick={() => void run()}>
          重新试查
        </button>
        {busy && (
          <button onClick={() => controller.current?.abort()}>
            取消记录试查
          </button>
        )}
      </div>
      {busy && <p role="status">最多约25秒；只展示已取得兼容见证的候选。</p>}
      {message && <p role="status">{message}</p>}
      {current && (
        <div aria-label="记录试查结果" aria-live="polite">
          <p>
            {current.baselineConflict
              ? "原完整背景已确认冲突。"
              : current.status === "compatible"
                ? "原完整背景已有兼容见证。"
                : "原背景尚未确认冲突。"}
          </p>
          <p>
            {current.complete ? "本次范围已检查完成" : "试查未完成"} · 修订
            {current.revision} · 已检查{current.checks}次；单处替代
            {current.testedCandidates}/{current.totalCandidates}，其中
            {current.unknownCandidates}项未知。
          </p>
          <p>{current.reason}</p>
          {current.alternatives.map((alternative, index) => (
            <article key={alternative.id} className="gr-record-alternative">
              <h5>
                候选{index + 1}：{alternative.label}
              </h5>
              <p>
                若原记录改为“{eventLabel({ payload: alternative.payload })}
                ”，其余固定历史与本次保留前提可同时成立。
              </p>
              {alternative.payload.kind === "vote" && (
                <p>
                  候选举手玩家：
                  {alternative.payload.voters
                    .map((seat) => `${seat}号`)
                    .join("、") || "无人（零票）"}
                  。
                </p>
              )}
              <StandardWitnessCard
                witness={alternative.witness}
                title={`查看候选${index + 1}的兼容见证`}
              />
            </article>
          ))}
          {current.baselineConflict && !current.alternatives.length && (
            <p>
              当前没有已验证的单处替代。多处同时误录与未支持交互仍需另行核对。
            </p>
          )}
          {onReviewSource && (
            <button onClick={() => onReviewSource(source.id)}>
              前往原记录核对
            </button>
          )}
        </div>
      )}
    </section>
  );
}
