import fs from "node:fs";
import { chromium } from "@playwright/test";

const slugs = [
  "slope",
  "cookie-clicker",
  "basketball-stars",
  "paper-io",
  "2048",
  "temple-run-2",
  "drift-boss",
  "smash-karts",
];
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const results = [];

for (const slug of slugs) {
  const context = await browser.newContext({ viewport: { width: 1365, height: 768 } });
  const page = await context.newPage();
  const responses = [];
  page.on("response", (response) => {
    const type = response.request().resourceType();
    if (["document", "image"].includes(type)) responses.push({ type, status: response.status(), url: response.url() });
  });
  await page.goto(`https://azgames.io/${slug}`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(8_000);
  const data = await page.evaluate(() => ({
    title: document.title,
    ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute("content") ?? null,
    twitterImage: document.querySelector('meta[name="twitter:image"]')?.getAttribute("content") ?? null,
    iframes: [...document.querySelectorAll("iframe")].map((node) => ({
      src: node.getAttribute("src"),
      title: node.getAttribute("title"),
      width: node.getAttribute("width"),
      height: node.getAttribute("height"),
    })),
    inputs: [...document.querySelectorAll("input")]
      .map((node) => ({ type: node.type, value: node.value, placeholder: node.placeholder }))
      .filter((item) => /embed|iframe|https?:/i.test(`${item.value} ${item.placeholder}`)),
    images: [...document.images].map((node) => ({
      src: node.currentSrc || node.src,
      alt: node.alt,
      width: node.naturalWidth,
      height: node.naturalHeight,
      renderedWidth: Math.round(node.getBoundingClientRect().width),
      renderedHeight: Math.round(node.getBoundingClientRect().height),
    })).filter((item) => item.width >= 200 && item.height >= 100),
  }));
  results.push({ slug, pageUrl: page.url(), ...data, documents: responses.filter((item) => item.type === "document") });
  await context.close();
}

await browser.close();
fs.writeFileSync("research/azgames-candidate-assets.json", `${JSON.stringify(results, null, 2)}\n`);
