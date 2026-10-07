import { test, expect } from "@playwright/test";

for (const width of [1440, 390]) {
  test(`one-click claims, conflict explanations and offline recovery at ${width}px`, async ({
    page,
    context,
  }, testInfo) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto("/");
    await expect(page).toHaveTitle(/钟楼/);
    await page.getByRole("button", { name: "一键分析", exact: true }).click();
    await expect(
      page.getByText("还没有声称或信息。", { exact: false }),
    ).toBeVisible();
    await page.getByRole("button", { name: "关闭面板" }).click();
    for (const seat of [1, 2]) {
      await page
        .getByRole("button", { name: `${seat}号选择角色`, exact: true })
        .click();
      await page
        .getByRole("button", { name: "选择共情者", exact: true })
        .click();
      await page
        .getByRole("button", { name: `${seat}号声称共情者`, exact: true })
        .click();
      await page.getByRole("button", { name: "记录信息", exact: true }).click();
      await expect(page.getByLabel("报告能力")).toHaveValue("Empath");
      await page.getByLabel("收到的数字").selectOption("0");
      await page.getByRole("button", { name: "保存报告" }).click();
      await expect(page.getByLabel("采纳准确转述").last()).not.toBeChecked();
      await page.getByRole("button", { name: "关闭面板" }).click();
    }
    await page.getByRole("button", { name: "一键分析", exact: true }).click();
    const result = page.getByRole("region", { name: "声称分析结果" });
    await expect(
      result.getByRole("heading", { name: "发现声称或信息冲突" }),
    ).toBeVisible({ timeout: 40000 });
    await expect(result).toContainText("需要一起复核：1号、2号");
    await expect(result).toContainText("所以他们不能都是真实共情者");
    await expect(result).toContainText("1号：放宽后可解释全部信息");
    await expect(result).toContainText("2号：放宽后可解释全部信息");
    await expect(result).toContainText("1号报告0名邪恶邻居");
    await result.getByText("查看逐个玩家的检查", { exact: true }).click();
    await result.getByText("查看放宽1号后的可能解释", { exact: true }).click();
    await expect(result).toContainText("初始真实角色分配");
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
    await page
      .getByRole("heading", { name: "声称与信息分析" })
      .scrollIntoViewIfNeeded();
    await page.screenshot({
      path: testInfo.outputPath(`claim-analysis-${width}.png`),
    });
    await page.getByRole("button", { name: "关闭面板" }).click();
    await page.getByRole("button", { name: "推理", exact: true }).click();
    for (const label of ["采纳准确转述", "能力有效"]) {
      for (const checkbox of await page
        .getByLabel(label, { exact: true })
        .all())
        await expect(checkbox).not.toBeChecked();
    }
    await page.getByRole("button", { name: "关闭面板" }).click();
    if (process.env.PLAYWRIGHT_OFFLINE === "1") {
      await page.evaluate(async () => {
        await navigator.serviceWorker.ready;
      });
      await context.setOffline(true);
    }
    await page.reload();
    await page.getByRole("button", { name: "一键分析", exact: true }).click();
    await expect(result).toContainText("发现声称或信息冲突", {
      timeout: 40000,
    });
    await page.getByRole("button", { name: "关闭面板" }).click();
    await page
      .getByRole("button", { name: "2号声称共情者", exact: true })
      .click();
    await page.getByRole("button", { name: "清除角色", exact: true }).click();
    await page.getByRole("button", { name: "记录", exact: true }).click();
    const report = page
      .locator(".gr-records article")
      .filter({ hasText: "2号报告" });
    await report
      .getByRole("button", { name: "撤销2号报告0名邪恶邻居" })
      .click();
    await page.getByRole("button", { name: "关闭面板" }).click();
    await page.getByRole("button", { name: "一键分析", exact: true }).click();
    await expect(result).toContainText("已录声称可以同时成立", {
      timeout: 40000,
    });
    await expect(result).toContainText("这不能证明所有人诚实");
    await expect(result).not.toContainText("需要一起复核");
    expect(await page.locator("vite-error-overlay").count()).toBe(0);
    expect(errors).toEqual([]);
  });

  test(`one-click later report gives an unknown result at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await page
      .getByRole("button", { name: "3号选择角色", exact: true })
      .click();
    await page.getByRole("button", { name: "记录信息", exact: true }).click();
    await page.getByLabel("记录天数").selectOption("2");
    await page.getByRole("button", { name: "保存报告" }).click();
    await page.getByRole("button", { name: "关闭面板" }).click();
    await page.getByRole("button", { name: "一键分析", exact: true }).click();
    const result = page.getByRole("region", { name: "声称分析结果" });
    await expect(result).toContainText("结果未知", { timeout: 40000 });
    await expect(result).toContainText("跨夜能力报告需要封闭观察查询");
    await expect(result).not.toContainText("需要一起复核");
  });
}
