import fs from "node:fs";
import crypto from "node:crypto";
import { chromium } from "@playwright/test";

const allGames = JSON.parse(fs.readFileSync("data/games/games.json", "utf8"));
const games = process.argv[2] ? allGames.filter((game) => game.id === process.argv[2]) : allGames;
const sandbox = games[0].player.sandbox.join(" ");
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const results = [];

for (const game of games) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  const events = [];
  page.on("console", (message) => {
    if (message.type() === "error") events.push(message.text());
  });
  context.on("page", (popup) => events.push(`POPUP ${popup.url()}`));
  const directUrl = `https://play.famobi.com/${game.slug}/A-FAMOBI-COM`;
  await page.setContent(`<iframe title="game" sandbox="${sandbox}" src="${directUrl}" style="border:0;width:100%;height:100%"></iframe>`);
  const iframe = page.locator("iframe");
  await iframe.waitFor({ state: "attached" });
  await page.waitForTimeout(8_000);
  const frame = iframe.contentFrame();
  const before = await iframe.screenshot();
  if (process.argv[2]) fs.writeFileSync(`reports/direct-${game.slug}-before.png`, before);
  const cookie = frame.getByText("Accept All Cookies", { exact: true }).first();
  if (await cookie.isVisible().catch(() => false)) {
    await cookie.click();
    await page.waitForTimeout(1_500);
  }
  const box = await iframe.boundingBox();
  if (box) await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.43);
  await page.waitForTimeout(4_000);
  const after = await iframe.screenshot();
  if (process.argv[2]) fs.writeFileSync(`reports/direct-${game.slug}-after.png`, after);
  const hash = (buffer) => crypto.createHash("sha256").update(buffer).digest("hex");
  results.push({
    id: game.id,
    directUrl,
    liveUrl: await frame.locator("html").evaluate(() => location.href).catch(() => "unavailable"),
    title: await frame.locator("html").evaluate(() => document.title).catch(() => "unavailable"),
    canvasCount: await frame.locator("canvas").count().catch(() => -1),
    changedAfterInput: hash(before) !== hash(after),
    pageCount: context.pages().length,
    blockedPopup: events.some((event) => /Blocked opening|POPUP/.test(event)),
    errors: events.filter((event) => !/favicon/i.test(event)),
  });
  await context.close();
}

await browser.close();
fs.writeFileSync("reports/direct-famobi-embed-results.json", `${JSON.stringify(results, null, 2)}\n`);
