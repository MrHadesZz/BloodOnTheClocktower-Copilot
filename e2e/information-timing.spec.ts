import { test, expect, type Page } from "@playwright/test";
import { writeFileSync } from "node:fs";
import {
  createStandardWorkspace,
  addStandardHypothesis,
  toggleStandardHypothesis,
  commitStandardDrafts,
  type StandardWorkspace,
} from "../src/core/standardWorkspace";
import { closeStandardPhase } from "../src/core/standardHistory";
import {
  eventLabel,
  type Role,
  type EventPayload,
  type GameTime,
} from "../src/core/model";
import type { ObservedPhase } from "../src/core/observedTimeline";

function fixture(
  kind: "poisoner" | "bad" | "spy" | "terminal",
): StandardWorkspace {
  const fifteen = kind === "spy";
  const roles: Role[] = fifteen
    ? [
        "Monk",
        "Soldier",
        "Mayor",
        "Ravenkeeper",
        "Undertaker",
        "Virgin",
        "Slayer",
        "Empath",
        "Fortune Teller",
        "Recluse",
        "Butler",
        "Poisoner",
        "Spy",
        "Scarlet Woman",
        "Imp",
      ]
    : [
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
  let workspace = createStandardWorkspace(roles.length);
  const adopt = (draft: Parameters<typeof addStandardHypothesis>[1]) => {
    workspace = addStandardHypothesis(workspace, draft);
    workspace = toggleStandardHypothesis(
      workspace,
      workspace.hypotheses.at(-1)!.id,
    );
  };
  const event = (time: GameTime, payload: EventPayload) => {
    const text = eventLabel({ payload });
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
  roles.forEach((role, i) => adopt({ kind: "actual_role", seat: i + 1, role }));
  adopt({
    kind: "night_one_poison",
    poisonerSeat: fifteen ? 12 : 10,
    targetSeat: fifteen ? 12 : 10,
  });
  const recluse = fifteen ? 10 : 8;
  const phases: ObservedPhase[] = [
    { kind: "night", cycle: 1, deaths: [] },
    {
      kind: "day",
      cycle: 1,
      events: [
        {
          kind: "nomination",
          nominator: 1,
          nominee: recluse,
          votes: Array.from({ length: fifteen ? 8 : 6 }, (_, i) => i + 1),
        },
      ],
      deaths: [recluse],
      executedSeat: recluse,
    },
  ];
  if (kind === "terminal")
    phases.push(
      { kind: "night", cycle: 2, deaths: [6, 7] },
      {
        kind: "day",
        cycle: 2,
        events: [
          {
            kind: "nomination",
            nominator: 2,
            nominee: 1,
            votes: [2, 3, 4, 5, 10],
          },
        ],
        deaths: [1],
        executedSeat: 1,
      },
      { kind: "night", cycle: 3, deaths: [2, 3] },
      {
        kind: "day",
        cycle: 3,
        events: [
          { kind: "nomination", nominator: 4, nominee: 9, votes: [4, 5, 10] },
        ],
        deaths: [9],
        executedSeat: 9,
      },
      { kind: "night", cycle: 4, deaths: [5] },
      { kind: "day", cycle: 4, events: [], deaths: [], executedSeat: null },
      { kind: "night", cycle: 5, deaths: [4, 11], winner: "evil" },
    );
  else phases.push({ kind: "night", cycle: 2, deaths: [4, fifteen ? 15 : 12] });
  for (const phase of phases) {
    const time = { phase: phase.kind, cycle: phase.cycle };
    if (phase.kind === "day") {
      for (const action of phase.events) {
        if (action.kind !== "nomination")
          throw new Error("Unexpected fixture action");
        event(time, {
          kind: "nomination",
          nominator: action.nominator,
          nominee: action.nominee,
        });
        event(time, {
          kind: "vote",
          nominee: action.nominee,
          voters: action.votes,
        });
      }
      if (phase.executedSeat !== null)
        event(time, { kind: "execution", seat: phase.executedSeat });
    }
    for (const seat of phase.deaths) event(time, { kind: "death", seat });
    if (phase.winner) event(time, { kind: "winner", team: phase.winner });
    workspace = closeStandardPhase(workspace, time, true);
  }
  const time = { phase: "night", cycle: kind === "terminal" ? 5 : 2 } as const;
  if (kind !== "terminal")
    adopt({
      kind: "role_at_phase",
      seat: fifteen ? 13 : 10,
      role: "Imp",
      occurredAt: time,
    });
  event(time, {
    kind: "claim",
    speaker: 4,
    claimKind: "ability_report",
    role: "Ravenkeeper",
    targets: [fifteen ? 13 : 10],
    value: kind === "bad" ? "Spy" : fifteen ? "Chef" : "Poisoner",
  });
  for (const condition of ["report_accurate", "ability_active"] as const)
    adopt({ kind: condition, eventId: workspace.events.at(-1)!.id });
  return {
    ...workspace,
    title:
      kind === "terminal"
        ? "守鸦人：终局前已获得信息"
        : kind === "spy"
          ? "守鸦人：间谍先注册，再成为小恶魔"
          : kind === "bad"
            ? "守鸦人：错误角色对照"
            : "守鸦人：先得知投毒者，再发生传位",
    recordingTime: time,
    query: { seat: roles.length, role: "Imp", stage: "initial" },
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
      name: "information-timing.json",
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
  test(`death-time information, later character changes, terminal history and offline replay at ${width}px`, async ({
    page,
    context,
  }) => {
    test.setTimeout(120000);
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
    const support = page
      .locator(".standard-witness")
      .filter({ has: page.getByText("支持命题的见证", { exact: true }) });
    await importJson(page, fixture("poisoner"));
    await query(page, "必然成立");
    await page.getByText("支持命题的见证", { exact: true }).click();
    await expect(support).toContainText("10号 投毒者 → 小恶魔（邪恶）");
    await support.getByText("查看这组可能的隐藏行动", { exact: true }).click();
    const info = support.locator(".standard-information-moment");
    await expect(info).toContainText("第1次小恶魔行动后死亡");
    await expect(info).toContainText("当时选择10号，得知投毒者");
    await info.scrollIntoViewIfNeeded();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const directory = process.env.INFO_RECOVERY_SCREENSHOT_DIR;
    if (directory) {
      await page.screenshot({
        path: `${directory}/information-timing-${width}.png`,
        fullPage: false,
      });
      if (width === 1440)
        for (const kind of ["poisoner", "spy", "terminal"] as const)
          writeFileSync(
            `${directory}/information-timing-${kind}.json`,
            JSON.stringify(fixture(kind), null, 2),
          );
    }
    await importJson(page, fixture("bad"));
    await query(page, "前提互相冲突");
    await importJson(page, fixture("spy"));
    await query(page, "必然成立");
    await page.getByText("支持命题的见证", { exact: true }).click();
    await expect(support).toContainText("13号 间谍 → 小恶魔（邪恶）");
    await support.getByText("查看这组可能的隐藏行动", { exact: true }).click();
    await expect(support.locator(".standard-information-moment")).toContainText(
      "当时选择13号，得知厨师（本次注册）",
    );
    await importJson(page, fixture("terminal"));
    await query(page, "必然成立");
    await page.getByText("支持命题的见证", { exact: true }).click();
    await support.getByText("查看这组可能的隐藏行动", { exact: true }).click();
    await expect(
      support.locator("ol li").filter({ hasText: "N5：" }),
    ).toContainText("当时选择10号，得知投毒者");
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
      "守鸦人：终局前已获得信息",
    );
    await query(page, "必然成立");
    await page.getByText("支持命题的见证", { exact: true }).click();
    await support.getByText("查看这组可能的隐藏行动", { exact: true }).click();
    await expect(support.locator(".standard-information-moment")).toContainText(
      "当时选择10号，得知投毒者",
    );
    await expect(page.locator("vite-error-overlay")).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
}
