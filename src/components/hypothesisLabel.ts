import { eventLabel, ROLE_ZH, timeLabel } from "../core/model";
import type {
  StandardHypothesis,
  StandardWorkspace,
} from "../core/standardWorkspace";

export function hypothesisLabel(
  h: StandardHypothesis,
  workspace: StandardWorkspace,
) {
  if (h.kind === "actual_role")
    return `${h.seat}号初始真实角色是${ROLE_ZH[h.role]}`;
  if (h.kind === "role_at_phase")
    return `${h.seat}号${timeLabel(h.occurredAt)}结束时角色是${ROLE_ZH[h.role]}`;
  if (h.kind === "seen_token") return `${h.seat}号所见${ROLE_ZH[h.shownRole]}`;
  if (h.kind === "night_one_poison")
    return `首夜${h.poisonerSeat}号投毒${h.targetSeat}号`;
  const source = workspace.events.find(
    (e) =>
      e.id === h.eventId &&
      (e.visibility === "public" || e.ownerSeat === workspace.perspectiveSeat),
  );
  return `${h.kind === "report_accurate" ? "准确转述" : "能力有效"} · ${source ? `${eventLabel(source)} · ${timeLabel(source.occurredAt)}` : "来源不可见"}`;
}
