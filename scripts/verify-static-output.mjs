import fs from "node:fs";
import { indexNowKey, indexNowKeyFile } from "../indexnow/config.mjs";

const required = ["out/index.html", "out/games.html", "out/guides.html", "out/sitemap.xml", "out/robots.txt", "out/_headers", `out/${indexNowKeyFile}`];
const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length) {
  console.error(`Missing static outputs: ${missing.join(", ")}`);
  process.exit(1);
}

const forbiddenSitemaps = ["out/sitemap-index.xml", "out/sitemap-0.xml"].filter((file) => fs.existsSync(file));
if (forbiddenSitemaps.length) {
  console.error(`Unexpected sitemap outputs: ${forbiddenSitemaps.join(", ")}`);
  process.exit(1);
}

const games = JSON.parse(fs.readFileSync("data/games/games.json", "utf8")).filter((game) => game.status === "published");
const guides = fs.readdirSync("data/guides")
  .filter((file) => file.endsWith(".json"))
  .map((file) => JSON.parse(fs.readFileSync(`data/guides/${file}`, "utf8")))
  .filter((guide) => guide.status === "published");
const origin = fs.readFileSync("src/config/site.ts", "utf8").match(/origin:\s*"([^"]+)"/)?.[1];
if (!origin) {
  console.error("Could not read the canonical origin from site configuration.");
  process.exit(1);
}

const staticPaths = ["/", "/games", "/guides", "/privacy", "/terms", "/copyright", "/about", "/contact"];
const expectedUrls = [
  ...staticPaths.map((route) => `${origin}${route}`),
  ...games.map((game) => `${origin}/games/${game.slug}`),
  ...guides.map((guide) => `${origin}/guides/${guide.slug}`),
];
const sitemap = fs.readFileSync("out/sitemap.xml", "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const sitemapDates = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]);
const sitemapFrequencies = [...sitemap.matchAll(/<changefreq>([^<]+)<\/changefreq>/g)].map((match) => match[1]);
const sitemapPriorities = [...sitemap.matchAll(/<priority>([^<]+)<\/priority>/g)].map((match) => Number(match[1]));
const sitemapErrors = [];
for (const url of expectedUrls) {
  if (sitemapUrls.filter((entry) => entry === url).length !== 1) sitemapErrors.push(`Expected one sitemap entry for ${url}`);
}
for (const url of sitemapUrls) {
  if (!expectedUrls.includes(url)) sitemapErrors.push(`Unexpected sitemap entry ${url}`);
}
if (sitemapDates.length !== expectedUrls.length || sitemapDates.some((date) => !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(date))) {
  sitemapErrors.push("Every sitemap URL must have one valid lastmod value.");
}
if (sitemapFrequencies.length !== expectedUrls.length || sitemapFrequencies.some((value) => !["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"].includes(value))) {
  sitemapErrors.push("Every sitemap URL must have one valid changefreq value.");
}
if (sitemapPriorities.length !== expectedUrls.length || sitemapPriorities.some((value) => !Number.isFinite(value) || value < 0 || value > 1)) {
  sitemapErrors.push("Every sitemap URL must have one priority value between 0 and 1.");
}
if (sitemapErrors.length) {
  console.error(sitemapErrors.join("\n"));
  process.exit(1);
}

const robots = fs.readFileSync("out/robots.txt", "utf8");
if (!robots.includes(`Sitemap: ${origin}/sitemap.xml`)) {
  console.error("robots.txt does not reference the canonical sitemap.xml.");
  process.exit(1);
}
const headers = fs.readFileSync("out/_headers", "utf8");
if (headers.includes("unsafe-eval")) {
  console.error("Production CSP contains unsafe-eval");
  process.exit(1);
}
if (fs.readFileSync(`out/${indexNowKeyFile}`, "utf8").trim() !== indexNowKey) {
  console.error("The exported IndexNow key file does not match the configured key.");
  process.exit(1);
}
console.log(`Static output audit passed with ${expectedUrls.length} canonical sitemap entries.`);
