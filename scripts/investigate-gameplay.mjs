import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const games = JSON.parse(fs.readFileSync("data/games/games.json", "utf8"));
const selected = process.argv.slice(2);
const targets = selected.length ? games.filter((game) => selected.includes(game.id)) : games;
const outputRoot = path.resolve("reports/gameplay-direct");
fs.mkdirSync(outputRoot, { recursive: true });

const browser = await chromium.launch({ headless: true, channel: "chrome" });
const results = [];

for (const game of targets) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  const directory = path.join(outputRoot, game.id);
  fs.mkdirSync(directory, { recursive: true });
  const events = [];
  page.on("console", (message) => {
    if (message.type() === "error") events.push(`console: ${message.text()}`);
  });
  context.on("page", (popup) => events.push(`popup: ${popup.url()}`));

  await page.goto(game.player.iframeSrc, { waitUntil: "domcontentloaded", timeout: 45_000 });
  const frame = page;
  await page.waitForTimeout(12_000);

  const clickText = async (patterns) => {
    for (const pattern of patterns) {
      const locator = frame.getByText(pattern, { exact: true }).first();
      if (await locator.isVisible().catch(() => false)) {
        await locator.click({ timeout: 3_000 }).catch(() => {});
        await page.waitForTimeout(1_500);
        return pattern;
      }
    }
    return null;
  };

  const cookie = await clickText([
    "Accept All Cookies",
    "Accept all cookies",
    "Accept Cookies",
    "I agree",
    "Accept",
  ]);

  const shots = [];
  const shot = async (name) => {
    const file = path.join(directory, `${name}.png`);
    await page.screenshot({ path: file });
    shots.push(file.replaceAll("\\", "/"));
  };
  await shot("00-loaded");

  if (game.id === "animal-quiz") {
    await clickText(["Start"]);
    await page.waitForTimeout(6_000);
    await shot("01-start");
  }
  if (game.id === "word-search-classic") {
    for (const [text, label] of [["Quick Game", "01-quick-game"], ["Romance", "02-category"], ["Level 1", "03-level-one"]]) {
      await clickText([text]);
      await page.waitForTimeout(3_000);
      await shot(label);
    }
  }

  const sequences = {
    "guess-their-answer": [
      [640, 605, 8_000, "01-play"],
      [640, 530, 7_000, "02-match"],
      [640, 665, 2_000, "03-field"],
    ],
    "words-of-wonders": [
      [640, 685, 6_000, "01-play"],
      [640, 470, 2_000, "02-tutorial"],
      [540, 520, 1_500, "03-letter"],
    ],
    "word-detector": [
      [640, 490, 4_000, "01-play"],
      [740, 315, 3_000, "02-consent"],
      [640, 490, 4_000, "03-after-consent"],
      [640, 560, 2_000, "04-input"],
    ],
    "word-search-classic": [],
    "text-twist-2": [
      [465, 565, 6_000, "01-timed"],
      [540, 615, 1_500, "02-letter-one"],
      [600, 615, 1_500, "03-letter-two"],
    ],
    "animal-quiz": [
      [560, 475, 2_000, "02-answer"],
      [640, 475, 2_000, "03-answer"],
    ],
    "sweet-hangman": [
      [640, 600, 2_500, "01-start"],
      [815, 165, 35_000, "02-food-ad-wait"],
      [1240, 25, 8_000, "04-close-ad"],
      [520, 650, 2_000, "05-letter"],
    ],
    "word-bird": [
      [640, 455, 4_000, "01-start"],
      [640, 560, 2_000, "02-dismiss"],
      [350, 360, 2_000, "03-board"],
    ],
  };

  for (const [x, y, wait, label] of sequences[game.id] ?? []) {
    await page.mouse.click(x, y);
    await page.waitForTimeout(wait);
    await clickText(["Accept Cookies", "Accept All Cookies", "OK", "Continue"]);
    await shot(label);
  }

  results.push({
    id: game.id,
    cookie,
    frameUrl: await frame.locator("html").evaluate(() => location.href).catch(() => "unavailable"),
    title: await frame.locator("html").evaluate(() => document.title).catch(() => "unavailable"),
    pages: context.pages().length,
    shots,
    events,
  });
  await context.close();
}

await browser.close();
fs.writeFileSync(
  path.join(outputRoot, "results.json"),
  `${JSON.stringify(results, null, 2)}\n`,
);
