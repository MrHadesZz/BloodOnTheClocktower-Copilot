import { useRef, useState } from "react";
import { Attribution } from "./Attribution";
import { ArrowLeft, Download, FilePlus2, Menu, Upload } from "lucide-react";
import {
  eventLabel,
  ROLE_ZH,
  ROLES,
  timeLabel,
  type EventDraft,
  type Role,
} from "../core/model";
import { parseEntry } from "../core/parser";
import {
  addStandardHypothesis,
  commitStandardDrafts,
  createStandardBranch,
  createStandardWorkspace,
  prepareStandardObservedQuery,
  prepareStandardSetupQuery,
  publicTranscript,
  retractStandardEvent,
  toggleStandardHypothesis,
  validateStandardWorkspace,
  visibleStandardEvents,
  type HypothesisDraft,
  type StandardHypothesis,
  type StandardWorkspace,
} from "../core/standardWorkspace";
import type { SetupQueryResult } from "../core/symbolicSetup";
import { queryZ3Observed, queryZ3Setup } from "../core/z3Client";

import { classificationText, StandardWitnessCard } from "./StandardQueryResult";

interface Props {
  workspace: StandardWorkspace;
  onChange: (next: StandardWorkspace) => void;
  onBack: () => void;
  onExample: () => void;
  saved: string;
  offlineReady: boolean;
}

const seats = (count: number) => Array.from({ length: count }, (_, i) => i + 1);
const roleOptions = ROLES.map((role) => ({ role, label: ROLE_ZH[role] }));

function saveJson(filename: string, value: unknown) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function StandardWorkbench({
  workspace,
  onChange,
  onBack,
  onExample,
  saved,
  offlineReady,
}: Props) {
  const branch = workspace.branches.find(
    (item) => item.id === workspace.activeBranchId,
  )!;
  const visible = visibleStandardEvents(
    workspace,
    workspace.perspectiveSeat,
    branch.baseRevision,
  );
  const behind = branch.baseRevision < workspace.events.length;
  const reports = visible.filter(
    (event) =>
      event.payload.kind === "claim" &&
      event.payload.claimKind === "ability_report",
  );
  const [text, setText] = useState("");
  const [drafts, setDrafts] = useState<EventDraft[] | null>(null);
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    workspace: StandardWorkspace;
    answer: SetupQueryResult;
    revision: number;
    sourceIds: string[];
    assumptionIds: string[];
  } | null>(null);
  const [pending, setPending] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [newCount, setNewCount] = useState(workspace.playerCount);
  const [newPerspective, setNewPerspective] = useState(
    workspace.perspectiveSeat,
  );
  const [factSeat, setFactSeat] = useState(1);
  const [factRole, setFactRole] = useState<Role>("Imp");
  const [seenTokenRole, setSeenTokenRole] = useState<Role>("Investigator");
  const [poisonerSeat, setPoisonerSeat] = useState(1);
  const [poisonTarget, setPoisonTarget] = useState(2);
  const request = useRef(0);
  const resultEvidence = result?.workspace === workspace ? result : null;
  const currentResult = resultEvidence?.answer ?? null;

  const preview = () => {
    try {
      setDrafts(
        parseEntry(text, {
          playerCount: workspace.playerCount,
          profile: "standard",
        }),
      );
      setError("");
    } catch (cause) {
      setDrafts(null);
      setError((cause as Error).message);
    }
  };
  const commit = () => {
    if (!drafts) return;
    try {
      const next = commitStandardDrafts(
        workspace,
        text.trim(),
        drafts,
        visibility,
      );
      onChange(next);
      setText("");
      setDrafts(null);
      setError("");
    } catch (cause) {
      setDrafts(null);
      setError((cause as Error).message);
    }
  };
  const addAndUse = (draft: HypothesisDraft) => {
    try {
      const added = addStandardHypothesis(workspace, draft);
      onChange(
        toggleStandardHypothesis(
          added,
          added.hypotheses[added.hypotheses.length - 1].id,
        ),
      );
      setError("");
    } catch (cause) {
      setError((cause as Error).message);
    }
  };
  const premise = (
    kind: "report_accurate" | "ability_active",
    eventId: string,
  ) =>
    workspace.hypotheses.find(
      (item) => item.kind === kind && item.eventId === eventId,
    );
  const toggleReport = (
    kind: "report_accurate" | "ability_active",
    eventId: string,
  ) => {
    const existing = premise(kind, eventId);
    if (existing) onChange(toggleStandardHypothesis(workspace, existing.id));
    else addAndUse({ kind, eventId });
  };
  const run = async () => {
    const hasPhysicalEvents = visible.some((event) =>
      [
        "nomination",
        "vote",
        "execution",
        "death",
        "slayer",
        "winner",
        "phase_closed",
      ].includes(event.payload.kind),
    );
    const prepared = hasPhysicalEvents
      ? prepareStandardObservedQuery(workspace)
      : prepareStandardSetupQuery(workspace);
    if (prepared.status === "unsupported") {
      setError(prepared.reason);
      setResult(null);
      return;
    }
    const id = ++request.current;
    setPending(true);
    setError("");
    setResult(null);
    try {
      const answer = hasPhysicalEvents
        ? await queryZ3Observed(
            prepared.input as Parameters<typeof queryZ3Observed>[0],
          )
        : await queryZ3Setup(prepared.input);
      if (id === request.current)
        setResult({
          workspace,
          answer,
          revision: prepared.revision,
          sourceIds: prepared.sourceIds,
          assumptionIds: [...branch.assumptionIds],
        });
    } catch (cause) {
      if (id === request.current) setError((cause as Error).message);
    } finally {
      if (id === request.current) setPending(false);
    }
  };
  const importFile = async (file: File) => {
    try {
      const next = validateStandardWorkspace(JSON.parse(await file.text()));
      onChange(next);
      setSelectedEventId(null);
      setError("");
    } catch (cause) {
      setError((cause as Error).message);
    }
  };
  const selected = visible.find((event) => event.id === selectedEventId);
  const active = new Set(branch.assumptionIds);
  const roleFacts = workspace.hypotheses.filter(
    (item): item is Extract<StandardHypothesis, { kind: "actual_role" }> =>
      item.kind === "actual_role" && active.has(item.id),
  );
  const seenTokens = workspace.hypotheses.filter(
    (item): item is Extract<StandardHypothesis, { kind: "seen_token" }> =>
      item.kind === "seen_token" && active.has(item.id),
  );
  const poisonActions = workspace.hypotheses.filter(
    (item): item is Extract<StandardHypothesis, { kind: "night_one_poison" }> =>
      item.kind === "night_one_poison" && active.has(item.id),
  );

  return (
    <div className="app-shell standard-shell">
      <header className="topbar">
        <div className="brand">
          <img className="brand-mark" src="/favicon.svg" alt="" />
          <div>
            <strong>钟楼推理台</strong>
            <span>标准对局 · 私密视角</span>
            <Attribution />
          </div>
        </div>
        <div className="session">
          <strong>{workspace.title}</strong>
          <small>
            {workspace.playerCount} 人 · 本地 {workspace.perspectiveSeat} 号视角
            {import.meta.env.PROD &&
              ` · ${offlineReady ? "离线资源已就绪" : "离线资源准备中"}`}
          </small>
        </div>
        <div className="branch-picker">
          <select
            aria-label="标准对局分支"
            value={branch.id}
            onChange={(event) =>
              onChange({ ...workspace, activeBranchId: event.target.value })
            }
          >
            {workspace.branches.map((item) => (
              <option value={item.id} key={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div className="save-status">
          <i />
          {saved}
        </div>
        <nav className="top-actions" aria-label="标准对局操作">
          <button onClick={onExample}>八人示例</button>
          <button onClick={onBack}>
            <ArrowLeft size={16} />
            返回魔典
          </button>
          <button
            onClick={() => onChange(createStandardBranch(workspace, "新分支"))}
          >
            <FilePlus2 size={16} />
            新分支
          </button>
          <button
            onClick={() =>
              saveJson(
                `clocktower-public-${workspace.gameId}.json`,
                publicTranscript(workspace),
              )
            }
            title="只包含显式公开事件"
          >
            <Download size={16} />
            公开导出
          </button>
          <button
            onClick={() =>
              saveJson(`clocktower-private-${workspace.gameId}.json`, workspace)
            }
            title="包含私密记录与全部假设"
          >
            <Download size={16} />
            私密全量导出
          </button>
          <label className="import-button" title="导入私密全量工作区">
            <Upload size={16} />
            导入
            <input
              type="file"
              accept="application/json,.json"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void importFile(file);
                event.target.value = "";
              }}
            />
          </label>
        </nav>
        <details className="mobile-actions standard-mobile-actions">
          <summary aria-label="标准对局菜单">
            <Menu size={21} />
          </summary>
          <div>
            <button onClick={onBack}>返回魔典</button>
            <button onClick={onExample}>八人示例</button>
            <button
              onClick={() =>
                onChange(createStandardBranch(workspace, "新分支"))
              }
            >
              新分支
            </button>
            <button
              onClick={() =>
                saveJson(
                  `clocktower-public-${workspace.gameId}.json`,
                  publicTranscript(workspace),
                )
              }
            >
              公开导出
            </button>
            <button
              onClick={() =>
                saveJson(
                  `clocktower-private-${workspace.gameId}.json`,
                  workspace,
                )
              }
            >
              私密全量导出
            </button>
            <label>
              导入
              <input
                type="file"
                accept="application/json,.json"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void importFile(file);
                  event.target.value = "";
                }}
              />
            </label>
          </div>
        </details>
      </header>
      {error && (
        <div className="global-error" role="alert">
          {error}
          <button onClick={() => setError("")}>关闭</button>
        </div>
      )}
      <div className="workspace standard-workspace">
        <div className="left-column">
          <aside className="player-rail">
            <div className="rail-head">
              <span>
                玩家 <em>（{workspace.playerCount}）</em>
              </span>
            </div>
            <div className="player-list">
              {seats(workspace.playerCount).map((seat) => {
                const claims = visible.filter(
                  (event) =>
                    event.payload.kind === "claim" &&
                    event.payload.claimKind === "role" &&
                    event.payload.speaker === seat,
                );
                const role = claims.at(-1)?.payload;
                const dead = visible.some(
                  (event) =>
                    event.payload.kind === "death" &&
                    event.payload.seat === seat,
                );
                return (
                  <button
                    className={`player-row ${workspace.selectedSeat === seat ? "selected" : ""}`}
                    key={seat}
                    onClick={() =>
                      onChange({ ...workspace, selectedSeat: seat })
                    }
                  >
                    <span className="seat-number">{seat}</span>
                    <span className="player-copy">
                      <strong>{seat}号玩家</strong>
                      <small>
                        {role?.kind === "claim"
                          ? `声称：${ROLE_ZH[role.role]}`
                          : "尚无角色声明"}
                      </small>
                    </span>
                    <span className={`life-status ${dead ? "dead" : ""}`}>
                      {dead ? "死亡" : "存活"}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="rail-bottom">
              <span>仅显示当前视角可见记录</span>
            </div>
          </aside>
        </div>
        <main className="main-column">
          <section className="entry-bar" aria-label="标准对局快速记录">
            <div className="entry-row">
              <label htmlFor="standard-entry">快速记录</label>
              <div className="entry-input">
                <input
                  id="standard-entry"
                  disabled={behind}
                  value={text}
                  onChange={(event) => {
                    setText(event.target.value);
                    setDrafts(null);
                    setError("");
                  }}
                  placeholder="例如：1 inv 2/3 baron @N1"
                />
                <button
                  className="primary-button"
                  onClick={drafts ? commit : preview}
                  disabled={behind}
                >
                  {drafts ? "确认录入" : "预览录入"}
                </button>
              </div>
            </div>
            <div className="standard-entry-meta">
              <label>
                可见范围{" "}
                <select
                  value={visibility}
                  onChange={(event) =>
                    setVisibility(event.target.value as "private" | "public")
                  }
                >
                  <option value="private">仅本地视角</option>
                  <option value="public">公开事实或发言</option>
                </select>
              </label>
              <span>
                支持报告、声明、猎手、胜负与公开事件；录入不自动采纳报告。
              </span>
            </div>
            {drafts && (
              <div className="entry-preview">
                <span>将记录为</span>
                {drafts.map((draft, index) => (
                  <span className="draft-chip" key={index}>
                    {draft.label} · {timeLabel(draft.occurredAt)}
                  </span>
                ))}
                <button onClick={() => setDrafts(null)}>取消</button>
              </div>
            )}
          </section>
          <div className="main-content">
            <section className="standard-panel">
              <div className="standard-intro">
                <h1>标准对局推理</h1>
                <p className="standard-perspective">
                  {workspace.playerCount} 人 · 本地 {workspace.perspectiveSeat}{" "}
                  号视角
                </p>
                <p>
                  记录与假设按分支、修订和本地视角隔离。初始设置与首夜报告可直接查询；跨阶段查询需逐日封闭行动与死亡、逐夜封闭死亡，隐藏行动搜索超出预算会返回未知。
                </p>
              </div>
              <div className="standard-create">
                <label>
                  新对局人数{" "}
                  <select
                    aria-label="新对局人数"
                    value={newCount}
                    onChange={(event) => {
                      const count = Number(event.target.value);
                      setNewCount(count);
                      setNewPerspective(Math.min(newPerspective, count));
                    }}
                  >
                    {seats(15)
                      .filter((seat) => seat >= 7)
                      .map((seat) => (
                        <option key={seat} value={seat}>
                          {seat}人
                        </option>
                      ))}
                  </select>
                </label>
                <label>
                  你的视角{" "}
                  <select
                    aria-label="新对局视角座位"
                    value={newPerspective}
                    onChange={(event) =>
                      setNewPerspective(Number(event.target.value))
                    }
                  >
                    {seats(newCount).map((seat) => (
                      <option key={seat} value={seat}>
                        {seat}号
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  onClick={() => {
                    if (
                      (workspace.events.length ||
                        workspace.hypotheses.length) &&
                      !window.confirm(
                        "新建对局会替换当前本地标准对局；请先导出备份。继续吗？",
                      )
                    )
                      return;
                    onChange(createStandardWorkspace(newCount, newPerspective));
                  }}
                >
                  新建标准对局
                </button>
              </div>
              {branch.baseRevision < workspace.events.length && (
                <div className="revision-banner">
                  当前分支停留在修订 {branch.baseRevision}；新记录到修订{" "}
                  {workspace.events.length}。
                  <button
                    onClick={() =>
                      onChange({
                        ...workspace,
                        branches: workspace.branches.map((item) =>
                          item.id === branch.id
                            ? { ...item, baseRevision: workspace.events.length }
                            : item,
                        ),
                      })
                    }
                  >
                    更新到最新记录
                  </button>
                </div>
              )}
              <div className="standard-section">
                <h2>跨阶段记录完整性</h2>
                <p>
                  完成一天后输入 close actions @D1 与 close deaths
                  @D1；完成后续夜晚输入 close deaths
                  @N2。同一天的提名与猎手行动请按发生顺序录入。未记录的阶段不等于零事件，只有明确封闭的阶段会进入动态推理。
                </p>
              </div>
              <div className="standard-section">
                <h2>本地视角所见 token</h2>
                <div className="setup-add-row">
                  <span>{workspace.perspectiveSeat}号看到</span>
                  <select
                    aria-label="所见角色token"
                    value={seenTokenRole}
                    onChange={(event) =>
                      setSeenTokenRole(event.target.value as Role)
                    }
                  >
                    {roleOptions.map((option) => (
                      <option key={option.role} value={option.role}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() =>
                      addAndUse({
                        kind: "seen_token",
                        seat: workspace.perspectiveSeat,
                        shownRole: seenTokenRole,
                      })
                    }
                  >
                    采纳所见 token
                  </button>
                </div>
                <div className="standard-chips">
                  {seenTokens.map((token) => (
                    <button
                      key={token.id}
                      onClick={() =>
                        onChange(toggleStandardHypothesis(workspace, token.id))
                      }
                    >
                      {token.seat}号所见{ROLE_ZH[token.shownRole]} ×
                    </button>
                  ))}
                </div>
                <p>
                  所见角色不自动等于真实角色；酒鬼可能看到未在场的镇民 token。
                </p>
              </div>
              <div className="standard-section">
                <h2>真实角色假设</h2>
                <div className="setup-add-row">
                  <select
                    aria-label="角色假设座位"
                    value={factSeat}
                    onChange={(event) =>
                      setFactSeat(Number(event.target.value))
                    }
                  >
                    {seats(workspace.playerCount).map((seat) => (
                      <option key={seat} value={seat}>
                        {seat}号
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="假设真实角色"
                    value={factRole}
                    onChange={(event) =>
                      setFactRole(event.target.value as Role)
                    }
                  >
                    {roleOptions.map((option) => (
                      <option key={option.role} value={option.role}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() =>
                      addAndUse({
                        kind: "actual_role",
                        seat: factSeat,
                        role: factRole,
                      })
                    }
                  >
                    添加假设
                  </button>
                </div>
                <div className="standard-chips">
                  {roleFacts.map((fact) => (
                    <button
                      key={fact.id}
                      onClick={() =>
                        onChange(toggleStandardHypothesis(workspace, fact.id))
                      }
                    >
                      {fact.seat}号是{ROLE_ZH[fact.role]} ×
                    </button>
                  ))}
                </div>
              </div>
              <div className="standard-section">
                <h2>首夜投毒 What-if</h2>
                <div className="setup-add-row">
                  <select
                    aria-label="假设投毒者座位"
                    value={poisonerSeat}
                    onChange={(event) =>
                      setPoisonerSeat(Number(event.target.value))
                    }
                  >
                    {seats(workspace.playerCount).map((seat) => (
                      <option key={seat} value={seat}>
                        {seat}号
                      </option>
                    ))}
                  </select>
                  <span>选择</span>
                  <select
                    aria-label="假设投毒目标"
                    value={poisonTarget}
                    onChange={(event) =>
                      setPoisonTarget(Number(event.target.value))
                    }
                  >
                    {seats(workspace.playerCount).map((seat) => (
                      <option key={seat} value={seat}>
                        {seat}号
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() =>
                      addAndUse({
                        kind: "night_one_poison",
                        poisonerSeat,
                        targetSeat: poisonTarget,
                      })
                    }
                  >
                    添加行动假设
                  </button>
                </div>
                <div className="standard-chips">
                  {poisonActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() =>
                        onChange(toggleStandardHypothesis(workspace, action.id))
                      }
                    >
                      {action.poisonerSeat}号投毒{action.targetSeat}号 ×
                    </button>
                  ))}
                </div>
              </div>
              <div className="standard-section">
                <h2>报告前提</h2>
                {reports.length === 0 ? (
                  <p>当前修订与视角下没有能力报告。</p>
                ) : (
                  reports.map((event) => {
                    const accurate = premise("report_accurate", event.id);
                    const activeAbility = premise("ability_active", event.id);
                    return (
                      <div className="standard-report" key={event.id}>
                        <strong>
                          {eventLabel(event)} · {timeLabel(event.occurredAt)}
                        </strong>
                        <label>
                          <input
                            type="checkbox"
                            checked={!!accurate && active.has(accurate.id)}
                            onChange={() =>
                              toggleReport("report_accurate", event.id)
                            }
                          />
                          采纳准确转述
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={
                              !!activeAbility && active.has(activeAbility.id)
                            }
                            onChange={() =>
                              toggleReport("ability_active", event.id)
                            }
                          />
                          能力有效
                        </label>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="standard-section">
                <h2>要检验的命题</h2>
                <div className="setup-add-row">
                  <select
                    aria-label="查询时点"
                    value={workspace.query.stage ?? "initial"}
                    onChange={(event) =>
                      onChange({
                        ...workspace,
                        query: {
                          ...workspace.query,
                          stage: event.target.value as "initial" | "current",
                        },
                      })
                    }
                  >
                    <option value="initial">初始真实角色</option>
                    <option value="current">当前真实角色</option>
                  </select>
                  <select
                    aria-label="标准查询座位"
                    value={workspace.query.seat}
                    onChange={(event) =>
                      onChange({
                        ...workspace,
                        query: {
                          ...workspace.query,
                          seat: Number(event.target.value),
                        },
                      })
                    }
                  >
                    {seats(workspace.playerCount).map((seat) => (
                      <option key={seat} value={seat}>
                        {seat}号
                      </option>
                    ))}
                  </select>
                  <span>真实角色是</span>
                  <select
                    aria-label="标准查询角色"
                    value={workspace.query.role}
                    onChange={(event) =>
                      onChange({
                        ...workspace,
                        query: {
                          ...workspace.query,
                          role: event.target.value as Role,
                        },
                      })
                    }
                  >
                    {roleOptions.map((option) => (
                      <option key={option.role} value={option.role}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    className="primary-button compact"
                    onClick={() => void run()}
                    disabled={pending}
                  >
                    {pending ? "正在求解" : "运行标准查询"}
                  </button>
                </div>
              </div>
              {currentResult && (
                <div className="setup-result" role="status">
                  <strong>{classificationText(currentResult)}</strong>
                  <p>
                    {workspace.query.seat}号的
                    {workspace.query.stage === "current" ? "当前" : "初始"}
                    真实角色是
                    {ROLE_ZH[workspace.query.role]}：
                    {classificationText(currentResult)}。范围：
                    {currentResult.scope === "bounded_timeline"
                      ? "封闭日夜事实与可能的隐藏行动"
                      : currentResult.scope === "first_night_slice"
                        ? "初始设置及采纳的首夜信息"
                        : "初始设置"}
                    ；不代表概率。
                  </p>
                  {currentResult.classification === "unknown" && (
                    <p>
                      搜索未能完成：
                      {currentResult.unknownReason === "candidate_limit"
                        ? "候选或行动数量达到上限"
                        : currentResult.unknownReason === "time_budget"
                          ? "达到时间预算"
                          : "某个行动或规则分支尚未支持"}
                      。不能据此排除任何角色。
                    </p>
                  )}
                  <details className="standard-provenance">
                    <summary>查看规则、修订与来源</summary>
                    <p>规则版本：{currentResult.rulesetHash}</p>
                    <p>
                      对局修订：{resultEvidence?.revision} · 分支：{branch.name}
                    </p>
                    <p>
                      采纳假设：
                      {resultEvidence?.assumptionIds.join("、") || "无"}
                    </p>
                    <p>
                      报告来源事件：
                      {resultEvidence?.sourceIds.join("、") || "无"}
                    </p>
                  </details>
                  {currentResult.yes && (
                    <StandardWitnessCard
                      witness={currentResult.yes}
                      title="支持命题的见证"
                    />
                  )}
                  {currentResult.no && (
                    <StandardWitnessCard
                      witness={currentResult.no}
                      title="推翻命题的反例"
                    />
                  )}
                </div>
              )}
            </section>
          </div>
        </main>
        <div className="right-column">
          <aside className="timeline">
            <div className="timeline-head">
              <h2>当前视角时间线</h2>
              <span>修订 {branch.baseRevision}</span>
            </div>
            {selected ? (
              <div className="event-inspector">
                <button
                  className="back-link"
                  onClick={() => setSelectedEventId(null)}
                >
                  返回时间线
                </button>
                <h3>{eventLabel(selected)}</h3>
                <p>{selected.rawText}</p>
                <small>
                  {selected.visibility === "public" ? "公开" : "仅本地视角"} ·{" "}
                  {timeLabel(selected.occurredAt)}
                </small>
                <button
                  disabled={behind}
                  onClick={() => {
                    if (!window.confirm("追加撤回记录，保留原始历史？")) return;
                    try {
                      onChange(retractStandardEvent(workspace, selected.id));
                      setSelectedEventId(null);
                    } catch (cause) {
                      setError((cause as Error).message);
                    }
                  }}
                >
                  撤回误录
                </button>
              </div>
            ) : (
              <div className="standard-timeline">
                {[...visible].reverse().map((event) => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEventId(event.id)}
                  >
                    <span>{eventLabel(event)}</span>
                    <small>
                      {timeLabel(event.occurredAt)} · r{event.revision}
                    </small>
                  </button>
                ))}
                {visible.length === 0 && <p>尚无当前视角可见记录。</p>}
              </div>
            )}
          </aside>
        </div>
      </div>
      <footer className="app-footer">
        标准 7–15 人工作区 · 私密本地存储 ·
        支持初始设置、首夜信息与已封闭日夜查询
      </footer>
    </div>
  );
}
