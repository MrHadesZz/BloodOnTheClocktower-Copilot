import { test, expect, type Page } from "@playwright/test";
import {
  addStandardHypothesis,
  commitStandardEntry,
  createStandardWorkspace,
  toggleStandardHypothesis,
  type StandardWorkspace,
} from "../src/core/standardWorkspace";
import {
  closeStandardPhase,
  recordStandardRoleClaim,
} from "../src/core/standardHistory";
import type { Role } from "../src/core/model";

const n1 = { phase: "night", cycle: 1 } as const;
const d1 = { phase: "day", cycle: 1 } as const;
const n2 = { phase: "night", cycle: 2 } as const;
function fixed(roles: Role[]) {
  let w = createStandardWorkspace(roles.length);
  for (const [i, role] of roles.entries()) {
    w = addStandardHypothesis(w, { kind: "actual_role", seat: i + 1, role });
    w = toggleStandardHypothesis(w, w.hypotheses.at(-1)!.id);
  }
  return w;
}
async function importWorkspace(page: Page, w: StandardWorkspace) {
  await page.goto("/");
  await expect(page).toHaveTitle(/钟楼/);
  await page.getByRole("button", { name: "高级推理", exact: true }).click();
  const actions = page.getByRole("navigation", { name: "标准对局操作" });
  await actions.locator('input[type="file"]').setInputFiles({
    name: "history-fixture.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(w)),
  });
  await expect(page.locator(".session strong")).toHaveText(w.title);
  await expect(page.locator(".save-status")).toContainText("本地已保存");
  await actions.getByRole("button", { name: "返回魔典", exact: true }).click();
}
const closePanel = (page: Page) =>
  page.getByRole("button", { name: "关闭面板", exact: true }).click();
const records = (page: Page) =>
  page.getByRole("button", { name: "记录", exact: true }).click();
const phase = (page: Page, key: string) =>
  page.getByRole("region", { name: `${key}记录`, exact: true });
async function confirmPhase(page: Page, key: string) {
  const section = phase(page, key);
  await section
    .getByRole("button", { name: "本阶段记录完整", exact: true })
    .click();
  await expect(
    section.getByRole("button", { name: `确认${key}记录完整`, exact: true }),
  ).toBeDisabled();
  await section
    .getByRole("checkbox", { name: new RegExp(`我确认${key}`) })
    .check();
  await section
    .getByRole("button", { name: `确认${key}记录完整`, exact: true })
    .click();
  await expect(section).toContainText("本阶段已确认完整");
}
async function event(
  page: Page,
  key: string,
  kind: string,
  seat: number,
  voters?: number[],
) {
  await phase(page, key)
    .getByRole("button", { name: `补录${key}事件`, exact: true })
    .click();
  await page.getByLabel("事件类型", { exact: true }).selectOption(kind);
  await page.getByLabel("目标座位", { exact: true }).selectOption(String(seat));
  for (const voter of voters ?? [])
    await page
      .getByRole("checkbox", { name: `${voter}号`, exact: true })
      .check();
  await page.getByRole("button", { name: "保存事件", exact: true }).click();
}
async function offline(page: Page) {
  if (process.env.PLAYWRIGHT_OFFLINE === "1") {
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await page.context().setOffline(true);
  }
  await page.reload();
}

for (const width of [1440, 390]) {
  test(`continuous N1 to N2 recording, explicit completeness, execution, death and offline restore at ${width}px`, async ({
    page,
  }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    const w = {
      ...fixed([
        "Imp",
        "Spy",
        "Empath",
        "Chef",
        "Investigator",
        "Monk",
        "Fortune Teller",
        "Butler",
      ]),
      recordingTime: n1,
    };
    await importWorkspace(page, w);
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page
      .getByRole("button", { name: "3号选择角色", exact: true })
      .click();
    await page.getByRole("button", { name: "选择共情者", exact: true }).click();
    await page
      .getByRole("button", { name: "3号声称共情者", exact: true })
      .click();
    await page.getByRole("button", { name: "记录信息", exact: true }).click();
    await page.getByLabel("收到的数字").selectOption("0");
    await page.getByRole("button", { name: "保存报告", exact: true }).click();
    await closePanel(page);
    await records(page);
    await expect(phase(page, "N1")).toContainText("3号报告0名邪恶邻居");
    await confirmPhase(page, "N1");
    await phase(page, "N1")
      .getByRole("button", { name: "前往D1", exact: true })
      .click();
    await expect(phase(page, "D1")).toContainText("空白不表示没有发生");
    await event(page, "D1", "nomination", 4);
    await event(page, "D1", "vote", 4, [1, 2, 3, 5]);
    await event(page, "D1", "execution", 4);
    await event(page, "D1", "death", 4);
    await expect(phase(page, "D1")).toContainText("4号被处决");
    await expect(phase(page, "D1")).toContainText("4号死亡");
    await confirmPhase(page, "D1");
    await phase(page, "D1")
      .getByRole("button", { name: "前往N2", exact: true })
      .click();
    await event(page, "N2", "death", 5);
    await closePanel(page);
    await page
      .getByRole("button", { name: "3号声称共情者", exact: true })
      .click();
    await page.getByRole("button", { name: "记录信息", exact: true }).click();
    await expect(page.getByLabel("记录天数")).toHaveValue("2");
    await page.getByLabel("收到的数字").selectOption("1");
    await page.getByRole("button", { name: "保存报告", exact: true }).click();
    await closePanel(page);
    await page.getByRole("button", { name: "一键分析", exact: true }).click();
    const result = page.getByRole("region", { name: "声称分析结果" });
    await expect(result).toContainText("结果未知", { timeout: 40000 });
    await expect(result).toContainText("N2");
    await closePanel(page);
    await records(page);
    await expect(phase(page, "N2")).toContainText("3号报告1名邪恶邻居");
    await confirmPhase(page, "N2");
    expect(
      await page
        .locator("dialog")
        .evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.locator("dialog").evaluate((el) => {
      const target = el.querySelector('[aria-label="D1记录"]')!;
      el.scrollTop +=
        target.getBoundingClientRect().top -
        el.getBoundingClientRect().top -
        16;
    });
    await page.screenshot({
      path: testInfo.outputPath(`phase-history-${width}.png`),
    });
    await closePanel(page);
    await page.getByRole("button", { name: "一键分析", exact: true }).click();
    await expect(result).toContainText("已录声称可以同时成立", {
      timeout: 40000,
    });
    await closePanel(page);
    await offline(page);
    await expect(page.getByLabel("当前天数")).toHaveValue("2");
    await records(page);
    for (const key of ["N1", "D1", "N2"])
      await expect(phase(page, key)).toContainText("本阶段已确认完整");
    await closePanel(page);
    await page.getByRole("button", { name: "一键分析", exact: true }).click();
    await expect(result).toContainText("已录声称可以同时成立", {
      timeout: 40000,
    });
    expect(errors).toEqual([]);
  });

  test(`changed report, corrected report and history survive refresh at ${width}px`, async ({
    page,
  }) => {
    let w = fixed([
      "Empath",
      "Imp",
      "Washerwoman",
      "Chef",
      "Monk",
      "Poisoner",
      "Soldier",
    ]);
    w = commitStandardEntry(w, "1 共情者 0 @N1", "public");
    w = { ...w, recordingTime: n2 };
    await importWorkspace(page, w);
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await records(page);
    await phase(page, "N1")
      .getByRole("button", { name: "记录改口1号报告0名邪恶邻居", exact: true })
      .click();
    await expect(page.getByLabel("记录天数")).toBeDisabled();
    await expect(page.getByLabel("记录天数")).toHaveValue("1");
    await page.getByLabel("收到的数字").selectOption("1");
    await page.getByRole("button", { name: "保存报告", exact: true }).click();
    await closePanel(page);
    await page.getByRole("button", { name: "一键分析", exact: true }).click();
    await expect(
      page.getByRole("region", { name: "声称分析结果" }),
    ).toContainText("已录声称可以同时成立", { timeout: 40000 });
    await closePanel(page);
    await page.getByRole("button", { name: "推理", exact: true }).click();
    const newest = page
      .locator(".gr-report")
      .filter({ hasText: "1号报告1名邪恶邻居" });
    await newest.getByLabel("采纳准确转述", { exact: true }).check();
    await newest.getByLabel("能力有效", { exact: true }).check();
    await closePanel(page);
    await records(page);
    await phase(page, "N1")
      .getByRole("button", { name: "纠正1号报告1名邪恶邻居", exact: true })
      .click();
    await expect(page.getByLabel("收到的数字")).toHaveValue("1");
    await page.getByLabel("收到的数字").selectOption("2");
    await page.getByRole("button", { name: "保存报告", exact: true }).click();
    // The earlier changed report remains in history; correction clears the
    // edited report's adoption without hiding the historical report.
    for (const label of ["采纳准确转述", "能力有效"]) {
      const checkboxes = page.getByLabel(label, { exact: true });
      await expect(checkboxes).toHaveCount(2);
      for (const checkbox of await checkboxes.all())
        await expect(checkbox).not.toBeChecked();
    }
    await closePanel(page);
    await records(page);
    await expect(
      phase(page, "N1").locator(".gr-history-superseded"),
    ).toContainText("1号报告0名邪恶邻居");
    await expect(
      phase(page, "N1").locator(".gr-history-corrected"),
    ).toContainText("1号报告1名邪恶邻居");
    await expect(
      phase(page, "N1")
        .locator(".gr-history-active")
        .filter({ hasText: "1号报告2名邪恶邻居" }),
    ).toContainText("录入纠正");
    expect(
      await page
        .locator("dialog")
        .evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
    await closePanel(page);
    await offline(page);
    await expect(page.getByLabel("当前天数")).toHaveValue("2");
    await records(page);
    await expect(phase(page, "N1")).toContainText("已纠正的原记录");
    await expect(phase(page, "N1")).toContainText("N2记录本次变化");
    await closePanel(page);
    await page.getByRole("button", { name: "一键分析", exact: true }).click();
    await expect(
      page.getByRole("region", { name: "声称分析结果" }),
    ).toContainText("发现声称或信息冲突", { timeout: 40000 });
    await expect(
      page.getByRole("region", { name: "声称分析结果" }),
    ).toContainText("组合搜索已完成");
  });
}

test("editing a complete observation reopens its stage until reconfirmed", async ({
  page,
}) => {
  let w = fixed([
    "Imp",
    "Spy",
    "Empath",
    "Chef",
    "Investigator",
    "Monk",
    "Fortune Teller",
    "Butler",
  ]);
  w = closeStandardPhase(w, n1, true);
  w = commitStandardEntry(w, "4 dead @N2", "public");
  w = closeStandardPhase(w, d1, true);
  w = closeStandardPhase(w, n2, true);
  w = { ...w, recordingTime: n2 };
  await importWorkspace(page, w);
  await records(page);
  await expect(phase(page, "N2")).toContainText("本阶段已确认完整");
  await phase(page, "N2")
    .getByRole("button", { name: "撤销4号死亡", exact: true })
    .click();
  await expect(phase(page, "N2")).toContainText("本阶段尚未确认完整");
  await expect(phase(page, "D1")).toContainText("本阶段已确认完整");
  await expect(
    phase(page, "N2").getByText("本阶段死亡记录完整", { exact: true }),
  ).toHaveCount(0);
  await confirmPhase(page, "N2");
  await closePanel(page);
  await page.getByRole("button", { name: "推理", exact: true }).click();
  await page.getByLabel("魔典查询时点").selectOption("current");
  await page.getByLabel("魔典查询座位").selectOption("4");
  await page.getByLabel("魔典查询角色").selectOption("Chef");
  await page.getByRole("button", { name: "运行推理", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "魔典推理结果" }),
  ).toContainText("必然成立", { timeout: 20000 });
});

test("starting identity and current role stay separate across succession and fine diagnosis", async ({
  page,
}) => {
  let w = fixed([
    "Fortune Teller",
    "Chef",
    "Investigator",
    "Scarlet Woman",
    "Monk",
    "Undertaker",
    "Imp",
    "Butler",
  ]);
  w = recordStandardRoleClaim(w, 4, "Scarlet Woman", d1, "initial");
  w = closeStandardPhase(w, n1, true);
  w = closeStandardPhase(w, d1, true);
  w = commitStandardEntry(w, "7 dead @N2", "public");
  w = closeStandardPhase(w, n2, true);
  w = { ...w, recordingTime: n2 };
  await importWorkspace(page, w);
  await page
    .getByRole("button", { name: "4号声称红唇女郎", exact: true })
    .click();
  await page.getByLabel("身份时点").selectOption("current");
  await page.getByRole("button", { name: "选择小恶魔", exact: true }).click();
  await page.getByRole("button", { name: "一键分析", exact: true }).click();
  const result = page.getByRole("region", { name: "声称分析结果" });
  await expect(result).toContainText("已录声称可以同时成立", {
    timeout: 40000,
  });
  await closePanel(page);
  await offline(page);
  await expect(
    page.getByRole("button", { name: /4号声称小恶魔.*N2当前角色声称/ }),
  ).toBeVisible();
  // Moving forward keeps the last recorded current claim with its source
  // phase; it must not fall back to the starting Scarlet Woman claim.
  await page.getByRole("button", { name: "切换昼夜", exact: true }).click();
  await expect(
    page.getByRole("button", {
      name: /4号声称小恶魔.*N2当前角色声称（最近记录）/,
    }),
  ).toBeVisible();
  await expect(page.getByText("N2时声称", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "切换昼夜", exact: true }).click();
  await page
    .getByRole("button", { name: /4号声称小恶魔.*N2当前角色声称/ })
    .click();
  await expect(
    page.getByText("已记录开局声称：红唇女郎。", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("身份时点").selectOption("current");
  await page.getByRole("button", { name: "选择红唇女郎", exact: true }).click();
  await page.getByRole("button", { name: "一键分析", exact: true }).click();
  await expect(result).toContainText("组合搜索已完成", { timeout: 40000 });
  const fine = result.getByRole("region", { name: "细查4号", exact: true });
  await fine.getByRole("button", { name: "细查原因", exact: true }).click();
  await expect(fine).toContainText("具体条件的解释搜索已完成", {
    timeout: 30000,
  });
  await expect(fine.locator(".gr-condition-explanation li > b")).toHaveText([
    "4号N2结束时角色为红唇女郎",
  ]);
  await expect(fine).toContainText("此见证对应角色为小恶魔");
});
