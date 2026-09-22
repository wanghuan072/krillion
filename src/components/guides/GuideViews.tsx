import Image from "next/image";
import Link from "next/link";
import { ContentBlocks } from "@/src/components/content/ContentBlocks";
import { getRelatedGuides } from "@/src/lib/data/guide-loader";
import { guidePath } from "@/src/lib/url-policy";
import type { Guide } from "@/src/types/guide";
import styles from "@/src/style/site.module.css";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { Breadcrumbs } from "@/src/components/layout/Breadcrumbs";
import { absoluteUrl } from "@/src/lib/url-policy";

function formatGuideDate(value: string | null) {
  if (!value) return "Date pending";
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export function GuidesList({ guides, preview = false }: { guides: Guide[]; preview?: boolean }) {
  return <div className={styles.guideList}>{guides.map((guide) => <Link href={preview ? `/preview-internal/guide/${guide.slug}` : guidePath(guide.slug)} prefetch={false} className={styles.guideCard} key={guide.id}>
    <div className={styles.guideMedia}>{guide.cover.src ? <Image src={guide.cover.src} alt={guide.cover.alt} width={guide.cover.width ?? 1280} height={guide.cover.height ?? 720} sizes="(max-width: 768px) calc(100vw - 32px), (max-width: 1024px) 31vw, 430px"/> : preview ? <div className={styles.previewCover}><span>{guide.title}</span><small>Draft Guide media</small></div> : null}<span>Gameplay guide</span></div>
    <div className={styles.guideCardCopy}><div className={styles.guideCardMeta}><time dateTime={guide.updatedAt ?? undefined}>Updated {formatGuideDate(guide.updatedAt)}</time><span>{guide.tags[0]}</span></div><h2>{guide.title}</h2><p>{guide.summary || "This guide is being completed from verified play observations."}</p><strong>Read guide <span aria-hidden="true">→</span></strong></div>
  </Link>)}</div>;
}

export function GuideDetail({ guide, preview = false }: { guide: Guide; preview?: boolean }) {
  const related = getRelatedGuides(guide, { includeDraft: preview });
  const guidesHref = preview ? "/preview-internal/guides" : "/guides";
  return <main id="main-content" className={`${styles.container} ${styles.readingPage}`}><JsonLd data={[{"@context":"https://schema.org","@type":"Article",headline:guide.title,description:guide.seo.description,mainEntityOfPage:absoluteUrl(guidePath(guide.slug)),image:absoluteUrl(guide.cover.src),author:{"@type":"Person",name:guide.author},datePublished:guide.publishedAt,dateModified:guide.updatedAt},{"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"Home",item:absoluteUrl("/")},{"@type":"ListItem",position:2,name:"Guides",item:absoluteUrl("/guides")},{"@type":"ListItem",position:3,name:guide.title,item:absoluteUrl(guidePath(guide.slug))}]}]} />
    <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Guides", href: guidesHref }, { label: guide.title }]} />
    <header className={styles.guideHeader}><span className={styles.eyebrow}>Krillion field guide</span><h1 className={styles.innerH1}>{guide.title}</h1>{guide.summary && <p className={styles.lede}>{guide.summary}</p>}<div className={styles.guideByline}><span><small>Written by</small><strong>{guide.author}</strong></span><span><small>Updated</small><time dateTime={guide.updatedAt ?? undefined}>{formatGuideDate(guide.updatedAt)}</time></span></div><ul className={styles.guideTags} aria-label="Guide tags">{guide.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul></header>
    <div className={styles.guideDetailGrid}>
      <div className={styles.guideArticleColumn}>{guide.cover.src && <Image src={guide.cover.src} alt={guide.cover.alt} width={guide.cover.width ?? 1280} height={guide.cover.height ?? 720} className={styles.guideCover} sizes="(max-width: 768px) calc(100vw - 32px), (max-width: 1024px) calc(100vw - 360px), 980px" loading="eager" fetchPriority="high"/>}<article className={styles.guideArticle}>{guide.sections.map((section) => <section key={section.id} id={section.id}><h2>{section.title}</h2><ContentBlocks blocks={section.blocks}/></section>)}</article>
        {related.length > 0 && <section className={styles.relatedGuides}><span className={styles.eyebrow}>Keep exploring</span><h2>Continue with another guide</h2><GuidesList guides={related} preview={preview}/></section>}
      </div>
      <aside className={styles.guideSidebar}><nav className={styles.guideToc} aria-label="On this page"><span>In this guide</span><ol>{guide.sections.map((section, index) => <li key={section.id}><a href={`#${section.id}`}><small>{String(index + 1).padStart(2, "0")}</small>{section.title}</a></li>)}</ol></nav></aside>
    </div>
  </main>;
}
