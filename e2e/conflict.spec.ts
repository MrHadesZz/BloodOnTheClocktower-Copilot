import { test, expect, type Page } from "@playwright/test";
import {
  createStandardWorkspace,
  addStandardHypothesis,
  toggleStandardHypothesis,
} from "../src/core/standardWorkspace";

async function conflictingReports(page: Page) {
  await page.goto("/");
  for (const [seat, count] of [
    [1, 0],
    [2, 2],
  ]) {
    await page
      .getByRole("button", { name: `${seat}号选择角色`, exact: true })
      .click();
    await page.getByRole("button", { name: "记录信息", exact: true }).click();
    await page.getByLabel("报告能力").selectOption("Empath");
    await page.getByLabel("收到的数字").selectOption(String(count));
    await page.getByRole("button", { name: "保存报告" }).click();
    await page.getByLabel("采纳准确转述").last().check();
    await page.getByLabel("能力有效", { exact: true }).last().check();
    if (count === 0)
      await page.getByRole("button", { name: "关闭面板" }).click();
  }
  await page.getByRole("button", { name: "运行推理", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "魔典推理结果" }),
  ).toContainText("前提互相冲突", { timeout: 20_000 });
}

for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
]) {
  test(`conflict sources, verified minimality and isolated correction at ${viewport.width}px`, async ({
    page,
    context,
  }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await conflictingReports(page);
    if (process.env.PLAYWRIGHT_OFFLINE === "1") {
      await page.evaluate(async () => {
        await navigator.serviceWorker.ready;
      });
      await context.setOffline(true);
      await page.reload();
      await page.getByRole("button", { name: "推理", exact: true }).click();
      await page.getByRole("button", { name: "运行推理", exact: true }).click();
      await expect(
        page.getByRole("region", { name: "魔典推理结果" }),
      ).toContainText("前提互相冲突", { timeout: 20_000 });
    }
    await expect(page).toHaveTitle(/钟楼/);
    const originalBranch = await page.getByLabel("推理分支").inputValue();
    const panel = page.getByRole("region", { name: "冲突定位", exact: true });
    await panel.getByRole("button", { name: "定位冲突", exact: true }).click();
    await expect(panel).toContainText("已验证最小前提冲突集", {
      timeout: 30_000,
    });
    await expect(panel.locator(".gr-conflict-list > li")).toHaveCount(2);
    await panel.getByText("回看原记录", { exact: true }).first().click();
    await expect(panel.locator("blockquote").first()).toContainText(
      "1号报告0名邪恶邻居",
    );
    await panel
      .getByText("仅取消此项后的见证（其余冲突前提保留）", { exact: true })
      .first()
      .click();
    await expect(panel).toContainText("初始真实角色分配");
    await panel.getByRole("status").scrollIntoViewIfNeeded();
    await page.screenshot({
      path: `/tmp/clocktower-conflict-${viewport.width}.png`,
    });
    expect(
      await page
        .locator("dialog")
        .evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
    await panel
      .getByRole("button", { name: "在新分支试取消此前提", exact: true })
      .first()
      .click();
    const comparison = page.getByRole("region", { name: "纠错分支对照" });
    await expect(comparison).toContainText("原分支「基础记录」保留不变");
    await expect(comparison).toContainText("必然成立", { timeout: 20_000 });
    const trialBranch = await page.getByLabel("推理分支").inputValue();
    expect(trialBranch).not.toBe(originalBranch);
    await expect(
      page.getByLabel("能力有效", { exact: true }).first(),
    ).not.toBeChecked();
    await expect(page.getByLabel("采纳准确转述").last()).toBeChecked();
    await comparison.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: `/tmp/clocktower-correction-${viewport.width}.png`,
    });
    await comparison.getByRole("button", { name: "返回原分支" }).click();
    await expect(page.getByLabel("推理分支")).toHaveValue(originalBranch);
    await expect(
      page.getByLabel("能力有效", { exact: true }).first(),
    ).toBeChecked();
    await page.getByRole("button", { name: "运行推理", exact: true }).click();
    await expect(
      page.getByRole("region", { name: "魔典推理结果" }),
    ).toContainText("前提互相冲突", { timeout: 20_000 });
    await page.getByRole("button", { name: "关闭面板" }).click();
    await expect(page.getByText("本地已保存", { exact: true })).toBeVisible();
    await page.reload();
    await page.getByRole("button", { name: "推理", exact: true }).click();
    await expect(page.getByLabel("推理分支")).toHaveValue(originalBranch);
    await page.getByLabel("推理分支").selectOption(trialBranch);
    await expect(
      page.getByLabel("能力有效", { exact: true }).first(),
    ).not.toBeChecked();
    await expect(page.getByLabel("采纳准确转述").last()).toBeChecked();
    expect(await page.locator("vite-error-overlay").count()).toBe(0);
    expect(errors).toEqual([]);
  });
}

test("cancel and changed premises terminate localization without displaying a stale explanation", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const NativeWorker = window.Worker;
    window.Worker = class extends NativeWorker {
      postMessage(message: unknown, options?: StructuredSerializeOptions) {
        if ((message as { kind?: string }).kind === "conflict_query") {
          setTimeout(() => super.postMessage(message, options), 1500);
        } else super.postMessage(message, options);
      }
    };
  });
  await conflictingReports(page);
  await page.getByRole("button", { name: "定位冲突", exact: true }).click();
  await page.getByRole("button", { name: "取消定位", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "冲突定位", exact: true }),
  ).toContainText("已取消定位");
  await page.getByRole("button", { name: "定位冲突", exact: true }).click();
  await page.getByRole("button", { name: "关闭面板" }).click();
  await page.getByRole("button", { name: "推理", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "冲突定位", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "运行推理", exact: true }).click();
  await page.getByRole("button", { name: "定位冲突", exact: true }).click();
  await page.getByLabel("能力有效", { exact: true }).first().uncheck();
  await expect(
    page.getByRole("region", { name: "冲突定位", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "运行推理", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "魔典推理结果" }),
  ).toContainText("必然成立", { timeout: 20_000 });
  await page.waitForTimeout(2000);
  await expect(
    page.getByText("已验证最小前提冲突集", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("region", { name: "冲突定位", exact: true }),
  ).toHaveCount(0);
});

test("limited localization stays partial until deletion witnesses are fully verified", async ({
  page,
}) => {
  let workspace = createStandardWorkspace(7);
  for (const [seat, role] of [
    [1, "Chef"],
    [1, "Empath"],
    [2, "Monk"],
    [3, "Soldier"],
  ] as const) {
    workspace = addStandardHypothesis(workspace, {
      kind: "actual_role",
      seat,
      role,
    });
    workspace = toggleStandardHypothesis(
      workspace,
      workspace.hypotheses.at(-1)!.id,
    );
  }
  await page.goto("/");
  await page.getByRole("button", { name: "高级推理" }).click();
  await page
    .getByRole("navigation", { name: "标准对局操作" })
    .locator('input[type="file"]')
    .setInputFiles({
      name: "conflict.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(workspace)),
    });
  await page.getByRole("button", { name: /返回魔典/ }).click();
  await page.getByRole("button", { name: "推理", exact: true }).click();
  await page.getByRole("button", { name: "运行推理", exact: true }).click();
  const panel = page.getByRole("region", { name: "冲突定位", exact: true });
  await expect(panel).toBeVisible({ timeout: 20_000 });
  await page.getByLabel("定位预算").selectOption("quick");
  await panel.getByRole("button", { name: "定位冲突", exact: true }).click();
  await expect(panel).toContainText("已确认冲突，最小性未验证完成", {
    timeout: 20_000,
  });
  await expect(panel).toContainText("已达到检查次数上限");
  await expect(
    panel.getByText("已验证最小前提冲突集", { exact: true }),
  ).toHaveCount(0);
  await page.getByLabel("定位预算").selectOption("standard");
  await panel
    .getByRole("button", { name: "重新定位冲突", exact: true })
    .click();
  await expect(panel).toContainText("已验证最小前提冲突集", {
    timeout: 30_000,
  });
  await expect(panel.locator(".gr-conflict-list > li")).toHaveCount(2);
});

test("mixed report search preserves confirmed conflict when the budget ends", async ({
  page,
}) => {
  await conflictingReports(page);
  await page.getByRole("button", { name: "关闭面板" }).click();
  await page.getByRole("button", { name: "4号选择角色", exact: true }).click();
  await page.getByRole("button", { name: "记录信息", exact: true }).click();
  await page.getByLabel("报告能力").selectOption("Chef");
  await page.getByRole("button", { name: "保存报告" }).click();
  await page.getByLabel("采纳准确转述").last().check();
  await page.getByLabel("能力有效", { exact: true }).last().check();
  await page.getByRole("button", { name: "运行推理", exact: true }).click();
  const panel = page.getByRole("region", { name: "冲突定位", exact: true });
  await expect(panel).toBeVisible({ timeout: 20_000 });
  await page.getByLabel("定位预算").selectOption("quick");
  await panel.getByRole("button", { name: "定位冲突", exact: true }).click();
  await expect(panel).toContainText("已确认冲突，最小性未验证完成", {
    timeout: 15_000,
  });
  expect(await panel.locator(".gr-conflict-list > li").count()).toBeGreaterThan(
    0,
  );
  await expect(
    panel.getByText("已验证最小前提冲突集", { exact: true }),
  ).toHaveCount(0);
  await expect(
    panel.getByRole("button", { name: "重新定位冲突" }),
  ).toBeEnabled();
});
