import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import {
  addStandardHypothesis,
  commitStandardDrafts,
  commitStandardEntry,
  createStandardBranch,
  createStandardWorkspace,
  toggleStandardHypothesis,
  type StandardWorkspace,
  type PublicTranscript,
} from "../src/core/standardWorkspace";
import { closeStandardPhase } from "../src/core/standardHistory";
import { eventLabel, type Role } from "../src/core/model";

function fixture(
  kind: "nomination" | "slayer" = "nomination",
  scope: "public" | "private" = "public",
  privateVote = false,
) {
  let w = createStandardWorkspace(7);
  const roles: Role[] = [
    "Slayer",
    "Chef",
    "Monk",
    "Fortune Teller",
    "Soldier",
    "Poisoner",
    "Imp",
  ];
  for (const [i, role] of roles.entries()) {
    w = addStandardHypothesis(w, { kind: "actual_role", seat: i + 1, role });
    w = toggleStandardHypothesis(w, w.hypotheses.at(-1)!.id);
  }
  w = closeStandardPhase(w, { phase: "night", cycle: 1 }, true);
  if (kind === "nomination") {
    w = commitStandardEntry(w, "2 nom 3 @D1", scope);
    w = commitStandardEntry(
      w,
      "vote 3 = 1,2,3,4 @D1",
      privateVote ? "private" : scope,
    );
    w = commitStandardEntry(w, "1 slay 5 @D1", scope);
    w = commitStandardEntry(w, "exec 4 @D1", scope);
    w = commitStandardEntry(w, "4 dead @D1", scope);
  } else {
    w = commitStandardEntry(w, "2 slay 7 @D1", scope);
    w = commitStandardEntry(w, "7 dead @D1", scope);
    w = commitStandardEntry(w, "win good @D1", scope);
  }
  const source = w.events.find((e) => e.payload.kind === kind)!;
  w = closeStandardPhase(w, { phase: "day", cycle: 1 }, true);
  const text = "匿名教学：1号声称猎手";
  w = commitStandardDrafts(w, text, [
    {
      payload: { kind: "claim", claimKind: "role", speaker: 1, role: "Slayer" },
      occurredAt: { phase: "night", cycle: 1 },
      label: text,
      sourceSpan: [0, text.length],
    },
  ]);
  const parentId = w.activeBranchId;
  w = createStandardBranch(w, "行动纠正分支");
  w = {
    ...w,
    title: "提名与猎手行动纠正示例",
    recordingTime: { phase: "day", cycle: 1 },
  };
  return {
    workspace: w,
    source,
    parentId,
    editingId: w.activeBranchId,
    noun: kind === "nomination" ? "提名" : "猎手行动",
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
async function importGame(page: Page, workspace: StandardWorkspace) {
  await page.getByRole("button", { name: "高级推理", exact: true }).click();
  await (
    await menu(page)
  )
    .locator('input[type="file"]')
    .setInputFiles({
      name: "action-correction.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(workspace)),
    });
  await expect(page.locator(".session strong")).toHaveText(workspace.title);
  await (
    await menu(page)
  )
    .getByRole("button", { name: "返回魔典", exact: true })
    .click();
}
async function exportJson<T>(page: Page, label: string): Promise<T> {
  const pending = page.waitForEvent("download");
  await (
    await menu(page)
  )
    .getByRole("button", { name: label, exact: true })
    .click();
  const path = await (await pending).path();
  if (!path) throw new Error("Download missing");
  return JSON.parse(readFileSync(path, "utf8"));
}
const close = (page: Page) =>
  page.getByRole("button", { name: "关闭面板", exact: true }).click();
const records = (page: Page) =>
  page.getByRole("button", { name: "记录", exact: true }).click();
async function confirm(page: Page) {
  const section = page.getByRole("region", { name: "D1记录", exact: true });
  await section
    .getByRole("button", { name: "本阶段记录完整", exact: true })
    .click();
  await section.getByRole("checkbox", { name: /我确认D1/ }).check();
  await section
    .getByRole("button", { name: "确认D1记录完整", exact: true })
    .click();
  await expect(section).toContainText("本阶段已确认完整");
}
async function analyze(page: Page, expected: string) {
  await page.getByRole("button", { name: "一键分析", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "声称分析结果", exact: true }),
  ).toContainText(expected, { timeout: 35000 });
}
const reviewLabel = "我已核对以上关联投票，同意保留举手名单并重新关联";

for (const width of [1440, 390])
  for (const kind of ["nomination", "slayer"] as const) {
    test(`${kind} source, correction, old branch and offline recovery at ${width}px`, async ({
      page,
      context,
    }) => {
      test.setTimeout(120000);
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      expect((await page.goto("/"))?.status()).toBe(200);
      await expect(page).toHaveTitle("钟楼推理台");
      const f = fixture(kind);
      await importGame(page, f.workspace);
      await analyze(page, "对局事件或手动前提有冲突");
      const audit = page.getByRole("region", {
        name: "固定事实阶段核对",
        exact: true,
      });
      await audit
        .getByRole("button", { name: "核对固定事实", exact: true })
        .click();
      await expect(audit).toContainText("最早确认冲突的阶段：D1", {
        timeout: 35000,
      });
      await audit
        .getByText(`回看${eventLabel(f.source)} · D1`, { exact: true })
        .click();
      await audit
        .getByRole("button", {
          name: `在记录中核对${eventLabel(f.source)}`,
          exact: true,
        })
        .click();
      const row = page.locator(`[id="gr-history-${f.source.id}"]`);
      await expect(row).toBeFocused();
      const edit = () =>
        row
          .getByRole("button", {
            name: `纠正${eventLabel(f.source)}`,
            exact: true,
          })
          .click();
      await edit();
      let form = row.getByRole("form", {
        name: `纠正${f.noun}记录`,
        exact: true,
      });
      await form
        .getByRole("button", { name: `保存${f.noun}纠正`, exact: true })
        .click();
      await expect(
        page.getByRole("region", { name: "D1记录", exact: true }),
      ).toContainText("本阶段已确认完整");
      await edit();
      form = row.getByRole("form", { name: `纠正${f.noun}记录`, exact: true });
      await form
        .getByLabel(
          kind === "nomination" ? "实际被提名人" : "实际猎手行动玩家",
          { exact: true },
        )
        .selectOption(kind === "nomination" ? "4" : "1");
      await form.getByRole("button", { name: "取消纠正", exact: true }).click();
      await expect(
        page.getByRole("region", { name: "D1记录", exact: true }),
      ).toContainText("本阶段已确认完整");
      await edit();
      form = row.getByRole("form", { name: `纠正${f.noun}记录`, exact: true });
      await form
        .getByLabel(
          kind === "nomination" ? "实际被提名人" : "实际猎手行动玩家",
          { exact: true },
        )
        .selectOption(kind === "nomination" ? "4" : "1");
      const save = form.getByRole("button", {
        name: `保存${f.noun}纠正`,
        exact: true,
      });
      if (kind === "nomination") {
        await expect(form).toContainText("1号、2号、3号、4号");
        await expect(save).toBeDisabled();
        await form
          .getByRole("checkbox", { name: reviewLabel, exact: true })
          .check();
        await form.getByLabel("实际提名人", { exact: true }).selectOption("3");
        await expect(
          form.getByRole("checkbox", { name: reviewLabel, exact: true }),
        ).not.toBeChecked();
        await form.getByLabel("实际提名人", { exact: true }).selectOption("2");
        await form
          .getByRole("checkbox", { name: reviewLabel, exact: true })
          .check();
      }
      const shots = process.env.ACTION_CORRECTION_SCREENSHOT_DIR;
      if (shots) {
        await form.scrollIntoViewIfNeeded();
        await page.screenshot({
          path: `${shots}/action-correction-${kind}-${width}.png`,
        });
      }
      expect(
        await page
          .locator("dialog")
          .evaluate((el) => el.scrollWidth <= el.clientWidth),
      ).toBe(true);
      await save.click();
      await expect(row).toContainText("已纠正的原记录");
      await expect(
        page.getByRole("region", { name: "D1记录", exact: true }),
      ).not.toContainText("本阶段已确认完整");
      await close(page);
      await analyze(page, "结果未知");
      await close(page);
      await records(page);
      await confirm(page);
      const replacement = page
        .locator(".gr-history-active")
        .filter({
          has: page.getByRole("button", {
            name:
              kind === "nomination"
                ? "纠正2号提名4号"
                : "纠正1号使用猎手能力指向7号",
            exact: true,
          }),
        });
      await replacement.getByText("回看纠正前原记录", { exact: true }).click();
      await expect(replacement).toContainText(f.source.rawText);
      await close(page);
      await analyze(page, "已录声称可以同时成立");
      await close(page);
      await page.getByRole("button", { name: "推理", exact: true }).click();
      await page
        .getByLabel("推理分支", { exact: true })
        .selectOption(f.parentId);
      await close(page);
      await records(page);
      await expect(
        row.getByRole("button", {
          name: `纠正${eventLabel(f.source)}`,
          exact: true,
        }),
      ).toBeDisabled();
      await close(page);
      await analyze(page, "对局事件或手动前提有冲突");
      await close(page);
      await page.getByRole("button", { name: "推理", exact: true }).click();
      await page
        .getByLabel("推理分支", { exact: true })
        .selectOption(f.editingId);
      await close(page);
      await page.getByRole("button", { name: "高级推理", exact: true }).click();
      const exported = await exportJson<StandardWorkspace>(
        page,
        "私密全量导出",
      );
      expect(exported.schemaVersion).toBe(5);
      expect(exported.events.find((e) => e.id === f.source.id)).toEqual(
        f.source,
      );
      if (kind === "nomination") {
        const nom = exported.events.find(
          (e) => e.correctsEventId === f.source.id,
        )!;
        const vote = exported.events.find(
          (e) => e.payload.kind === "vote" && e.payload.nominationId === nom.id,
        )!;
        expect(vote.payload).toMatchObject({
          nominee: 4,
          voters: [1, 2, 3, 4],
        });
        expect(vote.correctsEventId).toBe(
          f.workspace.events.find((e) => e.payload.kind === "vote")!.id,
        );
      }
      expect(
        (await exportJson<PublicTranscript>(page, "公开导出")).schemaVersion,
      ).toBe(4);
      if (process.env.PLAYWRIGHT_OFFLINE === "1") {
        await expect(page.locator(".session small")).toContainText(
          "离线资源已就绪",
          { timeout: 30000 },
        );
        await context.setOffline(true);
      }
      await page.reload();
      expect(await exportJson<StandardWorkspace>(page, "私密全量导出")).toEqual(
        exported,
      );
      await (
        await menu(page)
      )
        .getByRole("button", { name: "返回魔典", exact: true })
        .click();
      await analyze(page, "已录声称可以同时成立");
      expect(await page.locator("vite-error-overlay").count()).toBe(0);
      expect(errors).toEqual([]);
    });
  }

for (const width of [1440, 390])
  test(`private action correction and damaged ballot imports at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto("/");
    const f = fixture("nomination", "private");
    await importGame(page, f.workspace);
    await page.getByRole("button", { name: "高级推理", exact: true }).click();
    const before = await exportJson<PublicTranscript>(page, "公开导出");
    await (
      await menu(page)
    )
      .getByRole("button", { name: "返回魔典", exact: true })
      .click();
    await records(page);
    await page
      .getByRole("button", { name: "纠正2号提名3号", exact: true })
      .click();
    const form = page.getByRole("form", { name: "纠正提名记录", exact: true });
    await expect(form).toContainText("私密");
    await form.getByLabel("实际被提名人", { exact: true }).selectOption("4");
    await form
      .getByRole("checkbox", { name: reviewLabel, exact: true })
      .check();
    await form
      .getByRole("button", { name: "保存提名纠正", exact: true })
      .click();
    await confirm(page);
    await close(page);
    await page.getByRole("button", { name: "高级推理", exact: true }).click();
    expect(await exportJson<PublicTranscript>(page, "公开导出")).toEqual(
      before,
    );
    const full = await exportJson<StandardWorkspace>(page, "私密全量导出");
    for (const damage of ["old-format", "changed-voters"]) {
      const damaged = structuredClone(full);
      if (damage === "old-format") damaged.schemaVersion = 4;
      else {
        const ballot = damaged.events.find(
          (e) => e.correctsEventId && e.payload.kind === "vote",
        )!;
        if (ballot.payload.kind !== "vote") throw new Error("Expected vote");
        ballot.payload.voters = [1];
      }
      await (
        await menu(page)
      )
        .locator('input[type="file"]')
        .setInputFiles({
          name: `damaged-${damage}.json`,
          mimeType: "application/json",
          buffer: Buffer.from(JSON.stringify(damaged)),
        });
      await expect(page.getByRole("alert")).toContainText("纠正");
      expect(await exportJson<StandardWorkspace>(page, "私密全量导出")).toEqual(
        full,
      );
    }
  });

test("a public nomination correction does not publish its private ballot", async ({
  page,
}) => {
  await page.goto("/");
  const f = fixture("nomination", "public", true);
  await importGame(page, f.workspace);
  await records(page);
  await page
    .getByRole("button", { name: "纠正2号提名3号", exact: true })
    .click();
  const form = page.getByRole("form", { name: "纠正提名记录", exact: true });
  await expect(form).toContainText("私密");
  await form.getByLabel("实际被提名人", { exact: true }).selectOption("4");
  await form.getByRole("checkbox", { name: reviewLabel, exact: true }).check();
  await form.getByRole("button", { name: "保存提名纠正", exact: true }).click();
  await close(page);
  await page.getByRole("button", { name: "高级推理", exact: true }).click();
  const transcript = await exportJson<PublicTranscript>(page, "公开导出");
  expect(transcript.schemaVersion).toBe(4);
  expect(transcript.events.some((e) => e.payload.kind === "vote")).toBe(false);
  expect(transcript.events.some((e) => e.correctsEventId === f.source.id)).toBe(
    true,
  );
});

test("workspace changes invalidate an open action correction and its vote review", async ({
  page,
}) => {
  await page.goto("/");
  await importGame(page, fixture().workspace);
  await records(page);
  await page
    .getByRole("button", { name: "纠正2号提名3号", exact: true })
    .click();
  const form = page.getByRole("form", { name: "纠正提名记录", exact: true });
  await form.getByLabel("实际被提名人", { exact: true }).selectOption("4");
  await form.getByRole("checkbox", { name: reviewLabel, exact: true }).check();
  await page
    .getByRole("region", { name: "D1记录", exact: true })
    .getByRole("button", { name: "前往N2", exact: true })
    .click();
  await expect(form).toContainText("记录或前提已变化");
  await expect(
    form.getByRole("button", { name: "保存提名纠正", exact: true }),
  ).toBeDisabled();
  await expect(
    form.getByRole("checkbox", { name: reviewLabel, exact: true }),
  ).toBeDisabled();
  await form.getByRole("button", { name: "取消纠正", exact: true }).click();
});
