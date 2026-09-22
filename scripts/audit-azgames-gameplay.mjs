import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { chromium } from "@playwright/test";

const slugs = ["slope", "cookie-clicker", "basketball-stars", "paper-io", "2048", "temple-run-2", "drift-boss", "smash-karts"];
const selected = process.argv.slice(2);
const targets = selected.length ? slugs.filter((slug) => selected.includes(slug)) : slugs;
const root = path.resolve("reports/azgames-gameplay");
fs.mkdirSync(root, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const results = [];

for (const slug of targets) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  const directory = path.join(root, slug);
  fs.mkdirSync(directory, { recursive: true });
  const errors = [];
  const failed = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("requestfailed", (request) => failed.push(`${request.resourceType()} ${request.url()} ${request.failure()?.errorText ?? ""}`));
  context.on("page", (popup) => errors.push(`popup ${popup.url()}`));

  await page.goto(`https://azgames.io/${slug}.embed`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(15_000);
  const shot = async (name) => {
    const file = path.join(directory, `${name}.png`);
    await page.screenshot({ path: file });
    return { file: file.replaceAll("\\", "/"), hash: crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex") };
  };
  const shots = [await shot("00-loaded")];

  const steps = {
    slope: [
      { type: "click", x: 640, y: 365, wait: 10_000, label: "01-launch" },
      { type: "key", key: "ArrowLeft", wait: 1_500, label: "02-left" },
      { type: "key", key: "ArrowRight", wait: 1_500, label: "03-right" },
    ],
    "cookie-clicker": [
      { type: "click", x: 640, y: 365, wait: 10_000, label: "01-launch" },
      { type: "click", x: 250, y: 360, wait: 1_500, label: "02-cookie" },
      { type: "click", x: 250, y: 360, wait: 1_500, label: "03-cookie" },
    ],
    "basketball-stars": [
      { type: "click", x: 640, y: 365, wait: 10_000, label: "01-launch" },
      { type: "click", x: 440, y: 360, wait: 3_000, label: "02-mode" },
      { type: "click", x: 640, y: 600, wait: 5_000, label: "03-match" },
      { type: "key", key: "d", wait: 1_500, label: "04-move" },
    ],
    "paper-io": [
      { type: "click", x: 640, y: 365, wait: 10_000, label: "01-launch" },
      { type: "key", key: "ArrowRight", wait: 2_000, label: "02-turn" },
      { type: "key", key: "ArrowDown", wait: 2_000, label: "03-turn" },
    ],
    "2048": [
      { type: "click", x: 640, y: 365, wait: 10_000, label: "01-launch" },
      { type: "key", key: "ArrowLeft", wait: 1_000, label: "01-left" },
      { type: "key", key: "ArrowDown", wait: 1_000, label: "02-down" },
      { type: "key", key: "ArrowRight", wait: 1_000, label: "03-right" },
    ],
    "temple-run-2": [
      { type: "click", x: 640, y: 365, wait: 10_000, label: "01-launch" },
      { type: "key", key: "ArrowUp", wait: 1_500, label: "02-jump" },
      { type: "key", key: "ArrowLeft", wait: 1_500, label: "03-left" },
    ],
    "drift-boss": [
      { type: "click", x: 640, y: 365, wait: 10_000, label: "01-launch" },
      { type: "key", key: "Space", wait: 1_200, label: "02-turn" },
      { type: "key", key: "Space", wait: 1_200, label: "03-turn" },
    ],
    "smash-karts": [
      { type: "click", x: 640, y: 365, wait: 10_000, label: "01-launch" },
      { type: "key", key: "ArrowUp", wait: 2_000, label: "02-drive" },
      { type: "key", key: "ArrowLeft", wait: 2_000, label: "03-steer" },
    ],
  }[slug];

  for (const step of steps) {
    if (step.type === "click") await page.mouse.click(step.x, step.y);
    else await page.keyboard.press(step.key);
    await page.waitForTimeout(step.wait);
    shots.push(await shot(step.label));
  }
  results.push({
    slug,
    pageUrl: page.url(),
    title: await page.title(),
    frameUrls: page.frames().map((frame) => frame.url()),
    changedStates: new Set(shots.map((item) => item.hash)).size,
    shots,
    errors: [...new Set(errors)].filter((item) => !/favicon/i.test(item)),
    failed: [...new Set(failed)],
  });
  await context.close();
}

await browser.close();
fs.writeFileSync(path.join(root, "results.json"), `${JSON.stringify(results, null, 2)}\n`);
