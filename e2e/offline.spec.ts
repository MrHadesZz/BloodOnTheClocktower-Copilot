import { test, expect } from "@playwright/test";

test("cold query during precache restores private records and Z3 queries offline", async ({
  page,
  context,
}) => {
  test.skip(!process.env.PLAYWRIGHT_OFFLINE, "Run against a production build");
  test.setTimeout(120_000);
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning")
      pageErrors.push(message.text());
  });
  await page.goto("/");
  await page.getByRole("button", { name: "高级推理" }).click();
  await expect(page.getByText("钟楼推理台").first()).toBeVisible();
  const entry = page.getByRole("textbox", { name: "快速记录" });
  await entry.fill("1 inv 2/3 spy @N1");
  await page.getByRole("button", { name: "预览录入" }).click();
  await page.getByRole("button", { name: "确认录入" }).click();
  await expect(page.locator(".save-status")).toContainText("本地已保存");
  // Exercise the first WASM load while the offline installer may still be fetching it.
  await page.getByRole("button", { name: "运行标准查询" }).click();
  await expect(page.getByRole("status")).toContainText("可能", {
    timeout: 20_000,
  });
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(
    () => Boolean(navigator.serviceWorker.controller),
    null,
    { timeout: 60_000 },
  );
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "标准对局推理" }),
  ).toBeVisible();
  await expect(page.getByText("1号报告2/3号中有间谍").first()).toBeVisible();
  expect(await page.evaluate(() => crossOriginIsolated)).toBe(true);
  await page.getByRole("button", { name: "运行标准查询" }).click();
  await expect(page.getByRole("status")).toContainText("可能", {
    timeout: 20_000,
  });
  expect(pageErrors).toEqual([]);
});
