import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./benchmarks",
  testMatch: "browser-v1.spec.ts",
  workers: 1,
  fullyParallel: false,
  timeout: 180_000,
  reporter: "list",
  outputDir: process.env.BENCH_TEST_OUTPUT ?? "output/v1-browser-results",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4173",
    launchOptions: process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
      : {},
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run preview -- --host 127.0.0.1 --port 4173 --strictPort",
        url: "http://127.0.0.1:4173",
        reuseExistingServer: true,
      },
});
