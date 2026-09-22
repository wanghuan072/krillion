import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { chromium } from "@playwright/test";

const games = [
  { id: "slope", title: "Slope", og: "/upload/imgs/slope.png" },
  { id: "2048", title: "2048", og: "/upload/imgs/2048.jpg" },
  { id: "curve-rush", title: "Curve Rush", og: "/upload/imgs/curverush2.png" },
  { id: "tap-road", title: "Tap Road", og: "/upload/imgs/taproad.jpg" },
  { id: "head-basketball", title: "Head Basketball", og: "/upload/imgs/headbasketball.png" },
  { id: "escape-road", title: "Escape Road", og: "/upload/imgs/escaperoad.png" },
  { id: "trap-the-cat", title: "Trap the Cat", og: "/upload/imgs/trap-the-cat.jpg" },
  { id: "suika-game", title: "Suika Game", og: "/upload/imgs/suikagame.png" },
];
const selected = process.argv.slice(2);
const targets = selected.length ? games.filter((game) => selected.includes(game.id)) : games;
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const results = [];

for (const game of targets) {
  const directory = path.resolve("public/images/games", game.id);
  fs.mkdirSync(directory, { recursive: true });
  const coverUrl = new URL(game.og, "https://azgames.io").href;
  const coverExtension = path.extname(new URL(coverUrl).pathname).toLowerCase();
  const coverPath = path.join(directory, `cover${coverExtension}`);
  const response = await fetch(coverUrl);
  if (!response.ok) throw new Error(`${game.id} cover download failed: ${response.status}`);
  fs.writeFileSync(coverPath, Buffer.from(await response.arrayBuffer()));

  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  const errors = [];
  const failed = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("requestfailed", (request) => failed.push(`${request.resourceType()} ${request.url()} ${request.failure()?.errorText ?? ""}`));
  await page.goto(`https://azgames.io/${game.id}.embed`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(6_000);
  await page.mouse.click(640, 365);
  await page.waitForTimeout(10_000);

  const captures = [];
  const capture = async (name) => {
    const file = path.join(directory, name);
    await page.screenshot({ path: file, type: "webp", quality: 86 });
    captures.push({
      file: file.replaceAll("\\", "/"),
      hash: crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"),
    });
  };
  const hold = async (key, milliseconds = 800) => {
    await page.keyboard.down(key);
    await page.waitForTimeout(milliseconds);
    await page.keyboard.up(key);
  };

  if (game.id === "slope") {
    await page.mouse.click(640, 410);
    await page.waitForTimeout(3_000);
    await capture("gameplay-1.webp");
    await hold("ArrowLeft");
    await capture("gameplay-2.webp");
    await hold("ArrowRight");
    await capture("gameplay-3.webp");
  } else if (game.id === "2048") {
    await capture("gameplay-1.webp");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(800);
    await capture("gameplay-2.webp");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(800);
    await capture("gameplay-3.webp");
  } else if (game.id === "curve-rush") {
    await page.mouse.click(640, 450);
    await page.waitForTimeout(3_000);
    await capture("gameplay-1.webp");
    await page.mouse.down();
    await page.waitForTimeout(1_000);
    await capture("gameplay-2.webp");
    await page.mouse.up();
    await page.waitForTimeout(1_000);
    await capture("gameplay-3.webp");
  } else if (game.id === "tap-road") {
    await capture("gameplay-1.webp");
    await page.mouse.click(640, 500);
    await page.waitForTimeout(900);
    await capture("gameplay-2.webp");
    await page.keyboard.press("Space");
    await page.waitForTimeout(900);
    await capture("gameplay-3.webp");
  } else if (game.id === "head-basketball") {
    await page.mouse.click(640, 310);
    await page.waitForTimeout(3_000);
    await capture("gameplay-1.webp");
    await page.mouse.click(640, 520);
    await page.waitForTimeout(3_000);
    await capture("gameplay-2.webp");
    await hold("d", 1_200);
    await page.keyboard.press("b");
    await page.waitForTimeout(1_000);
    await capture("gameplay-3.webp");
  } else if (game.id === "escape-road") {
    await page.keyboard.press("a");
    await page.waitForTimeout(3_000);
    await capture("gameplay-1.webp");
    await hold("ArrowLeft", 1_000);
    await capture("gameplay-2.webp");
    await hold("ArrowRight", 1_000);
    await capture("gameplay-3.webp");
  } else if (game.id === "trap-the-cat") {
    await capture("gameplay-1.webp");
    await page.mouse.click(590, 265);
    await page.waitForTimeout(700);
    await capture("gameplay-2.webp");
    await page.mouse.click(370, 120);
    await page.waitForTimeout(700);
    await capture("gameplay-3.webp");
  } else if (game.id === "suika-game") {
    await capture("gameplay-1.webp");
    await page.mouse.click(590, 120);
    await page.waitForTimeout(1_500);
    await capture("gameplay-2.webp");
    await page.mouse.click(690, 120);
    await page.waitForTimeout(1_500);
    await capture("gameplay-3.webp");
  }

  const imagePage = await context.newPage();
  await imagePage.goto(coverUrl, { waitUntil: "load", timeout: 30_000 });
  const coverSize = await imagePage.locator("img").first().evaluate((image) => ({ width: image.naturalWidth, height: image.naturalHeight }));
  await imagePage.close();
  results.push({
    id: game.id,
    title: game.title,
    pageUrl: `https://azgames.io/${game.id}`,
    iframeSrc: `https://azgames.io/${game.id}.embed`,
    coverUrl,
    coverPath: coverPath.replaceAll("\\", "/"),
    coverSize,
    frameUrls: page.frames().map((frame) => frame.url()),
    uniqueCaptureCount: new Set(captures.map((item) => item.hash)).size,
    captures,
    errors: [...new Set(errors)].filter((item) => !/favicon|analytics|doubleclick|googlesyndication|id5-sync|headerlift/i.test(item)),
    failed: [...new Set(failed)].filter((item) => !/analytics|doubleclick|googlesyndication|id5-sync|headerlift|blob:/i.test(item)),
  });
  await context.close();
}

await browser.close();
fs.writeFileSync("reports/azgames-final-media-results.json", `${JSON.stringify(results, null, 2)}\n`);
