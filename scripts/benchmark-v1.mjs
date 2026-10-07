import { build } from "esbuild";
import { mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
mkdirSync("output", { recursive: true });
await build({
  entryPoints: ["benchmarks/run-v1.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
  outfile: "output/v1-benchmark-runtime.mjs",
});
const result = spawnSync(
  process.execPath,
  ["output/v1-benchmark-runtime.mjs"],
  { stdio: "inherit", env: process.env },
);
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
