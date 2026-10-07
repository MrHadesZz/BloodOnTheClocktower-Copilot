import { test, expect, type Page } from "@playwright/test";
import {
  createStandardWorkspace,
  addStandardHypothesis,
  toggleStandardHypothesis,
  commitStandardDrafts,
  type StandardWorkspace,
} from "../src/core/standardWorkspace";
import { closeStandardPhase } from "../src/core/standardHistory";
import type { Role, EventPayload, GameTime } from "../src/core/model";

function fixture(poison = 10, nextNight = false): StandardWorkspace {
  const roles: Role[] = [
    "Monk",
    "Soldier",
    "Mayor",
    "Ravenkeeper",
    "Undertaker",
    "Virgin",
    "Slayer",
    "Recluse",
    "Butler",
    "Poisoner",
    "Scarlet Woman",
    "Imp",
  ];
  let workspace = createStandardWorkspace(12);
  const adopt = (draft: Parameters<typeof addStandardHypothesis>[1]) => {
    workspace = addStandardHypothesis(workspace, draft);
    workspace = toggleStandardHypothesis(
      workspace,
      workspace.hypotheses.at(-1)!.id,
    );
  };
  const event = (time: GameTime, payload: EventPayload) => {
    const text = "隐士与红唇女郎验收记录";
    workspace = commitStandardDrafts(
      workspace,
      text,
      [
        {
          payload,
          occurredAt: time,
          label: text,
          sourceSpan: [0, text.length],
        },
      ],
      "public",
    );
  };
  roles.forEach((role, index) =>
    adopt({ kind: "actual_role", seat: index + 1, role }),
  );
  adopt({ kind: "night_one_poison", poisonerSeat: 10, targetSeat: poison });
  workspace = closeStandardPhase(workspace, { phase: "night", cycle: 1 }, true);
  const day = { phase: "day", cycle: 1 } as const;
  for (const payload of [
    { kind: "nomination", nominator: 1, nominee: 8 },
    { kind: "vote", nominee: 8, voters: [1, 2, 3, 4, 5, 6] },
    { kind: "execution", seat: 8 },
    { kind: "death", seat: 8 },
  ] satisfies EventPayload[])
    event(day, payload);
  workspace = closeStandardPhase(workspace, day, true);
  if (nextNight) {
    adopt({ kind: "role_at_phase", seat: 11, role: "Imp", occurredAt: day });
    workspace = closeStandardPhase(
      workspace,
      { phase: "night", cycle: 2 },
      true,
    );
  }
  return {
    ...workspace,
    title: "隐士死亡与红唇女郎继任",
    recordingTime: nextNight ? { phase: "night", cycle: 2 } : day,
    query: { seat: 11, role: "Imp", stage: "current" },
  };
}
async function importJson(page: Page, workspace: StandardWorkspace) {
  const mobile = (page.viewportSize()?.width ?? 1440) <= 600;
  const actions = mobile
    ? page.locator(".standard-mobile-actions")
    : page.getByRole("navigation", { name: "标准对局操作" });
  if (mobile && (await actions.getAttribute("open")) === null)
    await page.getByLabel("标准对局菜单").click();
  await actions.locator('input[type="file"]').setInputFiles({
    name: "recluse-scarlet.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(workspace)),
  });
  await expect(page.locator(".session strong")).toHaveText(workspace.title);
  await expect(page.locator(".save-status")).toContainText("本地已保存");
}
async function query(page: Page, classification: string) {
  await page.getByRole("button", { name: "运行标准查询", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(classification, {
    timeout: 20000,
  });
}
for (const width of [1440, 390]) {
  test(`Recluse inheritance evidence, independent alternatives and offline restore at ${width}px`, async ({
    page,
    context,
  }) => {
    test.setTimeout(90000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto("/");
    await expect(page).toHaveTitle("钟楼推理台");
    await expect(page.locator("vite-error-overlay")).toHaveCount(0);
    await page.getByRole("button", { name: "高级推理", exact: true }).click();
    await importJson(page, fixture());
    await query(page, "可能，但非必然");
    await page.getByText("支持命题的见证", { exact: true }).click();
    await expect(
      page.getByText(/11号 红唇女郎 → 小恶魔（邪恶）/),
    ).toBeVisible();
    const demons = page.getByText("当前存活的小恶魔：11号、12号。", {
      exact: true,
    });
    await expect(demons).toBeVisible();
    const receipt = page.getByText("D1 11号红唇女郎继任判定：8号注册为小恶魔", {
      exact: true,
    });
    await expect(receipt).toBeVisible();
    await receipt.scrollIntoViewIfNeeded();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (process.env.RECLUSE_SCARLET_SCREENSHOT_DIR)
      await page.screenshot({
        path: `${process.env.RECLUSE_SCARLET_SCREENSHOT_DIR}/recluse-scarlet-${width}.png`,
        fullPage: false,
      });
    await page.getByText("推翻命题的反例", { exact: true }).click();
    const counterexample = page
      .locator(".standard-witness")
      .filter({ has: page.getByText("推翻命题的反例", { exact: true }) });
    await expect(counterexample).toContainText("红唇女郎");
    await expect(
      counterexample.getByText("当前存活的小恶魔：11号、12号。", {
        exact: true,
      }),
    ).toHaveCount(0);
    if (process.env.PLAYWRIGHT_OFFLINE) {
      await page.evaluate(async () => {
        await navigator.serviceWorker.ready;
      });
      await page.waitForFunction(() =>
        Boolean(navigator.serviceWorker.controller),
      );
      await context.setOffline(true);
    }
    await page.reload();
    await expect(page.locator(".session strong")).toHaveText(
      "隐士死亡与红唇女郎继任",
    );
    await query(page, "可能，但非必然");
    await page.getByText("支持命题的见证", { exact: true }).click();
    await expect(
      page.getByText("当前存活的小恶魔：11号、12号。", { exact: true }),
    ).toBeVisible();
    await importJson(page, fixture(8));
    await query(page, "不可能");
    await importJson(page, fixture(10, true));
    await query(page, "必然成立");
    await expect(page.locator("vite-error-overlay")).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
}
