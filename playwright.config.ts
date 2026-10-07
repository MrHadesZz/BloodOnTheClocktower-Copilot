import { defineConfig, devices } from "@playwright/test";

const deployedURL = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = deployedURL ?? "http://127.0.0.1:4173";
const productionBuild = process.env.PLAYWRIGHT_OFFLINE === "1";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    launchOptions: process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
      : {},
  },
  webServer: deployedURL
    ? undefined
    : {
        command: productionBuild
          ? "npm run preview -- --host 127.0.0.1 --port 4173 --strictPort"
          : "npm run dev -- --host 127.0.0.1 --port 4173 --strictPort",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
