import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { chromium } from "@playwright/test";

const slugs = [
  "slope-2",
  "tap-road",
  "curve-rush",
  "snow-road",
  "head-basketball",
  "chill-guy-clicker",
  "escape-road",
  "moto-x3m",
  "basket-random",
  "sugar-sugar",
  "suika-game",
  "trap-the-cat",
];
const root = path.resolve("reports/azgames-discovery");
fs.mkdirSync(root, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const rows = [];

for (const slug of slugs) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  const record = { slug, pageUrl: `https://azgames.io/${slug}`, embedUrl: null, ogImage: null, frames: [], changed: false, errors: [] };
  try {
    await page.goto(record.pageUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await page.waitForTimeout(4_000);
    const pageData = await page.evaluate(() => ({
      ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute("content") ?? null,
      embedUrl: document.querySelector("iframe")?.getAttribute("src") ?? null,
      heading: document.querySelector("h1")?.textContent?.trim() ?? null,
    }));
    Object.assign(record, pageData);
    if (!record.embedUrl) throw new Error("No iframe found");
    await page.goto(new URL(record.embedUrl, record.pageUrl).href, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await page.waitForTimeout(6_000);
    const before = await page.screenshot({ path: path.join(root, `${slug}-before.png`) });
    await page.mouse.click(640, 365);
    await page.waitForTimeout(10_000);
    const after = await page.screenshot({ path: path.join(root, `${slug}-after.png`) });
    const hash = (buffer) => crypto.createHash("sha256").update(buffer).digest("hex");
    record.changed = hash(before) !== hash(after);
    record.frames = page.frames().map((frame) => frame.url());
    record.embedTitle = await page.title();
  } catch (error) {
    record.failure = String(error);
  }
  record.errors = [...new Set(errors)].filter((item) => !/favicon/i.test(item));
  rows.push(record);
  await context.close();
}

await browser.close();
fs.writeFileSync(path.join(root, "results.json"), `${JSON.stringify(rows, null, 2)}\n`);
