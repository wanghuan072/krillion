"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { primaryNavigation } from "@/src/config/navigation";
import { siteConfig } from "@/src/config/site";
import styles from "@/src/style/site.module.css";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const update = () => document.documentElement.style.setProperty("--header-height", `${header.getBoundingClientRect().height}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) { setOpen(false); buttonRef.current?.focus(); }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return <header className={styles.header} ref={headerRef}>
    <div className={`${styles.container} ${styles.headerInner}`}>
      <Link href="/" prefetch={false} className={styles.logoLink} aria-label={`${siteConfig.name} home`}>
        <Image src={siteConfig.logo} width={siteConfig.logoWidth} height={siteConfig.logoHeight} alt="" aria-hidden="true" loading="eager" fetchPriority="high" className={styles.logo} />
        <span className={styles.brandName}>{siteConfig.name}</span>
      </Link>
      <nav aria-label="Primary navigation" className={styles.desktopNav}>
        {primaryNavigation.map((item) => <Link key={item.path} href={item.path} prefetch={false} aria-current={pathname === item.path ? "page" : undefined}><span className={styles.navLabel}>{item.label}</span></Link>)}
      </nav>
      <button ref={buttonRef} className={styles.menuButton} type="button" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen((value) => !value)}>
        <span aria-hidden="true" className={styles.menuIcon}><i /><i /><i /></span><span className={styles.srOnly}>Menu</span>
      </button>
      <nav id="mobile-navigation" aria-label="Mobile navigation" className={`${styles.mobileNav} ${open ? styles.mobileNavOpen : ""}`}>
        {primaryNavigation.map((item) => <Link key={item.path} href={item.path} prefetch={false} aria-current={pathname === item.path ? "page" : undefined} onClick={() => setOpen(false)}><span className={styles.navLabel}>{item.label}</span></Link>)}
      </nav>
    </div>
  </header>;
}
