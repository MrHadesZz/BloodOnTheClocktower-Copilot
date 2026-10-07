import { test, expect, type Page } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import {
  createStandardWorkspace,
  createStandardBranch,
  commitStandardDrafts,
  addStandardHypothesis,
  toggleStandardHypothesis,
  type StandardWorkspace,
  type PublicTranscript,
} from "../src/core/standardWorkspace";
import { closeStandardPhase } from "../src/core/standardHistory";
import { eventLabel, type EventPayload, type Role } from "../src/core/model";

function fixture(privateVote = false): StandardWorkspace {
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
  for (const [index, role] of roles.entries()) {
    workspace = addStandardHypothesis(workspace, {
      kind: "actual_role",
      seat: index + 1,
      role,
    });
    workspace = toggleStandardHypothesis(
      workspace,
      workspace.hypotheses.at(-1)!.id,
    );
  }
  workspace = {
    ...workspace,
    branches: workspace.branches.map((branch) => ({
      ...branch,
      name: "原始记录",
    })),
  };
  workspace = closeStandardPhase(workspace, { phase: "night", cycle: 1 }, true);
  const day = { phase: "day", cycle: 1 } as const;
  for (const payload of [
    { kind: "nomination", nominator: 2, nominee: 3 },
    { kind: "vote", nominee: 3, voters: [1, 2, 3, 4, 5] },
    { kind: "slayer", actor: 1, target: 6 },
    { kind: "death", seat: 6 },
  ] as EventPayload[]) {
    const secret = privateVote && payload.kind === "vote";
    const text = secret
      ? "私密投票原文：五号举手误录，仅本地可见"
      : eventLabel({ payload });
    workspace = commitStandardDrafts(
      workspace,
      text,
      [{ payload, occurredAt: day, label: text, sourceSpan: [0, text.length] }],
      secret ? "private" : "public",
    );
  }
  workspace = closeStandardPhase(workspace, day, true);
  workspace = createStandardBranch(workspace, "投票纠正分支");
  return {
    ...workspace,
    title: privateVote ? "私密投票纠正" : "投票纠正与行动顺序",
    recordingTime: day,
    query: { seat: 9, role: "Imp", stage: "initial" },
  };
}
async function menu(page: Page) {
  if ((page.viewportSize()?.width ?? 1440) <= 600) {
    const actions = page.locator(".standard-mobile-actions");
    if ((await actions.getAttribute("open")) === null)
      await page.getByLabel("标准对局菜单").click();
    return actions;
  }
  return page.getByRole("navigation", { name: "标准对局操作" });
}
async function importJson(page: Page, workspace: StandardWorkspace) {
  const actions = await menu(page);
  await actions.locator('input[type="file"]').setInputFiles({
    name: "history-audit.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(workspace)),
  });
}
async function downloadJson<T>(page: Page, label: string): Promise<T> {
  const actions = await menu(page);
  const pending = page.waitForEvent("download");
  await actions.getByRole("button", { name: label, exact: true }).click();
  const download = await pending;
  const path = await download.path();
  if (!path) throw new Error("Missing local JSON download");
  return JSON.parse(readFileSync(path, "utf8"));
}
const closePanel = (page: Page) =>
  page.getByRole("button", { name: "关闭面板", exact: true }).click();
const records = (page: Page) =>
  page.getByRole("button", { name: "记录", exact: true }).click();
const daySection = (page: Page) =>
  page.getByRole("region", { name: "D1记录", exact: true });
async function confirmDay(page: Page) {
  const section = daySection(page);
  await section
    .getByRole("button", { name: "本阶段记录完整", exact: true })
    .click();
  await section.getByRole("checkbox", { name: /我确认D1/ }).check();
  await section
    .getByRole("button", { name: "确认D1记录完整", exact: true })
    .click();
  await expect(section).toContainText("本阶段已确认完整");
}
async function editVote(page: Page, cancelFirst = false) {
  const section = daySection(page);
  const button = section.getByRole("button", {
    name: "纠正提名3号：5票",
    exact: true,
  });
  await button.click();
  let form = page.getByRole("form", { name: "纠正投票", exact: true });
  await expect(
    form.getByRole("checkbox", { name: "5号", exact: true }),
  ).toBeChecked();
  await form.getByRole("checkbox", { name: "5号", exact: true }).uncheck();
  if (cancelFirst) {
    await form.getByRole("button", { name: "取消纠正", exact: true }).click();
    await expect(section).toContainText("本阶段已确认完整");
    await button.click();
    form = page.getByRole("form", { name: "纠正投票", exact: true });
    await expect(
      form.getByRole("checkbox", { name: "5号", exact: true }),
    ).toBeChecked();
    await form.getByRole("checkbox", { name: "5号", exact: true }).uncheck();
  }
  await form.getByRole("button", { name: "保存投票纠正", exact: true }).click();
  await expect(section).toContainText("本阶段尚未确认完整");
  await expect(section).toContainText("已纠正的原记录");
  await expect(section).toContainText("投票纠正（原投票位置）");
  await expect(
    page.getByRole("region", { name: "N1记录", exact: true }),
  ).toContainText("本阶段已确认完整");
}
async function queryAdvanced(page: Page, result: string) {
  await page.getByRole("button", { name: "运行标准查询", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(result, {
    timeout: 20000,
  });
}
for (const width of [1440, 390]) {
  test(`vote correction keeps original order, branch snapshots, export privacy and offline replay at ${width}px`, async ({
    page,
    context,
  }) => {
    test.setTimeout(180000);
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
    const qa = process.env.HISTORY_AUDIT_QA_DIR;
    if (qa) await page.screenshot({ path: `${qa}/first-view-${width}.png` });
    await page.getByRole("button", { name: "高级推理", exact: true }).click();
    const original = fixture();
    await importJson(page, original);
    await expect(page.locator(".session strong")).toHaveText(original.title);
    await queryAdvanced(page, "前提互相冲突");
    await (
      await menu(page)
    )
      .getByRole("button", { name: "返回魔典", exact: true })
      .click();
    await records(page);
    await editVote(page, true);
    await closePanel(page);
    await page.getByRole("button", { name: "推理", exact: true }).click();
    await page.getByRole("button", { name: "运行推理", exact: true }).click();
    await expect(page.getByRole("alert")).toContainText(
      "D1行动与死亡记录尚未确认完整",
    );
    await closePanel(page);
    await records(page);
    await confirmDay(page);
    const replacement = daySection(page)
      .locator(".gr-history-row")
      .filter({
        has: page.getByRole("button", {
          name: "纠正提名3号：4票",
          exact: true,
        }),
      });
    await replacement.getByText("回看原投票", { exact: true }).click();
    await expect(replacement).toContainText("本日已重新确认完整");
    await expect(replacement).toContainText(
      "原记录举手玩家：1号、2号、3号、4号、5号",
    );
    await replacement.scrollIntoViewIfNeeded();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const directory = process.env.HISTORY_AUDIT_SCREENSHOT_DIR;
    if (directory)
      await page.screenshot({
        path: `${directory}/history-audit-${width}.png`,
      });
    await closePanel(page);
    await page.getByRole("button", { name: "推理", exact: true }).click();
    await page.getByRole("button", { name: "运行推理", exact: true }).click();
    await expect(
      page.getByRole("region", { name: "魔典推理结果", exact: true }),
    ).toContainText("必然成立", { timeout: 20000 });
    await page.getByText("支持命题的见证", { exact: true }).click();
    await page.getByText("查看这组可能的隐藏行动", { exact: true }).click();
    await expect(page.locator(".standard-day-steps")).toContainText(
      "4票；计票时9人存活，至少需5票，未达门槛",
    );
    await page
      .getByLabel("推理分支", { exact: true })
      .selectOption(original.branches[0].id);
    await expect(
      page.getByRole("region", { name: "魔典推理结果", exact: true }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "运行推理", exact: true }).click();
    await expect(
      page.getByRole("region", { name: "魔典推理结果", exact: true }),
    ).toContainText("前提互相冲突", { timeout: 20000 });
    await closePanel(page);
    await records(page);
    await expect(
      daySection(page).getByRole("button", {
        name: "纠正提名3号：5票",
        exact: true,
      }),
    ).toBeDisabled();
    await closePanel(page);
    await page.getByRole("button", { name: "高级推理", exact: true }).click();
    await expect(page.getByLabel("快速记录", { exact: true })).toBeDisabled();
    await expect(
      page.getByRole("button", { name: "预览录入", exact: true }),
    ).toBeDisabled();
    await page
      .locator(".standard-timeline button")
      .filter({ hasText: "提名3号：5票" })
      .click();
    await expect(
      page.getByRole("button", { name: "撤回误录", exact: true }),
    ).toBeDisabled();
    await page
      .getByRole("button", { name: "更新到最新记录", exact: true })
      .click();
    await expect(page.getByLabel("快速记录", { exact: true })).toBeEnabled();
    await queryAdvanced(page, "必然成立");
    const corrected = await downloadJson<StandardWorkspace>(
      page,
      "私密全量导出",
    );
    expect(corrected.schemaVersion).toBe(3);
    expect(corrected.events.some((event) => event.correctsEventId)).toBe(true);
    if (directory && width === 1440) {
      writeFileSync(
        `${directory}/history-audit-legacy.json`,
        JSON.stringify(original, null, 2),
      );
      writeFileSync(
        `${directory}/history-audit-corrected.json`,
        JSON.stringify(corrected, null, 2),
      );
    }
    const damaged = structuredClone(corrected);
    damaged.title = "损坏的投票纠正不应替换工作区";
    damaged.events.find((event) => event.correctsEventId)!.correctsEventId =
      damaged.events.find((event) => event.payload.kind === "slayer")!.id;
    await importJson(page, damaged);
    await expect(page.getByRole("alert")).toContainText("投票纠正");
    await expect(page.locator(".session strong")).toHaveText(original.title);
    await queryAdvanced(page, "必然成立");
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
    await expect(page.locator(".session strong")).toHaveText(original.title);
    await queryAdvanced(page, "必然成立");
    const restored = await downloadJson<StandardWorkspace>(
      page,
      "私密全量导出",
    );
    expect(restored).toEqual(corrected);
    await context.setOffline(false);
    const privateWorkspace = fixture(true);
    await importJson(page, privateWorkspace);
    await expect(page.locator(".session strong")).toHaveText(
      privateWorkspace.title,
    );
    const before = await downloadJson<PublicTranscript>(page, "公开导出");
    await (
      await menu(page)
    )
      .getByRole("button", { name: "返回魔典", exact: true })
      .click();
    await records(page);
    await editVote(page);
    await confirmDay(page);
    await closePanel(page);
    await page.getByRole("button", { name: "高级推理", exact: true }).click();
    const after = await downloadJson<PublicTranscript>(page, "公开导出");
    expect(after).toEqual(before);
    expect(JSON.stringify(after)).not.toContain("私密投票原文");
    expect(after.schemaVersion).toBe(1);
    await queryAdvanced(page, "必然成立");
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
