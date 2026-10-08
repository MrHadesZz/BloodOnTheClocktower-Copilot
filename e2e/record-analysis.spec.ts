import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import {
  addStandardHypothesis,
  commitStandardDrafts,
  commitStandardEntry,
  createStandardBranch,
  createStandardWorkspace,
  toggleStandardHypothesis,
  type PublicTranscript,
  type StandardWorkspace,
} from "../src/core/standardWorkspace";
import { closeStandardPhase } from "../src/core/standardHistory";
import { eventLabel, type GameTime, type Role } from "../src/core/model";

type Kind = "death" | "nomination" | "vote";
function fixture(kind: Kind = "death", secret = false) {
  const roles: Role[] =
    kind === "vote"
      ? [
          "Slayer",
          "Chef",
          "Monk",
          "Undertaker",
          "Virgin",
          "Recluse",
          "Saint",
          "Spy",
          "Imp",
        ]
      : [
          "Slayer",
          "Chef",
          "Monk",
          "Fortune Teller",
          "Soldier",
          "Poisoner",
          "Imp",
        ];
  let w = createStandardWorkspace(roles.length);
  for (const [i, role] of roles.entries()) {
    w = addStandardHypothesis(w, { kind: "actual_role", seat: i + 1, role });
    w = toggleStandardHypothesis(w, w.hypotheses.at(-1)!.id);
  }
  w = closeStandardPhase(w, { phase: "night", cycle: 1 }, true);
  const texts =
    kind === "vote"
      ? ["2 nom 3 @D1", "vote 3 = 1,2,3,4,5 @D1", "1 slay 6 @D1", "6 dead @D1"]
      : [
          "2 nom 3 @D1",
          "vote 3 = 1,2,3,4 @D1",
          `exec ${kind === "nomination" ? 4 : 3} @D1`,
          `${kind === "nomination" ? 4 : 3} dead @D1`,
        ];
  for (const text of texts)
    w = commitStandardEntry(w, text, secret ? "private" : "public");
  w = closeStandardPhase(w, { phase: "day", cycle: 1 }, true);
  if (kind === "death") {
    const text = secret ? "私密教学原文：误把3号写为N2死亡" : "3 dead @N2";
    w = commitStandardDrafts(
      w,
      text,
      [
        {
          payload: { kind: "death", seat: 3 },
          occurredAt: { phase: "night", cycle: 2 },
          label: text,
          sourceSpan: [0, text.length],
        },
      ],
      secret ? "private" : "public",
    );
    w = closeStandardPhase(w, { phase: "night", cycle: 2 }, true);
  }
  const source =
    kind === "death"
      ? w.events.find(
          (e) => e.payload.kind === "death" && e.occurredAt?.phase === "night",
        )!
      : w.events.find((e) => e.payload.kind === kind)!;
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
  w = createStandardBranch(w, "单条来源试查");
  w = {
    ...w,
    title: "单处误录试查示例",
    recordingTime: source.occurredAt as GameTime,
  };
  return {
    workspace: w,
    source,
    parentId,
    editingId: w.activeBranchId,
    phase: kind === "death" ? "N2" : "D1",
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
    name: "record-analysis.json",
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
async function analyze(page: Page, expected: string) {
  await page.getByRole("button", { name: "一键分析", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "声称分析结果", exact: true }),
  ).toContainText(expected, { timeout: 35000 });
}
async function inspectSource(page: Page, f: ReturnType<typeof fixture>) {
  await analyze(page, "对局事件或手动前提有冲突");
  const audit = page.getByRole("region", {
    name: "固定事实阶段核对",
    exact: true,
  });
  await audit
    .getByRole("button", { name: "核对固定事实", exact: true })
    .click();
  await expect(audit).toContainText(`最早确认冲突的阶段：${f.phase}`, {
    timeout: 35000,
  });
  const summary = audit.getByText(`回看${eventLabel(f.source)} · ${f.phase}`, {
    exact: true,
  });
  await summary.click();
  const source = summary.locator("..");
  await source
    .getByRole("button", { name: "试查单处误录", exact: true })
    .click();
  return page.getByRole("region", {
    name: `单处误录试查：${eventLabel(f.source)}`,
    exact: true,
  });
}
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
}
const alternativeLabel = (kind: Kind) =>
  kind === "death"
    ? /死亡玩家：3号 → 4号/
    : kind === "nomination"
      ? /被提名人：3号 → 4号/
      : /举手名单：移除1号/;

for (const width of [1440, 390])
  for (const kind of ["death", "nomination", "vote"] as const) {
    test(`${kind} hypothetical source, unchanged export, manual correction and offline recovery at ${width}px`, async ({
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
      await page.getByRole("button", { name: "高级推理", exact: true }).click();
      const before = await exportJson<StandardWorkspace>(page, "私密全量导出");
      const publicBefore = await exportJson<PublicTranscript>(page, "公开导出");
      await (
        await menu(page)
      )
        .getByRole("button", { name: "返回魔典", exact: true })
        .click();
      let trial = await inspectSource(page, f);
      const alternative = trial.locator(".gr-record-alternative").filter({
        has: page.getByRole("heading", { name: alternativeLabel(kind) }),
      });
      await expect(alternative).toBeVisible({ timeout: 30000 });
      await expect(trial).toContainText("原完整背景已确认冲突");
      await expect(trial).toContainText("本次试查不修改对局");
      if (kind === "nomination")
        await expect(trial).toContainText("关联投票保留举手名单");
      await alternative.getByText(/查看候选\d+的兼容见证/).click();
      await expect(alternative).toContainText("初始真实角色分配");
      await alternative
        .getByText("查看这组可能的隐藏行动", { exact: true })
        .click();
      await expect(alternative).toContainText("N1：");
      const shots = process.env.RECORD_ANALYSIS_SCREENSHOT_DIR;
      if (shots) {
        await alternative.scrollIntoViewIfNeeded();
        await page.screenshot({
          path: `${shots}/record-analysis-${kind}-${width}.png`,
        });
      }
      expect(
        await page
          .locator("dialog")
          .evaluate((el) => el.scrollWidth <= el.clientWidth),
      ).toBe(true);
      await trial
        .getByRole("button", { name: "前往原记录核对", exact: true })
        .click();
      const original = page.locator(`[id="gr-history-${f.source.id}"]`);
      await expect(original).toBeFocused();
      await expect(
        page.getByRole("region", { name: `${f.phase}记录`, exact: true }),
      ).toContainText("本阶段已确认完整");
      await close(page);
      await page.getByRole("button", { name: "高级推理", exact: true }).click();
      expect(await exportJson<StandardWorkspace>(page, "私密全量导出")).toEqual(
        before,
      );
      expect(await exportJson<PublicTranscript>(page, "公开导出")).toEqual(
        publicBefore,
      );
      await (
        await menu(page)
      )
        .getByRole("button", { name: "返回魔典", exact: true })
        .click();
      await page.getByRole("button", { name: "记录", exact: true }).click();
      await original
        .getByRole("button", {
          name: `纠正${eventLabel(f.source)}`,
          exact: true,
        })
        .click();
      if (kind === "death") {
        const form = page.getByRole("form", {
          name: "纠正死亡记录",
          exact: true,
        });
        await form
          .getByLabel("实际死亡玩家", { exact: true })
          .selectOption("4");
        await form
          .getByRole("button", { name: "保存死亡纠正", exact: true })
          .click();
      } else if (kind === "nomination") {
        const form = page.getByRole("form", {
          name: "纠正提名记录",
          exact: true,
        });
        await form
          .getByLabel("实际被提名人", { exact: true })
          .selectOption("4");
        await form
          .getByRole("checkbox", {
            name: "我已核对以上关联投票，同意保留举手名单并重新关联",
            exact: true,
          })
          .check();
        await form
          .getByRole("button", { name: "保存提名纠正", exact: true })
          .click();
      } else {
        const form = page.getByRole("form", { name: "纠正投票", exact: true });
        await form
          .getByRole("checkbox", { name: "1号", exact: true })
          .uncheck();
        await form
          .getByRole("button", { name: "保存投票纠正", exact: true })
          .click();
      }
      await confirm(page, f.phase);
      await close(page);
      await analyze(page, "已录声称可以同时成立");
      await close(page);
      if (kind === "nomination") {
        await page.getByRole("button", { name: "推理", exact: true }).click();
        await page
          .getByLabel("推理分支", { exact: true })
          .selectOption(f.parentId);
        await close(page);
        trial = await inspectSource(page, f);
        await expect(
          trial.locator(".gr-record-alternative").filter({
            has: page.getByRole("heading", { name: alternativeLabel(kind) }),
          }),
        ).toBeVisible({ timeout: 30000 });
        await expect(trial).toContainText(`修订${f.workspace.events.length}`);
        await trial
          .getByRole("button", { name: "前往原记录核对", exact: true })
          .click();
        await expect(
          original.getByRole("button", {
            name: `纠正${eventLabel(f.source)}`,
            exact: true,
          }),
        ).toBeDisabled();
        await close(page);
        await page.getByRole("button", { name: "推理", exact: true }).click();
        await page
          .getByLabel("推理分支", { exact: true })
          .selectOption(f.editingId);
        await close(page);
      }
      await page.getByRole("button", { name: "高级推理", exact: true }).click();
      const full = await exportJson<StandardWorkspace>(page, "私密全量导出");
      if (process.env.PLAYWRIGHT_OFFLINE === "1") {
        await expect(page.locator(".session small")).toContainText(
          "离线资源已就绪",
          { timeout: 30000 },
        );
        await context.setOffline(true);
      }
      await page.reload();
      expect(await exportJson<StandardWorkspace>(page, "私密全量导出")).toEqual(
        full,
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
  test(`private source trials preserve full and public export at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto("/");
    const f = fixture("death", true);
    await importGame(page, f.workspace);
    await page.getByRole("button", { name: "高级推理", exact: true }).click();
    const before = await exportJson<StandardWorkspace>(page, "私密全量导出");
    const publicBefore = await exportJson<PublicTranscript>(page, "公开导出");
    await (
      await menu(page)
    )
      .getByRole("button", { name: "返回魔典", exact: true })
      .click();
    const trial = await inspectSource(page, f);
    await expect(trial.locator(".gr-record-alternative").first()).toBeVisible({
      timeout: 30000,
    });
    await expect(page.locator("dialog")).toContainText("私密教学原文");
    await close(page);
    await page.getByRole("button", { name: "高级推理", exact: true }).click();
    expect(await exportJson<StandardWorkspace>(page, "私密全量导出")).toEqual(
      before,
    );
    expect(await exportJson<PublicTranscript>(page, "公开导出")).toEqual(
      publicBefore,
    );
  });

test("a bounded real trial retains its witness and clearly leaves unchecked candidates unknown", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const NativeWorker = window.Worker;
    window.Worker = class extends NativeWorker {
      postMessage(message: unknown, options?: StructuredSerializeOptions) {
        const request = message as { kind?: string; options?: object };
        super.postMessage(
          request.kind === "record_analysis"
            ? { ...request, options: { ...request.options, maxChecks: 2 } }
            : message,
          options,
        );
      }
    };
  });
  await page.goto("/");
  const f = fixture();
  await importGame(page, f.workspace);
  const trial = await inspectSource(page, f);
  await expect(trial).toContainText("试查达到时间或检查次数预算", {
    timeout: 30000,
  });
  await expect(trial).toContainText("试查未完成");
  await expect(trial.locator(".gr-record-alternative")).toHaveCount(1);
  await expect(trial).toContainText("单处替代1/6");
});

test("cancel keeps real candidate evidence and a changed premise mode discards stale trials", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const NativeWorker = window.Worker;
    window.Worker = class extends NativeWorker {
      postMessage(message: unknown, options?: StructuredSerializeOptions) {
        const request = message as { kind?: string; options?: object };
        if (request.kind === "record_analysis") {
          const receive = this.onmessage;
          this.onmessage = (event) => {
            if (event.data.result === undefined) receive?.call(this, event);
          };
          super.postMessage(
            { ...request, options: { ...request.options, maxChecks: 2 } },
            options,
          );
        } else super.postMessage(message, options);
      }
    };
  });
  await page.goto("/");
  const f = fixture();
  await importGame(page, f.workspace);
  const trial = await inspectSource(page, f);
  await expect(trial.locator(".gr-record-alternative")).toHaveCount(1, {
    timeout: 30000,
  });
  await trial
    .getByRole("button", { name: "取消记录试查", exact: true })
    .click();
  await expect(trial).toContainText("已取消试查，已验证的候选保留");
  await expect(trial.locator(".gr-record-alternative")).toHaveCount(1);
  await page
    .getByRole("checkbox", {
      name: "保留当前分支的手动前提（后续信息在对应阶段才参与检查）",
      exact: true,
    })
    .uncheck();
  await expect(trial).toHaveCount(0);
  await expect(page.getByLabel("阶段核对结果", { exact: true })).toHaveCount(0);
});
