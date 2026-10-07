import { useState } from "react";
import { Plus, X } from "lucide-react";
import { ROLE_ZH, type Role } from "../core/model";
import { MINIONS, OUTSIDERS, TOWNSFOLK } from "../core/setup";
import type { FirstNightReport } from "../core/symbolicSetup";

type Ability =
  | "Washerwoman"
  | "Librarian"
  | "Investigator"
  | "Chef"
  | "Empath"
  | "Fortune Teller";
const abilities: Ability[] = [
  "Washerwoman",
  "Librarian",
  "Investigator",
  "Chef",
  "Empath",
  "Fortune Teller",
];
const allowed = (ability: Ability): readonly Role[] =>
  ability === "Washerwoman"
    ? TOWNSFOLK
    : ability === "Librarian"
      ? OUTSIDERS
      : MINIONS;

const seatOptions = (count: number) =>
  Array.from({ length: count }, (_, i) => (
    <option key={i} value={i + 1}>
      {i + 1}号
    </option>
  ));
function label(report: FirstNightReport) {
  if (report.kind === "librarian_zero")
    return `${report.speaker}号图书管理员：零名外来者`;
  if (report.kind === "pair_role")
    return `${report.speaker}号${ROLE_ZH[report.ability]}：${report.targets.join("/")}号中有${ROLE_ZH[report.seenRole]}`;
  if (report.kind === "chef")
    return `${report.speaker}号厨师：${report.count}组邪恶相邻`;
  if (report.kind === "empath")
    return `${report.speaker}号共情者：${report.count}位邪恶邻居`;
  return `${report.speaker}号占卜师选${report.targets.join("/")}号：${report.yes ? "是" : "否"}`;
}

export function FirstNightEditor({
  count,
  reports,
  onChange,
}: {
  count: number;
  reports: FirstNightReport[];
  onChange: (reports: FirstNightReport[]) => void;
}) {
  const [ability, setAbility] = useState<Ability>("Investigator");
  const [speaker, setSpeaker] = useState(1);
  const [first, setFirst] = useState(2);
  const [second, setSecond] = useState(3);
  const [seenRole, setSeenRole] = useState<Role>("Poisoner");
  const [number, setNumber] = useState(0);
  const [yes, setYes] = useState(true);
  const [librarianZero, setLibrarianZero] = useState(false);
  const [error, setError] = useState("");
  const pair =
    ability === "Washerwoman" ||
    ability === "Librarian" ||
    ability === "Investigator";
  const targets = [Math.min(first, count), Math.min(second, count)] as [
    number,
    number,
  ];
  const add = () => {
    if (
      ((pair && !(ability === "Librarian" && librarianZero)) ||
        ability === "Fortune Teller") &&
      targets[0] === targets[1]
    ) {
      setError("两个目标必须是不同座位。");
      return;
    }
    setError("");
    const premise = {
      speaker: Math.min(speaker, count),
      acceptedMessage: true,
      abilityActive: false,
    };
    const report: FirstNightReport =
      ability === "Librarian" && librarianZero
        ? { ...premise, kind: "librarian_zero" }
        : pair
          ? {
              ...premise,
              kind: "pair_role",
              ability: ability as "Washerwoman" | "Librarian" | "Investigator",
              targets,
              seenRole,
            }
          : ability === "Chef"
            ? { ...premise, kind: "chef", count: Math.min(number, count) }
            : ability === "Empath"
              ? { ...premise, kind: "empath", count: Math.min(number, 2) }
              : { ...premise, kind: "fortune_teller", targets, yes };
    onChange([...reports, report]);
  };
  const update = (
    index: number,
    key: "acceptedMessage" | "abilityActive",
    value: boolean,
  ) =>
    onChange(
      reports.map((report, i) =>
        i === index ? { ...report, [key]: value } : report,
      ),
    );

  return (
    <section className="first-night-editor">
      <div className="setup-section-title">
        <h2>首夜信息前提</h2>
        <span>报告准确复述与能力有效须分别采纳</span>
      </div>
      <div className="first-night-form">
        <select
          aria-label="首夜能力"
          value={ability}
          onChange={(event) => {
            const next = event.target.value as Ability;
            setAbility(next);
            setNumber(0);
            setLibrarianZero(false);
            if (
              next === "Washerwoman" ||
              next === "Librarian" ||
              next === "Investigator"
            )
              setSeenRole(allowed(next)[0]);
            setError("");
          }}
        >
          {abilities.map((item) => (
            <option key={item} value={item}>
              {ROLE_ZH[item]}
            </option>
          ))}
        </select>
        <select
          aria-label="报告者座位"
          value={Math.min(speaker, count)}
          onChange={(event) => setSpeaker(Number(event.target.value))}
        >
          {seatOptions(count)}
        </select>
        {ability === "Librarian" && (
          <label className="librarian-zero-toggle">
            <input
              type="checkbox"
              checked={librarianZero}
              onChange={(event) => setLibrarianZero(event.target.checked)}
            />
            零外来者
          </label>
        )}
        {((pair && !(ability === "Librarian" && librarianZero)) ||
          ability === "Fortune Teller") && (
          <>
            <span>选</span>
            <select
              aria-label="第一个目标"
              value={targets[0]}
              onChange={(event) => setFirst(Number(event.target.value))}
            >
              {seatOptions(count)}
            </select>
            <select
              aria-label="第二个目标"
              value={targets[1]}
              onChange={(event) => setSecond(Number(event.target.value))}
            >
              {seatOptions(count)}
            </select>
          </>
        )}
        {pair && !(ability === "Librarian" && librarianZero) && (
          <select
            aria-label="收到的角色"
            value={seenRole}
            onChange={(event) => setSeenRole(event.target.value as Role)}
          >
            {allowed(ability).map((role) => (
              <option key={role} value={role}>
                {ROLE_ZH[role]}
              </option>
            ))}
          </select>
        )}
        {(ability === "Chef" || ability === "Empath") && (
          <select
            aria-label="收到的数字"
            value={Math.min(number, ability === "Empath" ? 2 : count)}
            onChange={(event) => setNumber(Number(event.target.value))}
          >
            {Array.from(
              { length: ability === "Chef" ? count + 1 : 3 },
              (_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ),
            )}
          </select>
        )}
        {ability === "Fortune Teller" && (
          <select
            aria-label="占卜结果"
            value={yes ? "yes" : "no"}
            onChange={(event) => setYes(event.target.value === "yes")}
          >
            <option value="yes">是</option>
            <option value="no">否</option>
          </select>
        )}
        <button className="outline-add" onClick={add}>
          <Plus size={15} />
          添加报告
        </button>
      </div>
      {error && (
        <p className="first-night-error" role="alert">
          {error}
        </p>
      )}
      <div className="first-night-list">
        {reports.length ? (
          reports.map((report, index) => (
            <div key={index} className="first-night-row">
              <strong>{label(report)}</strong>
              <label>
                <input
                  type="checkbox"
                  checked={report.acceptedMessage}
                  onChange={(event) =>
                    update(index, "acceptedMessage", event.target.checked)
                  }
                />
                采纳所见
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={report.abilityActive}
                  onChange={(event) =>
                    update(index, "abilityActive", event.target.checked)
                  }
                />
                能力有效
              </label>
              <button
                aria-label={`删除第${index + 1}条报告`}
                onClick={() => onChange(reports.filter((_, i) => i !== index))}
              >
                <X size={15} />
              </button>
            </div>
          ))
        ) : (
          <p>未加入首夜报告。此时只检查初始角色设置。</p>
        )}
      </div>
      <p className="first-night-note">
        仅当“采纳所见”和“能力有效”同时勾选，消息内容才成为硬约束。间谍／隐士的注册按每次判定独立处理；可在上方显式假定首夜投毒行动；后续夜晚尚未纳入此查询。
      </p>
    </section>
  );
}
