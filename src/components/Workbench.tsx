import { useState } from "react";
import { Attribution } from "./Attribution";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  Download,
  FilePlus2,
  GitBranch,
  Menu,
  RotateCcw,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Upload,
  UsersRound,
  X,
} from "lucide-react";
import {
  activeEvents,
  ASSUMPTIONS,
  AssumptionId,
  Branch,
  EventDraft,
  EventEnvelope,
  eventLabel,
  ROLE_ZH,
  Role,
  ROLES,
  timeLabel,
  WorkspaceData,
} from "../core/model";
import { parseEntry } from "../core/parser";
import type { EssentialPremise } from "../core/analysis";
import { SetupExplorer } from "./SetupExplorer";
import { defaultSetupDraft, type SetupDraft } from "../core/setupDraft";
import {
  availableAssumptions,
  classify,
  projectedWitnesses,
  Query,
  RULESET_HASH,
  SolverResult,
  Witness,
} from "../core/solver";

const seatNames = [
  "1号玩家",
  "2号玩家",
  "3号玩家",
  "4号玩家",
  "5号玩家",
  "6号玩家",
  "7号玩家",
  "8号玩家",
];
const roleOptions = ROLES.map((role) => ({
  value: role,
  label: ROLE_ZH[role],
}));
const assumptionLabel = (id: AssumptionId) =>
  ASSUMPTIONS.find((a) => a.id === id)?.label ?? id;

export function TopBar({
  data,
  branch,
  saved,
  onSelectBranch,
  onNewBranch,
  onExport,
  onImport,
  onReset,
  onOpenStandard,
}: {
  data: WorkspaceData;
  branch: Branch;
  saved: string;
  onSelectBranch: (id: string) => void;
  onNewBranch: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
  onOpenStandard: () => void;
}) {
  const latestTime = [...activeEvents(data.events)]
    .reverse()
    .find((event) => event.occurredAt)?.occurredAt;
  return (
    <header className="topbar">
      <div className="brand">
        <img className="brand-mark" src="/favicon.svg" alt="" />
        <div>
          <strong>钟楼推理台</strong>
          <span>记录 · 推理 · 更接近真相</span>
          <Attribution />
        </div>
      </div>
      <div className="session">
        <strong>最新记录 · {timeLabel(latestTime)}</strong>
        <small>8 人局 · H0 限定案例</small>
      </div>
      <div className="branch-picker">
        <GitBranch size={15} />
        <select
          aria-label="当前分支"
          value={branch.id}
          onChange={(e) => onSelectBranch(e.target.value)}
        >
          {data.branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <ChevronDown size={14} />
      </div>
      <div className="save-status">
        <i />
        {saved}
      </div>
      <nav className="top-actions" aria-label="工作区操作">
        <button
          onClick={onOpenStandard}
          title="打开标准 7–15 人对局"
          aria-label="标准对局"
        >
          <UsersRound size={17} />
          <span>标准对局</span>
        </button>
        <button onClick={onNewBranch} title="复制当前分支">
          <FilePlus2 size={17} />
          <span>新分支</span>
        </button>
        <button onClick={onExport} title="导出当前工作区">
          <Download size={17} />
          <span>导出</span>
        </button>
        <label className="import-button" title="导入工作区">
          <Upload size={17} />
          <span>导入</span>
          <input
            type="file"
            accept="application/json,.json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImport(file);
              e.target.value = "";
            }}
          />
        </label>
        <button onClick={onReset} title="重置示例">
          <RotateCcw size={17} />
          <span>重置</span>
        </button>
      </nav>
      <details className="mobile-actions">
        <summary aria-label="工作区菜单">
          <Menu size={21} />
        </summary>
        <div>
          <button onClick={onOpenStandard}>
            <UsersRound size={16} />
            标准对局
          </button>
          <button onClick={onNewBranch}>
            <FilePlus2 size={16} />
            新分支
          </button>
          <button onClick={onExport}>
            <Download size={16} />
            导出
          </button>
          <label>
            <Upload size={16} />
            导入
            <input
              type="file"
              accept="application/json,.json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImport(file);
                e.target.value = "";
              }}
            />
          </label>
          <button onClick={onReset}>
            <RotateCcw size={16} />
            重置示例
          </button>
        </div>
      </details>
    </header>
  );
}

export function PlayerRail({
  data,
  revision,
  selectedSeat,
  onSelect,
}: {
  data: WorkspaceData;
  revision: number;
  selectedSeat: number;
  onSelect: (seat: number) => void;
}) {
  const events = activeEvents(data.events, revision);
  return (
    <aside className="player-rail">
      <div className="rail-head">
        <span>
          玩家 <em>（8）</em>
        </span>
        <span className="rail-subtle">按座位顺序</span>
      </div>
      <div className="player-list">
        {seatNames.map((name, i) => {
          const seat = i + 1;
          const claims = events.filter(
            (e) =>
              e.payload.kind === "claim" &&
              e.payload.speaker === seat &&
              e.payload.claimKind === "role",
          );
          const latestRole = claims.at(-1)?.payload;
          const recent = [...events]
            .reverse()
            .find(
              (e) => e.payload.kind === "claim" && e.payload.speaker === seat,
            );
          const dead = events.some(
            (e) => e.payload.kind === "death" && e.payload.seat === seat,
          );
          return (
            <button
              className={`player-row ${selectedSeat === seat ? "selected" : ""}`}
              key={seat}
              onClick={() => onSelect(seat)}
            >
              <span className="seat-number">{seat}</span>
              <span className="player-copy">
                <strong>{name}</strong>
                <small>
                  {latestRole?.kind === "claim"
                    ? `声称：${ROLE_ZH[latestRole.role]}`
                    : "尚无角色声明"}
                </small>
                <span>{recent ? eventLabel(recent) : "尚无发言记录"}</span>
              </span>
              <span className={`life-status ${dead ? "dead" : ""}`}>
                {dead ? "死亡" : "存活"}
              </span>
            </button>
          );
        })}
      </div>
      <div className="rail-bottom">
        <span>H0 固定角色袋</span>
        <strong>4 个座位待分配</strong>
      </div>
    </aside>
  );
}

export function EntryBar({
  onCommit,
}: {
  onCommit: (text: string, drafts: EventDraft[]) => void;
}) {
  const [text, setText] = useState("");
  const [drafts, setDrafts] = useState<EventDraft[] | null>(null);
  const [error, setError] = useState("");
  const preview = () => {
    try {
      setDrafts(parseEntry(text));
      setError("");
    } catch (e) {
      setDrafts(null);
      setError((e as Error).message);
    }
  };
  const commit = () => {
    if (!drafts) return;
    try {
      onCommit(text.trim(), drafts);
      setText("");
      setDrafts(null);
      setError("");
    } catch (e) {
      setDrafts(null);
      setError((e as Error).message);
    }
  };
  return (
    <section className="entry-bar" aria-label="快速记录">
      <div className="entry-row">
        <label htmlFor="quick-entry">快速记录</label>
        <div className="entry-input">
          <input
            id="quick-entry"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setDrafts(null);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                preview();
              }
            }}
            placeholder="例如：3 ft 7/8 no @N1"
          />
          <button
            className="primary-button"
            onClick={drafts ? commit : preview}
          >
            {drafts ? "确认录入" : "预览录入"}
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
      {drafts ? (
        <div className="entry-preview">
          <span>将记录为</span>
          {drafts.map((d, i) => (
            <span className="draft-chip" key={i}>
              {d.label} · {timeLabel(d.occurredAt)}
            </span>
          ))}
          <button onClick={() => setDrafts(null)} aria-label="取消预览">
            <X size={15} />
          </button>
        </div>
      ) : (
        <p className={error ? "entry-error" : "entry-hint"}>
          {error ||
            "支持：1 inv 4/5 poisoner @N1 · 4 nom 5 @D1 · 5 dead @D1 · close deaths @N2"}
        </p>
      )}
    </section>
  );
}

function WitnessView({ witness, title }: { witness: Witness; title: string }) {
  return (
    <div className="witness">
      <div className="witness-head">
        <strong>{title}</strong>
        <span>可重放候选历史</span>
      </div>
      <div className="role-grid">
        {Array.from({ length: 8 }, (_, i) => i + 1).map((seat) => (
          <div key={seat}>
            <b>{seat}</b>
            <span>{ROLE_ZH[witness.roles[seat]]}</span>
          </div>
        ))}
      </div>
      <p>
        N1 投毒：{witness.poisonN1}号 · 占卜师红鲱鱼：{witness.redHerring}号
        {witness.poisonN2 !== undefined
          ? ` · N2 投毒者选择：${witness.poisonN2 === null ? "无" : `${witness.poisonN2}号`}`
          : ""}
        {witness.monkGuardN2 !== undefined
          ? ` · N2 僧侣选择：${witness.monkGuardN2 === null ? "无" : `${witness.monkGuardN2}号`}`
          : ""}
        {witness.impTargetN2 !== undefined
          ? ` · N2 恶魔目标：${witness.impTargetN2}号`
          : ""}
        {witness.impSuccessorN2
          ? ` · N2 继任小恶魔：${witness.impSuccessorN2}号`
          : ""}
        {witness.poisonedAtInfoN2 !== undefined
          ? ` · 信息结算时中毒：${witness.poisonedAtInfoN2 === null ? "无" : `${witness.poisonedAtInfoN2}号`}`
          : ""}
      </p>
    </div>
  );
}

export function ReasoningPanel({
  data,
  branch,
  result,
  essential,
  query,
  setQuery,
  ranQuery,
  setRanQuery,
  onToggle,
  onRebase,
  onSetupDraftChange,
}: {
  data: WorkspaceData;
  branch: Branch;
  result: SolverResult;
  essential: EssentialPremise[];
  query: Query;
  setQuery: (q: Query) => void;
  ranQuery: Query;
  setRanQuery: (q: Query) => void;
  onToggle: (id: AssumptionId) => void;
  onRebase: () => void;
  onSetupDraftChange: (draft: SetupDraft) => void;
}) {
  const [tab, setTab] = useState<"reason" | "assumptions" | "source" | "setup">(
    "reason",
  );
  const classification = classify(result, ranQuery);
  const currentRevision = data.events.length;
  const stale = branch.baseRevision < currentRevision;
  const available = availableAssumptions(data.events, branch.baseRevision);
  const queryText =
    ranQuery.kind === "actual_role"
      ? `${ranQuery.seat}号的真实角色是${ROLE_ZH[ranQuery.role]}`
      : `${ranQuery.seat}号在N1中毒`;
  const uniqueWitnesses = projectedWitnesses(result, 2);
  return (
    <section className="reason-panel">
      <div className="panel-tabs">
        <div className="tabs">
          <button
            className={tab === "reason" ? "active" : ""}
            onClick={() => setTab("reason")}
          >
            条件推理
          </button>
          <button
            className={tab === "assumptions" ? "active" : ""}
            onClick={() => setTab("assumptions")}
          >
            关键假设
          </button>
          <button
            className={tab === "source" ? "active" : ""}
            onClick={() => setTab("source")}
          >
            范围与依据
          </button>
          <button
            className={tab === "setup" ? "active" : ""}
            onClick={() => setTab("setup")}
          >
            标准设置
          </button>
        </div>
        <button className="subtle-button" onClick={() => setTab("assumptions")}>
          <SlidersHorizontal size={16} />
          审查前提
        </button>
      </div>
      {stale && (
        <div className="revision-banner">
          <ShieldAlert size={17} />
          此分支基于修订 {branch.baseRevision}；当前记录是修订 {currentRevision}
          。<button onClick={onRebase}>更新到最新记录</button>
        </div>
      )}
      {tab === "reason" && (
        <>
          <div
            className={`conclusion ${result.status === "unsat" ? "conflict" : ""}`}
          >
            <div className="conclusion-copy">
              <span className="section-overline">当前结论</span>
              <h1>
                {result.status === "unsupported"
                  ? "当前条件超出已实现范围"
                  : result.status === "unsat"
                    ? "当前分支前提互相冲突"
                    : classification.classification === "necessary"
                      ? `${queryText}，在本分支下必然成立`
                      : classification.classification === "impossible"
                        ? `${queryText}，在本分支下不可能`
                        : `${queryText}，目前仍有两种可能`}
              </h1>
              <p>
                {result.status === "sat"
                  ? `H0 下精确 ${result.count.value} 种初始真实角色分配 · 初始小恶魔可能座位：${result.possibleImpSeats.join("、")}号`
                  : result.status === "unsat"
                    ? "没有符合所有当前前提的见证；这不等于某名玩家撒谎。"
                    : result.unsupported[0]}
              </p>
            </div>
            <div className="clock-watermark" aria-hidden="true">
              <span>
                TRUTH
                <br />
                LIVES
                <br />
                IN
                <br />
                PEOPLE
              </span>
            </div>
          </div>
          <div className="query-strip">
            <div className="query-title">
              <Search size={16} />
              <strong>推理查询</strong>
              <span
                title="查询只针对当前限定分支，且不输出概率。"
                aria-label="查询说明"
              >
                <CircleHelp size={14} />
              </span>
            </div>
            <div className="query-fields">
              <span>如果</span>
              <select
                aria-label="查询座位"
                value={query.seat}
                onChange={(e) =>
                  setQuery({ ...query, seat: Number(e.target.value) })
                }
              >
                {seatNames.map((_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1}号
                  </option>
                ))}
              </select>
              <span>是</span>
              <select
                aria-label="查询命题种类"
                value={query.kind}
                onChange={(e) =>
                  setQuery(
                    e.target.value === "n1_poisoned"
                      ? { kind: "n1_poisoned", seat: query.seat }
                      : { kind: "actual_role", seat: query.seat, role: "Imp" },
                  )
                }
              >
                <option value="actual_role">真实角色</option>
                <option value="n1_poisoned">N1中毒</option>
              </select>
              {query.kind === "actual_role" && (
                <select
                  aria-label="查询角色"
                  value={query.role}
                  onChange={(e) =>
                    setQuery({ ...query, role: e.target.value as Role })
                  }
                >
                  {roleOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              )}
              <button
                className="primary-button compact"
                onClick={() => setRanQuery(query)}
              >
                运行推理
              </button>
            </div>
          </div>
          {result.status === "sat" ? (
            <div className="analysis-columns">
              <div className="analysis-section">
                <h2>
                  成立前提 <span>（{branch.assumptions.length}）</span>
                </h2>
                <div className="assumption-list">
                  {branch.assumptions.length ? (
                    branch.assumptions.map((id, i) => (
                      <button
                        key={id}
                        onClick={() => onToggle(id)}
                        title="撤销此前提"
                      >
                        <span className="small-index">H{i + 1}</span>
                        <span>{assumptionLabel(id)}</span>
                        <X size={14} />
                      </button>
                    ))
                  ) : (
                    <p className="muted-empty">
                      尚未采纳额外前提。声明本身不会缩小可行域。
                    </p>
                  )}
                </div>
              </div>
              <div className="analysis-section">
                <h2>
                  {classification.classification === "contingent"
                    ? "支持与反例"
                    : classification.classification === "necessary"
                      ? "撤销前提后的反例"
                      : "见证与依据"}
                </h2>
                <div className="evidence-list">
                  {classification.classification === "contingent" ? (
                    <>
                      <div className="evidence-row">
                        <span className="small-index good">A</span>
                        <span>存在符合命题的合法见证</span>
                        <Check size={16} />
                      </div>
                      <div className="evidence-row">
                        <span className="small-index warn">B</span>
                        <span>也存在推翻命题的合法见证</span>
                        <X size={16} />
                      </div>
                    </>
                  ) : essential.length ? (
                    essential.slice(0, 3).map(({ id }, i) => (
                      <div className="evidence-row" key={id}>
                        <span className="small-index warn">{i + 1}</span>
                        <span>撤销“{assumptionLabel(id)}”后可出现反例</span>
                      </div>
                    ))
                  ) : (
                    <p className="muted-empty">
                      在当前限定规则与事件中未找到可撤销单项前提的反例。
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : result.status === "unsat" ? (
            <div className="conflict-box">
              <h2>可撤销的冲突前提</h2>
              <p>
                以下是一个经逐项删除检查的子集极小冲突集合。撤销任意一项即可恢复此集合的可满足性。
              </p>
              <div>
                {result.conflict.length ? (
                  result.conflict.map((id) => (
                    <button key={id} onClick={() => onToggle(id)}>
                      {assumptionLabel(id)}
                      <X size={14} />
                    </button>
                  ))
                ) : (
                  <span>基础记录本身与限定模型冲突。</span>
                )}
              </div>
            </div>
          ) : (
            <div className="conflict-box">
              <h2>未支持的条件</h2>
              {result.unsupported.map((item, i) => (
                <p key={i}>{item}</p>
              ))}
            </div>
          )}
          {result.status === "sat" && (
            <div className="witness-section">
              <div className="section-heading">
                <h2>
                  {classification.classification === "contingent"
                    ? "两种相反见证"
                    : "代表角色分配"}
                </h2>
                <span>仅展示见证；不代表世界总数或概率</span>
              </div>
              <div className="witness-grid">
                {(classification.classification === "contingent" &&
                classification.yes &&
                classification.no
                  ? [classification.yes, classification.no]
                  : essential.length
                    ? [uniqueWitnesses[0], essential[0].witness]
                    : uniqueWitnesses
                )
                  .filter(Boolean)
                  .map((w, i) => (
                    <WitnessView
                      key={i}
                      witness={w}
                      title={i === 0 ? "见证 A" : "见证 B / 条件反例"}
                    />
                  ))}
              </div>
            </div>
          )}
        </>
      )}
      {tab === "assumptions" && (
        <div className="assumption-page">
          <h1>关键假设</h1>
          <p>
            角色声明只是记录。逐项采纳“准确报告”和“能力有效”后，才会用于条件推理。
          </p>
          <div className="toggle-list">
            {ASSUMPTIONS.map((a) => (
              <label
                key={a.id}
                className={!available.has(a.id) ? "disabled" : ""}
              >
                <input
                  type="checkbox"
                  checked={branch.assumptions.includes(a.id)}
                  disabled={!available.has(a.id)}
                  onChange={() => onToggle(a.id)}
                />
                <span className="toggle-copy">
                  <strong>{a.label}</strong>
                  <small>{a.detail}</small>
                </span>
                <span className="toggle-state">
                  {branch.assumptions.includes(a.id)
                    ? "已采纳"
                    : available.has(a.id)
                      ? "未采纳"
                      : "缺少报告"}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
      {tab === "source" && (
        <div className="source-page">
          <BookOpen size={24} />
          <h1>本分支的证明范围</h1>
          <p>
            H0
            假定固定角色袋为调查员、厨师、占卜师、僧侣、送葬者、管家、投毒者、小恶魔；并假定1/2/3/6号的真实角色分别为调查员、厨师、占卜师、送葬者。4/5/7/8号在剩余四角色中排列。
          </p>
          <dl>
            <div>
              <dt>当前求解范围</dt>
              <dd>{result.scope}</dd>
            </div>
            <div>
              <dt>规则版本</dt>
              <dd>{RULESET_HASH}</dd>
            </div>
            <div>
              <dt>记录修订</dt>
              <dd>{branch.baseRevision}</dd>
            </div>
            <div>
              <dt>计数口径</dt>
              <dd>初始真实角色分配去重；不计隐藏行动历史</dd>
            </div>
            <div>
              <dt>已实现机制</dt>
              <dd>
                首夜调查员、厨师、占卜师报告；投毒与红鲱鱼；D1处决死亡；已记录的N2死亡或封闭的零死亡通过夜间行动重放筛选，覆盖小恶魔自杀传位及送葬者、占卜师报告
              </dd>
            </div>
            <div>
              <dt>未实现机制</dt>
              <dd>
                D1提名与投票的动态反推、其他角色能力、注册、其他角色变化及完整Trouble
                Brewing搜索
              </dd>
            </div>
          </dl>
          <p className="source-note">
            精确只适用于上述有限案例。接受的报告假设代表玩家准确转述所见；能力是否有效另作假设。
          </p>
        </div>
      )}
      {tab === "setup" && (
        <SetupExplorer
          draft={data.setupDraft ?? defaultSetupDraft()}
          onChange={onSetupDraftChange}
        />
      )}
    </section>
  );
}

export function Timeline({
  data,
  revision,
  selectedEvent,
  onSelectEvent,
  onRetract,
}: {
  data: WorkspaceData;
  revision: number;
  selectedEvent: EventEnvelope | null;
  onSelectEvent: (event: EventEnvelope | null) => void;
  onRetract: (id: string) => void;
}) {
  const events = [...activeEvents(data.events, revision)].reverse();
  const groups = new Map<string, EventEnvelope[]>();
  for (const event of events) {
    const label = timeLabel(event.occurredAt);
    groups.set(label, [...(groups.get(label) ?? []), event]);
  }
  return (
    <aside className="timeline">
      <div className="timeline-head">
        <h2>时间线</h2>
        <span>全部事件</span>
      </div>
      {selectedEvent ? (
        <div className="event-inspector">
          <button className="back-link" onClick={() => onSelectEvent(null)}>
            ← 返回时间线
          </button>
          <h3>{eventLabel(selectedEvent)}</h3>
          <dl>
            <div>
              <dt>原文</dt>
              <dd>{selectedEvent.rawText}</dd>
            </div>
            <div>
              <dt>游戏时间</dt>
              <dd>{timeLabel(selectedEvent.occurredAt)}</dd>
            </div>
            <div>
              <dt>记录时间</dt>
              <dd>
                {new Date(selectedEvent.recordedAt).toLocaleString("zh-CN")}
              </dd>
            </div>
            <div>
              <dt>修订 / 事件</dt>
              <dd>
                r{selectedEvent.revision} · {selectedEvent.id.slice(0, 8)}
              </dd>
            </div>
            <div>
              <dt>性质</dt>
              <dd>
                {selectedEvent.payload.kind === "claim"
                  ? "玩家声明；不是隐藏真值"
                  : "记录的观察事件"}
              </dd>
            </div>
          </dl>
          <button
            className="outline-button danger"
            onClick={() => onRetract(selectedEvent.id)}
          >
            撤回这条事件
          </button>
        </div>
      ) : (
        <div className="timeline-scroll">
          {[...groups.entries()].map(([label, group]) => (
            <div className="time-group" key={label}>
              <h3>{label}</h3>
              {group.map((event) => (
                <button key={event.id} onClick={() => onSelectEvent(event)}>
                  <span className="time-dot" />
                  <span>{eventLabel(event)}</span>
                  <small>r{event.revision}</small>
                </button>
              ))}
            </div>
          ))}
          <p className="timeline-end">点击事件查看原文与来源</p>
        </div>
      )}
    </aside>
  );
}

export function PlayerDetail({
  data,
  revision,
  seat,
  result,
}: {
  data: WorkspaceData;
  revision: number;
  seat: number;
  result: SolverResult;
}) {
  const events = activeEvents(data.events, revision).filter(
    (e) =>
      (e.payload.kind === "claim" && e.payload.speaker === seat) ||
      (e.payload.kind === "death" && e.payload.seat === seat) ||
      (e.payload.kind === "execution" && e.payload.seat === seat),
  );
  const possible =
    result.status === "sat"
      ? [...new Set(result.witnesses.map((w) => w.roles[seat]))]
      : [];
  return (
    <section className="detail-panel">
      <div className="detail-header">
        <div className="large-seat">{seat}</div>
        <div>
          <span>玩家档案</span>
          <h1>{seatNames[seat - 1]}</h1>
          <p>以下是本地记录与当前分支的条件推理结果。</p>
        </div>
      </div>
      <div className="detail-block">
        <h2>可能的真实角色</h2>
        <div className="role-tags">
          {possible.length ? (
            possible.map((r) => <span key={r}>{ROLE_ZH[r]}</span>)
          ) : (
            <span>当前分支无法计算</span>
          )}
        </div>
        <p>角色候选来自 H0 与当前前提，不是此玩家自己声称的身份。</p>
      </div>
      <div className="detail-block">
        <h2>声明与事件历史</h2>
        {events.length ? (
          events.map((e) => (
            <div className="detail-event" key={e.id}>
              <span>{timeLabel(e.occurredAt)}</span>
              <strong>{eventLabel(e)}</strong>
              <small>原文：{e.rawText}</small>
            </div>
          ))
        ) : (
          <p>暂无记录。</p>
        )}
      </div>
    </section>
  );
}
