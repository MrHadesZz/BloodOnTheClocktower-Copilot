import { test, expect, type Page } from "@playwright/test";
import {
  createStandardWorkspace,
  addStandardHypothesis,
  toggleStandardHypothesis,
  commitStandardDrafts,
  type StandardWorkspace,
} from "../src/core/standardWorkspace";
import type { Role } from "../src/core/model";
import { benchmarkFixtures } from "../benchmarks/v1-fixtures";

async function importJson(page: Page, w: StandardWorkspace) {
  const file = {
    name: "v1-fixture.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(w)),
  };
  if ((page.viewportSize()?.width ?? 1440) <= 600) {
    const menu = page.locator(".standard-mobile-actions");
    if ((await menu.getAttribute("open")) === null)
      await page.getByLabel("标准对局菜单").click();
    await menu.locator('input[type="file"]').setInputFiles(file);
  } else {
    await page
      .getByRole("navigation", { name: "标准对局操作" })
      .locator('input[type="file"]')
      .setInputFiles(file);
  }
}
async function importWorkspace(page: Page, w: StandardWorkspace) {
  await page.goto("/");
  await expect(page).toHaveTitle(/钟楼/);
  await expect(
    page.getByRole("button", { name: "高级推理", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "高级推理", exact: true }).click();
  await importJson(page, w);
  await expect(page.locator(".session strong")).toHaveText(w.title);
  await expect(page.locator(".save-status")).toContainText("本地已保存");
}
function zeroFixture(poisoned: boolean) {
  const roles: Role[] = [
    "Librarian",
    "Chef",
    "Monk",
    "Empath",
    "Slayer",
    "Recluse",
    "Poisoner",
    "Imp",
  ];
  let w = createStandardWorkspace(8);
  const adopt = (draft: Parameters<typeof addStandardHypothesis>[1]) => {
    w = addStandardHypothesis(w, draft);
    w = toggleStandardHypothesis(w, w.hypotheses.at(-1)!.id);
  };
  roles.forEach((role, index) =>
    adopt({ kind: "actual_role", seat: index + 1, role }),
  );
  const text = "1号首夜图书管理员报零外来者";
  w = commitStandardDrafts(
    w,
    text,
    [
      {
        occurredAt: { phase: "night", cycle: 1 },
        sourceSpan: [0, text.length],
        label: text,
        payload: {
          kind: "claim",
          speaker: 1,
          claimKind: "ability_report",
          role: "Librarian",
          value: 0,
        },
      },
    ],
    "public",
  );
  for (const kind of ["report_accurate", "ability_active"] as const)
    adopt({ kind, eventId: w.events.at(-1)!.id });
  if (poisoned)
    adopt({ kind: "night_one_poison", poisonerSeat: 7, targetSeat: 6 });
  return {
    ...w,
    title: poisoned ? "V1 中毒隐士对照" : "V1 零外来者注册对照",
    query: { seat: 8, role: "Imp" as const, stage: "initial" as const },
  };
}
for (const width of [1440, 390]) {
  test(`Librarian zero keeps healthy Recluse and rejects poisoned registration at ${width}px`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await importWorkspace(page, zeroFixture(false));
    await page
      .getByRole("button", { name: "运行标准查询", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("必然成立", {
      timeout: 20000,
    });
    await page.getByText("支持命题的见证", { exact: true }).click();
    await expect(
      page.getByText("图书管理员本次零外来者信息：6号注册为投毒者", {
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByText("图书管理员本次零外来者信息：6号注册为投毒者", { exact: true })
      .scrollIntoViewIfNeeded();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const directory = process.env.V1_SCREENSHOT_DIR;
    if (directory)
      await page.screenshot({
        path: `${directory}/v1-zero-${width}.png`,
        fullPage: false,
      });
    // Reload restores the workspace and its premises; answers are intentionally regenerated.
    await page.reload();
    await page
      .getByRole("button", { name: "运行标准查询", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("必然成立", {
      timeout: 20000,
    });
    const poisoned = zeroFixture(true);
    await importJson(page, poisoned);
    await expect(page.locator(".session strong")).toHaveText(poisoned.title);
    await page
      .getByRole("button", { name: "运行标准查询", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("前提互相冲突", {
      timeout: 20000,
    });
    expect(errors).toEqual([]);
  });
}
for (const playerCount of [10, 12, 15]) {
  test(`N3 dense ${playerCount}-player workspace restores and queries offline`, async ({
    page,
    context,
  }) => {
    test.skip(!process.env.PLAYWRIGHT_OFFLINE, "Requires production build");
    test.setTimeout(90000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    const fixture = benchmarkFixtures().find(
      (f) =>
        f.playerCount === playerCount &&
        f.density === "dense" &&
        f.nights === 3,
    )!;
    await importWorkspace(page, fixture.workspace);
    await page
      .getByRole("button", { name: "运行标准查询", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText(/可能|必然|未知/, {
      timeout: 20000,
    });
    const before = await page
      .getByRole("status")
      .locator(":scope > strong")
      .innerText();
    await page
      .getByRole("navigation", { name: "标准对局操作" })
      .getByRole("button", { name: "返回魔典", exact: true })
      .click();
    await page.getByRole("button", { name: "一键分析", exact: true }).click();
    await page.getByRole("button", { name: "取消分析", exact: true }).click();
    await expect(page.getByRole("alert")).toContainText("已取消分析");
    await page.getByRole("button", { name: "关闭面板", exact: true }).click();
    await page.getByRole("button", { name: "高级推理", exact: true }).click();
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await page.waitForFunction(() =>
      Boolean(navigator.serviceWorker.controller),
    );
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator(".session strong")).toHaveText(
      fixture.workspace.title,
    );
    await expect(page.getByLabel("标准查询座位")).toHaveValue(
      String(playerCount),
    );
    await page
      .getByRole("navigation", { name: "标准对局操作" })
      .getByRole("button", { name: "返回魔典", exact: true })
      .click();
    await expect(page.getByLabel("当前天数")).toHaveValue("3");
    await page.getByRole("button", { name: "高级推理", exact: true }).click();
    await page
      .getByRole("button", { name: "运行标准查询", exact: true })
      .click();
    await expect(
      page.getByRole("status").locator(":scope > strong"),
    ).toHaveText(before, { timeout: 20000 });
    expect(errors).toEqual([]);
  });
}
