import type { Metadata } from "next";
import { GuidesList } from "@/src/components/guides/GuideViews";
import { getAllPublishedGuides } from "@/src/lib/data/guide-loader";
import { buildMetadata } from "@/src/seo/metadata";
import styles from "@/src/style/site.module.css";
import tdk from "@/seo/tdk.js";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { guidePath } from "@/src/lib/url-policy";
import { Breadcrumbs } from "@/src/components/layout/Breadcrumbs";
import { buildBreadcrumbSchema, buildItemList, buildWebPageSchema } from "@/src/seo/structured-data";

export const metadata: Metadata = buildMetadata({ ...tdk["guides-index"], path: "/guides" });
export default function GuidesPage() {
  const guides = getAllPublishedGuides();
  const schema = [
    { ...buildWebPageSchema({ name: tdk["guides-index"].title, description: tdk["guides-index"].description, path: "/guides", type: "CollectionPage" }), mainEntity: buildItemList(guides.map((guide) => ({ name: guide.title, path: guidePath(guide.slug) }))) },
    buildBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Guides", path: "/guides" }]),
  ];
  return <main id="main-content" className={`${styles.container} ${styles.indexPage}`}><JsonLd data={schema}/><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Guides" }]}/><header className={styles.guidesIndexHeader}><span className={styles.eyebrow}>Play with confidence</span><h1 className={styles.innerH1}>Krillion Guides</h1><p>Choose the focused guide that matches your current Daily Dive goal: learn the complete run, improve answer depth, or solve a technical problem.</p></header><GuidesList guides={guides}/></main>;
}
