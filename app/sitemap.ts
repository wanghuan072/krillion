import type { MetadataRoute } from "next";
import { getAllPublishedGames, getMainGame } from "@/src/lib/data/game-loader";
import { getAllPublishedGuides } from "@/src/lib/data/guide-loader";
import { absoluteUrl, gamePath, guidePath } from "@/src/lib/url-policy";
import lastmod from "@/seo/page-lastmod.json";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const main = getMainGame();
  const staticPaths = ["/games","/guides","/privacy","/terms","/copyright","/about","/contact"];
  const entries = [
    { url: absoluteUrl("/"), lastModified: main.updatedAt ?? undefined },
    ...staticPaths.map((path) => ({ url: absoluteUrl(path), lastModified: lastmod.staticPages[path as keyof typeof lastmod.staticPages]?.lastModified })),
    ...getAllPublishedGames().map((game) => ({ url: absoluteUrl(gamePath(game.slug)), lastModified: game.updatedAt ?? undefined })),
    ...getAllPublishedGuides().map((guide) => ({ url: absoluteUrl(guidePath(guide.slug)), lastModified: guide.updatedAt ?? undefined })),
  ];
  if (new Set(entries.map((entry) => entry.url)).size !== entries.length) throw new Error("Duplicate sitemap canonical");
  return entries;
}
