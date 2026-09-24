import fs from "node:fs";
import { chromium } from "@playwright/test";

const games = JSON.parse(fs.readFileSync("data/games/games.json", "utf8"));
const guides = fs.readdirSync("data/guides").filter((file) => file.endsWith(".json")).map((file) => JSON.parse(fs.readFileSync(`data/guides/${file}`, "utf8")));
const targets = [
  ...games.map((game) => ({ id: game.id, path: `/games/${game.slug}`, expectsVideo: true })),
  ...guides.map((guide) => ({ id: guide.id, path: `/guides/${guide.slug}`, expectsVideo: Boolean(guide.videoHeading) })),
];
const baseURL = process.env.TEST_BASE_URL ?? "http://127.0.0.1:4173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
for (const target of targets) {
  const page = await browser.newPage({ viewport: { width: 768, height: 900 } });
  await page.goto(`${baseURL}${target.path}`, { waitUntil: "domcontentloaded" });
  const play = page.getByRole("button", { name: new RegExp(`^Play video:`, "i") });
  if (!target.expectsVideo) {
    results.push({ id: target.id, posterSrc: null, src: null, loadedUrl: null, title: "", status: "no-video-by-design" });
    await page.close();
    continue;
  }
  await play.scrollIntoViewIfNeeded();
  const posterSrc = await play.locator("img").getAttribute("src");
  await play.click();
  const player = page.locator("iframe[src*='youtube-nocookie.com/embed/']");
  await page.waitForTimeout(3_000);
  const frame = page.frames().find((candidate) => candidate.url().includes("youtube-nocookie.com/embed/"));
  results.push({ id: target.id, posterSrc, src: await player.getAttribute("src"), loadedUrl: frame?.url() ?? null, title: frame ? await frame.title().catch(() => "") : "", status: "verified" });
  await page.close();
}
await browser.close();
fs.writeFileSync("reports/video-embed-audit.json", `${JSON.stringify(results, null, 2)}\n`);
console.log(results);
