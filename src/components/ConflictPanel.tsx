import { useEffect, useRef, useState } from "react";
import { eventLabel, timeLabel } from "../core/model";
import {
  visibleStandardEvents,
  type StandardWorkspace,
} from "../core/standardWorkspace";
import { queryZ3Conflict } from "../core/z3Client";
import type { ConflictAnalysis } from "../core/conflict";
import { hypothesisLabel } from "./hypothesisLabel";
import { StandardWitnessCard } from "./StandardQueryResult";
import { FactHistoryPanel } from "./FactHistoryPanel";

export function ConflictPanel({
  workspace,
  onTrial,
}: {
  workspace: StandardWorkspace;
  onTrial: (id: string) => void;
}) {
  const [analysis, setAnalysis] = useState<{
    workspace: StandardWorkspace;
    value: ConflictAnalysis;
  } | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [budget, setBudget] = useState("standard");
  const controller = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      controller.current?.abort();
      controller.current = null;
    },
    [workspace],
  );
  const branch = workspace.branches.find(
    (b) => b.id === workspace.activeBranchId,
  )!;
  const visible = visibleStandardEvents(
    workspace,
    workspace.perspectiveSeat,
    branch.baseRevision,
  );
  const current = analysis?.workspace === workspace ? analysis.value : null;
  const physical = visible.filter((e) => e.payload.kind !== "claim");
  const locate = async () => {
    controller.current?.abort();
    const operation = new AbortController();
    controller.current = operation;
    setPending(true);
    setMessage("");
    setAnalysis(null);
    try {
      const value = await queryZ3Conflict(
        workspace,
        budget === "quick"
          ? { maxChecks: 6, budgetMs: 5000 }
          : { maxChecks: 40, budgetMs: 15000 },
        operation.signal,
      );
      if (controller.current === operation) setAnalysis({ workspace, value });
    } catch (error) {
      if (controller.current === operation)
        setMessage(
          error instanceof Error && error.name === "AbortError"
            ? "已取消定位。没有生成新的冲突解释。"
            : `定位未完成：${error instanceof Error ? error.message : "未知错误"}`,
        );
    } finally {
      if (controller.current === operation) {
        setPending(false);
        controller.current = null;
      }
    }
  };
  return (
    <section className="gr-conflict" aria-label="冲突定位">
      <h3>定位冲突来源</h3>
      <p>
        固定当前修订的事实记录，检查哪些采纳前提无法同时成立。最小指删去其中任意一项后均有有效见证，不代表条数最少或唯一原因。
      </p>
      <label>
        定位预算
        <select
          aria-label="定位预算"
          value={budget}
          disabled={pending}
          onChange={(e) => setBudget(e.target.value)}
        >
          <option value="standard">标准：15秒搜索预算 / 40次检查</option>
          <option value="quick">快速：5秒搜索预算 / 6次检查</option>
        </select>
      </label>
      <div className="gr-conflict-actions">
        <button disabled={pending} onClick={() => void locate()}>
          {pending ? "正在定位…" : current ? "重新定位冲突" : "定位冲突"}
        </button>
        {pending && (
          <button onClick={() => controller.current?.abort()}>取消定位</button>
        )}
      </div>
      {pending && (
        <p role="status">逐项检查前提与删除后的见证；不会修改对局记录。</p>
      )}
      {message && <p role="status">{message}</p>}
      {current && (
        <>
          <p role="status">
            <strong>
              {current.status === "minimal"
                ? "已验证最小前提冲突集"
                : current.status === "partial"
                  ? "已确认冲突，最小性未验证完成"
                  : current.status === "fixed_conflict"
                    ? "固定事实本身冲突"
                    : current.status === "not_conflicting"
                      ? "重新检查发现可行世界，未确认冲突"
                      : "未能重新确认冲突"}
            </strong>{" "}
            · 已检查 {current.checks} 次
          </p>
          {current.reason && <p>{current.reason}</p>}
          <p>
            分支：{branch.name} · 修订 {branch.baseRevision}
            {current.rulesetHash ? ` · 规则 ${current.rulesetHash}` : ""}
          </p>
          {(current.status === "minimal" || current.status === "partial") && (
            <ol className="gr-conflict-list">
              {current.assumptionIds.map((id) => {
                const hypothesis = workspace.hypotheses.find(
                  (h) => h.id === id,
                )!;
                const source =
                  "eventId" in hypothesis
                    ? visible.find((e) => e.id === hypothesis.eventId)
                    : undefined;
                const proof = current.deletionWitnesses.find(
                  (p) => p.assumptionId === id,
                );
                return (
                  <li key={id}>
                    <strong>{hypothesisLabel(hypothesis, workspace)}</strong>
                    {source ? (
                      <details>
                        <summary>回看原记录</summary>
                        <p>
                          {eventLabel(source)} · {timeLabel(source.occurredAt)}{" "}
                          · {source.visibility === "private" ? "私密" : "公开"}{" "}
                          · 修订 {source.revision}
                        </p>
                        <blockquote>{source.rawText}</blockquote>
                      </details>
                    ) : (
                      <p>手动采纳的假设，没有关联报告原文。</p>
                    )}
                    {proof && (
                      <StandardWitnessCard
                        witness={proof.witness}
                        title="仅取消此项后的见证（其余冲突前提保留）"
                      />
                    )}
                    <button onClick={() => onTrial(id)}>
                      在新分支试取消此前提
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
          {(current.status === "minimal" || current.status === "partial") && (
            <p>
              试取消只影响新分支，保留原分支全部记录和其他前提。完整分支可能还有另一组冲突，需要重新查询确认。
            </p>
          )}
          {current.status === "fixed_conflict" && (
            <FactHistoryPanel workspace={workspace} />
          )}
        </>
      )}
      <details>
        <summary>固定背景记录（不参与最小化） · {physical.length} 条</summary>
        {physical.length ? (
          physical.map((e) => (
            <div key={e.id}>
              <p>
                {eventLabel(e)} · {timeLabel(e.occurredAt)} · 修订 {e.revision}
              </p>
              <blockquote>{e.rawText}</blockquote>
            </div>
          ))
        ) : (
          <p>当前仅固定人数、标准角色设置和规则，尚无日夜行动事实。</p>
        )}
      </details>
    </section>
  );
}
