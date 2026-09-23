import type { MetadataRoute } from "next";
import { getAllPublishedGames, getMainGame } from "@/src/lib/data/game-loader";
import { getAllPublishedGuides } from "@/src/lib/data/guide-loader";
import { absoluteUrl, gamePath, guidePath } from "@/src/lib/url-policy";
import lastmod from "@/seo/page-lastmod.json";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  getMainGame();
  const staticPaths = ["/games","/guides","/privacy","/terms","/copyright","/about","/contact"];
  const dateFor = (record: { lastModified?: string } | undefined, path: string) => {
    if (!record?.lastModified) throw new Error(`Missing sitemap last-modified state for ${path}`);
    return record.lastModified;
  };
  const entries = [
    { url: absoluteUrl("/"), lastModified: dateFor(lastmod.staticPages["/"], "/") },
    ...staticPaths.map((path) => ({ url: absoluteUrl(path), lastModified: dateFor(lastmod.staticPages[path as keyof typeof lastmod.staticPages], path) })),
    ...getAllPublishedGames().map((game) => ({ url: absoluteUrl(gamePath(game.slug)), lastModified: dateFor(lastmod.games[game.id as keyof typeof lastmod.games], gamePath(game.slug)) })),
    ...getAllPublishedGuides().map((guide) => ({ url: absoluteUrl(guidePath(guide.slug)), lastModified: dateFor(lastmod.guides[guide.id as keyof typeof lastmod.guides], guidePath(guide.slug)) })),
  ];
  if (new Set(entries.map((entry) => entry.url)).size !== entries.length) throw new Error("Duplicate sitemap canonical");
  return entries;
}
