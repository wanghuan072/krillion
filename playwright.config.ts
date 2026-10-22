import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  timeout: 45_000,
  use: { baseURL: process.env.TEST_BASE_URL ?? "http://127.0.0.1:4173", channel: "chrome", headless: true, trace: "retain-on-failure" },
  reporter: [["list"]],
});
