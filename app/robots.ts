import type { MetadataRoute } from "next";
import { siteConfig } from "@/src/config/site";
export const dynamic = "force-static";
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: "*", allow: "/", disallow: ["/preview-internal/"] }, sitemap: `${siteConfig.origin}/sitemap.xml` }; }
