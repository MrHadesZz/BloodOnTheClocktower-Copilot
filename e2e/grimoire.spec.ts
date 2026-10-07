import { test, expect, type Page } from "@playwright/test";
import {
  addStandardHypothesis,
  commitStandardEntry,
  createStandardWorkspace,
  toggleStandardHypothesis,
  type StandardWorkspace,
} from "../src/core/standardWorkspace";

async function importWorkspace(page: Page, workspace: StandardWorkspace) {
  await page.goto("/");
  await page.getByRole("button", { name: "高级推理" }).click();
  const actions = page.getByRole("navigation", { name: "标准对局操作" });
  await actions.locator('input[type="file"]').setInputFiles({
    name: "regression-workspace.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(workspace)),
  });
  await expect(page.locator(".session strong")).toHaveText(workspace.title);
  await expect(page.locator(".save-status")).toContainText("本地已保存");
  await actions.getByRole("button", { name: "返回魔典", exact: true }).click();
  await expect(page.getByRole("heading", { name: "我的魔典" })).toBeVisible();
}

for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
]) {
  test(`grimoire report, explicit premises, evidence and recovery at ${viewport.width}px`, async ({
    page,
    context,
  }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto("/");
    await expect(page).toHaveTitle(/钟楼/);
    await expect(page.getByRole("heading", { name: "我的魔典" })).toBeVisible();
    await page
      .getByRole("button", { name: "3号选择角色", exact: true })
      .click();
    await page.getByRole("button", { name: "记录信息", exact: true }).click();
    await page.getByLabel("报告能力").selectOption("Empath");
    await page.getByLabel("收到的数字").selectOption("2");
    await page.getByRole("button", { name: "保存报告" }).click();
    await expect(
      page.getByRole("heading", { name: "魔典条件推理" }),
    ).toBeVisible();
    await expect(page.getByLabel("魔典查询座位")).toHaveValue("3");
    await expect(page.getByLabel("魔典查询角色")).toHaveValue("Empath");
    await expect(page.getByLabel("采纳准确转述")).not.toBeChecked();
    await expect(
      page.getByLabel("能力有效", { exact: true }),
    ).not.toBeChecked();
    await page.getByRole("button", { name: "运行推理", exact: true }).click();
    const result = page.getByRole("region", { name: "魔典推理结果" });
    await expect(result).toContainText("可能，但非必然", { timeout: 20_000 });
    await page.getByLabel("采纳准确转述").check();
    await expect(result).toHaveCount(0);
    await page.getByLabel("能力有效", { exact: true }).check();
    await page.getByRole("button", { name: "运行推理", exact: true }).click();
    await expect(result).toContainText("必然成立", { timeout: 20_000 });
    await page.getByText("查看依据与来源", { exact: true }).click();
    await expect(result).toContainText("3号报告2名邪恶邻居");
    await expect(result).toContainText("采纳前提：2 项");
    await page.getByText("支持命题的见证", { exact: true }).click();
    await expect(result).toContainText("初始真实角色分配");
    await page
      .getByRole("heading", { name: "魔典条件推理" })
      .scrollIntoViewIfNeeded();
    await page.screenshot({
      path: `/tmp/grimoire-reasoning-${viewport.width}.png`,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      await page
        .locator("dialog")
        .evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
    await page.getByRole("button", { name: "关闭面板" }).click();
    await expect(page.getByText("本地已保存", { exact: true })).toBeVisible();
    if (process.env.PLAYWRIGHT_OFFLINE === "1") {
      await page.evaluate(async () => {
        await navigator.serviceWorker.ready;
      });
      await context.setOffline(true);
    }
    await page.reload();
    await page.getByRole("button", { name: "推理", exact: true }).click();
    await expect(page.getByLabel("采纳准确转述")).toBeChecked();
    await expect(page.getByLabel("能力有效", { exact: true })).toBeChecked();
    await expect(page.getByLabel("魔典查询座位")).toHaveValue("3");
    await page.getByLabel("能力有效", { exact: true }).uncheck();
    await page.getByRole("button", { name: "运行推理", exact: true }).click();
    await expect(result).toContainText("可能，但非必然", { timeout: 20_000 });
    expect(await page.locator("vite-error-overlay").count()).toBe(0);
    await page
      .getByRole("region", { name: "魔典推理结果" })
      .scrollIntoViewIfNeeded();
    await page.screenshot({
      path: `/tmp/grimoire-result-${viewport.width}.png`,
    });
    expect(errors).toEqual([]);
  });

  test(`closed N2 report remains queryable after D2 at ${viewport.width}px`, async ({
    page,
    context,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    let workspace = createStandardWorkspace(7);
    workspace.title = "已封闭 N2 报告回归";
    workspace.query = { seat: 3, role: "Empath", stage: "initial" };
    for (const [seat, role] of [
      [1, "Imp"],
      [2, "Spy"],
      [3, "Empath"],
      [4, "Chef"],
      [5, "Investigator"],
      [6, "Monk"],
      [7, "Mayor"],
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
    for (const line of [
      "close actions @D1",
      "close deaths @D1",
      "4 dead @N2",
      "close deaths @N2",
      "3 emp 1 @N2",
    ]) {
      workspace = commitStandardEntry(workspace, line);
    }
    const eventId = workspace.events.at(-1)!.id;
    for (const kind of ["report_accurate", "ability_active"] as const) {
      workspace = addStandardHypothesis(workspace, { kind, eventId });
      workspace = toggleStandardHypothesis(
        workspace,
        workspace.hypotheses.at(-1)!.id,
      );
    }
    await importWorkspace(page, workspace);
    await page.setViewportSize(viewport);
    await page.getByRole("button", { name: "记录", exact: true }).click();
    await page.getByRole("button", { name: "记录行动或阶段结束" }).click();
    await page.getByLabel("记录天数").selectOption("2");
    await page.getByLabel("记录阶段").selectOption("day");
    await page.getByLabel("事件类型").selectOption("close");
    await page.getByRole("checkbox", { name: /我确认/ }).check();
    await page.getByRole("button", { name: "保存事件" }).click();
    await page.getByRole("button", { name: "关闭面板" }).click();
    await page.getByRole("button", { name: "推理", exact: true }).click();
    await page.getByRole("button", { name: "运行推理", exact: true }).click();
    const result = page.getByRole("region", { name: "魔典推理结果" });
    await expect(result).toContainText("必然成立", { timeout: 20_000 });
    await page.getByLabel("魔典查询时点").selectOption("current");
    await page.getByRole("button", { name: "运行推理", exact: true }).click();
    await expect(result).toContainText("必然成立", { timeout: 20_000 });
    await page.getByRole("button", { name: "关闭面板" }).click();
    await expect(page.getByText("本地已保存", { exact: true })).toBeVisible();
    if (process.env.PLAYWRIGHT_OFFLINE === "1") {
      await page.evaluate(async () => {
        await navigator.serviceWorker.ready;
      });
      await context.setOffline(true);
    }
    await page.reload();
    await page.getByRole("button", { name: "推理", exact: true }).click();
    await expect(page.getByLabel("采纳准确转述")).toBeChecked();
    await expect(page.getByLabel("能力有效", { exact: true })).toBeChecked();
    await page.getByRole("button", { name: "运行推理", exact: true }).click();
    await expect(result).toContainText("必然成立", { timeout: 20_000 });
    await page.getByText("查看依据与来源", { exact: true }).click();
    await expect(result).toContainText("3号报告1名邪恶邻居");
    await expect(page.getByRole("alert")).toHaveCount(0);
    await result.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: `/tmp/grimoire-n2-after-day-${viewport.width}.png`,
    });
    expect(errors).toEqual([]);
  });

  test(`new game confirms premise-only replacement and preserves cancellation at ${viewport.width}px`, async ({
    page,
  }) => {
    let workspace = createStandardWorkspace(8);
    workspace.title = "仅假设工作区回归";
    workspace = addStandardHypothesis(workspace, {
      kind: "actual_role",
      seat: 1,
      role: "Imp",
    });
    workspace = toggleStandardHypothesis(
      workspace,
      workspace.hypotheses.at(-1)!.id,
    );
    await importWorkspace(page, workspace);
    await page.setViewportSize(viewport);
    await page.getByRole("button", { name: "新对局", exact: true }).click();
    const cancelled = page.waitForEvent("dialog", { timeout: 3000 });
    const cancelClick = page
      .getByRole("button", { name: "开始记录", exact: true })
      .click();
    const cancelDialog = await cancelled;
    expect(cancelDialog.type()).toBe("confirm");
    await cancelDialog.dismiss();
    await cancelClick;
    await expect(
      page.getByRole("heading", { name: "开始新对局" }),
    ).toBeVisible();
    await page.reload();
    await page.getByRole("button", { name: "推理", exact: true }).click();
    await expect(page.getByLabel("1号初始真实角色是小恶魔")).toBeChecked();
    await page.getByRole("button", { name: "关闭面板" }).click();
    await page.getByRole("button", { name: "新对局", exact: true }).click();
    const accepted = page.waitForEvent("dialog", { timeout: 3000 });
    const acceptClick = page
      .getByRole("button", { name: "开始记录", exact: true })
      .click();
    const acceptDialog = await accepted;
    expect(acceptDialog.type()).toBe("confirm");
    await acceptDialog.accept();
    await acceptClick;
    await expect(page.getByText("本地已保存", { exact: true })).toBeVisible();
    await page.reload();
    await page.getByRole("button", { name: "推理", exact: true }).click();
    await expect(page.getByLabel("1号初始真实角色是小恶魔")).toHaveCount(0);
    await page.getByRole("button", { name: "关闭面板" }).click();
    let unexpectedConfirmations = 0;
    page.on("dialog", async (dialog) => {
      unexpectedConfirmations++;
      await dialog.dismiss();
    });
    await page.getByRole("button", { name: "新对局", exact: true }).click();
    await page.getByRole("button", { name: "开始记录", exact: true }).click();
    await expect(page.getByRole("heading", { name: "开始新对局" })).toHaveCount(
      0,
    );
    expect(unexpectedConfirmations).toBe(0);
  });
}

test("structured day events require nomination, preserve zero votes and explicit closure", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "记录", exact: true }).click();
  const add = async () =>
    page.getByRole("button", { name: "记录行动或阶段结束" }).click();
  await add();
  await page.getByLabel("事件类型").selectOption("vote");
  await page.getByRole("button", { name: "保存事件" }).click();
  await expect(page.getByRole("alert")).toContainText("投票必须关联");
  await page.getByLabel("事件类型").selectOption("nomination");
  await page.getByRole("button", { name: "保存事件" }).click();
  await expect(page.getByText("1号提名2号", { exact: true })).toBeVisible();
  await add();
  await page.getByLabel("事件类型").selectOption("vote");
  await page.getByRole("button", { name: "保存事件" }).click();
  await expect(page.getByText("提名2号：0票", { exact: true })).toBeVisible();
  await add();
  await page.getByLabel("事件类型").selectOption("close");
  await expect(page.getByRole("button", { name: "保存事件" })).toBeDisabled();
  await page.getByRole("checkbox", { name: /我确认/ }).check();
  await page.getByRole("button", { name: "保存事件" }).click();
  await expect(
    page.getByText("本日行动记录完整", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("本阶段死亡记录完整", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "关闭面板" }).click();
  await page.getByRole("button", { name: "推理", exact: true }).click();
  await page.getByLabel("魔典查询时点").selectOption("current");
  await page.getByRole("button", { name: "运行推理", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "魔典推理结果" }),
  ).toContainText("已封闭日夜与可能的隐藏行动", { timeout: 20_000 });
  await expect(
    page.getByRole("region", { name: "魔典推理结果" }),
  ).toContainText("可能，但非必然");
  await page.getByRole("button", { name: "关闭面板" }).click();
  await page.getByRole("button", { name: "记录", exact: true }).click();
  await page
    .getByRole("button", { name: "撤销本日行动记录完整", exact: true })
    .click();
  await expect(page.getByText("本日行动记录完整", { exact: true })).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "关闭面板" }).click();
  await page.getByRole("button", { name: "推理", exact: true }).click();
  await page.getByRole("button", { name: "运行推理", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(/封闭|完整/);
  await expect(page.getByRole("region", { name: "魔典推理结果" })).toHaveCount(
    0,
  );
});

test("report validation keeps duplicate targets out and undo removes report premises", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "1号选择角色", exact: true }).click();
  await page.getByRole("button", { name: "记录信息", exact: true }).click();
  await page.getByLabel("报告能力").selectOption("Fortune Teller");
  await page.getByLabel("第二个目标").selectOption("2");
  await page.getByRole("button", { name: "保存报告" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "两个目标不能是同一个座位",
  );
  await page.getByLabel("第二个目标").selectOption("3");
  await page.getByRole("button", { name: "保存报告" }).click();
  await page.getByLabel("采纳准确转述").check();
  await page.getByLabel("能力有效", { exact: true }).check();
  await page.getByRole("button", { name: "关闭面板" }).click();
  await page.getByRole("button", { name: "记录", exact: true }).click();
  await page
    .getByRole("button", { name: "撤销1号报告2/3号：是", exact: true })
    .click();
  await page.getByRole("button", { name: "关闭面板" }).click();
  await page.getByRole("button", { name: "推理", exact: true }).click();
  await page.getByRole("button", { name: "运行推理", exact: true }).click();
  // Retracted evidence cannot silently continue constraining the solver.
  await expect(page.getByRole("alert")).toContainText(/撤回|不可见|来源/);
  await expect(page.getByRole("region", { name: "魔典推理结果" })).toHaveCount(
    0,
  );
});
