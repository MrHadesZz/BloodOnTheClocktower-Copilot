import { EventDraft, GameTime, Role, ROLE_ZH } from "./model";
import { ROLE_TEAM } from "./setup";

const aliases: Record<string, Role> = {
  inv: "Investigator",
  ww: "Washerwoman",
  lib: "Librarian",
  emp: "Empath",
  investigator: "Investigator",
  调查员: "Investigator",
  chef: "Chef",
  厨师: "Chef",
  ft: "Fortune Teller",
  fortuneteller: "Fortune Teller",
  占卜师: "Fortune Teller",
  poisoner: "Poisoner",
  投毒者: "Poisoner",
  monk: "Monk",
  僧侣: "Monk",
  ut: "Undertaker",
  undertaker: "Undertaker",
  送葬者: "Undertaker",
  imp: "Imp",
  小恶魔: "Imp",
  butler: "Butler",
  管家: "Butler",
  washerwoman: "Washerwoman",
  洗衣妇: "Washerwoman",
  librarian: "Librarian",
  图书管理员: "Librarian",
  empath: "Empath",
  共情者: "Empath",
  ravenkeeper: "Ravenkeeper",
  守鸦人: "Ravenkeeper",
  virgin: "Virgin",
  贞洁者: "Virgin",
  slayer: "Slayer",
  猎手: "Slayer",
  soldier: "Soldier",
  士兵: "Soldier",
  mayor: "Mayor",
  镇长: "Mayor",
  drunk: "Drunk",
  酒鬼: "Drunk",
  recluse: "Recluse",
  隐士: "Recluse",
  saint: "Saint",
  圣徒: "Saint",
  spy: "Spy",
  间谍: "Spy",
  scarletwoman: "Scarlet Woman",
  红唇女郎: "Scarlet Woman",
  baron: "Baron",
  男爵: "Baron",
};
const timePattern = /\s+@([ND])(\d+)$/i;
const seat = (value: string, playerCount: number) => {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > playerCount)
    throw new Error(`座位必须在1到${playerCount}之间。`);
  return n;
};
const role = (value: string): Role => {
  const result = aliases[value.replace(/\s+/g, "").toLowerCase()];
  if (!result)
    throw new Error(`未知角色“${value}”，请使用完整名称或支持的缩写。`);
  return result;
};
const pair = (a: string, b: string, playerCount: number) => {
  const x = seat(a, playerCount),
    y = seat(b, playerCount);
  if (x === y) throw new Error("两个目标不能是同一个座位。");
  return [x, y];
};

export interface ParseOptions {
  playerCount?: number;
  profile?: "h0" | "standard";
}

export function parseEntry(
  input: string,
  options: ParseOptions = {},
): EventDraft[] {
  const playerCount = options.playerCount ?? 8;
  if (!Number.isInteger(playerCount) || playerCount < 7 || playerCount > 15)
    throw new RangeError("标准对局人数必须在7到15之间。");
  const takeSeat = (value: string) => seat(value, playerCount);
  const takePair = (a: string, b: string) => pair(a, b, playerCount);
  const standard = options.profile === "standard";
  const raw = input.trim();
  if (!raw) throw new Error("请输入一条记录。");
  const matchTime = raw.match(timePattern);
  const occurredAt: GameTime | undefined = matchTime
    ? {
        phase: matchTime[1].toUpperCase() === "N" ? "night" : "day",
        cycle: Number(matchTime[2]),
      }
    : undefined;
  if (
    occurredAt &&
    (!Number.isInteger(occurredAt.cycle) ||
      occurredAt.cycle < 1 ||
      occurredAt.cycle > 99)
  )
    throw new Error("阶段编号必须在1到99之间。");
  const text = matchTime ? raw.slice(0, matchTime.index).trim() : raw;
  const span: [number, number] = [0, raw.length];
  const draft = (
    payload: EventDraft["payload"],
    label: string,
  ): EventDraft => ({ payload, label, occurredAt, sourceSpan: span });
  const requireTime = (phase?: GameTime["phase"]) => {
    if (!occurredAt) throw new Error("这条记录需要明确时间，例如 @N1 或 @D1。");
    if (phase && occurredAt.phase !== phase)
      throw new Error(
        `这里需要${phase === "night" ? "夜晚 @N" : "白天 @D"}时间。`,
      );
  };

  let m = text.match(
    /^(\d+)\s+(inv|investigator|调查员)\s+(\d+)\s*\/\s*(\d+)\s+([\p{L}]+)$/iu,
  );
  if (m) {
    requireTime("night");
    const speaker = takeSeat(m[1]),
      targets = takePair(m[3], m[4]),
      value = role(m[5]);
    if (standard) {
      if (ROLE_TEAM[value] !== "minion")
        throw new Error("调查员报告必须展示爪牙角色。");
    } else if (value !== "Poisoner")
      throw new Error("当前V0案例只支持调查员报告 Poisoner。");
    return [
      draft(
        { kind: "claim", speaker, claimKind: "role", role: "Investigator" },
        `${speaker}号声称调查员`,
      ),
      draft(
        {
          kind: "claim",
          speaker,
          claimKind: "ability_report",
          role: "Investigator",
          targets,
          value,
        },
        `${speaker}号报告${targets.join("/")}号中有投毒者`,
      ),
    ];
  }
  if (standard) {
    m = text.match(
      /^(\d+)\s+(ww|washerwoman|洗衣妇|lib|librarian|图书管理员)\s+(\d+)\s*\/\s*(\d+)\s+([\p{L}]+)$/iu,
    );
    if (m) {
      requireTime("night");
      const speaker = takeSeat(m[1]);
      const ability = /^(ww|washerwoman|洗衣妇)$/iu.test(m[2])
        ? "Washerwoman"
        : "Librarian";
      const targets = takePair(m[3], m[4]);
      const value = role(m[5]);
      const expectedTeam = ability === "Washerwoman" ? "townsfolk" : "outsider";
      if (ROLE_TEAM[value] !== expectedTeam)
        throw new Error("展示角色与首夜能力类别不符。");
      return [
        draft(
          { kind: "claim", speaker, claimKind: "role", role: ability },
          `${speaker}号声称${ROLE_ZH[ability]}`,
        ),
        draft(
          {
            kind: "claim",
            speaker,
            claimKind: "ability_report",
            role: ability,
            targets,
            value,
          },
          `${speaker}号报告${targets.join("/")}号中有${ROLE_ZH[value]}`,
        ),
      ];
    }
    m = text.match(/^(\d+)\s+(lib|librarian|图书管理员)\s+(0|zero|none|无)$/iu);
    if (m) {
      requireTime("night");
      const speaker = takeSeat(m[1]);
      return [
        draft(
          { kind: "claim", speaker, claimKind: "role", role: "Librarian" },
          `${speaker}号声称图书管理员`,
        ),
        draft(
          {
            kind: "claim",
            speaker,
            claimKind: "ability_report",
            role: "Librarian",
            value: 0,
          },
          `${speaker}号报告零外来者`,
        ),
      ];
    }
    m = text.match(/^(\d+)\s+(emp|empath|共情者)\s+(\d+)$/iu);
    if (m) {
      requireTime("night");
      const speaker = takeSeat(m[1]),
        value = Number(m[3]);
      if (value > 2) throw new Error("共情者数字只能在0到2之间。");
      return [
        draft(
          { kind: "claim", speaker, claimKind: "role", role: "Empath" },
          `${speaker}号声称共情者`,
        ),
        draft(
          {
            kind: "claim",
            speaker,
            claimKind: "ability_report",
            role: "Empath",
            value,
          },
          `${speaker}号报告${value}名邪恶邻居`,
        ),
      ];
    }
  }
  m = text.match(/^(\d+)\s+(chef|厨师)\s+(\d+)$/iu);
  if (m) {
    requireTime("night");
    const speaker = takeSeat(m[1]),
      value = Number(m[3]);
    if (value > playerCount) throw new Error("厨师数字超出座位数。");
    return [
      draft(
        { kind: "claim", speaker, claimKind: "role", role: "Chef" },
        `${speaker}号声称厨师`,
      ),
      draft(
        {
          kind: "claim",
          speaker,
          claimKind: "ability_report",
          role: "Chef",
          value,
        },
        `${speaker}号报告${value}组邪恶相邻`,
      ),
    ];
  }
  m = text.match(
    /^(\d+)\s+(ft|fortuneteller|占卜师)\s+(\d+)\s*\/\s*(\d+)\s+(yes|no|是|否)$/iu,
  );
  if (m) {
    requireTime("night");
    const speaker = takeSeat(m[1]),
      targets = takePair(m[3], m[4]),
      value = /^(yes|是)$/i.test(m[5]);
    return [
      draft(
        { kind: "claim", speaker, claimKind: "role", role: "Fortune Teller" },
        `${speaker}号声称占卜师`,
      ),
      draft(
        {
          kind: "claim",
          speaker,
          claimKind: "ability_report",
          role: "Fortune Teller",
          targets,
          value,
        },
        `${speaker}号报告${targets.join("/")}号：${value ? "是" : "否"}`,
      ),
    ];
  }
  m = text.match(/^(\d+)\s+(ut|undertaker|送葬者)\s+([\p{L}]+)$/iu);
  if (m) {
    requireTime("night");
    const speaker = takeSeat(m[1]),
      value = role(m[3]);
    return [
      draft(
        { kind: "claim", speaker, claimKind: "role", role: "Undertaker" },
        `${speaker}号声称送葬者`,
      ),
      draft(
        {
          kind: "claim",
          speaker,
          claimKind: "ability_report",
          role: "Undertaker",
          value,
        },
        `${speaker}号报告看到${ROLE_ZH[value]}`,
      ),
    ];
  }
  m = text.match(/^(\d+)\s+(rk|ravenkeeper|守鸦人)\s+(\d+)\s+([\p{L}]+)$/iu);
  if (m && standard) {
    requireTime("night");
    const speaker = takeSeat(m[1]);
    const target = takeSeat(m[3]);
    const value = role(m[4]);
    return [
      draft(
        { kind: "claim", speaker, claimKind: "role", role: "Ravenkeeper" },
        `${speaker}号声称守鸦人`,
      ),
      draft(
        {
          kind: "claim",
          speaker,
          claimKind: "ability_report",
          role: "Ravenkeeper",
          targets: [target],
          value,
        },
        `${speaker}号报告${target}号是${ROLE_ZH[value]}`,
      ),
    ];
  }
  m = text.match(/^(\d+)\s+nom\s+(\d+)$/i);
  if (m) {
    requireTime("day");
    const nominator = takeSeat(m[1]),
      nominee = takeSeat(m[2]);
    return [
      draft(
        { kind: "nomination", nominator, nominee },
        `${nominator}号提名${nominee}号`,
      ),
    ];
  }
  m = text.match(/^vote\s+(\d+)\s*=\s*(none|zero|0|无)$/i);
  if (m && standard) {
    requireTime("day");
    const nominee = takeSeat(m[1]);
    return [
      draft({ kind: "vote", nominee, voters: [] }, `提名${nominee}号：0票`),
    ];
  }
  m = text.match(/^vote\s+(\d+)\s*=\s*([\d,\s]+)$/i);
  if (m) {
    requireTime("day");
    const nominee = takeSeat(m[1]),
      voters = m[2].split(",").map((x) => takeSeat(x.trim()));
    if (new Set(voters).size !== voters.length)
      throw new Error("同一投票记录中座位不能重复。");
    return [
      draft(
        { kind: "vote", nominee, voters },
        `提名${nominee}号：${voters.length}票`,
      ),
    ];
  }
  m = text.match(/^exec\s+(\d+)$/i);
  if (m) {
    requireTime("day");
    const target = takeSeat(m[1]);
    return [draft({ kind: "execution", seat: target }, `${target}号被处决`)];
  }
  m = text.match(/^(\d+)\s+dead$/i);
  if (m) {
    requireTime();
    const target = takeSeat(m[1]);
    return [draft({ kind: "death", seat: target }, `${target}号死亡`)];
  }
  m = text.match(/^close\s+deaths$/i);
  if (m) {
    requireTime();
    if (!standard) requireTime("night");
    return [
      draft({ kind: "phase_closed", channel: "deaths" }, "本阶段死亡记录完整"),
    ];
  }
  m = text.match(/^close\s+actions$/i);
  if (m && standard) {
    requireTime("day");
    return [
      draft({ kind: "phase_closed", channel: "actions" }, "本日行动记录完整"),
    ];
  }
  m = text.match(/^win\s+(good|evil|善良|邪恶)$/i);
  if (m && standard) {
    requireTime();
    const team = /^(good|善良)$/i.test(m[1]) ? "good" : "evil";
    return [
      draft(
        { kind: "winner", team },
        `${team === "good" ? "善良" : "邪恶"}阵营获胜`,
      ),
    ];
  }
  m = text.match(/^(\d+)\s+slay\s+(\d+)$/i);
  if (m && standard) {
    requireTime("day");
    const actor = takeSeat(m[1]);
    const target = takeSeat(m[2]);
    return [
      draft({ kind: "slayer", actor, target }, `${actor}号猎手指向${target}号`),
    ];
  }
  m = text.match(/^(\d+)\s+([\p{L}]+)$/iu);
  if (m) {
    const speaker = takeSeat(m[1]),
      claimedRole = role(m[2]);
    return [
      draft(
        { kind: "claim", speaker, claimKind: "role", role: claimedRole },
        `${speaker}号声称${ROLE_ZH[claimedRole]}`,
      ),
    ];
  }
  throw new Error(
    "暂不支持该句式。可用例子：3 ft 7/8 no @N1、4 nom 5 @D1、5 dead @D1。",
  );
}
