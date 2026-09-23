import fs from "node:fs";
import path from "node:path";

const root = "out";
const config = fs.readFileSync("src/config/site.ts", "utf8");
const origin = config.match(/origin:\s*"([^"]+)"/)?.[1];
const socialImagePath = config.match(/socialImage:\s*"([^"]+)"/)?.[1];
if (!origin || !socialImagePath) throw new Error("Missing origin or social image in src/config/site.ts");
const socialImage = `${origin}${socialImagePath}`;
const files = [];
const walk = (directory) => {
  for (const name of fs.readdirSync(directory)) {
    const file = path.join(directory, name);
    const stat = fs.statSync(file);
    if (stat.isDirectory()) walk(file);
    else if (name.endsWith(".html") && !name.startsWith("404") && !name.startsWith("_not-found")) files.push(file);
  }
};
walk(root);

const decode = (value) => value.replaceAll("&amp;", "&").replaceAll("&#x27;", "'").replaceAll("&quot;", '"').replace(/<[^>]+>/g, "").trim();
const meta = (html, key, attribute = "name") => html.match(new RegExp(`<meta ${attribute}="${key}" content="([^"]*)"`))?.[1] ?? "";
const errors = [];
const rows = [];

for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  const title = decode(html.match(/<title>(.*?)<\/title>/s)?.[1] ?? "");
  const description = decode(meta(html, "description"));
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? "";
  const ogUrl = meta(html, "og:url", "property");
  const ogImage = meta(html, "og:image", "property");
  const twitterImage = meta(html, "twitter:image");
  const twitterCard = meta(html, "twitter:card");
  const robots = meta(html, "robots");
  const h1 = [...html.matchAll(/<h1\b/g)].length;
  const json = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((match) => {
    try { return JSON.parse(match[1]); } catch { return null; }
  });
  const rel = file.replace(/^out[\\/]/, "").replace(/\\/g, "/").replace(/index\.html$/, "").replace(/\.html$/, "");
  const url = rel ? `${origin}/${rel}` : origin;
  const label = rel || "/";
  if (title.length < 40 || title.length > 60) errors.push(`${label}: title ${title.length}`);
  if (description.length < 140 || description.length > 160) errors.push(`${label}: description ${description.length}`);
  if (h1 !== 1) errors.push(`${label}: h1 ${h1}`);
  if (canonical !== url) errors.push(`${label}: canonical ${canonical} != ${url}`);
  if (ogUrl !== canonical) errors.push(`${label}: og:url must match canonical`);
  if (ogImage !== socialImage) errors.push(`${label}: unexpected og:image ${ogImage}`);
  if (twitterImage !== socialImage) errors.push(`${label}: unexpected twitter:image ${twitterImage}`);
  if (twitterCard !== "summary_large_image") errors.push(`${label}: unexpected twitter card ${twitterCard}`);
  if (!robots.includes("index") || !robots.includes("follow")) errors.push(`${label}: page is not index,follow`);
  if (json.some((entry) => entry === null) || json.length < 2) errors.push(`${label}: invalid or insufficient JSON-LD`);
  rows.push({ path: `/${rel}`.replace("//", "/"), title, titleLength: title.length, descriptionLength: description.length, canonical, ogImage, h1, jsonLdScripts: json.length });
}

if (new Set(rows.map((row) => row.title)).size !== rows.length) errors.push("duplicate titles");
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
fs.writeFileSync("reports/seo-page-inventory.json", `${JSON.stringify(rows, null, 2)}\n`);
console.log(`SEO output audit passed for ${rows.length} indexable pages.`);
