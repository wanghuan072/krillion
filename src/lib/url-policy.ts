import { siteConfig } from "@/src/config/site";

export function sitePath(path: string) {
  if (!path.startsWith("/") || path.startsWith("//")) throw new Error(`Unsafe site path: ${path}`);
  if (path === "/") return path;
  return path.replace(/\/+$/, "").replace(/\/{2,}/g, "/");
}

export function absoluteUrl(path: string) {
  return new URL(sitePath(path), siteConfig.origin).toString();
}

export function gamePath(slug: string) {
  return sitePath(`/games/${slug}`);
}

export function guidePath(slug: string) {
  return sitePath(`/guides/${slug}`);
}
