import fs from "node:fs";
import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: true, channel: "chrome" });
const results = [];
for (const viewport of [
  { width: 1464, height: 900 },
  { width: 1024, height: 600 },
  { width: 768, height: 900 },
]) {
  const page = await browser.newPage({ viewport });
  await page.goto("http://127.0.0.1:4173/games/slope", { waitUntil: "networkidle" });
  const rail = page.locator("aside[class*='gameRail']");
  const sample = async (label) => ({
    label,
    scrollY: await page.evaluate(() => Math.round(scrollY)),
    edge: await rail.getAttribute("data-edge"),
    position: await rail.evaluate((node) => getComputedStyle(node).position),
    top: Math.round((await rail.boundingBox()).y),
    bottom: Math.round((await rail.boundingBox()).y + (await rail.boundingBox()).height),
    height: Math.round((await rail.boundingBox()).height),
  });
  const samples = [await sample("top")];
  for (const y of [120, 240, 360, 480, 600, 720, 840, 960]) {
    await page.evaluate((nextY) => scrollTo(0, nextY), y);
    await page.waitForTimeout(80);
    samples.push(await sample(`down-${y}`));
  }
  for (const y of [840, 720, 600, 480, 360, 240, 120]) {
    await page.evaluate((nextY) => scrollTo(0, nextY), y);
    await page.waitForTimeout(80);
    samples.push(await sample(`up-${y}`));
  }
  results.push({ viewport, samples });
  await page.close();
}
await browser.close();
fs.writeFileSync("reports/sticky-rail-results.json", `${JSON.stringify(results, null, 2)}\n`);
