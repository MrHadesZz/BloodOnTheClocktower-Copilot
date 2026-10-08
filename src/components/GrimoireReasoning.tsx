import { useEffect, useRef, useState } from "react";
import {
  eventLabel,
  ROLE_ZH,
  ROLES,
  timeLabel,
  type Role,
} from "../core/model";
import {
  addStandardHypothesis,
  toggleStandardHypothesis,
  visibleStandardEvents,
  type StandardWorkspace,
} from "../core/standardWorkspace";
import { queryZ3Observed, queryZ3Setup } from "../core/z3Client";
import type { SetupQueryResult } from "../core/symbolicSetup";
import { classificationText, StandardWitnessCard } from "./StandardQueryResult";
import { hypothesisLabel } from "./hypothesisLabel";
import { ConflictPanel } from "./ConflictPanel";
import { createConflictTrial } from "../core/conflict";
import { currentStandardClaims } from "../core/standardHistory";
import { solveStandardWorkspace } from "../core/standardQuery";

export function GrimoireReasoning({
  workspace,
  onChange,
  onReviewSource,
}: {
  workspace: StandardWorkspace;
  onChange: (next: StandardWorkspace) => void;
  onReviewSource?: (id: string) => void;
}) {
  const branch = workspace.branches.find(
    (b) => b.id === workspace.activeBranchId,
  )!;
  const visible = visibleStandardEvents(
    workspace,
    workspace.perspectiveSeat,
    branch.baseRevision,
  );
  const reports = visible.filter(
    (e) =>
      e.payload.kind === "claim" && e.payload.claimKind === "ability_report",
  );
  const currentClaimIds = new Set(
    currentStandardClaims(visible, workspace.events).map((e) => e.id),
  );
  const selected = workspace.hypotheses.filter((h) =>
    branch.assumptionIds.includes(h.id),
  );
  const [result, setResult] = useState<{
    workspace: StandardWorkspace;
    answer: SetupQueryResult;
    sourceIds: string[];
  } | null>(null);
  const [trial, setTrial] = useState<{
    gameId: string;
    perspectiveSeat: number;
    parentAssumptions: string;
    branchId: string;
    parentBranchId: string;
    parentName: string;
    originalAnswer: SetupQueryResult;
    removed: string;
    query: string;
    revision: number;
  } | null>(null);
  const [failure, setFailure] = useState<{
    workspace: StandardWorkspace;
    text: string;
  } | null>(null);
  const [pending, setPending] = useState<StandardWorkspace | null>(null);
  const request = useRef(0);
  const trialPanel = useRef<HTMLElement>(null);
  useEffect(() => {
    if (trial?.branchId === workspace.activeBranchId)
      trialPanel.current?.focus();
  }, [trial?.branchId, workspace.activeBranchId]);
  useEffect(
    () => () => {
      request.current++;
    },
    [],
  );
  const currentResult = result?.workspace === workspace ? result : null;
  const toggleReport = (
    kind: "report_accurate" | "ability_active",
    eventId: string,
  ) => {
    try {
      const existing = workspace.hypotheses.find(
        (h) => h.kind === kind && h.eventId === eventId,
      );
      const next = existing
        ? workspace
        : addStandardHypothesis(workspace, { kind, eventId });
      onChange(
        toggleStandardHypothesis(
          next,
          existing?.id ?? next.hypotheses.at(-1)!.id,
        ),
      );
    } catch (cause) {
      setFailure({ workspace, text: (cause as Error).message });
    }
  };
  const run = async (target = workspace) => {
    const id = ++request.current;
    setResult(null);
    setFailure(null);
    setPending(target);
    try {
      const { answer, sourceIds } = await solveStandardWorkspace(target, {
        setup: queryZ3Setup,
        observed: queryZ3Observed,
      });
      if (request.current === id)
        setResult({ workspace: target, answer, sourceIds });
    } catch (cause) {
      if (request.current === id)
        setFailure({ workspace: target, text: (cause as Error).message });
    } finally {
      if (request.current === id) setPending(null);
    }
  };
  const tryWithout = (assumptionId: string) => {
    if (
      !currentResult ||
      currentResult.answer.classification !== "inconsistent"
    )
      return;
    try {
      const h = workspace.hypotheses.find((item) => item.id === assumptionId)!;
      const removed = hypothesisLabel(h, workspace);
      const next = createConflictTrial(
        workspace,
        assumptionId,
        `${branch.name} · 试取消${workspace.branches.length}`,
      );
      setTrial({
        gameId: workspace.gameId,
        perspectiveSeat: workspace.perspectiveSeat,
        parentAssumptions: JSON.stringify(branch.assumptionIds),
        branchId: next.activeBranchId,
        parentBranchId: branch.id,
        parentName: branch.name,
        originalAnswer: currentResult.answer,
        removed,
        query: JSON.stringify(workspace.query),
        revision: branch.baseRevision,
      });
      onChange(next);
      void run(next);
    } catch (cause) {
      setFailure({ workspace, text: (cause as Error).message });
    }
  };
  const currentTrial =
    trial &&
    trial.gameId === workspace.gameId &&
    trial.perspectiveSeat === workspace.perspectiveSeat &&
    workspace.branches.some(
      (b) =>
        b.id === trial.parentBranchId &&
        b.baseRevision === trial.revision &&
        JSON.stringify(b.assumptionIds) === trial.parentAssumptions,
    ) &&
    trial.branchId === branch.id &&
    trial.query === JSON.stringify(workspace.query) &&
    trial.revision === branch.baseRevision
      ? trial
      : null;

  return (
    <div className="gr-form gr-reasoning">
      <label>
        推理分支
        <select
          aria-label="推理分支"
          value={branch.id}
          onChange={(e) =>
            onChange({ ...workspace, activeBranchId: e.target.value })
          }
        >
          {workspace.branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </label>
      <p>
        当前采用修订 {branch.baseRevision}。结论仅在所选前提下成立，不代表概率。
      </p>
      {branch.baseRevision < workspace.events.length && (
        <div className="gr-notice">
          <p>分支尚未包含最新记录（修订 {workspace.events.length}）。</p>
          <button
            onClick={() =>
              onChange({
                ...workspace,
                branches: workspace.branches.map((b) =>
                  b.id === branch.id
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
      {currentTrial && (
        <section
          className="gr-trial"
          aria-label="纠错分支对照"
          ref={trialPanel}
          tabIndex={-1}
        >
          <h3>试取消前提后的对照</h3>
          <p>
            原分支「{currentTrial.parentName}」保留不变。新分支取消：
            {currentTrial.removed}。
          </p>
          <p>
            对照采用相同的查询、事实记录与修订 {currentTrial.revision}
            ；若继续修改新分支前提，请重新查询。
          </p>
          <table>
            <thead>
              <tr>
                <th>分支</th>
                <th>查询结果</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>原分支（取消前）</td>
                <td>{classificationText(currentTrial.originalAnswer)}</td>
              </tr>
              <tr>
                <td>当前试验分支</td>
                <td>
                  {currentResult
                    ? classificationText(currentResult.answer)
                    : pending === workspace
                      ? "正在重新查询"
                      : "尚无当前版本结果"}
                </td>
              </tr>
            </tbody>
          </table>
          {currentResult && (
            <p>
              {currentResult.answer.classification === "inconsistent"
                ? "完整分支仍有冲突，可继续定位另一组前提。"
                : currentResult.answer.classification === "unknown"
                  ? "搜索未完成，不能认定冲突已解决。"
                  : "新分支已有有效世界；这只说明前提可以兼容，不代表被取消的前提一定错误。"}
            </p>
          )}
          <button
            onClick={() =>
              onChange({
                ...workspace,
                activeBranchId: currentTrial.parentBranchId,
              })
            }
          >
            返回原分支
          </button>
        </section>
      )}
      <h3>1. 采纳报告前提</h3>
      <p>
        “准确转述”表示玩家如实复述收到的信息；“能力有效”表示该时点身份和能力有效。两项都采纳后才用信息内容约束推理。
      </p>
      {!reports.length && (
        <p>
          尚无报告，请在玩家抽屉中选择“记录信息”。角色声称不会自动作为真实身份。
        </p>
      )}
      {reports.some((event) => !currentClaimIds.has(event.id)) && (
        <p>
          改口前的报告保留在历史中。一键分析采用最新声明；手动采纳的旧报告仍参与条件推理，请复核。
        </p>
      )}
      {reports.map((event) => (
        <fieldset key={event.id} className="gr-report">
          <legend>
            {eventLabel(event)} · {timeLabel(event.occurredAt)}
            {!currentClaimIds.has(event.id) ? " · 改口前的历史报告" : ""}
          </legend>
          {(["report_accurate", "ability_active"] as const).map((kind) => (
            <label key={kind} className="gr-check">
              <input
                type="checkbox"
                checked={selected.some(
                  (h) => h.kind === kind && h.eventId === event.id,
                )}
                onChange={() => toggleReport(kind, event.id)}
              />
              {kind === "report_accurate" ? "采纳准确转述" : "能力有效"}
            </label>
          ))}
        </fieldset>
      ))}
      {selected
        .filter(
          (h) =>
            (h.kind !== "report_accurate" && h.kind !== "ability_active") ||
            !reports.some((e) => "eventId" in h && h.eventId === e.id),
        )
        .map((h) => (
          <label className="gr-check" key={h.id}>
            <input
              type="checkbox"
              checked
              onChange={() =>
                onChange(toggleStandardHypothesis(workspace, h.id))
              }
            />
            {hypothesisLabel(h, workspace)}
          </label>
        ))}
      <h3>2. 查询角色</h3>
      <label>
        查询时点
        <select
          aria-label="魔典查询时点"
          value={workspace.query.stage ?? "initial"}
          onChange={(e) =>
            onChange({
              ...workspace,
              query: {
                ...workspace.query,
                stage: e.target.value as "initial" | "current",
              },
            })
          }
        >
          <option value="initial">初始真实角色</option>
          <option value="current">最新封闭阶段的当前角色</option>
        </select>
      </label>
      <div className="gr-form-row">
        <label>
          座位
          <select
            aria-label="魔典查询座位"
            value={workspace.query.seat}
            onChange={(e) =>
              onChange({
                ...workspace,
                query: { ...workspace.query, seat: Number(e.target.value) },
              })
            }
          >
            {Array.from({ length: workspace.playerCount }, (_, i) => (
              <option key={i} value={i + 1}>
                {i + 1}号
              </option>
            ))}
          </select>
        </label>
        <label>
          角色
          <select
            aria-label="魔典查询角色"
            value={workspace.query.role}
            onChange={(e) =>
              onChange({
                ...workspace,
                query: { ...workspace.query, role: e.target.value as Role },
              })
            }
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_ZH[r]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button
        className="gr-primary"
        disabled={pending === workspace}
        onClick={() => void run()}
      >
        {pending === workspace ? "正在推理…" : "运行推理"}
      </button>
      {result && !currentResult && (
        <p role="status">记录、前提或命题已变化，请重新运行推理。</p>
      )}
      {failure?.workspace === workspace && (
        <div className="gr-error" role="alert">
          <p>{failure.text}</p>
          <p>本次没有得出结论。请核对记录时间、阶段完整性与采纳前提后重试。</p>
        </div>
      )}
      {currentResult && (
        <section className="gr-query-result" aria-label="魔典推理结果">
          <h3>3. {classificationText(currentResult.answer)}</h3>
          <p role="status">
            {workspace.query.seat}号的
            {workspace.query.stage === "current" ? "当前" : "初始"}真实角色是
            {ROLE_ZH[workspace.query.role]}：
            {classificationText(currentResult.answer)}。
          </p>
          <p>
            范围：
            {currentResult.answer.scope === "bounded_timeline"
              ? "已封闭日夜与可能的隐藏行动"
              : currentResult.answer.scope === "first_night_slice"
                ? "初始设置及采纳的首夜报告"
                : "初始角色设置"}
            。
          </p>
          {currentResult.answer.classification === "unknown" && (
            <p>
              {currentResult.answer.unknownReason === "time_budget"
                ? "已达到时间预算，可减少查询范围后重试。"
                : currentResult.answer.unknownReason === "candidate_limit"
                  ? "候选或行动数量达到上限，可补充已知记录后重试。"
                  : "存在尚未支持或未完成的规则分支。"}
              不能据此排除任何角色。
            </p>
          )}
          {currentResult.answer.classification === "inconsistent" && (
            <ConflictPanel
              workspace={workspace}
              onTrial={tryWithout}
              onReviewSource={onReviewSource}
            />
          )}
          <details>
            <summary>查看依据与来源</summary>
            <p>
              分支：{branch.name} · 修订 {branch.baseRevision}
            </p>
            <p>规则版本：{currentResult.answer.rulesetHash}</p>
            <p>采纳前提：{selected.length} 项</p>
            <ul>
              {selected.map((h) => (
                <li key={h.id}>{hypothesisLabel(h, workspace)}</li>
              ))}
            </ul>
            {currentResult.sourceIds.map((id) => {
              const e = visible.find((e) => e.id === id);
              return (
                <p key={id}>
                  {e
                    ? `${eventLabel(e)} · ${timeLabel(e.occurredAt)} · ${e.rawText}`
                    : id}
                </p>
              );
            })}
          </details>
          {currentResult.answer.yes && (
            <StandardWitnessCard
              witness={currentResult.answer.yes}
              title="支持命题的见证"
            />
          )}
          {currentResult.answer.no && (
            <StandardWitnessCard
              witness={currentResult.answer.no}
              title="推翻命题的反例"
            />
          )}
        </section>
      )}
    </div>
  );
}
