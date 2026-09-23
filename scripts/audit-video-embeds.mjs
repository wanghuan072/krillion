import fs from "node:fs";
import { chromium } from "@playwright/test";

const games = JSON.parse(fs.readFileSync("data/games/games.json", "utf8"));
const baseURL = process.env.TEST_BASE_URL ?? "http://127.0.0.1:4173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
for (const game of games) {
  const page = await browser.newPage({ viewport: { width: 768, height: 900 } });
  await page.goto(`${baseURL}/games/${game.slug}`, { waitUntil: "domcontentloaded" });
  const player = page.locator("iframe[src*='youtube-nocookie.com/embed/']");
  await player.scrollIntoViewIfNeeded();
  await page.waitForTimeout(3_000);
  const frame = page.frames().find((candidate) => candidate.url().includes("youtube-nocookie.com/embed/"));
  results.push({ id: game.id, src: await player.getAttribute("src"), loadedUrl: frame?.url() ?? null, title: frame ? await frame.title().catch(() => "") : "" });
  await page.close();
}
await browser.close();
fs.writeFileSync("reports/video-embed-audit.json", `${JSON.stringify(results, null, 2)}\n`);
console.log(results);
