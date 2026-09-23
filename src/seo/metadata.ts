import type { Metadata } from "next";
import { siteConfig } from "@/src/config/site";
import { absoluteUrl } from "@/src/lib/url-policy";

type MetadataInput = {
  title: string;
  description: string;
  keywords?: string[];
  path: string;
  type?: "website" | "article";
  publishedTime?: string | null;
  modifiedTime?: string | null;
};

export function buildMetadata(input: MetadataInput): Metadata {
  const url = absoluteUrl(input.path);
  const image = absoluteUrl(siteConfig.socialImage);
  const socialImage = { url: image, width: siteConfig.socialImageWidth, height: siteConfig.socialImageHeight, alt: `${siteConfig.name} gaming guides and daily trivia` };
  const openGraph = input.type === "article"
    ? { title: input.title, description: input.description, url, siteName: siteConfig.name, locale: siteConfig.locale, type: "article" as const, publishedTime: input.publishedTime ?? undefined, modifiedTime: input.modifiedTime ?? undefined, images: [socialImage] }
    : { title: input.title, description: input.description, url, siteName: siteConfig.name, locale: siteConfig.locale, type: "website" as const, images: [socialImage] };
  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    authors: [{ name: siteConfig.publisherName }],
    creator: siteConfig.publisherName,
    publisher: siteConfig.publisherName,
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
    alternates: { canonical: url },
    openGraph,
    twitter: { card: "summary_large_image", title: input.title, description: input.description, images: [{ url: image, alt: socialImage.alt }] },
  };
}
