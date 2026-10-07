import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { cpus, platform, release } from "node:os";
import { spawnSync } from "node:child_process";
import {
  queryObservedTimeline,
  queryInitialSetup,
  OBSERVED_TIMELINE_RULESET_HASH,
} from "../src/core/symbolicSetup";
import { replayObservedWitness } from "../src/core/observedTimeline";
import { benchmarkFixtures, summarize } from "./v1-fixtures";

const repetitions = Number(process.env.BENCH_REPETITIONS ?? 5);
const budgetMs = Number(process.env.BENCH_BUDGET_MS ?? 2000);
if (
  !Number.isInteger(repetitions) ||
  repetitions < 1 ||
  repetitions > 100 ||
  !Number.isInteger(budgetMs) ||
  budgetMs < 100 ||
  budgetMs > 10000
)
  throw new RangeError(
    "BENCH_REPETITIONS must be 1–100; BENCH_BUDGET_MS must be 100–10000.",
  );
const start = performance.now();
await queryInitialSetup({
  playerCount: 7,
  facts: [],
  query: { seat: 1, role: "Imp" },
});
const initializationMs = performance.now() - start;
const evidence: object[] = [];
const cells = [];
const fixtures = benchmarkFixtures(budgetMs);
for (const fixture of fixtures) {
  const samples = [];
  for (let repeat = 0; repeat < repetitions; repeat++) {
    const began = performance.now();
    const result = await queryObservedTimeline(fixture.input);
    const elapsedMs = performance.now() - began;
    // Every fixture has a known legal witness with the queried seat as Imp.
    if (["inconsistent", "impossible"].includes(result.classification))
      throw new Error(`${fixture.id}: a known legal world was excluded`);
    for (const [side, witness] of [
      ["yes", result.yes],
      ["no", result.no],
    ] as const) {
      if (!witness) continue;
      const replay = replayObservedWitness(
        witness,
        fixture.input,
        fixture.input,
      );
      if (!replay.valid)
        throw new Error(`${fixture.id}: ${replay.errors.join("; ")}`);
      evidence.push({
        id: `${fixture.id}-${repeat}-${side}`,
        request: fixture.input,
        witness,
      });
    }
    samples.push({
      elapsedMs,
      classification: result.classification,
      unknownReason: result.unknownReason,
      inspectedCandidates: result.inspectedCandidates,
    });
  }
  const cell = {
    id: fixture.id,
    playerCount: fixture.playerCount,
    density: fixture.density,
    nights: fixture.nights,
    roleFacts: fixture.input.facts.length,
    reports:
      (fixture.input.reports?.length ?? 0) +
      (fixture.input.laterReports?.length ?? 0),
    ...summarize(samples),
    rawSamples: samples,
  };
  cells.push(cell);
  console.log(
    `${cell.id}: P50=${cell.p50Ms.toFixed(1)}ms P95=${cell.p95Ms.toFixed(1)}ms unknown=${(cell.unknownRate * 100).toFixed(0)}%`,
  );
}
const boundaries = [];
for (const fixture of fixtures.filter(
  (f) => f.density === "sparse" && f.nights === 3,
)) {
  const began = performance.now();
  const result = await queryObservedTimeline({
    ...fixture.input,
    timeoutMs: 100,
    maxWorlds: 1,
    maxHistories: 1,
  });
  if (result.classification !== "unknown")
    throw new Error(`${fixture.id}: exhausted search must remain unknown`);
  boundaries.push({
    id: fixture.id,
    elapsedMs: performance.now() - began,
    classification: result.classification,
    unknownReason: result.unknownReason,
    maxWorlds: 1,
    maxHistories: 1,
    timeoutMs: 100,
  });
}
const oracle = spawnSync(
  process.env.PYTHON ?? "python3",
  ["reference/v1_oracle.py", "--check-witnesses"],
  {
    input: JSON.stringify(evidence),
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  },
);
if (oracle.error || oracle.status !== 0)
  throw new Error(oracle.stderr || String(oracle.error));
const verdicts = JSON.parse(oracle.stdout) as Array<{
  id: string;
  errors: string[];
}>;
if (
  verdicts.length !== evidence.length ||
  verdicts.some((v) => v.errors.length)
)
  throw new Error(
    `Independent witness audit failed: ${JSON.stringify(verdicts.filter((v) => v.errors.length))}`,
  );
const output = process.env.BENCH_OUTPUT ?? "output/v1-performance-node.json";
mkdirSync(dirname(output), { recursive: true });
writeFileSync(
  output,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      rulesetHash: OBSERVED_TIMELINE_RULESET_HASH,
      runtime: {
        kind: "node-warm",
        node: process.version,
        os: `${platform()} ${release()}`,
        cpu: cpus()[0]?.model,
      },
      budgetMs,
      repetitions,
      initializationMs,
      independentlyReplayedWitnesses: evidence.length,
      boundaries,
      note: "Synthetic fixtures; nearest-rank percentiles over small samples. Medium/dense hold the same six identity facts fixed; other roles remain hidden. Sparse leaves all identities unknown. Excludes worker startup and mobile hardware. No full V1 release claim.",
      cells,
    },
    null,
    2,
  ),
);
console.log(
  `Saved ${output}; ${evidence.length} witnesses independently replayed.`,
);
