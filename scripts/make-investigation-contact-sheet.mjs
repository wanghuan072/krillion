import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const root = path.resolve(process.argv[2] ?? "reports/gameplay-investigation");
const rows = fs
  .readdirSync(root)
  .filter((name) => fs.statSync(path.join(root, name)).isDirectory())
  .sort();
const encode = (file) => `data:image/png;base64,${fs.readFileSync(file).toString("base64")}`;
const cards = rows
  .map((name) => {
    const files = fs.readdirSync(path.join(root, name)).filter((file) => file.endsWith(".png")).sort();
    return `<section><h2>${name}</h2><div class="shots">${files
      .map((file) => `<figure><img src="${encode(path.join(root, name, file))}"><figcaption>${file}</figcaption></figure>`)
      .join("")}</div></section>`;
  })
  .join("");
const html = `<!doctype html><style>body{margin:0;padding:18px;background:#07131f;color:white;font:15px Arial}section{border-bottom:2px solid #31506b;padding-bottom:18px;margin-bottom:18px}h2{margin:0 0 12px}.shots{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}figure{margin:0;background:#10283b}img{display:block;width:100%;aspect-ratio:16/9;object-fit:contain;background:#000}figcaption{padding:6px}</style>${cards}`;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1500, height: 1200 } });
await page.setContent(html, { waitUntil: "load" });
await page.screenshot({ path: path.join(root, "contact-sheet.png"), fullPage: true });
await browser.close();
