import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { publicSiteOrigin, stateRoutes } from "../seo/site-registry.mjs";
import { renderedContent, contentDate, fingerprintVersion, fingerprint, decodeEntities } from "../seo/rendered-content.mjs";
import { assertManifest, iso } from "../indexnow/manifest.mjs";
import { deploymentConfig } from "../indexnow/config.mjs";
import { productionManifest } from "../indexnow/protocol.mjs";

const now = new Date().toISOString();
const origin = publicSiteOrigin();
const stateFile = "seo/page-lastmod.json";
const state = JSON.parse(fs.readFileSync(stateFile, "utf8"));
const output = path.resolve("out");
let production = null;
if (process.env.VERCEL_ENV === "production") {
  if (process.env.VERCEL_PROJECT_ID && process.env.VERCEL_PROJECT_ID !== deploymentConfig.projectId) throw new Error("Production project does not match Krillion");
  const response = await fetch(`${origin}/seo-manifest.json`, { redirect: "error", cache: "no-store", signal: AbortSignal.timeout(20000) });
  if (response.ok) production = productionManifest(await response.json());
  else if (response.status === 404) {
    const sitemap = await fetch(`${origin}/sitemap.xml`, { redirect: "error", signal: AbortSignal.timeout(20000) });
    if (!sitemap.ok || !(await sitemap.text()).includes("<urlset")) throw new Error("Cannot verify existing production sitemap during initial manifest migration");
    console.log("Initial manifest migration: retaining existing tracked dates; production manifest not installed yet.");
  } else throw new Error(`Cannot read prior production manifest (${response.status}); refusing to reset dates`);
}
const priorByUrl = new Map((production?.entries ?? []).map((entry) => [entry.canonicalUrl, { fingerprint: entry.contentFingerprint.replace(/^sha256:/, ""), lastModified: entry.lastModified }]));
const registered = new Map(stateRoutes(state).map((record) => [new URL(record.path, origin).href, record]));
const imageCache = new Map();
const imageHash = (src) => {
  if (!src?.startsWith("/") || src.startsWith("//")) return null;
  const file = path.resolve("public", `.${new URL(src, origin).pathname}`);
  if (!file.startsWith(`${path.resolve("public")}${path.sep}`)) throw new Error("Image escapes public directory");
  if (!imageCache.has(file)) imageCache.set(file, fs.existsSync(file) ? crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex") : null);
  return imageCache.get(file);
};
const main = JSON.parse(fs.readFileSync("data/games/main-game.json", "utf8"));
const games = JSON.parse(fs.readFileSync("data/games/games.json", "utf8"));
const players = new Map([[new URL("/", origin).href, main.player], ...games.map((game) => [new URL(`/games/${game.slug}`, origin).href, game.player])]);
const entries = [];
function visit(directory) {
  for (const file of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, file.name);
    if (file.isDirectory()) visit(target);
    else if (file.name.endsWith(".html") && !["404.html", "_not-found.html"].includes(file.name)) {
      const html = fs.readFileSync(target, "utf8");
      const parsed = renderedContent(html, { imageHash });
      if (!parsed.canonical) throw new Error(`Exported page lacks canonical: ${target}`);
      const record = registered.get(parsed.canonical);
      if (!record) throw new Error(`Unregistered exported canonical ${parsed.canonical}; add its content source to seo/site-registry.mjs`);
      if (players.has(parsed.canonical)) parsed.fingerprint = renderedContent(html, { imageHash, extra: players.get(parsed.canonical) }).fingerprint;
      const lastModified = contentDate({ hash: parsed.fingerprint, old: priorByUrl.get(parsed.canonical), local: record, now, migrating: state.fingerprintVersion !== fingerprintVersion });
      const { awaitingRender: _pending, ...saved } = state[record.group][record.id];
      void _pending;
      state[record.group][record.id] = { ...saved, fingerprint: parsed.fingerprint, lastModified, indexable: parsed.indexable };
      entries.push({ path: record.path, canonicalUrl: parsed.canonical, indexable: parsed.indexable, contentFingerprint: `sha256:${parsed.fingerprint}`, htmlFingerprint: `sha256:${renderedContent(html).fingerprint}`, lastModified: iso(lastModified) });
    }
  }
}
visit(output);
if (new Set(entries.map((entry) => entry.canonicalUrl)).size !== entries.length) throw new Error("Duplicate exported canonical");
for (const url of registered.keys()) if (!entries.some((entry) => entry.canonicalUrl === url)) throw new Error(`Registered page missing from export: ${url}`);
const active = new Set(entries.filter((entry) => entry.indexable).map((entry) => entry.canonicalUrl));
const deletedAt = Object.fromEntries(Object.entries(state.deletedAt ?? {}).map(([route, time]) => [new URL(route, origin).href, time]));
for (const [url, time] of Object.entries(production?.deletedAt ?? {})) deletedAt[url] ??= time;
for (const entry of production?.entries ?? []) if (entry.indexable && !active.has(entry.canonicalUrl)) deletedAt[entry.canonicalUrl] ??= now;
for (const entry of entries) {
  if (entry.indexable) delete deletedAt[entry.canonicalUrl];
  else deletedAt[entry.canonicalUrl] ??= now;
}
entries.sort((a, b) => a.canonicalUrl < b.canonicalUrl ? -1 : a.canonicalUrl > b.canonicalUrl ? 1 : 0);
let commit = process.env.VERCEL_GIT_COMMIT_SHA;
if (!commit) { try { commit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(); } catch { commit = null; } }
const manifest = {
  schemaVersion: 1, fingerprintVersion, siteUrl: origin, generatedAt: now, entries, deletedAt, deletedUrls: Object.keys(deletedAt).sort(),
  release: { environment: process.env.VERCEL_ENV ?? "local", projectId: process.env.VERCEL_PROJECT_ID ?? deploymentConfig.projectId, deploymentId: process.env.VERCEL_DEPLOYMENT_ID ?? null, deploymentHost: process.env.VERCEL_URL ?? null, commit, repository: deploymentConfig.repository, branch: process.env.VERCEL_GIT_COMMIT_REF ?? deploymentConfig.branch },
};
manifest.contentVersion = fingerprint({ entries, deletedAt });
assertManifest(manifest, origin);
const xmlFile = path.join(output, "sitemap.xml");
const xml = fs.readFileSync(xmlFile, "utf8");
const byUrl = new Map(entries.map((entry) => [entry.canonicalUrl, entry]));
const finalized = xml.replace(/<url>\s*([\s\S]*?)<\/url>/g, (block, body) => {
  const url = decodeEntities(body.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? "");
  const entry = byUrl.get(url);
  if (!entry) throw new Error(`Sitemap contains an unknown canonical: ${url}`);
  if (!entry.indexable) return "";
  const value = state[registered.get(url).group][registered.get(url).id].lastModified;
  return block.replace(/<lastmod>[^<]+<\/lastmod>/, `<lastmod>${value}</lastmod>`);
});
if ([...finalized.matchAll(/<loc>/g)].length !== active.size) throw new Error("Sitemap is missing public canonical pages");
state.fingerprintVersion = fingerprintVersion;
state.deletedAt = Object.fromEntries(Object.entries(deletedAt).map(([url, time]) => [new URL(url).pathname, time]));
fs.writeFileSync(stateFile, `${JSON.stringify(state, null, 2)}\n`);
fs.writeFileSync(xmlFile, finalized);
fs.writeFileSync(path.join(output, "seo-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Finalized ${active.size} sitemap URLs from rendered content; ${Object.keys(deletedAt).length} deletion events retained.`);
