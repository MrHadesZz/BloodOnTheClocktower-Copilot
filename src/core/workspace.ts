import { defaultSetupDraft, validateSetupDraft } from "./setupDraft";
import {
  activeEvents,
  ASSUMPTIONS,
  ROLES,
  Branch,
  EventDraft,
  EventEnvelope,
  GameTime,
  WorkspaceData,
} from "./model";
import { parseEntry } from "./parser";

const uid = () =>
  globalThis.crypto?.randomUUID?.() ??
  `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const fixtureLines = [
  "1 inv 4/5 poisoner @N1",
  "2 chef 0 @N1",
  "3 ft 7/8 no @N1",
  "4 monk @D1",
  "5 monk @D1",
  "4 nom 5 @D1",
  "vote 5 = 1,2,4,7,8 @D1",
  "exec 5 @D1",
  "5 dead @D1",
  "2 dead @N2",
  "close deaths @N2",
  "6 ut monk @N2",
  "3 ft 4/7 yes @N2",
];

export function commitDrafts(
  data: WorkspaceData,
  rawText: string,
  drafts: EventDraft[],
): WorkspaceData {
  if (!drafts.length) throw new Error("没有可提交的事件。");
  const current = activeEvents(data.events);
  for (const draft of drafts) {
    if (draft.payload.kind !== "vote") continue;
    const vote = draft.payload;
    const nominations = current.filter(
      (e) =>
        e.payload.kind === "nomination" &&
        e.payload.nominee === vote.nominee &&
        e.occurredAt?.phase === draft.occurredAt?.phase &&
        e.occurredAt?.cycle === draft.occurredAt?.cycle,
    );
    if (nominations.length !== 1)
      throw new Error(
        "投票必须关联同一天唯一一条已记录的对应提名；请先录入提名。",
      );
    vote.nominationId = nominations[0].id;
  }
  const rawEntryId = uid();
  const now = new Date().toISOString();
  const start = data.events.length;
  const next: EventEnvelope[] = drafts.map((draft, i) => ({
    id: uid(),
    rawEntryId,
    revision: start + i + 1,
    recordedAt: now,
    occurredAt: draft.occurredAt,
    rawText,
    sourceSpan: draft.sourceSpan,
    visibility: "private",
    payload: draft.payload,
  }));
  const revision = start + next.length;
  return {
    ...data,
    events: [...data.events, ...next],
    branches: data.branches.map((b) =>
      b.id === data.activeBranchId ? { ...b, baseRevision: revision } : b,
    ),
  };
}

export function retractEvent(
  data: WorkspaceData,
  targetId: string,
  reason = "纠正误录",
): WorkspaceData {
  const target = activeEvents(data.events).find((e) => e.id === targetId);
  if (!target) throw new Error("原事件已不存在或已撤回。");
  const revision = data.events.length + 1;
  const entry: EventEnvelope = {
    id: uid(),
    rawEntryId: uid(),
    revision,
    recordedAt: new Date().toISOString(),
    occurredAt: target.occurredAt,
    rawText: reason,
    sourceSpan: [0, reason.length],
    visibility: "private",
    payload: { kind: "retraction", targetId, reason },
  };
  return {
    ...data,
    events: [...data.events, entry],
    branches: data.branches.map((b) =>
      b.id === data.activeBranchId ? { ...b, baseRevision: revision } : b,
    ),
  };
}

export function createFixture(): WorkspaceData {
  let data: WorkspaceData = {
    schemaVersion: 1,
    gameId: "fixture-h0-eight",
    title: "八人条件推理示例",
    events: [],
    branches: [],
    activeBranchId: "branch-demo",
    selectedSeat: 3,
    setupDraft: defaultSetupDraft(),
  };
  const now = new Date().toISOString();
  const base: Branch = {
    id: "branch-h0",
    name: "H0 基础",
    baseRevision: 0,
    assumptions: [],
    createdAt: now,
  };
  const demo: Branch = {
    id: "branch-demo",
    name: "报告分支",
    baseRevision: 0,
    parentId: base.id,
    assumptions: [
      "inv_report",
      "inv_active",
      "chef_report",
      "chef_active",
      "ft_report",
      "butler8",
    ],
    createdAt: now,
  };
  data.branches = [base, demo];
  for (const line of fixtureLines)
    data = commitDrafts(data, line, parseEntry(line));
  data.branches = data.branches.map((b) => ({
    ...b,
    baseRevision: data.events.length,
  }));
  return data;
}

export function createBranch(data: WorkspaceData, name: string): WorkspaceData {
  const parent = data.branches.find((b) => b.id === data.activeBranchId)!;
  const branch: Branch = {
    id: uid(),
    name: name.trim() || `分支 ${data.branches.length + 1}`,
    parentId: parent.id,
    baseRevision: parent.baseRevision,
    assumptions: [...parent.assumptions],
    createdAt: new Date().toISOString(),
  };
  return {
    ...data,
    branches: [...data.branches, branch],
    activeBranchId: branch.id,
  };
}

const DB_NAME = "clocktower-reasoning-copilot";
const STORE = "workspace";
function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function loadWorkspace(): Promise<WorkspaceData | null> {
  const database = await db();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE, "readonly");
      const request = transaction.objectStore(STORE).get("current");
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
  } finally {
    database.close();
  }
}
export async function saveWorkspace(data: WorkspaceData): Promise<void> {
  const database = await db();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE, "readwrite");
      transaction.objectStore(STORE).put(data, "current");
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const isSeat = (value: unknown) =>
  Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 8;
const isRole = (value: unknown) =>
  typeof value === "string" && (ROLES as readonly string[]).includes(value);
const isTime = (value: unknown): value is GameTime =>
  isRecord(value) &&
  (value.phase === "day" || value.phase === "night") &&
  Number.isInteger(value.cycle) &&
  Number(value.cycle) >= 1 &&
  Number(value.cycle) <= 99;
const isDate = (value: unknown) =>
  typeof value === "string" && !Number.isNaN(Date.parse(value));
const isId = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export function validateImport(value: unknown): WorkspaceData {
  if (!isRecord(value)) throw new Error("文件不是工作台导出数据。");
  if (
    value.schemaVersion !== 1 ||
    value.gameId !== "fixture-h0-eight" ||
    typeof value.title !== "string" ||
    !isSeat(value.selectedSeat) ||
    !Array.isArray(value.events) ||
    !Array.isArray(value.branches) ||
    !isId(value.activeBranchId) ||
    value.branches.length === 0
  )
    throw new Error("导出格式、案例范围或工作区字段不匹配。");

  const eventIds = new Map<string, Record<string, unknown>>();
  const retracted = new Set<string>();
  for (const [index, raw] of value.events.entries()) {
    if (
      !isRecord(raw) ||
      raw.revision !== index + 1 ||
      !isId(raw.id) ||
      eventIds.has(raw.id) ||
      !isId(raw.rawEntryId) ||
      !isDate(raw.recordedAt) ||
      typeof raw.rawText !== "string" ||
      !Array.isArray(raw.sourceSpan) ||
      raw.sourceSpan.length !== 2 ||
      !Number.isInteger(raw.sourceSpan[0]) ||
      !Number.isInteger(raw.sourceSpan[1]) ||
      raw.sourceSpan[0] < 0 ||
      raw.sourceSpan[1] < raw.sourceSpan[0] ||
      raw.sourceSpan[1] > raw.rawText.length ||
      raw.visibility !== "private" ||
      (raw.occurredAt !== undefined && !isTime(raw.occurredAt)) ||
      !isRecord(raw.payload)
    )
      throw new Error(`第${index + 1}条事件的结构或修订序列无效。`);
    const payload = raw.payload;
    const time = raw.occurredAt;
    const atPhase = (phase: "day" | "night") =>
      isTime(time) && time.phase === phase;
    const targets = (value: unknown) =>
      Array.isArray(value) &&
      value.length === 2 &&
      value.every(isSeat) &&
      value[0] !== value[1];
    let valid = false;
    switch (payload.kind) {
      case "claim":
        valid = isSeat(payload.speaker) && isRole(payload.role);
        if (payload.claimKind === "role") {
          valid &&=
            payload.targets === undefined && payload.value === undefined;
        } else if (payload.claimKind === "ability_report") {
          valid &&= atPhase("night");
          if (payload.role === "Investigator")
            valid &&= targets(payload.targets) && payload.value === "Poisoner";
          else if (payload.role === "Chef")
            valid &&=
              Number.isInteger(payload.value) &&
              Number(payload.value) >= 0 &&
              Number(payload.value) <= 8;
          else if (payload.role === "Fortune Teller")
            valid &&=
              targets(payload.targets) && typeof payload.value === "boolean";
          else if (payload.role === "Undertaker")
            valid &&= isRole(payload.value);
          else valid = false;
        } else valid = false;
        break;
      case "nomination":
        valid =
          atPhase("day") &&
          isSeat(payload.nominator) &&
          isSeat(payload.nominee);
        break;
      case "vote": {
        const nomination = eventIds.get(String(payload.nominationId));
        valid =
          atPhase("day") &&
          isTime(time) &&
          isSeat(payload.nominee) &&
          Array.isArray(payload.voters) &&
          payload.voters.every(isSeat) &&
          new Set(payload.voters).size === payload.voters.length &&
          isId(payload.nominationId) &&
          nomination?.payload !== undefined &&
          isRecord(nomination.payload) &&
          nomination.payload.kind === "nomination" &&
          nomination.payload.nominee === payload.nominee &&
          isTime(nomination.occurredAt) &&
          nomination.occurredAt.phase === "day" &&
          nomination.occurredAt.cycle === time.cycle;
        break;
      }
      case "execution":
        valid = atPhase("day") && isSeat(payload.seat);
        break;
      case "death":
        valid = isTime(time) && isSeat(payload.seat);
        break;
      case "phase_closed":
        valid = atPhase("night") && payload.channel === "deaths";
        break;
      case "retraction":
        valid =
          isId(payload.targetId) &&
          eventIds.has(payload.targetId) &&
          eventIds.get(payload.targetId)?.payload !== undefined &&
          isRecord(eventIds.get(payload.targetId)?.payload) &&
          (eventIds.get(payload.targetId)?.payload as Record<string, unknown>)
            .kind !== "retraction" &&
          !retracted.has(payload.targetId) &&
          typeof payload.reason === "string" &&
          payload.reason.trim().length > 0;
        if (valid) retracted.add(payload.targetId as string);
        break;
    }
    if (!valid) throw new Error(`第${index + 1}条事件载荷或引用关系无效。`);
    eventIds.set(raw.id, raw);
  }

  const branchIds = new Set<string>();
  const validAssumptions = new Set<string>(ASSUMPTIONS.map((item) => item.id));
  for (const [index, raw] of value.branches.entries()) {
    if (
      !isRecord(raw) ||
      !isId(raw.id) ||
      branchIds.has(raw.id) ||
      typeof raw.name !== "string" ||
      !Number.isInteger(raw.baseRevision) ||
      Number(raw.baseRevision) < 0 ||
      Number(raw.baseRevision) > value.events.length ||
      !Array.isArray(raw.assumptions) ||
      !raw.assumptions.every(
        (id: unknown) => typeof id === "string" && validAssumptions.has(id),
      ) ||
      new Set(raw.assumptions).size !== raw.assumptions.length ||
      !isDate(raw.createdAt) ||
      (raw.parentId !== undefined && !branchIds.has(raw.parentId as string))
    )
      throw new Error(`第${index + 1}个分支的修订、假设或引用关系无效。`);
    branchIds.add(raw.id);
  }
  if (!branchIds.has(value.activeBranchId))
    throw new Error("活动分支引用无效。");

  const data = value as unknown as WorkspaceData;
  return {
    ...data,
    setupDraft:
      data.setupDraft === undefined
        ? defaultSetupDraft()
        : validateSetupDraft(data.setupDraft),
  };
}
