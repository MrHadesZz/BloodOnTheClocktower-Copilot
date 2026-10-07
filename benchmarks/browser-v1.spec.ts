import { test, expect, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { benchmarkFixtures, summarize } from "./v1-fixtures";
import { replayObservedWitness } from "../src/core/observedTimeline";
import type {
  ObservedQueryInput,
  SetupQueryResult,
} from "../src/core/symbolicSetup";

const repetitions = Number(process.env.BENCH_REPETITIONS ?? 3);
const budgetMs = Number(process.env.BENCH_BUDGET_MS ?? 2000);
if (!Number.isInteger(repetitions) || repetitions < 1 || repetitions > 100)
  throw new RangeError("Invalid repetitions");
const cells: object[] = [];
const evidence: object[] = [];
const boundaries: object[] = [];

async function runWorker(
  page: Page,
  input: ObservedQueryInput,
  deadline: number,
) {
  return page.evaluate(
    async ({ input, deadline }) => {
      const began = performance.now();
      return new Promise<{
        elapsedMs: number;
        result?: SetupQueryResult;
        error?: string;
      }>((resolve) => {
        const worker = new Worker("/z3/worker-host.js?v=v1-benchmark");
        const requestId = crypto.randomUUID();
        const finish = (payload: {
          result?: SetupQueryResult;
          error?: string;
        }) => {
          clearTimeout(timer);
          worker.terminate();
          resolve({ ...payload, elapsedMs: performance.now() - began });
        };
        const timer = setTimeout(
          () => finish({ error: "external Worker timeout" }),
          deadline,
        );
        worker.onmessage = (event) => {
          if (event.data.requestId === requestId && !event.data.progress)
            finish(event.data);
        };
        worker.onerror = (event) => finish({ error: event.message });
        worker.postMessage({ requestId, kind: "observed_query", input });
      });
    },
    { input, deadline },
  );
}

test.afterAll(() => {
  const oracle = spawnSync(
    process.env.PYTHON ?? "python3",
    ["reference/v1_oracle.py", "--check-witnesses"],
    {
      input: JSON.stringify(evidence),
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    },
  );
  expect(oracle.error).toBeUndefined();
  expect(oracle.status, oracle.stderr).toBe(0);
  const verdicts = JSON.parse(oracle.stdout) as Array<{
    id: string;
    errors: string[];
  }>;
  expect(verdicts).toHaveLength(evidence.length);
  expect(verdicts.filter((v) => v.errors.length)).toEqual([]);
  expect(cells).toHaveLength(36);
  expect(boundaries).toHaveLength(6);
  const output =
    process.env.BENCH_OUTPUT ?? "output/v1-performance-browser.json";
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(
    output,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        runtime: "Chromium cold Worker per request",
        budgetMs,
        repetitions,
        independentlyReplayedWitnesses: evidence.length,
        boundaries,
        note: "Viewport geometry only, no mobile device/CPU emulation. Synthetic samples, nearest-rank P95; includes Worker/WASM startup. Medium/dense hold the same six identity facts fixed; remaining roles stay hidden. No full V1 release claim.",
        cells,
      },
      null,
      2,
    ),
  );
});
for (const width of [1440, 390]) {
  for (const fixture of benchmarkFixtures(budgetMs)) {
    test(`${width}px ${fixture.id}`, async ({ page, browser }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      await page.goto("/");
      await expect(page).toHaveTitle(/钟楼/);
      expect(await page.evaluate(() => crossOriginIsolated)).toBe(true);
      const samples = [];
      for (let repeat = 0; repeat < repetitions; repeat++) {
        const sample = await runWorker(page, fixture.input, budgetMs + 5000);
        expect(sample.error).toBeUndefined();
        const result = sample.result!;
        expect(["necessary", "contingent", "unknown"]).toContain(
          result.classification,
        );
        for (const [side, witness] of [
          ["yes", result.yes],
          ["no", result.no],
        ] as const) {
          if (!witness) continue;
          expect(
            replayObservedWitness(witness, fixture.input, fixture.input).valid,
          ).toBe(true);
          evidence.push({
            id: `${width}-${fixture.id}-${repeat}-${side}`,
            request: fixture.input,
            witness,
          });
        }
        samples.push({
          elapsedMs: sample.elapsedMs,
          classification: result.classification,
          unknownReason: result.unknownReason,
        });
      }
      const cell = {
        id: fixture.id,
        width,
        playerCount: fixture.playerCount,
        density: fixture.density,
        nights: fixture.nights,
        browser: browser.version(),
        ...summarize(samples),
        rawSamples: samples,
      };
      cells.push(cell);
      if (fixture.density === "sparse" && fixture.nights === 3) {
        const boundary = await runWorker(
          page,
          { ...fixture.input, timeoutMs: 100, maxWorlds: 1, maxHistories: 1 },
          budgetMs + 5000,
        );
        expect(boundary.error).toBeUndefined();
        expect(boundary.result?.classification).toBe("unknown");
        boundaries.push({
          id: fixture.id,
          width,
          elapsedMs: boundary.elapsedMs,
          classification: boundary.result!.classification,
          unknownReason: boundary.result!.unknownReason,
          maxWorlds: 1,
          maxHistories: 1,
          timeoutMs: 100,
        });
      }
      expect(errors).toEqual([]);
      console.log(
        `${width}px ${fixture.id}: P95=${cell.p95Ms.toFixed(1)}ms unknown=${(cell.unknownRate * 100).toFixed(0)}%`,
      );
    });
  }
}
