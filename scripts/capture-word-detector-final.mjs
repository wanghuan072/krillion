import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const game = JSON.parse(fs.readFileSync("data/games/games.json", "utf8")).find(
  (item) => item.id === "word-detector",
);
const output = path.resolve("public/images/games/word-detector");
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await context.newPage();
await page.goto(game.player.iframeSrc, { waitUntil: "domcontentloaded", timeout: 45_000 });
await page.waitForTimeout(8_000);

await page.screenshot({ path: path.join(output, "gameplay-1.webp"), type: "webp", quality: 84 });
await page.mouse.click(640, 448);
await page.waitForTimeout(5_000);
await page.screenshot({ path: path.join(output, "gameplay-2.webp"), type: "webp", quality: 84 });
await page.mouse.click(640, 400);
await page.waitForTimeout(1_500);
await page.screenshot({ path: path.join(output, "gameplay-3.webp"), type: "webp", quality: 84 });

await browser.close();
