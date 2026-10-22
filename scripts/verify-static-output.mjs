import fs from "node:fs";
import { indexNowKey, indexNowKeyFile } from "../indexnow/config.mjs";
import { readAnswerArchive, answerPath } from "./lib/daily-answers.mjs";
import { assertManifest } from "../indexnow/manifest.mjs";
import { stateRoutes } from "../seo/site-registry.mjs";
import { renderedContent } from "../seo/rendered-content.mjs";

const required = ["out/index.html", "out/krillion-unlimited.html", "out/krillion-answers-today.html", "out/games.html", "out/guides.html", "out/sitemap.xml", "out/seo-manifest.json", "out/robots.txt", "out/_headers", `out/${indexNowKeyFile}`];
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

const origin = fs.readFileSync("src/config/site.ts", "utf8").match(/origin:\s*"([^"]+)"/)?.[1];
if (!origin) {
  console.error("Could not read the canonical origin from site configuration.");
  process.exit(1);
}

const state = JSON.parse(fs.readFileSync("seo/page-lastmod.json", "utf8"));
const manifest = assertManifest(JSON.parse(fs.readFileSync("out/seo-manifest.json", "utf8")), origin);
const registered = stateRoutes(state);
if (manifest.entries.length !== registered.length) throw new Error("Manifest and public registry disagree");
for (const record of registered) {
  const entry = manifest.entries.find((item) => item.path === record.path);
  if (!entry || entry.contentFingerprint !== `sha256:${record.fingerprint}` || Date.parse(entry.lastModified) !== Date.parse(record.lastModified)) throw new Error(`Manifest differs from saved state: ${record.path}`);
  const file = record.path === "/" ? "out/index.html" : `out${record.path}.html`;
  const parsed = renderedContent(fs.readFileSync(file, "utf8"));
  if (parsed.canonical !== entry.canonicalUrl || parsed.indexable !== entry.indexable || `sha256:${parsed.fingerprint}` !== entry.htmlFingerprint) throw new Error(`Export differs from manifest: ${record.path}`);
}
const expectedUrls = manifest.entries.filter((entry) => entry.indexable).map((entry) => entry.canonicalUrl);
for (const dive of readAnswerArchive()) {
  const file = `out${answerPath(dive.date)}.html`;
  if (!fs.existsSync(file)) throw new Error(`Missing daily answer output: ${file}`);
  const html = fs.readFileSync(file, "utf8");
  if (!html.includes(`<title>${dive.seo.title.replaceAll("&", "&amp;")}</title>`)) throw new Error(`Wrong dated metadata in ${file}`);
  if (!html.includes(`href="${origin}${answerPath(dive.date)}"`)) throw new Error(`Missing dated canonical in ${file}`);
  if (!html.includes(dive.questions[0].prompt.replaceAll("&", "&amp;").replaceAll("'", "&#x27;").replaceAll('"', "&quot;"))) throw new Error(`Missing question text in ${file}`);
}
const sitemap = fs.readFileSync("out/sitemap.xml", "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const sitemapDates = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]);
const sitemapFrequencies = [...sitemap.matchAll(/<changefreq>([^<]+)<\/changefreq>/g)].map((match) => match[1]);
const sitemapPriorities = [...sitemap.matchAll(/<priority>([^<]+)<\/priority>/g)].map((match) => Number(match[1]));
const sitemapErrors = [];
for (const match of sitemap.matchAll(/<url>\s*([\s\S]*?)<\/url>/g)) {
  const url = match[1].match(/<loc>([^<]+)<\/loc>/)?.[1];
  const date = match[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
  if (Date.parse(date) !== Date.parse(manifest.entries.find((entry) => entry.canonicalUrl === url)?.lastModified)) sitemapErrors.push(`Sitemap date differs from manifest: ${url}`);
}
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
