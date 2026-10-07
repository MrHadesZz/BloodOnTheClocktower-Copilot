import { useEffect, useRef, useState } from "react";
import { eventLabel, ROLE_ZH } from "../core/model";
import {
  claimConditionLabel,
  describeConditionExplanation,
  type ClaimConditionDiagnosis,
} from "../core/claimConditionAnalysis";
import { queryZ3ClaimConditions } from "../core/z3Client";
import type {
  StandardEvent,
  StandardWorkspace,
} from "../core/standardWorkspace";
import { StandardWitnessCard } from "./StandardQueryResult";

export function ClaimConditionPanel({
  workspace,
  seats,
  sources,
  analysisBusy,
}: {
  workspace: StandardWorkspace;
  seats: number[];
  sources: StandardEvent[];
  analysisBusy: boolean;
}) {
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState<{
    workspace: StandardWorkspace;
    seatKey: string;
    answer: ClaimConditionDiagnosis;
  }>();
  const seatKey = seats.join(",");
  const result =
    completed?.workspace === workspace && completed.seatKey === seatKey
      ? completed.answer
      : undefined;
  const controller = useRef<AbortController | undefined>(undefined);
  useEffect(() => {
    setCompleted(undefined);
    setError("");
    if (!attempt) return;
    let current = true;
    const abort = new AbortController();
    controller.current = abort;
    setBusy(true);
    const store = (answer: ClaimConditionDiagnosis) => {
      if (current) setCompleted({ workspace, seatKey, answer });
    };
    queryZ3ClaimConditions(
      workspace,
      seatKey.split(",").map(Number),
      {},
      abort.signal,
      store,
    )
      .then(store)
      .catch((cause) => {
        if (current)
          setError(
            cause instanceof DOMException && cause.name === "AbortError"
              ? "已取消细查，已验证解释保留。"
              : cause instanceof Error
                ? cause.message
                : "细查未完成。",
          );
      })
      .finally(() => {
        if (current) setBusy(false);
      });
    return () => {
      current = false;
      abort.abort();
    };
  }, [workspace, seatKey, attempt]);

  return (
    <section
      className="gr-condition-panel"
      aria-label={`细查${seats.map((s) => `${s}号`).join("、")}`}
    >
      <div className="gr-analysis-controls">
        <button
          disabled={busy || analysisBusy}
          onClick={() => setAttempt((n) => n + 1)}
        >
          {attempt ? "重新细查原因" : "细查原因"}
        </button>
        {busy && (
          <button onClick={() => controller.current?.abort()}>取消细查</button>
        )}
      </div>
      {!attempt && (
        <p>
          分别检验开局身份、每条报告的准确转述和当夜能力，找出更具体的放宽方式。
        </p>
      )}
      {busy && <p role="status">正在逐项检验身份与报告，最多约25秒…</p>}
      {error && (
        <p className="gr-error" role="alert">
          {result ? "细查未完成：" : "结果未知："}
          {error}
        </p>
      )}
      {result && (
        <div className="gr-condition-result" aria-live="polite">
          <p>仅细分本组合，保留其他玩家、可见事件和全部手动前提。</p>
          {result.status === "compatible" && (
            <p>当前输入可以同时成立，未确认需要放宽的条件。</p>
          )}
          {result.status === "conflict" && (
            <>
              <h6>已检验的具体解释</h6>
              <p>
                以下解释是不同的可能性。每份见证保留除所列条件以外的全部条件，不能据此确认玩家撒谎。
              </p>
              {result.explanations.length === 0 && (
                <p>
                  {busy ? "正在寻找具体解释…" : "尚未找到经验证的具体解释。"}
                </p>
              )}
              {result.explanations.map((explanation, index) => {
                const descriptions = describeConditionExplanation(
                  result.conditions,
                  explanation,
                );
                const retained = result.conditions.filter(
                  (c) => !explanation.relaxedIds.includes(c.id),
                );
                return (
                  <article
                    className="gr-condition-explanation"
                    key={explanation.relaxedIds.join(",")}
                    aria-label={`细查解释${index + 1}`}
                  >
                    <h6>
                      解释{index + 1}：放宽 {explanation.relaxedIds.length}{" "}
                      项条件
                    </h6>
                    <p className="gr-repair-proof">
                      兼容已验证 ·{" "}
                      {explanation.minimal
                        ? "已验证不可再缩小"
                        : "是否可再缩小尚未验证"}
                    </p>
                    <ul>
                      {descriptions.map(
                        ({
                          condition,
                          initialRole,
                          roleAtReport,
                          shownRole,
                          cause,
                        }) => {
                          const source = sources.find(
                            (e) => e.id === condition.sourceId,
                          );
                          return (
                            <li key={condition.id}>
                              <b>{claimConditionLabel(condition)}</b>
                              <p className="gr-condition-source">
                                原记录：
                                {source
                                  ? eventLabel(source)
                                  : "来源已不可见，请重新分析。"}
                              </p>
                              {condition.kind === "role_at_phase" ? (
                                <p>
                                  该阶段结束时的角色声称已放宽；此见证对应角色为
                                  {roleAtReport
                                    ? ROLE_ZH[roleAtReport]
                                    : "尚未验证"}
                                  ，开局身份仍分别检查。
                                </p>
                              ) : condition.kind === "actual_role" ? (
                                <p>
                                  此见证中的开局真实角色为{ROLE_ZH[initialRole]}
                                  ；这里放宽的是开局身份声称。
                                </p>
                              ) : condition.kind === "report_accurate" ? (
                                <p>
                                  这份报告的转述或录入需要复核；放宽准确转述条件不等于确认玩家撒谎。
                                </p>
                              ) : (
                                <p>
                                  {cause === "drunk"
                                    ? `该见证中的当夜实际角色为酒鬼${shownRole ? `，所见身份为${ROLE_ZH[shownRole]}` : ""}，支持一种醉酒解释。`
                                    : cause === "poisoned"
                                      ? `该见证在这条报告的${condition.role === "Ravenkeeper" ? "死亡触发时点" : "信息时点"}，${condition.seat}号处于中毒状态，支持一种中毒解释。`
                                      : cause === "different_role" &&
                                          roleAtReport
                                        ? `该见证中的当夜实际角色为${ROLE_ZH[roleAtReport]}，与报告中的${ROLE_ZH[condition.role]}不同。`
                                        : "已验证不再预设能力有效后可以兼容；能力是否失效以及具体原因尚未验证。不能据此认定醉酒或中毒。"}
                                </p>
                              )}
                              {condition.kind !== "actual_role" &&
                                retained.some(
                                  (c) =>
                                    c.sourceId === condition.sourceId &&
                                    c.kind !== condition.kind,
                                ) && (
                                  <p>
                                    {condition.kind === "report_accurate"
                                      ? "本解释仍保留这条报告的能力有效条件。"
                                      : "本解释仍保留这条报告的准确转述条件。"}
                                  </p>
                                )}
                            </li>
                          );
                        },
                      )}
                    </ul>
                    <details>
                      <summary>查看本组合仍保留的条件</summary>
                      <ul>
                        {retained.map((c) => (
                          <li key={c.id}>{claimConditionLabel(c)}</li>
                        ))}
                      </ul>
                    </details>
                    <StandardWitnessCard
                      witness={explanation.witness}
                      title={`查看细查解释${index + 1}的可能分配与行动`}
                    />
                  </article>
                );
              })}
              <p>
                {result.searchComplete
                  ? "具体条件的解释搜索已完成；不可再缩小不代表条件条数全局最少。"
                  : "其他解释尚未搜索完，未展示的解释不能被排除。"}
              </p>
              <details className="gr-condition-trials">
                <summary>查看逐项检验</summary>
                <ul>
                  {result.trials.map((trial) => {
                    const condition = result.conditions.find(
                      (c) => c.id === trial.conditionId,
                    )!;
                    return (
                      <li key={condition.id}>
                        {claimConditionLabel(condition)}：
                        {trial.status === "compatible"
                          ? "只放宽这一项即可兼容"
                          : trial.status === "conflict"
                            ? "只放宽这一项仍有冲突"
                            : "尚未验证"}
                      </li>
                    );
                  })}
                </ul>
              </details>
            </>
          )}
          {result.reason && <p>{result.reason}</p>}
          {!result.complete && (
            <p>
              {busy
                ? "正在继续细查，已验证解释可先查看。"
                : "细查尚未完成，保留已验证解释。"}
            </p>
          )}
          <small>
            细查已检查 {result.checks} 次 · 分支修订 {result.revision}
          </small>
        </div>
      )}
    </section>
  );
}
