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

function fixture(roles: Role[]) {
  let w = createStandardWorkspace(roles.length);
  const adopt = (draft: Parameters<typeof addStandardHypothesis>[1]) => {
    w = addStandardHypothesis(w, draft);
    w = toggleStandardHypothesis(w, w.hypotheses.at(-1)!.id);
  };
  const event = (time: GameTime, payload: EventPayload) => {
    const text = "机制验收记录";
    w = commitStandardDrafts(
      w,
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
  return {
    adopt,
    event,
    close: (time: GameTime) => {
      w = closeStandardPhase(w, time, true);
    },
    get: () => w,
  };
}
function goodImpFixture(count = 0): StandardWorkspace {
  const f = fixture([
    "Monk",
    "Soldier",
    "Mayor",
    "Fortune Teller",
    "Undertaker",
    "Virgin",
    "Empath",
    "Recluse",
    "Butler",
    "Spy",
    "Scarlet Woman",
    "Imp",
  ]);
  f.close({ phase: "night", cycle: 1 });
  const d1 = { phase: "day", cycle: 1 } as const;
  f.event(d1, { kind: "nomination", nominator: 1, nominee: 11 });
  f.event(d1, { kind: "vote", nominee: 11, voters: [1, 2, 3, 4, 5, 6] });
  f.event(d1, { kind: "execution", seat: 11 });
  f.event(d1, { kind: "death", seat: 11 });
  f.close(d1);
  const n2 = { phase: "night", cycle: 2 } as const;
  f.event(n2, { kind: "death", seat: 12 });
  f.close(n2);
  f.adopt({ kind: "role_at_phase", seat: 8, role: "Imp", occurredAt: n2 });
  f.close({ phase: "day", cycle: 2 });
  const n3 = { phase: "night", cycle: 3 } as const;
  f.event(n3, { kind: "death", seat: 6 });
  for (const payload of [
    {
      kind: "claim",
      claimKind: "ability_report",
      speaker: 7,
      role: "Empath",
      value: count,
    },
    {
      kind: "claim",
      claimKind: "ability_report",
      speaker: 4,
      role: "Fortune Teller",
      targets: [8, 2],
      value: true,
    },
  ] satisfies EventPayload[]) {
    f.event(n3, payload);
    for (const kind of ["report_accurate", "ability_active"] as const)
      f.adopt({ kind, eventId: f.get().events.at(-1)!.id });
  }
  f.close(n3);
  return {
    ...f.get(),
    title: "V1 善良小恶魔跨夜验收",
    recordingTime: n3,
    query: { seat: 8, role: "Imp", stage: "current" },
  };
}
function selfPoisonFixture(): StandardWorkspace {
  const f = fixture([
    "Librarian",
    "Chef",
    "Monk",
    "Empath",
    "Slayer",
    "Recluse",
    "Poisoner",
    "Imp",
  ]);
  f.event(
    { phase: "night", cycle: 1 },
    {
      kind: "claim",
      speaker: 1,
      claimKind: "ability_report",
      role: "Librarian",
      value: 0,
    },
  );
  for (const kind of ["report_accurate", "ability_active"] as const)
    f.adopt({ kind, eventId: f.get().events.at(-1)!.id });
  return {
    ...f.get(),
    title: "V1 自毒记录验收",
    query: { seat: 8, role: "Imp", stage: "initial" },
  };
}
async function importJson(page: Page, workspace: StandardWorkspace) {
  const mobile = (page.viewportSize()?.width ?? 1440) <= 600;
  const actions = mobile
    ? page.locator(".standard-mobile-actions")
    : page.getByRole("navigation", { name: "标准对局操作" });
  if (mobile && (await actions.getAttribute("open")) === null)
    await page.getByLabel("标准对局菜单").click();
  await actions
    .locator('input[type="file"]')
    .setInputFiles({
      name: "mechanism-fixture.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(workspace)),
    });
  await expect(page.locator(".session strong")).toHaveText(workspace.title);
  await expect(page.locator(".save-status")).toContainText("本地已保存");
}
async function open(page: Page, width: number, workspace: StandardWorkspace) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto("/");
  await page.getByRole("button", { name: "高级推理", exact: true }).click();
  await importJson(page, workspace);
}
async function query(page: Page, classification: string) {
  await page.getByRole("button", { name: "运行标准查询", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(classification, {
    timeout: 20000,
  });
}
function errorsFrom(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  return errors;
}
for (const width of [1440, 390]) {
  test(`good Imp evidence, Empath information and offline restore at ${width}px`, async ({
    page,
    context,
  }) => {
    test.setTimeout(90000);
    const errors = errorsFrom(page);
    await open(page, width, goodImpFixture());
    await query(page, "必然成立");
    await page.getByText("支持命题的见证", { exact: true }).click();
    const alignment = page.getByText(/8号 隐士 → 小恶魔（善良）/);
    await expect(alignment).toBeVisible();
    await expect(
      page.getByText("N2小恶魔自杀接任：8号注册为投毒者", { exact: true }),
    ).toBeVisible();
    await alignment.scrollIntoViewIfNeeded();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (process.env.V1_MECHANISM_SCREENSHOT_DIR)
      await page.screenshot({
        path: `${process.env.V1_MECHANISM_SCREENSHOT_DIR}/mechanism-good-imp-${width}.png`,
        fullPage: false,
      });
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
      "V1 善良小恶魔跨夜验收",
    );
    await query(page, "必然成立");
    await importJson(page, goodImpFixture(1));
    await query(page, "前提互相冲突");
    expect(errors).toEqual([]);
  });
  test(`self poison can be adopted, saved and reimported at ${width}px`, async ({
    page,
  }) => {
    const errors = errorsFrom(page);
    await open(page, width, selfPoisonFixture());
    await page.getByLabel("假设投毒者座位").selectOption("7");
    await page.getByLabel("假设投毒目标").selectOption("7");
    await page
      .getByRole("button", { name: "添加行动假设", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "7号投毒7号 ×", exact: true }),
    ).toBeVisible();
    await query(page, "必然成立");
    await page.getByText("支持命题的见证", { exact: true }).click();
    await expect(
      page.getByText("首夜投毒者：7号 → 7号", { exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole("button", { name: "7号投毒7号 ×", exact: true }),
    ).toBeVisible();
    await query(page, "必然成立");
    let imported = addStandardHypothesis(selfPoisonFixture(), {
      kind: "night_one_poison",
      poisonerSeat: 7,
      targetSeat: 7,
    });
    imported = toggleStandardHypothesis(
      imported,
      imported.hypotheses.at(-1)!.id,
    );
    await importJson(page, imported);
    await query(page, "必然成立");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
}
