"use client";

import { useEffect, useRef } from "react";
import styles from "@/src/style/site.module.css";

type BannerConfig = {
  key: string;
  format: "iframe";
  height: number;
  width: number;
  params: Record<string, never>;
};

const DESKTOP_BANNER: BannerConfig = {
  key: "5f06c8b6623bb3bcafe07a095f8ae003",
  format: "iframe",
  height: 90,
  width: 728,
  params: {},
};

const MOBILE_BANNER: BannerConfig = {
  key: "20d405695c52532554e514dabbd553c4",
  format: "iframe",
  height: 250,
  width: 300,
  params: {},
};

let bannerLoadQueue = Promise.resolve();

function insertBannerCode(mount: HTMLDivElement, config: BannerConfig) {
  return new Promise<void>((resolve) => {
    if (!mount.isConnected) {
      resolve();
      return;
    }

    // 按联盟后台提供的标准顺序写入配置和脚本，让请求保留本站来源。
    const configScript = document.createElement("script");
    configScript.text = `window.atOptions = ${JSON.stringify(config)};`;

    const invokeScript = document.createElement("script");
    invokeScript.src = `https://www.highrevenueformat.com/${config.key}/invoke.js`;
    invokeScript.async = false;

    let finished = false;
    const finish = (state: "loaded" | "failed") => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timeout);
      mount.dataset.state = state;
      resolve();
    };
    const timeout = window.setTimeout(() => finish("failed"), 15000);
    invokeScript.addEventListener("load", () => finish("loaded"), { once: true });
    invokeScript.addEventListener("error", () => finish("failed"), { once: true });

    mount.append(configScript, invokeScript);
  });
}

function enqueueBanner(mount: HTMLDivElement, config: BannerConfig) {
  bannerLoadQueue = bannerLoadQueue
    .catch(() => undefined)
    .then(() => insertBannerCode(mount, config));
}

export function AffiliateAd() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 广告接近可视区域时再加载，避免多个第三方脚本阻塞首屏。
    const loadAd = () => {
      if (mount.dataset.loaded === "true") return;
      mount.dataset.loaded = "true";

      // 移动端固定使用 300×250；PC 端优先使用 728×90，窄内容栏自动降级。
      const mobile = window.matchMedia("(max-width: 768px)").matches;
      const config = mobile || mount.clientWidth < 728 ? MOBILE_BANNER : DESKTOP_BANNER;
      mount.dataset.format = `${config.width}x${config.height}`;
      enqueueBanner(mount, config);
    };

    if (!("IntersectionObserver" in window)) {
      loadAd();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      loadAd();
    }, { rootMargin: "500px 0px" });
    observer.observe(mount);
    return () => observer.disconnect();
  }, []);

  return <aside className={`${styles.adSlot} ${styles.adBanner}`} data-ad-slot="responsive-banner" aria-label="Advertisement">
    <div ref={mountRef} className={styles.adMount}/>
  </aside>;
}
