import { fingerprintVersion, fingerprint } from "../seo/rendered-content.mjs";

export const iso = (value) => new Date(value).toISOString();

export function assertManifest(manifest, origin) {
  if (manifest?.schemaVersion !== 1 || manifest.fingerprintVersion !== fingerprintVersion || manifest.siteUrl !== origin || !Array.isArray(manifest.entries) || !Number.isFinite(Date.parse(manifest.generatedAt))) throw new Error("Invalid or incompatible production SEO manifest");
  const seen = new Set();
  for (const entry of manifest.entries) {
    const url = new URL(entry.canonicalUrl);
    if (url.origin !== origin || url.username || url.password || url.hash || url.search || url.pathname !== entry.path || seen.has(url.href) || typeof entry.indexable !== "boolean" || !/^sha256:[a-f0-9]{64}$/.test(entry.contentFingerprint) || !Number.isFinite(Date.parse(entry.lastModified)) || Date.parse(entry.lastModified) > Date.parse(manifest.generatedAt)) throw new Error(`Invalid manifest entry: ${entry.path}`);
    seen.add(url.href);
  }
  const active = new Set(manifest.entries.filter((entry) => entry.indexable).map((entry) => entry.canonicalUrl));
  for (const [url, time] of Object.entries(manifest.deletedAt ?? {})) {
    const parsed = new URL(url);
    if (parsed.origin !== origin || parsed.username || parsed.password || parsed.hash || parsed.search || active.has(url) || !Number.isFinite(Date.parse(time)) || Date.parse(time) > Date.parse(manifest.generatedAt)) throw new Error("Invalid or active deletion event");
  }
  if (JSON.stringify([...(manifest.deletedUrls ?? [])].sort()) !== JSON.stringify(Object.keys(manifest.deletedAt ?? {}).sort())) throw new Error("Deletion URLs and event versions disagree");
  return manifest;
}

export function mergeObservations(current, observations = [], checkpoint = null) {
  const active = new Set(current.entries.filter((entry) => entry.indexable).map((entry) => entry.canonicalUrl));
  const deletedAt = { ...(checkpoint?.deletedAt ?? {}) };
  for (const [url, time] of Object.entries(current.deletedAt ?? {})) if (!deletedAt[url] || Date.parse(time) > Date.parse(deletedAt[url])) deletedAt[url] = time;
  for (const observed of observations) {
    for (const [url, time] of Object.entries(observed.deletedAt ?? {})) if (!deletedAt[url] || Date.parse(time) > Date.parse(deletedAt[url])) deletedAt[url] = time;
    // Callers supply only versions not covered by the acknowledged checkpoint.
    // A late deployment event may describe a build older than that checkpoint.
    for (const entry of observed.entries.filter((entry) => entry.indexable)) if (!active.has(entry.canonicalUrl)) deletedAt[entry.canonicalUrl] = current.generatedAt;
  }
  for (const entry of checkpoint?.entries ?? []) if (entry.indexable && !active.has(entry.canonicalUrl) && !deletedAt[entry.canonicalUrl]) deletedAt[entry.canonicalUrl] = current.generatedAt;
  for (const url of active) delete deletedAt[url];
  return { ...current, deletedAt, deletedUrls: Object.keys(deletedAt).sort(), contentVersion: fingerprint({ entries: current.entries, deletedAt }) };
}

export function changedUrls(previous, current) {
  assertManifest(current, current.siteUrl);
  if (previous) {
    assertManifest(previous, current.siteUrl);
    if (Date.parse(previous.generatedAt) > Date.parse(current.generatedAt)) throw new Error("The published version predates the notification checkpoint; rebuild a rollback before notifying");
  }
  const old = new Map((previous?.entries ?? []).filter((entry) => entry.indexable).map((entry) => [entry.canonicalUrl, entry]));
  const active = new Set(current.entries.filter((entry) => entry.indexable).map((entry) => entry.canonicalUrl));
  const changed = new Set(current.entries.filter((entry) => entry.indexable && old.get(entry.canonicalUrl)?.contentFingerprint !== entry.contentFingerprint).map((entry) => entry.canonicalUrl));
  for (const url of old.keys()) if (!active.has(url)) changed.add(url);
  for (const [url, time] of Object.entries(current.deletedAt ?? {})) if (!previous?.deletedAt?.[url] || Date.parse(time) > Date.parse(previous.deletedAt[url])) changed.add(url);
  return [...changed].sort();
}
