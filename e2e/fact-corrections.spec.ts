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
import { eventLabel, type GameTime, type Role } from "../src/core/model";

function fixture(kind: "death" | "execution" = "death", secret = false) {
  let w = createStandardWorkspace(7);
  const roles: Role[] = [
    "Chef",
    "Empath",
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
  for (const text of [
    "1 nom 3 @D1",
    "vote 3 = 1,2,3,4 @D1",
    kind === "execution" ? "exec 4 @D1" : "exec 3 @D1",
    "3 dead @D1",
  ])
    w = commitStandardEntry(w, text, "public");
  w = closeStandardPhase(w, { phase: "day", cycle: 1 }, true);
  if (secret) {
    const text = "教学私密原文：N2误把三号记为死亡";
    w = commitStandardDrafts(w, text, [
      {
        payload: { kind: "death", seat: 3 },
        occurredAt: { phase: "night", cycle: 2 },
        label: text,
        sourceSpan: [0, text.length],
      },
    ]);
  } else
    w = commitStandardEntry(
      w,
      kind === "death" ? "3 dead @N2" : "4 dead @N2",
      "public",
    );
  w = closeStandardPhase(w, { phase: "night", cycle: 2 }, true);
  const text = "匿名示例：1号声称厨师";
  w = commitStandardDrafts(w, text, [
    {
      payload: { kind: "claim", claimKind: "role", speaker: 1, role: "Chef" },
      occurredAt: { phase: "night", cycle: 1 },
      label: text,
      sourceSpan: [0, text.length],
    },
  ]);
  const source =
    kind === "death"
      ? w.events.find(
          (e) => e.payload.kind === "death" && e.occurredAt?.phase === "night",
        )!
      : w.events.find((e) => e.payload.kind === "execution")!;
  const parentId = w.activeBranchId;
  w = createStandardBranch(w, "事实纠正分支");
  return {
    workspace: {
      ...w,
      title: "死亡与处决纠正示例",
      recordingTime: { phase: "night", cycle: 2 } as GameTime,
    },
    source,
    parentId,
    editingId: w.activeBranchId,
    noun: kind === "death" ? "死亡" : "处决",
    seat: kind === "death" ? 4 : 3,
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
  await (await menu(page)).locator('input[type="file"]').setInputFiles({
    name: "fact-correction.json",
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
  const download = await pending;
  const path = await download.path();
  if (!path) throw new Error("Download missing");
  return JSON.parse(readFileSync(path, "utf8"));
}
const close = (page: Page) =>
  page.getByRole("button", { name: "关闭面板", exact: true }).click();
const records = (page: Page) =>
  page.getByRole("button", { name: "记录", exact: true }).click();
async function confirm(page: Page, phase: string) {
  const section = page.getByRole("region", {
    name: `${phase}记录`,
    exact: true,
  });
  await section
    .getByRole("button", { name: "本阶段记录完整", exact: true })
    .click();
  await section
    .getByRole("checkbox", { name: new RegExp(`我确认${phase}`) })
    .check();
  await section
    .getByRole("button", { name: `确认${phase}记录完整`, exact: true })
    .click();
  await expect(section).toContainText("本阶段已确认完整");
}
async function analyze(page: Page, expected: string) {
  await page.getByRole("button", { name: "一键分析", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "声称分析结果", exact: true }),
  ).toContainText(expected, { timeout: 35000 });
}

for (const width of [1440, 390])
  for (const kind of ["death", "execution"] as const) {
    test(`${kind} source to audited correction, branch protection and offline recovery at ${width}px`, async ({
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
      const phase = kind === "death" ? "N2" : "D1";
      await importGame(page, f.workspace);
      await analyze(page, "对局事件或手动前提有冲突");
      const audit = page.getByRole("region", {
        name: "固定事实阶段核对",
        exact: true,
      });
      await audit
        .getByRole("button", { name: "核对固定事实", exact: true })
        .click();
      await expect(audit).toContainText(`最早确认冲突的阶段：${phase}`, {
        timeout: 35000,
      });
      await audit
        .getByText(`回看${eventLabel(f.source)} · ${phase}`, { exact: true })
        .click();
      await audit
        .getByRole("button", {
          name: `在记录中核对${eventLabel(f.source)}`,
          exact: true,
        })
        .click();
      const originalRow = page.locator(`[id="gr-history-${f.source.id}"]`);
      await expect(originalRow).toBeFocused();
      await originalRow
        .getByRole("button", {
          name: `纠正${eventLabel(f.source)}`,
          exact: true,
        })
        .click();
      let form = originalRow.getByRole("form", {
        name: `纠正${f.noun}记录`,
        exact: true,
      });
      await form
        .getByLabel(`实际${f.noun}玩家`, { exact: true })
        .selectOption(String(f.seat));
      await form.getByRole("button", { name: "取消纠正", exact: true }).click();
      await expect(
        page.getByRole("region", { name: `${phase}记录`, exact: true }),
      ).toContainText("本阶段已确认完整");
      await originalRow
        .getByRole("button", {
          name: `纠正${eventLabel(f.source)}`,
          exact: true,
        })
        .click();
      form = originalRow.getByRole("form", {
        name: `纠正${f.noun}记录`,
        exact: true,
      });
      await form
        .getByLabel(`实际${f.noun}玩家`, { exact: true })
        .selectOption(String(f.seat));
      await form
        .getByRole("button", { name: `保存${f.noun}纠正`, exact: true })
        .click();
      await expect(originalRow).toContainText("已纠正的原记录");
      await expect(
        page.getByRole("region", { name: `${phase}记录`, exact: true }),
      ).not.toContainText("本阶段已确认完整");
      await close(page);
      await analyze(page, "结果未知");
      await close(page);
      await records(page);
      await confirm(page, phase);
      const replacement = page
        .getByRole("region", { name: `${phase}记录`, exact: true })
        .locator(".gr-history-row")
        .filter({
          has: page.getByRole("button", {
            name: kind === "death" ? "纠正4号死亡" : "纠正3号被处决",
            exact: true,
          }),
        });
      await replacement.getByText("回看纠正前原记录", { exact: true }).click();
      await expect(replacement).toContainText(f.source.rawText);
      const directory = process.env.FACT_CORRECTION_SCREENSHOT_DIR;
      if (directory) {
        await replacement.scrollIntoViewIfNeeded();
        await page.screenshot({
          path: `${directory}/fact-correction-${kind}-${width}.png`,
        });
      }
      expect(
        await page
          .locator("dialog")
          .evaluate((el) => el.scrollWidth <= el.clientWidth),
      ).toBe(true);
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
        page
          .getByRole("region", { name: `${phase}记录`, exact: true })
          .getByRole("button", {
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
      expect(exported.schemaVersion).toBe(4);
      expect(exported.events.find((event) => event.id === f.source.id)).toEqual(
        f.source,
      );
      const transcript = await exportJson<PublicTranscript>(page, "公开导出");
      expect(transcript.schemaVersion).toBe(3);
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
  test(`private fact corrections preserve public export and reject damaged imports at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto("/");
    const f = fixture("death", true);
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
      .getByRole("button", { name: "纠正3号死亡", exact: true })
      .last()
      .click();
    const form = page.getByRole("form", { name: "纠正死亡记录", exact: true });
    await expect(form).toContainText("教学私密原文");
    await form.getByLabel("实际死亡玩家", { exact: true }).selectOption("4");
    await form
      .getByRole("button", { name: "保存死亡纠正", exact: true })
      .click();
    await confirm(page, "N2");
    await close(page);
    await page.getByRole("button", { name: "高级推理", exact: true }).click();
    expect(await exportJson<PublicTranscript>(page, "公开导出")).toEqual(
      before,
    );
    const full = await exportJson<StandardWorkspace>(page, "私密全量导出");
    const damaged = structuredClone(full);
    const correction = damaged.events.find((event) => event.correctsEventId)!;
    correction.correctsEventId = correction.id;
    await (await menu(page)).locator('input[type="file"]').setInputFiles({
      name: "damaged-facts.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(damaged)),
    });
    await expect(page.getByRole("alert")).toContainText("事实纠正");
    expect(await exportJson<StandardWorkspace>(page, "私密全量导出")).toEqual(
      full,
    );
  });

test("changing workspace state makes an open fact correction form stale", async ({
  page,
}) => {
  await page.goto("/");
  const f = fixture();
  await importGame(page, f.workspace);
  await records(page);
  await page
    .getByRole("button", { name: "纠正3号死亡", exact: true })
    .last()
    .click();
  const form = page.getByRole("form", { name: "纠正死亡记录", exact: true });
  await form.getByLabel("实际死亡玩家", { exact: true }).selectOption("4");
  await page
    .getByRole("region", { name: "N2记录", exact: true })
    .getByRole("button", { name: "前往D2", exact: true })
    .click();
  await expect(form).toContainText("记录或前提已变化");
  await expect(
    form.getByRole("button", { name: "保存死亡纠正", exact: true }),
  ).toBeDisabled();
  await form.getByRole("button", { name: "取消纠正", exact: true }).click();
});

test("an error before worker evidence recovers once with a real Z3 result", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const NativeWorker = window.Worker;
    const counters = { requests: 0, faults: 0 };
    (
      window as unknown as { recoveryCounters: typeof counters }
    ).recoveryCounters = counters;
    window.Worker = class extends NativeWorker {
      postMessage(message: unknown, options?: StructuredSerializeOptions) {
        if ((message as { kind?: string }).kind === "claim_analysis") {
          counters.requests++;
          if (counters.faults === 0) {
            counters.faults++;
            setTimeout(
              () =>
                this.dispatchEvent(
                  new ErrorEvent("error", {
                    message: "injected worker fault before evidence",
                    cancelable: true,
                  }),
                ),
              0,
            );
            return;
          }
        }
        super.postMessage(message, options);
      }
    };
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await importGame(page, fixture().workspace);
  await analyze(page, "对局事件或手动前提有冲突");
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { recoveryCounters: unknown }).recoveryCounters,
    ),
  ).toEqual({ requests: 2, faults: 1 });
  expect(errors).toEqual([]);
});
