import type { Metadata } from "next";
import { siteConfig } from "@/src/config/site";
import { absoluteUrl } from "@/src/lib/url-policy";

export function buildMetadata(input: { title: string; description: string; keywords?: string[]; path: string; type?: "website" | "article" }): Metadata {
  const url = absoluteUrl(input.path);
  const image = absoluteUrl(siteConfig.socialImage);
  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: { canonical: url },
    openGraph: { title: input.title, description: input.description, url, siteName: siteConfig.name, locale: siteConfig.locale, type: input.type ?? "website", images: [{ url: image, width: siteConfig.socialImageWidth, height: siteConfig.socialImageHeight }] },
    twitter: { card: "summary_large_image", title: input.title, description: input.description, images: [image] },
  };
}
