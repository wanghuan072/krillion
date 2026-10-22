import crypto from "node:crypto";

export const fingerprintVersion = "rendered-content-v1";
export const fingerprint = (value) => crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
export const decodeEntities = (value) => value.replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replaceAll("&quot;", '"').replaceAll("&#x27;", "'").replaceAll("&apos;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&nbsp;", " ").replaceAll("&amp;", "&");
const text = (value) => decodeEntities(value).replace(/\s+/g, " ").trim();

export function attributes(tag) {
  const result = {};
  for (const match of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) result[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4]);
  return result;
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  return value;
}

export function renderedContent(html, { imageHash = () => null, extra = null } = {}) {
  const structuredData = [];
  const withoutScripts = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (_, tag, body) => {
    if (attributes(tag).type === "application/ld+json") structuredData.push(stable(JSON.parse(body)));
    return "";
  });
  const cleaned = withoutScripts.replace(/<!--[\s\S]*?-->/g, "").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
  const links = [...cleaned.matchAll(/<link\b[^>]*>/gi)].map((match) => attributes(match[0]));
  const canonicalHref = links.find((link) => link.rel === "canonical")?.href;
  const canonical = canonicalHref ? new URL(canonicalHref).href : undefined;
  const meta = [...cleaned.matchAll(/<meta\b[^>]*>/gi)].map((match) => attributes(match[0]));
  const indexable = !meta.some((item) => ["robots", "googlebot", "bingbot"].includes(item.name?.toLowerCase()) && /\b(?:noindex|none)\b/i.test(item.content ?? ""));
  const meaningfulMeta = meta.filter((item) => ["description", "keywords"].includes(item.name) || item.property?.startsWith("og:") || item.name?.startsWith("twitter:")).map((item) => [item.name ?? item.property, item.content]);
  const anchors = [...cleaned.matchAll(/<a\b[^>]*>/gi)].map((match) => attributes(match[0])).map((a) => ({ href: a.href, title: a.title, label: a["aria-label"] }));
  const images = [...cleaned.matchAll(/<img\b[^>]*>/gi)].map((match) => attributes(match[0])).map((image) => ({ src: image.src, alt: image.alt, hash: imageHash(image.src) }));
  const media = [...cleaned.matchAll(/<(?:iframe|video|audio|source)\b[^>]*>/gi)].map((match) => attributes(match[0])).map((item) => ({ src: item.src, title: item.title, poster: item.poster }));
  const headings = [...cleaned.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((match) => [match[1], text(match[2].replace(/<[^>]*>/g, " "))]);
  const prose = text(cleaned.replace(/<[^>]*>/g, " ")).replace(/((?:Copyright\s*©?\s*|©\s*))\d{4}/gi, "$1");
  return { canonical, indexable, fingerprint: fingerprint({ prose, meaningfulMeta, anchors, images, media, headings, structuredData, indexable, extra }) };
}

export function contentDate({ hash, old, local, now, migrating = false }) {
  if (old) return old.fingerprint === hash ? old.lastModified : now;
  if (local?.fingerprint === hash && !local.awaitingRender) return local.lastModified;
  if (migrating && local && !local.awaitingRender) return local.lastModified;
  return now;
}
