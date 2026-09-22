import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const main = JSON.parse(fs.readFileSync("data/games/main-game.json", "utf8"));
const games = JSON.parse(fs.readFileSync("data/games/games.json", "utf8"));
const all = [main, ...games];
const root = path.resolve("public/images/games");
fs.mkdirSync(root, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];
for (const game of all) {
  const dir = path.join(root, game.slug);
  fs.mkdirSync(dir, { recursive: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const row = { gameId: game.id, url: game.player.iframeSrc, captures: [], notes: [] };
  try {
    await page.goto(game.player.iframeSrc, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(7000);
    const acceptCookies = async () => { for (const label of ["Accept All Cookies", "Accept all cookies", "I agree", "Accept"]) {
      const button = page.getByText(label, { exact: true }).first();
      if (await button.isVisible().catch(() => false)) {
        await button.click({ timeout: 3000 }).catch(() => {});
        row.notes.push(`clicked ${label}`);
        await page.waitForTimeout(2500);
        return true;
      }
    } return false; };
    await acceptCookies();
    const shot = async (name) => {
      const target = path.join(dir, name);
      await page.screenshot({ path: target, type: "webp", quality: 84, fullPage: false });
      row.captures.push(target.replaceAll("\\", "/"));
    };
    if (game.id !== "krillion") {
      await page.mouse.click(640, 390);
      await page.waitForTimeout(3500);
      if (await acceptCookies()) { await page.mouse.click(640, 390); await page.waitForTimeout(6500); }
      else await page.waitForTimeout(3500);
    }
    await shot("cover.webp");
    if (game.id === "krillion") {
      await page.getByText(/begin descent/i).first().click().catch(() => page.mouse.click(640, 600));
      await page.waitForTimeout(1800); await shot("gameplay-1.webp");
      await page.locator('input').first().fill('octopus').catch(() => page.keyboard.type('octopus'));
      await page.waitForTimeout(700); await shot("gameplay-2.webp");
      await page.keyboard.press('Enter').catch(()=>{}); await page.waitForTimeout(1800); await shot("gameplay-3.webp");
    } else {
      const startY = game.id === "guess-their-answer" ? 620 : 560;
      await page.mouse.click(640, startY); await page.waitForTimeout(3500); await shot("gameplay-1.webp");
      if (game.id === "guess-their-answer" || game.id === "text-twist-2") {
        await page.mouse.click(640, 500); await page.keyboard.type(game.id === "guess-their-answer" ? "Alex" : "cat", {delay:80}).catch(()=>{}); await page.keyboard.press('Enter').catch(()=>{});
      } else {
        await page.mouse.move(520, 520); await page.mouse.down(); await page.mouse.move(640, 440,{steps:8}); await page.mouse.move(740,520,{steps:8}); await page.mouse.up();
      }
      await page.waitForTimeout(2200); await shot("gameplay-2.webp");
      await page.mouse.click(760, 580); await page.waitForTimeout(2200); await shot("gameplay-3.webp");
    }
    row.title = await page.title();
  } catch (error) {
    row.notes.push(String(error));
  }
  results.push(row);
  await context.close();
}
await browser.close();
fs.writeFileSync("reports/phase08-capture-results.json", `${JSON.stringify(results, null, 2)}\n`);
