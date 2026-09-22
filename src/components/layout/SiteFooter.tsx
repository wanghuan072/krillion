import Link from "next/link";
import { legalNavigation, primaryNavigation } from "@/src/config/navigation";
import { siteConfig } from "@/src/config/site";
import styles from "@/src/style/site.module.css";

export function SiteFooter() {
  return <footer className={styles.footer}>
    <div className={`${styles.container} ${styles.footerGrid}`}>
      <div><strong>{siteConfig.name}</strong><p>Play the daily open-answer dive, learn its interface, and continue with carefully selected word and trivia games.</p></div>
      <div><h2>Explore</h2>{primaryNavigation.map((item) => <Link key={item.path} href={item.path}>{item.label}</Link>)}</div>
      <div><h2>Legal</h2>{legalNavigation.map((item) => <Link key={item.path} href={item.path} rel="noopener noreferrer nofollow">{item.label}</Link>)}</div>
    </div>
    <div className={`${styles.container} ${styles.copyright}`}>Copyright © {new Date().getFullYear()} {siteConfig.name}. All rights reserved</div>
  </footer>;
}
