import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  BookOpen,
  Brain,
  ScrollText,
  Plus,
  Search,
  X,
  Skull,
  Check,
  Undo2,
  Users,
  User,
  Shield,
  Eye,
  Flame,
  Heart,
  Crown,
  Utensils,
  Book,
  Moon,
  Sun,
} from "lucide-react";
import {
  ROLE_ZH,
  ROLES,
  timeLabel,
  type Role,
  type GameTime,
  type EventPayload,
} from "../core/model";
import { ROLE_TEAM, type Team } from "../core/setup";
import {
  commitStandardDrafts,
  createStandardWorkspace,
  retractStandardEvent,
  type StandardWorkspace,
} from "../core/standardWorkspace";
import { GrimoireEntry, MAX_GRIMOIRE_DAY } from "./GrimoireEntry";
import { GrimoireRecords } from "./GrimoireRecords";
import {
  currentStandardClaims,
  recordStandardRoleClaim,
  phaseIndex,
  samePhase,
  visibleAtBranch,
} from "../core/standardHistory";
import type { StandardEvent } from "../core/standardWorkspace";
import { ClaimAnalysisPanel } from "./ClaimAnalysisPanel";
import { GrimoireReasoning } from "./GrimoireReasoning";
import { Attribution } from "./Attribution";
import "./grimoire.css";

const teams: Record<Team, string> = {
  townsfolk: "镇民",
  outsider: "外来者",
  minion: "爪牙",
  demon: "恶魔",
};
const numbers = (n: number) => Array.from({ length: n }, (_, i) => i + 1);
function RoleIcon({ role }: { role: Role }) {
  if (ROLE_TEAM[role] === "demon") return <Flame />;
  if (ROLE_TEAM[role] === "minion") return <Moon />;
  if (role === "Investigator") return <Search />;
  if (role === "Librarian") return <Book />;
  if (role === "Chef") return <Utensils />;
  if (role === "Empath") return <Heart />;
  if (role === "Mayor") return <Crown />;
  if (role === "Soldier" || role === "Monk") return <Shield />;
  return <Eye />;
}

export function Grimoire({
  workspace,
  onChange,
  onAdvanced,
  saved,
}: {
  workspace: StandardWorkspace;
  onChange: (next: StandardWorkspace) => void;
  onAdvanced: () => void;
  saved: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [panel, setPanel] = useState<
    "player" | "new" | "records" | "report" | "action" | "reason" | "analysis"
  >("player");
  const [seat, setSeat] = useState(1);
  const [search, setSearch] = useState("");
  const [identityStage, setIdentityStage] = useState<"initial" | "current">(
    "initial",
  );
  const [changeKind, setChangeKind] = useState<"correction" | "changed_claim">(
    "correction",
  );
  const [editing, setEditing] = useState<{
    eventId: string;
    kind: "correction" | "changed_claim";
  }>();
  const [category, setCategory] = useState<Team | "all">("all");
  const [reviewedSource, setReviewedSource] = useState<{
    gameId: string;
    branchId: string;
    revision: number;
    eventId: string;
  }>();
  useEffect(() => {
    if (!dialog.current?.open) return;
    if (panel === "records" && reviewedSource) return;
    dialog.current.scrollTop = 0;
    dialog.current
      .querySelector<HTMLElement>("#gr-dialog-title")
      ?.focus({ preventScroll: true });
  }, [panel, reviewedSource]);
  const [count, setCount] = useState(workspace.playerCount);
  const [perspective, setPerspective] = useState(workspace.perspectiveSeat);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [time, setTime] = useState<GameTime>(() => {
    const latest = workspace.recordingTime ??
      [...workspace.events].reverse().find((e) => e.occurredAt)?.occurredAt ?? {
        phase: "day",
        cycle: 1,
      };
    return {
      ...latest,
      cycle: Math.min(MAX_GRIMOIRE_DAY, Math.max(1, latest.cycle)),
    };
  });
  const selectTime = (next: GameTime) => {
    setTime(next);
    onChange({ ...workspace, recordingTime: next });
  };
  const behind =
    workspace.branches.find((b) => b.id === workspace.activeBranchId)!
      .baseRevision < workspace.events.length;
  const visible = visibleAtBranch(workspace);
  const currentClaims = currentStandardClaims(visible, workspace.events);
  const claims = (s: number, stage = identityStage) =>
    visible.filter(
      (e) =>
        e.payload.kind === "claim" &&
        e.payload.claimKind === "role" &&
        e.payload.speaker === s &&
        (e.payload.identityStage ?? "initial") === stage &&
        (stage === "initial" || samePhase(e.occurredAt, time)),
    );
  const roleClaimAt = (s: number) =>
    currentClaims
      .filter(
        (e) =>
          e.payload.kind === "claim" &&
          e.payload.claimKind === "role" &&
          e.payload.speaker === s &&
          ((e.payload.identityStage ?? "initial") === "initial" ||
            (e.occurredAt && phaseIndex(e.occurredAt) <= phaseIndex(time))),
      )
      .sort((a, b) => {
        const order = (event: StandardEvent) =>
          event.payload.kind === "claim" &&
          event.payload.identityStage === "current" &&
          event.occurredAt
            ? phaseIndex(event.occurredAt) + 1
            : 0;
        return order(a) - order(b) || a.revision - b.revision;
      })
      .at(-1);
  const deaths = (s: number) =>
    visible.filter((e) => e.payload.kind === "death" && e.payload.seat === s);
  const close = () => dialog.current?.close();
  const open = (next: typeof panel, s = seat) => {
    setReviewedSource(undefined);
    setSeat(s);
    setPanel(next);
    setSearch("");
    setCategory("all");
    setIdentityStage("initial");
    setChangeKind("correction");
    setEditing(undefined);
    setError("");
    dialog.current?.showModal();
  };
  const reviewSource = (eventId: string) => {
    const event = visible.find((record) => record.id === eventId);
    if (!event?.occurredAt) return;
    const branch = workspace.branches.find(
      (b) => b.id === workspace.activeBranchId,
    )!;
    if (event.occurredAt.cycle <= MAX_GRIMOIRE_DAY)
      selectTime(event.occurredAt);
    open("records");
    setReviewedSource({
      gameId: workspace.gameId,
      branchId: branch.id,
      revision: branch.baseRevision,
      eventId,
    });
  };
  const mutate = (
    fn: () => StandardWorkspace,
    feedback: string,
    dismiss = true,
  ) => {
    try {
      onChange(fn());
      setMessage(feedback);
      setError("");
      if (dismiss) close();
    } catch (cause) {
      setError((cause as Error).message);
    }
  };
  const openReason = (target?: number) => {
    if (target !== undefined)
      onChange({ ...workspace, query: { ...workspace.query, seat: target } });
    open("reason");
  };
  const record = (
    base: StandardWorkspace,
    payload: EventPayload,
    label: string,
  ) =>
    commitStandardDrafts(
      base,
      label,
      [{ payload, label, occurredAt: time, sourceSpan: [0, label.length] }],
      "private",
    );
  const clearClaims = () =>
    claims(seat).reduce(
      (next, event) => retractStandardEvent(next, event.id),
      workspace,
    );
  const choose = (role: Role) =>
    mutate(
      () =>
        recordStandardRoleClaim(
          workspace,
          seat,
          role,
          time,
          identityStage,
          changeKind,
        ),
      `已记录 ${seat}号声称${ROLE_ZH[role]}`,
    );
  const selectedClaim = currentClaims
    .filter(
      (e) =>
        e.payload.kind === "claim" &&
        e.payload.claimKind === "role" &&
        e.payload.speaker === seat &&
        (e.payload.identityStage ?? "initial") === identityStage &&
        (identityStage === "initial" || samePhase(e.occurredAt, time)),
    )
    .at(-1);
  const currentRole =
    selectedClaim?.payload.kind === "claim"
      ? selectedClaim.payload.role
      : undefined;
  const initialClaim = currentClaims
    .filter(
      (e) =>
        e.payload.kind === "claim" &&
        e.payload.claimKind === "role" &&
        e.payload.speaker === seat &&
        e.payload.identityStage !== "current",
    )
    .at(-1);
  const initialClaimRole =
    initialClaim?.payload.kind === "claim"
      ? initialClaim.payload.role
      : undefined;
  const amend = (
    event: StandardEvent,
    kind: "correction" | "changed_claim",
  ) => {
    if (event.payload.kind !== "claim") return;
    if (event.payload.claimKind === "ability_report") {
      open("report", event.payload.speaker);
      setEditing({ eventId: event.id, kind });
    } else {
      open("player", event.payload.speaker);
      setIdentityStage(event.payload.identityStage ?? "initial");
      setChangeKind(kind);
      if (event.payload.identityStage === "current" && event.occurredAt)
        selectTime(event.occurredAt);
    }
  };
  const isDead = deaths(seat).length > 0;
  const filtered = ROLES.filter(
    (role) =>
      (category === "all" || ROLE_TEAM[role] === category) &&
      `${ROLE_ZH[role]} ${role}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  const frame = (title: string, description: string, content: ReactNode) => (
    <>
      <header className="gr-drawer-head">
        <div>
          <h2 id="gr-dialog-title" tabIndex={-1}>
            {title}
          </h2>
          <p>{description}</p>
        </div>
        <button aria-label="关闭面板" onClick={close}>
          <X />
        </button>
      </header>
      {error && (
        <p role="alert" className="gr-error">
          {error}
        </p>
      )}
      {content}
    </>
  );

  return (
    <div className="gr-app">
      <header className="gr-header">
        <div className="gr-brand">
          <BookOpen />
          <div>
            <h1>钟楼随手记</h1>
            <Attribution />
          </div>
          <span>暗流涌动</span>
        </div>
        <div className="gr-header-actions">
          <button
            className="gr-primary"
            onClick={() => {
              setCount(workspace.playerCount);
              setPerspective(workspace.perspectiveSeat);
              open("new");
            }}
          >
            <Plus size={18} />
            新对局
          </button>
          <button onClick={onAdvanced} aria-label="高级推理" title="高级推理">
            <Brain size={18} />
            <span>高级推理</span>
          </button>
        </div>
      </header>
      <main className="gr-main">
        <div className="gr-toolbar">
          <div>
            <span>
              <Users size={16} />
              {workspace.playerCount} 人
            </span>
            <span>
              <User size={16} />
              我是 {workspace.perspectiveSeat} 号
            </span>
          </div>
          <div className="gr-phase">
            <label>
              <span className="sr-only">当前天数</span>
              <select
                aria-label="当前天数"
                value={time.cycle}
                onChange={(e) =>
                  selectTime({ ...time, cycle: Number(e.target.value) })
                }
              >
                {numbers(MAX_GRIMOIRE_DAY).map((n) => (
                  <option key={n} value={n}>
                    第 {n} 天
                  </option>
                ))}
              </select>
            </label>
            <button
              aria-label="切换昼夜"
              onClick={() =>
                selectTime({
                  ...time,
                  phase: time.phase === "day" ? "night" : "day",
                })
              }
            >
              {time.phase === "day" ? <Sun size={16} /> : <Moon size={16} />}
              {time.phase === "day" ? "白天" : "夜晚"}
            </button>
          </div>
        </div>
        <div
          className={`gr-wheel ${workspace.playerCount > 10 ? "gr-dense" : ""}`}
          aria-label="玩家座位轮盘"
        >
          <div className="gr-orbit" />
          <div className="gr-center">
            <span className="gr-ornament">— ◆ —</span>
            <h2>我的魔典</h2>
            <p>点座位，记身份和信息</p>
            <small>{workspace.playerCount} 人 · 私密记录</small>
            <span className="gr-help">
              角色为玩家声称
              <br />
              录入后点“一键分析”
            </span>
          </div>
          {numbers(workspace.playerCount).map((s, i) => {
            const roleClaim = roleClaimAt(s);
            const role =
              roleClaim?.payload.kind === "claim"
                ? roleClaim.payload.role
                : undefined;
            const dead = deaths(s).length > 0;
            const hasCurrentClaim =
              roleClaim?.payload.kind === "claim" &&
              roleClaim.payload.identityStage === "current";
            const claimTime = roleClaim?.occurredAt ?? time;
            const angle =
              (i * Math.PI * 2) / workspace.playerCount - Math.PI / 2;
            return (
              <button
                key={s}
                className={`gr-seat ${role ? `gr-${ROLE_TEAM[role]}` : "gr-empty"} ${dead ? "gr-dead" : ""}`}
                style={
                  {
                    "--x": `${50 + 39 * Math.cos(angle)}%`,
                    "--y": `${50 + 39 * Math.sin(angle)}%`,
                  } as CSSProperties
                }
                aria-label={`${s}号${role ? `声称${ROLE_ZH[role]}` : "选择角色"}${dead ? "，已死亡" : ""}${hasCurrentClaim ? `，${timeLabel(claimTime)}当前角色声称${samePhase(claimTime, time) ? "" : "（最近记录）"}` : ""}`}
                onClick={() => open("player", s)}
              >
                <span className="gr-seat-number">
                  {s}
                  {s === workspace.perspectiveSeat && <small>我</small>}
                </span>
                <span className="gr-token">
                  {dead ? (
                    <Skull />
                  ) : role ? (
                    <RoleIcon role={role} />
                  ) : (
                    <Plus />
                  )}
                  <span>{role ? ROLE_ZH[role] : "选择角色"}</span>
                </span>
                {hasCurrentClaim && (
                  <small className="gr-current-claim-label">
                    {timeLabel(claimTime)}
                    {samePhase(claimTime, time) ? "当前声称" : "时声称"}
                  </small>
                )}
                {dead && <span className="gr-death-label">已死亡</span>}
              </button>
            );
          })}
        </div>
        <div className="gr-status" role="status">
          {message || "按实际座次记录，从任意空位开始。"}
          <small>
            <Check size={13} />
            {saved}
          </small>
        </div>
      </main>
      <nav className="gr-nav" aria-label="主要导航">
        <button className="active" aria-current="page" onClick={close}>
          <BookOpen />
          魔典
        </button>
        <button onClick={() => open("records")}>
          <ScrollText />
          记录
        </button>
        <button onClick={() => openReason()}>
          <Brain />
          推理
        </button>
        <button onClick={() => open("analysis")}>
          <Search />
          一键分析
        </button>
      </nav>
      <dialog
        ref={dialog}
        className="gr-dialog"
        aria-labelledby="gr-dialog-title"
        onClose={() => setPanel("player")}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="gr-dialog-body">
          {panel === "player" &&
            frame(
              `${seat}号玩家${seat === workspace.perspectiveSeat ? " · 我" : ""}`,
              "分别记录开局身份与某个阶段结束时的当前角色；声称仍需验证。",
              <>
                <div className="gr-form gr-role-history-options">
                  <label>
                    身份时点
                    <select
                      aria-label="身份时点"
                      value={identityStage}
                      onChange={(e) =>
                        setIdentityStage(
                          e.target.value as "initial" | "current",
                        )
                      }
                    >
                      <option value="initial">开局身份</option>
                      <option value="current">
                        {timeLabel(time)}结束时的当前角色
                      </option>
                    </select>
                  </label>
                  {selectedClaim && (
                    <label>
                      身份记录方式
                      <select
                        aria-label="身份记录方式"
                        value={changeKind}
                        onChange={(e) =>
                          setChangeKind(
                            e.target.value as "correction" | "changed_claim",
                          )
                        }
                      >
                        <option value="correction">
                          录入纠正：原记录写错了
                        </option>
                        <option value="changed_claim">
                          玩家改口：保留前后声称
                        </option>
                      </select>
                    </label>
                  )}
                  {initialClaimRole && (
                    <p>已记录开局声称：{ROLE_ZH[initialClaimRole]}。</p>
                  )}
                  {identityStage === "current" && (
                    <p>
                      这条声称对应{timeLabel(time)}
                      结束时；分析需要该阶段和此前阶段的完整记录。
                    </p>
                  )}
                </div>
                {currentRole && (
                  <div className="gr-player-summary">
                    <span
                      className={`gr-role-icon gr-${ROLE_TEAM[currentRole]}`}
                    >
                      <RoleIcon role={currentRole} />
                    </span>
                    <div>
                      <strong>{ROLE_ZH[currentRole]}</strong>
                      <small>
                        {identityStage === "current"
                          ? `${timeLabel(time)}当前角色声称`
                          : "开局身份声称"}{" "}
                        · {isDead ? "已死亡" : "存活"}
                      </small>
                    </div>
                    <button
                      disabled={behind}
                      onClick={() =>
                        mutate(clearClaims, `已清除 ${seat}号的角色记录`)
                      }
                    >
                      清除角色
                    </button>
                  </div>
                )}
                <div className="gr-player-actions">
                  <button onClick={() => open("report", seat)}>记录信息</button>
                  <button onClick={() => openReason(seat)}>
                    查询该玩家角色
                  </button>
                  <button
                    disabled={behind}
                    onClick={() =>
                      mutate(
                        () =>
                          isDead
                            ? deaths(seat).reduce(
                                (next, event) =>
                                  retractStandardEvent(next, event.id),
                                workspace,
                              )
                            : record(
                                workspace,
                                { kind: "death", seat },
                                `${seat}号死亡`,
                              ),
                        isDead
                          ? `已撤销 ${seat}号死亡记录`
                          : `已记录 ${seat}号死亡`,
                      )
                    }
                  >
                    {isDead ? <Undo2 size={17} /> : <Skull size={17} />}
                    {isDead ? "撤销死亡记录" : "标记死亡"}
                    <small>{timeLabel(time)}</small>
                  </button>
                </div>
                <label className="gr-search">
                  <Search size={18} />
                  <input
                    autoComplete="off"
                    aria-label="搜索角色"
                    placeholder="搜索角色名称…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
                <div className="gr-categories" aria-label="角色分类">
                  {(
                    ["all", "townsfolk", "outsider", "minion", "demon"] as const
                  ).map((team) => (
                    <button
                      key={team}
                      aria-pressed={category === team}
                      className={category === team ? "active" : ""}
                      onClick={() => setCategory(team)}
                    >
                      {team === "all" ? "全部" : teams[team]}
                    </button>
                  ))}
                </div>
                <div className="gr-role-list">
                  {filtered.map((role) => (
                    <button
                      key={role}
                      aria-label={`选择${ROLE_ZH[role]}`}
                      aria-pressed={role === currentRole}
                      onClick={() => choose(role)}
                    >
                      <span className={`gr-role-icon gr-${ROLE_TEAM[role]}`}>
                        <RoleIcon role={role} />
                      </span>
                      <span>
                        {ROLE_ZH[role]}
                        <small>{teams[ROLE_TEAM[role]]}</small>
                      </span>
                      {role === currentRole && <Check size={16} />}
                    </button>
                  ))}
                </div>
                {!filtered.length && (
                  <p className="gr-empty-message">
                    没有找到角色，试试其他名称或分类。
                  </p>
                )}
              </>,
            )}
          {panel === "records" &&
            frame(
              "对局记录",
              "按日夜查看当前分支的记录、改口与纠正历史。",
              <GrimoireRecords
                workspace={workspace}
                time={time}
                onChange={onChange}
                onTime={selectTime}
                onAdd={(nextTime) => {
                  selectTime(nextTime);
                  open("action");
                }}
                onAmend={amend}
                onReviewSource={reviewSource}
                focusEventId={
                  reviewedSource?.gameId === workspace.gameId &&
                  reviewedSource.branchId === workspace.activeBranchId &&
                  reviewedSource.revision ===
                    workspace.branches.find(
                      (b) => b.id === workspace.activeBranchId,
                    )!.baseRevision
                    ? reviewedSource.eventId
                    : undefined
                }
              />,
            )}
          {(panel === "report" || panel === "action") &&
            frame(
              panel === "report" ? `${seat}号 · 记录信息` : "记录对局事件",
              "选择字段即可录入，无需命令语法。",
              <GrimoireEntry
                key={`${panel}-${seat}-${workspace.gameId}-${editing?.eventId ?? "new"}-${editing?.kind ?? ""}`}
                workspace={workspace}
                onChange={onChange}
                seat={seat}
                time={time}
                mode={panel}
                editing={editing}
                onSaved={() => {
                  setMessage("已保存信息；可点一键分析检查声称是否冲突。");
                  setPanel(panel === "report" ? "reason" : "records");
                }}
              />,
            )}
          {panel === "reason" &&
            frame(
              "魔典条件推理",
              "记录、采纳前提、查询与依据在同一魔典中完成。",
              <GrimoireReasoning
                workspace={workspace}
                onChange={onChange}
                onReviewSource={reviewSource}
              />,
            )}
          {panel === "analysis" &&
            frame(
              "声称与信息分析",
              "检查冲突，寻找需要复核的玩家。",
              <ClaimAnalysisPanel
                workspace={workspace}
                onReviewSource={reviewSource}
              />,
            )}
          {panel === "new" &&
            frame(
              "开始新对局",
              "暗流涌动 · 7–15 人",
              <form
                className="gr-new"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (
                    (workspace.events.length || workspace.hypotheses.length) &&
                    !window.confirm(
                      "开始新对局将替换当前记录与假设。需要保留时请先在高级推理中导出。继续吗？",
                    )
                  )
                    return;
                  mutate(
                    () => ({
                      ...createStandardWorkspace(count, perspective),
                      recordingTime: { cycle: 1, phase: "day" },
                    }),
                    "新对局已准备好，点击空位选择角色。",
                  );
                  setTime({ cycle: 1, phase: "day" });
                }}
              >
                <label>
                  玩家人数
                  <select
                    aria-label="玩家人数"
                    value={count}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      setCount(n);
                      setPerspective(Math.min(n, perspective));
                    }}
                  >
                    {numbers(15)
                      .filter((n) => n >= 7)
                      .map((n) => (
                        <option key={n} value={n}>
                          {n} 人
                        </option>
                      ))}
                  </select>
                </label>
                <label>
                  我的座位
                  <select
                    aria-label="我的座位"
                    value={perspective}
                    onChange={(e) => setPerspective(Number(e.target.value))}
                  >
                    {numbers(count).map((n) => (
                      <option key={n} value={n}>
                        {n} 号
                      </option>
                    ))}
                  </select>
                </label>
                <p>
                  所有新记录默认只对你的视角可见。角色可边玩边填，不必一次选完。
                </p>
                <button className="gr-primary" type="submit">
                  开始记录
                </button>
              </form>,
            )}
        </div>
      </dialog>
    </div>
  );
}
