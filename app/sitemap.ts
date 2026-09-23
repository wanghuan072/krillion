import type { MetadataRoute } from "next";
import { getAllPublishedGames, getMainGame } from "@/src/lib/data/game-loader";
import { getAllPublishedGuides } from "@/src/lib/data/guide-loader";
import { absoluteUrl, gamePath, guidePath } from "@/src/lib/url-policy";
import lastmod from "@/seo/page-lastmod.json";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  getMainGame();
  const staticPages = [
    { path: "/games", changeFrequency: "weekly", priority: 0.9 },
    { path: "/guides", changeFrequency: "weekly", priority: 0.9 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
    { path: "/copyright", changeFrequency: "yearly", priority: 0.3 },
    { path: "/about", changeFrequency: "monthly", priority: 0.5 },
    { path: "/contact", changeFrequency: "yearly", priority: 0.4 },
  ] as const;
  const dateFor = (record: { lastModified?: string } | undefined, path: string) => {
    if (!record?.lastModified) throw new Error(`Missing sitemap last-modified state for ${path}`);
    return record.lastModified;
  };
  const entries = [
    { url: absoluteUrl("/"), lastModified: dateFor(lastmod.staticPages["/"], "/"), changeFrequency: "daily" as const, priority: 1 },
    ...staticPages.map(({ path, changeFrequency, priority }) => ({ url: absoluteUrl(path), lastModified: dateFor(lastmod.staticPages[path], path), changeFrequency, priority })),
    ...getAllPublishedGames().map((game) => ({ url: absoluteUrl(gamePath(game.slug)), lastModified: dateFor(lastmod.games[game.id as keyof typeof lastmod.games], gamePath(game.slug)), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...getAllPublishedGuides().map((guide) => ({ url: absoluteUrl(guidePath(guide.slug)), lastModified: dateFor(lastmod.guides[guide.id as keyof typeof lastmod.guides], guidePath(guide.slug)), changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
  if (new Set(entries.map((entry) => entry.url)).size !== entries.length) throw new Error("Duplicate sitemap canonical");
  return entries;
}
