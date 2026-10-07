import { test, expect } from "@playwright/test";
import { createFixture } from "../src/core/workspace";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "高级推理" }).click();
  await page.getByRole("button", { name: "八人示例", exact: true }).click();
});

test("invalid vote is recoverable and self-nomination remains usable", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("/");
  await expect(page.getByText("钟楼推理台").first()).toBeVisible();

  const entry = page.getByRole("textbox", { name: "快速记录" });
  await entry.fill("vote 4 = 1,2 @D1");
  await page.getByRole("button", { name: "预览录入" }).click();
  await page.getByRole("button", { name: "确认录入" }).click();
  await expect(
    page.getByText(
      "投票必须关联同一天唯一一条已记录的对应提名；请先录入提名。",
    ),
  ).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();

  await entry.fill("4 nom 4 @D1");
  await page.getByRole("button", { name: "预览录入" }).click();
  await page.getByRole("button", { name: "确认录入" }).click();
  await expect(
    page.getByRole("button", { name: /4号提名4号 r19/ }),
  ).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("damaged import is rejected without replacing the workspace", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("/");
  const damaged = createFixture();
  delete (damaged.branches[1] as Partial<(typeof damaged.branches)[number]>)
    .assumptions;
  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles({
      name: "damaged.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(damaged)),
    });
  await expect(page.getByRole("alert")).toContainText("分支");
  await expect(
    page.getByRole("button", { name: /4号提名5号 r9/ }),
  ).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("recorded N2 death excludes the D1 executed Imp", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("/");
  await page.getByLabel("当前分支").selectOption("branch-h0");
  await expect(page.getByText(/H0 下精确 18 种初始真实角色分配/)).toBeVisible();
  await page.getByLabel("查询座位").selectOption("5");
  await page.getByRole("button", { name: "运行推理" }).click();
  await expect(
    page.getByRole("heading", {
      name: /5号的真实角色是小恶魔，在本分支下不可能/,
    }),
  ).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("standard workspace persists a sourced first-night query", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("/");
  await page.getByRole("button", { name: "标准对局" }).click();
  await expect(
    page.getByRole("heading", { name: "标准对局推理" }),
  ).toBeVisible();
  await page.getByLabel("新对局人数").selectOption("10");
  await page.getByLabel("新对局视角座位").selectOption("3");
  await page.getByRole("button", { name: "新建标准对局" }).click();
  await expect(page.locator(".standard-perspective")).toHaveText(
    "10 人 · 本地 3 号视角",
  );

  const input = page.getByRole("textbox", { name: "快速记录" });
  await input.fill("3 emp 2 @N1");
  await page.getByRole("button", { name: "预览录入" }).click();
  await page.getByRole("button", { name: "确认录入" }).click();
  await expect(page.getByText("3号报告2名邪恶邻居").first()).toBeVisible();
  await page.getByRole("checkbox", { name: "采纳准确转述" }).check();
  await page.getByRole("checkbox", { name: "能力有效" }).check();
  await page.getByLabel("标准查询座位").selectOption("3");
  await page.getByLabel("标准查询角色").selectOption("Empath");
  await page.getByRole("button", { name: "运行标准查询" }).click();
  await expect(page.getByRole("status")).toContainText("必然成立", {
    timeout: 15_000,
  });
  await page.getByText("查看规则、修订与来源").click();
  await expect(
    page.getByText(/规则版本：tb-standard-setup-first-night-v4/),
  ).toBeVisible();
  await expect(page.getByText(/对局修订：2/)).toBeVisible();
  await expect(page.getByText(/报告来源事件：/)).toBeVisible();
  await page.getByText("支持命题的见证").click();
  await expect(
    page.locator(".standard-witness-grid").getByText("共情者").first(),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator(".standard-perspective")).toHaveText(
    "10 人 · 本地 3 号视角",
  );
  await expect(page.getByText("3号报告2名邪恶邻居").first()).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("standard workspace remains reachable on a narrow viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByLabel("工作区菜单").click();
  await page.getByRole("button", { name: "标准对局" }).click();
  await expect(
    page.getByRole("heading", { name: "标准对局推理" }),
  ).toBeVisible();
  await expect(page.getByRole("textbox", { name: "快速记录" })).toBeVisible();
  await page.getByLabel("标准对局菜单").click();
  await expect(page.getByRole("button", { name: "公开导出" })).toBeVisible();
});

test("standard public export omits private source text", async ({ page }) => {
  const { readFile } = await import("node:fs/promises");
  await page.goto("/");
  await page.getByRole("button", { name: "标准对局" }).click();
  const input = page.getByRole("textbox", { name: "快速记录" });
  await input.fill("1 inv 2/3 baron @N1");
  await page.getByRole("button", { name: "预览录入" }).click();
  await page.getByRole("button", { name: "确认录入" }).click();
  await page.getByText("可见范围").locator("select").selectOption("public");
  await input.fill("4 nom 4 @D1");
  await page.getByRole("button", { name: "预览录入" }).click();
  await page.getByRole("button", { name: "确认录入" }).click();

  const publicDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "公开导出" }).click();
  const publicFile = await publicDownload;
  const publicText = await readFile((await publicFile.path())!, "utf8");
  expect(publicText).toContain("4 nom 4 @D1");
  expect(publicText).not.toContain("1 inv 2/3 baron @N1");
  expect(publicText).not.toContain("hypotheses");

  const privateDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "私密全量导出" }).click();
  const privateFile = await privateDownload;
  const privateText = await readFile((await privateFile.path())!, "utf8");
  expect(privateText).toContain("1 inv 2/3 baron @N1");
});

test("seen token remains separate from actual Drunk identity", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "标准对局" }).click();
  await page.getByLabel("所见角色token").selectOption("Investigator");
  await page.getByRole("button", { name: "采纳所见 token" }).click();
  await page.getByLabel("标准查询角色").selectOption("Drunk");
  await page.getByRole("button", { name: "运行标准查询" }).click();
  await expect(page.getByRole("status")).toContainText("可能，但非必然", {
    timeout: 15_000,
  });
  await expect(page.getByRole("status")).toContainText("酒鬼（所见调查员）");
});

test("standard workspace queries explicitly closed day observations", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("/");
  await page.getByRole("button", { name: "标准对局" }).click();
  await page.getByLabel("新对局人数").selectOption("7");
  await page.getByRole("button", { name: "新建标准对局" }).click();
  await page.getByLabel("角色假设座位").selectOption("1");
  await page.getByLabel("假设真实角色").selectOption("Imp");
  await page.getByRole("button", { name: "添加假设" }).click();
  const entry = page.getByRole("textbox", { name: "快速记录" });
  for (const text of ["close actions @D1", "close deaths @D1"]) {
    await entry.fill(text);
    await page.getByRole("button", { name: "预览录入" }).click();
    await page.getByRole("button", { name: "确认录入" }).click();
  }
  await page.getByRole("button", { name: "运行标准查询" }).click();
  await expect(page.getByRole("status")).toContainText("必然成立", {
    timeout: 15_000,
  });
  await expect(page.getByRole("status")).toContainText(
    "封闭日夜事实与可能的隐藏行动",
  );
  await page.getByText("支持命题的见证").click();
  await expect(page.getByText("查看这组可能的隐藏行动")).toBeVisible();
  await page.getByLabel("查询时点").selectOption("current");
  await page.getByRole("button", { name: "运行标准查询" }).click();
  await expect(page.getByRole("status")).toContainText(
    "当前真实角色是小恶魔：必然成立",
    {
      timeout: 15_000,
    },
  );
  expect(pageErrors).toEqual([]);
});
