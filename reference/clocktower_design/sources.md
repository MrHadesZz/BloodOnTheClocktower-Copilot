# Sources and provenance

核对日期：2026-09-22。官方页面是规则来源；本项目的架构、算法选择、界面、指标和排期是设计建议。示例计数来自 `verify_walkthrough.py`，不来自外部统计。实际开发应记录规则页面快照、版本哈希与语义变更，不仅保存会变化的链接。

| ID | Primary source | URL | 本设计使用范围 |
|---|---|---|---|
| S1 | Official Wiki — Trouble Brewing | `https://wiki.bloodontheclocktower.com/Trouble_Brewing` | 角色目录、角色类别、善良玩家也可以伪装 |
| S2 | Official Wiki — Baron | `https://wiki.bloodontheclocktower.com/Baron` | 初始外来者+2、替换镇民、设置效果 |
| S3 | Official Wiki — Drunk | `https://wiki.bloodontheclocktower.com/Drunk` | 真实外来者与所见镇民token分离 |
| S4 | Official Wiki — Poisoner | `https://wiki.bloodontheclocktower.com/Poisoner` | 投毒时限、错误信息、变成其他角色后效果终止 |
| S5 | Official Wiki — Recluse | `https://wiki.bloodontheclocktower.com/Recluse` | 可选、逐次错认与能力互动 |
| S6 | Official Wiki — Spy | `https://wiki.bloodontheclocktower.com/Spy` | 错认、非信息能力互动、魔典 |
| S7 | Official Wiki — Imp | `https://wiki.bloodontheclocktower.com/Imp` | 非首夜攻击、自杀传位、继任时序 |
| S8 | Official Wiki — Scarlet Woman | `https://wiki.bloodontheclocktower.com/Scarlet_Woman` | 继任阈值和触发 |
| S9 | Official Wiki — Abilities | `https://wiki.bloodontheclocktower.com/Abilities` | 能力/效果生命周期、即时触发与角色改变 |
| S10 | Official Wiki — States | `https://wiki.bloodontheclocktower.com/States` | 醉毒、能力失效、真或假信息 |
| S11 | Official Wiki — Investigator | `https://wiki.bloodontheclocktower.com/Investigator` | 首夜爪牙信息、错认例外 |
| S12 | Official Wiki — Chef | `https://wiki.bloodontheclocktower.com/Chef` | 环形相邻邪恶对数 |
| S13 | Official Wiki — Fortune Teller | `https://wiki.bloodontheclocktower.com/Fortune_Teller` | 两目标信息、红鲱鱼 |
| S14 | Official Wiki — Undertaker | `https://wiki.bloodontheclocktower.com/Undertaker` | 因当天处决而死亡的角色信息 |
| S15 | Official Wiki — Mayor | `https://wiki.bloodontheclocktower.com/Mayor` | 可选死亡转移、三存活终局 |
| S16 | Official Wiki — Virgin | `https://wiki.bloodontheclocktower.com/Virgin` | 首次提名、能力消耗、Spy例外 |
| S17 | Official Wiki — Rules Explanation | `https://wiki.bloodontheclocktower.com/Rules_Explanation` | 提名、投票、平票、死亡与发言 |
| S18 | Z3 authors — Programming Z3 | `https://theory.stanford.edu/~nikolaj/programmingz3.html` | 增量求解、假设、不可满足核心 |
| S19 | MDN — IndexedDB API | `https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API` | 浏览器结构化本地持久化 |
| S20 | Z3 official TypeScript package README | `https://raw.githubusercontent.com/Z3Prover/z3/master/src/api/js/PUBLISHED_README.md` | 浏览器/WASM、SharedArrayBuffer、线程与并发限制 |
| S21 | Microsoft — Z3 JavaScript introduction | `https://microsoft.github.io/z3guide/programming/Z3%20JavaScript%20Examples/` | 官方浏览器示例与JS绑定背景；实际API以锁定版本为准 |
| S22 | Official Blood on the Clocktower Script Tool | `https://script.bloodontheclocktower.com/` | 官方脚本制作工具；不代表穷尽同类产品 |
| S23 | Official Wiki — Setup | `https://wiki.bloodontheclocktower.com/Setup` | 八人设置示例与基本配比 |
| S24 | Official Wiki — Monk | `https://wiki.bloodontheclocktower.com/Monk` | 保护对象、首夜限制、恶魔保护 |
| S25 | Official Wiki — Butler | `https://wiki.bloodontheclocktower.com/Butler` | 投票主人条件 |

| S26 | React official docs — Build a React app from Scratch | `https://react.dev/learn/build-a-react-app-from-scratch` | Vite/TypeScript客户端起步，以及自行处理路由、数据和未来SSR的取舍 |

用户提供的需求文件：`blood_on_the_clocktower_reasoning_copilot_prompt.md`，共28个最终答复章节。原附件八人角色示例不是合法的标准配比：其同时放入Poisoner和Baron，而标准八人只有一位爪牙；Baron修改外来者/镇民数量，不增加爪牙。

局限：此处完成的是本设计所需的关键规则和技术能力核对，并非全TB机制的形式化证明、全量社区工具竞品调查或系统文献综述。基准指标、UX目标和开发阶段为建议，未声称已完成用户实验或完整引擎性能测试。
