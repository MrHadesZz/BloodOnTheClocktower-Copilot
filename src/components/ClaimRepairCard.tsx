import { eventLabel, ROLE_ZH, timeLabel } from "../core/model";
import {
  describeClaimRepair,
  type ClaimGroup,
  type ClaimRepair,
} from "../core/claimAnalysis";
import type {
  StandardEvent,
  StandardWorkspace,
} from "../core/standardWorkspace";
import { ClaimConditionPanel } from "./ClaimConditionPanel";
import { StandardWitnessCard } from "./StandardQueryResult";

export function ClaimRepairCard({
  repair,
  groups,
  sources,
  index,
  workspace,
  analysisBusy,
}: {
  repair: ClaimRepair;
  groups: ClaimGroup[];
  sources: StandardEvent[];
  index: number;
  workspace: StandardWorkspace;
  analysisBusy: boolean;
}) {
  const descriptions = describeClaimRepair(groups, repair);
  return (
    <article className="gr-analysis-repair" aria-label={`组合${index}`}>
      <h5>
        组合{index}：放宽{repair.seats.map((s) => `${s}号`).join("、")}
      </h5>
      <p className="gr-repair-proof">
        兼容已验证 ·{" "}
        {repair.minimal ? "已验证不可再缩小" : "是否可再缩小尚未验证"}
      </p>
      <p>保留其他玩家和所有手动前提，此组合能解释当前输入。</p>
      <details className="gr-repair-details">
        <summary>查看放宽的身份与信息</summary>
        {descriptions.map((description) => (
          <div key={description.seat}>
            <p>
              <b>{description.seat}号：</b>
              {description.claimedRole
                ? `声称${ROLE_ZH[description.claimedRole]}；这组可能解释中的开局真实角色为${ROLE_ZH[description.role]}。`
                : `未单独记录开局身份；这组可能解释中的开局真实角色为${ROLE_ZH[description.role]}。`}
            </p>
            {description.shownRole && (
              <p>该见证中的酒鬼所见身份：{ROLE_ZH[description.shownRole]}。</p>
            )}
            {description.reportIds.length > 0 && (
              <>
                <p>
                  此组合暂不要求以下报告同时满足“准确转述”和“能力有效”；不能据此断言报告一定错误。
                </p>
                <ul>
                  {description.reportIds.map((id) => {
                    const event = sources.find((e) => e.id === id)!;
                    return (
                      <li key={id}>
                        {eventLabel(event)} · {timeLabel(event.occurredAt)}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
            {description.poisonNights.length > 0 && (
              <p>
                该见证还包含以{description.seat}号为目标的投毒行动：
                {description.poisonNights.map((n) => `N${n}`).join("、")}
                。这是可能的隐藏行动。
              </p>
            )}
          </div>
        ))}
        <p>
          这是一种兼容解释，不能确认这些玩家在撒谎，也不保证只存在这一种解释。
        </p>
      </details>
      <ClaimConditionPanel
        workspace={workspace}
        seats={repair.seats}
        sources={sources}
        analysisBusy={analysisBusy}
      />
      <StandardWitnessCard
        witness={repair.witness}
        title={`查看组合${index}的可能解释`}
      />
    </article>
  );
}
