import { useEffect, useMemo, useRef, useState } from "react";
import { eventLabel, ROLE_ZH, timeLabel } from "../core/model";
import {
  prepareClaimAnalysis,
  type ClaimAnalysis,
} from "../core/claimAnalysis";
import { queryZ3Claims } from "../core/z3Client";
import {
  visibleStandardEvents,
  type StandardWorkspace,
} from "../core/standardWorkspace";
import { ClaimRepairCard } from "./ClaimRepairCard";
import { StandardWitnessCard } from "./StandardQueryResult";
import { FactHistoryPanel } from "./FactHistoryPanel";

export function ClaimAnalysisPanel({
  workspace,
}: {
  workspace: StandardWorkspace;
}) {
  const [attempt, setAttempt] = useState(0);
  const [completed, setCompleted] = useState<{
    workspace: StandardWorkspace;
    answer: ClaimAnalysis;
  }>();
  const result =
    completed?.workspace === workspace ? completed.answer : undefined;
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const controller = useRef<AbortController | undefined>(undefined);
  const prepared = useMemo(() => prepareClaimAnalysis(workspace), [workspace]);
  const sources = visibleStandardEvents(
    workspace,
    workspace.perspectiveSeat,
    prepared.revision,
  );
  const missing = Array.from(
    { length: workspace.playerCount },
    (_, i) => i + 1,
  ).filter((seat) => !prepared.groups.some((g) => g.seat === seat));
  useEffect(() => {
    let current = true;
    const abort = new AbortController();
    controller.current = abort;
    setCompleted(undefined);
    setError("");
    if (!prepared.groups.length) {
      setBusy(false);
      return () => {
        current = false;
        abort.abort();
      };
    }
    setBusy(true);
    queryZ3Claims(workspace, {}, abort.signal, (answer) => {
      if (current) setCompleted({ workspace, answer });
    })
      .then((answer) => {
        if (current) setCompleted({ workspace, answer });
      })
      .catch((cause) => {
        if (current)
          setError(
            cause instanceof DOMException && cause.name === "AbortError"
              ? "已取消分析，可重新分析；已验证结果保留。"
              : (cause as Error).message,
          );
      })
      .finally(() => {
        if (current) setBusy(false);
      });
    return () => {
      current = false;
      abort.abort();
    };
  }, [workspace, prepared, attempt]);
  const duplicateRoles =
    result?.status === "conflict"
      ? [
          ...new Set(result.groups.flatMap((g) => (g.role ? [g.role] : []))),
        ].flatMap((role) => {
          const group = result.groups.filter(
            (g) => g.role === role && result.coreSeats.includes(g.seat),
          );
          return group.length > 1
            ? [{ role, seats: group.map((g) => g.seat) }]
            : [];
        })
      : [];
  return (
    <div className="gr-claim-analysis">
      <p>
        先检验开局身份、各阶段当前角色与信息能否同时成立，再找出可以解释矛盾的单人或多人组合。放宽表示暂不采信其身份真实、报告准确和能力有效这组条件。
      </p>
      <p className="gr-analysis-note">
        假跳、酒鬼、中毒和录入错误都可能导致冲突。此功能定位需要复核的声称，不能直接确认谁在撒谎。跨夜信息需要完整的日夜记录。
      </p>
      {!prepared.groups.length ? (
        <p>还没有声称或信息。关闭面板，点座位选身份，再点“记录信息”。</p>
      ) : (
        <>
          <details className="gr-analysis-sources">
            <summary>
              本次输入 · {prepared.groups.length} 位玩家 · 修订{" "}
              {prepared.revision}
            </summary>
            {prepared.groups.map((group) => (
              <div key={group.seat}>
                <b>{group.seat}号</b>
                <ul>
                  {group.sourceIds.map((id) => {
                    const event = sources.find((e) => e.id === id)!;
                    return (
                      <li key={id}>
                        {eventLabel(event)} · {timeLabel(event.occurredAt)}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            <p>
              保留当前分支的手动前提与可见对局事件；分析不会自动勾选或保存新前提。
            </p>
          </details>
          {missing.length > 0 && (
            <p>
              尚未录入：{missing.map((s) => `${s}号`).join("、")}
              。结果仅覆盖已录入声称。
            </p>
          )}
          <div className="gr-analysis-controls">
            <button
              className="gr-primary"
              disabled={busy}
              onClick={() => setAttempt((n) => n + 1)}
            >
              重新分析
            </button>
            {busy && (
              <button onClick={() => controller.current?.abort()}>
                取消分析
              </button>
            )}
          </div>
        </>
      )}
      {busy && <p role="status">正在检验声称与信息，最多约35秒…</p>}
      {error && (
        <p className="gr-error" role="alert">
          {result ? "分析未完成：" : "结果未知："}
          {error}
        </p>
      )}
      {result && (
        <section
          aria-label="声称分析结果"
          className="gr-analysis-result"
          aria-live="polite"
        >
          <h3>
            {result.status === "compatible"
              ? "已录声称可以同时成立"
              : result.status === "conflict"
                ? "发现声称或信息冲突"
                : result.status === "fixed_conflict"
                  ? "对局事件或手动前提有冲突"
                  : "结果未知"}
          </h3>
          {result.status === "compatible" && (
            <>
              <p>
                找到了一种兼容解释；这不能证明所有人诚实，也不能排除其他身份分配。
              </p>
              {result.witness && (
                <StandardWitnessCard
                  witness={result.witness}
                  title="查看一种兼容解释"
                />
              )}
            </>
          )}
          {result.status === "conflict" && (
            <>
              {duplicateRoles.map((group) => (
                <p className="gr-analysis-note" key={group.role}>
                  具体矛盾：{group.seats.map((s) => `${s}号`).join("、")}
                  同时声称{ROLE_ZH[group.role]}
                  ，同一真实角色不能分配给多位玩家，所以他们不能都是真实
                  {ROLE_ZH[group.role]}。
                </p>
              ))}
              <p>
                需要一起复核：
                <strong>
                  {result.coreSeats.map((s) => `${s}号`).join("、")}
                </strong>
                。这些人的身份与有效信息无法同时成立，至少有一项需要放宽。
              </p>
              <p>
                {result.coreMinimal
                  ? "这组冲突已逐人验证：移除其中任何一人的条件，这组声称就能兼容。可能还存在其他冲突组。"
                  : "冲突已确认，涉及玩家的范围尚未缩小验证完毕。"}
              </p>
              <ul className="gr-analysis-conflict-sources">
                {result.groups
                  .filter((g) => result.coreSeats.includes(g.seat))
                  .flatMap((g) => g.sourceIds)
                  .map((id) => {
                    const event = sources.find((e) => e.id === id)!;
                    return (
                      <li key={id}>
                        {eventLabel(event)} · {timeLabel(event.occurredAt)}
                      </li>
                    );
                  })}
              </ul>
              <div className="gr-analysis-repairs">
                <h4>可同时放宽的玩家组合</h4>
                <p>
                  下面每个组合都有经过验证的兼容解释；组合之间是不同的可能性，不能合并成确定的嫌疑名单。
                </p>
                {result.repairs.length ? (
                  result.repairs.map((repair, index) => (
                    <ClaimRepairCard
                      key={repair.seats.join(",")}
                      repair={repair}
                      groups={result.groups}
                      sources={sources}
                      index={index + 1}
                      workspace={workspace}
                      analysisBusy={busy}
                    />
                  ))
                ) : (
                  <p>
                    {busy
                      ? "正在查找能够解释全部信息的组合…"
                      : "暂未找到经验证的组合；需要继续检查或调整手动前提。"}
                  </p>
                )}
                <p>
                  {result.repairSearchComplete
                    ? "组合搜索已完成；不可再缩小不等于全局人数最少。"
                    : "其他组合尚未搜索完，未展示的组合不能被排除。"}
                </p>
              </div>
              <details className="gr-analysis-individual">
                <summary>查看逐个玩家的检查</summary>
                <h4>只放宽一位玩家，能否解释全部信息？</h4>
                <p>保留其他所有玩家的条件。以下是可能性检查，不是撒谎概率。</p>
                {result.trials.map((trial) => (
                  <article className="gr-analysis-trial" key={trial.seat}>
                    <b>
                      {trial.seat}号：
                      {trial.status === "compatible"
                        ? "放宽后可解释全部信息"
                        : trial.status === "conflict"
                          ? "放宽后仍有冲突"
                          : "检查未完成"}
                    </b>
                    <p>
                      {trial.status === "compatible"
                        ? "优先复核该玩家：可能是假跳、信息失效或记录有误。"
                        : trial.status === "conflict"
                          ? "只调整这一人还不够；这不能证明该玩家诚实。"
                          : trial.reason}
                    </p>
                    {trial.witness && (
                      <StandardWitnessCard
                        witness={trial.witness}
                        title={`查看放宽${trial.seat}号后的可能解释`}
                      />
                    )}
                  </article>
                ))}
              </details>
              {result.trials.length < result.groups.length && (
                <p>尚未检查所有玩家的放宽情况。</p>
              )}
            </>
          )}
          {result.reason && <p>{result.reason}</p>}
          {result.status === "fixed_conflict" && (
            <FactHistoryPanel workspace={workspace} />
          )}
          {!result.complete && (
            <p>
              {busy
                ? "正在继续检查，已验证结果可先查看。"
                : "分析未完成，保留已验证结论；未完成的检查不用于判断玩家。"}
            </p>
          )}
          <small>
            已检查 {result.checks} 次 · 当前分支修订 {result.revision}
          </small>
        </section>
      )}
    </div>
  );
}
