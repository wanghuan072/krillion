import { execFileSync } from "node:child_process";
import fs from "node:fs";
import {
  indexNowEndpoint,
  indexNowKey,
  indexNowKeyFile,
  indexNowKeyLocation,
  siteHost,
  siteOrigin,
} from "./config.mjs";

const args = new Set(process.argv.slice(2));
const confirm = args.has("--confirm");
const submitAll = args.has("--all");
const baseRef = process.env.INDEXNOW_BASE_REF || "HEAD^";
const statePath = "seo/page-lastmod.json";

const readJson = (text, label) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Could not parse ${label}: ${error.message}`);
  }
};

const currentState = readJson(fs.readFileSync(statePath, "utf8"), statePath);

function routesFromState(state) {
  const routes = new Map();
  for (const [path, record] of Object.entries(state.staticPages || {})) {
    routes.set(path, record.fingerprint);
  }
  for (const record of Object.values(state.games || {})) {
    routes.set(`/games/${record.slug}`, record.fingerprint);
  }
  for (const record of Object.values(state.guides || {})) {
    routes.set(`/guides/${record.slug}`, record.fingerprint);
  }
  return routes;
}

function readPreviousState() {
  try {
    const text = execFileSync("git", ["show", `${baseRef}:${statePath}`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    return readJson(text, `${baseRef}:${statePath}`);
  } catch {
    return null;
  }
}

function baseHasIndexNowKey() {
  try {
    execFileSync("git", ["cat-file", "-e", `${baseRef}:public/${indexNowKeyFile}`], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

const currentRoutes = routesFromState(currentState);
const previousState = readPreviousState();
const previousRoutes = previousState ? routesFromState(previousState) : new Map();
const firstSetup = !baseHasIndexNowKey();
const changedPaths = new Set();

if (submitAll || firstSetup || !previousState) {
  for (const path of currentRoutes.keys()) changedPaths.add(path);
} else {
  for (const [path, fingerprint] of currentRoutes) {
    if (previousRoutes.get(path) !== fingerprint) changedPaths.add(path);
  }
  for (const path of previousRoutes.keys()) {
    if (!currentRoutes.has(path)) changedPaths.add(path);
  }
}

const urlList = [...changedPaths]
  .map((path) => new URL(path, siteOrigin))
  .filter((url) => url.origin === siteOrigin && !url.search && !url.hash)
  .map((url) => url.href.replace(/\/$/, (match) => (url.pathname === "/" ? match : "")))
  .sort();

const reason = submitAll ? "manual full submission" : firstSetup ? "first IndexNow deployment" : `changes since ${baseRef}`;
console.log(`IndexNow found ${urlList.length} URL(s) for ${reason}.`);
for (const url of urlList) console.log(`  ${url}`);

if (!urlList.length) {
  console.log("No canonical URLs changed; no IndexNow request was sent.");
  process.exit(0);
}
if (!confirm) {
  console.log("Dry run only. Add --confirm to verify production and submit these URLs.");
  process.exit(0);
}

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const decodeXml = (value) => value.replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">");

async function productionIsReady() {
  const [keyResponse, sitemapResponse] = await Promise.all([
    fetch(indexNowKeyLocation, { cache: "no-store" }),
    fetch(`${siteOrigin}/sitemap.xml`, { cache: "no-store" }),
  ]);
  if (!keyResponse.ok || (await keyResponse.text()).trim() !== indexNowKey) return false;
  if (!sitemapResponse.ok) return false;
  const sitemap = await sitemapResponse.text();
  const deployedUrls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => decodeXml(match[1])));
  const expectedUrls = new Set([...currentRoutes.keys()].map((path) => new URL(path, siteOrigin).href.replace(/\/$/, (match) => (path === "/" ? match : ""))));
  return deployedUrls.size === expectedUrls.size && [...expectedUrls].every((url) => deployedUrls.has(url));
}

let ready = false;
for (let attempt = 1; attempt <= 8; attempt += 1) {
  try {
    ready = await productionIsReady();
  } catch (error) {
    console.warn(`Production readiness check ${attempt} failed: ${error.message}`);
  }
  if (ready) break;
  if (attempt < 8) {
    console.log(`Production is not synchronized yet; retrying (${attempt}/8).`);
    await sleep(5000);
  }
}
if (!ready) {
  throw new Error("Production key file or sitemap did not match this deployment; IndexNow was not called.");
}

for (let start = 0; start < urlList.length; start += 10_000) {
  const batch = urlList.slice(start, start + 10_000);
  const response = await fetch(indexNowEndpoint, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: siteHost, key: indexNowKey, keyLocation: indexNowKeyLocation, urlList: batch }),
  });
  if (![200, 202].includes(response.status)) {
    const responseText = (await response.text()).slice(0, 500);
    throw new Error(`IndexNow returned HTTP ${response.status}${responseText ? `: ${responseText}` : ""}`);
  }
  console.log(`IndexNow accepted ${batch.length} URL(s) with HTTP ${response.status}.`);
}

