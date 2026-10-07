import { test, expect, type Page } from "@playwright/test";
import {
  commitStandardEntry,
  createStandardWorkspace,
  type StandardWorkspace,
} from "../src/core/standardWorkspace";

function fixture(extraPair = false) {
  let workspace = createStandardWorkspace(7);
  workspace.title = extraPair ? "三组重复身份" : "两组重复身份";
  for (const line of [
    "1 共情者 0 @N1",
    "2 共情者 0 @N1",
    "3 厨师 0 @N1",
    "4 厨师 0 @N1",
    ...(extraPair ? ["5 Monk @D1", "6 Monk @D1"] : []),
  ])
    workspace = commitStandardEntry(workspace, line);
  return workspace;
}

async function importWorkspace(page: Page, workspace: StandardWorkspace) {
  await page.goto("/");
  await expect(page).toHaveTitle(/钟楼/);
  await page.getByRole("button", { name: "高级推理", exact: true }).click();
  const actions = page.getByRole("navigation", { name: "标准对局操作" });
  await actions.locator('input[type="file"]').setInputFiles({
    name: "multi-player-fixture.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(workspace)),
  });
  await expect(page.locator(".session strong")).toHaveText(workspace.title);
  await expect(page.locator(".save-status")).toContainText("本地已保存");
  await actions.getByRole("button", { name: "返回魔典", exact: true }).click();
}

for (const width of [1440, 390]) {
  test(`verified multi-player combinations, sources, unchanged conditions and offline recovery at ${width}px`, async ({
    page,
    context,
  }, testInfo) => {
    // A single test includes three analysis runs, each with its own search budget.
    test.setTimeout(120000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await importWorkspace(page, fixture());
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.getByRole("button", { name: "一键分析", exact: true }).click();
    const result = page.getByRole("region", { name: "声称分析结果" });
    const repairs = result.locator(".gr-analysis-repair");
    await expect(repairs).toHaveCount(4, { timeout: 40000 });
    await expect(result).toContainText("组合搜索已完成");
    for (const [index, pair] of [
      [1, "1号、3号"],
      [2, "1号、4号"],
      [3, "2号、3号"],
      [4, "2号、4号"],
    ] as const) {
      await expect(repairs.nth(index - 1)).toContainText(
        `组合${index}：放宽${pair}`,
      );
      await expect(repairs.nth(index - 1)).toContainText("已验证不可再缩小");
    }
    await repairs
      .first()
      .getByText("查看放宽的身份与信息", { exact: true })
      .click();
    await expect(repairs.first()).toContainText("1号报告0名邪恶邻居 · N1");
    await expect(repairs.first()).toContainText("3号报告0组邪恶相邻 · N1");
    await expect(repairs.first()).toContainText("不能据此断言报告一定错误");
    await repairs
      .first()
      .getByText("查看组合1的可能解释", { exact: true })
      .click();
    await expect(repairs.first()).toContainText("初始真实角色分配");
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
    await repairs
      .first()
      .getByText("查看组合1的可能解释", { exact: true })
      .click();
    await repairs
      .first()
      .getByText("查看放宽的身份与信息", { exact: true })
      .click();
    await page.locator("dialog").evaluate((el) => {
      const target = el.querySelector(".gr-analysis-repairs")!;
      el.scrollTop +=
        target.getBoundingClientRect().top -
        el.getBoundingClientRect().top -
        16;
    });
    await page.screenshot({
      path: testInfo.outputPath(`multi-player-analysis-${width}.png`),
    });
    await page.getByRole("button", { name: "关闭面板", exact: true }).click();
    await page.getByRole("button", { name: "推理", exact: true }).click();
    for (const label of ["采纳准确转述", "能力有效"]) {
      const conditions = page.getByLabel(label, { exact: true });
      await expect(conditions).toHaveCount(4);
      for (const condition of await conditions.all())
        await expect(condition).not.toBeChecked();
    }
    await page.getByRole("button", { name: "关闭面板", exact: true }).click();
    if (process.env.PLAYWRIGHT_OFFLINE === "1") {
      await page.evaluate(async () => {
        await navigator.serviceWorker.ready;
      });
      await context.setOffline(true);
    }
    await page.reload();
    await page.getByRole("button", { name: "一键分析", exact: true }).click();
    await expect(repairs).toHaveCount(4, { timeout: 40000 });
    await expect(result).toContainText("组合搜索已完成");
    await page.getByRole("button", { name: "关闭面板", exact: true }).click();
    await page.getByRole("button", { name: "记录", exact: true }).click();
    await page
      .getByRole("button", { name: "撤销1号报告0名邪恶邻居", exact: true })
      .click();
    await page.getByRole("button", { name: "关闭面板", exact: true }).click();
    await page
      .getByRole("button", { name: "1号声称共情者", exact: true })
      .click();
    await page.getByRole("button", { name: "清除角色", exact: true }).click();
    await page.getByRole("button", { name: "一键分析", exact: true }).click();
    await expect(result).toContainText("组合搜索已完成", { timeout: 40000 });
    await expect(repairs).toHaveCount(2);
    await expect(repairs.nth(0)).toContainText("组合1：放宽3号");
    await expect(repairs.nth(1)).toContainText("组合2：放宽4号");
    await expect(result).not.toContainText("放宽1号、3号");
    expect(await page.locator("vite-error-overlay").count()).toBe(0);
    expect(errors).toEqual([]);
  });
}

test("combination limit retains verified explanations and clearly marks incomplete search", async ({
  page,
}) => {
  await importWorkspace(page, fixture(true));
  await page.getByRole("button", { name: "一键分析", exact: true }).click();
  const result = page.getByRole("region", { name: "声称分析结果" });
  await expect(result.locator(".gr-analysis-repair")).toHaveCount(6, {
    timeout: 40000,
  });
  await expect(result).toContainText("已达到展示组合上限");
  await expect(result).toContainText(
    "其他组合尚未搜索完，未展示的组合不能被排除",
  );
  await expect(result).not.toContainText("组合搜索已完成");
});

test.describe("analysis cancellation", () => {
  test.use({ serviceWorkers: "block" });
  test("cancelled or closed initialization cannot publish a stale combination", async ({
    page,
    context,
  }) => {
    await importWorkspace(page, fixture());
    let release = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await context.route("**/z3/worker-host.js*", async (route) => {
      await gate;
      await route.continue().catch(() => undefined);
    });
    await page.getByRole("button", { name: "一键分析", exact: true }).click();
    await page.getByRole("button", { name: "取消分析", exact: true }).click();
    await expect(page.getByRole("alert")).toContainText("已取消分析");
    await expect(
      page.getByRole("region", { name: "声称分析结果" }),
    ).toHaveCount(0);
    release();
    await context.unrouteAll({ behavior: "wait" });
    await page.getByRole("button", { name: "关闭面板", exact: true }).click();
    await page.getByRole("button", { name: "一键分析", exact: true }).click();
    const result = page.getByRole("region", { name: "声称分析结果" });
    await expect(result.locator(".gr-analysis-repair")).toHaveCount(4, {
      timeout: 40000,
    });
    await expect(result).toContainText("组合搜索已完成");
    await expect(page.getByRole("alert")).toHaveCount(0);
  });
});
