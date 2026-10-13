"use client";

import { useEffect, useRef } from "react";
import styles from "@/src/style/site.module.css";

function bannerDocument(compact: boolean) {
  const config = compact
    ? { key: "20d405695c52532554e514dabbd553c4", width: 300, height: 250 }
    : { key: "5f06c8b6623bb3bcafe07a095f8ae003", width: 728, height: 90 };

  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;overflow:hidden;background:transparent}*{box-sizing:border-box}</style></head><body>
<script>
  atOptions = {
    'key' : '${config.key}',
    'format' : 'iframe',
    'height' : ${config.height},
    'width' : ${config.width},
    'params' : {}
  };
<\/script>
<script src="https://www.highrevenueformat.com/${config.key}/invoke.js"><\/script>
</body></html>`;
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
      const compact = mobile || mount.clientWidth < 728;
      mount.dataset.format = compact ? "300x250" : "728x90";
      const frame = document.createElement("iframe");
      frame.title = "Advertisement";
      frame.loading = "lazy";
      frame.referrerPolicy = "strict-origin-when-cross-origin";
      frame.setAttribute("sandbox", "allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox");
      frame.width = compact ? "300" : "728";
      frame.height = compact ? "250" : "90";
      frame.srcdoc = bannerDocument(compact);
      mount.append(frame);
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
