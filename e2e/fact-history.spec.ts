import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import {
  addStandardHypothesis,
  commitStandardEntry,
  commitStandardDrafts,
  createStandardWorkspace,
  createStandardBranch,
  toggleStandardHypothesis,
  type StandardWorkspace,
} from "../src/core/standardWorkspace";
import { closeStandardPhase } from "../src/core/standardHistory";
import type { Role } from "../src/core/model";

function fixture(duplicateDeath = true): StandardWorkspace {
  let w = createStandardWorkspace(7);
  const roles: Role[] = [
    "Chef",
    "Empath",
    "Monk",
    "Fortune Teller",
    "Soldier",
    "Poisoner",
    "Imp",
  ];
  for (const [i, role] of roles.entries()) {
    w = addStandardHypothesis(w, { kind: "actual_role", seat: i + 1, role });
    w = toggleStandardHypothesis(w, w.hypotheses.at(-1)!.id);
  }
  w = closeStandardPhase(w, { phase: "night", cycle: 1 }, true);
  for (const text of [
    "1 nom 3 @D1",
    "vote 3 = 1,2,3,4 @D1",
    "exec 3 @D1",
    "3 dead @D1",
  ])
    w = commitStandardEntry(w, text, "public");
  w = closeStandardPhase(w, { phase: "day", cycle: 1 }, true);
  w = commitStandardEntry(
    w,
    duplicateDeath ? "3 dead @N2" : "4 dead @N2",
    "public",
  );
  w = closeStandardPhase(w, { phase: "night", cycle: 2 }, true);
  const text = "匿名示例：1号声称厨师";
  w = commitStandardDrafts(w, text, [
    {
      payload: { kind: "claim", speaker: 1, claimKind: "role", role: "Chef" },
      occurredAt: { phase: "night", cycle: 1 },
      label: text,
      sourceSpan: [0, text.length],
    },
  ]);
  return {
    ...w,
    title: "匿名阶段冲突示例",
    recordingTime: { phase: "night", cycle: 2 },
  };
}
async function menu(page: Page) {
  if ((page.viewportSize()?.width ?? 1440) <= 600) {
    const actions = page.locator(".standard-mobile-actions");
    if ((await actions.getAttribute("open")) === null)
      await page.getByLabel("标准对局菜单").click();
    return actions;
  }
  return page.getByRole("navigation", { name: "标准对局操作" });
}
async function importGame(page: Page, workspace: StandardWorkspace) {
  await page.getByRole("button", { name: "高级推理", exact: true }).click();
  const actions = await menu(page);
  await actions.locator('input[type="file"]').setInputFiles({
    name: "anonymous-history.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(workspace)),
  });
  await expect(page.locator(".session strong")).toHaveText(workspace.title);
  await (
    await menu(page)
  )
    .getByRole("button", { name: "返回魔典", exact: true })
    .click();
}
async function records(page: Page) {
  await page.getByRole("button", { name: "记录", exact: true }).click();
  await page.getByText("核对固定事实与阶段冲突", { exact: true }).click();
  return page.getByRole("region", { name: "固定事实阶段核对", exact: true });
}
const close = (page: Page) =>
  page.getByRole("button", { name: "关闭面板", exact: true }).click();

for (const width of [1440, 390]) {
  test(`phase sources, verified witness, unchanged records and offline recovery at ${width}px`, async ({
    page,
    context,
  }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle("钟楼推理台");
    expect(new URL(page.url()).pathname).toBe("/");
    const directory = process.env.FACT_HISTORY_SCREENSHOT_DIR;
    if (directory)
      await page.screenshot({
        path: `${directory}/fact-first-view-${width}.png`,
      });
    const original = fixture();
    await importGame(page, original);
    const panel = await records(page);
    await panel
      .getByRole("button", { name: "核对固定事实", exact: true })
      .click();
    await expect(
      panel.getByRole("heading", {
        name: "最早确认冲突的阶段：N2",
        exact: true,
      }),
    ).toBeVisible({ timeout: 35000 });
    await expect(panel).toContainText("D1：截至本阶段有兼容见证");
    await panel.getByText("回看3号死亡 · N2", { exact: true }).click();
    await expect(panel.locator("blockquote").first()).toContainText(
      "3 dead @N2",
    );
    await panel.getByText("查看截至D1的兼容见证", { exact: true }).click();
    await expect(panel).toContainText("初始真实角色分配");
    expect(
      await page
        .locator("dialog")
        .evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
    expect(await page.locator("vite-error-overlay").count()).toBe(0);
    await panel
      .getByRole("heading", { name: "最早确认冲突的阶段：N2", exact: true })
      .scrollIntoViewIfNeeded();
    if (directory)
      await page.screenshot({ path: `${directory}/fact-history-${width}.png` });
    await close(page);
    await page.getByRole("button", { name: "高级推理", exact: true }).click();
    const downloadPending = page.waitForEvent("download");
    await (
      await menu(page)
    )
      .getByRole("button", { name: "私密全量导出", exact: true })
      .click();
    const download = await downloadPending;
    const path = await download.path();
    expect(path).toBeTruthy();
    expect(JSON.parse(readFileSync(path!, "utf8"))).toEqual(original);
    if (process.env.PLAYWRIGHT_OFFLINE === "1") {
      await expect(page.locator(".session small")).toContainText(
        "离线资源已就绪",
        { timeout: 30000 },
      );
    }
    await (
      await menu(page)
    )
      .getByRole("button", { name: "返回魔典", exact: true })
      .click();
    if (process.env.PLAYWRIGHT_OFFLINE === "1") {
      await context.setOffline(true);
    }
    await page.reload();
    const restored = await records(page);
    await expect(
      restored.getByRole("heading", {
        name: "最早确认冲突的阶段：N2",
        exact: true,
      }),
    ).toHaveCount(0);
    await restored
      .getByRole("button", { name: "核对固定事实", exact: true })
      .click();
    await expect(
      restored.getByRole("heading", {
        name: "最早确认冲突的阶段：N2",
        exact: true,
      }),
    ).toBeVisible({ timeout: 35000 });
    expect(errors).toEqual([]);
  });

  test(`incomplete stages and premise changes invalidate old diagnosis at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto("/");
    const complete = fixture(false);
    const incomplete = commitStandardEntry(complete, "5 dead @N2", "public");
    await importGame(page, incomplete);
    let panel = await records(page);
    await panel
      .getByRole("button", { name: "核对固定事实", exact: true })
      .click();
    await expect(panel).toContainText("请先补齐或核对阶段记录", {
      timeout: 10000,
    });
    await expect(panel).toContainText("N2死亡记录尚未确认完整");
    await close(page);
    await importGame(page, complete);
    panel = await records(page);
    await panel
      .getByRole("button", { name: "核对固定事实", exact: true })
      .click();
    await expect(panel).toContainText("固定背景已有兼容解释", {
      timeout: 35000,
    });
    await panel.getByRole("checkbox", { name: /保留当前分支/ }).uncheck();
    await expect(panel.getByLabel("阶段核对结果")).toHaveCount(0);
    await close(page);
    await page.getByRole("button", { name: "一键分析", exact: true }).click();
    await expect(
      page.getByRole("region", { name: "声称分析结果", exact: true }),
    ).toContainText("已录声称可以同时成立", { timeout: 35000 });
  });
}

test("one-click background conflicts offer the same phase diagnosis", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.goto("/");
  await importGame(page, fixture());
  await page.getByRole("button", { name: "一键分析", exact: true }).click();
  const result = page.getByRole("region", {
    name: "声称分析结果",
    exact: true,
  });
  await expect(result).toContainText("对局事件或手动前提有冲突", {
    timeout: 35000,
  });
  const panel = result.getByRole("region", {
    name: "固定事实阶段核对",
    exact: true,
  });
  await panel
    .getByRole("button", { name: "核对固定事实", exact: true })
    .click();
  await expect(panel).toContainText("最早确认冲突的阶段：N2", {
    timeout: 35000,
  });
});

test("old branches do not reveal report labels from future revisions in diagnosis", async ({
  page,
}) => {
  await page.goto("/");
  let workspace = commitStandardEntry(
    createStandardWorkspace(7),
    "close deaths @N1",
    "public",
  );
  workspace = createStandardBranch(workspace, "旧修订来源隔离");
  const oldId = workspace.activeBranchId;
  workspace = { ...workspace, activeBranchId: workspace.branches[0].id };
  workspace = commitStandardEntry(workspace, "1 empath 2 @N2");
  workspace = addStandardHypothesis(workspace, {
    kind: "report_accurate",
    eventId: workspace.events.at(-1)!.id,
  });
  const premiseId = workspace.hypotheses.at(-1)!.id;
  workspace = {
    ...workspace,
    activeBranchId: oldId,
    branches: workspace.branches.map((b) =>
      b.id === oldId ? { ...b, assumptionIds: [premiseId] } : b,
    ),
  };
  await importGame(page, workspace);
  const panel = await records(page);
  await panel
    .getByRole("button", { name: "核对固定事实", exact: true })
    .click();
  await expect(panel).toContainText("请先补齐或核对阶段记录");
  await panel.getByText("本次保留的手动前提 · 1 项", { exact: true }).click();
  await expect(panel).toContainText("来源不可见");
  await expect(panel).not.toContainText("2名邪恶");
});
