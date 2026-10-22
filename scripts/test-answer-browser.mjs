import { spawnSync } from "node:child_process";

const result = spawnSync(process.execPath, ["node_modules/@playwright/test/cli.js", "test", "--grep", "Krillion topic pages|dated answers keep|answer availability"], {
  stdio: "inherit",
  env: { ...process.env, TEST_STATIC_EXPORT: "1", TEST_BASE_URL: "http://127.0.0.1:4173" },
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
