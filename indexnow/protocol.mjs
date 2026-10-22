import { deploymentConfig, siteOrigin, siteHost, indexNowKey, indexNowKeyLocation, indexNowEndpoint } from "./config.mjs";
import { assertManifest } from "./manifest.mjs";
import { renderedContent, decodeEntities, fingerprint } from "../seo/rendered-content.mjs";

export function trustedTrigger(event, name, repository) {
  if (repository !== deploymentConfig.repository || event.repository?.full_name !== repository) return false;
  if (name === "workflow_dispatch") return true;
  return name === "deployment_status" && event.sender?.login === "vercel[bot]" && event.deployment?.creator?.login === "vercel[bot]" &&
    event.deployment_status?.state === "success" && /^production$/i.test(event.deployment?.environment ?? "");
}

export function deploymentHost(value) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.port || url.pathname !== "/" || url.search || url.hash ||
    !url.hostname.startsWith(`${deploymentConfig.projectName}-`) || !url.hostname.endsWith(deploymentConfig.deploymentSuffix)) throw new Error("Unrecognized Krillion deployment URL");
  return url.hostname;
}

export function productionManifest(value) {
  assertManifest(value, siteOrigin);
  const release = value.release;
  if (release?.environment !== "production" || release.projectId !== deploymentConfig.projectId || release.repository !== deploymentConfig.repository || release.branch !== deploymentConfig.branch ||
    !/^[a-f0-9]{40}$/.test(release.commit ?? "") || !release.deploymentHost || deploymentHost(`https://${release.deploymentHost}`) !== release.deploymentHost ||
    value.contentVersion !== fingerprint({ entries: value.entries, deletedAt: value.deletedAt })) throw new Error("Manifest is not a verified Krillion production build");
  if (value.entries.some((entry) => !/^sha256:[a-f0-9]{64}$/.test(entry.htmlFingerprint ?? ""))) throw new Error("Production manifest is missing HTML fingerprints");
  return value;
}

export const sameRelease = (a, b) => a.contentVersion === b.contentVersion && a.generatedAt === b.generatedAt && a.release.deploymentHost === b.release.deploymentHost && a.release.commit === b.release.commit;

export async function readManifest(origin = siteOrigin, fetcher = fetch) {
  const response = await fetcher(`${origin}/seo-manifest.json`, { redirect: "error", cache: "no-store", signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`Cannot read published SEO manifest (${response.status})`);
  return productionManifest(await response.json());
}

export async function verifyPublished(manifest, urls, fetcher = fetch) {
  const get = (url) => fetcher(url, { redirect: "manual", cache: "no-store", signal: AbortSignal.timeout(20000) });
  const key = await get(indexNowKeyLocation);
  if (key.status !== 200 || !/text\/plain/i.test(key.headers.get("content-type") ?? "") || (await key.text()).trim() !== indexNowKey) throw new Error("Published IndexNow key is not correct public plain text");
  const sitemap = await get(`${siteOrigin}/sitemap.xml`);
  if (sitemap.status !== 200) throw new Error("Published sitemap is unavailable");
  const xml = await sitemap.text();
  const actual = new Map();
  for (const match of xml.matchAll(/<url>\s*([\s\S]*?)<\/url>/g)) {
    const url = decodeEntities(match[1].match(/<loc>([^<]+)<\/loc>/)?.[1] ?? "");
    const date = match[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
    if (actual.has(url) || !date) throw new Error("Duplicate URL or missing date in published sitemap");
    actual.set(url, date);
  }
  const active = new Map(manifest.entries.filter((entry) => entry.indexable).map((entry) => [entry.canonicalUrl, entry]));
  if (actual.size !== active.size || [...actual].some(([url, date]) => !active.has(url) || Date.parse(date) !== Date.parse(active.get(url).lastModified))) throw new Error("Published sitemap does not match the production manifest");
  for (const url of urls) {
    if (new URL(url).origin !== siteOrigin) throw new Error("Non-canonical submission URL");
    const response = await get(url);
    if (active.has(url)) {
      if (response.status !== 200) throw new Error(`Active URL does not return 200: ${url}`);
      const parsed = renderedContent(await response.text());
      if (parsed.canonical !== url || !parsed.indexable || /\bnoindex\b/i.test(response.headers.get("x-robots-tag") ?? "")) throw new Error(`Active URL has the wrong canonical or noindex: ${url}`);
      if (`sha256:${parsed.fingerprint}` !== active.get(url).htmlFingerprint) throw new Error(`Published page content differs from the production manifest: ${url}`);
    } else if (![404, 410].includes(response.status)) {
      if ([301, 308].includes(response.status)) {
        const location = new URL(response.headers.get("location"), url).href;
        if (!active.has(location)) throw new Error(`Deleted URL redirects outside the active registry: ${url}`);
      } else if (response.status === 200) {
        const parsed = renderedContent(await response.text());
        if (parsed.indexable && !/\bnoindex\b/i.test(response.headers.get("x-robots-tag") ?? "")) throw new Error(`Deleted URL still returns indexable 200: ${url}`);
      } else throw new Error(`Deleted URL must return 404/410, noindex, or a canonical permanent redirect: ${url}`);
    }
  }
}

export async function submitBatches(urls, { fetcher = fetch, assertCurrent = async () => {}, pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms)), batchSize = 10000 } = {}) {
  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 10000) throw new Error("Invalid IndexNow batch size");
  for (let start = 0; start < urls.length; start += batchSize) {
    await assertCurrent();
    const body = JSON.stringify({ host: siteHost, key: indexNowKey, keyLocation: indexNowKeyLocation, urlList: urls.slice(start, start + batchSize) });
    let accepted = false;
    for (let attempt = 0; attempt < 4; attempt++) {
      const response = await fetcher(indexNowEndpoint, { method: "POST", redirect: "error", headers: { "content-type": "application/json; charset=utf-8" }, body, signal: AbortSignal.timeout(30000) });
      if ([200, 202].includes(response.status)) { accepted = true; break; }
      if (response.status !== 429 || attempt === 3) throw new Error(`IndexNow rejected batch ${start / batchSize + 1}: HTTP ${response.status}`);
      const retry = response.headers.get("retry-after");
      const seconds = /^\d+$/.test(retry ?? "") ? Number(retry) : Math.max(0, (Date.parse(retry) - Date.now()) / 1000);
      if (Number.isFinite(seconds) && seconds > 10) throw new Error(`IndexNow requests a longer retry (${seconds}s); retry this workflow later`);
      await pause(Math.min(10000, Math.max(1000, (Number.isFinite(seconds) ? seconds : 2 ** attempt) * 1000)));
      await assertCurrent();
    }
    if (!accepted) throw new Error("IndexNow batch was not accepted");
  }
  await assertCurrent();
}
