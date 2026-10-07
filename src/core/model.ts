import type { SetupDraft } from "./setupDraft";
export const ROLES = [
  "Washerwoman",
  "Librarian",
  "Investigator",
  "Chef",
  "Empath",
  "Fortune Teller",
  "Undertaker",
  "Monk",
  "Ravenkeeper",
  "Virgin",
  "Slayer",
  "Soldier",
  "Mayor",
  "Butler",
  "Drunk",
  "Recluse",
  "Saint",
  "Poisoner",
  "Spy",
  "Scarlet Woman",
  "Baron",
  "Imp",
] as const;
export type Role = (typeof ROLES)[number];
export type Phase = "day" | "night";
export interface GameTime {
  phase: Phase;
  cycle: number;
}

export interface ClaimPayload {
  kind: "claim";
  speaker: number;
  claimKind: "role" | "ability_report";
  role: Role;
  /** Legacy role claims without this field refer to the starting identity. */
  identityStage?: "initial" | "current";
  change?: {
    kind: "correction" | "changed_claim";
    previousId: string;
    announcedAt: GameTime;
  };
  targets?: number[];
  value?: Role | number | boolean;
}
export type EventPayload =
  | ClaimPayload
  | { kind: "nomination"; nominator: number; nominee: number }
  | { kind: "vote"; nominee: number; voters: number[]; nominationId?: string }
  | { kind: "execution"; seat: number }
  | { kind: "death"; seat: number }
  | { kind: "slayer"; actor: number; target: number }
  | { kind: "winner"; team: "good" | "evil" }
  | { kind: "phase_closed"; channel: "deaths" | "actions" }
  | { kind: "retraction"; targetId: string; reason: string };

export interface EventEnvelope {
  id: string;
  rawEntryId: string;
  revision: number;
  recordedAt: string;
  occurredAt?: GameTime;
  rawText: string;
  sourceSpan: [number, number];
  visibility: "private";
  payload: EventPayload;
}
export interface EventDraft {
  occurredAt?: GameTime;
  sourceSpan: [number, number];
  payload: EventPayload;
  label: string;
}
export type AssumptionId =
  | "inv_report"
  | "inv_active"
  | "chef_report"
  | "chef_active"
  | "ft_report"
  | "ft_active"
  | "butler8"
  | "ut_report_n2"
  | "ft_report_n2";
export const ASSUMPTIONS: {
  id: AssumptionId;
  label: string;
  detail: string;
}[] = [
  {
    id: "inv_report",
    label: "采纳1号N1调查报告",
    detail: "准确复述收到的4/5号 Poisoner 信息",
  },
  { id: "inv_active", label: "1号N1能力有效", detail: "1号不是当夜投毒目标" },
  {
    id: "chef_report",
    label: "采纳2号N1厨师报告",
    detail: "准确复述收到的0组邪恶相邻信息",
  },
  { id: "chef_active", label: "2号N1能力有效", detail: "2号不是当夜投毒目标" },
  {
    id: "ft_report",
    label: "采纳3号N1占卜报告",
    detail: "准确复述选7/8号收到的否",
  },
  { id: "ft_active", label: "3号N1能力有效", detail: "3号不是当夜投毒目标" },
  {
    id: "butler8",
    label: "假定8号真实角色为管家",
    detail: "角色假设，不来自声明",
  },
  {
    id: "ut_report_n2",
    label: "采纳6号N2送葬报告",
    detail: "准确复述看到前一日死于处决者是僧侣",
  },
  {
    id: "ft_report_n2",
    label: "采纳3号N2占卜报告",
    detail: "准确复述选4/7号收到的是",
  },
];
export interface Branch {
  id: string;
  name: string;
  baseRevision: number;
  parentId?: string;
  assumptions: AssumptionId[];
  createdAt: string;
}
export interface WorkspaceData {
  schemaVersion: 1;
  gameId: string;
  title: string;
  events: EventEnvelope[];
  branches: Branch[];
  activeBranchId: string;
  selectedSeat: number;
  setupDraft?: SetupDraft;
}
export const ROLE_ZH: Record<Role, string> = {
  Washerwoman: "洗衣妇",
  Librarian: "图书管理员",
  Investigator: "调查员",
  Chef: "厨师",
  Empath: "共情者",
  "Fortune Teller": "占卜师",
  Undertaker: "送葬者",
  Monk: "僧侣",
  Ravenkeeper: "守鸦人",
  Virgin: "贞洁者",
  Slayer: "猎手",
  Soldier: "士兵",
  Mayor: "镇长",
  Butler: "管家",
  Drunk: "酒鬼",
  Recluse: "隐士",
  Saint: "圣徒",
  Poisoner: "投毒者",
  Spy: "间谍",
  "Scarlet Woman": "红唇女郎",
  Baron: "男爵",
  Imp: "小恶魔",
};
export const timeLabel = (time?: GameTime) =>
  time ? `${time.phase === "night" ? "N" : "D"}${time.cycle}` : "时间未定";

export function activeEvents<
  T extends Pick<EventEnvelope, "id" | "revision" | "payload">,
>(events: T[], revision = Infinity): T[] {
  const upto = events.filter((e) => e.revision <= revision);
  const removed = new Set(
    upto
      .filter((e) => e.payload.kind === "retraction")
      .map((e) => (e.payload as { targetId: string }).targetId),
  );
  return upto.filter(
    (e) => e.payload.kind !== "retraction" && !removed.has(e.id),
  );
}

export function eventLabel(event: Pick<EventEnvelope, "payload">): string {
  const p = event.payload;
  if (p.kind === "claim") {
    if (p.claimKind === "role")
      return p.identityStage === "current"
        ? `${p.speaker}号声称当前角色为${ROLE_ZH[p.role]}`
        : `${p.speaker}号声称${ROLE_ZH[p.role]}`;
    if (p.role === "Investigator" || p.role === "Washerwoman")
      return `${p.speaker}号报告${p.targets?.join("/")}号中有${ROLE_ZH[p.value as Role]}`;
    if (p.role === "Librarian")
      return p.value === 0
        ? `${p.speaker}号报告零外来者`
        : `${p.speaker}号报告${p.targets?.join("/")}号中有${ROLE_ZH[p.value as Role]}`;
    if (p.role === "Chef") return `${p.speaker}号报告${p.value}组邪恶相邻`;
    if (p.role === "Empath") return `${p.speaker}号报告${p.value}名邪恶邻居`;
    if (p.role === "Fortune Teller")
      return `${p.speaker}号报告${p.targets?.join("/")}号：${p.value ? "是" : "否"}`;
    if (p.role === "Ravenkeeper")
      return `${p.speaker}号报告${p.targets?.[0]}号是${ROLE_ZH[p.value as Role]}`;
    return `${p.speaker}号报告看到${ROLE_ZH[p.value as Role]}`;
  }
  if (p.kind === "nomination") return `${p.nominator}号提名${p.nominee}号`;
  if (p.kind === "vote") return `提名${p.nominee}号：${p.voters.length}票`;
  if (p.kind === "execution") return `${p.seat}号被处决`;
  if (p.kind === "death") return `${p.seat}号死亡`;
  if (p.kind === "slayer") return `${p.actor}号使用猎手能力指向${p.target}号`;
  if (p.kind === "winner")
    return `${p.team === "good" ? "善良" : "邪恶"}阵营获胜`;
  if (p.kind === "phase_closed")
    return p.channel === "actions" ? "本日行动记录完整" : "本阶段死亡记录完整";
  return "撤回误录";
}
