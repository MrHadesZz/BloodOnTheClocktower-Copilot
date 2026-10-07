import { useRef, useState } from "react";
import { ArrowRight, Plus, X } from "lucide-react";
import { ROLE_ZH, type Role } from "../core/model";
import { queryZ3Setup } from "../core/z3Client";
import type { SetupQueryResult, SetupWitness } from "../core/symbolicSetup";
import { baseSetup, MINIONS, OUTSIDERS, TOWNSFOLK } from "../core/setup";
import { FirstNightEditor } from "./FirstNightEditor";
import type { SetupDraft } from "../core/setupDraft";

const roleGroups: { name: string; roles: readonly Role[] }[] = [
  { name: "镇民", roles: TOWNSFOLK },
  { name: "外来者", roles: OUTSIDERS },
  { name: "爪牙", roles: MINIONS },
  { name: "恶魔", roles: ["Imp"] },
];

function RoleSelect({
  value,
  onChange,
  label,
}: {
  value: Role;
  onChange: (role: Role) => void;
  label: string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value as Role)}
    >
      {roleGroups.map((group) => (
        <optgroup key={group.name} label={group.name}>
          {group.roles.map((role) => (
            <option key={role} value={role}>
              {ROLE_ZH[role]}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

function SeatSelect({
  value,
  count,
  onChange,
  label,
}: {
  value: number;
  count: number;
  onChange: (seat: number) => void;
  label: string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    >
      {Array.from({ length: count }, (_, index) => index + 1).map((seat) => (
        <option value={seat} key={seat}>
          {seat}号
        </option>
      ))}
    </select>
  );
}

function SetupWitnessView({
  witness,
  title,
}: {
  witness: SetupWitness;
  title: string;
}) {
  return (
    <div className="setup-witness">
      <h3>{title}</h3>
      <div className="setup-witness-grid">
        {witness.roles.map((role, index) => (
          <div key={index}>
            <b>{index + 1}</b>
            <span>
              {ROLE_ZH[role]}
              {role === "Drunk"
                ? `（所见${ROLE_ZH[witness.shownTokens[index]]}）`
                : ""}
            </span>
          </div>
        ))}
      </div>
      {witness.nightOnePoisoner && (
        <p className="setup-red-herring">
          首夜投毒：{witness.nightOnePoisoner.seat}号投毒者 →{" "}
          {witness.nightOnePoisoner.target}号
        </p>
      )}
      {witness.redHerringSeat && (
        <p className="setup-red-herring">
          占卜师红鲱鱼：{witness.redHerringSeat}号
        </p>
      )}
      {witness.registrations.length > 0 && (
        <details className="setup-registration">
          <summary>查看注册选择（{witness.registrations.length}）</summary>
          <ul>
            {witness.registrations.map((choice, index) => {
              const parts = choice.interaction.split("_");
              const context =
                parts[0] === "chef"
                  ? `厨师第${Number(parts[2]) + 1}组相邻座位`
                  : parts[0] === "empath"
                    ? "共情者邻居"
                    : parts[0] === "ft"
                      ? "占卜师目标"
                      : "二选一角色信息";
              return (
                <li key={index}>
                  {context}：{choice.seat}号
                  {choice.role
                    ? `注册为${ROLE_ZH[choice.role]}`
                    : `注册为${choice.evil ? "邪恶" : "善良"}`}
                </li>
              );
            })}
          </ul>
        </details>
      )}
    </div>
  );
}

export function SetupExplorer({
  draft,
  onChange,
}: {
  draft: SetupDraft;
  onChange: (next: SetupDraft) => void;
}) {
  const {
    count,
    facts,
    tokenFacts,
    reports,
    factSeat,
    factRole,
    poisonEnabled,
    poisonerSeat,
    poisonTarget,
    querySeat,
    queryRole,
  } = draft;
  const patch = (changes: Partial<SetupDraft>) => {
    onChange({ ...draft, ...changes });
    invalidate();
  };
  const [result, setResult] = useState<SetupQueryResult | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const generation = useRef(0);
  const baseline = baseSetup(count);

  const invalidate = () => {
    generation.current++;
    setResult(null);
    setError("");
    setPending(false);
  };
  const run = async () => {
    const current = ++generation.current;
    setPending(true);
    setError("");
    setResult(null);
    try {
      const answer = await queryZ3Setup({
        playerCount: count,
        facts,
        tokenFacts,
        reports,
        ...(poisonEnabled
          ? { nightOnePoisoner: { seat: poisonerSeat, target: poisonTarget } }
          : {}),
        query: { seat: querySeat, role: queryRole },
        timeoutMs: 5000,
      });
      if (current === generation.current) setResult(answer);
    } catch (cause) {
      if (current === generation.current) setError((cause as Error).message);
    } finally {
      if (current === generation.current) setPending(false);
    }
  };
  const classification =
    result?.classification === "necessary"
      ? "必然成立"
      : result?.classification === "impossible"
        ? "不可能"
        : result?.classification === "contingent"
          ? "可能，但并非必然"
          : result?.classification === "inconsistent"
            ? "角色或报告前提互相冲突"
            : "求解结果未知";

  return (
    <div className="setup-explorer">
      <div className="setup-intro">
        <h1>标准初始设置查询</h1>
        <p>
          在 7–15 人的 Trouble Brewing
          初始角色袋中，检验某个真实角色假设是否可能。这里使用 Z3
          符号求解；可在下方临时添加首夜信息前提，当前对局事件不会自动纳入。
        </p>
      </div>
      <div className="setup-controls">
        <label>
          玩家人数
          <select
            aria-label="玩家人数"
            value={count}
            onChange={(event) => {
              const next = Number(event.target.value);
              patch({
                count: next,
                facts: facts.filter((fact) => fact.seat <= next),
                tokenFacts: tokenFacts.filter((fact) => fact.seat <= next),
                reports: reports.filter(
                  (report) =>
                    report.speaker <= next &&
                    (!("targets" in report) ||
                      report.targets.every((seat) => seat <= next)),
                ),
                factSeat: Math.min(factSeat, next),
                querySeat: Math.min(querySeat, next),
                poisonerSeat: Math.min(poisonerSeat, next),
                poisonTarget: Math.min(poisonTarget, next),
              });
            }}
          >
            {Array.from({ length: 9 }, (_, index) => index + 7).map((n) => (
              <option key={n} value={n}>
                {n}人
              </option>
            ))}
          </select>
        </label>
        <div className="setup-baseline">
          基础配比：{baseline.townsfolk} 镇民 · {baseline.outsider} 外来者 ·{" "}
          {baseline.minion} 爪牙 · 1 恶魔{" "}
          <span>有男爵时外来者 +2、镇民 −2</span>
        </div>
      </div>
      <div className="setup-facts">
        <div className="setup-section-title">
          <h2>额外真实角色假设</h2>
          <span>这些是假设，不是玩家声明</span>
        </div>
        <div className="setup-add-row">
          <SeatSelect
            label="假设座位"
            value={factSeat}
            count={count}
            onChange={(seat) => {
              patch({ factSeat: seat });
            }}
          />
          <span>真实角色为</span>
          <RoleSelect
            label="假设角色"
            value={factRole}
            onChange={(role) => {
              patch({ factRole: role });
            }}
          />
          <button
            className="outline-add"
            onClick={() => {
              patch({ facts: [...facts, { seat: factSeat, role: factRole }] });
            }}
          >
            <Plus size={15} />
            添加假设
          </button>
        </div>
        <div className="setup-fact-list">
          {facts.length ? (
            facts.map((fact, index) => (
              <button
                key={index}
                onClick={() => {
                  patch({ facts: facts.filter((_, i) => i !== index) });
                }}
              >
                {fact.seat}号 = {ROLE_ZH[fact.role]}
                <X size={13} />
              </button>
            ))
          ) : (
            <p>没有额外角色假设；所有符合标准设置的初始分配均被考虑。</p>
          )}
        </div>
      </div>
      <div className="setup-facts">
        <div className="setup-section-title">
          <h2>所见角色 token 假设</h2>
          <span>真实角色可能是酒鬼；token 不自动等于真值</span>
        </div>
        <div className="setup-add-row">
          <span>座位与角色沿用上方选择：</span>
          <button
            className="outline-add"
            onClick={() =>
              patch({
                tokenFacts: [
                  ...tokenFacts,
                  { seat: factSeat, shownRole: factRole },
                ],
              })
            }
          >
            采纳所见 token
          </button>
        </div>
        <div className="setup-fact-chips">
          {tokenFacts.map((fact, index) => (
            <button
              key={index}
              onClick={() =>
                patch({ tokenFacts: tokenFacts.filter((_, i) => i !== index) })
              }
            >
              {fact.seat}号所见{ROLE_ZH[fact.shownRole]} ×
            </button>
          ))}
        </div>
      </div>
      <div className="setup-poison">
        <div className="setup-section-title">
          <h2>首夜投毒假设</h2>
          <span>仅用于这个设置查询的 What-if 前提</span>
        </div>
        <div className="setup-add-row">
          <label className="setup-poison-toggle">
            <input
              type="checkbox"
              checked={poisonEnabled}
              onChange={(event) =>
                patch({ poisonEnabled: event.target.checked })
              }
            />
            指定投毒者行动
          </label>
          {poisonEnabled && (
            <>
              <SeatSelect
                label="投毒者座位"
                value={poisonerSeat}
                count={count}
                onChange={(seat) => patch({ poisonerSeat: seat })}
              />
              <span>首夜投毒</span>
              <SeatSelect
                label="投毒目标"
                value={poisonTarget}
                count={count}
                onChange={(seat) => patch({ poisonTarget: seat })}
              />
            </>
          )}
        </div>
        <p>
          指定后，投毒者的真实角色也成为假设；被投毒玩家的“能力有效”前提会发生冲突。自我中毒尚未支持。
        </p>
      </div>
      <FirstNightEditor
        count={count}
        reports={reports}
        onChange={(next) => {
          patch({ reports: next });
        }}
      />
      <div className="setup-query">
        <div className="setup-section-title">
          <h2>要检验的命题</h2>
        </div>
        <div className="setup-add-row">
          <SeatSelect
            label="检验座位"
            value={querySeat}
            count={count}
            onChange={(seat) => {
              patch({ querySeat: seat });
            }}
          />
          <span>真实角色是</span>
          <RoleSelect
            label="检验角色"
            value={queryRole}
            onChange={(role) => {
              patch({ queryRole: role });
            }}
          />
          <button
            className="primary-button compact"
            onClick={run}
            disabled={pending}
          >
            {pending ? "正在求解" : "运行查询"}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
      {(result || error) && (
        <div className="setup-result" role="status">
          <strong>{error ? "求解未知" : classification}</strong>
          <p>
            {error ||
              `${querySeat}号是${ROLE_ZH[queryRole]}：${classification}。只针对初始真实角色分配；不表示任何实战概率。`}
          </p>
        </div>
      )}
      {result && (
        <div className="setup-witnesses">
          {result.yes && (
            <SetupWitnessView witness={result.yes} title="支持命题的设置见证" />
          )}
          {result.no && (
            <SetupWitnessView witness={result.no} title="推翻命题的设置见证" />
          )}
        </div>
      )}
      <p className="setup-scope">
        目前形式化 22
        个角色的初始唯一性、标准人数配比、男爵设置调整，以及列出的首夜信息能力和显式投毒前提。酒鬼真实角色与所见
        token 分开；跨夜状态、角色变化、完整投票与胜负尚未纳入。
      </p>
    </div>
  );
}
