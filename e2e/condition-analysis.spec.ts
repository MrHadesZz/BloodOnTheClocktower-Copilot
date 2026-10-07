import { test, expect, type Page } from "@playwright/test";
import {
  addStandardHypothesis,
  commitStandardEntry,
  createStandardWorkspace,
  toggleStandardHypothesis,
  type StandardWorkspace,
  type HypothesisDraft,
} from "../src/core/standardWorkspace";
import type { Role } from "../src/core/model";

function adopt(w: StandardWorkspace, premise: HypothesisDraft) {
  const next = addStandardHypothesis(w, premise);
  return toggleStandardHypothesis(next, next.hypotheses.at(-1)!.id);
}
function fixedRoles(roles: Role[]) {
  let w = createStandardWorkspace(roles.length);
  for (const [index, role] of roles.entries())
    w = adopt(w, { kind: "actual_role", seat: index + 1, role });
  return w;
}
function fixture(kind: "message" | "poison" | "drunk" | "later" = "message") {
  let w =
    kind === "drunk"
      ? fixedRoles([
          "Drunk",
          "Chef",
          "Monk",
          "Investigator",
          "Soldier",
          "Fortune Teller",
          "Spy",
          "Imp",
        ])
      : kind === "later"
        ? fixedRoles([
            "Imp",
            "Spy",
            "Empath",
            "Chef",
            "Investigator",
            "Monk",
            "Fortune Teller",
            "Butler",
          ])
        : fixedRoles([
            "Empath",
            "Imp",
            "Washerwoman",
            "Chef",
            "Monk",
            "Poisoner",
            "Soldier",
          ]);
  if (kind === "drunk")
    w = adopt(w, { kind: "seen_token", seat: 1, shownRole: "Empath" });
  if (kind === "poison")
    w = adopt(w, { kind: "night_one_poison", poisonerSeat: 6, targetSeat: 1 });
  for (const line of kind === "later"
    ? [
        "3 共情者 0 @N1",
        "close deaths @N1",
        "close actions @D1",
        "close deaths @D1",
        "4 dead @N2",
        "close deaths @N2",
        "3 共情者 2 @N2",
      ]
    : ["1 共情者 0 @N1"])
    w = commitStandardEntry(w, line, "public");
  w.title = `逐项解释-${kind}`;
  return w;
}

async function importWorkspace(page: Page, workspace: StandardWorkspace) {
  await page.goto("/");
  await expect(page).toHaveTitle(/钟楼/);
  await page.getByRole("button", { name: "高级推理", exact: true }).click();
  const actions = page.getByRole("navigation", { name: "标准对局操作" });
  await actions.locator('input[type="file"]').setInputFiles({
    name: "condition-fixture.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(workspace)),
  });
  await expect(page.locator(".session strong")).toHaveText(workspace.title);
  await expect(page.locator(".save-status")).toContainText("本地已保存");
  await actions.getByRole("button", { name: "返回魔典", exact: true }).click();
}

async function startAnalysis(page: Page, seat = 1) {
  await page.getByRole("button", { name: "一键分析", exact: true }).click();
  const result = page.getByRole("region", { name: "声称分析结果" });
  await expect(result).toContainText("组合搜索已完成", { timeout: 40000 });
  const repair = result.locator(".gr-analysis-repair").first();
  await expect(repair).toContainText(`组合1：放宽${seat}号`);
  const fine = repair.getByRole("region", {
    name: `细查${seat}号`,
    exact: true,
  });
  await fine.getByRole("button", { name: "细查原因", exact: true }).click();
  return fine;
}

for (const width of [1440, 390]) {
  test(`individual report conditions, unchanged premises and offline recovery at ${width}px`, async ({
    page,
    context,
  }, testInfo) => {
    // This flow runs several separately bounded searches before and after reload.
    test.setTimeout(120000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await importWorkspace(page, fixture());
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    let fine = await startAnalysis(page);
    await expect(fine).toContainText("具体条件的解释搜索已完成", {
      timeout: 30000,
    });
    const explanations = fine.locator(".gr-condition-explanation");
    await expect(explanations).toHaveCount(2);
    for (const label of ["1号N1共情者报告准确转述", "1号N1共情者报告能力有效"])
      await expect(
        explanations.locator("li > b").filter({ hasText: label }),
      ).toBeVisible();
    await expect(explanations).toHaveText([
      /已验证不可再缩小[\s\S]*原记录：1号报告0名邪恶邻居/,
      /已验证不可再缩小[\s\S]*原记录：1号报告0名邪恶邻居/,
    ]);
    await expect(fine).toContainText("能力是否失效以及具体原因尚未验证");
    await expect(fine).not.toContainText("支持一种中毒解释");
    await explanations
      .first()
      .getByText("查看本组合仍保留的条件", { exact: true })
      .click();
    await expect(
      explanations.first().getByText("1号开局身份为共情者", { exact: true }),
    ).toBeVisible();
    await explanations
      .first()
      .getByText("查看细查解释1的可能分配与行动", { exact: true })
      .click();
    await expect(explanations.first()).toContainText("初始真实角色分配");
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
    await explanations
      .first()
      .getByText("查看细查解释1的可能分配与行动", { exact: true })
      .click();
    await explanations
      .first()
      .getByText("查看本组合仍保留的条件", { exact: true })
      .click();
    await page.locator("dialog").evaluate((el) => {
      const target = el.querySelector(".gr-condition-result")!;
      el.scrollTop +=
        target.getBoundingClientRect().top -
        el.getBoundingClientRect().top -
        16;
    });
    await page.screenshot({
      path: testInfo.outputPath(`condition-analysis-${width}.png`),
    });
    await page.getByRole("button", { name: "关闭面板", exact: true }).click();
    await page.getByRole("button", { name: "推理", exact: true }).click();
    for (const label of ["采纳准确转述", "能力有效"])
      await expect(page.getByLabel(label, { exact: true })).not.toBeChecked();
    await page.getByRole("button", { name: "关闭面板", exact: true }).click();
    if (process.env.PLAYWRIGHT_OFFLINE === "1") {
      await page.evaluate(async () => {
        await navigator.serviceWorker.ready;
      });
      await context.setOffline(true);
    }
    await page.reload();
    fine = await startAnalysis(page);
    await expect(fine.locator(".gr-condition-explanation")).toHaveCount(2, {
      timeout: 30000,
    });
    await expect(fine).toContainText("具体条件的解释搜索已完成", {
      timeout: 30000,
    });
    await page.getByRole("button", { name: "关闭面板", exact: true }).click();
    await page.getByRole("button", { name: "记录", exact: true }).click();
    await page
      .getByRole("button", { name: "撤销1号报告0名邪恶邻居", exact: true })
      .click();
    await page.getByRole("button", { name: "关闭面板", exact: true }).click();
    await page.getByRole("button", { name: "一键分析", exact: true }).click();
    await expect(
      page.getByRole("region", { name: "声称分析结果" }),
    ).toContainText("已录声称可以同时成立", { timeout: 40000 });
    await expect(page.locator(".gr-condition-explanation")).toHaveCount(0);
    expect(await page.locator("vite-error-overlay").count()).toBe(0);
    expect(errors).toEqual([]);
  });
}

for (const kind of ["drunk", "poison"] as const) {
  test(`verified ${kind} evidence retains message accuracy`, async ({
    page,
  }) => {
    await importWorkspace(page, fixture(kind));
    const fine = await startAnalysis(page);
    await expect(fine).toContainText("具体条件的解释搜索已完成", {
      timeout: 30000,
    });
    await expect(fine.locator(".gr-condition-explanation")).toHaveCount(1);
    await expect(fine).toContainText(
      kind === "drunk" ? "支持一种醉酒解释" : "支持一种中毒解释",
    );
    await expect(fine).toContainText("本解释仍保留这条报告的准确转述条件");
    if (kind === "drunk") await expect(fine).toContainText("所见身份为共情者");
    await expect(
      fine.locator("li > b").filter({ hasText: "1号N1共情者报告准确转述" }),
    ).toHaveCount(0);
  });
}

test("later report explanations name N2 and retain N1", async ({ page }) => {
  await importWorkspace(page, fixture("later"));
  const fine = await startAnalysis(page, 3);
  await expect(fine).toContainText("具体条件的解释搜索已完成", {
    timeout: 30000,
  });
  await expect(fine.locator(".gr-condition-explanation")).toHaveCount(2);
  const labels = fine.locator(".gr-condition-explanation li > b");
  await expect(labels).toHaveText([
    "3号N2共情者报告准确转述",
    "3号N2共情者报告能力有效",
  ]);
  await expect(fine).toContainText("原记录：3号报告2名邪恶邻居");
  await fine
    .locator(".gr-condition-explanation")
    .first()
    .getByText("查看本组合仍保留的条件", { exact: true })
    .click();
  await expect(
    fine.getByText("3号N1共情者报告准确转述", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    fine.getByText("3号N1共情者报告能力有效", { exact: true }).first(),
  ).toBeVisible();
});

test.describe("fine analysis cancellation", () => {
  test.use({ serviceWorkers: "block" });
  test("cancelled initialization and closed panels cannot publish stale explanations", async ({
    page,
    context,
  }) => {
    await importWorkspace(page, fixture());
    await page.getByRole("button", { name: "一键分析", exact: true }).click();
    const result = page.getByRole("region", { name: "声称分析结果" });
    await expect(result).toContainText("组合搜索已完成", { timeout: 40000 });
    let release = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await context.route("**/z3/worker-host.js*", async (route) => {
      await gate;
      await route.continue().catch(() => undefined);
    });
    const fine = result.getByRole("region", { name: "细查1号", exact: true });
    await fine.getByRole("button", { name: "细查原因", exact: true }).click();
    await fine.getByRole("button", { name: "取消细查", exact: true }).click();
    await expect(fine.getByRole("alert")).toContainText("已取消细查");
    await expect(fine.locator(".gr-condition-explanation")).toHaveCount(0);
    await fine
      .getByRole("button", { name: "重新细查原因", exact: true })
      .click();
    await page.getByRole("button", { name: "关闭面板", exact: true }).click();
    release();
    await context.unrouteAll({ behavior: "wait" });
    const reopened = await startAnalysis(page);
    await expect(reopened.locator(".gr-condition-explanation")).toHaveCount(2, {
      timeout: 30000,
    });
    await expect(reopened).toContainText("具体条件的解释搜索已完成");
    await expect(reopened.getByRole("alert")).toHaveCount(0);
  });
});
