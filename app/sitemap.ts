import type { MetadataRoute } from "next";
import lastmod from "@/seo/page-lastmod.json";
import { stateRoutes } from "@/seo/site-registry.mjs";
import { absoluteUrl } from "@/src/lib/url-policy";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const hints = (path: string): { changeFrequency: "daily" | "weekly" | "monthly" | "yearly"; priority: number } => {
    if (path === "/") return { changeFrequency: "daily", priority: 1 };
    if (path === "/krillion-answers-today") return { changeFrequency: "daily", priority: 0.9 };
    if (path === "/krillion-unlimited") return { changeFrequency: "monthly", priority: 0.9 };
    if (path === "/games" || path === "/guides") return { changeFrequency: "weekly", priority: 0.9 };
    if (path.startsWith("/games/")) return { changeFrequency: "weekly", priority: 0.8 };
    if (path.startsWith("/guides/")) return { changeFrequency: "monthly", priority: 0.8 };
    if (path.startsWith("/krillion-answers-today/")) return { changeFrequency: "monthly", priority: 0.7 };
    if (path === "/about") return { changeFrequency: "monthly", priority: 0.5 };
    if (path === "/contact") return { changeFrequency: "yearly", priority: 0.4 };
    return { changeFrequency: "yearly", priority: 0.3 };
  };
  return stateRoutes(lastmod).map((record) => ({ url: absoluteUrl(record.path), lastModified: record.lastModified, ...hints(record.path) }));
}
