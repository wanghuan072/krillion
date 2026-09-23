import path from "node:path";
import { chromium } from "@playwright/test";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const viewport = { width: 1280, height: 720 };
const screenshot = async (page, id) => page.screenshot({ path: path.resolve("public/images/games", id, "cover.webp"), type: "webp", quality: 88 });

for (const target of [
  { id: "fun-typing-io", url: "https://azgames.io/upload/imgs/funtypingio2.png" },
  { id: "cheat-or-repeat", url: "https://azgames.io/upload/imgs/cheatorrepeat1.png" },
]) {
  const page = await browser.newPage({ viewport });
  await page.goto(target.url, { waitUntil: "load", timeout: 60_000 });
  const image = page.locator("img");
  await image.evaluate((element) => {
    document.documentElement.style.background = "#07131f";
    document.body.style.margin = "0";
    element.style.width = "1280px";
    element.style.height = "720px";
    element.style.objectFit = "cover";
  });
  await screenshot(page, target.id);
  await page.close();
}

for (const target of [
  { id: "wordle-game", url: "https://azgames.io/game/wordlegame/", guesses: ["crane", "sloth"] },
  { id: "growdle", url: "https://azgames.io/game/__dgame/growdle/", close: "#how-to-play-close-button", guesses: ["bed", "cat"] },
  { id: "quardle", url: "https://azgames.io/game/quardle/", guesses: ["1", "crane", "2", "sloth"] },
]) {
  const page = await browser.newPage({ viewport });
  await page.goto(target.url, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(1_500);
  if (target.close) await page.locator(target.close).click({ force: true }).catch(() => {});
  for (const guess of target.guesses) {
    await page.keyboard.type(guess, { delay: 60 });
    await page.keyboard.press("Enter").catch(() => {});
    await page.waitForTimeout(800);
  }
  await screenshot(page, target.id);
  await page.close();
}

{
  const page = await browser.newPage({ viewport });
  await page.goto("https://azgames.io/game/quardle/", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(1_200);
  const guesses = [["1", "crane"], ["2", "sloth"], ["3", "bumpy"]];
  for (const [index, [number, word]] of guesses.entries()) {
    await page.keyboard.press(number);
    await page.keyboard.type(word, { delay: 60 });
    await page.keyboard.press("Enter");
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.resolve("public/images/games/quardle", `gameplay-${index + 1}.webp`), type: "webp", quality: 88 });
  }
  await page.close();
}

{
  const page = await browser.newPage({ viewport });
  await page.goto("https://azgames.io/game/wafflegame/", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(1_500);
  await page.locator(".help .button--close").first().click({ force: true }).catch(() => {});
  const tiles = page.locator(".daily--active .tile.draggable:not(.green)");
  if (await tiles.count() >= 2) await tiles.nth(0).dragTo(tiles.nth(1)).catch(() => {});
  await page.waitForTimeout(1_000);
  await screenshot(page, "waffle");
  await page.close();
}

await browser.close();
