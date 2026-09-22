import type { Metadata } from "next";
import { GuidesList } from "@/src/components/guides/GuideViews";
import { getAllPublishedGuides } from "@/src/lib/data/guide-loader";
import { buildMetadata } from "@/src/seo/metadata";
import styles from "@/src/style/site.module.css";
import tdk from "@/seo/tdk.js";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { absoluteUrl, guidePath } from "@/src/lib/url-policy";
import { Breadcrumbs } from "@/src/components/layout/Breadcrumbs";

export const metadata: Metadata = buildMetadata({ ...tdk["guides-index"], path: "/guides" });
export default function GuidesPage() {
  const guides = getAllPublishedGuides();
  const schema = [{ "@context": "https://schema.org", "@type": "CollectionPage", name: tdk["guides-index"].title, description: tdk["guides-index"].description, url: absoluteUrl("/guides"), mainEntity: { "@type": "ItemList", itemListElement: guides.map((guide, index) => ({ "@type": "ListItem", position: index + 1, name: guide.title, url: absoluteUrl(guidePath(guide.slug)) })) } }, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") }, { "@type": "ListItem", position: 2, name: "Guides", item: absoluteUrl("/guides") }] }];
  return <main id="main-content" className={`${styles.container} ${styles.indexPage}`}><JsonLd data={schema}/><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Guides" }]}/><header className={styles.guidesIndexHeader}><span className={styles.eyebrow}>Play with confidence</span><h1 className={styles.innerH1}>Krillion Guides</h1><p>Choose the focused guide that matches your current Daily Dive goal: learn the complete run, improve answer depth, or solve a technical problem.</p></header><GuidesList guides={guides}/></main>;
}
