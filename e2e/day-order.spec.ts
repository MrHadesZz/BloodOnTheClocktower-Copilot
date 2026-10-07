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
import type { DayEvent } from "../src/core/day";

type Example =
  | "late"
  | "early"
  | "retroactive"
  | "corpse"
  | "false_report"
  | "terminal"
  | "post_terminal"
  | "virgin"
  | "interleaved";
function fixture(kind: Example): StandardWorkspace {
  const roles: Role[] = [
    "Slayer",
    "Chef",
    "Monk",
    "Undertaker",
    "Virgin",
    "Recluse",
    "Saint",
    "Spy",
    "Imp",
  ];
  let workspace = createStandardWorkspace(9);
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
  roles.forEach((role, index) =>
    adopt({ kind: "actual_role", seat: index + 1, role }),
  );
  workspace = closeStandardPhase(workspace, { phase: "night", cycle: 1 }, true);
  const day = { phase: "day", cycle: 1 } as const;
  const shot: DayEvent = { kind: "slayer", actor: 1, target: 6 };
  const vote: DayEvent = {
    kind: "nomination",
    nominator: 2,
    nominee: 3,
    votes: [1, 2, 3, 4],
  };
  const saint: DayEvent = {
    kind: "nomination",
    nominator: 2,
    nominee: 7,
    votes: [1, 2, 3, 4, 5],
  };
  const terminal = kind === "terminal" || kind === "post_terminal";
  const corpse = kind === "corpse" || kind === "false_report";
  const actions: DayEvent[] = terminal
    ? [saint, { kind: "slayer", actor: 1, target: 9 }]
    : kind === "virgin"
      ? [saint, { kind: "nomination", nominator: 3, nominee: 5, votes: [] }]
      : corpse
        ? [shot, { ...vote, nominee: 6 }]
        : kind === "early"
          ? [shot, vote]
          : [vote, shot];
  for (const action of actions) {
    if (action.kind === "slayer") {
      if (kind !== "interleaved") event(day, action);
    } else {
      event(day, {
        kind: "nomination",
        nominator: action.nominator,
        nominee: action.nominee,
      });
      if (kind === "interleaved")
        event(day, { kind: "slayer", actor: 1, target: 6 });
      event(day, {
        kind: "vote",
        nominee: action.nominee,
        voters: action.votes,
      });
    }
  }
  const executed = corpse
    ? 6
    : kind === "early" || kind === "retroactive" || kind === "virgin"
      ? 3
      : kind === "post_terminal"
        ? 7
        : null;
  if (executed !== null) event(day, { kind: "execution", seat: executed });
  const deaths = terminal
    ? kind === "post_terminal"
      ? [9, 7]
      : [9]
    : kind === "virgin"
      ? [3]
      : kind === "early" || kind === "retroactive"
        ? [6, 3]
        : [6];
  for (const seat of deaths) event(day, { kind: "death", seat });
  if (terminal)
    event(day, {
      kind: "winner",
      team: kind === "post_terminal" ? "evil" : "good",
    });
  workspace = closeStandardPhase(workspace, day, true);
  const later = corpse || kind === "early" || kind === "virgin";
  const time: GameTime = later ? { phase: "night", cycle: 2 } : day;
  if (later) workspace = closeStandardPhase(workspace, time, true);
  if (kind === "early" || kind === "virgin" || kind === "false_report") {
    event(time, {
      kind: "claim",
      speaker: 4,
      claimKind: "ability_report",
      role: "Undertaker",
      value: kind === "false_report" ? "Recluse" : "Monk",
    });
    for (const condition of ["report_accurate", "ability_active"] as const)
      adopt({ kind: condition, eventId: workspace.events.at(-1)!.id });
  }
  const titles: Record<Example, string> = {
    late: "计票时9人存活：4票未通过，随后猎手击杀",
    early: "先猎手击杀，再以4票处决：送葬者获知僧侣",
    retroactive: "反例：后来死亡不能补足较早的投票",
    corpse: "猎手击杀后处决尸体：没有处决死亡",
    false_report: "反例：尸体处决不会给送葬者信息",
    terminal: "猎手终局：不再处决票数领先的圣徒",
    post_terminal: "反例：终局后不能处决圣徒并翻转胜负",
    virgin: "贞洁者立即处决：覆盖待处决的圣徒",
    interleaved: "保留实际顺序：提名与计票之间的猎手行动",
  };
  return {
    ...workspace,
    title: titles[kind],
    recordingTime: time,
    query: { seat: 9, role: "Imp", stage: "initial" },
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
    name: "day-order.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(workspace)),
  });
  await expect(page.locator(".session strong")).toHaveText(workspace.title);
  await expect(page.locator(".save-status")).toContainText("本地已保存");
}
async function query(page: Page, classification = "必然成立") {
  await page.getByRole("button", { name: "运行标准查询", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(classification, {
    timeout: 20000,
  });
}
for (const width of [1440, 390]) {
  test(`public day ordering, execution death, terminal and offline replay at ${width}px`, async ({
    page,
    context,
  }) => {
    test.setTimeout(120000);
    const errors: string[] = [],
      warnings: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
      if (message.type() === "warning") warnings.push(message.text());
    });
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle("钟楼推理台");
    expect(new URL(page.url()).pathname).toBe("/");
    await expect(
      page.getByRole("button", { name: "高级推理", exact: true }),
    ).toBeVisible();
    await expect(page.locator("vite-error-overlay")).toHaveCount(0);
    const qaDirectory = process.env.DAY_ORDER_QA_DIR;
    if (qaDirectory)
      await page.screenshot({ path: `${qaDirectory}/first-view-${width}.png` });
    await page.getByRole("button", { name: "高级推理", exact: true }).click();
    const support = page
      .locator(".standard-witness")
      .filter({ has: page.getByText("支持命题的见证", { exact: true }) });
    const openActions = async () => {
      await page.getByText("支持命题的见证", { exact: true }).click();
      await support
        .getByText("查看这组可能的隐藏行动", { exact: true })
        .click();
    };
    await importJson(page, fixture("late"));
    await query(page);
    await openActions();
    await expect(support.locator(".standard-day-steps")).toContainText(
      "计票时9人存活，至少需5票，未达门槛",
    );
    await expect(support.locator(".standard-day-steps")).toContainText(
      "第2条：1号宣称猎手，选择6号：6号死亡",
    );
    await expect(support.locator(".standard-execution-moment")).toContainText(
      "本日没有处决",
    );
    await support
      .locator(".standard-execution-moment")
      .scrollIntoViewIfNeeded();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const directory = process.env.DAY_ORDER_SCREENSHOT_DIR;
    if (directory) {
      await page.screenshot({ path: `${directory}/day-order-${width}.png` });
      if (width === 1440)
        for (const kind of ["late", "corpse", "terminal"] as const)
          writeFileSync(
            `${directory}/day-order-${kind}.json`,
            JSON.stringify(fixture(kind), null, 2),
          );
    }
    await importJson(page, fixture("retroactive"));
    await query(page, "前提互相冲突");
    await importJson(page, fixture("interleaved"));
    await page
      .getByRole("button", { name: "运行标准查询", exact: true })
      .click();
    await expect(page.getByRole("alert")).toContainText("暂不支持这类交错顺序");
    await expect(page.getByRole("status")).toHaveCount(0);
    await importJson(page, fixture("early"));
    await query(page);
    await openActions();
    await expect(support.locator(".standard-day-steps")).toContainText(
      "计票时8人存活，至少需4票，达到人数门槛",
    );
    await expect(support.locator(".standard-execution-moment")).toContainText(
      "本日投票处决3号：本次产生处决死亡",
    );
    await importJson(page, fixture("corpse"));
    await query(page);
    await openActions();
    await expect(support.locator(".standard-execution-moment")).toContainText(
      "其已死亡，本次不产生处决死亡，送葬者不会因此获得信息",
    );
    await importJson(page, fixture("false_report"));
    await query(page, "前提互相冲突");
    await importJson(page, fixture("virgin"));
    await query(page);
    await openActions();
    await expect(support.locator(".standard-day-steps")).toContainText(
      "贞洁者立即处决3号，本日结束",
    );
    await expect(support.locator(".standard-execution-moment")).toContainText(
      "贞洁者立即处决3号：本次产生处决死亡",
    );
    await importJson(page, fixture("post_terminal"));
    await query(page, "前提互相冲突");
    await importJson(page, fixture("terminal"));
    await query(page);
    await openActions();
    await expect(support.locator(".standard-execution-moment")).toContainText(
      "第2条行动后对局结束：善良获胜，不再结算待处决",
    );
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
      fixture("terminal").title,
    );
    await query(page);
    await openActions();
    await expect(support.locator(".standard-execution-moment")).toContainText(
      "善良获胜，不再结算待处决",
    );
    await expect(page.locator("vite-error-overlay")).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
    expect(warnings).toEqual([]);
  });
}
