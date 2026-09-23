import { siteConfig } from "@/src/config/site";
import { absoluteUrl } from "@/src/lib/url-policy";

export const websiteSchemaId = `${siteConfig.origin}/#website`;
export const publisherSchemaId = `${siteConfig.origin}/#publisher`;

export function buildWebsiteSchema() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": websiteSchemaId,
      name: siteConfig.name,
      url: absoluteUrl("/"),
      inLanguage: siteConfig.language,
      image: absoluteUrl(siteConfig.socialImage),
      publisher: { "@id": publisherSchemaId },
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": publisherSchemaId,
      name: siteConfig.publisherName,
      url: absoluteUrl("/about"),
    },
  ];
}

export function buildWebPageSchema(input: { name: string; description: string; path: string; type?: "WebPage" | "CollectionPage"; publishedAt?: string | null; updatedAt?: string | null }) {
  const url = absoluteUrl(input.path);
  return {
    "@context": "https://schema.org",
    "@type": input.type ?? "WebPage",
    "@id": `${url}#webpage`,
    name: input.name,
    description: input.description,
    url,
    inLanguage: siteConfig.language,
    isPartOf: { "@id": websiteSchemaId },
    publisher: { "@id": publisherSchemaId },
    primaryImageOfPage: { "@type": "ImageObject", url: absoluteUrl(siteConfig.socialImage), width: siteConfig.socialImageWidth, height: siteConfig.socialImageHeight },
    datePublished: input.publishedAt ?? undefined,
    dateModified: input.updatedAt ?? undefined,
  };
}

export function buildBreadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: absoluteUrl(item.path) })),
  };
}

export function buildItemList(items: { name: string; path: string }[]) {
  return {
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, url: absoluteUrl(item.path) })),
  };
}
